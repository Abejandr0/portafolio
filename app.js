const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const board = $('#board');
const viewport = $('#mapViewport');
const program = $('#programBlocks');
const workspace = $('#workspace');
const trash = $('#trashZone');
const columns = 5;
const rows = 16;
const path = [[2,15],[2,14],[2,13],[3,13],[4,13],[4,12],[4,11],[3,11],[2,11],[2,10],[2,9],[1,9],[0,9],[0,8],[0,7],[1,7],[2,7],[2,6],[2,5],[3,5],[4,5],[4,4],[4,3],[3,3],[2,3],[2,2],[2,1],[2,0]];
const pathSet = new Set(path.map(([x,y]) => `${x},${y}`));
const directions = [
  {x:0,y:-1,face:'north',label:'NORTE',arrow:'↑'},
  {x:1,y:0,face:'east',label:'ESTE',arrow:'→'},
  {x:0,y:1,face:'south',label:'SUR',arrow:'↓'},
  {x:-1,y:0,face:'west',label:'OESTE',arrow:'←'}
];
const commandsInfo = {
  move:{label:'Avanzar 1 casilla',symbol:'↑',color:'move-block'},
  jump:{label:'Saltar 2 casillas',symbol:'⌁',color:'jump-block'},
  right:{label:'Girar 90° a la derecha',symbol:'↻',color:'turn-block'},
  left:{label:'Girar 90° a la izquierda',symbol:'↺',color:'turn-block'},
  interact:{label:'Abrir cofre',symbol:'✦',color:'interact-block'}
};
const chests = [
  {x:2,y:13,pathIndex:2,title:'Hola, soy Alejandro',kicker:'COFRE 1 · SOBRE MÍ',text:'Soy Alejandro, estudiante de diseño de interfaces. Me gusta convertir ideas en experiencias digitales claras, útiles y llenas de personalidad.',art:'bee'},
  {x:4,y:11,pathIndex:6,title:'Habilidades que cultivo',kicker:'COFRE 2 · HABILIDADES',text:'Estoy aprendiendo diseño visual, prototipado y desarrollo web. Me encanta probar, iterar y descubrir formas más intuitivas de resolver un problema.',art:'spark'},
  {x:2,y:9,pathIndex:10,title:'Proyectos en construcción',kicker:'COFRE 3 · PROYECTOS',text:'Cada proyecto representa una idea que llevé a la práctica. Explora el código y descubre un poco más de lo que he creado.',art:'chest'},
  {x:0,y:7,pathIndex:14,title:'Mi forma de crear',kicker:'COFRE 4 · PROCESO',text:'Aquí podemos contar cómo conviertes una idea en un proyecto: desde los primeros bocetos hasta las pruebas y ajustes finales.',art:'spark'},
  {x:2,y:7,pathIndex:16,title:'Lo que quiero explorar',kicker:'COFRE 5 · PRÓXIMO NIVEL',text:'Este espacio queda listo para contar qué tecnologías, retos o áreas me gustaría explorar en mis próximos proyectos.',art:'flag'},
  {x:4,y:3,pathIndex:22,title:'¡Gracias por jugar!',kicker:'COFRE 6 · CONTACTO',text:'Llegaste al final del sendero. Me interesa colaborar, aprender y crear cosas interesantes. Encuéntrame en Instagram o GitHub.',art:'flag'}
];
const projectLinks = [
  {label:'MotoTracer',href:'https://github.com/Abejandr0/mototracer'},
  {label:'MotoMod',href:'https://github.com/Abejandr0/mods-app'},
  {label:'Honey',href:'https://github.com/Abejandr0/honey'},
  {label:'CodeType',href:'https://github.com/Abejandr0/codeType'}
];
const contactLinks = [
  {label:'Instagram · @alejojcastro',href:'https://www.instagram.com/alejojcastro/'},
  {label:'GitHub · Abejandr0',href:'https://github.com/Abejandr0'}
];
const spawn = {x:2,y:15,dir:0};
const checkpoints = {
  start:{x:2,y:13,dir:1,chestIndex:0},
  skills:{x:4,y:11,dir:3,chestIndex:1},
  projects:{x:2,y:9,dir:3,chestIndex:2},
  process:{x:0,y:7,dir:1,chestIndex:3},
  ideas:{x:2,y:7,dir:0,chestIndex:4},
  finish:{x:4,y:3,dir:3,chestIndex:5}
};
const scenery = {
  tree:`<svg viewBox="0 0 64 72" aria-hidden="true"><ellipse cx="33" cy="66" rx="19" ry="4" fill="#527d4a" opacity=".2"/><path d="M29 43c1-4 1-8 0-12h9c-1 5-1 9 1 13l4 20H25z" fill="#895d40"/><path d="m31 49 1 13m5-13 2 12" fill="none" stroke="#b17b51" stroke-width="1.4" stroke-linecap="round" opacity=".7"/><path d="M32 5c-2 6-6 11-11 16 3 0 5 0 7-1-5 6-10 11-15 16 4 0 7-.2 10-1C17 41 12 46 8 51c8 1 15 1 22 0l2 8c1 2 4 2 5 0l2-8c6 1 12 1 18 0-4-5-9-10-15-16 3 1 6 1 10 1-4-5-9-10-14-16 2 1 4 1 7 1-5-5-9-10-12-16-1-2-2-2-3 0Z" fill="#16785d"/><path d="M32 9c-3 7-8 13-13 18 5-.5 9-2 13-5-4 6-9 12-16 18 7 0 13-2 18-6-4 7-9 13-15 19 7 .2 13-.5 18-2-2-6-5-11-9-17 4 3 8 5 13 6-5-6-9-12-12-18 3 2 6 3 9 3-4-5-7-10-9-16Z" fill="#27966a"/><path d="M21 26c3-4 6-8 8-12m-12 27c5-1 9-3 13-6m7-15c2 3 4 5 7 7" fill="none" stroke="#7bc478" stroke-width="2" stroke-linecap="round" opacity=".8"/><path d="m28 37 4-2 4 2" fill="none" stroke="#a9dc86" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  rock:`<svg viewBox="0 0 64 60" aria-hidden="true"><ellipse cx="33" cy="51" rx="23" ry="5" fill="#516775" opacity=".18"/><path d="M9 43c1-5 3-10 6-15 1-2 3-3 5-4 2-5 6-9 11-12 3-2 6-2 9 0l6 5c4 1 7 4 9 8l4 11c2 4 0 8-4 10-5 2-11 2-17 2l-18-1c-7 0-11-1-11-4Z" fill="#718794"/><path d="M16 29c3-2 6-6 9-11 2-3 5-4 8-3l7 3-8 14-13 6Z" fill="#c5d3d1"/><path d="m34 32 8-14 5 4 7 14-13 3Z" fill="#a5b8bb"/><path d="m20 39 13-7 8 8 8 1-4 8H21c-4 0-6-5-1-10Z" fill="#647a87"/><path d="m27 19 5-4m5 20 6 7m-23-8 5 2" fill="none" stroke="#e3e9dd" stroke-width="1.5" stroke-linecap="round" opacity=".75"/><path d="M13 43c7 4 27 4 39 0" fill="none" stroke="#91a5a8" stroke-width="1.5" stroke-linecap="round" opacity=".7"/></svg>`,
  flower:`<svg viewBox="0 0 64 64" aria-hidden="true"><ellipse cx="32" cy="59" rx="13" ry="3" fill="#53794a" opacity=".17"/><path d="M32 58c0-9 1-18 0-27" fill="none" stroke="#477b51" stroke-width="3.5" stroke-linecap="round"/><path d="M31 48c-8-8-14-8-18-3 5 7 11 10 18 8m2-13c6-9 12-12 17-9-2 8-8 13-17 15" fill="#5eaa68"/><path d="M18 44c4 1 8 4 11 7m10-9c4-4 7-6 10-7" fill="none" stroke="#91cb78" stroke-width="1.5" stroke-linecap="round"/><path d="M32 29c-2-6-11-10-10-17 1-5 6-6 10 1 3-8 9-8 11-3 2 5-4 12-9 19 8-5 16-3 16 2 0 6-8 8-17 4 5 7 3 13-2 13-6 0-8-7-5-14-7 5-15 4-16-1-1-5 6-9 16-6-6-5-7-11-3-13 4-2 9 2 9 9Z" fill="#ee8295"/><path d="M28 18c2 2 3 5 4 8 2-5 5-9 8-11m-20 16c3 0 6 1 9 3m8 8c-1-3-2-5-4-7" fill="none" stroke="#ffb0a9" stroke-width="1.4" stroke-linecap="round" opacity=".85"/><circle cx="32" cy="29" r="6" fill="#f7c64a"/><circle cx="30" cy="27" r="1.1" fill="#ffe794"/><circle cx="34" cy="30" r=".9" fill="#c88a32"/></svg>`,
  stump:`<svg viewBox="0 0 64 64" aria-hidden="true"><ellipse cx="33" cy="57" rx="19" ry="4" fill="#6b573f" opacity=".18"/><path d="M17 23c1-4 5-7 14-7h7c8 0 12 3 13 8l-3 31c-1 4-6 6-15 6s-14-2-15-6Z" fill="#956643"/><path d="M19 30c8 4 20 4 30 0l-1 6c-9 4-20 4-29 0Zm-1 15c8 4 19 4 29 1l-1 5c-8 4-19 4-28 1Z" fill="#aa7650" opacity=".9"/><path d="M20 25c2-3 5-4 11-4h7c5 0 8 1 10 4-1 4-7 7-14 7s-13-3-14-7Z" fill="#d6ae75"/><ellipse cx="34" cy="25" rx="8" ry="4" fill="none" stroke="#a9784f" stroke-width="1.8"/><ellipse cx="34" cy="25" rx="3.2" ry="1.6" fill="none" stroke="#bb8a59" stroke-width="1.3"/><path d="M21 28c4 2 9 3 13 3 6 0 11-2 14-4" fill="none" stroke="#efd198" stroke-width="1.2" stroke-linecap="round"/><path d="M44 17c2-3 5-4 8-3m-2 6c2-1 4-1 6 0" fill="none" stroke="#78ad69" stroke-width="3" stroke-linecap="round"/></svg>`
};
let player = {...spawn};
let commands = [];
let opened = new Set();
let steps = 0;
let isRunning = false;
let draggedIndex = null;
let discoveryResolver = null;
let lastPlayerCell = null;

const key = (x,y) => `${x},${y}`;
const pause = ms => new Promise(resolve => setTimeout(resolve,ms));
function beeMarkup(){return `<svg class="bee-svg" viewBox="0 0 72 72" role="img" aria-label="Abeja exploradora"><ellipse class="bee-wing wing-a" cx="25" cy="20" rx="9" ry="14"/><ellipse class="bee-wing wing-b" cx="47" cy="20" rx="9" ry="14"/><path d="M17 42c0-12 8-22 19-22s19 10 19 22c0 9-8 17-19 19-11-2-19-10-19-19Z" fill="#f7bd39"/><path d="M23 29c-3 5-4 11-3 17 1 5 3 9 6 11 3-1 5-3 6-5-3-8-3-16 0-24-3-2-6-1-9 1Zm17-2c-3 8-3 17 0 25 2 3 5 5 8 6 4-4 6-9 7-15 0-6-2-11-5-15-3-2-7-2-10-1Z" fill="#40384b"/><path d="M18 41c0-12 8-21 18-21s18 9 18 21" fill="none" stroke="#ffe27a" stroke-width="2.2" stroke-linecap="round" opacity=".9"/><path d="M28 38c0-2 1-3 3-3s3 1 3 3-1 3-3 3-3-1-3-3Zm11 0c0-2 1-3 3-3s3 1 3 3-1 3-3 3-3-1-3-3Z" fill="#fff"/><circle cx="32" cy="38" r="1.5" fill="#27324a"/><circle cx="43" cy="38" r="1.5" fill="#27324a"/><path d="M33 46q3 3 7 0" fill="none" stroke="#6e4650" stroke-width="1.7" stroke-linecap="round"/><path d="m33 21-3-7m9 7 4-7" fill="none" stroke="#6e4650" stroke-width="1.8" stroke-linecap="round"/><circle cx="30" cy="14" r="2" fill="#f28c94"/><circle cx="44" cy="14" r="2" fill="#f28c94"/><path d="m36 59 3 6-6-1z" fill="#40384b"/><path d="M22 48c2 5 6 8 12 10" fill="none" stroke="#ffd969" stroke-width="1.5" stroke-linecap="round" opacity=".85"/></svg>`}
function artMarkup(type){
  const drawings = {
    bee:beeMarkup(),
    spark:'<svg viewBox="0 0 64 64" aria-hidden="true"><path d="m32 5 6 19 19 8-19 7-6 20-7-20-19-7 19-8z" fill="#ffc940" stroke="#d99928" stroke-width="2"/><circle cx="48" cy="15" r="4" fill="#f58b9a"/><circle cx="14" cy="48" r="3" fill="#62bb8b"/></svg>',
    chest:'<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M9 27h46v27H9z" fill="#e99d38" stroke="#a65d35" stroke-width="3"/><path d="M7 22q0-8 8-8h34q8 0 8 8v8H7z" fill="#ffc447" stroke="#a65d35" stroke-width="3"/><path d="M27 29h10v12H27z" rx="3" fill="#fff0b0" stroke="#a65d35" stroke-width="2"/><circle cx="32" cy="35" r="2" fill="#a65d35"/></svg>',
    flag:'<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M17 8v49" stroke="#65738b" stroke-width="4" stroke-linecap="round"/><path d="M20 10h31L43 22l8 11H20z" fill="#74c879" stroke="#3c9363" stroke-width="2" stroke-linejoin="round"/><path d="M13 58h14" stroke="#65738b" stroke-width="4" stroke-linecap="round"/></svg>'
  };
  return drawings[type] || drawings.spark;
}
function scenicType(x,y){const n=(x*7+y*11)%4;return ['tree','rock','flower','stump'][n]}
function buildBoard(){
  board.style.setProperty('--rows',rows);
  board.replaceChildren();
  for(let y=0;y<rows;y++)for(let x=0;x<columns;x++){
    const tile=document.createElement('div');tile.className='cell';tile.setAttribute('role','gridcell');tile.dataset.x=x;tile.dataset.y=y;
    if(pathSet.has(key(x,y)))tile.classList.add('walkable');else tile.classList.add('obstacle');
    const index=path.findIndex(([px,py])=>px===x&&py===y);
    if(index>=0){tile.style.setProperty('--path-order',index);if(index%2===0)tile.classList.add('path-sunlit')}
    const chestIndex=chests.findIndex(chest=>chest.x===x&&chest.y===y);
    if(chestIndex>=0){tile.classList.add('chest-cell');const art=document.createElement('span');art.className='tile-art chest-art';art.innerHTML=artMarkup('chest');tile.append(art);const badge=document.createElement('span');badge.className='treasure-count';badge.textContent=String(chestIndex+1);tile.append(badge)}
    else if(index<0){const type=scenicType(x,y);const art=document.createElement('span');art.className=`tile-art obstacle-art ${type}-art`;art.innerHTML=scenery[`${x},${y}`]||scenery[type];tile.append(art)}
    else if(index===path.length-1){const goal=document.createElement('span');goal.className='tile-art goal-art';goal.innerHTML=artMarkup('flag');tile.append(goal)}
    board.append(tile);
  }
}
function updateCamera(){
  const tile=board.querySelector('.cell');if(!tile||!viewport.clientHeight)return;
  const stride=tile.getBoundingClientRect().height+parseFloat(getComputedStyle(board).rowGap||'0');
  const maxOffset=Math.max(0,board.scrollHeight-viewport.clientHeight);
  const desired=player.y*stride+tile.clientHeight/2-viewport.clientHeight/2;
  const offset=Math.max(0,Math.min(maxOffset,desired));
  board.style.transform=`translate3d(0,${-offset}px,0)`;
}
function updateDirection(){const direction=directions[player.dir];$('#compassArrow').textContent=direction.arrow;$('#compassArrow').style.setProperty('--compass-turn',`${player.dir*90}deg`);$('#headingLabel').textContent=direction.label}
function settleChest(index){
  const chest=chests[index];if(!chest)return;const tile=$(`.cell[data-x="${chest.x}"][data-y="${chest.y}"]`,board);if(!tile)return;
  tile.querySelector('.chest-art')?.remove();tile.querySelector('.treasure-count')?.remove();tile.classList.remove('chest-cell','chest-glow','opened-chest','chest-unsealing');tile.classList.add('revealed-path');
}
function renderBoard(animateChest=-1){
  $$('.cell',board).forEach(tile=>{tile.classList.remove('player-cell');$('.bee',tile)?.remove()});
  const current=$(`.cell[data-x="${player.x}"][data-y="${player.y}"]`,board);
  if(current){current.classList.add('player-cell');const wrapper=document.createElement('span');wrapper.className='bee';wrapper.style.setProperty('--heading-turn',`${player.dir*90}deg`);wrapper.innerHTML=`${beeMarkup()}<span class="bee-heading" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3 5.5 11h4.2v10h4.6V11h4.2L12 3Z"/></svg></span>`;wrapper.setAttribute('aria-label',`Abeja mirando al ${directions[player.dir].label.toLowerCase()}`);current.append(wrapper);if(lastPlayerCell!==key(player.x,player.y)){wrapper.classList.add('bee-arrive');lastPlayerCell=key(player.x,player.y)}}
  chests.forEach((chest,index)=>{const tile=$(`.cell[data-x="${chest.x}"][data-y="${chest.y}"]`,board);if(!tile)return;if(opened.has(index)){if(index===animateChest&&$('.chest-art',tile)){tile.classList.add('opened-chest','chest-unsealing');$('.chest-art',tile).innerHTML=artMarkup('spark');window.setTimeout(()=>settleChest(index),900)}else settleChest(index)}else{tile.classList.remove('revealed-path','opened-chest','chest-unsealing');tile.classList.add('chest-cell','chest-glow');let art=$('.chest-art',tile);if(!art){art=document.createElement('span');art.className='tile-art chest-art';const badge=document.createElement('span');badge.className='treasure-count';badge.textContent=String(index+1);tile.append(art,badge)}art.innerHTML=artMarkup('chest')}});
  board.classList.toggle('mission-complete',opened.size===chests.length);
  $('#mapAltitude').textContent=`ALT. ${String((rows-1-player.y)*12).padStart(2,'0')} M`;
  updateDirection();updateCamera();
}
function renderCommands(){
  program.replaceChildren();
  commands.forEach((op,index)=>{
    const info=commandsInfo[op];const item=document.createElement('div');item.className=`program-block ${info.color}`;item.draggable=true;item.dataset.index=index;
    const num=document.createElement('span');num.className='block-index';num.textContent=String(index+1).padStart(2,'0');
    const glyph=document.createElement('span');glyph.className='sequence-glyph';glyph.textContent=info.symbol;
    const label=document.createElement('span');label.className='sequence-label';label.textContent=info.label;
    const remove=document.createElement('button');remove.className='remove-block';remove.type='button';remove.setAttribute('aria-label',`Quitar ${info.label}`);remove.textContent='×';remove.addEventListener('click',()=>removeCommand(index));
    item.append(num,glyph,label,remove);
    item.addEventListener('dragstart',event=>{draggedIndex=index;event.dataTransfer.setData('text/plain',`reorder:${index}`);event.dataTransfer.effectAllowed='move';item.classList.add('dragging')});
    item.addEventListener('dragend',()=>{item.classList.remove('dragging');draggedIndex=null;trash.classList.remove('is-over')});
    item.addEventListener('dragover',event=>event.preventDefault());item.addEventListener('drop',event=>{event.preventDefault();event.stopPropagation();const value=event.dataTransfer.getData('text/plain');if(value.startsWith('reorder:'))moveCommand(Number(value.split(':')[1]),index)});
    program.append(item);
  });
  $('#dropPrompt').hidden=commands.length>0;$('#blockCount').textContent=String(commands.length).padStart(2,'0');
}
function updateProgress(){
  const count=opened.size,total=chests.length;$('#progressText').textContent=`${count} / ${total}`;
  $('#missionCount').innerHTML=`${count} <i>/ ${total}</i>`;
  $('#honeyTrack').replaceChildren(...Array.from({length:total},(_,i)=>{const segment=document.createElement('span');segment.className=`honey-segment${opened.has(i)?' is-filled':''}`;segment.setAttribute('aria-label',`Cofre ${i+1}${opened.has(i)?' descubierto':' pendiente'}`);return segment}));
  $('#progressRail').replaceChildren(...chests.map((_,i)=>{const node=document.createElement('span');node.className=`progress-stop${opened.has(i)?' is-done':''}`;node.innerHTML='<i></i>';node.setAttribute('aria-label',`Checkpoint ${i+1}${opened.has(i)?' completado':' pendiente'}`);return node}));
  $('#stepsText').textContent=steps;
  $$('.checkpoint').forEach(button=>{const point=checkpoints[button.dataset.checkpoint];button.classList.toggle('active',point.x===player.x&&point.y===player.y);const index=chests.findIndex(chest=>chest.x===point.x&&chest.y===point.y);button.classList.toggle('visited',index>=0&&opened.has(index))});
}
function advice(title,message){$('#assistantTitle').textContent=title;$('#assistantMessage').textContent=message}
async function notify(message){
  const assistant=$('#assistant');assistant.classList.add('show','attention');advice('Búho guía',message);setTimeout(()=>assistant.classList.remove('attention'),550);
  const endpoint=window.PORTFOLIO_CONFIG?.aiCoachEndpoint;if(!endpoint)return;
  try{const response=await fetch(endpoint,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({message,player:{x:player.x,y:player.y,direction:directions[player.dir].label},openedChests:[...opened],steps})});if(!response.ok)return;const result=await response.json();if(typeof result.message==='string'&&result.message.trim())advice('Búho guía',result.message.trim().slice(0,280))}catch{/* Pistas locales disponibles sin configurar IA. */}
}
function renderLinks(items){const container=$('#discoveryLinks');container.replaceChildren();items.forEach(item=>{const link=document.createElement('a');link.href=item.href;link.target='_blank';link.rel='noopener noreferrer';link.textContent=item.label;const arrow=document.createElement('span');arrow.textContent=' ↗';link.append(arrow);container.append(link)})}
function reveal(index){
  const chest=chests[index];const complete=opened.size===chests.length;$('#discoveryKicker').textContent=complete?`¡MISIÓN COMPLETADA! · ${chests.length}/${chests.length} COFRES`:chest.kicker;$('#discoveryTitle').textContent=complete?'¡Llegaste a la meta!':chest.title;$('#discoveryText').textContent=complete?'Abriste todos los cofres y completaste mi aventura. Soy Alejandro y me encantaría que sigamos en contacto.':chest.text;$('#discoveryArt').innerHTML=artMarkup(complete?'flag':chest.art);renderLinks(index===2?projectLinks:index===5?contactLinks:[]);const card=$('#discoveryCard');card.classList.toggle('complete',complete);card.classList.remove('show');void card.offsetWidth;card.classList.add('show');card.setAttribute('role','dialog');card.setAttribute('aria-modal','true');if(complete)advice('¡Nivel completado!','¡Abriste los seis cofres! Gracias por conocer mi portafolio.');else advice('¡Cofre descubierto!','¡Buen trabajo! El cofre se abre y deja el sendero libre para continuar.');
}
function nearestChest(){let best=-1,distance=Infinity;chests.forEach((chest,index)=>{if(opened.has(index))return;const d=Math.abs(player.x-chest.x)+Math.abs(player.y-chest.y);if(d<distance){best=index;distance=d}});return{index:best,distance}}
function jumpCheckpoint(checkpoint){const point=checkpoints[checkpoint];if(!point||isRunning)return;player={x:point.x,y:point.y,dir:point.dir};lastPlayerCell=null;openChest(point.chestIndex)}
function walk(distance=1){const dir=directions[player.dir];for(let n=0;n<distance;n++){const nx=player.x+dir.x,ny=player.y+dir.y;if(!pathSet.has(key(nx,ny))){const chestIndex=chests.findIndex((chest,index)=>chest.x===player.x&&chest.y===player.y&&!opened.has(index));if(chestIndex>=0){notify(`¡Tienes el cofre ${chestIndex+1} a tus pies! Usa “Abrir cofre” para descubrirlo.`);return false}const target=nearestChest();const targetPoint=target.index>=0?chests[target.index]:null;const turnNeeded=targetPoint&&Math.abs(player.x-targetPoint.x)+Math.abs(player.y-targetPoint.y)<5;notify(`La abeja no puede avanzar hacia ${directions[player.dir].label.toLowerCase()}. ${turnNeeded?'El sendero gira aquí; usa un bloque de giro.':'Hay un obstáculo en esa baldosa. Prueba a saltarlo si el camino sigue detrás.'}`);return false}player.x=nx;player.y=ny;steps++;renderBoard();updateProgress()}return true}
async function jump(){const dir=directions[player.dir],nx=player.x+dir.x*2,ny=player.y+dir.y*2;if(!pathSet.has(key(nx,ny))){notify('No hay una baldosa segura dos casillas adelante. Revisa el rumbo o avanza una casilla.');return false}$('.player-cell .bee')?.classList.add('bee-jump');await pause(170);player.x=nx;player.y=ny;steps+=2;renderBoard();updateProgress();return true}
function openChest(index){if(index<0||index>=chests.length)return false;const isNew=!opened.has(index);opened.add(index);renderBoard(isNew?index:-1);updateProgress();reveal(index);return true}
function interact(){let index=chests.findIndex((chest,i)=>chest.x===player.x&&chest.y===player.y&&!opened.has(i));if(index<0){const current=chests.findIndex(chest=>chest.x===player.x&&chest.y===player.y);if(current>=0)index=current;else{const nearby=nearestChest();if(nearby.index>=0&&nearby.distance<=1)index=nearby.index;else{notify(nearby.index>=0?`El cofre ${nearby.index+1} está a ${nearby.distance} casillas. Acércate y vuelve a interactuar.`:'¡Ya descubriste todos los cofres!');return false}}}return openChest(index)}
async function execute(){if(isRunning)return;if(!commands.length){notify('Agrega bloques tocando una instrucción o arrastrándola al programa.');return}isRunning=true;const button=$('#runButton');button.disabled=true;const sequence=[...commands];try{for(const op of sequence){let success=true;if(op==='move')success=walk();else if(op==='jump')success=await jump();else if(op==='right'){player.dir=(player.dir+1)%4;renderBoard();updateProgress()}else if(op==='left'){player.dir=(player.dir+3)%4;renderBoard();updateProgress()}else if(op==='interact')success=interact();if(!success)break;if(op==='interact'&&$('#discoveryCard').classList.contains('show'))await new Promise(resolve=>{discoveryResolver=resolve});else await pause(220)}}finally{isRunning=false;button.disabled=false}}
function addCommand(op,index=commands.length){if(isRunning||!commandsInfo[op])return;commands.splice(Math.max(0,Math.min(index,commands.length)),0,op);renderCommands()}
function removeCommand(index){if(isRunning||index<0||index>=commands.length)return;const item=$(`.program-block[data-index="${index}"]`);item?.classList.add('block-discard');setTimeout(()=>{commands.splice(index,1);renderCommands()},140)}
function moveCommand(from,to){if(isRunning||from===to||from<0||from>=commands.length)return;const [op]=commands.splice(from,1);commands.splice(from<to?to-1:to,0,op);renderCommands()}
function setTrashActive(active){trash.classList.toggle('is-over',active)}

$$('.palette-block').forEach(block=>{block.addEventListener('dragstart',event=>{event.dataTransfer.setData('text/plain',block.dataset.op);event.dataTransfer.effectAllowed='copy';block.classList.add('is-dragging')});block.addEventListener('dragend',()=>block.classList.remove('is-dragging'));block.addEventListener('click',()=>addCommand(block.dataset.op))});
workspace.addEventListener('dragover',event=>{event.preventDefault();workspace.classList.add('drag-over')});workspace.addEventListener('dragleave',event=>{if(!workspace.contains(event.relatedTarget))workspace.classList.remove('drag-over')});workspace.addEventListener('drop',event=>{event.preventDefault();workspace.classList.remove('drag-over');const value=event.dataTransfer.getData('text/plain');if(value.startsWith('reorder:'))moveCommand(Number(value.split(':')[1]),commands.length);else addCommand(value)});
trash.addEventListener('dragover',event=>{event.preventDefault();event.dataTransfer.dropEffect='move';setTrashActive(true)});trash.addEventListener('dragenter',event=>{event.preventDefault();setTrashActive(true)});trash.addEventListener('dragleave',event=>{if(!trash.contains(event.relatedTarget))setTrashActive(false)});trash.addEventListener('drop',event=>{event.preventDefault();const value=event.dataTransfer.getData('text/plain');setTrashActive(false);if(value.startsWith('reorder:'))removeCommand(Number(value.split(':')[1]));else notify('La papelera elimina bloques que ya están dentro de tu programa.')});
$('#runButton').addEventListener('click',execute);
$('#resetButton').addEventListener('click',()=>{if(isRunning)return;player={...spawn};commands=[];opened.clear();steps=0;lastPlayerCell=null;renderCommands();renderBoard();updateProgress();$('#discoveryCard').classList.remove('show','complete');$('#assistant').classList.add('show');advice('¡Listos para jugar!','Programa el vuelo y encuentra los seis cofres del sendero.')});
$$('.checkpoint').forEach(button=>button.addEventListener('click',()=>jumpCheckpoint(button.dataset.checkpoint)));
$('#portfolioButton').addEventListener('click',()=>{$('#discoveryKicker').textContent='PORTAFOLIO';$('#discoveryTitle').textContent='¡Hola! Soy Alejandro';$('#discoveryText').textContent='Estudiante y creador en formación. Explora mis proyectos y encuéntrame en Instagram o GitHub.';$('#discoveryArt').innerHTML=artMarkup('bee');renderLinks([...projectLinks,...contactLinks]);$('#discoveryCard').classList.remove('complete');$('#discoveryCard').classList.add('show');$('#discoveryCard').setAttribute('role','dialog');$('#discoveryCard').setAttribute('aria-modal','true')});
$('#dismissAssistant').addEventListener('click',()=>$('#assistant').classList.remove('show','attention'));
function closeDiscovery(){ $('#discoveryCard').classList.remove('show');if(discoveryResolver){const resume=discoveryResolver;discoveryResolver=null;resume()}}
$('#closeDiscovery').addEventListener('click',closeDiscovery);$('#discoveryCard').addEventListener('click',event=>{if(event.target.id==='discoveryCard')closeDiscovery()});
workspace.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();execute()}});window.addEventListener('keydown',event=>{if(event.key==='Escape')closeDiscovery()});window.addEventListener('resize',updateCamera);
buildBoard();renderBoard();renderCommands();updateProgress();$('#assistant').classList.add('show');
