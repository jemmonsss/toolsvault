---
title: "Password Generator"
link: "/tools/password-generator/"
description: "Generate secure random passwords with custom options."
tags:
  - password
  - generator
  - security
  - utilities
category: "Security"
featured: true
---
<div class="tool-container">
    <h1>Password Generator</h1>
    <p class="tool-subtitle">Generate secure random passwords</p>
    
    <div class="password-display">
        <input type="text" id="password-output" readonly value="">
        <button class="btn btn-icon" onclick="generatePassword()">Generate</button>
    </div>
    
    <div class="options-grid">
        <div class="option-item">
            <label for="length">Length: <span id="length-value">16</span></label>
            <input type="range" id="length" min="8" max="64" value="16" oninput="document.getElementById('length-value').textContent=this.value">
        </div>
        
        <div class="option-item">
            <label><input type="checkbox" id="uppercase" checked> Uppercase (A-Z)</label>
        </div>
        
        <div class="option-item">
            <label><input type="checkbox" id="lowercase" checked> Lowercase (a-z)</label>
        </div>
        
        <div class="option-item">
            <label><input type="checkbox" id="numbers" checked> Numbers (0-9)</label>
        </div>
        
        <div class="option-item">
            <label><input type="checkbox" id="symbols" checked> Symbols (!@#$%)</label>
        </div>
        
        <div class="option-item">
            <label><input type="checkbox" id="exclude-similar"> Exclude similar (i, l, 1, L, o, 0, O)</label>
        </div>
    </div>
    
    <div class="strength-meter">
        <div class="strength-bar" id="strength-bar"></div>
    </div>
    <p class="strength-text" id="strength-text"></p>
    
    <div class="tool-actions">
        <button class="btn btn-primary" onclick="generatePassword()">Generate Password</button>
        <button class="btn btn-secondary" onclick="copyPassword()">Copy to Clipboard</button>
    </div>
</div>

<style>
.tool-container { max-width: 700px; margin: 0 auto; }
.tool-subtitle { color: #9ca3af; font-size: 1.1rem; margin-bottom: 2rem; }
.password-display { display: flex; gap: 0.5rem; margin-bottom: 2rem; }
.password-display input { flex: 1; padding: 1rem; background: #1e1e1e; border: 1px solid #2d2d2d; border-radius: 8px; color: #8b5cf6; font-family: 'Courier New', monospace; font-size: 1.2rem; font-weight: 600; }
.password-display input:focus { outline: none; border-color: #8b5cf6; }
.btn-icon { padding: 0 1.2rem; }
.options-grid { background: #1e1e1e; border: 1px solid #2d2d2d; border-radius: 8px; padding: 1.5rem; margin-bottom: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
.option-item { display: flex; justify-content: space-between; align-items: center; }
.option-item label { color: #e0e0e0; cursor: pointer; }
.option-item input[type="checkbox"] { accent-color: #8b5cf6; width: 18px; height: 18px; }
.option-item input[type="range"] { accent-color: #8b5cf6; width: 200px; }
.strength-meter { width: 100%; height: 8px; background: #2d2d2d; border-radius: 4px; overflow: hidden; margin-bottom: 0.5rem; }
.strength-bar { height: 100%; width: 0%; transition: all 0.3s; border-radius: 4px; }
.strength-text { text-align: center; color: #9ca3af; font-size: 0.9rem; margin-bottom: 1.5rem; }
.tool-actions { display: flex; gap: 0.75rem; }
.btn { padding: 0.6rem 1.2rem; border-radius: 6px; font-weight: 600; cursor: pointer; border: none; font-size: 0.9rem; }
.btn-primary { background: #8b5cf6; color: #fff; }
.btn-primary:hover { background: #7c3aed; }
.btn-secondary { background: #2d2d2d; color: #e0e0e0; }
.btn-secondary:hover { background: #3d3d3d; }
</style>

<script>
const CHARS = { uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', lowercase: 'abcdefghijklmnopqrstuvwxyz', numbers: '0123456789', symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?' };
const SIMILAR = 'il1Lo0O';
function generatePassword() {
    const length = parseInt(document.getElementById('length').value);
    const useUpper = document.getElementById('uppercase').checked;
    const useLower = document.getElementById('lowercase').checked;
    const useNumbers = document.getElementById('numbers').checked;
    const useSymbols = document.getElementById('symbols').checked;
    const excludeSimilar = document.getElementById('exclude-similar').checked;
    let chars = '';
    if (useUpper) chars += CHARS.uppercase;
    if (useLower) chars += CHARS.lowercase;
    if (useNumbers) chars += CHARS.numbers;
    if (useSymbols) chars += CHARS.symbols;
    if (excludeSimilar) chars = chars.split('').filter(c => !SIMILAR.includes(c)).join('');
    if (!chars) { document.getElementById('password-output').value = ''; return; }
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);
    let password = '';
    for (let i = 0; i < length; i++) password += chars[array[i] % chars.length];
    document.getElementById('password-output').value = password;
    updateStrength(password);
}
function updateStrength(password) {
    let score = 0;
    if (password.length > 8) score++;
    if (password.length > 12) score++;
    if (password.length >= 16) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    const bar = document.getElementById('strength-bar');
    const text = document.getElementById('strength-text');
    const levels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    const colors = ['', '#ef4444', '#f59e0b', '#eab308', '#22c55e', '#10b981'];
    bar.style.width = (score * 20) + '%';
    bar.style.background = colors[score] || '#2d2d2d';
    text.textContent = levels[score] || '';
}
function copyPassword() {
    const input = document.getElementById('password-output');
    input.select(); document.execCommand('copy');
}
window.addEventListener('DOMContentLoaded', generatePassword);
</script>
