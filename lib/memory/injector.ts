import { Memory } from './types';
import { formatCurrency, formatPercent } from '../utils/formatters';

/**
 * Formats the memory into a context string that gets injected into Claude's prompt.
 * This is the "secret sauce" - how we make Claude aware of learned preferences.
 */
export function injectMemoryContext(memory: Memory): string {
  const sections: string[] = [];
  
  // Investment Thesis
  if (memory.investmentThesis) {
    const thesis = memory.investmentThesis;
    sections.push(`<user_investment_thesis>
The user focuses on:
- Stages: ${thesis.stages?.join(', ') || 'Not specified'}
- Sectors: ${thesis.sectors?.join(', ') || 'Not specified'}
- Check sizes: ${formatCurrency(thesis.checkSize?.min || 0)} - ${formatCurrency(thesis.checkSize?.max || 0)}
- Geography: ${thesis.geography?.join(', ') || 'Not specified'}
- Key priorities: ${thesis.priorities?.join(', ') || 'Not specified'}
</user_investment_thesis>`);
  }
  
  // Red Flags (Learned Patterns)
  if (memory.redFlags.length > 0) {
    const flagDescriptions = memory.redFlags.map(flag => {
      const confidence = flag.explicit ? 'explicit rule' : `inferred, ${Math.round(flag.confidence * 100)}% confidence`;
      return `- ${flag.description} (${confidence})`;
    }).join('\n');
    
    sections.push(`<user_red_flags>
The user has established these investment red flags based on past decisions:
${flagDescriptions}

When analyzing deals, proactively check for these patterns and flag them.
</user_red_flags>`);
  }
  
  // Memo Preferences
  if (memory.memoPreferences) {
    const prefs = memory.memoPreferences;
    const toneDesc = {
      'direct': 'Be direct and give clear recommendations without hedging language like "potentially" or "could be interesting"',
      'balanced': 'Provide balanced analysis with clear pros and cons',
      'cautious': 'Be thorough and highlight all potential concerns',
    }[prefs.tone] || 'Provide balanced analysis';

    sections.push(`<user_memo_preferences>
When writing investment memos or analysis:
- Structure: ${prefs.structure?.join(' → ') || 'Flexible structure'}
- Tone: ${toneDesc}
- Length: Keep to ${prefs.maxLengthPages || 2} page(s) or less
- ${prefs.hedgeLanguage ? 'Hedge language is acceptable' : 'Avoid hedge language - be decisive'}
</user_memo_preferences>`);
  }
  
  // Deal History (Context for Pattern Matching)
  if (memory.dealHistory.length > 0) {
    const historyDescriptions = memory.dealHistory.map(deal => {
      const metricsStr = Object.entries(deal.keyMetrics || {})
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => {
          if (k === 'arr' || k === 'burn') return `${k}: ${formatCurrency(v as number)}`;
          if (k === 'concentration') return `concentration: ${formatPercent(v as number)}`;
          return `${k}: ${v}`;
        })
        .join(', ');

      return `- ${deal.company}: ${deal.outcome.toUpperCase()} - reasons: ${deal.reasons?.join(', ') || 'Not specified'}${metricsStr ? ` (${metricsStr})` : ''}`;
    }).join('\n');
    
    sections.push(`<user_deal_history>
Recent deal decisions by this user:
${historyDescriptions}

Use this history to identify patterns and make relevant comparisons when analyzing new deals.
</user_deal_history>`);
  }
  
  // Raw Context
  if (memory.rawContext.length > 0) {
    sections.push(`<user_context>
Additional context about this user:
${memory.rawContext.map(c => `- ${c}`).join('\n')}
</user_context>`);
  }
  
  if (sections.length === 0) {
    return '';
  }
  
  return `<memory_context>
You have memory of this user from previous sessions. Use this context to personalize your responses and make relevant connections.

${sections.join('\n\n')}

IMPORTANT: Apply this knowledge naturally. Don't explicitly mention "based on your memory" or "according to my records." Instead, reference past decisions and patterns as if you naturally remember them, like a colleague would.
</memory_context>`;
}

/**
 * Creates a summary of what memory will be applied (for the UI)
 */
export function getMemorySummary(memory: Memory): {
  hasThesis: boolean;
  redFlagCount: number;
  hasMemoPrefs: boolean;
  dealHistoryCount: number;
  contextItems: number;
  totalItems: number;
} {
  return {
    hasThesis: memory.investmentThesis !== null,
    redFlagCount: memory.redFlags.length,
    hasMemoPrefs: memory.memoPreferences !== null,
    dealHistoryCount: memory.dealHistory.length,
    contextItems: memory.rawContext.length,
    totalItems: 
      (memory.investmentThesis ? 1 : 0) +
      memory.redFlags.length +
      (memory.memoPreferences ? 1 : 0) +
      memory.dealHistory.length +
      memory.rawContext.length,
  };
}
