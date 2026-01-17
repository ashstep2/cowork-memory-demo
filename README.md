# Cowork Memory Demo (Venture Capital Use Case Example)

> **AI assistants with persistent memory** — A demo showing Claude learning your investment preferences and patterns across sessions.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ashstep2/cowork-memory-demo&env=ANTHROPIC_API_KEY&envDescription=Get%20your%20API%20key%20from%20Anthropic%20Console&envLink=https://console.anthropic.com)

---

## 🎯 For Anthropic Labs

This demo showcases **3 realistic investment scenarios** relevant to Anthropic's ecosystem:

### Demo Companies

1. **Humanloop** - Strong partnership opportunity ($4.5M ARR, 128% NRR, drives $3.6M Claude API revenue)
2. **LangChain** - Borderline strategic case ($8.2M ARR, owns abstraction layer, competitive dynamics)
3. **Bun** - Acquisition opportunity (pre-revenue, 8M+ npm downloads, developer infrastructure)

**Try it live:** [cowork-memory-demo.vercel.app](TODO)

---

## What Is This?

Most AI assistants are **stateless** — every conversation starts from scratch. This demo shows Claude:

- ✅ Remembering your investment thesis across sessions
- ✅ Learning red flags from your decisions (implicit + explicit)
- ✅ Adapting memo style to your preferences
- ✅ Referencing past deals when analyzing new ones
- ✅ Getting smarter the more you use it

**The Innovation:** Claude analyzes its own conversations to extract learnings — no fine-tuning, no external training. Just structured memory injection.

---

## 🚀 Deploy Your Own (1-Click)

### Option 1: Vercel (Easiest)

Click the button below. You'll need an Anthropic API key ([get one here](https://console.anthropic.com/)).

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ashstep2/cowork-memory-demo&env=ANTHROPIC_API_KEY&envDescription=Get%20your%20API%20key%20from%20Anthropic%20Console&envLink=https://console.anthropic.com)

### Option 2: Local Development

```bash
# 1. Clone the repository
git clone https://github.com/ashstep2/cowork-memory-demo.git
cd cowork-memory-demo

# 2. Install dependencies
npm install

# 3. Add your API key
cp .env.example .env.local
# Edit .env.local and add: ANTHROPIC_API_KEY=your_key_here

# 4. Run the app
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see it running.

---

## 📁 Customize with Your Own Companies

Want to analyze your own portfolio companies? Easy.

### File-Based System (No Code Required)

```
data/
├── demo/                    # Pre-loaded demo companies
│   ├── humanloop/
│   │   ├── deal.json        # Company metadata and metrics
│   │   ├── pitch-deck.md    # Full pitch deck content
│   │   └── financials.md    # Financial details
│   ├── langchain/
│   │   ├── deal.json
│   │   ├── pitch-deck.md
│   │   └── financials.md
│   └── bun/
│       ├── deal.json
│       ├── pitch-deck.md
│       └── financials.md
└── user/                    # Your companies (gitignored for privacy)
    ├── _README.md           # Instructions for adding companies
    └── your-company-name/   # Add your companies here
        ├── deal.json
        ├── pitch-deck.md
        └── financials.md
```

**To add a company:**

1. Copy `data/demo/humanloop/` to `data/user/my-company/`
2. Edit the 3 files with your company's data
3. Refresh the app → Your company appears automatically

**Privacy:** Files in `data/user/` are gitignored and stay on your machine.

See [SETUP.md](./SETUP.md) for detailed file format and instructions.

---

## 🏗️ How It Works

### Architecture

```
1. User selects a deal and asks Claude a question
   ↓
2. Memory Injector (lib/memory/injector.ts)
   - Loads learned preferences from browser localStorage
   - Injects investment thesis, red flags, memo preferences, deal history into context
   ↓
3. Deal Context Builder (app/page.tsx)
   - Loads company data from filesystem (pitch-deck.md, financials.md, deal.json)
   - Injects deal-specific context
   ↓
4. Claude API Route (app/api/chat/route.ts)
   - Sends combined context + conversation history to Claude Opus 4
   - Receives AI response
   ↓
5. Memory Extractor (app/api/extract/route.ts)
   - Analyzes entire conversation with Claude
   - Extracts learnings using structured prompt
   - Returns JSON with investment thesis, red flags, preferences, deal outcomes
   ↓
6. Memory Store (lib/memory/store.ts)
   - Applies extractions with confidence scoring
   - Updates localStorage with new learnings
   - Next conversation uses updated memory
```

### Key Components

**Frontend (React/Next.js):**
- `app/page.tsx` - Main application orchestrator
- `app/components/ChatPanel.tsx` - Chat interface with memory update drawer
- `app/components/MemoryPanel.tsx` - Memory visualization with confidence meters
- `app/components/DealBrowser.tsx` - Company selection interface
- `app/components/GuidedTour.tsx` - Interactive demo walkthrough

**Backend (API Routes):**
- `app/api/chat/route.ts` - Claude API integration for conversations
- `app/api/extract/route.ts` - Memory extraction from conversations
- `app/api/deals/route.ts` - File-based company data loading

**Memory System:**
- `lib/memory/injector.ts` - Injects memory into Claude's context
- `lib/memory/extractor.ts` - Extracts learnings from conversations
- `lib/memory/store.ts` - Persistence and confidence scoring logic
- `lib/memory/types.ts` - TypeScript interfaces for memory structures

**Data Management:**
- `lib/deals/loader.ts` - Server-side filesystem reading (Node.js fs module)
- `lib/deals/index.ts` - Deal data interfaces and mock data

### Tech Stack

- **Next.js 14 (App Router)** - React framework with server/client components
- **TypeScript** - Type-safe development
- **Claude API (Sonnet 4)** - AI conversation and learning
- **localStorage** - Memory persistence (client-side, no database required)
- **Tailwind CSS** - Styling
- **React Markdown** - Message rendering

### Complete Project Structure

```
cowork-memory-demo/
├── app/                           # Next.js App Router
│   ├── api/                       # API Routes
│   │   ├── chat/route.ts         # Claude conversation endpoint
│   │   ├── deals/route.ts        # File-based company data loading
│   │   └── extract/route.ts      # Memory extraction endpoint
│   ├── components/               # React components
│   │   ├── ChatPanel.tsx         # Chat interface with memory drawer
│   │   ├── DealBrowser.tsx       # Company selection
│   │   ├── GuidedTour.tsx        # Interactive demo
│   │   └── MemoryPanel.tsx       # Memory visualization
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main application page
├── data/                          # Company data (file-based)
│   ├── demo/                     # Demo companies (committed to git)
│   │   ├── humanloop/
│   │   ├── langchain/
│   │   └── bun/
│   └── user/                     # Your companies (gitignored)
│       └── _README.md
├── lib/                           # Utilities and business logic
│   ├── claude.ts                 # Claude API client
│   ├── constants.ts              # App-wide constants
│   ├── deals/                    # Deal management
│   │   ├── index.ts              # Deal interfaces
│   │   └── loader.ts             # File system loading
│   ├── memory/                   # Memory system
│   │   ├── extractor.ts          # Extract learnings from conversations
│   │   ├── injector.ts           # Inject memory into context
│   │   ├── store.ts              # Persistence and confidence scoring
│   │   └── types.ts              # Memory type definitions
│   └── utils/
│       └── formatters.ts         # Formatting utilities
├── public/                        # Static assets
├── .env.example                   # Environment variable template
├── .env.local                     # Your API key (gitignored)
├── .gitignore
├── next.config.ts
├── package.json
├── README.md                      # This file
├── SETUP.md                       # Detailed setup instructions
├── tailwind.config.ts
└── tsconfig.json
```

---

## 💡 The "Wow Moments"

Follow the guided tour in the app to experience:

1. **Basic Recall** - Claude remembers explicit information across sessions
2. **Implicit Learning** - Claude infers preferences from your behavior
3. **Cross-Deal Inference** - "This reminds me of that deal you passed on..."
4. **Behavioral Adaptation** - Claude adapts memo style, tone, format
5. **User Control** - View, edit, delete any memory item

---

## 🔒 Privacy & Security

**Current Demo:**
- All memory stored in browser localStorage (your machine)
- Only API calls go to Anthropic (for AI responses)
- Company data never leaves your device
- No authentication (demo only)

**For Production:**
- Add authentication (NextAuth.js)
- Encrypt sensitive data
- Implement rate limiting
- Add team collaboration features

---

## 📊 Use Cases Beyond VC

This memory system works for any high-frequency decision-making:

- **Private Equity** - Diligence workflows
- **Software Development** - Code review patterns, style preferences
- **Legal** - Contract review, client-specific preferences
- **Research** - Domain knowledge accumulation

---

## 📚 Documentation

- **[SETUP.md](./SETUP.md)** - Detailed deployment and customization guide

---

## 🤝 Contributing

Feedback welcome! This is a product concept demo showing what's possible with Claude's persistent memory. Feel free to fork and build upon this concept.

---

**Built to demonstrate that AI assistants should learn from us, not just respond to us.**

*Created for Anthropic Labs — January 2025*
