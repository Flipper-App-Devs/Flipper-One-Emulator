(function(){
'use strict';
const apps=[
 {name:'Sub-GHz',desc:'Radio frequency tools',items:['Read','Saved','Frequency Analyzer','Add Manually']},
 {name:'NFC',desc:'Near-field communication',items:['Read','Saved','Add manually']},
 {name:'RFID',desc:'125 kHz RFID',items:['Read','Saved','Add manually']},
 {name:'Infrared',desc:'Infrared remote control',items:['Universal Remotes','TV','Saved','Learn New Remote']},
 {name:'GPIO',desc:'Hardware pins',items:['Pinout','UART','I2C','SPI']},
 {name:'iButton',desc:'Dallas key tools',items:['Read','Saved']},
 {name:'BadUSB',desc:'USB keyboard simulation',items:['Run script','Saved','Update']},
 {name:'U2F',desc:'Security keys',items:['Info','Settings']},
 {name:'Settings',desc:'Device settings',items:['Bluetooth','Display','Power','About']}
];
let root=null,screen='home',selected=0,stack=[],message='',messageTimer=null,pressed=new Set(),homeSelected=0;
const homeItems=['Sub-GHz','NFC','RFID','Infrared','GPIO','iButton','BadUSB','U2F','Settings'];
function currentItems(){if(screen==='home')return homeItems;if(screen==='app'){const a=apps.find(x=>x.name===stack[stack.length-1]);return a?a.items:[]}return []}
function draw(){
 if(!root)return;
 const items=currentItems();if(selected>=items.length)selected=Math.max(0,items.length-1);
 const appName=screen==='home'?'MAIN MENU':stack[stack.length-1]||'FLIPPER ONE';
 const body=screen==='notice'?'<div class="fo-message">'+escapeHtml(message)+'<div class="fo-muted">Press OK or Back</div></div>':screen==='details'?'<div class="fo-message"><b>'+escapeHtml(message)+'</b><br><br><span class="fo-muted">Simulation only<br>No radio hardware connected</span></div>':items.map((item,i)=>'<div class="fo-item '+(i===selected?'selected':'')+'"><span class="fo-cursor">'+(i===selected?'▶':'')+'</span><span>'+escapeHtml(item)+'</span></div>').join('');
 root.innerHTML='<div class="fo-screen"><div class="fo-status"><span>◉ FLIPPER</span><span>▮▮▮　100%</span></div><div class="fo-title">'+escapeHtml(appName)+'</div><div class="fo-body">'+body+'</div><div class="fo-footer"><span>▲▼ Navigate</span><span>OK Select　↩ Back</span></div></div>';
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function notify(text){screen='notice';message=text;draw();clearTimeout(messageTimer);messageTimer=setTimeout(()=>{if(screen==='notice'){screen=stack.length?'app':'home';draw()}},2200)}
function back(){if(screen==='notice'||screen==='details'){screen=stack.length?'app':'home';message='';draw();return}if(stack.length){stack.pop();screen=stack.length?'app':'home';selected=0;draw()}else{selected=0;draw()}}
function choose(){if(screen==='notice'||screen==='details'){back();return}const item=currentItems()[selected];if(!item)return;if(screen==='home'){stack.push(item);screen='app';selected=0;draw();return}const app=apps.find(a=>a.name===stack[stack.length-1]);if(app&&app.items.includes(item)){message=item;screen='details';draw()}}
function input(detail){if(!detail||!detail.key)return;const key=String(detail.key).toLowerCase();if(detail.type==='up'){pressed.delete(key);return}if(detail.type==='down'&&pressed.has(key))return;pressed.add(key);
 if(key==='up'){if(screen==='notice'||screen==='details')return;selected=Math.max(0,selected-1);draw()}
 else if(key==='down'){if(screen==='notice'||screen==='details')return;selected=Math.min(currentItems().length-1,selected+1);draw()}
 else if(key==='ok'||key==='enter'){choose()}
 else if(key==='back'||key==='esc'){back()}
 else if(key==='left'){back()}
 else if(key==='right'){choose()}
 else if(key==='appsw'){screen='home';stack=[];selected=0;draw()}
 else if(key==='power'){notify('Power menu · simulation')}
 else if(key==='ptt'){notify('Push-to-talk · simulation')}
}
window.FlipperOneUI={
 mount:function(element){root=element;screen='home';selected=0;stack=[];draw();},
 input:input
};
})();