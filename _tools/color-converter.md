---
title: "Color Converter"
link: "/tools/color-converter/"
description: "Convert between HEX, RGB, and HSL color formats."
tags:
  - color
  - converter
  - design
  - utilities
category: "Color & Design"
---
<div class="tool-container">
    <h1>Color Converter</h1>
    <p class="tool-subtitle">Convert between HEX, RGB, and HSL</p>
    
    <div class="color-preview" id="color-preview"></div>
    
    <div class="converter-grid">
        <div class="converter-card">
            <label>HEX</label>
            <div class="input-group">
                <input type="text" id="hex-input" placeholder="#000000" maxlength="7">
                <button class="btn btn-small" onclick="convertFromHex()">Convert</button>
            </div>
        </div>
        
        <div class="converter-card">
            <label>RGB</label>
            <div class="input-group">
                <input type="text" id="rgb-input" placeholder="rgb(0, 0, 0)">
                <button class="btn btn-small" onclick="convertFromRgb()">Convert</button>
            </div>
        </div>
        
        <div class="converter-card">
            <label>HSL</label>
            <div class="input-group">
                <input type="text" id="hsl-input" placeholder="hsl(0, 0%, 0%)">
                <button class="btn btn-small" onclick="convertFromHsl()">Convert</button>
            </div>
        </div>
    </div>
    
    <div class="results" id="results">
        <div class="result-item">
            <span class="result-label">HEX</span>
            <code id="result-hex">#000000</code>
        </div>
        <div class="result-item">
            <span class="result-label">RGB</span>
            <code id="result-rgb">rgb(0, 0, 0)</code>
        </div>
        <div class="result-item">
            <span class="result-label">HSL</span>
            <code id="result-hsl">hsl(0, 0%, 0%)</code>
        </div>
    </div>
</div>

<style>
.tool-container { max-width: 900px; margin: 0 auto; }
.tool-subtitle { color: #9ca3af; font-size: 1.1rem; margin-bottom: 2rem; }
.color-preview { width: 100%; height: 120px; border-radius: 8px; background: #000000; margin-bottom: 1.5rem; border: 1px solid #2d2d2d; }
.converter-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
.converter-card { background: #1e1e1e; border: 1px solid #2d2d2d; border-radius: 8px; padding: 1rem; }
.converter-card label { display: block; color: #9ca3af; font-size: 0.85rem; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.5px; }
.input-group { display: flex; gap: 0.5rem; }
.input-group input { flex: 1; padding: 0.5rem; background: #121212; border: 1px solid #2d2d2d; border-radius: 6px; color: #e0e0e0; font-family: 'Courier New', monospace; }
.input-group input:focus { outline: none; border-color: #8b5cf6; }
.btn-small { padding: 0.4rem 0.8rem; font-size: 0.85rem; }
.btn { background: #8b5cf6; color: #fff; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; }
.btn:hover { background: #7c3aed; }
.results { display: flex; flex-direction: column; gap: 0.75rem; }
.result-item { display: flex; justify-content: space-between; align-items: center; background: #1e1e1e; border: 1px solid #2d2d2d; border-radius: 8px; padding: 1rem; }
.result-label { color: #9ca3af; font-size: 0.85rem; text-transform: uppercase; }
.result-item code { color: #8b5cf6; font-family: 'Courier New', monospace; font-size: 1rem; cursor: pointer; }
.result-item code:hover { text-decoration: underline; }
</style>

<script>
function updatePreview(hex) { document.getElementById('color-preview').style.background = hex; }
function updateResults(hex, rgb, hsl) {
    document.getElementById('result-hex').textContent = hex;
    document.getElementById('result-rgb').textContent = rgb;
    document.getElementById('result-hsl').textContent = hsl;
    updatePreview(hex);
}
function convertFromHex() {
    const hex = document.getElementById('hex-input').value.trim();
    if (!hex || !hex.startsWith('#')) return;
    const r = parseInt(hex.slice(1,3), 16), g = parseInt(hex.slice(3,5), 16), b = parseInt(hex.slice(5,7), 16);
    const rgb = `rgb(${r}, ${g}, ${b})`;
    const hsl = rgbToHsl(r, g, b);
    updateResults(hex.toUpperCase(), rgb, hsl);
}
function convertFromRgb() {
    const input = document.getElementById('rgb-input').value.trim();
    const match = input.match(/\d+/g);
    if (!match || match.length < 3) return;
    const r = parseInt(match[0]), g = parseInt(match[1]), b = parseInt(match[2]);
    const hex = '#' + [r,g,b].map(x => x.toString(16).padStart(2,'0')).join('').toUpperCase();
    const hsl = rgbToHsl(r, g, b);
    updateResults(hex, `rgb(${r}, ${g}, ${b})`, hsl);
}
function convertFromHsl() {
    const input = document.getElementById('hsl-input').value.trim();
    const match = input.match(/\d+/g);
    if (!match || match.length < 3) return;
    const h = parseInt(match[0]), s = parseInt(match[1]), l = parseInt(match[2]);
    const rgb = hslToRgb(h, s, l);
    const hex = '#' + rgb.map(x => x.toString(16).padStart(2,'0')).join('').toUpperCase();
    const hsl = `hsl(${h}, ${s}%, ${l}%)`;
    updateResults(hex, `rgb(${rgb.join(', ')})`, hsl);
}
function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r,g,b), min = Math.min(r,g,b);
    let h, s, l = (max + min) / 2;
    if (max === min) { h = s = 0; }
    else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return `hsl(${Math.round(h*360)}, ${Math.round(s*100)}%, ${Math.round(l*100)}%)`;
}
function hslToRgb(h, s, l) {
    s /= 100; l /= 100;
    const c = (1 - Math.abs(2*l - 1)) * s;
    const x = c * (1 - Math.abs(((h/60) % 2) - 1));
    const m = l - c/2;
    let r, g, b;
    if (h < 60) { r=c; g=x; b=0; }
    else if (h < 120) { r=x; g=c; b=0; }
    else if (h < 180) { r=0; g=c; b=x; }
    else if (h < 240) { r=0; g=x; b=c; }
    else if (h < 300) { r=x; g=0; b=c; }
    else { r=c; g=0; b=x; }
    return [Math.round((r+m)*255), Math.round((g+m)*255), Math.round((b+m)*255)];
}
document.querySelectorAll('.result-item code').forEach(code => {
    code.addEventListener('click', () => { navigator.clipboard.writeText(code.textContent); });
});
</script>
