# Your Companies

Add your own portfolio companies here. Files in this folder are **gitignored** and stay private.

## Quick Start

```bash
# Copy a demo company
cp -r ../demo/humanloop ./my-company-name

# Edit the 3 files with your data
# - deal.json (metrics and metadata)
# - pitch-deck.md (full pitch deck)
# - financials.md (financial details)

# Refresh the app → Your company appears
```

## Folder Structure

```
data/user/
└── my-company-name/
    ├── deal.json           # Required
    ├── pitch-deck.md       # Required
    └── financials.md       # Optional
```

## File Format

See [SETUP.md](../../SETUP.md) in the root folder for detailed file format and examples.

## Privacy

- All files here are **gitignored** by default
- Your data never gets committed to version control
- Company data stays on your machine

## Priority

User files override demo files:
- `data/user/acme/` takes priority over `data/demo/acme/`
- Customize without modifying demo files
