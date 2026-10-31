# ToolsVault: Free 3D Printing Tools + Minecraft Seed Map update

## Added

- Dedicated `/printing/` landing page, home-page tile, navigation item, and an automatic **3D Printing** filter/category in All Tools.
- `/tools/3d-model-studio/`: local STL (binary/ASCII) and OBJ parsing; interactive 3D preview using WebGL with a 2D fallback; model size, face count, surface area, volume and edge checks; rotations, uniform scaling, printable-bed dimensions, degenerate-face cleanup, and binary STL export.
- `/tools/filament-calculator/`: box-shell approximation of plastic volume, filament grams and length, material cost, and minimum extrusion time, with common filament densities and customizable inputs.
- `/tools/gcode-analyzer/`: local G-code parsing with extrusion and layer counts, print bounds, idealized movement-time estimate, filament mass and cost, and downloadable CSV report.
- All three tools run on the visitor's device, with no signup, payment, upload service, or paid feature toggles.

## Minecraft changes

- New 64-bit Java numeric seed parsing and Java-compatible text-seed hashing.
- Verified Java slime-chunk calculation using the same 48-bit RNG as Minecraft Java.
- Fixed world/pixel coordinate transforms; pan, pointer-centered wheel zoom, buttons and controls; coordinate jumps; minimap; download PNG with overlays; and shareable URL state.
- Deterministic Java region placement candidates for supported structures, with version and dimension filters. Candidate placement **does not** verify biome restrictions, structure exclusions or terrain requirements.
- Clearly labeled illustrative terrain colors; the colors are **not actual Minecraft biome predictions**.

## Known limitations / next step for Chunkbase parity

The current seed explorer is **not a Chunkbase-equivalent authoritative world generation map**. Genuine Java biome and terrain generation, per-structure viability validation, reliable stronghold location, and full cross-version support require integrating a Minecraft world generation engine such as the open-source MIT-licensed `cubiomes` library compiled to WebAssembly. That WASM engine is not included in this release. The seed map explicitly avoids claiming approximate biome colors are genuine Minecraft biome data. Bedrock Edition is not supported.

The 3D tools are for inspection and estimation; they do not generate machine-ready sliced G-code. Automatic topology repair is limited to removal of degenerate triangles. Material and time estimates are not slicer-grade estimates.

## Deployment

This is a Jekyll static site. Replace your existing repository contents with the files from the ZIP (or copy the modified files), commit, and let your existing GitHub Pages workflow build and publish. No new server dependencies, API keys, paid accounts or npm packages are required. A source/frontmatter validation can be run with `ruby scripts/check_site.rb source`.
