# Minecraft Texture Pack Creator — Technical Specification & Implementation Plan

## 1. Overview

A fully client-side, browser-based Minecraft resource-pack builder that lets users
browse Minecraft's texture namespace, author/replace textures on a pixel canvas,
manage `pack.mcmeta` + metadata, preview results, and export a valid `.zip`
resource pack — all with **no backend**.

It is integrated into the existing Jekyll site (`toolsvault`) as a new tool page in
the `Minecraft` category, reusing the site's `.tui` design system and `tool` layout
so it matches the rest of the site and deploys unchanged to GitHub Pages.

---

## 2. Current Architecture (what we must fit into)

| Concern | Existing pattern |
|---|---|
| Site generator | Jekyll (`_config.yml`), `baseurl: ""`, `url: https://www.toolsvault.org` |
| Tool collection | `_tools/*.md` with front matter `title/description/tags/category`. `category: "Minecraft"` already exists (`minecraft-skin-viewer.md`, `minecraft-server-status.md`, etc.) |
| Tool layout | `layout: tool` → `_layouts/tool.html` (renders header/footer, shares `assets/css/main.css`, loads `assets/js/tools.js`) |
| Tool UI system | `.tui` CSS block in `assets/css/main.css` (`.tui`, `.row`, `.tabs`, `.tab`, `.panel`, `.btn`, `.btn-primary`, `.result`, `.msg`, etc.) |
| In-page tool example | `_tools/minecraft-skin-viewer.md` — raw HTML + `<script>` inside a `.tui` div |
| Deployment | GitHub Pages (build via Jekyll) + Cloudflare worker routing (subdomains → `/tools/<sub>/`) |
| Assets | All referenced with absolute/root paths (`/assets/...`) — fine for GitHub Pages since `baseurl` is empty |
| JS libs already bundled | `assets/js/js-yaml.min.js`, `marked.min.js`, `qrcode.min.js`, `tools.js` |

**Key constraint:** the existing tools are plain `.md` pages with inline HTML+JS.
To stay consistent and keep it deployable with zero build tooling, the texture-pack
creator is implemented the same way but as a **larger, self-contained feature** with
dedicated asset files.

---

## 3. Functional Requirements

### 3.1 Core functionality (UI for upload, edit, organize)
- **Namespace browser / file tree**: a left sidebar listing the standard Minecraft
  texture paths (`assets/minecraft/textures/block/...`, `item/...`,
  `entity/...`, `gui/...`, `model/...`, `font/...`, etc.). Clicking a node selects
  the target texture slot.
- **Upload**: drag-and-drop or file picker to import an image into a selected slot.
  Accepts PNG (16×16 / 32×32 / 64×64 — any power-of-two). Auto-detects dimensions.
- **New from blank**: create an empty canvas at a chosen resolution.
- **Pixel editor**: HTML `<canvas>` with:
  - pencil / eraser / fill (bucket) / eyedropper / rectangle / line tools
  - adjustable brush size, foreground + background color, recent palette
  - zoom & pan, grid overlay toggle, "pixelated" rendering
  - undo / redo history stack
- **Organize**: rename slots, delete slots, search/filter the tree, bulk import a
  folder of PNGs (mapped to slots by filename), reorder/duplicate.

### 3.2 Preview
- **Block/item preview**: render the edited texture on a representative 3D-ish block
  / item swatch (CSS transform, no WebGL required) using the canvas pixels.
- **Pack overview panel**: list of all added textures with thumbnails and
  "missing vanilla" warnings.
- **Live pack.mcmeta editor**: fields for `pack.format` (version dropdown, e.g. 1.21 → 34),
  `description` (supports mini styling), and a JSON validation readout.

### 3.3 Export
- **Download `.zip`**: produce a valid resource pack:
  ```
  <pack_name>/
    pack.mcmeta
    pack.png            (optional generated icon)
    assets/minecraft/textures/.../<file>.png
    assets/minecraft/.../<other>.png
  ```
  - `pack.mcmeta` generated from the form (correct `pack.format` int).
  - Optional auto-generated `pack.png` from a chosen canvas (16×16 → 64×64, nearest-neighbor).
  - Filename sanitized; `.zip` served via `Blob` + object URL (no network).
- **Export `pack.mcmeta` only** and **Export manifest JSON** as secondary utilities.
- **Import existing pack** (unzip in-browser) to continue editing — optional Phase 2.

### 3.4 Technical compatibility
- **No server**: 100% client-side. Uses Web APIs: Canvas 2D, `Blob`, `URL.createObjectURL`,
  `FileReader`, optionally `DecompressionStream`/a tiny zip writer.
- **Zip without dependencies**: implement a minimal STORE (no compression) ZIP encoder
  in plain JS (ZIP local-file + central-directory format with CRC-32). This avoids
  adding JSZip and keeps the bundle dependency-free and Pages-friendly. (If preferred,
  vendor `jszip.min.js` into `assets/js/`.)
- **Relative/root paths**: page is a Jekyll tool at `/tools/minecraft-texture-pack-creator/`;
  all script/style refs use `/assets/...` (consistent with site; works on Pages & CF worker).
- **Persistence (optional)**: autosave project to `localStorage` so work survives reloads.

### 3.5 Integration / UX
- Page front matter: `category: "Minecraft"`, tags `minecraft, texture, resource-pack, editor`,
  `icon: "&#127959;"`. It then auto-appears on `/games/` (Minecraft section) and `/tools/`.
- Wrap UI in `<div class="tui">` and reuse `.tabs/.tab/.panel/.btn/.row` classes so it
  looks native. Add only a small, scoped CSS block (`.tpc-*`) in `assets/css/main.css`
  for the canvas/sidebar, themed with existing CSS variables (`--bg`, `--bg-elev`,
  `--border`, `--accent`, `--text`, `--text-dim`, `--danger`).
- Dark/light theme respected automatically (inherits `data-theme` from layout).
- Responsive: sidebar collapses under the canvas on narrow screens (≤768px).

---

## 4. File-by-File Implementation Plan (AS BUILT)

> Implementation note: rather than appending a large block to the shared `main.css`,
> the tool ships a **separate scoped stylesheet** `assets/css/tpc.css` (injected at
> runtime from `tpc.js`) to avoid touching the global design system. Everything else
> follows the plan.

### 4.1 New tool page — `_tools/minecraft-texture-pack-creator.md`
```yaml
---
title: "Minecraft Texture Pack Creator"
link: "/tools/minecraft-texture-pack-creator/"
description: "Design, edit, preview, and export Minecraft resource-pack textures in your browser."
tags:
  - minecraft
  - texture
  - resource-pack
  - editor
  - zip
category: "Minecraft"
icon: "&#127959;"
---
```
Body = `<div class="tui">` shell with:
- `.tabs` → **Editor**, **Browser/Upload**, **Preview**, **Export** panels.
- Links to `assets/js/tpc.js` (and `assets/js/zip-writer.js` if separate).

### 4.2 New CSS — `assets/css/tpc.css` (scoped `.tpc-*` rules)
Reuses existing CSS variables (`--bg`, `--bg-elev`, `--border`, `--accent`,
`--text`, `--text-dim`, `--danger`) for theme parity. Covers the editor layout
(sidebar + canvas stage + grid overlay), toolbar, color swatches, dropzone,
file-list cards, preview grid (3D-tilted swatches), and the export panel.
Responsive collapse at ≤768px. The grid is a non-destructive CSS overlay
(`.tpc-grid-overlay`) so it never bakes into exported pixels.

### 4.3 New JS — `assets/js/zip-writer.js` (minimal ZIP/CRC32)
- `crc32(bytes)` table-based.
- `createZip(files)` where `files = [{name, data:Uint8Array}]` → returns `Blob`
  (`application/zip`) with STORE method + correct local headers, data descriptors,
  central directory, and end-of-central-directory record. UTF-8 filename flag set.
- Exposes `window.TpcZip = { createZip, crc32 }`.
- **Validated** with Python's `zipfile`: `testzip()` returns `None`, names and
  byte contents match, CRC-32 correct.

### 4.4 New JS — `assets/js/tpc.js` (app logic)
IIFE; loads `tpc.css`, then on init builds the namespace tree and wires UI.
- **State**: `project = { name, format, description, files: Map<path, {canvas}> }`.
- **Tree**: static manifest (`CATEGORIES`) of common Minecraft slots rendered as
  nodes; search filter; "has"/"active" indicators.
- **Editor**: Canvas 2D tool state machine — pencil, eraser, fill (flood),
  eyedropper, line, rectangle. Brush size, zoom, non-destructive grid overlay,
  color picker + recent swatches, undo/redo (`ImageData` stack, capped 40).
  Shape tools use a pre-drag snapshot restored on each `pointermove` for live preview.
- **Upload**: drag-drop + file picker → selected slot; power-of-two / square warning.
  Folder import (`webkitdirectory`) maps files into `assets/minecraft/…`.
  "+ New blank texture" creates a custom slot.
- **Preview**: tilted swatch grid of all added textures.
- **Export**: builds `pack.mcmeta` from the form, optional 64×64 `pack.png` icon
  (nearest-neighbor from a chosen slot), every texture as PNG bytes → `TpcZip.createZip`
  → `Blob` → object-URL download. Also "Download pack.mcmeta only".
- **Keyboard**: Ctrl+Z/Y undo/redo; B/E/G/I tool shortcuts (ignored in inputs).

### 4.5 (Optional Phase 2) `assets/js/unzip-reader.js`
Minimal STORE/DEFLATE reader to re-import an existing pack. DEFLATE needs
`DecompressionStream('deflate-raw')` (widely supported in 2026); skip if unavailable.

---

## 5. Minecraft correctness details
- `pack.mcmeta` schema:
  ```json
  { "pack": { "pack_format": 34, "description": "My Pack" } }
  ```
  Provide a `pack_format` dropdown keyed to recent versions (e.g. 1.20.5–1.20.6 → 32,
  1.21 → 34, 1.21.2–1.21.4 → 42, 1.21.5+ → 48) with a note to adjust for the user's version.
- Textures must remain **power-of-two** PNGs (Minecraft requirement). Warn on non-conforming sizes.
- `pack.png` is optional but recommended; generate 64×64 nearest-neighbor from a chosen slot.
- Keep paths lowercase per Minecraft convention; surface a warning for uppercase/spaces.

---

## 6. Build, Deploy & Verification
1. **Local preview** (matches Pages exactly):
   ```
   bundle exec jekyll serve   # or: jekyll serve
   ```
   Then open `http://localhost:4000/tools/minecraft-texture-pack-creator/`.
   (`Gemfile` already present; repo uses the standard Jekyll plugin set.)
2. **Checks**:
   - Tool appears under **Games → Minecraft** and **Tools** listings automatically.
   - Upload a PNG → edit pixels → fill → undo/redo → export `.zip`.
   - Unzip the export: confirm `pack.mcmeta` valid JSON, `assets/minecraft/textures/...`
     structure correct, opens in Minecraft as a resource pack.
   - Verify on a mobile width (sidebar collapses; canvas still usable).
   - Confirm theme toggle (dark/light) applies to the editor.
3. **Deploy**: push to `main`; GitHub Pages builds via Jekyll. No CF-worker change
   needed — `/tools/minecraft-texture-pack-creator/` is already routed by the existing
   `cloudflare-worker.js` `rootPrefixes` (`/tools/`).

---

## 7. Risk / Notes
- **Bundle size**: keep `tpc.js` vanilla; no framework. Editor is the only heavy piece.
- **Memory**: cap undo stack and thumbnail count; revoke object URLs after download.
- **DEFLATE import** is optional; STORE export is universally compatible with Minecraft.
- **`baseurl`**: stays `""`, so root-absolute asset paths are correct on both Pages and
  the Cloudflare subdomain mount — no changes required there.

---

## 8. Suggested task breakdown
1. Scaffold `_tools/minecraft-texture-pack-creator.md` (front matter + `.tui` tabs shell).
2. Add `.tpc-*` CSS to `assets/css/main.css`.
3. Implement `assets/js/zip-writer.js` (CRC32 + STORE zip) + unit-smoke test via download.
4. Implement editor canvas + tools + undo/redo (`tpc.js`).
5. Implement tree/upload/bulk-import + preview + `pack.mcmeta` editor.
6. Wire export → zip → download; generate `pack.png`.
7. (Optional) localStorage autosave; (Phase 2) pack import/unzip.
8. `jekyll serve` verification + Minecraft in-game pack load test.
