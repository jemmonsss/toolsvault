---
title: "Timestamp Converter"
link: "/tools/timestamp-converter/"
description: "Convert between Unix timestamps and human-readable dates."
tags:
  - timestamp
  - unix
  - date
  - converter
category: "Utilities"
---
<div class="tool-container">
    <h1>Timestamp Converter</h1>
    <p class="tool-subtitle">Convert between Unix timestamps and human-readable dates</p>
    
    <div class="converter-grid">
        <div class="converter-card">
            <label>Unix Timestamp (seconds)</label>
            <div class="input-group">
                <input type="text" id="unix-input" placeholder="e.g. 1710000000">
                <button class="btn btn-small" onclick="convertFromUnix()">Convert</button>
            </div>
        </div>
        
        <div class="converter-card">
            <label>Milliseconds (ms)</label>
            <div class="input-group">
                <input type="text" id="ms-input" placeholder="e.g. 1710000000000">
                <button class="btn btn-small" onclick="convertFromMs()">Convert</button>
            </div>
        </div>
    </div>
    
    <div class="results">
        <div class="result-item">
            <span class="result-label">UTC</span>
            <code id="result-utc">-</code>
        </div>
        <div class="result-item">
            <span class="result-label">Local</span>
            <code id="result-local">-</code>
        </div>
        <div class="result-item">
            <span class="result-label">ISO 8601</span>
            <code id="result-iso">-</code>
        </div>
        <div class="result-item">
            <span class="result-label">Relative</span>
            <code id="result-relative">-</code>
        </div>
    </div>
    
    <div class="current-time">
        <p>Current Timestamp: <strong id="current-unix">-</strong></p>
    </div>
</div>

<style>
.tool-container { max-width: 900px; margin: 0 auto; }
.tool-subtitle { color: #9ca3af; font-size: 1.1rem; margin-bottom: 2rem; }
.converter-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
.converter-card { background: #1e1e1e; border: 1px solid #2d2d2d; border-radius: 8px; padding: 1.2rem; }
.converter-card label { display: block; color: #9ca3af; font-size: 0.85rem; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.5px; }
.input-group { display: flex; gap: 0.5rem; }
.input-group input { flex: 1; padding: 0.5rem; background: #121212; border: 1px solid #2d2d2d; border-radius: 6px; color: #e0e0e0; font-family: 'Courier New', monospace; }
.input-group input:focus { outline: none; border-color: #8b5cf6; }
.btn-small { padding: 0.4rem 0.8rem; font-size: 0.85rem; }
.btn { background: #8b5cf6; color: #fff; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; }
.btn:hover { background: #7c3aed; }
.results { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 2rem; }
.result-item { display: flex; justify-content: space-between; align-items: center; background: #1e1e1e; border: 1px solid #2d2d2d; border-radius: 8px; padding: 1rem; }
.result-label { color: #9ca3af; font-size: 0.85rem; text-transform: uppercase; }
.result-item code { color: #8b5cf6; font-family: 'Courier New', monospace; cursor: pointer; }
.result-item code:hover { text-decoration: underline; }
.current-time { text-align: center; color: #9ca3af; padding: 1rem; background: #1e1e1e; border: 1px solid #2d2d2d; border-radius: 8px; }
</style>

<script>
function convertFromUnix() {
    const ts = parseInt(document.getElementById('unix-input').value);
    if (!ts) return;
    const date = new Date(ts * 1000);
    showResults(date);
}
function convertFromMs() {
    const ts = parseInt(document.getElementById('ms-input').value);
    if (!ts) return;
    const date = new Date(ts);
    showResults(date);
}
function showResults(date) {
    document.getElementById('result-utc').textContent = date.toUTCString();
    document.getElementById('result-local').textContent = date.toLocaleString();
    document.getElementById('result-iso').textContent = date.toISOString();
    const now = new Date();
    const diff = now - date;
    const absDiff = Math.abs(diff);
    const seconds = Math.floor(absDiff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    let relative = '';
    if (diff > 0) {
        if (days > 0) relative = days + ' day' + (days > 1 ? 's' : '') + ' ago';
        else if (hours > 0) relative = hours + ' hour' + (hours > 1 ? 's' : '') + ' ago';
        else if (minutes > 0) relative = minutes + ' minute' + (minutes > 1 ? 's' : '') + ' ago';
        else relative = seconds + ' second' + (seconds > 1 ? 's' : '') + ' ago';
    } else {
        if (days > 0) relative = 'in ' + days + ' day' + (days > 1 ? 's' : '');
        else if (hours > 0) relative = 'in ' + hours + ' hour' + (hours > 1 ? 's' : '');
        else if (minutes > 0) relative = 'in ' + minutes + ' minute' + (minutes > 1 ? 's' : '');
        else relative = 'in ' + seconds + ' second' + (seconds > 1 ? 's' : '');
    }
    document.getElementById('result-relative').textContent = relative;
}
function updateCurrentTimestamp() {
    document.getElementById('current-unix').textContent = Math.floor(Date.now() / 1000);
}
document.querySelectorAll('.result-item code').forEach(code => {
    code.addEventListener('click', () => { navigator.clipboard.writeText(code.textContent); });
});
window.addEventListener('DOMContentLoaded', () => { updateCurrentTimestamp(); setInterval(updateCurrentTimestamp, 1000); });
</script>
