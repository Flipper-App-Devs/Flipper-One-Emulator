(function(){
'use strict';
const menus = {
 'Radio Lab':['Spectrum','Signal Monitor','Frequency Profiles','Transmit Test'],
 'Device Link':['Nearby Devices','Connection Status','Pair Device'],
 'Field Tools':['Signal Mapper','Range Test','Event Log'],
 'GPIO Console':['Pin Monitor','UART Console','I2C Scanner','SPI Tools'],
 'Data Studio':['Capture Log','Saved Sessions','Export Data'],
 'System':['Display','Controls','Power','About Flipper One']
};
const homeItems=['Radio Lab','Device Link','Field Tools','GPIO Console','Data Studio','System'];
let root=null,screen='home',selected=0,stack=[],message='',pressed=new Set(),viewMode=0,editMode=false;
let timer=null;
function items(){return screen==='home'?homeItems:(menus[stack[stack.length-1]]||[])}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function render(){
 if(!root)return;
 const list=items(); if(selected>=list.length)selected=Math.max(0,list.length-1);
 let body='';
 if(screen==='message'){
  body='<div class="fo-message"><b>'+esc(message)+'</b><br><br><span class="fo-muted">Simulation only · no hardware connected</span></div>';
 }else{
  body=list.map((item,i)=>'<div class="fo-item '+(i===selected?'selected':'')+'"><span class="fo-cursor">'+(i===selected?'▶':'')+'</span><span>'+esc(item)+'</span></div>').join('');
  if(!list.length)body='<div class="fo-message">No items</div>';
 }
 const title=screen==='home'?'FLIPPER ONE':screen==='message'?(stack[stack.length-1]||'FLIPPER ONE'):stack[stack.length-1];
 root.innerHTML='<div class="fo-screen"><div class="fo-status"><span>◆ FLIPPER ONE</span><span>LINK '+(viewMode?'ON':'OFF')+'　▰ 100%</span></div><div class="fo-title">'+esc(title)+(editMode?' · EDIT':'')+'</div><div class="fo-body">'+body+'</div><div class="fo-footer"><span>↑↓ Move · ←→ Browse</span><span>OK Open · Back Return</span></div></div>';
}
function show(text){screen='message';message=text;render();clearTimeout(timer);timer=setTimeout(()=>{screen=stack.length?'menu':'home';render()},1800)}
function back(){if(screen==='message'){screen=stack.length?'menu':'home';render();return}if(editMode){editMode=false;render();return}if(stack.length){stack.pop();screen=stack.length?'menu':'home';selected=0;render()}else{selected=0;render()}}
function choose(){
 if(screen==='message'){back();return}
 const item=items()[selected];if(!item)return;
 if(screen==='home'){stack.push(item);screen='menu';selected=0;render();return}
 if(item==='About Flipper One'){show('Flipper One · browser UI demo');return}
 show(item);
}
function input(d){
 if(!d||!d.key)return;
 const k=String(d.key).toLowerCase();
 if(d.type==='up'){pressed.delete(k);return}
 if(d.type!=='down'||pressed.has(k))return;pressed.add(k);
 if(k==='up'){selected=Math.max(0,selected-1);render()}
 else if(k==='down'){selected=Math.min(items().length-1,selected+1);render()}
 else if(k==='left'){if(screen==='message')back();else if(screen==='menu'){selected=Math.max(0,selected-1);render()}else{viewMode=viewMode?0:1;render()}}
 else if(k==='right'){if(screen==='message')back();else if(screen==='menu'){selected=Math.min(items().length-1,selected+1);render()}else{viewMode=viewMode?0:1;render()}}
 else if(k==='ok'||k==='enter'){choose()}
 else if(k==='back'||k==='esc'){back()}
 else if(k==='appsw'){stack=[];screen='home';selected=0;editMode=false;render()}
 else if(k==='power'){show('Power menu: hold Power to simulate shutdown');}
 else if(k==='view'){viewMode=viewMode?0:1;show(viewMode?'View mode enabled':'View mode disabled')}
 else if(k==='edit'){editMode=!editMode;render()}
 else if(k==='run'){if(screen==='home')choose();else show('Run: '+(items()[selected]||'Nothing selected'))}
 else if(k==='ptt'){show('Push-to-talk activated')}
}
window.FlipperOneUI={
 mount:function(el){root=el;screen='home';selected=0;stack=[];viewMode=0;editMode=false;render();const s=document.getElementById('stat');if(s)s.textContent='Flipper One simulation loaded'},
 input:input
};
})();