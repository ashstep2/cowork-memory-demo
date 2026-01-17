# 🚀 VC Quick Start Guide (Non-Technical)

**Time to get started:** 5 minutes
**Technical knowledge required:** None (just copy/paste commands)

---

## What You're Getting

An AI assistant that:
- ✅ Remembers your investment thesis and preferences
- ✅ Learns from your past decisions automatically
- ✅ Analyzes deals based on your criteria
- ✅ Writes memos in your preferred style
- ✅ Gets smarter the more you use it

---

## 🎬 3-Step Setup

### Step 1: Get Your API Key (2 minutes)

1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Click "Sign Up" (no credit card needed for trial)
3. Click "Get API Key"
4. Copy the key (starts with `sk-ant-...`)

###Step 2: Install & Configure (2 minutes)

```bash
# Navigate to the project folder
cd cowork-memory-demo

# Copy the environment file
cp .env.example .env.local

# Open .env.local in any text editor
# Replace "your_api_key_here" with the key you copied

# Install dependencies
npm install

# Start the app
npm run dev
```

### Step 3: Open in Browser (1 minute)

Open [http://localhost:3000](http://localhost:3000)

**That's it!** The app is running with 3 demo companies.

---

## 📊 Understanding the Demo Companies

The app comes pre-loaded with 3 companies that demonstrate different scenarios:

### 1. Acme AI (Strong Investment)
- **Status:** Series A, $4.5M ARR, healthy growth
- **Purpose:** Example of a high-quality deal
- **Use:** Practice positive investment analysis

### 2. Quantum Labs (Borderline)
- **Status:** Seed, early traction, some red flags
- **Purpose:** Practice nuanced decision-making
- **Use:** Test how Claude handles ambiguous signals

### 3. GreenTech Inc (Clear Pass)
- **Status:** Pre-revenue, high burn, missing CTO
- **Purpose:** Demonstrate red flag detection
- **Use:** Test learned preferences against poor fit

---

## 💬 What Questions to Ask

### First Conversation: Teach Your Investment Thesis

Copy and paste this (modify for your preferences):

```
I'm a Series A/B investor focused on enterprise SaaS companies.
I typically invest $10-25M with a focus on:
- ARR >$5M with >25% YoY growth
- Strong unit economics (LTV/CAC >3x)
- Technical founding teams
- Runway >18 months

Red flags for me:
- Customer concentration >30%
- Burn rate >$1M/month for early-stage
- Pre-revenue companies
```

### Analyzing Deals

```
Analyze the Acme AI opportunity
```

```
What are the key risks with Quantum Labs?
```

```
Compare Acme AI and Quantum Labs on unit economics
```

### Testing Memory

```
Based on what you know about my preferences, should I invest in GreenTech?
```

---

## 📁 Using Your Own Companies

### Option A: Quick Swap (Easiest)

1. Navigate to `data/demo/acme-ai/`
2. Open `pitch-deck.md` in any text editor
3. Replace content with your company's pitch deck
4. Open `financials.md` and replace with your data
5. Open `deal.json` and update metrics
6. Refresh browser → Your company appears!

### Option B: Add New Company

1. Copy `data/demo/acme-ai/` folder
2. Rename to `data/user/my-company-name/`
3. Edit all 3 files inside:
   - `deal.json` - Company metadata
   - `pitch-deck.md` - Full pitch deck
   - `financials.md` - Financial details
4. Refresh browser → New company appears automatically

### File Structure

Each company folder needs:
```
my-company-name/
├── deal.json           # Required: Metadata and metrics
├── pitch-deck.md       # Required: Full pitch deck content
└── financials.md       # Optional: Financial details
```

See `data/demo/_README.md` for file format details.

---

## 🔍 How Memory Works

### What Gets Learned

1. **Investment Thesis** (Explicit)
   - When you state: "I focus on Series A enterprise SaaS"
   - Claude remembers: Stages, sectors, check sizes

2. **Red Flags** (Implicit & Explicit)
   - When you pass on deals with >30% customer concentration
   - Claude learns this is a red flag for you

3. **Memo Preferences** (Behavioral)
   - If you prefer direct memos starting with exec summary
   - Claude adapts writing style automatically

4. **Deal History** (Outcomes)
   - Tracks pass/invest decisions
   - References similar past deals

### Where It's Stored

- **Location:** Browser localStorage (on your machine)
- **Privacy:** Never leaves your computer
- **Control:** View/edit/delete any memory in the Memory Panel

---

## 🔧 Troubleshooting

### "I don't see my company"

**Check:**
- Folder has all 3 required files (deal.json, pitch-deck.md, financials.md)
- File names are exact (lowercase, dash-separated)
- Refresh the browser

**Fix:** Compare your folder to `data/demo/acme-ai/`

### "Memory not saving"

**Check:** Browser allows localStorage
**Fix:** Try a different browser (Chrome, Firefox, Safari)

### "API Error: Invalid API Key"

**Check:**
- `.env.local` file exists (not `.env.example`)
- API key starts with `sk-ant-`
- No extra spaces in the key

**Fix:** Re-copy API key from [console.anthropic.com](https://console.anthropic.com/)

### "App won't start"

```bash
# Check Node.js version (need 18+)
node --version

# If version < 18, install from nodejs.org

# Try clean reinstall
rm -rf node_modules .next
npm install
npm run dev
```

---

## 🤝 Sharing with Your Team

To share memory with colleagues:

1. **Export Memory**
   - Future feature: Export memory as JSON file
   - Currently: Memory stays local per browser

2. **Share Setup**
   - Share this repository
   - Each person runs their own instance
   - Each builds their own memory

---

## 🔒 Privacy & Security

**Current Setup (Development):**
- ✅ All data stored locally (browser localStorage)
- ✅ Only API calls go to Anthropic (for AI responses)
- ✅ Company files never leave your machine
- ⚠️ Not encrypted (don't use for highly sensitive data yet)

**For Production Use:**
- Add authentication
- Encrypt sensitive data
- Set up team access controls
- Deploy with proper security

---

## 📚 Next Steps

1. **Try the Guided Tour** (right panel in the app)
2. **Add your first real company**
3. **Have 3-5 conversations** to build memory
4. **Export and backup your memory** (coming soon)

---

## ❓ Common Questions

**Q: Can I use this for other use cases besides VC?**
A: Yes! The template works for any decision-making workflow. Just modify the prompts and company data structure.

**Q: How much does it cost?**
A: You need an Anthropic API key. Pricing is pay-per-use (typically $0.01-0.10 per conversation).

**Q: Can multiple people share the same memory?**
A: Currently no (localStorage is per-browser). Team features coming in future versions.

**Q: Is my data secure?**
A: Your company files stay on your machine. Only your questions and Claude's responses go to Anthropic's API (encrypted in transit).

---

## 🆘 Need Help?

- **File Format:** See `data/demo/_README.md`
- **Architecture:** See main `README.md`
- **Issues:** [GitHub Issues](https://github.com/USERNAME/cowork-memory-demo/issues)

---

**Happy investing! 🚀**
