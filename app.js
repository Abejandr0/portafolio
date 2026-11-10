const board=document.querySelector('#board');
const workspace=document.querySelector('#workspace');
const program=document.querySelector('#programBlocks');
const placeholder=document.querySelector('#dropPlaceholder');
const cells=[];
const chests=[
  {x:0,y:5,emoji:'🍄',title:'Hola, soy Alejandro',kicker:'COFRE 1 · SOBRE MÍ',text:'Soy Alejandro, estudiante de diseño de interfaces. Me gusta convertir ideas en experiencias digitales claras, útiles y llenas de personalidad.',icon:'🧑🏻‍💻'},
  {x:1,y:6,emoji:'🍄',title:'Habilidades que cultivo',kicker:'COFRE 2 · HABILIDADES',text:'Estoy aprendiendo diseño visual, prototipado y desarrollo web. Me encanta probar, iterar y descubrir formas más intuitivas de resolver un problema.',icon:'🌟'},
  {x:3,y:6,emoji:'🪨',title:'Proyectos en construcción',kicker:'COFRE 3 · PROYECTOS',text:'Aquí encontrarás mis proyectos, los retos que resolví y lo que aprendí en cada proceso. Pronto agregaré casos de estudio y enlaces a mis trabajos.',icon:'🧩'},
  {x:3,y:5,emoji:'🎁',title:'¡Gracias por jugar!',kicker:'COFRE 4 · CONTACTO',text:'Llegaste al final de mi nivel. Me interesa colaborar, aprender y crear cosas interesantes. Escríbeme y sigamos la conversación.',icon:'💌'}
];
const checkpoints={start:{x:2,y:5,dir:3,label:'INICIO'},skills:{x:1,y:6,dir:0,label:'HABILIDADES'},projects:{x:3,y:6,dir:0,label:'PROYECTOS'},finish:{x:3,y:5,dir:0,label:'META'}};
const directions=[{x:0,y:-1,face:'up'},{x:1,y:0,face:'right'},{x:0,y:1,face:'down'},{x:-1,y:0,face:'left'}];
const names={move:'Avanzar 1 casilla',jump:'Saltar 2 casillas',right:'Girar 90° grados der.',left:'Girar 90° grados izq.',interact:'Interactuar'};
let player={x:2,y:5,dir:3};let commands=[];let opened=new Set();let steps=0;let isRunning=false;let draggedIndex=null;let toastTimeout;
const advice=(title,message)=>{document.querySelector('#assistantTitle').textContent=title;document.querySelector('#assistantMessage').textContent=message};
const cellKey=(x,y)=>`${x},${y}`;
const isPath=(x,y)=>y>=5&&y<=6&&!(x===0&&y===6)&&!(x===4&&y===5);
function buildBoard(){
  for(let y=0;y<7;y++)for(let x=0;x<5;x++){
    const cell=document.createElement('div');cell.className='cell';cell.setAttribute('role','gridcell');cell.dataset.x=x;cell.dataset.y=y;
    if(isPath(x,y))cell.classList.add('walkable');else cell.classList.add('obstacle');
    if(x===2&&y===5)cell.classList.add('start-tile');
    const chestIndex=chests.findIndex(chest=>chest.x===x&&chest.y===y);
    if(chestIndex>=0){cell.classList.add('walkable','chest-cell');const emoji=document.createElement('span');emoji.className='decoration';emoji.textContent=chests[chestIndex].emoji;cell.append(emoji);const count=document.createElement('span');count.className='treasure-count';count.textContent=String(chestIndex+1);cell.append(count)}
    if(x===4&&y===4){const tree=document.createElement('span');tree.className='decoration';tree.textContent='🌲';cell.append(tree)}
    if(x===0&&y===6){const tree=document.createElement('span');tree.className='decoration';tree.textContent='🌳';cell.append(tree)}
    cells.push(cell);board.append(cell);
  }
}
function renderBoard(){
  cells.forEach(cell=>{cell.classList.remove('player-cell');cell.querySelector('.avatar')?.remove()});
  const cell=cells.find(item=>Number(item.dataset.x)===player.x&&Number(item.dataset.y)===player.y);
  if(cell){cell.classList.add('player-cell');const avatar=document.createElement('div');avatar.className=`avatar face-${directions[player.dir].face}`;avatar.setAttribute('aria-label','Alex');cell.append(avatar)}
    chests.forEach((chest,index)=>{const target=cells.find(c=>Number(c.dataset.x)===chest.x&&Number(c.dataset.y)===chest.y);if(target){target.classList.toggle('opened-chest',opened.has(index));const symbol=target.querySelector('.decoration');if(symbol)symbol.textContent=opened.has(index)?'🎁':chest.emoji}});
}
function renderCommands(){
  program.innerHTML='';placeholder.hidden=commands.length>0;
  commands.forEach((op,index)=>{const item=document.createElement('div');item.className=`program-block ${op==='jump'?'jump-block':op==='interact'?'interact-block':op==='left'||op==='right'?'turn-block':'move-block'}`;item.draggable=true;item.dataset.index=index;item.innerHTML=`<span class="block-index">${String(index+1).padStart(2,'0')}</span><span>${names[op]}</span><button class="remove-block" aria-label="Quitar ${names[op]}">×</button>`;
    item.querySelector('.remove-block').addEventListener('click',()=>{commands.splice(index,1);renderCommands()});
    item.addEventListener('dragstart',event=>{draggedIndex=index;event.dataTransfer.setData('text/plain',`reorder:${index}`);event.dataTransfer.effectAllowed='move'});
    item.addEventListener('dragover',event=>event.preventDefault());item.addEventListener('drop',event=>{event.preventDefault();event.stopPropagation();const value=event.dataTransfer.getData('text/plain');if(value.startsWith('reorder:')){const from=Number(value.split(':')[1]);const [moving]=commands.splice(from,1);commands.splice(index,0,moving);renderCommands()}});program.append(item);
  });
}
function updateProgress(){const count=opened.size;document.querySelector('#progressText').textContent=`${count}/4`;document.querySelector('#missionCount').textContent=`${count}/4`;document.querySelector('#progressFill').style.width=`${count*25}%`;document.querySelector('#stepsText').textContent=steps;document.querySelectorAll('.checkpoint').forEach((button,index)=>button.classList.toggle('visited',opened.has(index)))}
function notify(message){const assistant=document.querySelector('#assistant');assistant.classList.add('attention');advice('Búho guía',message);setTimeout(()=>assistant.classList.remove('attention'),500)}
function reveal(index){const chest=chests[index];document.querySelector('#discoveryKicker').textContent=chest.kicker;document.querySelector('#discoveryTitle').textContent=chest.title;document.querySelector('#discoveryText').textContent=chest.text;document.querySelector('#discoveryArt').textContent=chest.icon;const links=document.querySelector('#discoveryLinks');links.innerHTML=index===3?'<a href="mailto:hola@ejemplo.com">Escríbeme por correo ↗</a>':'';document.querySelector('#discoveryCard').classList.add('show');document.querySelector('#discoveryCard').setAttribute('role','dialog');if(opened.size===4)advice('¡Nivel completado!','¡Abriste los cuatro cofres! Gracias por conocer mi portafolio.');else advice('¡Cofre descubierto!','¡Muy bien! Ya puedes seguir buscando los otros tesoros.')}
function nearestChest(){let best=-1;let distance=Infinity;chests.forEach((chest,index)=>{if(opened.has(index))return;const d=Math.abs(player.x-chest.x)+Math.abs(player.y-chest.y);if(d<distance){best=index;distance=d}});return {index:best,distance}}
function jumpCheckpoint(key){const point=checkpoints[key];if(!point)return;player={...point};renderBoard();document.querySelectorAll('.checkpoint').forEach(button=>button.classList.toggle('active',button.dataset.jump===key));advice(`Checkpoint: ${point.label}`,`Alex llegó a ${point.label.toLowerCase()}. Programa “Interactuar” si estás junto a un cofre.`)}
function walk(distance=1){const direction=directions[player.dir];for(let i=0;i<distance;i++){const nx=player.x+direction.x,ny=player.y+direction.y;if(nx<0||nx>=5||ny<0||ny>=7||!isPath(nx,ny)){const chest=nearestChest();if(chest.index>=0){const target=chests[chest.index];const hint=player.x!==target.x&&player.y!==target.y?'Prueba otro giro para llegar al camino correcto.':'El árbol bloquea esa casilla. Intenta saltar sobre el obstáculo.';notify(`¡Alex chocó! ${hint}`)}else notify('¡Alex chocó con un árbol! Prueba girar o saltar.');return false}player.x=nx;player.y=ny;steps++}renderBoard();updateProgress();return true}
function jump(){const direction=directions[player.dir];const mid={x:player.x+direction.x,y:player.y+direction.y};const end={x:player.x+direction.x*2,y:player.y+direction.y*2};if(end.x<0||end.x>=5||end.y<0||end.y>=7){notify('¡Ese salto te saca del tablero! Gira hacia el camino.');return false}if(!isPath(end.x,end.y)){notify('No hay espacio para aterrizar. Prueba otra dirección.');return false}player.x=end.x;player.y=end.y;steps+=2;renderBoard();updateProgress();return true}
function interact(){const index=chests.findIndex(chest=>chest.x===player.x&&chest.y===player.y);if(index<0){const nearby=nearestChest();if(nearby.index>=0){const chest=chests[nearby.index];const horizontal=Math.abs(player.x-chest.x),vertical=Math.abs(player.y-chest.y);notify(nearby.distance===1?'Estás junto al cofre. Avanza una casilla encima y pulsa Interactuar.':`Este cofre está a ${nearby.distance} casillas. Sigue el camino y vuelve a interactuar.`)}else notify('Ya abriste todos los cofres. ¡Misión cumplida!');return false}if(opened.has(index)){notify('Este cofre ya está abierto. ¡Busca el siguiente!');return false}opened.add(index);renderBoard();updateProgress();reveal(index);return true}
async function execute(){if(isRunning)return;if(!commands.length){notify('Añade bloques a la secuencia. Arrastra uno o haz clic en la paleta.');return}isRunning=true;const runButton=document.querySelector('#runButton');runButton.disabled=true;const sequence=[...commands];for(const op of sequence){let success=true;if(op==='move')success=walk(1);if(op==='jump')success=jump();if(op==='right'){player.dir=(player.dir+1)%4;steps++;renderBoard();updateProgress()}if(op==='left'){player.dir=(player.dir+3)%4;steps++;renderBoard();updateProgress()}if(op==='interact')success=interact();if(!success)break;await new Promise(resolve=>setTimeout(resolve,360))}isRunning=false;runButton.disabled=false}
function addCommand(op){if(isRunning)return;if(!names[op])return;commands.push(op);renderCommands();advice('Bloque añadido',`${names[op]}: bloque ${commands.length}. Puedes arrastrarlo para cambiar el orden.`)}

document.querySelectorAll('.block').forEach(block=>{block.addEventListener('dragstart',event=>{event.dataTransfer.setData('text/plain',block.dataset.op);event.dataTransfer.effectAllowed='copy'});block.addEventListener('click',()=>addCommand(block.dataset.op))});
workspace.addEventListener('dragover',event=>{event.preventDefault();workspace.classList.add('drag-over')});workspace.addEventListener('dragleave',event=>{if(!workspace.contains(event.relatedTarget))workspace.classList.remove('drag-over')});workspace.addEventListener('drop',event=>{event.preventDefault();workspace.classList.remove('drag-over');const value=event.dataTransfer.getData('text/plain');if(value.startsWith('reorder:')){const from=Number(value.split(':')[1]);if(Number.isInteger(draggedIndex)&&from>=0&&from<commands.length){const [op]=commands.splice(from,1);commands.push(op);renderCommands()}draggedIndex=null}else addCommand(value)});
document.querySelector('#runButton').addEventListener('click',execute);
document.querySelector('#resetButton').addEventListener('click',()=>{if(isRunning)return;player={...checkpoints.start};commands=[];opened.clear();steps=0;renderCommands();renderBoard();updateProgress();document.querySelectorAll('.checkpoint').forEach(button=>button.classList.toggle('active',button.dataset.jump==='start'));document.querySelector('#discoveryCard').classList.remove('show');advice('¡Listos para jugar!','Secuencia y tablero reiniciados. ¡Encuentra los cuatro cofres!')});
document.querySelectorAll('.checkpoint').forEach(button=>button.addEventListener('click',()=>jumpCheckpoint(button.dataset.jump)));
document.querySelector('#helpButton').addEventListener('click',()=>{const chest=nearestChest();if(chest.index<0){notify('¡Ya encontraste todos los cofres! ¡Qué gran aventura!');return}const target=chests[chest.index];const distance=Math.abs(player.x-target.x)+Math.abs(player.y-target.y);if(distance===0)notify('Estás encima del cofre. Añade “Interactuar” a tu programa.');else if(player.y!==target.y)notify(`Pista: el cofre ${chest.index+1} está ${target.y>player.y?'abajo':'arriba'} y ${target.x>player.x?'a la derecha':'a la izquierda'}.`);else notify(`Pista: el cofre ${chest.index+1} está ${target.x>player.x?'a la derecha':'a la izquierda'}. ¡Gira hacia él!`)});
document.querySelector('#portfolioButton').addEventListener('click',()=>{document.querySelector('#discoveryKicker').textContent='PORTAFOLIO';document.querySelector('#discoveryTitle').textContent='¡Hola! Soy Alejandro';document.querySelector('#discoveryText').textContent='Estudiante y creador en formación. Este juego es mi portafolio: abre los cofres para conocerme, descubrir mis habilidades y explorar mis proyectos.';document.querySelector('#discoveryArt').textContent='🧑🏻‍💻';document.querySelector('#discoveryLinks').innerHTML='<a href="mailto:hola@ejemplo.com">Contacto ↗</a>';document.querySelector('#discoveryCard').classList.add('show')});
document.querySelector('#dismissAssistant').addEventListener('click',()=>document.querySelector('#assistant').classList.toggle('quiet'));
document.querySelector('#closeDiscovery').addEventListener('click',()=>document.querySelector('#discoveryCard').classList.remove('show'));
document.querySelector('#discoveryCard').addEventListener('click',event=>{if(event.target.id==='discoveryCard')event.currentTarget.classList.remove('show')});
workspace.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();execute()}});
window.addEventListener('keydown',event=>{if(event.key==='Escape')document.querySelector('#discoveryCard').classList.remove('show')});
buildBoard();renderBoard();renderCommands();updateProgress();
