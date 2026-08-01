function byId(id){return document.getElementById(id);}
function copyText(t){
  if(navigator.clipboard&&navigator.clipboard.writeText){
    navigator.clipboard.writeText(t).catch(function(){fallbackCopy(t);});
  } else { fallbackCopy(t); }
}
function fallbackCopy(t){
  var ta=document.createElement('textarea');ta.value=t;ta.style.position='fixed';ta.style.opacity='0';
  document.body.appendChild(ta);ta.select();try{document.execCommand('copy');}catch(e){}document.body.removeChild(ta);
}
function copy(id){
  var el=byId(id);if(!el)return;
  var t=(typeof el.value==='string')?el.value:(el.textContent||'');
  copyText(t);
}
function showMsg(id,text,type){
  var m=byId(id);if(!m)return;
  m.textContent=text;m.className='msg '+(type||'');
}
function ok(id,t){showMsg(id,t,'ok');}
function err(id,t){showMsg(id,t,'err');}
var _tuiInitialized=false;
function initTabs(){
  if(_tuiInitialized)return;
  _tuiInitialized=true;
  document.querySelectorAll('.tui .tab').forEach(function(b){
    b.addEventListener('click',function(){
      var t=b.dataset.tab;var root=b.closest('.tui');if(!root)return;
      root.querySelectorAll('.tab').forEach(function(x){x.classList.remove('active');});
      root.querySelectorAll('.panel').forEach(function(p){p.classList.remove('active');});
      b.classList.add('active');
      var p=byId('panel-'+t);if(p)p.classList.add('active');
    });
  });
}
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',initTabs);}else{initTabs();}

// Shared capability helpers used by security-sensitive generators.
function hasSecureRandom(){return !!(window.crypto&&window.crypto.getRandomValues);}
function hasWebCrypto(){return !!(hasSecureRandom()&&window.crypto.subtle);}
function requireSecureRandom(msgId){
  if(hasSecureRandom())return true;
  if(msgId)err(msgId,'Secure random generation is unavailable. Open this page over HTTPS in a modern browser.');
  return false;
}
function requireWebCrypto(msgId){
  if(hasWebCrypto())return true;
  if(msgId)err(msgId,'Web Crypto is unavailable. Open this page over HTTPS in a modern browser.');
  return false;
}
function secureRandomInt(max){
  max=Math.floor(max);
  if(!hasSecureRandom()||max<1)throw new Error('Secure random generation unavailable');
  var limit=Math.floor(0x100000000/max)*max;
  var value,buf=new Uint32Array(1);
  do{window.crypto.getRandomValues(buf);value=buf[0];}while(value>=limit);
  return value%max;
}
function uuidV4(){
  if(!hasSecureRandom())throw new Error('Secure random generation unavailable');
  if(typeof window.crypto.randomUUID==='function')return window.crypto.randomUUID();
  var b=new Uint8Array(16);window.crypto.getRandomValues(b);
  b[6]=(b[6]&15)|64;b[8]=(b[8]&63)|128;
  var h=Array.from(b,function(x){return x.toString(16).padStart(2,'0');}).join('');
  return h.slice(0,8)+'-'+h.slice(8,12)+'-'+h.slice(12,16)+'-'+h.slice(16,20)+'-'+h.slice(20);
}
function escapeHtml(value){
  return String(value==null?'':value).replace(/[&<>'"]/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch];});
}
function safeHttpUrl(value,allowDataImage){
  try{
    var text=String(value||'').trim();
    if(allowDataImage&&/^data:image\/(?:png|gif|jpe?g|webp);base64,/i.test(text))return text;
    var url=new URL(text,window.location.href);
    return (url.protocol==='http:'||url.protocol==='https:')?url.href:'';
  }catch(e){return '';}
}
