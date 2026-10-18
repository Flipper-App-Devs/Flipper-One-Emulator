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
const actions={
 'Overview':'Desktop Computer overview','Connected Devices':'No devices connected','System Information':'Flipper One · Browser simulation',
 'Start Flipper One':'Boot request simulated','Recovery Mode':'Recovery mode simulated','Restart':'Restart simulated',
 'Radio Lab':'Radio tools opened','Device Link':'Device Link opened','Field Tools':'Field Tools opened','GPIO Console':'GPIO Console opened','Data Studio':'Data Studio opened',
 'Installed Apps':'Installed apps list','Check for Updates':'No updates available in this demo','Manage Storage':'Storage manager opened',
 'Internal Storage':'No files in simulated storage','Recent Files':'No recent files','Import File':'File import is simulation-only',
 'Wi-Fi':'Wi-Fi settings opened','Bluetooth':'Bluetooth settings opened','Connection Status':'Disconnected · simulation',
 'Run Diagnostics':'Diagnostics complete · demo only','Input Test':'All button inputs detected','Display Test':'Display test passed',
 'Display':'Display settings opened','Controls':'Controls settings opened','Power':'Power settings opened','About Flipper One':'Flipper One · browser UI simulation'
};
let root=null,selected=0,offset=0,stack=[],page='home',notice='',noticeTimer=null,viewMode=0,editMode=false,powered=true;
const pressed=new Set();
function current(){return page==='home'?home:page==='menu'?(stack[stack.length-1]?.children||[]):[]}
function render(){
 if(!root)return;
 if(!powered){root.innerHTML='<div class="fo-screen fo-off"><div class="fo-top"><span class="fo-mark">‹◆›</span><span class="fo-top-right">POWER OFF</span></div><div class="fo-off-message">Flipper One is off<br><small>Press Power to turn on</small></div></div>';return}
 const list=current();selected=Math.max(0,Math.min(selected,Math.max(0,list.length-1)));
 const max=5;if(selected<offset)offset=selected;if(selected>=offset+max)offset=selected-max+1;offset=Math.max(0,Math.min(offset,Math.max(0,list.length-max)));
 const visible=list.slice(offset,offset+max);
 const status=notice?notice:(viewMode?'VIEW MODE':'READY');
 const rows=visible.map((item,j)=>{const i=offset+j;const obj=typeof item==='string'?{name:item,icon:'›'}:item;return '<div class="fo-item '+(i===selected?'selected':'')+'" data-index="'+i+'"><span class="fo-icon">'+obj.icon+'</span><span class="fo-label">'+obj.name+'</span></div>'}).join('');
 root.innerHTML='<div class="fo-screen"><div class="fo-top"><span class="fo-mark">‹◆›</span><span class="fo-top-right">'+status+'　▰ 100%</span></div><div class="fo-body">'+rows+'</div><div class="fo-scroll"><span style="top:'+(list.length>1?(selected/(list.length-1))*78:0)+'%"></span></div></div>';
 root.querySelectorAll('.fo-item').forEach(el=>el.addEventListener('click',()=>{selected=Number(el.dataset.index);choose()}));
}
function toast(s){notice=s;render();clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>{notice='';render()},1700)}
function move(n){const list=current();if(!list.length)return;selected=(selected+n+list.length)%list.length;render()}
function choose(){
 if(!powered)return;
 const list=current(),raw=list[selected];if(!raw)return;const item=typeof raw==='string'?{name:raw}:raw;
 if(page==='home'&&item.children){stack.push(item);page='menu';selected=0;offset=0;notice='';render();return}
 const result=actions[item.name]||item.name+' opened · simulation';
 if(['Start Flipper One','Restart'].includes(item.name)){toast(result);return}
 if(item.name==='Power'){toast(result);return}
 page='detail';stack.push({name:item.name,children:[]});selected=0;offset=0;toast(result);
}
function back(){if(!powered){powered=true;page='home';selected=0;offset=0;render();return}notice='';if(page==='detail'){stack.pop();page=stack.length?'menu':'home';selected=0;offset=0;render();return}if(page==='menu'){stack.pop();page=stack.length?'menu':'home';selected=0;offset=0;render();return}selected=0;offset=0;render()}
function input(d){
 if(!d||!d.key)return;const k=String(d.key).toLowerCase();
 if(d.type==='up'){pressed.delete(k);return}if(d.type!=='down'||pressed.has(k))return;pressed.add(k);
 if(k==='power'){powered=!powered;if(powered){page='home';stack=[];selected=0;offset=0;notice='Powered on'}else notice='';render();return}
 if(!powered)return;
 if(k==='up')move(-1);else if(k==='down')move(1);
 else if(k==='left'||k==='back'||k==='esc')back();
 else if(k==='right'||k==='ok'||k==='enter')choose();
 else if(k==='appsw'){page='home';stack=[];selected=0;offset=0;notice='';render()}
 else if(k==='view'){viewMode=viewMode?0:1;toast(viewMode?'View mode enabled':'View mode disabled')}
 else if(k==='edit'){editMode=!editMode;toast(editMode?'Edit mode enabled':'Edit mode disabled')}
 else if(k==='run'){choose()}
 else if(k==='ptt'){toast('Push-to-talk · simulation')}
}
window.FlipperOneUI={mount:function(el){root=el;page='home';selected=0;offset=0;stack=[];powered=true;render();const s=document.getElementById('stat');if(s)s.textContent='Flipper One UI simulation loaded'},input:input};
})();