---
title: "URL Tool"
link: "/tools/url-tool/"
description: "Encode and decode URLs and query strings."
tags:
  - url
  - encoder
  - decoder
  - utilities
category: "Utilities"
---
<div class="tool-container">
    <h1>URL Tool</h1>
    <p class="tool-subtitle">Encode and decode URLs and query strings</p>
    
    <div class="tool-tabs">
        <button class="tab-btn active" data-tab="encode">Encode</button>
        <button class="tab-btn" data-tab="decode">Decode</button>
    </div>
    
    <div class="tool-panels">
        <div class="panel active" id="panel-encode">
            <textarea id="url-encode-input" placeholder="Enter text or URL to encode..."></textarea>
            <div class="tool-actions">
                <button class="btn btn-primary" onclick="encodeURL()">Encode URL</button>
                <button class="btn btn-secondary" onclick="copyToClipboard('url-encode-output')">Copy</button>
            </div>
            <textarea id="url-encode-output" readonly placeholder="Encoded URL..."></textarea>
        </div>
        
        <div class="panel" id="panel-decode">
            <textarea id="url-decode-input" placeholder="Paste encoded URL to decode..."></textarea>
            <div class="tool-actions">
                <button class="btn btn-primary" onclick="decodeURL()">Decode URL</button>
                <button class="btn btn-secondary" onclick="copyToClipboard('url-decode-output')">Copy</button>
            </div>
            <textarea id="url-decode-output" readonly placeholder="Decoded text..."></textarea>
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
function encodeURL() {
    const input = document.getElementById('url-encode-input').value;
    document.getElementById('url-encode-output').value = encodeURIComponent(input);
}
function decodeURL() {
    const input = document.getElementById('url-decode-input').value;
    try { document.getElementById('url-decode-output').value = decodeURIComponent(input); }
    catch(e) { document.getElementById('url-decode-output').value = 'Error: ' + e.message; }
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
