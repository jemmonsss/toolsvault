---
title: "Base64 Tool"
link: "/tools/base64-tool/"
description: "Encode and decode Base64 strings instantly."
tags:
  - base64
  - encoder
  - decoder
  - utilities
category: "Converters"
---
<div class="tool-container">
    <h1>Base64 Tool</h1>
    <p class="tool-subtitle">Encode and decode Base64 strings</p>
    
    <div class="tool-tabs">
        <button class="tab-btn active" data-tab="encode">Encode</button>
        <button class="tab-btn" data-tab="decode">Decode</button>
    </div>
    
    <div class="tool-panels">
        <div class="panel active" id="panel-encode">
            <textarea id="base64-encode-input" placeholder="Enter text to encode..."></textarea>
            <div class="tool-actions">
                <button class="btn btn-primary" onclick="encodeBase64()">Encode to Base64</button>
                <button class="btn btn-secondary" onclick="copyToClipboard('base64-encode-output')">Copy Output</button>
            </div>
            <textarea id="base64-encode-output" readonly placeholder="Base64 encoded string..."></textarea>
        </div>
        
        <div class="panel" id="panel-decode">
            <textarea id="base64-decode-input" placeholder="Paste Base64 string to decode..."></textarea>
            <div class="tool-actions">
                <button class="btn btn-primary" onclick="decodeBase64()">Decode from Base64</button>
                <button class="btn btn-secondary" onclick="copyToClipboard('base64-decode-output')">Copy Output</button>
            </div>
            <textarea id="base64-decode-output" readonly placeholder="Decoded text will appear here..."></textarea>
        </div>
    </div>
</div>

<style>
.tool-container { max-width: 900px; margin: 0 auto; }
.tool-subtitle { color: #9ca3af; font-size: 1.1rem; margin-bottom: 2rem; }
.tool-tabs { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; border-bottom: 1px solid #2d2d2d; padding-bottom: 0.5rem; }
.tab-btn { padding: 0.5rem 1rem; background: #1e1e1e; border: 1px solid #2d2d2d; border-radius: 6px; color: #9ca3af; cursor: pointer; font-size: 0.9rem; transition: all 0.2s; }
.tab-btn:hover { border-color: #8b5cf6; color: #e0e0e0; }
.tab-btn.active { background: #8b5cf6; border-color: #8b5cf6; color: #fff; }
.tool-panels { display: flex; flex-direction: column; gap: 1rem; }
.panel { display: none; }
.panel.active { display: block; }
.panel textarea { width: 100%; min-height: 180px; background: #1e1e1e; border: 1px solid #2d2d2d; border-radius: 8px; color: #e0e0e0; padding: 1rem; font-family: 'Courier New', monospace; font-size: 0.9rem; resize: vertical; }
.panel textarea:focus { outline: none; border-color: #8b5cf6; }
.tool-actions { display: flex; gap: 0.75rem; margin: 1rem 0; }
.btn { padding: 0.6rem 1.2rem; border-radius: 6px; font-weight: 600; cursor: pointer; border: none; font-size: 0.9rem; }
.btn-primary { background: #8b5cf6; color: #fff; }
.btn-primary:hover { background: #7c3aed; }
.btn-secondary { background: #2d2d2d; color: #e0e0e0; }
.btn-secondary:hover { background: #3d3d3d; }
</style>

<script>
function encodeBase64() {
    const input = document.getElementById('base64-encode-input').value;
    const output = document.getElementById('base64-encode-output');
    try { output.value = btoa(unescape(encodeURIComponent(input))); }
    catch(e) { output.value = 'Error: ' + e.message; }
}
function decodeBase64() {
    const input = document.getElementById('base64-decode-input').value.trim();
    const output = document.getElementById('base64-decode-output');
    try { output.value = decodeURIComponent(escape(window.atob(input))); }
    catch(e) { output.value = 'Error: Invalid Base64 input'; }
}
function copyToClipboard(id) {
    const el = document.getElementById(id);
    el.select(); document.execCommand('copy');
}
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('panel-' + btn.dataset.tab).classList.add('active');
    });
});
</script>
