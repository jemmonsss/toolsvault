# ToolsVault

A modular Jekyll-based tool vault for developers.

## How to Add a Tool

1. Copy `_tools/example.md` to `_tools/your-tool.md`
2. Edit the frontmatter fields (`title`, `link`, `description`, `tags`, `category`)
3. Commit and push

## Local Development

```bash
bundle install
bundle exec jekyll serve
```

Then open `http://localhost:4000`.

## Deployment

This site is configured to deploy via GitHub Actions to GitHub Pages. Ensure GitHub Pages is set to use the GitHub Actions workflow in repository settings.

## Custom Domain

DNS should point `toolsvault.org` to GitHub Pages using an ALIAS, ANAME, or A record.

## Free 3D Printing Workshop

Open `/printing/` for five standalone, browser-based STL generators:

- **Custom Organizer Builder** — one-piece trays with sized compartments and dividers.
- **Photo Lithophane Maker** — flat or curved lithophanes from locally selected images.
- **Logo & Cookie Cutter Studio** — image-to-STL signs, embossing plates and silhouette cutters.
- **Threaded Bolt & Nut Factory** — custom helical printable profiles and matching clearance-adjusted nuts.
- **Name & Keychain Maker** — raised text tags, rounded corners and optional ring holes.

Each generator creates a **real binary STL** in millimeters. No server calls, ads-as-unlocks, membership, cloud AI dependency or paid export step. The existing 3D Model Studio, filament calculator and G-code analyzer remain available as extras.

Run `node scripts/test_print_forge.js` to validate the geometry and binary STL contracts, and `ruby scripts/check_site.rb source` to validate the site. All generated models should be checked in a slicer before printing. Printed fasteners are **not** safety-rated.
