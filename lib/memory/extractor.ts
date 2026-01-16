import { Message, MemoryUpdate, Memory } from './types';
import { getMemory, saveMemory, addRedFlag, addDealOutcome, setInvestmentThesis, setMemoPreferences } from './store';

/**
 * Analyzes a conversation to extract memories.
 * This is called by the API route after Claude responds.
 * 
 * Returns a prompt for Claude to analyze the conversation and extract learnings.
 */
export function createExtractionPrompt(messages: Message[], currentMemory: Memory): string {
  const conversationText = messages
    .map(m => `${m.role.toUpperCase()}: ${m.content}`)
    .join('\n\n');
  
  const existingContext = currentMemory.investmentThesis 
    ? `User already has thesis: ${JSON.stringify(currentMemory.investmentThesis)}`
    : 'No existing thesis.';
  
  const existingFlags = currentMemory.redFlags.length > 0
    ? `Existing red flags: ${currentMemory.redFlags.map(f => f.description).join(', ')}`
    : 'No existing red flags.';

  return `Analyze this VC/investor conversation and extract any learnable preferences or patterns.

<conversation>
${conversationText}
</conversation>

<existing_memory>
${existingContext}
${existingFlags}
</existing_memory>

Extract ONLY things that should be remembered for future sessions. Look for:

1. INVESTMENT THESIS (explicit statements about what they invest in):
   - Stages they focus on
   - Sectors/verticals
   - Check sizes
   - Geographic focus
   - Key priorities (e.g., "I care about unit economics")

2. RED FLAGS (patterns they don't like, either explicit or inferred from rejections):
   - Explicit: "I don't like companies with >50% customer concentration"
   - Implicit: If they pass on a deal citing a specific metric, that's likely a red flag
   - Note: Mark as "explicit" only if they stated it directly

3. MEMO PREFERENCES (how they like analysis formatted):
   - Structure preferences
   - Tone (direct vs. cautious)
   - Length preferences

4. DEAL OUTCOMES (decisions made in this conversation):
   - Company name
   - Outcome (pass/invest/watching)
   - Reasons for the decision
   - Key metrics that influenced the decision

Respond in this exact JSON format (use null for sections with no new learnings):
{
  "thesis": {
    "stages": ["Series A", "Series B"],
    "sectors": ["AI", "Manufacturing tech"],
    "checkSize": { "min": 5000000, "max": 15000000 },
    "geography": ["US"],
    "priorities": ["unit economics", "founder-market fit"]
  } | null,
  
  "redFlags": [
    {
      "pattern": "customer_concentration",
      "threshold": "35%",
      "description": "Customer concentration >35%",
      "explicit": false,
      "confidence": 0.7,
      "reasoning": "User said 34% was 'borderline', implying threshold around 35%"
    }
  ] | [],
  
  "memoPreferences": {
    "structure": ["Summary", "Thesis Fit", "Risks", "Recommendation"],
    "tone": "direct",
    "hedgeLanguage": false,
    "maxLengthPages": 2
  } | null,
  
  "dealOutcome": {
    "company": "TechCo",
    "outcome": "pass",
    "reasons": ["burn rate", "customer concentration"],
    "keyMetrics": {
      "arr": 3200000,
      "burn": 480000,
      "concentration": 0.34
    }
  } | null,
  
  "rawContext": ["Any other important context to remember"] | []
}

Be conservative - only extract things you're confident about. Don't make things up.`;
}

/**
 * Parses Claude's extraction response and applies it to memory
 */
/**
 * Helper: Clean JSON string by removing markdown code blocks
 */
function cleanJsonString(jsonStr: string): string {
  if (jsonStr.includes('```')) {
    return jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '');
  }
  return jsonStr;
}

/**
 * Helper: Apply thesis update to memory
 */
function applyThesisUpdate(extraction: any, memory: Memory, updates: MemoryUpdate[]): void {
  if (extraction.thesis) {
    memory.investmentThesis = {
      ...extraction.thesis,
      explicit: true,
      confidence: 1.0,
    };
    updates.push({
      type: 'thesis',
      action: 'add',
      description: 'Investment thesis captured',
      explicit: true,
      data: memory.investmentThesis,
    });
  }
}

/**
 * Helper: Apply red flags updates to memory
 */
function applyRedFlagsUpdate(extraction: any, updates: MemoryUpdate[]): void {
  if (extraction.redFlags && Array.isArray(extraction.redFlags)) {
    for (const flag of extraction.redFlags) {
      const update = addRedFlag({
        pattern: flag.pattern,
        threshold: flag.threshold,
        description: flag.description,
        learnedFrom: flag.reasoning,
        explicit: flag.explicit,
        confidence: flag.confidence || 0.7,
      });
      updates.push(update);
    }
  }
}

/**
 * Helper: Apply memo preferences update to memory
 */
function applyMemoPreferencesUpdate(extraction: any, memory: Memory, updates: MemoryUpdate[]): void {
  if (extraction.memoPreferences) {
    memory.memoPreferences = {
      ...extraction.memoPreferences,
      confidence: 0.9,
    };
    updates.push({
      type: 'preference',
      action: 'add',
      description: 'Memo preferences learned',
      explicit: false,
      data: memory.memoPreferences,
    });
  }
}

/**
 * Helper: Apply deal outcome update to memory
 */
function applyDealOutcomeUpdate(extraction: any, memory: Memory, updates: MemoryUpdate[]): void {
  if (extraction.dealOutcome) {
    const outcome = extraction.dealOutcome;
    memory.dealHistory.push({
      company: outcome.company,
      outcome: outcome.outcome,
      reasons: outcome.reasons,
      date: new Date().toISOString(),
      keyMetrics: outcome.keyMetrics || {},
    });
    updates.push({
      type: 'dealHistory',
      action: 'add',
      description: `${outcome.company}: ${outcome.outcome}`,
      explicit: true,
      data: outcome,
    });
  }
}

/**
 * Helper: Apply raw context updates to memory
 */
function applyRawContextUpdate(extraction: any, memory: Memory, updates: MemoryUpdate[]): void {
  if (extraction.rawContext && Array.isArray(extraction.rawContext)) {
    for (const ctx of extraction.rawContext) {
      if (ctx && !memory.rawContext.includes(ctx)) {
        memory.rawContext.push(ctx);
        updates.push({
          type: 'context',
          action: 'add',
          description: ctx.substring(0, 50),
          explicit: true,
          data: ctx,
        });
      }
    }
  }
}

export function applyExtraction(extractionJson: string): MemoryUpdate[] {
  const updates: MemoryUpdate[] = [];

  try {
    const jsonStr = cleanJsonString(extractionJson);
    const extraction = JSON.parse(jsonStr.trim());
    const memory = getMemory();

    applyThesisUpdate(extraction, memory, updates);
    applyRedFlagsUpdate(extraction, updates);
    applyMemoPreferencesUpdate(extraction, memory, updates);
    applyDealOutcomeUpdate(extraction, memory, updates);
    applyRawContextUpdate(extraction, memory, updates);

    saveMemory(memory);

  } catch (error) {
    console.error('Failed to parse extraction:', error);
    console.error('Raw response:', extractionJson);
  }

  return updates;
}

/**
 * Quick extraction for simple patterns (used for real-time UI updates)
 * This does basic regex matching without calling Claude
 */
export function quickExtract(userMessage: string, assistantMessage: string): MemoryUpdate[] {
  const updates: MemoryUpdate[] = [];
  const combined = `${userMessage} ${assistantMessage}`.toLowerCase();
  
  // Detect pass decisions
  const passPatterns = [
    /pass on this/i,
    /i('m| am) passing/i,
    /let's pass/i,
    /not a fit/i,
    /pass\. /i,
  ];
  
  // Detect explicit concerns
  const concernPatterns = [
    { pattern: /concentration concerns me|concentration is (too high|concerning)/i, flag: 'customer_concentration' },
    { pattern: /burn (rate )?(is )?(too high|concerns? me|worries? me)/i, flag: 'burn_rate' },
    { pattern: /runway (is )?(too (short|tight)|concerns? me)/i, flag: 'runway' },
    { pattern: /team (concerns?|worries?|inexperienced)/i, flag: 'team_experience' },
  ];
  
  for (const { pattern, flag } of concernPatterns) {
    if (pattern.test(combined)) {
      // Don't add duplicate - just note for UI
      updates.push({
        type: 'redFlag',
        action: 'add',
        description: `Potential concern detected: ${flag}`,
        explicit: false,
        data: { pattern: flag },
      });
    }
  }
  
  return updates;
}
