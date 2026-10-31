# Advanced 3D Printing Workshop — free generators

New self-contained tools under **3D Printing** and `/tools/forge-*/`. Everything runs in the browser without a login, backend service, subscription or paid export. STL files are binary, units are millimeters.

## Added tools

- `/tools/forge-gear/` — Spur gears using a 20° nominal pressure-angle involute flank, or generic toothed pulley with optional printed flanges. Set bore, tooth count, pitch/module, and part width. The generic pulley is **not** an exact commercial belt-profile clone; verify drive fit and backlash.
- `/tools/forge-lightbox/` — Create text/logo sign face and a matching LED housing with corner stops, clearance for the panel, and a cable pass-through. Download either STL or both with notes in a ZIP. Use only appropriate low-voltage LED strips; adhesive/tape may be needed to retain the face.
- `/tools/forge-mold/` — Generate two-part casting/cavity halves for simple sphere, puck, or shallow-domed shapes. One half has alignment pins; the other has matching clearance holes. Both have pour/vent channels. **Not a general-purpose imported-STL boolean mold editor** and not intended for hot or pressurized molding.
- `/tools/forge-color-art/` — Image-to-tonal-layer relief in 2–5 grayscale buckets with user-specified filament labels. Download STL and layer-change instructions as ZIP. Filament changes are done **in the slicer** at the listed Z heights. This is not full-color hue reproduction.
- `/tools/forge-flexi/` — Configurable **assembly-required** articulated toy/snake kit: head, tail, mid-link and pins as separate printable STLs. Print selected quantities shown on the page; overlap hinge holes in stacked segments and secure the pins mechanically or with appropriate adhesive. **Not print-in-place.** Small components may be hazardous to children.

## Quality checks performed

1. Existing ToolsVault static-source and front-matter validation.
2. Node.js generator tests for 13 sample models including alternative pulley and mold shapes.
3. Browser interaction tests in Chromium, including photo upload and real downloads for all five tools.
4. Browser-generated ZIPs were checked for CRC and expected STL names.
5. Sample downloaded STL files in each ZIP were reloaded with an independent mesh parser and checked for watertightness, winding consistency, and positive volume.

These are software/mesh checks, **not physical print qualification**. Real prints depend on printer, filament, tolerances, slicer settings, mechanical loading, and fit.

## Developer checks

```bash
ruby scripts/check_site.rb frontmatter
ruby scripts/check_site.rb source
node scripts/test_print_forge.js
node scripts/test_print_forge_extra.js
```

The original workshop and Minecraft seed map tools remain in the project.
