import { Deal } from '../memory/types';

// Try to load from file system (server-side only)
let DEALS: Deal[] = [];

// Only import and use loader on server side
if (typeof window === 'undefined') {
  try {
    // Dynamic import to avoid bundling fs on client
    const { loadDealsFromFiles } = require('./loader');
    DEALS = loadDealsFromFiles();
  } catch (error) {
    console.warn('[Deals] File loading failed, using hardcoded MOCK_DEALS', error);
  }
}

// Hardcoded fallback deals (used when file system loading fails or on client)
export const MOCK_DEALS: Deal[] = [
  {
    id: 'humanloop',
    name: 'Humanloop',
    tagline: 'Developer tools for LLM applications',
    stage: 'Series A',
    sector: 'Developer Tools - AI Infrastructure',

    metrics: {
      arr: 4_500_000,
      mrr: 375_000,
      growthMoM: 0.18,
      burnMonthly: 420_000,
      runwayMonths: 22,
      customers: 340,
      topCustomerPct: 0.12,
      grossMargin: 0.82,
      nrr: 1.28,
    },

    funding: {
      raising: 15_000_000,
      preMoney: 75_000_000,
      lead: 'Seeking',
      existingInvestors: ['Lux Capital', '20VC', 'AIX Ventures'],
    },

    team: {
      ceo: {
        name: 'Raza Habib',
        role: 'CEO',
        background: 'PhD Cambridge, Ex-UCL, YC W21'
      },
      cto: {
        name: 'David Barber',
        role: 'Chief Scientist',
        background: 'Professor UCL, Leading ML researcher'
      },
      employees: 28,
    },

    deckSummary: `Humanloop provides the developer platform for building reliable LLM applications.

PROBLEM: Teams waste weeks debugging prompts, managing model versions, and evaluating LLM outputs. No systematic way to improve AI applications post-deployment.

SOLUTION: Complete LLM ops platform with prompt management, evaluation frameworks, active learning, and production monitoring for Claude + other models.

TRACTION:
• $4.5M ARR, growing 18% MoM
• 340 companies including Fortune 500s
• 128% NRR (best-in-class retention)
• Deep integration with Claude API

MARKET: $15B+ LLM infrastructure TAM, growing 85% annually as AI adoption accelerates.

TEAM: World-class ML team from Cambridge/UCL. YC W21. Deep technical credibility in AI safety community.

STRATEGIC VALUE FOR ANTHROPIC:
• Ecosystem play: Makes Claude stickier for enterprise developers
• Feedback loop: Their evaluation data improves our models
• Go-to-market: 340 companies = distribution channel
• Talent: Acquire world-class AI safety researchers

ASK: $15M Series A with Anthropic as strategic lead investor.`,

    financialsDetail: `REVENUE & GROWTH
• ARR: $4.5M ($375K MRR)
• Growth: 18% MoM (215% annualized)
• NRR: 128% (exceptional)
• Claude API Revenue: ~40% of usage

UNIT ECONOMICS
• Gross Margin: 82% (software-like)
• CAC: $28K
• LTV: $420K
• LTV/CAC: 15x (incredible)
• Payback: 4 months

BURN & RUNWAY
• Monthly Burn: $420K
• Cash: $9.2M
• Runway: 22 months (healthy)

CUSTOMER BREAKDOWN
• Enterprise (>$50K ACV): 42 customers, 68% of ARR
• Growth (>$10K): 98 customers, 24% of ARR
• Self-serve (<$10K): 200 customers, 8% of ARR

CONCENTRATION: Top customer = $540K ACV (12% of ARR) ✓ Well diversified

✅ STRATEGIC HIGHLIGHTS:
- 40% of their revenue drives Claude API usage
- Built-in distribution channel for Claude enterprise
- Evaluation framework could inform Constitutional AI research
- Team has published AI safety papers (alignment with Anthropic mission)`
  },

  {
    id: 'langchain',
    name: 'LangChain',
    tagline: 'Framework for building context-aware LLM apps',
    stage: 'Series A',
    sector: 'Developer Tools - AI Frameworks',

    metrics: {
      arr: 8_200_000,
      mrr: 683_000,
      growthMoM: 0.22,
      burnMonthly: 650_000,
      runwayMonths: 18,
      customers: 1240,
      topCustomerPct: 0.08,
      grossMargin: 0.78,
      nrr: 1.32,
    },

    funding: {
      raising: 25_000_000,
      preMoney: 150_000_000,
      lead: 'Sequoia',
      existingInvestors: ['Benchmark', 'a16z'],
    },

    team: {
      ceo: {
        name: 'Harrison Chase',
        role: 'CEO',
        background: 'Ex-Robust Intelligence, Stanford CS'
      },
      cto: {
        name: 'Ankush Gola',
        role: 'CTO',
        background: 'Ex-Facebook AI, Berkeley PhD'
      },
      employees: 42,
    },

    deckSummary: `LangChain is the #1 framework for building LLM applications, with 80K+ GitHub stars and massive developer mindshare.

PROBLEM: Building production LLM apps requires solving orchestration, memory, retrieval, agents, and multi-step reasoning. Every team rebuilds these primitives.

SOLUTION: Open-source framework + commercial cloud platform (LangSmith) for debugging, monitoring, and improving LLM applications.

TRACTION:
• $8.2M ARR, growing 22% MoM
• 1,240 paying customers (90% using Claude)
• 80,000+ GitHub stars (fastest-growing AI repo)
• 132% NRR
• 2M+ monthly npm downloads

MARKET: Positioned to capture majority of LLM application development - $25B+ TAM.

TEAM: Harrison Chase (creator of LangChain OSS), backed by Sequoia + Benchmark.

STRATEGIC CONSIDERATIONS:
• Ecosystem dominance: 90% of customers use Claude through LangChain
• Dependency risk: They control developer experience layer above us
• Acquisition opportunity: Bring critical infrastructure in-house
• Talent risk: Sequoia leading, could become competitor

ASK: $25M Series A, Sequoia leading at $150M pre. Anthropic invited as co-investor.`,

    financialsDetail: `REVENUE & GROWTH
• ARR: $8.2M ($683K MRR)
• Growth: 22% MoM (290% annualized)
• NRR: 132%
• Claude Integration Revenue: Estimated $7.4M (90%+)

UNIT ECONOMICS
• Gross Margin: 78%
• CAC: $18K (PLG motion)
• LTV: $380K
• LTV/CAC: 21x
• Payback: 3 months (exceptional)

BURN & RUNWAY
• Monthly Burn: $650K
• Cash: $11.7M
• Runway: 18 months ⚠️ Tight for momentum

CUSTOMER BREAKDOWN
• Enterprise: 140 customers, 62% of ARR
• Mid-Market: 420 customers, 28% of ARR
• SMB: 680 customers, 10% of ARR

CONCENTRATION: Top customer = $656K ACV (8% of ARR) ✓

⚠️ STRATEGIC CONCERNS:
- They own the abstraction layer between Claude and developers
- Could favor other model providers if we don't invest
- Sequoia leading = potential competitive dynamics
- Runway tight = must decide quickly
- Open-source leverage = hard to replicate

✅ UPSIDE:
- 90% of customers drive Claude API revenue
- Acquisition brings developer ecosystem in-house
- LangSmith monitoring data = training data gold mine
- Neutralizes potential competitor if we invest`
  },

  {
    id: 'bun',
    name: 'Oven (Bun)',
    tagline: 'Next-generation JavaScript runtime and toolkit',
    stage: 'Acquisition',
    sector: 'Developer Infrastructure - Runtime',

    metrics: {
      arr: 0,
      mrr: 0,
      growthMoM: 0,
      burnMonthly: 180_000,
      runwayMonths: 14,
      customers: 0,
      topCustomerPct: 0,
      grossMargin: 0,
      nrr: 0,
    },

    funding: {
      raising: 0,
      preMoney: 0,
      lead: 'N/A',
      existingInvestors: ['Y Combinator', 'Kleiner Perkins'],
    },

    team: {
      ceo: {
        name: 'Jarred Sumner',
        role: 'Creator & CEO',
        background: 'Ex-Stripe, Systems programmer'
      },
      cto: {
        name: 'Jarred Sumner',
        role: 'Creator & CEO',
        background: 'Ex-Stripe, Systems programmer'
      },
      employees: 7,
    },

    deckSummary: `Bun is the fastest JavaScript runtime, rewritten in Zig. 3x faster than Node.js, with built-in bundler, transpiler, and package manager. 8M+ npm downloads/month.

PROBLEM: Node.js is 15 years old and slow. Every JavaScript project needs separate tools (bundler, transpiler, test runner). Developers waste hours on tooling config.

SOLUTION: All-in-one JavaScript runtime with native speed. Drop-in replacement for Node.js with TypeScript, JSX, and bundling built-in. Zero configuration.

TRACTION:
• 8M+ monthly npm downloads (fastest-growing runtime)
• 67K+ GitHub stars in 2 years
• Pre-revenue (open source), but massive adoption
• Used by Vercel, Railway, and thousands of startups
• 120K+ Discord community members

MARKET: JavaScript is used by 19M+ developers. Runtime infrastructure is foundational—whoever controls it controls developer experience.

TEAM: Jarred Sumner (creator) - legendary systems engineer. Ex-Stripe. Built Bun solo for 18 months, then raised $7M seed. Team of 7 elite engineers.

STRATEGIC OPPORTUNITY (ACQUISITION):
• Infrastructure control: Own the runtime layer for AI-assisted development
• Claude Code integration: Bun's speed = better Claude developer experience
• Talent acquisition: Jarred is a 10x systems engineer
• Ecosystem moat: Differentiate Anthropic's developer tools from OpenAI

STRATEGIC RATIONALE:
✅ Vercel (OpenAI partner) runs on Node.js/Next.js
✅ Anthropic could own the faster, better runtime stack
✅ Bun + Claude Code = unbeatable developer platform
✅ Pre-revenue = acquire for talent + tech, not expensive

ASK: $25M acquisition (talent + IP). Team stays intact. Bun becomes open-source infrastructure for Claude ecosystem.`,

    financialsDetail: `BUSINESS MODEL
• Pre-revenue (100% open source)
• No monetization yet - pure developer tool
• Funding: $7M seed from Y Combinator, Kleiner Perkins

BURN & RUNWAY
• Monthly Burn: $180K (mostly salaries)
• Cash: $2.5M remaining
• Runway: 14 months ⚠️ Need capital or exit

DEVELOPER ADOPTION
• 8M+ monthly npm downloads (growing 40% MoM)
• 67K GitHub stars (top 0.1% of all repos)
• 120K Discord members (engaged community)
• Used in production by: Vercel, Railway, Shopify, Cloudflare Workers

TECHNICAL METRICS
• 3x faster than Node.js for most workloads
• 2x faster than Deno
• 90%+ Node.js API compatibility (drop-in replacement)
• Native TypeScript/JSX support (no config needed)
• Built-in test runner, bundler, package manager

🎯 ACQUISITION RATIONALE:

WHY NOW:
- 14 months runway = motivated seller
- Pre-revenue = acquire at talent + IP value (~$25M)
- OpenAI hasn't moved on developer infrastructure yet
- JavaScript developers are Claude's fastest-growing user segment

STRATEGIC VALUE:
- Own the runtime layer (infrastructure control)
- Bun + Claude Code = integrated developer platform
- Talent: Jarred Sumner is world-class (systems + dev tools)
- Differentiation: Faster, better stack than OpenAI ecosystem
- Moat: Make Claude the obvious choice for JavaScript developers

INTEGRATION PLAN:
- Keep Bun open source (community goodwill)
- Integrate with Claude Code for optimized performance
- Build native Claude SDK into Bun runtime
- Position as "Bun: The AI-native JavaScript runtime"

RISKS:
- Pre-revenue acquisition (no proven business model)
- Community backlash if commercialized wrong
- Need to maintain open source credibility

RECOMMENDATION:
✅ ACQUIRE for $25M. Jarred + team join Anthropic Developer Tools.
- Bun stays open source but becomes "Powered by Anthropic"
- Integrate deeply with Claude Code and API
- Ship "Claude Runtime" using Bun as foundation
- Strategic hedge against OpenAI owning developer tooling stack`
  }
];

// Export the loaded deals (from files if available, otherwise MOCK_DEALS)
export const deals = DEALS.length > 0 ? DEALS : MOCK_DEALS;

export function getDealById(id: string): Deal | undefined {
  return deals.find(d => d.id === id);
}
