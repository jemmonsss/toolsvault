---
permalink: /printing/roadmap/
title: "Free 3D Printing Tool Roadmap"
description: "Planned ToolsVault 3D workshop tools, prioritized by usefulness, engineering effort and reliability checks."
---
<div class="container">
<div class="hero"><h1>3D Printing Workshop Roadmap</h1><p>A realistic plan for tools people come back to use. Everything on the roadmap is intended to be free, with useful local exports and no paid unlocks.</p><p><a class="btn btn-secondary" href="/printing/">Back to all 3D tools</a></p></div>

## Available now

**3MF Color & Material Separator:** Separate already-independent, closed 3MF color bodies into aligned STL parts. Supports Core base materials/color groups, not painted-color surface-to-volume reconstruction.

**Pegboard & Wall Mount Factory:** Generate STL hooks, tool racks, small trays, and hole-pattern panels. Adjustable pegboard pitch, hole diameter, board thickness, fit clearance and dimensions.

The existing workshop also includes gears, pulleys, lightboxes, molds, filament-change art, modular flexi toys, lithophanes, nameplates, cookie cutters, fasteners and organizer trays.

## Completed in this update

| Tool | Current shipped functionality | Known limitation |
|---|---|---|
| **Low-Filament Modular Cable Protector** | Thin vented snap-on sleeves, repeatable sliding male/female ends, material estimates | Friction fit only; not certified strain relief |
| **Fit & Tolerance Test Kit** | Six stepped nominal hole/peg pairs on a printable coupon | Print and measure before relying on dimensions |
| **Wall Mount & Bracket Builder** | L-bracket, two hardware holes, optional gussets | Not engineered or load-rated |
| **Cable Gland & Panel Cutout Maker** | Solid or slit side-entry grommets for a measured hole | Not IP-rated, not sealed or electrical-certified |
| **Precision SVG-to-STL Extruder** | Filled SVG shapes rasterized locally and extruded as 3D solids | Very small details depend on sample resolution |
| **Interlocking Drawer Divider Builder** | Two complementary slotted pieces, a ZIP kit or a custom open-top bin | Uniform grid layout only; not a complete bin generator |
| **STL to Print-in-Place Flexi Converter** | Elongated uploaded mesh projected to a print-in-place segmented **relief** with captive pivots | Not full 3D geometry-preserving: overhangs/cavities are flattened |

## Next improvements worth planning

1. **Full arbitrary-mesh flexi conversion:** Robust mesh cuts, hull reconstruction, collision testing, and auto-oriented articulated joints without losing the source model's 3D surfaces.
2. **Real bulkhead cable glands:** Customizable threads and compression nuts with gasket drawings and material testing (not self-declared IP ratings).
3. **Modular cable link locking:** Optional verified detent or flexible snap with clearance test prints.
4. **Curved and multi-sized drawer dividers:** Measured templates for odd-shaped drawers, anti-slip mounts and clearance testing.
5. **STL splitting & magnet pockets:** Real boolean cuts with automatically verified manifold results.

## Later: technically demanding but valuable

| Tool | Why it's valuable | Main hard problem |
|---|---|---|
| **Oversize STL Splitter with dowels** | Slice props, helmets and statues to printer size and add aligning joints | Reliable watertight mesh cuts and boolean connectors |
| **Raised / Engraved Text on Uploaded STL** | Put personalized names and labels on existing models | Robust union/difference of arbitrary triangle meshes |
| **Snap-Fit & Living Hinge Designer** | Generate reusable connectors and printable catches | Realistic flexure/material clearance predictions; physical testing |
| **Arbitrary STL Mold Builder** | Turn an uploaded custom part into casting-mold halves | Undercuts, parting lines, vents, boolean cavity geometry |
| **Resin Hollowing & Drainage** | Make hollow resin-safe shells with drain holes | Offset-surface robustness, trapped-resin / suction safety |
| **Advanced 3MF Painted-Color Reconstruction** | Separate differently colored surfaces even when they don't have separate solid geometry | Rebuilding internal partitions without intersecting or open shells; supports slicer-specific painting extensions |

## Principles before release

1. **Real exports first.** Controls must produce STL/3MF/SVG or other genuine output, not just a preview.
2. **Test against actual files.** Check ZIP/file validity, mesh closure, normals, positive volume, units, and printable dimensions.
3. **Never advertise unreliable geometry as printable.** Reject unsupported input or clearly identify limitations, with recovery tips.
4. **Run locally whenever possible.** No login, subscriptions, AI credit limits or locked download buttons.
5. **Promote the tools people use repeatedly.** Support repair, personalization, workshop organization and measured replacement parts before novelty generators.

<p class="print-note"><strong>Roadmap, not a delivery promise.</strong> Feature order may change after testing real files and identifying user demand. Nothing on this page claims future tools are already implemented.</p>
</div>
<link rel="stylesheet" href="{{ '/assets/css/printing.css' | relative_url }}">
