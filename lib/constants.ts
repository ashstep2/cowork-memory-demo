// Application Constants

// ============================================================================
// API Configuration
// ============================================================================

export const API = {
  CHAT_MODEL: 'claude-opus-4-20250514',
  EXTRACT_MODEL: 'claude-opus-4-20250514',
  MAX_CHAT_TOKENS: 2048,
  MAX_EXTRACT_TOKENS: 4096, // Increased to allow complete extraction JSON with multiple learnings
} as const;

// ============================================================================
// Storage Keys
// ============================================================================

export const STORAGE_KEYS = {
  MEMORY: 'cowork_memory',
  SESSION: 'cowork_session',
  CHAT_HISTORY: 'cowork_chat_history',
} as const;

// ============================================================================
// Memory System
// ============================================================================

export const MEMORY = {
  HIGHLIGHT_DURATION_MS: 3000,
  CONFIDENCE_INCREMENT: 0.1,
  MAX_CONFIDENCE: 1.0,
  MIN_CONFIDENCE: 0.0,
  DEFAULT_CONFIDENCE: 0.5,
} as const;

// ============================================================================
// UI Timing
// ============================================================================

export const UI = {
  LOADING_MESSAGE_INTERVAL_SECONDS: 3,
  SCROLL_DELAY_MS: 100,
  ANIMATION_DURATION_MS: 300,
} as const;

// ============================================================================
// Validation
// ============================================================================

export const VALIDATION = {
  MIN_MESSAGE_LENGTH: 1,
  MIN_MESSAGES_FOR_EXTRACTION: 2,
} as const;
