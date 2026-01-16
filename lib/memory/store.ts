import { MEMORY, STORAGE_KEYS } from '../constants';
import { Memory, DEFAULT_MEMORY, RedFlag, DealOutcome, MemoryUpdate } from './types';

// Storage quota limits (in bytes)
const MAX_STORAGE_SIZE = 4_000_000; // ~4MB safe limit (localStorage is typically 5-10MB)
const BACKUP_KEY = `${STORAGE_KEYS.MEMORY}_backup`;

// Memory Store Operations

export function getMemory(): Memory {
  if (typeof window === 'undefined') return DEFAULT_MEMORY;

  const stored = localStorage.getItem(STORAGE_KEYS.MEMORY);
  if (!stored) return DEFAULT_MEMORY;

  try {
    return JSON.parse(stored) as Memory;
  } catch {
    return DEFAULT_MEMORY;
  }
}

export function saveMemory(memory: Memory): { success: boolean; error?: string } {
  if (typeof window === 'undefined') return { success: true };

  try {
    // Create immutable copy to avoid state mutation
    const updated = {
      ...memory,
      updatedAt: new Date().toISOString(),
    };

    const jsonStr = JSON.stringify(updated);

    // Check size before saving
    if (jsonStr.length > MAX_STORAGE_SIZE) {
      console.warn('Memory data exceeds safe storage limit. Consider archiving old entries.');

      // Try to auto-cleanup: remove oldest deal history entries
      if (updated.dealHistory.length > 10) {
        updated.dealHistory = updated.dealHistory.slice(-10); // Keep only last 10
        const cleanedJsonStr = JSON.stringify(updated);

        if (cleanedJsonStr.length <= MAX_STORAGE_SIZE) {
          localStorage.setItem(STORAGE_KEYS.MEMORY, cleanedJsonStr);
          return {
            success: true,
            error: 'Storage limit reached. Automatically removed old deal history to make space.'
          };
        }
      }

      return {
        success: false,
        error: 'Storage limit exceeded. Please export and clear old data.'
      };
    }

    // Backup current state before overwriting
    try {
      const current = localStorage.getItem(STORAGE_KEYS.MEMORY);
      if (current) {
        localStorage.setItem(BACKUP_KEY, current);
      }
    } catch {
      // Backup failed, but continue with save
    }

    // Save new state
    localStorage.setItem(STORAGE_KEYS.MEMORY, jsonStr);
    return { success: true };

  } catch (error) {
    // Handle QuotaExceededError
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      console.error('localStorage quota exceeded:', error);

      // Try to restore from backup
      try {
        const backup = localStorage.getItem(BACKUP_KEY);
        if (backup) {
          localStorage.setItem(STORAGE_KEYS.MEMORY, backup);
        }
      } catch {
        // Restoration failed
      }

      return {
        success: false,
        error: 'Storage quota exceeded. Please clear browser data or export your memory.'
      };
    }

    console.error('Failed to save memory:', error);
    return {
      success: false,
      error: 'Failed to save memory to storage.'
    };
  }
}

export function resetMemory(): Memory {
  const fresh = {
    ...DEFAULT_MEMORY,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  saveMemory(fresh);
  return fresh;
}

// Memory Update Operations

export function addRedFlag(flag: Omit<RedFlag, 'id' | 'timesApplied'>): MemoryUpdate {
  const memory = getMemory();
  
  // Check if similar flag exists
  const existing = memory.redFlags.find(f => f.pattern === flag.pattern);
  if (existing) {
    existing.confidence = Math.min(MEMORY.MAX_CONFIDENCE, existing.confidence + MEMORY.CONFIDENCE_INCREMENT);
    existing.timesApplied++;
    saveMemory(memory);
    return {
      type: 'redFlag',
      action: 'update',
      description: `Reinforced: ${flag.description}`,
      explicit: flag.explicit,
      data: existing,
    };
  }
  
  const newFlag: RedFlag = {
    ...flag,
    id: `rf_${Date.now()}`,
    timesApplied: 1,
  };
  
  memory.redFlags.push(newFlag);
  saveMemory(memory);
  
  return {
    type: 'redFlag',
    action: 'add',
    description: `Learned: ${flag.description}`,
    explicit: flag.explicit,
    data: newFlag,
  };
}

export function removeRedFlag(id: string): MemoryUpdate | null {
  const memory = getMemory();
  const index = memory.redFlags.findIndex(f => f.id === id);
  
  if (index === -1) return null;
  
  const removed = memory.redFlags.splice(index, 1)[0];
  saveMemory(memory);
  
  return {
    type: 'redFlag',
    action: 'remove',
    description: `Removed: ${removed.description}`,
    explicit: true,
    data: removed,
  };
}

export function updateRedFlag(id: string, updates: Partial<RedFlag>): MemoryUpdate | null {
  const memory = getMemory();
  const flag = memory.redFlags.find(f => f.id === id);
  
  if (!flag) return null;
  
  Object.assign(flag, updates);
  saveMemory(memory);
  
  return {
    type: 'redFlag',
    action: 'update',
    description: `Updated: ${flag.description}`,
    explicit: true,
    data: flag,
  };
}

export function addDealOutcome(outcome: DealOutcome): MemoryUpdate {
  const memory = getMemory();
  
  // Update if exists, otherwise add
  const existingIndex = memory.dealHistory.findIndex(d => d.company === outcome.company);
  if (existingIndex >= 0) {
    memory.dealHistory[existingIndex] = outcome;
  } else {
    memory.dealHistory.push(outcome);
  }
  
  saveMemory(memory);
  
  return {
    type: 'dealHistory',
    action: existingIndex >= 0 ? 'update' : 'add',
    description: `${outcome.company}: ${outcome.outcome}`,
    explicit: true,
    data: outcome,
  };
}

export function setInvestmentThesis(thesis: Memory['investmentThesis']): MemoryUpdate {
  const memory = getMemory();
  memory.investmentThesis = thesis;
  saveMemory(memory);
  
  return {
    type: 'thesis',
    action: memory.investmentThesis ? 'update' : 'add',
    description: 'Investment thesis updated',
    explicit: true,
    data: thesis,
  };
}

export function setMemoPreferences(prefs: Memory['memoPreferences']): MemoryUpdate {
  const memory = getMemory();
  memory.memoPreferences = prefs;
  saveMemory(memory);
  
  return {
    type: 'preference',
    action: memory.memoPreferences ? 'update' : 'add',
    description: 'Memo preferences updated',
    explicit: true,
    data: prefs,
  };
}

export function addRawContext(context: string): MemoryUpdate {
  const memory = getMemory();
  
  // Avoid duplicates
  if (!memory.rawContext.includes(context)) {
    memory.rawContext.push(context);
    saveMemory(memory);
  }
  
  return {
    type: 'context',
    action: 'add',
    description: context.substring(0, 50) + '...',
    explicit: true,
    data: context,
  };
}

// Session Counter

export function getSessionCount(): number {
  if (typeof window === 'undefined') return 1;
  const stored = localStorage.getItem(STORAGE_KEYS.SESSION);
  return stored ? parseInt(stored, 10) : 1;
}

export function incrementSession(): number {
  const current = getSessionCount();
  const next = current + 1;
  localStorage.setItem(STORAGE_KEYS.SESSION, next.toString());
  return next;
}

export function resetSessionCount(): void {
  localStorage.setItem(STORAGE_KEYS.SESSION, '1');
}

// Full Reset

export function fullReset(): void {
  resetMemory();
  resetSessionCount();
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEYS.CHAT_HISTORY);
  }
}
