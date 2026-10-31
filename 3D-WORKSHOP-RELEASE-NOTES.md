# ToolsVault 3D Workshop — free modular fabrication update

This static Jekyll website is designed to run in visitors' browsers. The new tools require no account, paid API, external CAD server, or credits; models are downloaded as binary STL.

## Added

- **Modular cable sleeve / protector**: repeatable slide-coupled open-C sleeve sections, thin walls and optional material-saving vents. Adjust cable diameter, slit width, fit, link length, voxel resolution. The connection is friction-fit, NOT a positive latch or a safety-rated strain relief.
- **Fit & tolerance gauge**: six removable cylindrical pins and six independent precision polygonal-ring holes, with nominal total diametral clearances printed in the instructions. Model generation uses 192 angular segments (not voxel sizes that erase 0.1 mm differences).
- **L-bracket & wall-mount builder**: custom nominal hole diameters, dimensions, optional web gussets. Not structural or load rated.
- **Cable panel passthrough**: full and split grommet/bushing STLs, plus a 1:1 dimensioned circle SVG for measuring a panel hole. Not an IP-rated gland, watertight seal or certified electrical part.
- **SVG extruder**: local upload of filled SVG shapes with viewBox, rasterized and extruded into STL. Tiny features are limited by bitmap resolution.
- **Drawer divider / bin maker**: complementary half-slot long and short dividers in one ZIP kit with instructions, or a single open-top bin.
- **STL → print-in-place flexi**: user STL upload (binary/ASCII). Creates a flattened 2.5D relief from an elongated X-axis model, splits into sections and adds captive vertical pivots. Output is one STL with separate, jointed bodies. **It does not preserve the full arbitrary uploaded 3D surface**; underside cavities, holes and overhangs may disappear. Not every input is supported. Requires slicer inspection and first-layer tuning.
- Existing **classic assembled snake** maker was preserved at `/tools/forge-flexi-kit/`.

## Sample validation

Independent `trimesh` geometry checks on saved binary STL files: analytic gauge, modular cable sleeve (short/default/long), both divider orientations, open-top bin, L-bracket (with and without gussets), two panel fittings, filled SVG ring, and two imported-model flexi demonstrations. Samples were watertight, winding-consistent and had positive volume. Flexi export samples contained 5 and 7 separate watertight bodies respectively; the five-body sample had a measured minimum adjacent surface-vertex separation of 0.75 mm.

These are software/mesh tests, **not physical printer tests**. Fit, snap strength, hinge freedom, electrical suitability and durability require real prints and measurements. The Chromium browser harness was restricted by the execution environment, so full end-to-end browser interactions could not be confirmed here; JS syntax and generated file tests were run.

## Development notes

Sources: `assets/js/print-new-generators.js`, `assets/js/print-flexi-convert.js`, `assets/js/print-new-ui.js`. Page entry points: `_tools/forge-{cable,tolerance,bracket,passthrough,svg,divider,flexi}.md`. All original site sections and previously added 3D printing utilities are retained.
