(function(){
'use strict';
const homeItems=[
 {name:'Desktop Computer',icon:'▱'},
 {name:'Boot Menu',icon:'◐'},
 {name:'Apps',icon:'♧'},
 {name:'App Manager',icon:'♧'},
 {name:'Files',icon:'▱'},
 {name:'Network',icon:'♧'},
 {name:'Testing: flipctl2',icon:'☷'},
 {name:'Settings',icon:'⚙'}
];
let root=null,selected=0,offset=0,stack=[],message='',pressed=new Set();
function render(){
 if(!root)return;
 const visible=homeItems.slice(offset,offset+5);
 root.innerHTML='<div class="fo-screen"><div class="fo-top"><span class="fo-mark">‹◆›</span><span class="fo-top-right"></span></div><div class="fo-body">'+visible.map((item,j)=>{const i=offset+j;return '<div class="fo-item '+(i===selected?'selected':'')+'" data-index="'+i+'"><span class="fo-icon">'+item.icon+'</span><span class="fo-label">'+item.name+'</span></div>'}).join('')+'</div><div class="fo-scroll"><span style="top:'+((selected/(homeItems.length-1))*78)+'%"></span></div></div>';
}
function move(n){selected=Math.max(0,Math.min(homeItems.length-1,selected+n));if(selected<offset)offset=selected;if(selected>=offset+5)offset=selected-4;render()}
function choose(){const item=homeItems[selected];if(item){message=item.name;}}
function back(){selected=0;offset=0;render()}
function input(d){
 if(!d||!d.key)return;const k=String(d.key).toLowerCase();
 if(d.type==='up'){pressed.delete(k);return}
 if(d.type!=='down'||pressed.has(k))return;pressed.add(k);
 if(k==='up')move(-1);else if(k==='down')move(1);
 else if(k==='left'||k==='back'||k==='esc')back();
 else if(k==='right'||k==='ok'||k==='enter')choose();
 else if(k==='appsw'){selected=0;offset=0;render()}
}
window.FlipperOneUI={mount:function(el){root=el;selected=0;offset=0;render();const s=document.getElementById('stat');if(s)s.textContent='Flipper One UI simulation loaded'},input:input};
})();