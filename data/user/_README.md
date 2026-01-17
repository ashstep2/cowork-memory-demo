# Your Companies

This folder is for **your real company data**.

## Quick Start

1. Copy a demo company folder from `../demo/acme-ai/`
2. Rename it to your company name (e.g., `my-portfolio-co/`)
3. Edit all 3 files:
   - `deal.json` - Company metadata and metrics
   - `pitch-deck.md` - Full pitch deck
   - `financials.md` - Financial details

## Folder Structure

```
data/user/
└── my-company-name/
    ├── deal.json           # Required
    ├── pitch-deck.md       # Required
    └── financials.md       # Optional
```

## Privacy

- Files in this folder are **gitignored** by default
- Your company data stays private on your machine
- Never committed to version control

## Priority

User files take priority over demo files:
- If you have `data/user/acme-ai/`, it overrides `data/demo/acme-ai/`
- Allows you to keep demos while working with real data

## File Format

See `../demo/_README.md` for detailed file format documentation.

## Example

```bash
# Copy a demo company
cp -r ../demo/acme-ai ./my-startup

# Edit the files
# (Use any text editor - VS Code, Sublime, even Notepad!)

# Refresh the app
# Your company appears in the deal list
```

## Need Help?

See full documentation in `docs/VC_QUICK_START.md`
