---
title: "HTTP Status Codes"
link: "/tools/http-status/"
description: "Reference of HTTP status codes."
tags:
  - http
  - status
  - reference
  - web
category: "Web & Dev"
---
<div class="tui">
  <h1>HTTP Status Codes</h1>
  <p class="sub">Search and browse HTTP status code reference.</p>
  <input type="text" id="q" placeholder="Search code or text..." oninput="render()">
  <table id="tbl" style="margin-top:1rem"></table>
</div>
<script src="{{ '/assets/js/tools.js' | relative_url }}" defer></script>
<script>
var C=[[100,'Continue'],[101,'Switching Protocols'],[102,'Processing'],[200,'OK'],[201,'Created'],[202,'Accepted'],[203,'Non-Authoritative Information'],[204,'No Content'],[205,'Reset Content'],[206,'Partial Content'],[207,'Multi-Status'],[208,'Already Reported'],[226,'IM Used'],[300,'Multiple Choices'],[301,'Moved Permanently'],[302,'Found'],[303,'See Other'],[304,'Not Modified'],[307,'Temporary Redirect'],[308,'Permanent Redirect'],[400,'Bad Request'],[401,'Unauthorized'],[402,'Payment Required'],[403,'Forbidden'],[404,'Not Found'],[405,'Method Not Allowed'],[406,'Not Acceptable'],[408,'Request Timeout'],[409,'Conflict'],[410,'Gone'],[413,'Payload Too Large'],[415,'Unsupported Media Type'],[418,'I\'m a teapot'],[422,'Unprocessable Entity'],[425,'Too Early'],[429,'Too Many Requests'],[431,'Request Header Fields Too Large'],[451,'Unavailable For Legal Reasons'],[500,'Internal Server Error'],[501,'Not Implemented'],[502,'Bad Gateway'],[503,'Service Unavailable'],[504,'Gateway Timeout'],[505,'HTTP Version Not Supported'],[507,'Insufficient Storage'],[508,'Loop Detected'],[511,'Network Authentication Required']];
function render(){var q=byId('q').value.toLowerCase();byId('tbl').innerHTML=C.filter(function(r){return !q||(''+r[0]).indexOf(q)>=0||r[1].toLowerCase().indexOf(q)>=0;}).map(function(r){var col=r[0]<300?'#22c55e':r[0]<400?'#3b82f6':r[0]<500?'#eab308':'#ef4444';return '<tr><td style="color:'+col+';font-weight:600">'+r[0]+'</td><td>'+r[1]+'</td></tr>';}).join('');}
render();
</script>
