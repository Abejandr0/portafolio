const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const board = $('#board');
const viewport = $('#mapViewport');
const program = $('#programBlocks');
const workspace = $('#workspace');
const trash = $('#trashZone');
const columns = 5;
const rows = 12;
const path = [[2,11],[2,10],[2,9],[3,9],[4,9],[4,8],[4,7],[3,7],[2,7],[2,6],[2,5],[1,5],[0,5],[0,4],[0,3],[1,3],[2,3],[2,2],[2,1],[2,0]];
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
  {x:2,y:9,pathIndex:2,title:'Hola, soy Alejandro',kicker:'COFRE 1 · SOBRE MÍ',text:'Soy Alejandro, estudiante de diseño de interfaces. Me gusta convertir ideas en experiencias digitales claras, útiles y llenas de personalidad.',art:'bee'},
  {x:4,y:7,pathIndex:6,title:'Habilidades que cultivo',kicker:'COFRE 2 · HABILIDADES',text:'Estoy aprendiendo diseño visual, prototipado y desarrollo web. Me encanta probar, iterar y descubrir formas más intuitivas de resolver un problema.',art:'spark'},
  {x:2,y:5,pathIndex:10,title:'Proyectos en construcción',kicker:'COFRE 3 · PROYECTOS',text:'Cada proyecto representa una idea que llevé a la práctica. Explora el código y descubre un poco más de lo que he creado.',art:'chest'},
  {x:0,y:3,pathIndex:14,title:'¡Gracias por jugar!',kicker:'COFRE 4 · CONTACTO',text:'Llegaste al final del sendero. Me interesa colaborar, aprender y crear cosas interesantes. Encuéntrame en Instagram o GitHub.',art:'flag'}
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
const checkpoints = {
  start:{x:2,y:11,dir:0},
  skills:{x:4,y:7,dir:3},
  projects:{x:2,y:5,dir:3},
  finish:{x:0,y:3,dir:0}
};
const scenery = {
  tree:`<svg viewBox="0 0 64 72" aria-hidden="true"><path d="M31 43h7v23h-7z" fill="#9a6841"/><path d="M35 5 13 36h13L9 50h47L39 36h13z" fill="#188b69" stroke="#126d59" stroke-width="2" stroke-linejoin="round"/><path d="m31 15-9 14h7l-9 12h19l-9-12h7z" fill="#50bd7b"/></svg>`,
  rock:`<svg viewBox="0 0 64 60" aria-hidden="true"><path d="m8 42 7-19 14-13 15 7 12 21-7 12H16z" fill="#8798a3" stroke="#667b88" stroke-width="2" stroke-linejoin="round"/><path d="m16 24 13-14 8 15-10 8zM37 25l7-8 12 21-15-4z" fill="#b8c5c8"/><path d="m16 43 11-10 11 14H16z" fill="#748891"/></svg>`,
  flower:`<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 32v27" stroke="#56834e" stroke-width="4"/><path d="M31 49q-12-11-19-2 10 8 19 5m2-12q11-13 20-7-7 11-20 12" fill="#72b96c"/><circle cx="32" cy="27" r="7" fill="#ffcf57"/><g fill="#f58b9a"><circle cx="32" cy="17" r="6"/><circle cx="42" cy="25" r="6"/><circle cx="38" cy="37" r="6"/><circle cx="25" cy="37" r="6"/><circle cx="21" cy="25" r="6"/></g></svg>`,
  stump:`<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M18 26h29l-3 30H20z" fill="#a8794b"/><ellipse cx="32" cy="26" rx="15" ry="7" fill="#d7ad71"/><ellipse cx="32" cy="26" rx="9" ry="3.5" fill="none" stroke="#a8794b" stroke-width="2"/><path d="M24 57h18" stroke="#80583c" stroke-width="3" stroke-linecap="round"/></svg>`
};
let player = {...checkpoints.start};
let commands = [];
let opened = new Set();
let steps = 0;
let isRunning = false;
let draggedIndex = null;
let discoveryResolver = null;
let lastPlayerCell = null;

const key = (x,y) => `${x},${y}`;
const pause = ms => new Promise(resolve => setTimeout(resolve,ms));
function beeMarkup(){return `<svg class="bee-svg" viewBox="0 0 72 72" role="img" aria-label="Abeja exploradora"><ellipse class="bee-wing wing-a" cx="26" cy="20" rx="10" ry="15"/><ellipse class="bee-wing wing-b" cx="46" cy="20" rx="10" ry="15"/><ellipse cx="36" cy="39" rx="21" ry="18" fill="#ffca45" stroke="#b97827" stroke-width="2"/><path d="M27 24q-5 14 0 29M38 22q-5 17 0 33M49 25q-5 13 0 25" fill="none" stroke="#493e54" stroke-width="6"/><circle cx="29" cy="36" r="3.2" fill="#fff"/><circle cx="43" cy="36" r="3.2" fill="#fff"/><circle cx="30" cy="36.5" r="1.5" fill="#293456"/><circle cx="44" cy="36.5" r="1.5" fill="#293456"/><path d="M33 44q3 3 6 0" fill="none" stroke="#493e54" stroke-width="1.8" stroke-linecap="round"/><path d="m34 22-3-7m7 7 4-7" stroke="#493e54" stroke-width="2" stroke-linecap="round"/><circle cx="30" cy="14" r="2" fill="#ff8e8e"/><circle cx="42" cy="14" r="2" fill="#ff8e8e"/><path d="m36 57 3 6-6-1z" fill="#493e54"/></svg>`}
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
  board.replaceChildren();
  for(let y=0;y<rows;y++)for(let x=0;x<columns;x++){
    const tile=document.createElement('div');tile.className='cell';tile.setAttribute('role','gridcell');tile.dataset.x=x;tile.dataset.y=y;
    if(pathSet.has(key(x,y)))tile.classList.add('walkable');else tile.classList.add('obstacle');
    const index=path.findIndex(([px,py])=>px===x&&py===y);
    if(index>=0){tile.style.setProperty('--path-order',index);if(index%2===0)tile.classList.add('path-sunlit')}
    const chestIndex=chests.findIndex(chest=>chest.x===x&&chest.y===y);
    if(chestIndex>=0){tile.classList.add('chest-cell');const art=document.createElement('span');art.className='tile-art chest-art';art.innerHTML=artMarkup('chest');tile.append(art);const badge=document.createElement('span');badge.className='treasure-count';badge.textContent=String(chestIndex+1);tile.append(badge)}
    else if(index<0){const art=document.createElement('span');art.className='tile-art obstacle-art';art.innerHTML=scenery[`${x},${y}`]||scenery[scenicType(x,y)];tile.append(art)}
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
function renderBoard(){
  $$('.cell',board).forEach(tile=>{tile.classList.remove('player-cell');$('.bee',tile)?.remove()});
  const current=$(`.cell[data-x="${player.x}"][data-y="${player.y}"]`,board);
  if(current){current.classList.add('player-cell');const wrapper=document.createElement('span');wrapper.className=`bee face-${directions[player.dir].face}`;wrapper.innerHTML=beeMarkup();wrapper.setAttribute('aria-label',`Abeja mirando al ${directions[player.dir].label.toLowerCase()}`);current.append(wrapper);if(lastPlayerCell!==key(player.x,player.y)){wrapper.classList.add('bee-arrive');lastPlayerCell=key(player.x,player.y)}}
  chests.forEach((chest,index)=>{const tile=$(`.cell[data-x="${chest.x}"][data-y="${chest.y}"]`,board);if(!tile)return;tile.classList.toggle('opened-chest',opened.has(index));tile.classList.toggle('chest-glow',!opened.has(index));const art=$('.chest-art',tile);if(art)art.innerHTML=opened.has(index)?artMarkup('spark'):artMarkup('chest')});
  board.classList.toggle('mission-complete',opened.size===4);
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
  const count=opened.size;$('#progressText').textContent=`${count} / 4`;
  $('#missionCount').innerHTML=`${count} <i>/ 4</i>`;
  $('#honeyTrack').replaceChildren(...Array.from({length:4},(_,i)=>{const segment=document.createElement('span');segment.className=`honey-segment${opened.has(i)?' is-filled':''}`;segment.setAttribute('aria-label',`Cofre ${i+1}${opened.has(i)?' descubierto':' pendiente'}`);return segment}));
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
  const chest=chests[index];const complete=opened.size===4;$('#discoveryKicker').textContent=complete?'¡MISIÓN COMPLETADA! · 4/4 COFRES':chest.kicker;$('#discoveryTitle').textContent=complete?'¡Llegaste a la meta!':chest.title;$('#discoveryText').textContent=complete?'Abriste todos los cofres y completaste mi aventura. Soy Alejandro y me encantaría que sigamos en contacto.':chest.text;$('#discoveryArt').innerHTML=artMarkup(complete?'flag':chest.art);renderLinks(index===2?projectLinks:index===3?contactLinks:[]);const card=$('#discoveryCard');card.classList.toggle('complete',complete);card.classList.add('show');card.setAttribute('role','dialog');card.setAttribute('aria-modal','true');if(complete)advice('¡Nivel completado!','¡Abriste los cuatro cofres! Gracias por conocer mi portafolio.');else advice('¡Cofre descubierto!','¡Buen trabajo! La ruta continúa por las baldosas iluminadas.');
}
function nearestChest(){let best=-1,distance=Infinity;chests.forEach((chest,index)=>{if(opened.has(index))return;const d=Math.abs(player.x-chest.x)+Math.abs(player.y-chest.y);if(d<distance){best=index;distance=d}});return{index:best,distance}}
function jumpCheckpoint(checkpoint){const point=checkpoints[checkpoint];if(!point||isRunning)return;player={...point};lastPlayerCell=null;renderBoard();updateProgress();notify(`Saltaste al checkpoint ${$('.checkpoint[data-checkpoint="'+checkpoint+'"]').textContent.trim()}. El rumbo de la abeja está actualizado.`)}
function walk(distance=1){const dir=directions[player.dir];for(let n=0;n<distance;n++){const nx=player.x+dir.x,ny=player.y+dir.y;if(!pathSet.has(key(nx,ny))){const chestIndex=chests.findIndex((chest,index)=>chest.x===player.x&&chest.y===player.y&&!opened.has(index));if(chestIndex>=0){notify(`¡Tienes el cofre ${chestIndex+1} a tus pies! Usa “Abrir cofre” para descubrirlo.`);return false}const target=nearestChest();const targetPoint=target.index>=0?chests[target.index]:null;const turnNeeded=targetPoint&&Math.abs(player.x-targetPoint.x)+Math.abs(player.y-targetPoint.y)<5;notify(`La abeja no puede avanzar hacia ${directions[player.dir].label.toLowerCase()}. ${turnNeeded?'El sendero gira aquí; usa un bloque de giro.':'Hay un obstáculo en esa baldosa. Prueba a saltarlo si el camino sigue detrás.'}`);return false}player.x=nx;player.y=ny;steps++;renderBoard();updateProgress()}return true}
async function jump(){const dir=directions[player.dir],nx=player.x+dir.x*2,ny=player.y+dir.y*2;if(!pathSet.has(key(nx,ny))){notify('No hay una baldosa segura dos casillas adelante. Revisa el rumbo o avanza una casilla.');return false}$('.player-cell .bee')?.classList.add('bee-jump');await pause(170);player.x=nx;player.y=ny;steps+=2;renderBoard();updateProgress();return true}
function interact(){let index=chests.findIndex((chest,i)=>chest.x===player.x&&chest.y===player.y&&!opened.has(i));if(index<0){const nearby=nearestChest();if(nearby.index>=0&&nearby.distance<=1)index=nearby.index;else{notify(nearby.index>=0?`El cofre ${nearby.index+1} está a ${nearby.distance} casillas. Acércate para abrirlo.`:'¡Ya descubriste todos los cofres!');return false}}opened.add(index);renderBoard();updateProgress();reveal(index);return true}
async function execute(){if(isRunning)return;if(!commands.length){notify('Agrega bloques tocando una instrucción o arrastrándola al programa.');return}isRunning=true;const button=$('#runButton');button.disabled=true;const sequence=[...commands];try{for(const op of sequence){let success=true;if(op==='move')success=walk();else if(op==='jump')success=await jump();else if(op==='right'){player.dir=(player.dir+1)%4;renderBoard();updateProgress()}else if(op==='left'){player.dir=(player.dir+3)%4;renderBoard();updateProgress()}else if(op==='interact')success=interact();if(!success)break;if(op==='interact'&&$('#discoveryCard').classList.contains('show'))await new Promise(resolve=>{discoveryResolver=resolve});else await pause(220)}}finally{isRunning=false;button.disabled=false}}
function addCommand(op,index=commands.length){if(isRunning||!commandsInfo[op])return;commands.splice(Math.max(0,Math.min(index,commands.length)),0,op);renderCommands()}
function removeCommand(index){if(isRunning||index<0||index>=commands.length)return;const item=$(`.program-block[data-index="${index}"]`);item?.classList.add('block-discard');setTimeout(()=>{commands.splice(index,1);renderCommands()},140)}
function moveCommand(from,to){if(isRunning||from===to||from<0||from>=commands.length)return;const [op]=commands.splice(from,1);commands.splice(from<to?to-1:to,0,op);renderCommands()}
function setTrashActive(active){trash.classList.toggle('is-over',active)}

$$('.palette-block').forEach(block=>{block.addEventListener('dragstart',event=>{event.dataTransfer.setData('text/plain',block.dataset.op);event.dataTransfer.effectAllowed='copy';block.classList.add('is-dragging')});block.addEventListener('dragend',()=>block.classList.remove('is-dragging'));block.addEventListener('click',()=>addCommand(block.dataset.op))});
workspace.addEventListener('dragover',event=>{event.preventDefault();workspace.classList.add('drag-over')});workspace.addEventListener('dragleave',event=>{if(!workspace.contains(event.relatedTarget))workspace.classList.remove('drag-over')});workspace.addEventListener('drop',event=>{event.preventDefault();workspace.classList.remove('drag-over');const value=event.dataTransfer.getData('text/plain');if(value.startsWith('reorder:'))moveCommand(Number(value.split(':')[1]),commands.length);else addCommand(value)});
trash.addEventListener('dragover',event=>{event.preventDefault();event.dataTransfer.dropEffect='move';setTrashActive(true)});trash.addEventListener('dragenter',event=>{event.preventDefault();setTrashActive(true)});trash.addEventListener('dragleave',event=>{if(!trash.contains(event.relatedTarget))setTrashActive(false)});trash.addEventListener('drop',event=>{event.preventDefault();const value=event.dataTransfer.getData('text/plain');setTrashActive(false);if(value.startsWith('reorder:'))removeCommand(Number(value.split(':')[1]));else notify('La papelera elimina bloques que ya están dentro de tu programa.')});
$('#runButton').addEventListener('click',execute);
$('#resetButton').addEventListener('click',()=>{if(isRunning)return;player={...checkpoints.start};commands=[];opened.clear();steps=0;lastPlayerCell=null;renderCommands();renderBoard();updateProgress();$('#discoveryCard').classList.remove('show','complete');$('#assistant').classList.add('show');advice('¡Listos para jugar!','Programa el vuelo y encuentra los cuatro cofres del sendero.')});
$$('.checkpoint').forEach(button=>button.addEventListener('click',()=>jumpCheckpoint(button.dataset.checkpoint)));
$('#portfolioButton').addEventListener('click',()=>{$('#discoveryKicker').textContent='PORTAFOLIO';$('#discoveryTitle').textContent='¡Hola! Soy Alejandro';$('#discoveryText').textContent='Estudiante y creador en formación. Explora mis proyectos y encuéntrame en Instagram o GitHub.';$('#discoveryArt').innerHTML=artMarkup('bee');renderLinks([...projectLinks,...contactLinks]);$('#discoveryCard').classList.remove('complete');$('#discoveryCard').classList.add('show');$('#discoveryCard').setAttribute('role','dialog');$('#discoveryCard').setAttribute('aria-modal','true')});
$('#dismissAssistant').addEventListener('click',()=>$('#assistant').classList.remove('show','attention'));
function closeDiscovery(){ $('#discoveryCard').classList.remove('show');if(discoveryResolver){const resume=discoveryResolver;discoveryResolver=null;resume()}}
$('#closeDiscovery').addEventListener('click',closeDiscovery);$('#discoveryCard').addEventListener('click',event=>{if(event.target.id==='discoveryCard')closeDiscovery()});
workspace.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();execute()}});window.addEventListener('keydown',event=>{if(event.key==='Escape')closeDiscovery()});window.addEventListener('resize',updateCamera);
buildBoard();renderBoard();renderCommands();updateProgress();$('#assistant').classList.add('show');
