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

Open `/printing/` for the free, browser-based 3D printing workshop (including 3MF separation and pegboard builders):

- **Custom Organizer Builder** — one-piece trays with sized compartments and dividers.
- **Photo Lithophane Maker** — flat or curved lithophanes from locally selected images.
- **Logo & Cookie Cutter Studio** — image-to-STL signs, embossing plates and silhouette cutters.
- **Threaded Bolt & Nut Factory** — custom helical printable profiles and matching clearance-adjusted nuts.
- **Name & Keychain Maker** — raised text tags, rounded corners and optional ring holes.

Each generator creates **real binary STL** files in millimeters. The 3MF Color Separator exports STL files only for independently closed color-material solids and refuses to export non-printable color surfaces. No server calls, ads-as-unlocks, membership, cloud AI dependency or paid export step. The existing 3D Model Studio, filament calculator and G-code analyzer remain available as extras.

Run `node scripts/test_print_forge.js` to validate the geometry and binary STL contracts, and `ruby scripts/check_site.rb source` to validate the site. All generated models should be checked in a slicer before printing. Printed fasteners are **not** safety-rated.

### 3MF Color Separator & Pegboard Tests

- `node scripts/test_pegboard.js` generates hook, rack, tray and panel binary STLs.
- `python scripts/make_3mf_color_fixtures.py` regenerates a two-color 3MF, a transformed/centimeter-components 3MF, and a negative painted-shell fixture.
- Browser testing should confirm proper 3MF ZIP extraction, color groups and aligned STL exports, and that open surface-paint-only colors remain unexportable.
- See `/printing/roadmap/` for prioritized new tools and validation criteria.
