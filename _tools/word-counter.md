---
title: "Word & Character Counter"
link: "/tools/word-counter/"
description: "Count words, characters and lines in text."
tags:
  - counter
  - words
  - text
  - characters
category: "Text & Strings"
---
<div class="tui">
  <h1>Word & Character Counter</h1>
  <p class="sub">Live counts for your text.</p>
  <textarea id="in" placeholder="Type or paste text..." oninput="run()" style="min-height:200px"></textarea>
  <div class="grid2" style="margin-top:1rem">
    <div class="kv"><span>Words</span><span id="words">0</span></div>
    <div class="kv"><span>Characters</span><span id="chars">0</span></div>
    <div class="kv"><span>Characters (no spaces)</span><span id="nospace">0</span></div>
    <div class="kv"><span>Lines</span><span id="lines">0</span></div>
    <div class="kv"><span>Sentences</span><span id="sent">0</span></div>
    <div class="kv"><span>Reading time</span><span id="read">0s</span></div>
  </div>
</div>
<script src="{{ '/assets/js/tools.js' | relative_url }}"></script>
<script>
function run(){var t=byId('in').value;var chars=t.length;var nospace=t.replace(/\s/g,'').length;var lines=t?t.split(/\n/).length:0;var words=t.trim()?t.trim().split(/\s+/).length:0;var sent=t.trim()?(t.match(/[.!?]+(\s|$)/g)||[]).length:0;var sec=Math.ceil(words/200);byId('words').textContent=words;byId('chars').textContent=chars;byId('nospace').textContent=nospace;byId('lines').textContent=lines;byId('sent').textContent=sent;byId('read').textContent=sec+'s';}
</script>
