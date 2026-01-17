# Cowork Memory Demo

> **A product concept exploring persistent memory for AI assistants** — transforming Claude from a stateless tool into a learning collaborator that remembers your preferences, patterns, and context across sessions.

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Claude API](https://img.shields.io/badge/Claude-Opus%204-orange)](https://www.anthropic.com/)

---

## 📖 Table of Contents

- [The Opportunity](#-the-opportunity)
- [Why This Matters](#-why-this-matters)
- [5 Wow Moments](#-5-wow-moments)
- [Architecture](#️-architecture)
- [File Structure](#-file-structure)
- [Getting Started](#-getting-started)
- [Product Strategy](#-product-strategy)
- [Future Directions](#-future-directions)
- [Technical Improvements](#-technical-improvements)
- [Tech Stack](#️-tech-stack)

---

## 🎯 The Opportunity

**Current State:** Cowork (and most AI tools) are stateless. Every session starts from scratch.

When you ask Cowork about memory today, it suggests **manual workarounds**:
- ❌ "Save context to a file and paste it each time"
- ❌ "Manually maintain a project brief"
- ❌ "Keep re-explaining your preferences"

**This demo automates all three — and adds implicit learning on top.**

### The Problem This Solves

Users spend **significant cognitive overhead** re-establishing context:
- Venture capitalists re-explain investment criteria for every deal
- Developers re-specify coding preferences in every session
- Researchers re-paste background information repeatedly
- Lawyers re-describe their analysis framework each time

**Time Cost:** 2-5 minutes per session × multiple sessions daily = hours wasted per week

**Mental Load:** Context switching penalty + frustration from repetition

---

## 💡 Why This Matters

### What Makes This Different

| Traditional AI Chat | Static Context Files | **This Demo** |
|---------------------|---------------------|---------------|
| No memory between sessions | Requires manual updates | Learns automatically |
| User must repeat preferences | User maintains static document | Extracts patterns from behavior |
| No behavioral adaptation | No personalization | Adapts tone, format, depth |
| Zero persistence | File-based (brittle) | Structured memory with confidence |
| No learning from decisions | Static rules only | Learns implicit preferences |

### Why It's Valuable

**1. Massive Time Savings**
- Eliminates 2-5 min of context re-establishment per session
- For daily users: **10-25 hours saved per month**

**2. Better Decisions Through Pattern Recognition**
- AI references past decisions: "This is similar to that deal you passed on"
- Learns from outcomes: "Last time this pattern appeared, you chose X"
- Builds institutional knowledge over time

**3. Personalized Collaboration**
- Adapts communication style to user preferences
- Learns formatting preferences (memo structure, tone, length)
- Becomes more valuable with use (network effects for individual users)

**4. Lower Cognitive Load**
- No mental overhead to remember what you've already told Claude
- Seamless continuation of thought across sessions
- Focus on the problem, not on re-explaining context

### The Innovation

**Self-Learning Memory System:**
Claude itself analyzes conversations to extract learnings. No explicit training data, no fine-tuning — just Claude's reasoning applied to its own conversations.

```
Conversation → Claude analyzes → Extracts patterns → Stores structured data → Injects next time
```

This creates a **virtuous feedback loop**: the more you use it, the better it gets.

---

## ✨ 5 Wow Moments

These progression demonstrates increasing sophistication:

### 1️⃣ Basic Recall
**What:** Claude remembers explicit information across sessions
**Example:** Tell Claude your investment thesis in Session 1. In Session 2, Claude already knows it.
**Value:** Eliminates repetitive context-setting

### 2️⃣ Implicit Learning
**What:** Claude infers preferences from your behavior without explicit statements
**Example:** You pass on 3 deals with >35% customer concentration. Claude learns this is a red flag.
**Value:** Captures tacit knowledge you might not articulate

### 3️⃣ Cross-Deal Inference
**What:** Claude connects patterns across different contexts
**Example:** "This deal reminds me of TechCo, which you passed on due to burn rate concerns."
**Value:** Pattern recognition across history

### 4️⃣ Behavioral Adaptation
**What:** Claude adapts *how* it responds, not just *what* it knows
**Example:** Learns you prefer direct memos with exec summary → risks → recommendation structure
**Value:** Personalized communication style

### 5️⃣ User Control
**What:** Full transparency and control over memory
**Example:** View all learned items, edit thresholds, delete memories
**Value:** Trust through transparency and agency

**Together, these create the experience of working with a colleague who knows you well.**

---

## 🏗️ Architecture

### High-Level Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      User Sends Message                      │
└──────────────────────┬──────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────┐
│              Memory Injector (lib/memory/injector.ts)        │
│  • Loads memory from localStorage                           │
│  • Formats as XML context                                   │
│  • Injects: thesis, red flags, preferences, deal history    │
└──────────────────────┬──────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────┐
│           Claude API Call (app/api/chat/route.ts)           │
│  System Prompt + Memory Context + Deal Context              │
│  → Claude Opus 4 generates personalized response            │
└──────────────────────┬──────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────┐
│                    User Sees Response                        │
└──────────────────────┬──────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────┐
│          Memory Extractor (lib/memory/extractor.ts)          │
│  • Sends conversation to Claude for analysis                │
│  • Extracts: new thesis, red flags, preferences, outcomes   │
│  • Returns structured JSON                                  │
└──────────────────────┬──────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────┐
│             Memory Store (lib/memory/store.ts)               │
│  • Validates and merges extractions                         │
│  • Updates confidence scores                                │
│  • Saves to localStorage                                    │
│  • Available for next session                               │
└─────────────────────────────────────────────────────────────┘
```

### Key Components

#### 1. Memory System (`lib/memory/`)

**`types.ts`** - Data structures
```typescript
InvestmentThesis {
  stages, sectors, checkSize, geography, priorities
}

RedFlag {
  id, pattern, threshold, description,
  confidence, explicit, timesApplied
}

MemoPreferences {
  tone, structure, length, format
}

DealOutcome {
  company, outcome, reasons, date, keyMetrics
}
```

**`injector.ts`** - Context formatting
- Converts structured memory → natural language XML
- Creates `<user_investment_thesis>`, `<user_red_flags>`, etc.
- Instructs Claude to apply memory naturally (without mentioning "memory")

**`extractor.ts`** - Learning engine
- Prompts Claude to analyze conversations
- Parses JSON extractions
- Applies updates with confidence scoring
- Handles explicit vs. implicit learning

**`store.ts`** - Persistence layer
- localStorage operations (get, save, reset)
- Quota handling and auto-cleanup
- Backup mechanism
- Confidence boosting for repeated patterns

#### 2. API Routes (`app/api/`)

**`chat/route.ts`** - Main conversation endpoint
- Accepts: messages, memory context, deal context
- Calls Claude Opus 4 with full system prompt
- Returns: AI response + token usage

**`extract/route.ts`** - Background learning
- Accepts: conversation history, current memory
- Prompts Claude to extract learnings
- Returns: Structured JSON for client-side application

#### 3. React Components (`app/components/`)

**`ChatPanel.tsx`** - Conversation interface
- Message display with markdown rendering
- Input with auto-expand textarea
- Loading states with rotating messages
- Session tracking

**`MemoryPanel.tsx`** - Memory visualization
- Displays all memory categories
- Edit/delete functionality for red flags
- Real-time highlights when memory updates
- Collapsible sections

**`DealBrowser.tsx`** - Deal flow interface
- Selectable deal list
- Expanded detail view
- Financial metrics display

**`GuidedTour.tsx`** - Interactive tutorial
- 6-step guided experience
- Suggested prompts for each wow moment
- Progress tracking

### Data Flow Example: Learning a Red Flag

```
1. User passes on a deal: "Too much customer concentration (40%)"

2. Claude responds: "Understood. High customer concentration is risky..."

3. Memory Extractor analyzes conversation:
   {
     "redFlags": [{
       "pattern": "customer_concentration",
       "threshold": "35%",
       "description": "Customer concentration >35%",
       "explicit": true,
       "confidence": 0.9
     }]
   }

4. Memory Store saves with confidence score

5. Next deal review:
   - Memory Injector loads red flag
   - Claude proactively checks: "Customer concentration is 34%..."
   - Claude references learned preference

6. If user agrees → confidence increases to 1.0
   If user disagrees → pattern may be removed
```

---

## 📁 File Structure

```
cowork-memory-demo/
│
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Landing page (value proposition)
│   ├── layout.tsx                # Root layout
│   ├── globals.css               # Global styles
│   │
│   ├── api/                      # API Routes
│   │   ├── chat/route.ts         # Claude conversation endpoint
│   │   └── extract/route.ts      # Memory extraction endpoint
│   │
│   └── components/               # React Components
│       ├── ChatPanel.tsx         # Main chat interface (245 lines)
│       ├── MemoryPanel.tsx       # Memory visualization (350+ lines)
│       ├── DealBrowser.tsx       # Deal list & details (150 lines)
│       └── GuidedTour.tsx        # Interactive tutorial (200+ lines)
│
├── lib/                          # Business Logic
│   ├── constants.ts              # App-wide constants
│   │
│   ├── memory/                   # Memory System (Core Innovation)
│   │   ├── types.ts              # TypeScript interfaces (170 lines)
│   │   ├── store.ts              # localStorage operations (210 lines)
│   │   ├── injector.ts           # Context formatting for Claude (100 lines)
│   │   └── extractor.ts          # Learning from conversations (250 lines)
│   │
│   ├── deals/                    # Synthetic Data
│   │   └── index.ts              # Mock VC deals for demo (260 lines)
│   │
│   ├── utils/                    # Utilities
│   │   └── formatters.ts         # Currency/percentage formatting
│   │
│   └── claude.ts                 # Claude API configuration
│
├── public/                       # Static Assets
│
├── .env.local                    # Environment Variables (API key)
├── .env.example                  # Environment template
│
├── next.config.ts                # Next.js configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
│
├── package.json                  # Dependencies
└── README.md                     # This file

Total: ~2,500 lines of TypeScript/React code
```

### Key Files Deep Dive

| File | Purpose | Lines | Critical? |
|------|---------|-------|-----------|
| `lib/memory/extractor.ts` | **Core innovation** - Learning engine | 250 | ⭐⭐⭐ |
| `lib/memory/injector.ts` | Formats memory for Claude | 100 | ⭐⭐⭐ |
| `lib/memory/store.ts` | Persistence & confidence scoring | 210 | ⭐⭐ |
| `app/components/ChatPanel.tsx` | Main UI | 245 | ⭐⭐ |
| `app/components/MemoryPanel.tsx` | Memory visualization | 350+ | ⭐⭐ |
| `app/api/chat/route.ts` | API endpoint | 70 | ⭐⭐ |
| `lib/deals/index.ts` | Demo data | 260 | ⭐ |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **Anthropic API Key** - [Get one here](https://console.anthropic.com/)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/cowork-memory-demo.git
cd cowork-memory-demo

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local and add your ANTHROPIC_API_KEY

# 4. Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

```bash
npm run dev      # Start development server (with Turbopack)
npm run build    # Create production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Usage

1. **Landing Page** (`/`) - Explains the concept and value proposition
2. **Demo Interface** (`/`) - Three-column layout:
   - **Left:** Deal Browser + Memory Panel
   - **Center:** Chat Interface
   - **Right:** Guided Tour

3. **Follow the Guided Tour** (recommended for first use):
   - Step 0: Setup - Tell Claude your investment thesis
   - Step 1-5: Experience each "Wow Moment"

---

## 🎯 For VCs: Ready-to-Use Template

Want to use this with your own deal flow? We've created a **1-click template** designed for VCs:

**👉 [Get the VC Template](https://github.com/ashstep2/cowork-memory-demo/generate) ← Start here**

### What You Get

The template repository includes:

✅ **File-Based System** - No coding required, edit Markdown files
✅ **Pre-Populated Demos** - 3 example companies to explore immediately
✅ **Non-Technical Setup** - Clear instructions for anyone to follow
✅ **Easy Customization** - Swap demo files for your own companies in minutes
✅ **Privacy-First** - All data stays on your machine

### Perfect For

- **Venture Capitalists** evaluating deal flow
- **Private Equity** professionals doing diligence
- **Corporate Development** teams reviewing M&A targets
- **Angel Investors** managing portfolio decisions

### How It Works

```bash
# 1. Use the template on GitHub (creates your own copy)
# 2. Clone to your computer
git clone https://github.com/YOUR-USERNAME/your-repo-name.git

# 3. Add your API key
cp .env.example .env.local
# Edit .env.local with your Anthropic API key

# 4. Run
npm install && npm run dev

# 5. Start with demo companies, then swap in your own
# Edit files in data/demo/ or add to data/user/
```

**[View Template Repository →](https://github.com/ashstep2/cowork-memory-demo/generate)**

---

## 📈 Product Strategy

### Vision

**Transform AI assistants from stateless tools → persistent, learning collaborators**

### Target Users (Priority Order)

1. **VC/Private Equity Investors** (Initial Focus)
   - High-frequency, high-value decisions
   - Clear evaluation criteria that can be learned
   - Significant time savings per deal review
   - Willingness to pay for decision support

2. **Software Developers**
   - Long-running projects with coding preferences
   - Framework/library choices that persist
   - Code review patterns and style guides
   - Testing philosophies

3. **Legal Professionals**
   - Contract review patterns
   - Client-specific preferences
   - Jurisdiction-specific considerations
   - Precedent tracking

4. **Researchers**
   - Domain knowledge accumulation
   - Methodology preferences
   - Literature tracking
   - Hypothesis tracking

### Value Proposition by User

| User Type | Pain Point | Memory Solution | Value Metric |
|-----------|-----------|-----------------|--------------|
| VC Investor | Re-explaining investment thesis | Auto-applies learned criteria | 10+ hours/month saved |
| Developer | Re-specifying code style | Remembers preferences | Faster reviews, consistency |
| Lawyer | Re-describing analysis framework | Adapts to client patterns | Reduced errors |
| Researcher | Re-pasting background | Builds domain knowledge | Better continuity |

### Business Model Options

**Tier 1: Free (localStorage only)**
- Local browser storage
- Export/import functionality
- Community support

**Tier 2: Pro ($20-30/month)**
- Cloud sync across devices
- Unlimited memory storage
- Advanced analytics on patterns
- Priority support

**Tier 3: Team ($50-100/user/month)**
- Shared team memory
- Collaboration features
- Admin controls
- SSO integration

**Enterprise: Custom Pricing**
- On-premise deployment
- Custom integrations
- SLA guarantees
- Dedicated support

### Go-to-Market Strategy

**Phase 1: Product-Led Growth (Months 1-3)**
- Launch on Product Hunt, Hacker News
- Free tier with localStorage
- Viral loop: Users share their "Wow Moments"
- Goal: 10K+ users, validate product-market fit

**Phase 2: Vertical Focus (Months 4-6)**
- Deep partnerships with 2-3 VC firms
- Case studies showing ROI
- Referral program for investors
- Goal: 100+ paying customers in VC

**Phase 3: Horizontal Expansion (Months 7-12)**
- Expand to developers, lawyers, researchers
- Marketplace for memory templates
- API for third-party integrations
- Goal: 1,000+ paying customers

**Phase 4: Enterprise (Year 2+)**
- Team features and collaboration
- On-premise deployment options
- Enterprise security compliance
- Goal: 10+ enterprise deals

### Success Metrics

**Engagement Metrics:**
- Sessions per week (target: 5+)
- Memory items created per user (target: 20+)
- Return rate after 7 days (target: 60%+)
- Average session length (target: 10+ min)

**Business Metrics:**
- Free → Paid conversion (target: 5-10%)
- Monthly churn (target: <5%)
- Customer lifetime value (target: $500+)
- Net Promoter Score (target: 40+)

### Competitive Positioning

| Competitor | Their Approach | Our Differentiation |
|------------|---------------|---------------------|
| ChatGPT Custom Instructions | Static text field | Dynamic learning from behavior |
| Notion AI | Document-based context | Structured memory with confidence |
| Custom GPTs | One-time configuration | Continuous adaptation |
| Fine-tuned Models | Expensive, slow iteration | Prompt-based, instant updates |

**Key Advantage:** We're building a **learning system**, not just a context manager.

---

## 🔮 Future Directions

### Near-Term Enhancements (Next 3 months)

**1. Cross-Device Sync**
- Cloud backend for memory persistence
- Conflict resolution for multi-device usage
- Encrypted storage for sensitive data

**2. Memory Templates**
- Pre-built templates for common roles (VC, dev, lawyer)
- One-click setup for new users
- Community-contributed templates

**3. Advanced Analytics**
- Memory growth over time graphs
- Pattern confidence visualization
- Decision outcome tracking
- ROI calculations (time saved)

**4. Collaboration Features**
- Share memory snapshots with team
- Team memory pools (shared knowledge)
- Permission controls (view/edit/admin)

### Mid-Term Features (3-6 months)

**5. Multi-Domain Memory**
- Separate memory contexts for different projects
- Context switching with memory isolation
- Cross-domain insights ("This project is like...")

**6. Active Learning**
- Claude asks clarifying questions to build memory
- Proactive memory validation ("Is this still true?")
- Memory health checks (outdated patterns)

**7. Integration Ecosystem**
- Chrome extension for any web app
- Slack/Discord bots with memory
- API for third-party integrations
- VSCode extension for developers

**8. Advanced Memory Types**
- Visual memory (diagrams, sketches)
- Code memory (functions, patterns)
- Document memory (past analyses)
- Relationship memory (people, organizations)

### Long-Term Vision (6-12 months)

**9. Agentic Memory**
- Memory that evolves autonomously
- Identifies gaps and fills them proactively
- Learns from external sources (docs, emails)
- Proposes memory updates

**10. Collective Intelligence**
- Anonymized pattern sharing across users
- "Users like you also learned..."
- Benchmark your memory against similar users
- Community wisdom extraction

**11. Multi-Modal Memory**
- Voice note transcription → memory
- Image analysis → visual memory
- Screen recording → workflow memory
- Meeting transcripts → relationship memory

**12. Predictive Memory**
- Anticipates what you'll need next
- Pre-loads relevant context
- Suggests related memories
- "You might want to reference..."

### Research Directions

**Memory Compression**
- Techniques to store years of memory efficiently
- Hierarchical summarization (detailed → abstract)
- Forgetting algorithms (what to prune)

**Cross-User Learning**
- Federated learning across users
- Privacy-preserving pattern extraction
- Benchmark memory quality

**Memory Provenance**
- Track where each memory came from
- Confidence decay over time
- Source attribution ("Learned from Deal X")

**Memory Governance**
- Ethical guidelines for memory usage
- User consent frameworks
- Right to be forgotten
- Memory auditing

---

## 🛠️ Technical Improvements

### Critical (Security & Reliability)

**1. Input Validation & Sanitization**
```bash
# Install Zod for schema validation
npm install zod

# Add validation to API routes
# Prevent prompt injection, XSS, malformed data
```

**2. Rate Limiting**
```bash
# Install Upstash for rate limiting
npm install @upstash/ratelimit @upstash/redis

# Implement per-IP and per-session limits
# Prevent API credit abuse
```

**3. Error Boundaries**
```typescript
// Add React error boundaries
// Prevent app crashes from propagating
// User-friendly error fallbacks
```

**4. Authentication System**
```bash
# Install NextAuth.js
npm install next-auth

# Add user sessions and authentication
# Track usage per user
```

### High Priority (Architecture)

**5. State Management**
```bash
# Install Zustand for global state
npm install zustand

# Replace prop drilling with centralized store
# Simplify component communication
```

**6. Database Migration**
```bash
# Move from localStorage → PostgreSQL
npm install @vercel/postgres

# Enable cross-device sync
# No storage quota limits
# Better data integrity
```

**7. Testing Infrastructure**
```bash
# Install testing libraries
npm install -D vitest @testing-library/react @testing-library/jest-dom

# Add unit tests for memory operations
# Integration tests for API routes
# E2E tests for critical flows
```

**8. Monitoring & Analytics**
```bash
# Install Sentry for error tracking
npm install @sentry/nextjs

# Install Vercel Analytics
npm install @vercel/analytics

# Track errors, performance, usage patterns
```

### Medium Priority (Performance & UX)

**9. Optimistic Updates**
```typescript
// Show user message immediately
// Update UI before API response
// Rollback on error
```

**10. Retry Mechanisms**
```typescript
// Exponential backoff for failed requests
// Auto-retry on network errors
// Queue for offline operations
```

**11. Code Splitting**
```typescript
// Lazy load components
// Reduce initial bundle size
// Faster page loads
```

**12. Accessibility Audit**
```bash
# Install accessibility testing tools
npm install -D @axe-core/react

# Add ARIA labels
# Keyboard navigation
# Screen reader support
```

### Enhancements (Nice-to-Have)

**13. Dark Mode**
```bash
# Install next-themes
npm install next-themes

# Add theme toggle
# Respect system preferences
```

**14. Keyboard Shortcuts**
```typescript
// Cmd/Ctrl+K: Focus chat
// Cmd/Ctrl+N: New session
// Esc: Clear input
```

**15. Data Export/Import**
```typescript
// Export memory as JSON
// Import from file
// Backup automation
```

**16. Mobile Optimization**
```css
/* Responsive grid layouts */
/* Touch-optimized interactions */
/* Mobile-first design */
```

---

## 🎯 Purpose of This Demo

### What This Demo Is

**A product concept and proof-of-concept** that demonstrates:

1. **Technical Feasibility** - Persistent memory is achievable with current AI capabilities
2. **User Value** - Clear, measurable improvements in user experience
3. **Product Vision** - Roadmap from demo → production → scale
4. **Business Opportunity** - Addresses real pain points for valuable user segments

### What This Demo Is NOT

- ❌ A production-ready product (security hardening needed)
- ❌ A research paper (no formal evaluation)
- ❌ An official Anthropic product (independent concept)
- ❌ A fully-featured application (intentionally scoped)

### Design Decisions

**Why VC/Investment Use Case?**
- Clear decision patterns that can be learned
- High-value decisions (memory has obvious ROI)
- Easy to demonstrate learning (pass/invest outcomes)
- Transferable to other decision-making contexts

**Why Local-First Storage?**
- Privacy by default (no server-side data)
- Faster iteration (no backend needed)
- Lower barrier to try (no account required)
- Validates concept before infrastructure investment

**Why Claude Opus 4?**
- Best reasoning capability for extraction
- Longer context window (handles full conversations)
- Highest quality memory generation
- Production-ready API

**Why Next.js 16?**
- Modern React patterns (Server Components, App Router)
- Built-in API routes (no separate backend)
- Excellent developer experience
- Easy deployment (Vercel)

### Success Criteria for Demo

✅ **Proves Memory Works:** Users can see Claude learning and applying knowledge
✅ **Shows User Value:** Clear "Wow Moments" that resonate
✅ **Demonstrates Scalability:** Architecture can extend to production
✅ **Sparks Conversations:** Generates interest and feedback

### Next Steps After Demo

**If Positive Reception:**
1. User interviews (10-20 target users)
2. Security audit and hardening
3. Alpha launch (100 users)
4. Iterate based on feedback
5. Beta launch with pricing

**If Mixed Reception:**
1. Identify which "Wow Moments" resonate
2. Double down on successful patterns
3. Pivot use case if needed
4. Re-demo with improvements

**If Negative Reception:**
1. Understand core objections
2. Assess if fixable or fundamental
3. Decide: pivot, persevere, or stop

---

## 🛡️ Privacy & Security

### Data Storage

- **Local-First:** All memory stored in browser localStorage
- **No External Storage:** Data never leaves your machine (in current demo)
- **Full Control:** View, edit, delete any memory item
- **Export Anytime:** Download your complete memory as JSON

### Security Considerations (Current Demo)

⚠️ **Demo Limitations - Do NOT use for sensitive data:**
- No authentication (anyone with device access can view)
- No encryption (localStorage is plaintext)
- No rate limiting (API abuse possible)
- No input validation (prompt injection risk)

### Production Security Roadmap

**Phase 1: Hardening**
- Add authentication (NextAuth)
- Implement rate limiting
- Input validation (Zod schemas)
- CSRF protection
- Content Security Policy headers

**Phase 2: Enterprise**
- End-to-end encryption
- SSO integration (SAML, OAuth)
- Audit logging
- SOC 2 compliance
- GDPR compliance

---

## 🛠️ Tech Stack

### Core Technologies

- **[Next.js 16](https://nextjs.org/)** - React framework with App Router and Server Components
- **[React 19](https://react.dev/)** - UI library with latest concurrent features
- **[TypeScript 5](https://www.typescriptlang.org/)** - Type-safe development
- **[Tailwind CSS 3.4](https://tailwindcss.com/)** - Utility-first styling
- **[Claude API (Opus 4)](https://www.anthropic.com/)** - AI conversation and extraction

### Supporting Libraries

- **[Lucide React](https://lucide.dev/)** - Icon system
- **[React Markdown](https://remarkjs.github.io/react-markdown/)** - Markdown rendering in chat
- **[Remark GFM](https://github.com/remarkjs/remark-gfm)** - GitHub-flavored markdown support

### Development Tools

- **[Turbopack](https://turbo.build/pack)** - Fast bundler for development
- **[ESLint 9](https://eslint.org/)** - Code linting
- **[PostCSS](https://postcss.org/)** - CSS processing

### Deployment

- **[Vercel](https://vercel.com/)** - Hosting and deployment platform
- **Environment Variables** - Secure API key management

---

## 🤝 Contributing

This is currently a product concept demo. Contributions welcome in the form of:

- **Feedback:** What resonates? What doesn't?
- **Use Cases:** Other domains where this would be valuable?
- **Feature Ideas:** What would make this more useful?
- **Technical Improvements:** Suggestions for architecture, security, performance

---

## 📄 License

MIT License - feel free to fork, modify, and build upon this concept.

---

## 🙏 Acknowledgments

- **Anthropic** - For Claude API and inspiration (though this is not an official Anthropic project)
- **Next.js Team** - For excellent developer experience
- **Open Source Community** - For the tools that make this possible

---

## 📞 Contact

For questions, feedback, or collaboration:
- **GitHub Issues:** [Project Issues](https://github.com/yourusername/cowork-memory-demo/issues)
- **Discussions:** [GitHub Discussions](https://github.com/yourusername/cowork-memory-demo/discussions)

---

**Built with the belief that AI assistants should learn from us, not just respond to us.**

*Last updated: January 2026*
