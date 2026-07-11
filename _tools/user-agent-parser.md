---
title: "User-Agent Parser"
link: "/tools/user-agent-parser/"
description: "Parse a user-agent string into browser, OS and device."
tags:
  - user-agent
  - parser
  - web
category: "Web & Dev"
---
<div class="tui">
  <h1>User-Agent Parser</h1>
  <p class="sub">Break a user-agent string into structured fields.</p>
  <textarea id="in" placeholder="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" oninput="run()"></textarea>
  <div id="out" class="result" style="margin-top:1rem"></div>
</div>
<script src="{{ '/assets/js/tools.js' | relative_url }}" defer></script>
<script>
function run(){var ua=byId('in').value.trim();if(!ua){byId('out').textContent='';return;}var r={};
  if(/Edg\//.test(ua)){r.Browser='Edge';r.Version=(ua.match(/Edg\/([\d.]+)/)||[])[1];}
  else if(/OPR\/|Opera/.test(ua)){r.Browser='Opera';r.Version=(ua.match(/(?:OPR|Opera)\/([\d.]+)/)||[])[1];}
  else if(/Chrome\//.test(ua)){r.Browser='Chrome';r.Version=(ua.match(/Chrome\/([\d.]+)/)||[])[1];}
  else if(/Firefox\//.test(ua)){r.Browser='Firefox';r.Version=(ua.match(/Firefox\/([\d.]+)/)||[])[1];}
  else if(/Version\/.*Safari|Safari\//.test(ua)){r.Browser='Safari';r.Version=(ua.match(/Version\/([\d.]+)/)||[])[1];}
  else r.Browser='Unknown';
  r.Engine=/Gecko\//.test(ua)?'Gecko':/AppleWebKit/.test(ua)?'WebKit':/Trident/.test(ua)?'Trident':/Blink/.test(ua)?'Blink':'Unknown';
  if(/Windows NT 10/.test(ua))r.OS='Windows 10/11';else if(/Windows NT/.test(ua))r.OS='Windows';else if(/Android/.test(ua))r.OS='Android '+(ua.match(/Android ([\d.]+)/)||[])[1];else if(/(iPhone|iPad|iPod)/.test(ua))r.OS='iOS '+(ua.match(/OS ([\d_]+)/)||[])[1];else if(/Mac OS X/.test(ua))r.OS='macOS '+(ua.match(/Mac OS X ([\d_]+)/)||[])[1];else if(/Linux/.test(ua))r.OS='Linux';else r.OS='Unknown';
  r.Device=/(iPhone|iPad|iPod|Android.*Mobile|Mobile)/.test(ua)?'Mobile':'Desktop';
  byId('out').textContent=Object.keys(r).map(function(k){return k+': '+r[k];}).join('\n');
}
</script>
