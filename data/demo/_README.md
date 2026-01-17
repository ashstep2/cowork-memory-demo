# Demo Companies

This folder contains **3 pre-populated demo companies** to showcase the system.

## Demo Companies

1. **Acme AI** - Strong Series A deal (good investment)
2. **Quantum Labs** - Borderline Seed deal (requires analysis)
3. **GreenTech Inc** - Pre-revenue with red flags (likely pass)

## Using Your Own Companies

### Option A: Replace Demo Files
1. Navigate to any company folder (e.g., `acme-ai/`)
2. Edit `deal.json`, `pitch-deck.md`, and `financials.md`
3. Refresh the app - changes appear immediately

### Option B: Add to `data/user/`
1. Copy a demo folder to `../user/your-company-name/`
2. Edit the 3 files with your data
3. User files take priority over demo files

## File Structure

Each company folder must contain:
- `deal.json` - Metadata and metrics (required)
- `pitch-deck.md` - Full pitch deck content (required)
- `financials.md` - Financial details (optional but recommended)

## File Format: deal.json

```json
{
  "company": "Company Name",
  "tagline": "One-line description",
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
    "existingInvestors": ["VC Firm 1", "VC Firm 2"]
  },
  "team": {
    "ceo": {
      "name": "CEO Name",
      "role": "CEO & Co-Founder",
      "background": "Ex-Company, School"
    },
    "cto": {
      "name": "CTO Name",
      "role": "CTO & Co-Founder",
      "background": "Ex-Company, School"
    },
    "employees": 28
  }
}
```

## Tips

- Keep Markdown files well-formatted for readability
- Use actual deal data when available
- The `_isDemo` flag is automatically added to demo files
- Folder name becomes the deal ID
