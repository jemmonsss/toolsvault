---
title: "Emoji & Kaomoji Board"
link: "/tools/emoji-board/"
description: "Copy emojis and kaomoji instantly."
tags:
  - emoji
  - kaomoji
  - design
category: "Color & Design"
---
<div class="tui">
  <h1>Emoji & Kaomoji Board</h1>
  <p class="sub">Click any item to copy it.</p>
  <label>Emojis</label>
  <div id="emoji" class="emoji-grid"></div>
  <label>Kaomoji</label>
  <div id="kao" class="emoji-grid" style="grid-template-columns:repeat(auto-fill,minmax(120px,1fr))"></div>
  <div id="msg" class="msg"></div>
</div>
<script src="{{ '/assets/js/tools.js' | relative_url }}" defer></script>
<script>
var E=['😀','😂','🥰','😎','🤔','🥳','😴','🤯','🔥','⭐','✅','❌','⚡','💡','🚀','💡','🐛','🛠️','📦','📈','💻','🧠','👍','👀','🎉','🌟','💜','🔒','🔑','📝','⚙️','🧪','📚','🐳','🌈','☕','🍕','🎯','🧩','🪄'];
var K=['(•‿•)','(◕‿◕)','(＾▽＾)','(╯°□°）╯','ಠ_ಠ','(•_•)','(>_<)','(◡‿◡)','ヽ(°〇°)ﾉ','（≧▽≦）','(´･_･`)','(¬‿¬)','(づ｡◕‿‿◕｡)づ','(ﾉ◕ヮ◕)ﾉ','¯\\_(ツ)_/¯'];
function render(){byId('emoji').innerHTML=E.map(function(e){return '<button onclick="copyText(\''+e+'\');ok(\'msg\',\'Copied '+e+'\')">'+e+'</button>';}).join('');byId('kao').innerHTML=K.map(function(k){return '<button onclick="copyText(\''+k.replace(/'/g,"\\'")+'\');ok(\'msg\',\'Copied\')">'+k+'</button>';}).join('');}
render();
</script>
