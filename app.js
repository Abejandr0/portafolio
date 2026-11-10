const player=document.querySelector('#player');
const zone=document.querySelector('#dropZone');
const list=document.querySelector('#sequenceList');
const empty=document.querySelector('#emptyDrop');
const guideTitle=document.querySelector('#guideTitle');
const guideMessage=document.querySelector('#guideMessage');
const toast=document.querySelector('#gameToast');
const info=document.querySelector('#treasureInfo');
const story=[
  {title:'¡Mucho gusto!',name:'Un poco sobre mí',text:'Soy Alejandro, estudiante de diseño de interfaces. Me gusta transformar ideas en experiencias digitales claras, útiles y llenas de personalidad.'},
  {title:'¡Nuevo poder desbloqueado!',name:'Habilidades en construcción',text:'Exploro diseño visual, prototipado y desarrollo web. Disfruto conectar una idea con una interfaz que se sienta intuitiva y cercana.'},
  {title:'¡Tesoro creativo!',name:'Ideas que toman forma',text:'Aquí irán mis proyectos destacados: el reto, las decisiones de diseño y lo que aprendí al construir cada solución. Pronto podrás explorar sus detalles.'},
  {title:'¡Aventura completada!',name:'Gracias por jugar',text:'Estoy abierto a colaborar, aprender y crear cosas interesantes. ¿Hablamos? Puedes escribirme a hola@ejemplo.com.'}
];
const chestX=[23,55,82];
let sequence=[];let x=8;let y=0;let found=new Set();let running=false;let toastTimeout;

function actionLabel(action){return {right:'Avanzar',left:'Retroceder',jump:'Saltar',open:'Abrir cofre'}[action]}
function styleFor(action){return {right:'go-block',left:'left-block',jump:'jump-block',open:'open-block'}[action]}
function render(){
  list.innerHTML='';empty.style.display=sequence.length?'none':'flex';
  sequence.forEach((action,index)=>{const row=document.createElement('div');row.className=`sequence-item ${styleFor(action)}`;row.innerHTML=`<span class="sequence-number">${index+1}.</span><b>${actionLabel(action)}</b><button type="button" aria-label="Quitar bloque">×</button>`;row.querySelector('button').addEventListener('click',()=>{sequence.splice(index,1);render()});list.append(row)});
  document.querySelector('#blockCount').textContent=sequence.length;
}
function say(message){toast.textContent=message;toast.classList.add('show');clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>toast.classList.remove('show'),1800)}
function updatePlayer(){player.style.left=`${x}%`;player.style.bottom=`${51+y}px`;player.classList.add('walking');setTimeout(()=>player.classList.remove('walking'),360)}
function setGuide(title,message){guideTitle.textContent=title;guideMessage.textContent=message;document.querySelector('#speechBubble').textContent=message.length>35?message.slice(0,33)+'…':message}
function reveal(index){
  if(index<0||index>3)return;
  document.querySelectorAll('.map-stop').forEach((stop,i)=>{stop.classList.toggle('active',i===index);stop.classList.toggle('done',found.has(i)||i<index)});
  document.querySelectorAll('.checkpoint').forEach((cp,i)=>cp.classList.toggle('visited',i===index||found.has(i)));
  document.querySelector('#hudLevel').textContent=['EL BOSQUE DE LAS IDEAS','EL JARDÍN DE HABILIDADES','LA ISLA DE PROYECTOS','LA META'][index];
  document.querySelector('#progressLabel').textContent=`${found.size} / 4`;document.querySelector('#progressBar').style.width=`${found.size*25}%`;
  document.querySelector('#infoEyebrow').textContent=`CHECKPOINT 0${index+1} · ${['SOBRE MÍ','HABILIDADES','PROYECTOS','FINAL'][index]}`;
  document.querySelector('#infoTitle').textContent=story[index].name;document.querySelector('#infoText').textContent=story[index].text;info.classList.add('show');
  setGuide(story[index].title,story[index].text);
  if(index===3){found.add(3);document.querySelector('#progressLabel').textContent=`${found.size} / 4`;document.querySelector('#progressBar').style.width='100%'}
}
function jumpTo(index){const positions=[8,37,68,90];x=positions[index];y=0;updatePlayer();reveal(index);say(`¡Checkpoint ${index+1}!`)}
function addBlock(action){if(running)return;sequence.push(action);render()}
function closestChest(){let best=-1;let distance=Infinity;chestX.forEach((position,index)=>{const d=Math.abs(x-position);if(!found.has(index)&&d<distance){best=index;distance=d}});return {index:best,distance}}
async function runSequence(){
  if(running)return;if(!sequence.length){setGuide('¡Vamos, aventurero!','Arrastra bloques aquí o toca uno para crear tu ruta.');say('Añade bloques a tu secuencia');return}
  running=true;document.querySelector('#playButton').disabled=true;const plan=[...sequence];sequence=[];render();let advanced=false;
  for(const action of plan){
    if(action==='right'||action==='left'){
      const direction=action==='right'?1:-1;x=Math.max(5,Math.min(91,x+12*direction));y=0;updatePlayer();advanced=true;await new Promise(r=>setTimeout(r,430));
    }else if(action==='jump'){
      player.classList.add('jumping');y=43;await new Promise(r=>setTimeout(r,400));player.classList.remove('jumping');y=0;await new Promise(r=>setTimeout(r,180));
    }else if(action==='open'){
      const chest=closestChest();
      if(chest.index<0){setGuide('¡Todos los cofres abiertos!','Ya encontraste todos los tesoros. Sigue hasta la bandera para terminar.');say('¡No quedan cofres!');continue}
      if(chest.distance>11){setGuide('¡Ups, falta un poquito!','El cofre está lejos. Usa “Avanzar” dos veces y prueba de nuevo.');say('Todavía estás lejos del cofre');continue}
      found.add(chest.index);document.querySelector(`.chest-${['one','two','three'][chest.index]}`).classList.add('opened');document.querySelector('#coinCount').textContent=String(found.size*10).padStart(2,'0');
      reveal(chest.index);say('¡Cofre abierto! +10 monedas');await new Promise(r=>setTimeout(r,380));
    }
  }
  if(advanced){const nearest=closestChest();if(nearest.index>=0&&nearest.distance<12&&!found.has(nearest.index)){setGuide('¡Hay un cofre cerquita!','Estás junto al tesoro. Añade “Abrir cofre” para descubrirlo.');say('¡Encontraste un cofre!') }else if(!plan.includes('open')){setGuide('¡Buen avance!','La ruta continúa. Si ves un cofre, añade “Abrir cofre” a tu plan.');}}
  if(x>88&&found.size>=3){reveal(3);say('¡Nivel completado!')}
  running=false;document.querySelector('#playButton').disabled=false;
}

document.querySelectorAll('.code-block').forEach(block=>{
  block.addEventListener('dragstart',event=>{event.dataTransfer.setData('text/plain',block.dataset.action);event.dataTransfer.effectAllowed='copy'});
  block.addEventListener('click',()=>addBlock(block.dataset.action));
});
zone.addEventListener('dragover',event=>{event.preventDefault();zone.classList.add('drag-over')});
zone.addEventListener('dragleave',()=>zone.classList.remove('drag-over'));
zone.addEventListener('drop',event=>{event.preventDefault();zone.classList.remove('drag-over');const action=event.dataTransfer.getData('text/plain');if(['right','left','jump','open'].includes(action))addBlock(action)});
zone.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();if(sequence.length)runSequence()}});
document.querySelector('#playButton').addEventListener('click',runSequence);
document.querySelector('#resetButton').addEventListener('click',()=>{sequence=[];render();setGuide('¡Plan borrado!','Añade bloques para crear una nueva ruta.');say('Secuencia limpia')});
document.querySelector('#closeInfo').addEventListener('click',()=>info.classList.remove('show'));
document.querySelectorAll('[data-jump]').forEach(button=>button.addEventListener('click',()=>jumpTo(Number(button.dataset.jump))));
document.querySelectorAll('.treasure').forEach(chest=>chest.addEventListener('click',()=>{const index=Number(chest.dataset.chest);x=chestX[index];updatePlayer();if(!found.has(index)){found.add(index);document.querySelector(`.chest-${['one','two','three'][index]}`).classList.add('opened');document.querySelector('#coinCount').textContent=String(found.size*10).padStart(2,'0')}reveal(index);say('¡Tesoro descubierto!')}));
document.querySelector('#soundButton').addEventListener('click',event=>{const reduced=document.body.classList.toggle('reduce-motion');event.currentTarget.setAttribute('aria-pressed',String(reduced));event.currentTarget.textContent=reduced?'◉':'◌'});
function keyboard(event){if(['ArrowRight','ArrowLeft','ArrowUp'].includes(event.key)&&!event.repeat){event.preventDefault();if(event.key==='ArrowRight'){x=Math.min(91,x+4);updatePlayer()}if(event.key==='ArrowLeft'){x=Math.max(5,x-4);updatePlayer()}if(event.key==='ArrowUp'){player.classList.add('jumping');setTimeout(()=>player.classList.remove('jumping'),500)}}}
window.addEventListener('keydown',keyboard);
document.querySelector('#leftButton').addEventListener('click',()=>{x=Math.max(5,x-6);updatePlayer()});document.querySelector('#rightButton').addEventListener('click',()=>{x=Math.min(91,x+6);updatePlayer()});document.querySelector('#upButton').addEventListener('click',()=>{player.classList.add('jumping');setTimeout(()=>player.classList.remove('jumping'),500)});
render();

// Scratch bridge: a Scratch stage may notify this page with {type:'portfolio-checkpoint',index:0..3}.
window.addEventListener('message',event=>{const data=event.data;if(data?.type==='portfolio-checkpoint'&&Number.isInteger(data.index)&&data.index>=0&&data.index<4)jumpTo(data.index)});
