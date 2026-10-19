(function(){
'use strict';
const home=[
 {name:'Desktop Computer',icon:'▱',children:['Overview','Connected Devices','System Information']},
 {name:'Boot Menu',icon:'◐',children:['Start Flipper One','Recovery Mode','Restart']},
 {name:'Apps',icon:'♧',children:['Radio Lab','Device Link','Field Tools','GPIO Console','Data Studio']},
 {name:'App Manager',icon:'♧',children:['Installed Apps','Check for Updates','Manage Storage']},
 {name:'Files',icon:'▱',children:['Internal Storage','Recent Files','Import File']},
 {name:'Network',icon:'♧',children:['Wi-Fi','Bluetooth','Connection Status']},
 {name:'Testing: flipctl2',icon:'☷',children:['Run Diagnostics','Input Test','Display Test']},
 {name:'Settings',icon:'⚙',children:['Display','Controls','Power','About Flipper One']}
];
const submenus={
 'Radio Lab':['Spectrum','Signal Monitor','Frequency Profiles','Transmit Test'],
 'Device Link':['Nearby Devices','Connection Status','Pair Device'],
 'Field Tools':['Signal Mapper','Range Test','Event Log'],
 'GPIO Console':['Pin Monitor','UART Console','I2C Scanner','SPI Tools'],
 'Data Studio':['Capture Log','Saved Sessions','Export Data'],
 'Display':['Brightness','Theme','Display Test'],
 'Controls':['Button Test','Input Mapping','Vibration'],
 'Power':['Battery Status','Sleep','Shut Down']
};
const details={
 'Overview':['Device: Flipper One','State: Browser simulation','Hardware: Not connected'],
 'Connected Devices':['No connected devices','Connect hardware support is not configured'],
 'System Information':['Flipper One UI','Build: Web simulation','Version: 0.2'],
 'Start Flipper One':['Boot sequence simulated','No firmware is being started'],
 'Recovery Mode':['Recovery environment simulated','No device firmware is connected'],
 'Restart':['Restart the browser UI?'],
 'Radio Lab':['Spectrum','Signal Monitor','Frequency Profiles','Transmit Test'],
 'Device Link':['Nearby Devices','Connection Status','Pair Device'],
 'Field Tools':['Signal Mapper','Range Test','Event Log'],
 'GPIO Console':['Pin Monitor','UART Console','I2C Scanner','SPI Tools'],
 'Data Studio':['Capture Log','Saved Sessions','Export Data'],
 'Installed Apps':['Radio Lab','Device Link','Field Tools','GPIO Console','Data Studio'],
 'Check for Updates':['No update server configured'],
 'Manage Storage':['Browser demo has no device storage access'],
 'Internal Storage':['No files in simulated device storage'],
 'Recent Files':['No recent files'],
 'Import File':['Choose a local file to preview it in this browser demo'],
 'Wi-Fi':['Wi-Fi: simulated / disconnected','No real network control is available'],
 'Bluetooth':['Bluetooth: simulated / disconnected','No device pairing service is configured'],
 'Connection Status':['Disconnected','Hardware bridge not configured'],
 'Run Diagnostics':['UI: PASS','Navigation: PASS','Hardware link: NOT CONNECTED'],
 'Input Test':['Use arrow keys and Enter, or device buttons'],
 'Display Test':['Orange display test is active'],
 'About Flipper One':['Flipper One','Interactive browser UI simulation','Not official firmware'],
 'Spectrum':['Spectrum viewer is simulated; no radio receiver attached'],
 'Signal Monitor':['No signal source connected'],
 'Frequency Profiles':['Demo profile: Default','Demo profile: Low band','Demo profile: High band'],
 'Transmit Test':['Transmit is disabled: no supported hardware connection'],
 'Nearby Devices':['No devices discovered'],
 'Pair Device':['Pairing unavailable in browser-only mode'],
 'Signal Mapper':['Map data source not connected'],
 'Range Test':['Range test requires external hardware'],
 'Event Log':['No events recorded'],
 'Pin Monitor':['GPIO hardware not connected'],
 'UART Console':['UART hardware not connected'],
 'I2C Scanner':['I2C hardware not connected'],
 'SPI Tools':['SPI hardware not connected'],
 'Capture Log':['Demo capture created in memory'],
 'Saved Sessions':['No saved sessions'],
 'Export Data':['Export a demo session as a text file'],
 'Brightness':['Brightness: adjustable demo setting'],
 'Theme':['Theme: orange / black'],
 'Display Test':['Display test passed'],
 'Button Test':['Button input test: press any device button'],
 'Input Mapping':['Arrow keys: navigation · Enter: select · Esc: back'],
 'Vibration':['Vibration is simulated only'],
 'Battery Status':['Battery: simulated 100%'],
 'Sleep':['Sleep is simulated; press Power to wake'],
 'Shut Down':['Use the Power button to turn the UI off']
};
let root=null,selected=0,offset=0,stack=[],page='home',powered=true,viewMode=false,editMode=false,brightness=100,theme=0,notice='',noticeTimer=null,pressed=new Set(),files=[];
function list(){if(page==='home')return home;if(page==='menu')return stack[stack.length-1]?.children||[];if(page==='detail')return details[stack[stack.length-1]?.name]||['No details available'];return []}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function render(){
 if(!root)return;
 if(!powered){root.innerHTML='<div class="fo-screen fo-off"><div class="fo-top"><span class="fo-mark">‹◆›</span><span class="fo-top-right">POWER OFF</span></div><div class="fo-off-message">Flipper One is off<br><small>Press Power to turn on</small></div></div>';return}
 const arr=list();if(selected>=arr.length)selected=Math.max(0,arr.length-1);
 const max=5;if(selected<offset)offset=selected;if(selected>=offset+max)offset=selected-max+1;offset=Math.max(0,Math.min(offset,Math.max(0,arr.length-max)));
 const visible=arr.slice(offset,offset+max);
 const title=page==='home'?'':stack[stack.length-1]?.name||'';
 const status=notice|| (viewMode?'VIEW MODE':editMode?'EDIT MODE':'READY');
 const rows=visible.map((item,j)=>{const i=offset+j;const obj=typeof item==='string'?{name:item,icon:page==='detail'?'·':'›'}:item;return '<div class="fo-item '+(i===selected?'selected':'')+'" data-index="'+i+'"><span class="fo-icon">'+esc(obj.icon||'›')+'</span><span class="fo-label">'+esc(obj.name)+'</span></div>'}).join('');
 root.innerHTML='<div class="fo-screen" style="filter:brightness('+brightness+'%)"><div class="fo-top"><span class="fo-mark">‹◆›</span><span class="fo-top-title">'+esc(title||'FLIPPER ONE')+'</span><span class="fo-top-right">'+esc(status)+'　▰ 100%</span></div><div class="fo-body">'+(rows||'<div class="fo-empty">No items</div>')+'</div><div class="fo-scroll"><span style="top:'+(arr.length>1?(selected/(arr.length-1))*78:0)+'%"></span></div></div>';
 root.querySelectorAll('.fo-item').forEach(el=>el.addEventListener('click',()=>{selected=Number(el.dataset.index);activate()}));
}
function toast(s){notice=s;render();clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>{notice='';render()},1800)}
function move(n){const a=list();if(!a.length)return;selected=(selected+n+a.length)%a.length;render()}
function openDetail(name){stack.push({name,children:submenus[name]||[]});page='detail';selected=0;offset=0;notice='';render()}
function activate(){
 if(!powered)return;
 const a=list(),raw=a[selected];if(!raw)return;const item=typeof raw==='string'?{name:raw}:raw;
 if(page==='home'&&item.children){stack.push(item);page='menu';selected=0;offset=0;notice='';render();return}
 if(page==='menu'&&submenus[item.name]){stack.push(item);page='menu';selected=0;offset=0;render();return}
 if(page==='menu'&&item.name==='Import File'){openDetail(item.name);return}
 if(page==='detail'){
  if(item.name==='Brightness'){brightness=brightness<=60?80:brightness<=80?100:60;toast('Brightness '+brightness+'%');return}
  if(item.name==='Theme'){theme=1-theme;toast(theme?'Alternate theme enabled':'Orange theme enabled');return}
  if(item.name==='Shut Down'){powered=false;render();return}
  if(item.name==='Sleep'){powered=false;render();return}
  if(item.name==='Export Data'){const blob=new Blob(['Flipper One demo export\nStatus: simulation only\n'],{type:'text/plain'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='flipper-one-demo.txt';a.click();URL.revokeObjectURL(url);toast('Demo data exported');return}
  if(item.name==='Import File'){const picker=document.createElement('input');picker.type='file';picker.onchange=()=>{if(picker.files?.[0]){files.push(picker.files[0].name);toast('Selected: '+picker.files[0].name)}};picker.click();return}
  if(submenus[item.name]){stack.push(item);page='menu';selected=0;offset=0;render();return}
  toast(item.name+': '+(details[item.name]?.[0]||'simulation'));return
 }
 openDetail(item.name);
}
function back(){if(!powered){powered=true;page='home';stack=[];selected=0;offset=0;render();return}notice='';if(page==='detail'){stack.pop();page=stack.length?'menu':'home'}else if(page==='menu'){stack.pop();page=stack.length?'menu':'home'}selected=0;offset=0;render()}
function input(d){
 if(!d||!d.key)return;const k=String(d.key).toLowerCase();
 if(d.type==='up'){pressed.delete(k);return}if(d.type!=='down'||pressed.has(k))return;pressed.add(k);
 if(k==='power'){powered=!powered;if(powered){page='home';stack=[];selected=0;offset=0;notice='Powered on'}else notice='';render();return}
 if(!powered)return;
 if(k==='up')move(-1);else if(k==='down')move(1);
 else if(k==='left'||k==='back'||k==='esc')back();
 else if(k==='right'||k==='ok'||k==='enter')activate();
 else if(k==='appsw'){page='home';stack=[];selected=0;offset=0;notice='';render()}
 else if(k==='view'){viewMode=!viewMode;toast(viewMode?'View mode enabled':'View mode disabled')}
 else if(k==='edit'){editMode=!editMode;toast(editMode?'Edit mode enabled':'Edit mode disabled')}
 else if(k==='run')activate();
 else if(k==='ptt')toast('Push-to-talk is simulated; no radio hardware connected');
}
window.FlipperOneUI={mount:function(el){root=el;page='home';selected=0;offset=0;stack=[];powered=true;render();const s=document.getElementById('stat');if(s)s.textContent='Interactive Flipper One simulation loaded'},input:input};
})();