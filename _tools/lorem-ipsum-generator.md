---
title: "Lorem Ipsum Generator"
link: "/tools/lorem-ipsum-generator/"
description: "Generate placeholder text for designs and layouts."
tags:
  - lorem
  - ipsum
  - placeholder
  - text
category: "Utilities"
---
<div class="tool-container">
    <h1>Lorem Ipsum Generator</h1>
    <p class="tool-subtitle">Generate placeholder text for designs and layouts</p>
    
    <div class="controls">
        <div class="control-item">
            <label for="paragraphs">Paragraphs: <span id="para-value">3</span></label>
            <input type="range" id="paragraphs" min="1" max="10" value="3" oninput="document.getElementById('para-value').textContent=this.value">
        </div>
        <div class="control-item">
            <label for="sentences">Max sentences per paragraph: <span id="sent-value">5</span></label>
            <input type="range" id="sentences" min="1" max="10" value="5" oninput="document.getElementById('sent-value').textContent=this.value">
        </div>
    </div>
    
    <div class="tool-actions">
        <button class="btn btn-primary" onclick="generateLorem()">Generate</button>
        <button class="btn btn-secondary" onclick="copyLorem()">Copy to Clipboard</button>
    </div>
    
    <div class="output" id="lorem-output"></div>
</div>

<style>
.tool-container { max-width: 800px; margin: 0 auto; }
.tool-subtitle { color: #9ca3af; font-size: 1.1rem; margin-bottom: 2rem; }
.controls { background: #1e1e1e; border: 1px solid #2d2d2d; border-radius: 8px; padding: 1.5rem; margin-bottom: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
.control-item { display: flex; justify-content: space-between; align-items: center; }
.control-item label { color: #e0e0e0; }
.control-item input[type="range"] { accent-color: #8b5cf6; width: 200px; }
.tool-actions { display: flex; gap: 0.75rem; margin-bottom: 1.5rem; }
.btn { padding: 0.6rem 1.2rem; border-radius: 6px; font-weight: 600; cursor: pointer; border: none; font-size: 0.9rem; }
.btn-primary { background: #8b5cf6; color: #fff; }
.btn-primary:hover { background: #7c3aed; }
.btn-secondary { background: #2d2d2d; color: #e0e0e0; }
.btn-secondary:hover { background: #3d3d3d; }
.output { background: #1e1e1e; border: 1px solid #2d2d2d; border-radius: 8px; padding: 1.5rem; color: #e0e0e0; line-height: 1.8; min-height: 200px; white-space: pre-wrap; font-size: 0.95rem; }
</style>

<script>
const WORDS = ['lorem','ipsum','dolor','sit','amet','consectetur','adipiscing','elit','sed','do','eiusmod','tempor','incididunt','ut','labore','et','dolore','magna','aliqua','enim','ad','minim','veniam','quis','nostrud','exercitation','ullamco','laboris','nisi','aliquip','ex','ea','commodo','consequat','duis','aute','irure','in','reprehenderit','voluptate','velit','esse','cillum','fugiat','nulla','pariatur','excepteur','sint','occaecat','cupidatat','non','proident','sunt','culpa','qui','officia','deserunt','mollit','anim','id','est','laborum'];
function generateLorem() {
    const paraCount = parseInt(document.getElementById('paragraphs').value);
    const maxSent = parseInt(document.getElementById('sentences').value);
    let text = '';
    for (let p = 0; p < paraCount; p++) {
        const sentCount = Math.floor(Math.random() * maxSent) + 3;
        let para = '';
        for (let s = 0; s < sentCount; s++) {
            const len = Math.floor(Math.random() * 8) + 5;
            let sent = [];
            for (let w = 0; w < len; w++) sent.push(WORDS[Math.floor(Math.random() * WORDS.length)]);
            sent[0] = sent[0].charAt(0).toUpperCase() + sent[0].slice(1);
            para += sent.join(' ') + '. ';
        }
        text += para.trim() + '\n\n';
    }
    document.getElementById('lorem-output').textContent = text.trim();
}
function copyLorem() {
    const el = document.getElementById('lorem-output');
    el.select(); document.execCommand('copy');
}
window.addEventListener('DOMContentLoaded', generateLorem);
</script>
