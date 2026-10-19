(function(){
'use strict';
const home=[
 {name:'Desktop Computer',icon:'▱',children:['Overview','Connected Devices','System Information']},
 {name:'Boot Menu',icon:'◐',children:['Start Flipper One','Recovery Mode','Restart']},
 {name:'Apps',icon:'♧',children:['Radio Lab','Device Link','Field Tools','GPIO Console','Data Studio']},
 {name:'App Manager',icon:'♧',children:['Installed Apps','Check for Updates','Manage Storage']},
 {name:'Files',icon:'▱',children:['Internal Storage','Recent Files','Import File','Create Note','Export Data']},
 {name:'Network',icon:'♧',children:['Wi-Fi','Bluetooth','Connection Status']},
 {name:'Testing: flipctl2',icon:'☷',children:['Run Diagnostics','Input Test','Display Test']},
 {name:'Settings',icon:'⚙',children:['Display','Controls','Power','About Flipper One']}
];
const menus={
 'Radio Lab':['Spectrum','Signal Monitor','Frequency Profiles','Transmit Test'],
 'Device Link':['Nearby Devices','Connection Status','Pair Device'],
 'Field Tools':['Signal Mapper','Range Test','Event Log'],
 'GPIO Console':['Pin Monitor','UART Console','I2C Scanner','SPI Tools'],
 'Data Studio':['Capture Log','Saved Sessions','Export Data'],
 'Display':['Brightness','Theme','Display Test'],
 'Controls':['Button Test','Input Mapping','Vibration'],
 'Power':['Battery Status','Sleep','Shut Down']
};
const actionItems={
 'Overview':['Device status','UI self-test','Refresh screen'],
 'Connected Devices':['Scan for devices','Connection Status'],
 'System Information':['Build information','Runtime information'],
 'Start Flipper One':['Start simulated system'],
 'Recovery Mode':['Enter simulated recovery'],
 'Restart':['Restart UI'],
 'Installed Apps':['Radio Lab','Device Link','Field Tools','GPIO Console','Data Studio'],
 'Check for Updates':['Check update status'],
 'Manage Storage':['Storage summary','Clear demo data'],
 'Internal Storage':['Create Note','Import File','Export Data'],
 'Recent Files':['Open recent file list','Clear recent list'],
 'Wi-Fi':['Scan networks','Toggle Wi-Fi','Connection Status'],
 'Bluetooth':['Scan nearby devices','Toggle Bluetooth','Connection Status'],
 'Connection Status':['Refresh connection status'],
 'Run Diagnostics':['Run UI test','Run navigation test','Run storage test'],
 'Input Test':['Show input instructions','Reset input test'],
 'Display Test':['Run display test','Change brightness'],
 'Spectrum':['Start demo scan','Stop demo scan','Change frequency profile'],
 'Signal Monitor':['Start monitor','Stop monitor','Clear readings'],
 'Frequency Profiles':['Default profile','Low-band demo profile','High-band demo profile'],
 'Transmit Test':['Run safe transmit check'],
 'Nearby Devices':['Scan nearby devices'],
 'Pair Device':['Start simulated pairing','Cancel pairing'],
 'Signal Mapper':['Add demo point','Clear map points'],
 'Range Test':['Start range simulation','Reset range test'],
 'Event Log':['Add test event','Clear event log'],
 'Pin Monitor':['Toggle GPIO pin 1','Toggle GPIO pin 2','Reset GPIO pins'],
 'UART Console':['Send demo message','Clear console'],
 'I2C Scanner':['Run simulated I2C scan'],
 'SPI Tools':['Send demo SPI command','Clear SPI log'],
 'Capture Log':['Start capture','Stop capture','Save capture'],
 'Saved Sessions':['Create sample session','Clear sessions'],
 'Brightness':['Decrease brightness','Increase brightness','Reset brightness'],
 'Theme':['Toggle orange / black theme'],
 'Button Test':['Show input instructions','Reset input test'],
 'Input Mapping':['Show input instructions'],
 'Vibration':['Test simulated vibration'],
 'Battery Status':['Refresh battery status'],
 'Sleep':['Enter sleep mode'],
 'Shut Down':['Power off'],
 'About Flipper One':['Build information','Runtime information']
};
let root=null,selected=0,offset=0,stack=[],powered=true,viewMode=false,editMode=false,brightness=100,alternateTheme=false,notice='',noticeTimer=null,pressed=new Set();
let wifi=false,bluetooth=false,scanCount=0,monitor=false,capture=false,gpio=[false,false],notes=[],sessions=[],events=[],readings=0,range=0,storageUsed=0,inputTests=0;
function current(){return stack.length?stack[stack.length-1].items:home}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function enter(name,items){stack.push({name,items:items||actionItems[name]||['Run action','Show status','Reset']});selected=0;offset=0;render()}
function toast(s){notice=s;render();clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>{notice='';render()},1800)}
function render(){
 if(!root)return;
 if(!powered){root.innerHTML='<div class="fo-screen fo-off"><div class="fo-top"><span class="fo-mark">‹◆›</span><span class="fo-top-right">POWER OFF</span></div><div class="fo-off-message">Flipper One is off<br><small>Press Power to turn on</small></div></div>';return}
 const arr=current();if(selected>=arr.length)selected=Math.max(0,arr.length-1);
 const max=5;if(selected<offset)offset=selected;if(selected>=offset+max)offset=selected-max+1;offset=Math.max(0,Math.min(offset,Math.max(0,arr.length-max)));
 const visible=arr.slice(offset,offset+max);
 const title=stack.length?stack[stack.length-1].name:'FLIPPER ONE';
 const status=notice||(viewMode?'VIEW MODE':editMode?'EDIT MODE':wifi?'WIFI ON':bluetooth?'BT ON':'READY');
 const rows=visible.map((item,j)=>{const i=offset+j;const obj=typeof item==='string'?{name:item,icon:'›'}:item;return '<div class="fo-item '+(i===selected?'selected':'')+'" data-index="'+i+'"><span class="fo-icon">'+esc(obj.icon||'›')+'</span><span class="fo-label">'+esc(obj.name)+'</span></div>'}).join('');
 root.innerHTML='<div class="fo-screen" style="filter:brightness('+brightness+'%)"><div class="fo-top"><span class="fo-mark">‹◆›</span><span class="fo-top-title">'+esc(title)+'</span><span class="fo-top-right">'+esc(status)+'　▰ 100%</span></div><div class="fo-body">'+(rows||'<div class="fo-empty">No items</div>')+'</div><div class="fo-scroll"><span style="top:'+(arr.length>1?(selected/(arr.length-1))*78:0)+'%"></span></div></div>';
 root.querySelectorAll('.fo-item').forEach(el=>el.addEventListener('click',()=>{selected=Number(el.dataset.index);activate()}));
}
function back(){if(!powered){powered=true;stack=[];selected=0;offset=0;render();return}if(stack.length)stack.pop();selected=0;offset=0;notice='';render()}
function activate(){
 if(!powered)return;const item=current()[selected];if(item==null)return;const name=typeof item==='string'?item:item.name;
 if(!stack.length){const top=home[selected];if(top.children){enter(top.name,top.children);return}}
 if(menus[name]){enter(name,menus[name]);return}
 switch(name){
 case 'Desktop Computer':enter(name,actionItems.Overview);return;
 case 'Apps':enter(name,home[2].children);return;
 case 'App Manager':enter(name,actionItems['Installed Apps']);return;
 case 'Files':enter(name,actionItems['Internal Storage']);return;
 case 'Network':enter(name,['Wi-Fi','Bluetooth','Connection Status']);return;
 case 'Settings':enter(name,['Display','Controls','Power','About Flipper One']);return;
 case 'Overview':toast('Device: Flipper One · Mode: browser simulation');return;
 case 'Device status':toast('UI running · hardware not connected');return;
 case 'UI self-test':toast('UI self-test: PASS');return;
 case 'Refresh screen':render();toast('Screen refreshed');return;
 case 'Connected Devices':enter(name,actionItems[name]);return;
 case 'Scan for devices':scanCount++;toast('Scan complete: 0 hardware devices found');return;
 case 'System Information':enter(name,actionItems[name]);return;
 case 'Build information':toast('Build: web simulation · version 0.3');return;
 case 'Runtime information':toast('Runtime: browser JavaScript · hardware bridge unavailable');return;
 case 'Start Flipper One':case 'Start simulated system':toast('Simulated system started');return;
 case 'Recovery Mode':case 'Enter simulated recovery':toast('Recovery mode simulated');return;
 case 'Restart':case 'Restart UI':stack=[];selected=0;offset=0;toast('UI restarted');return;
 case 'Installed Apps':enter(name,actionItems[name]);return;
 case 'Radio Lab':case 'Device Link':case 'Field Tools':case 'GPIO Console':case 'Data Studio':enter(name,menus[name]);return;
 case 'Check for Updates':case 'Check update status':toast('No update service configured');return;
 case 'Manage Storage':enter(name,actionItems[name]);return;
 case 'Storage summary':toast('Demo storage: '+storageUsed+' records');return;
 case 'Clear demo data':notes=[];sessions=[];events=[];storageUsed=0;toast('Demo data cleared');return;
 case 'Internal Storage':enter(name,actionItems[name]);return;
 case 'Recent Files':enter(name,notes.length?notes.map(n=>n.name):['No recent files']);return;
 case 'Open recent file list':toast(notes.length?notes.map(n=>n.name).join(', '):'No recent files');return;
 case 'Clear recent list':notes=[];toast('Recent list cleared');return;
 case 'Import File':{const p=document.createElement('input');p.type='file';p.onchange=()=>{const file=p.files&&p.files[0];if(file){notes.push({name:file.name,text:'Local file selected; content not uploaded'});storageUsed++;toast('Added '+file.name+' to demo file list')}};p.click();return}
 case 'Create Note':{const text=prompt('Enter a note for the emulator:');if(text){notes.push({name:'Note '+(notes.length+1)+'.txt',text});storageUsed++;toast('Note saved in this session')}return}
 case 'Export Data':case 'Export a demo session as a text file':{const data='Flipper One demo export\nNotes:\n'+notes.map(n=>n.name+': '+n.text).join('\n')+'\nEvents:\n'+events.join('\n')+'\nSessions: '+sessions.length;const url=URL.createObjectURL(new Blob([data],{type:'text/plain'}));const a=document.createElement('a');a.href=url;a.download='flipper-one-export.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Export downloaded');return}
 case 'Wi-Fi':enter(name,actionItems[name]);return;
 case 'Toggle Wi-Fi':wifi=!wifi;toast('Wi-Fi '+(wifi?'enabled (simulated)':'disabled'));return;
 case 'Scan networks':toast(wifi?'Scan complete: demo-network found':'Enable Wi-Fi first');return;
 case 'Bluetooth':enter(name,actionItems[name]);return;
 case 'Toggle Bluetooth':bluetooth=!bluetooth;toast('Bluetooth '+(bluetooth?'enabled (simulated)':'disabled'));return;
 case 'Scan nearby devices':toast(bluetooth?'Scan complete: no paired hardware found':'Enable Bluetooth first');return;
 case 'Connection Status':toast('Wi-Fi '+(wifi?'ON':'OFF')+' · Bluetooth '+(bluetooth?'ON':'OFF')+' · Hardware disconnected');return;
 case 'Run Diagnostics':enter(name,actionItems[name]);return;
 case 'Run UI test':toast('UI test: PASS');return;
 case 'Run navigation test':toast('Navigation test: PASS');return;
 case 'Run storage test':toast('Storage test: PASS');return;
 case 'Input Test':case 'Button Test':enter(name,actionItems[name]);return;
 case 'Show input instructions':toast('Arrows navigate · Enter selects · Esc goes back');return;
 case 'Reset input test':inputTests=0;toast('Input test reset');return;
 case 'Display Test':case 'Run display test':toast('Display test: PASS');return;
 case 'Change brightness':brightness=brightness===100?75:100;render();toast('Brightness '+brightness+'%');return;
 case 'Spectrum':case 'Signal Monitor':case 'Frequency Profiles':case 'Transmit Test':case 'Nearby Devices':case 'Pair Device':case 'Signal Mapper':case 'Range Test':case 'Event Log':case 'Pin Monitor':case 'UART Console':case 'I2C Scanner':case 'SPI Tools':case 'Capture Log':case 'Saved Sessions':case 'Brightness':case 'Theme':case 'Controls':case 'Power':case 'Display':case 'Battery Status':case 'Input Mapping':case 'Vibration':enter(name,actionItems[name]||['Start','Stop','Reset']);return;
 case 'Decrease brightness':brightness=Math.max(30,brightness-10);render();toast('Brightness '+brightness+'%');return;
 case 'Increase brightness':brightness=Math.min(120,brightness+10);render();toast('Brightness '+brightness+'%');return;
 case 'Reset brightness':brightness=100;render();toast('Brightness reset');return;
 case 'Toggle orange / black theme':alternateTheme=!alternateTheme;root.querySelector('.fo-screen')?.classList.toggle('fo-alt',alternateTheme);toast(alternateTheme?'Alternate theme on':'Orange theme restored');return;
 case 'Theme':alternateTheme=!alternateTheme;toast(alternateTheme?'Alternate theme on':'Orange theme restored');return;
 case 'Start demo scan':monitor=true;readings=0;toast('Demo scan started');return;
 case 'Stop demo scan':monitor=false;toast('Demo scan stopped · '+readings+' readings');return;
 case 'Change frequency profile':toast('Profile: Default · simulated only');return;
 case 'Start monitor':monitor=true;toast('Signal monitor running in demo mode');return;
 case 'Stop monitor':monitor=false;toast('Signal monitor stopped');return;
 case 'Clear readings':readings=0;toast('Readings cleared');return;
 case 'Default profile':case 'Low-band demo profile':case 'High-band demo profile':toast('Selected '+name);return;
 case 'Run safe transmit check':toast('Transmit blocked: no radio hardware connected');return;
 case 'Start simulated pairing':toast('Pairing simulated; no device connected');return;
 case 'Cancel pairing':toast('Pairing cancelled');return;
 case 'Add demo point':range++;toast('Added map point '+range);return;
 case 'Clear map points':range=0;toast('Map points cleared');return;
 case 'Start range simulation':range=1;toast('Range simulation started');return;
 case 'Reset range test':range=0;toast('Range test reset');return;
 case 'Add test event':events.push('Test event '+(events.length+1));toast('Event recorded');return;
 case 'Clear event log':events=[];toast('Event log cleared');return;
 case 'Toggle GPIO pin 1':gpio[0]=!gpio[0];toast('GPIO 1 '+(gpio[0]?'HIGH':'LOW')+' (simulated)');return;
 case 'Toggle GPIO pin 2':gpio[1]=!gpio[1];toast('GPIO 2 '+(gpio[1]?'HIGH':'LOW')+' (simulated)');return;
 case 'Reset GPIO pins':gpio=[false,false];toast('GPIO pins reset LOW');return;
 case 'Send demo message':toast('UART TX: hello Flipper One (simulated)');return;
 case 'Clear console':toast('Console cleared');return;
 case 'Run simulated I2C scan':toast('I2C scan: no hardware · demo addresses 0x20, 0x48');return;
 case 'Send demo SPI command':toast('SPI command sent in simulation');return;
 case 'Clear SPI log':toast('SPI log cleared');return;
 case 'Start capture':capture=true;toast('Capture started');return;
 case 'Stop capture':capture=false;toast('Capture stopped');return;
 case 'Save capture':sessions.push('Capture '+(sessions.length+1));storageUsed++;toast('Capture saved');return;
 case 'Create sample session':sessions.push('Session '+(sessions.length+1));storageUsed++;toast('Sample session created');return;
 case 'Clear sessions':sessions=[];toast('Sessions cleared');return;
 case 'Test simulated vibration':toast('Vibration simulated');return;
 case 'Refresh battery status':toast('Battery: simulated 100%');return;
 case 'Sleep':case 'Enter sleep mode':powered=false;render();return;
 case 'Shut Down':case 'Power off':powered=false;render();return;
 default:toast(name+': simulated action completed');return;
 }
}
function input(d){
 if(!d||!d.key)return;const k=String(d.key).toLowerCase();
 if(d.type==='up'){pressed.delete(k);return}if(d.type!=='down'||pressed.has(k))return;pressed.add(k);
 if(k==='power'){powered=!powered;if(powered){stack=[];selected=0;offset=0;notice='Powered on'}render();return}
 if(!powered)return;
 if(k==='up') {move(-1);if(stack[stack.length-1]?.name==='Input Test')inputTests++}
 else if(k==='down'){move(1);if(stack[stack.length-1]?.name==='Input Test')inputTests++}
 else if(k==='left'||k==='back'||k==='esc')back();
 else if(k==='right'||k==='ok'||k==='enter')activate();
 else if(k==='appsw'){stack=[];selected=0;offset=0;notice='';render()}
 else if(k==='view'){viewMode=!viewMode;toast(viewMode?'View mode enabled':'View mode disabled')}
 else if(k==='edit'){editMode=!editMode;toast(editMode?'Edit mode enabled':'Edit mode disabled')}
 else if(k==='run')activate();
 else if(k==='ptt')toast('Push-to-talk simulated; no radio hardware connected');
}
window.FlipperOneUI={mount:function(el){root=el;stack=[];selected=0;offset=0;powered=true;render();const s=document.getElementById('stat');if(s)s.textContent='Interactive Flipper One simulation loaded'},input:input};
})();