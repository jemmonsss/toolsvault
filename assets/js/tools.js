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
function initTabs(){
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
