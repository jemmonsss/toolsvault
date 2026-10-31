---
title: "JSON Formatter"
link: "/tools/json-formatter/"
description: "Beautify, minify, and validate JSON directly in your browser."
tags:
  - json
  - formatter
  - developer-tools
category: "Web & Dev"
featured: true
---
<div class="tool-container">
    <h1>JSON Formatter</h1>
    <p class="tool-subtitle">Beautify, minify, and validate JSON</p>
    
    <div class="tool-tabs">
        <button class="tab-btn active" data-tab="format">Format</button>
        <button class="tab-btn" data-tab="minify">Minify</button>
        <button class="tab-btn" data-tab="validate">Validate</button>
    </div>
    
    <div class="tool-panels">
        <div class="panel active" id="panel-format">
            <textarea id="json-input" placeholder="Paste your JSON here..."></textarea>
            <div class="tool-actions">
                <button class="btn btn-primary" onclick="formatJSON()">Format / Beautify</button>
                <button class="btn btn-secondary" onclick="clearJSON()">Clear</button>
            </div>
            <textarea id="json-output" readonly placeholder="Formatted JSON will appear here..."></textarea>
        </div>
        
        <div class="panel" id="panel-minify">
            <textarea id="json-minify-input" placeholder="Paste your JSON here..."></textarea>
            <div class="tool-actions">
                <button class="btn btn-primary" onclick="minifyJSON()">Minify</button>
                <button class="btn btn-secondary" onclick="document.getElementById('json-minify-input').value=''">Clear</button>
            </div>
            <textarea id="json-minify-output" readonly placeholder="Minified JSON will appear here..."></textarea>
        </div>
        
        <div class="panel" id="panel-validate">
            <textarea id="json-validate-input" placeholder="Paste your JSON here..."></textarea>
            <div class="tool-actions">
                <button class="btn btn-primary" onclick="validateJSON()">Validate JSON</button>
                <button class="btn btn-secondary" onclick="document.getElementById('json-validate-input').value=''">Clear</button>
            </div>
            <div id="json-validate-result"></div>
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
.panel textarea { width: 100%; min-height: 200px; background: #1e1e1e; border: 1px solid #2d2d2d; border-radius: 8px; color: #e0e0e0; padding: 1rem; font-family: 'Courier New', monospace; font-size: 0.9rem; resize: vertical; }
.panel textarea:focus { outline: none; border-color: #8b5cf6; }
.tool-actions { display: flex; gap: 0.75rem; margin: 1rem 0; }
.btn { padding: 0.6rem 1.2rem; border-radius: 6px; font-weight: 600; cursor: pointer; border: none; font-size: 0.9rem; }
.btn-primary { background: #8b5cf6; color: #fff; }
.btn-primary:hover { background: #7c3aed; }
.btn-secondary { background: #2d2d2d; color: #e0e0e0; }
.btn-secondary:hover { background: #3d3d3d; }
#json-validate-result { padding: 1rem; border-radius: 6px; font-weight: 500; }
.valid { background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); color: #22c55e; }
.invalid { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); color: #ef4444; }
</style>

<script>
function formatJSON() {
    const input = document.getElementById('json-input').value.trim();
    const output = document.getElementById('json-output');
    if (!input) { output.value = ''; return; }
    try { output.value = JSON.stringify(JSON.parse(input), null, 2); }
    catch(e) { output.value = 'Error: ' + e.message; }
}
function minifyJSON() {
    const input = document.getElementById('json-minify-input').value.trim();
    const output = document.getElementById('json-minify-output');
    if (!input) { output.value = ''; return; }
    try { output.value = JSON.stringify(JSON.parse(input)); }
    catch(e) { output.value = 'Error: ' + e.message; }
}
function validateJSON() {
    const input = document.getElementById('json-validate-input').value.trim();
    const result = document.getElementById('json-validate-result');
    if (!input) { result.innerHTML = ''; return; }
    try { JSON.parse(input); result.innerHTML = 'Valid JSON'; result.className = 'valid'; }
    catch(e) { result.innerHTML = 'Invalid JSON: ' + e.message; result.className = 'invalid'; }
}
function clearJSON() { document.getElementById('json-input').value = ''; document.getElementById('json-output').value = ''; }
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('panel-' + btn.dataset.tab).classList.add('active');
    });
});
</script>
