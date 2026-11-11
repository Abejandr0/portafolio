const board=document.querySelector('#board');
const workspace=document.querySelector('#workspace');
const program=document.querySelector('#programBlocks');
const placeholder=document.querySelector('#dropPlaceholder');
const cells=[];
const scenery={'1,0':'🌲','3,0':'🌳','0,1':'🌲','2,1':'🪨','4,1':'🌲','1,2':'🌳','3,2':'🍄','0,3':'🌲','2,3':'🪨','4,3':'🌳','1,4':'🌲','3,4':'🌿','4,5':'🌲','0,6':'🌳','4,6':'🌀'};
const chests=[
  {x:0,y:5,emoji:'🍄',title:'Hola, soy Alejandro',kicker:'COFRE 1 · SOBRE MÍ',text:'Soy Alejandro, estudiante de diseño de interfaces. Me gusta convertir ideas en experiencias digitales claras, útiles y llenas de personalidad.',icon:'🧑🏻‍💻'},
  {x:1,y:6,emoji:'🍄',title:'Habilidades que cultivo',kicker:'COFRE 2 · HABILIDADES',text:'Estoy aprendiendo diseño visual, prototipado y desarrollo web. Me encanta probar, iterar y descubrir formas más intuitivas de resolver un problema.',icon:'🌟'},
  {x:3,y:6,emoji:'🪨',title:'Proyectos en construcción',kicker:'COFRE 3 · PROYECTOS',text:'Aquí encontrarás mis proyectos, los retos que resolví y lo que aprendí en cada proceso. Pronto agregaré casos de estudio y enlaces a mis trabajos.',icon:'🧩'},
  {x:3,y:5,emoji:'🎁',title:'¡Gracias por jugar!',kicker:'COFRE 4 · CONTACTO',text:'Llegaste al final de mi nivel. Me interesa colaborar, aprender y crear cosas interesantes. Encuéntrame en Instagram o GitHub.',icon:'💌'}
];
const projectLinks=[
  {label:'MotoTracer',href:'https://github.com/Abejandr0/mototracer'},
  {label:'MotoMod',href:'https://github.com/Abejandr0/mods-app'},
  {label:'Honey',href:'https://github.com/Abejandr0/honey'},
  {label:'CodeType',href:'https://github.com/Abejandr0/codeType'}
];
const contactLinks=[
  {label:'Instagram · @alejojcastro',href:'https://www.instagram.com/alejojcastro/'},
  {label:'GitHub · Abejandr0',href:'https://github.com/Abejandr0'}
];
const checkpoints={start:{x:2,y:5,dir:3,label:'INICIO'},skills:{x:1,y:6,dir:0,label:'HABILIDADES'},projects:{x:3,y:6,dir:0,label:'PROYECTOS'},finish:{x:3,y:5,dir:0,label:'META'}};
const directions=[{x:0,y:-1,face:'up'},{x:1,y:0,face:'right'},{x:0,y:1,face:'down'},{x:-1,y:0,face:'left'}];
const names={move:'Avanzar 1 casilla',jump:'Saltar 2 casillas',right:'Girar 90° grados der.',left:'Girar 90° grados izq.',interact:'Interactuar'};
let player={x:2,y:5,dir:3};let commands=[];let opened=new Set();let steps=0;let isRunning=false;let draggedIndex=null;let discoveryResolver=null;
const advice=(title,message)=>{document.querySelector('#assistantTitle').textContent=title;document.querySelector('#assistantMessage').textContent=message};
const cellKey=(x,y)=>`${x},${y}`;
const isPath=(x,y)=>y>=5&&y<=6&&!(x===0&&y===6)&&!(x===4&&y===5);
function buildBoard(){
  for(let y=0;y<7;y++)for(let x=0;x<5;x++){
    const cell=document.createElement('div');cell.className='cell';cell.setAttribute('role','gridcell');cell.dataset.x=x;cell.dataset.y=y;
    if((x+y)%3===0)cell.classList.add('mossy');else if((x+y)%3===1)cell.classList.add('shady');
    if(isPath(x,y))cell.classList.add('walkable');else cell.classList.add('obstacle');
    if(x===2&&y===5)cell.classList.add('start-tile');
    const chestIndex=chests.findIndex(chest=>chest.x===x&&chest.y===y);
    if(chestIndex>=0){cell.classList.add('walkable','chest-cell');const emoji=document.createElement('span');emoji.className='decoration';emoji.textContent=chests[chestIndex].emoji;cell.append(emoji);const count=document.createElement('span');count.className='treasure-count';count.textContent=String(chestIndex+1);cell.append(count)}
    if(scenery[cellKey(x,y)]&&chestIndex<0){const object=document.createElement('span');object.className='decoration scenery';object.textContent=scenery[cellKey(x,y)];cell.append(object)}
    cells.push(cell);board.append(cell);
  }
}
function renderBoard(){
  cells.forEach(cell=>{cell.classList.remove('player-cell');cell.querySelector('.avatar')?.remove()});
  const cell=cells.find(item=>Number(item.dataset.x)===player.x&&Number(item.dataset.y)===player.y);
  if(cell){cell.classList.add('player-cell');const avatar=document.createElement('div');avatar.className=`avatar face-${directions[player.dir].face}`;avatar.setAttribute('aria-label','Alex');cell.append(avatar)}
  chests.forEach((chest,index)=>{const target=cells.find(c=>Number(c.dataset.x)===chest.x&&Number(c.dataset.y)===chest.y);if(target){target.classList.toggle('opened-chest',opened.has(index));const symbol=target.querySelector('.decoration');if(symbol)symbol.textContent=opened.has(index)?'🎁':chest.emoji}});
  const portal=cells.find(cell=>cell.dataset.x==='4'&&cell.dataset.y==='6');if(portal){const symbol=portal.querySelector('.decoration');if(symbol)symbol.textContent=opened.size===4?'🏁':'🌀'}
  board.classList.toggle('mission-complete',opened.size===4);
}
function renderCommands(){
  program.innerHTML='';placeholder.hidden=commands.length>0;
  commands.forEach((op,index)=>{const item=document.createElement('div');item.className=`program-block ${op==='jump'?'jump-block':op==='interact'?'interact-block':op==='left'||op==='right'?'turn-block':'move-block'}`;item.draggable=true;item.dataset.index=index;item.innerHTML=`<span class="block-index">${String(index+1).padStart(2,'0')}</span><span>${names[op]}</span><button class="remove-block" aria-label="Quitar ${names[op]}">×</button>`;
    item.querySelector('.remove-block').addEventListener('click',()=>{commands.splice(index,1);renderCommands()});
    item.addEventListener('dragstart',event=>{draggedIndex=index;event.dataTransfer.setData('text/plain',`reorder:${index}`);event.dataTransfer.effectAllowed='move'});
    item.addEventListener('dragover',event=>event.preventDefault());item.addEventListener('drop',event=>{event.preventDefault();event.stopPropagation();const value=event.dataTransfer.getData('text/plain');if(value.startsWith('reorder:')){const from=Number(value.split(':')[1]);if(from===index)return;const [moving]=commands.splice(from,1);commands.splice(from<index?index-1:index,0,moving);renderCommands()}});program.append(item);
  });
}
function updateProgress(){const count=opened.size;document.querySelector('#progressText').textContent=`${count}/4`;document.querySelector('#missionCount').textContent=`${count}/4`;document.querySelector('#progressFill').style.width=`${count*25}%`;document.querySelector('#stepsText').textContent=steps;document.querySelectorAll('.checkpoint').forEach((button,index)=>button.classList.toggle('visited',opened.has(index)))}
async function notify(message){const assistant=document.querySelector('#assistant');assistant.classList.add('show','attention');advice('Búho guía',message);setTimeout(()=>assistant.classList.remove('attention'),500);const endpoint=window.PORTFOLIO_CONFIG?.aiCoachEndpoint;if(!endpoint)return;try{const response=await fetch(endpoint,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({message,player:{x:player.x,y:player.y,direction:directions[player.dir].face},openedChests:[...opened],steps})});if(!response.ok)return;const result=await response.json();if(typeof result.message==='string'&&result.message.trim())advice('Búho guía',result.message.trim().slice(0,280))}catch{/* Keep the local game hint when the optional AI service is unavailable. */}}
function renderLinks(items){const container=document.querySelector('#discoveryLinks');container.replaceChildren();items.forEach(item=>{const link=document.createElement('a');link.href=item.href;link.target='_blank';link.rel='noopener noreferrer';link.textContent=`${item.label} ↗`;container.append(link)})}
function reveal(index){const chest=chests[index];const complete=opened.size===4;document.querySelector('#discoveryKicker').textContent=complete?'¡MISIÓN COMPLETADA! · 4/4 COFRES':chest.kicker;document.querySelector('#discoveryTitle').textContent=complete?'¡Llegaste a la meta!':chest.title;document.querySelector('#discoveryText').textContent=complete?'Abriste todos los cofres y completaste mi aventura. Soy Alejandro y me encantaría que sigamos en contacto.':chest.text;document.querySelector('#discoveryArt').textContent=complete?'🏆':chest.icon;renderLinks(index===2?projectLinks:index===3?contactLinks:[]);const card=document.querySelector('#discoveryCard');card.classList.toggle('complete',complete);card.classList.add('show');card.setAttribute('role','dialog');card.setAttribute('aria-modal','true');if(complete)advice('¡Nivel completado!','¡Abriste los cuatro cofres! Gracias por conocer mi portafolio.');else advice('¡Cofre descubierto!','¡Muy bien! Ya puedes seguir buscando los otros tesoros.')}
function nearestChest(){let best=-1;let distance=Infinity;chests.forEach((chest,index)=>{if(opened.has(index))return;const d=Math.abs(player.x-chest.x)+Math.abs(player.y-chest.y);if(d<distance){best=index;distance=d}});return {index:best,distance}}
function jumpCheckpoint(key){const point=checkpoints[key];if(!point)return;player={...point};renderBoard();document.querySelectorAll('.checkpoint').forEach(button=>button.classList.toggle('active',button.dataset.jump===key));}
function walk(distance=1){const direction=directions[player.dir];for(let i=0;i<distance;i++){const nx=player.x+direction.x,ny=player.y+direction.y;if(nx<0||nx>=5||ny<0||ny>=7||!isPath(nx,ny)){const here=chests.findIndex((chest,index)=>chest.x===player.x&&chest.y===player.y&&!opened.has(index));if(here>=0){notify(`¡Encontraste el cofre ${here+1}! Usa “Interactuar” para abrirlo.`);return false}const target=nearestChest();const hint=target.index>=0&&player.x!==chests[target.index].x&&player.y!==chests[target.index].y?'El camino gira. Gira a la derecha o a la izquierda para seguirlo.':'Hay un árbol en el camino. Prueba el bloque “Saltar”.';notify(`¡Alex chocó! ${hint}`);return false}player.x=nx;player.y=ny;steps++}renderBoard();updateProgress();return true}
async function jump(){const direction=directions[player.dir];const end={x:player.x+direction.x*2,y:player.y+direction.y*2};if(end.x<0||end.x>=5||end.y<0||end.y>=7){notify('¡Ese salto te saca del tablero! Gira hacia el camino.');return false}if(!isPath(end.x,end.y)){notify('No hay espacio para aterrizar. Gira o busca otra casilla.');return false}document.querySelector('.player-cell .avatar')?.classList.add('jump-takeoff');await new Promise(resolve=>setTimeout(resolve,170));player.x=end.x;player.y=end.y;steps+=2;renderBoard();updateProgress();return true}
function interact(){let index=chests.findIndex((chest,i)=>chest.x===player.x&&chest.y===player.y&&!opened.has(i));if(index<0){const nearby=nearestChest();if(nearby.index>=0&&nearby.distance<=1)index=nearby.index;else{if(nearby.index>=0)notify(`El cofre ${nearby.index+1} está a ${nearby.distance} casillas. Acércate y vuelve a interactuar.`);else notify('¡Abriste todos los cofres! La meta está desbloqueada.');return false}}opened.add(index);renderBoard();updateProgress();reveal(index);return true}
async function execute(){if(isRunning)return;if(!commands.length){notify('Añade bloques a la secuencia. Arrastra uno o haz clic en la paleta.');return}isRunning=true;const runButton=document.querySelector('#runButton');runButton.disabled=true;const sequence=[...commands];try{for(const op of sequence){let success=true;if(op==='move')success=walk(1);if(op==='jump')success=await jump();if(op==='right'){player.dir=(player.dir+1)%4;renderBoard()}if(op==='left'){player.dir=(player.dir+3)%4;renderBoard()}if(op==='interact')success=interact();if(!success)break;if(op==='interact'&&document.querySelector('#discoveryCard').classList.contains('show'))await new Promise(resolve=>{discoveryResolver=resolve});else await new Promise(resolve=>setTimeout(resolve,220))}}finally{isRunning=false;runButton.disabled=false}}
function addCommand(op){if(isRunning)return;if(!names[op])return;commands.push(op);renderCommands()}

document.querySelectorAll('.block').forEach(block=>{block.addEventListener('dragstart',event=>{event.dataTransfer.setData('text/plain',block.dataset.op);event.dataTransfer.effectAllowed='copy'});block.addEventListener('click',()=>addCommand(block.dataset.op))});
workspace.addEventListener('dragover',event=>{event.preventDefault();workspace.classList.add('drag-over')});workspace.addEventListener('dragleave',event=>{if(!workspace.contains(event.relatedTarget))workspace.classList.remove('drag-over')});workspace.addEventListener('drop',event=>{event.preventDefault();workspace.classList.remove('drag-over');const value=event.dataTransfer.getData('text/plain');if(value.startsWith('reorder:')){const from=Number(value.split(':')[1]);if(Number.isInteger(draggedIndex)&&from>=0&&from<commands.length){const [op]=commands.splice(from,1);commands.push(op);renderCommands()}draggedIndex=null}else addCommand(value)});
document.querySelector('#runButton').addEventListener('click',execute);
document.querySelector('#resetButton').addEventListener('click',()=>{if(isRunning)return;player={...checkpoints.start};commands=[];opened.clear();steps=0;renderCommands();renderBoard();updateProgress();document.querySelectorAll('.checkpoint').forEach(button=>button.classList.toggle('active',button.dataset.jump==='start'));document.querySelector('#discoveryCard').classList.remove('show','complete');advice('¡Listos para jugar!','Secuencia y tablero reiniciados. ¡Encuentra los cuatro cofres!')});
document.querySelectorAll('.checkpoint').forEach(button=>button.addEventListener('click',()=>jumpCheckpoint(button.dataset.jump)));
document.querySelector('#portfolioButton').addEventListener('click',()=>{document.querySelector('#discoveryKicker').textContent='PORTAFOLIO';document.querySelector('#discoveryTitle').textContent='¡Hola! Soy Alejandro';document.querySelector('#discoveryText').textContent='Estudiante y creador en formación. Explora mis cuatro proyectos y encuéntrame en Instagram o GitHub.';document.querySelector('#discoveryArt').textContent='🧑🏻‍💻';renderLinks([...projectLinks,...contactLinks]);document.querySelector('#discoveryCard').classList.remove('complete');document.querySelector('#discoveryCard').classList.add('show');document.querySelector('#discoveryCard').setAttribute('role','dialog');document.querySelector('#discoveryCard').setAttribute('aria-modal','true')});
document.querySelector('#dismissAssistant').addEventListener('click',()=>document.querySelector('#assistant').classList.remove('show','attention'));
function closeDiscovery(){document.querySelector('#discoveryCard').classList.remove('show');if(discoveryResolver){const resume=discoveryResolver;discoveryResolver=null;resume()}}
document.querySelector('#closeDiscovery').addEventListener('click',closeDiscovery);
document.querySelector('#discoveryCard').addEventListener('click',event=>{if(event.target.id==='discoveryCard')closeDiscovery()});
workspace.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();execute()}});
window.addEventListener('keydown',event=>{if(event.key==='Escape')closeDiscovery()});
buildBoard();renderBoard();renderCommands();updateProgress();
