// Memory System Types for Cowork Memory Demo

export interface InvestmentThesis {
  stages?: string[];
  sectors?: string[];
  checkSize?: {
    min: number;
    max: number;
  };
  geography?: string[];
  priorities?: string[];
  explicit: boolean;
  confidence: number;
}

export interface RedFlag {
  id: string;
  pattern: string;
  threshold?: number | string;
  description: string;
  learnedFrom?: string;
  explicit: boolean;
  confidence: number;
  timesApplied: number;
}

export interface MemoPreferences {
  structure?: string[];
  tone: 'direct' | 'balanced' | 'cautious';
  hedgeLanguage: boolean;
  maxLengthPages?: number;
  confidence: number;
}

export interface DealOutcome {
  company: string;
  outcome: 'pass' | 'invest' | 'watching';
  reasons?: string[];
  date: string;
  keyMetrics?: {
    arr?: number;
    burn?: number;
    runway?: number;
    concentration?: number;
  };
}

export interface ApprovalPattern {
  action: string;
  autoApprove: boolean;
  confidence: number;
  approvals: number;
  rejections: number;
}

export interface Memory {
  version: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  
  investmentThesis: InvestmentThesis | null;
  redFlags: RedFlag[];
  memoPreferences: MemoPreferences | null;
  dealHistory: DealOutcome[];
  approvalPatterns: ApprovalPattern[];
  
  // Raw context for injection
  rawContext: string[];
}

export const DEFAULT_MEMORY: Memory = {
  version: '1.0',
  userId: 'demo_user',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  
  investmentThesis: null,
  redFlags: [],
  memoPreferences: null,
  dealHistory: [],
  approvalPatterns: [],
  rawContext: [],
};

// Chat and Session Types

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  memoryUpdates?: MemoryUpdate[];
}

export interface MemoryUpdate {
  type: 'thesis' | 'redFlag' | 'preference' | 'dealHistory' | 'context';
  action: 'add' | 'update' | 'remove';
  description: string;
  explicit: boolean;
  data: unknown;
}

export interface Session {
  id: string;
  number: number;
  startedAt: string;
  messages: Message[];
  activeDeal: string | null;
}

// Deal Types

export interface TeamMember {
  name: string;
  role: string;
  background: string;
}

export interface DealMetrics {
  arr: number;
  mrr: number;
  growthMoM: number;
  burnMonthly: number;
  runwayMonths: number;
  customers: number;
  topCustomerPct: number;
  grossMargin: number;
  nrr: number;
}

export interface DealFunding {
  raising: number;
  preMoney: number;
  lead: string;
  existingInvestors: string[];
}

export interface Deal {
  id: string;
  name: string;
  tagline: string;
  stage: string;
  sector: string;
  metrics: DealMetrics;
  funding: DealFunding;
  team: {
    ceo: TeamMember;
    cto: TeamMember;
    employees: number;
  };
  deckSummary: string;
  financialsDetail: string;
  _isDemo?: boolean; // Mark as demo file vs real company
}

// Guided Tour Types

export interface TourStep {
  id: string;
  title: string;
  wowMoment: number;
  description: string;
  setupInstructions?: string;
  suggestedPrompt: string;
  whatToNotice: string[];
  expectedMemoryChanges?: string[];
}
