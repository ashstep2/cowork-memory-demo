# Setup Guide

Complete instructions for deploying and customizing the Cowork Memory Demo.

---

## 🚀 Deployment Options

### Option 1: Vercel

**Time:** 1 minute | **Difficulty:** Easy

1. Click the deploy button:

   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ashstep2/cowork-memory-demo&env=ANTHROPIC_API_KEY&envDescription=Get%20your%20API%20key%20from%20Anthropic%20Console&envLink=https://console.anthropic.com)

2. Sign in to Vercel (GitHub account recommended)

3. Enter your **Anthropic API Key**:
   - Get one at [console.anthropic.com](https://console.anthropic.com/)
   - Click "Get API Key" → Copy the key (starts with `sk-ant-`)
   - Paste into the `ANTHROPIC_API_KEY` field

4. Click **Deploy**

5. Wait 1-2 minutes → Your app is live!

**Your URL:** `https://your-project-name.vercel.app`

---

### Option 2: Local Development

**Time:** 5 minutes | **Difficulty:** Requires terminal

#### Prerequisites

- **Anthropic API Key** ([Get one](https://console.anthropic.com/))

#### Steps

```bash
# 1. Clone the repository
git clone https://github.com/ashstep2/cowork-memory-demo.git
cd cowork-memory-demo

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local

# 4. Edit .env.local (use any text editor)
# Replace: ANTHROPIC_API_KEY=your_api_key_here
# With: ANTHROPIC_API_KEY=sk-ant-your-actual-key

# 5. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Adding Your Own Companies

The app uses a **file-based system** — no database, no code changes required.

### Folder Structure

```
data/
├── demo/                      # Pre-loaded demo companies (for Anthropic Strategic Labs)
│   ├── humanloop/
│   │   ├── deal.json          # Company metadata and metrics
│   │   ├── pitch-deck.md      # Full pitch deck content
│   │   └── financials.md      # Financial details
│   ├── langchain/
│   │   ├── deal.json
│   │   ├── pitch-deck.md
│   │   └── financials.md
│   └── bun/
│       ├── deal.json
│       ├── pitch-deck.md
│       └── financials.md
│
└── user/                      # Your companies (gitignored, stays private)
    ├── _README.md             # Instructions for adding companies
    └── your-company-name/     # Add your companies here
        ├── deal.json          # Required: Company metadata and metrics
        ├── pitch-deck.md      # Required: Full pitch deck content
        └── financials.md      # Optional: Financial details
```

### Quick Start: Add a Company

**Method 1: Copy a Demo Company**

```bash
# Navigate to the project folder
cd cowork-memory-demo

# Copy a demo company to the user folder
cp -r data/demo/humanloop data/user/my-startup

# Edit the files in data/user/my-startup/
# - deal.json (company metrics)
# - pitch-deck.md (pitch deck)
# - financials.md (financial details)

# Refresh the app → Your company appears!
```

**Method 2: Start from Scratch**

1. Create folder: `data/user/my-company-name/`
2. Add 3 files (see format below)
3. Refresh the app

---

## 📄 File Formats

### `deal.json` (Required)

Company metadata and metrics. Must be valid JSON. (A later iteration can expand this feature to be agnostic of format with a drag-and-drop interface, making it even easier for non-technical users).

```json
{
  "company": "Acme AI",
  "tagline": "AI-powered workflow automation for enterprises",
  "stage": "Series A",
  "sector": "Enterprise SaaS",
  "metrics": {
    "arr": 4500000,
    "mrr": 375000,
    "growthMoM": 0.18,
    "burnMonthly": 420000,
    "runwayMonths": 22,
    "customers": 340,
    "topCustomerPct": 0.12,
    "grossMargin": 0.82,
    "nrr": 1.28
  },
  "funding": {
    "raising": 15000000,
    "preMoney": 75000000,
    "lead": "Seeking",
    "existingInvestors": ["VC Firm A", "VC Firm B"]
  },
  "team": {
    "ceo": {
      "name": "Jane Doe",
      "role": "CEO & Co-Founder",
      "background": "Ex-Salesforce, Stanford MBA"
    },
    "cto": {
      "name": "John Smith",
      "role": "CTO & Co-Founder",
      "background": "Ex-Google, MIT CS"
    },
    "employees": 28
  }
}
```

**Field Explanations:**

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `arr` | Number | Annual Recurring Revenue (USD) | `4500000` |
| `mrr` | Number | Monthly Recurring Revenue (USD) | `375000` |
| `growthMoM` | Number | Month-over-month growth (decimal) | `0.18` = 18% |
| `burnMonthly` | Number | Monthly cash burn (USD) | `420000` |
| `runwayMonths` | Number | Months of runway remaining | `22` |
| `customers` | Number | Total paying customers | `340` |
| `topCustomerPct` | Number | Revenue from top customer (decimal) | `0.12` = 12% |
| `grossMargin` | Number | Gross margin (decimal) | `0.82` = 82% |
| `nrr` | Number | Net Revenue Retention (decimal) | `1.28` = 128% |

---

### `pitch-deck.md` (Required)

Full pitch deck content in Markdown format. Claude reads this to understand the company.

```markdown
# Acme AI - Pitch Deck

## Problem
Enterprises waste 40% of employee time on repetitive workflows...

## Solution
Acme AI automates complex business processes using AI agents...

## Market
$50B TAM in workflow automation...

## Traction
- 340 paying customers
- $4.5M ARR, growing 18% MoM
- 128% NRR (strong retention)

## Team
Jane Doe (CEO): Ex-Salesforce VP of Product
John Smith (CTO): Ex-Google, built ML systems at scale

## Ask
Raising $15M Series A at $75M pre-money
```

**Tips:**
- Use headings (`##`) to organize sections
- Include key metrics, team bios, traction
- Keep it concise but informative
- Claude will reference this when analyzing

---

### `financials.md` (Optional but Recommended)

Detailed financial information and strategic insights.

```markdown
# Acme AI - Financial Details

## Revenue & Growth
- **ARR**: $4.5M ($375K MRR)
- **Growth**: 18% MoM (490% annualized)
- **NRR**: 128% (strong upsell motion)

## Unit Economics
- **CAC**: $12K (PLG motion)
- **LTV**: $280K
- **LTV/CAC**: 23x (very strong)
- **Payback**: 4 months

## Burn & Runway
- **Monthly Burn**: $420K
- **Cash**: $9.2M
- **Runway**: 22 months (healthy)

## Strategic Insights
- 82% gross margin (software-only, no services)
- 12% customer concentration (low risk)
- Strong technical team (2 ex-FAANG engineers)
```

---

## 🔧 Customization

### Changing Demo Companies

To replace the default demo companies (Humanloop, LangChain, Bun):

1. Navigate to `data/demo/`
2. Delete or rename existing folders
3. Add your own companies (same format as above)
4. Refresh the app

**Note:** Demo companies are committed to Git (for the public demo). User companies in `data/user/` are gitignored.

---

### Priority System

If you have the same company in both folders:

```
data/demo/humanloop/       ← Original demo
data/user/humanloop/       ← Overrides demo
```

**User files always take priority.** This lets you customize demo companies without modifying the originals.

---

## 🎨 UI Customization
This has been designed to look like Claude Cowork. UI can be customized per VC or company.
### Update Branding

**File:** `app/page.tsx`

```typescript
// Line ~280: Change header title
<h1>Your Company Name</h1>

// Line ~356: Update footer link
<a href="https://your-github-repo">GitHub</a>
```

### Change Colors

**File:** `tailwind.config.ts`

```typescript
theme: {
  extend: {
    colors: {
      // Customize your brand colors
    }
  }
}
```

---

## 🧪 Testing Locally

### Test with Demo Companies

```bash
npm run dev
# Open http://localhost:3000
# Click on Humanloop, LangChain, or Bun
# Start chatting with Claude
```

### Test with Your Own Company

```bash
# Add a company to data/user/
cp -r data/demo/humanloop data/user/test-company

# Edit data/user/test-company/deal.json
# Change company name, metrics, etc.

# Refresh browser → Your company appears
```
---

## 🐛 Troubleshooting

### "Invalid API Key" Error

**Symptoms:** Error message when sending first message

**Fix:**
1. Check `.env.local` exists (not `.env.example`)
2. Verify key starts with `sk-ant-`
3. No extra spaces or quotes around the key
4. Restart dev server: `npm run dev`

### Company Not Appearing

**Symptoms:** Added company to `data/user/` but doesn't show up

**Fix:**
1. Verify folder structure:
   ```
   data/user/my-company/
   ├── deal.json       ✓
   ├── pitch-deck.md   ✓
   └── financials.md   ✓
   ```
2. Check `deal.json` is valid JSON (use [jsonlint.com](https://jsonlint.com/))
3. Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
4. Check browser console for errors

### Memory Not Saving

**Symptoms:** Memory resets on page refresh

**Fix:**
1. Check browser allows localStorage (incognito mode may block it)
2. Try a different browser (Chrome, Firefox, Safari)
3. Clear cache and cookies, then try again

### Build Errors

**Symptoms:** `npm run dev` fails or build errors

**Fix:**
```bash
# Check Node.js version (must be 18+)
node --version

# Clean install
rm -rf node_modules .next
npm install
npm run dev
```

---

##  ✅ Best Practices
- Use unique API keys per deployment
- Rotate API keys periodically
- Keep `data/user/` gitignored
- Use environment variables for secrets

---

*Last updated: January 2026*
