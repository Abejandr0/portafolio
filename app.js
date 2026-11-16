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
  {x:2,y:13,pathIndex:2,title:'Hola, soy Alejandro',kicker:'COFRE 1 · SOBRE MÍ',badge:'Curiosidad · conocer al creador',text:'Soy estudiante de Ingeniería de Software en la Universidad Cooperativa de Colombia. Me gusta aprender construyendo: tomar una idea, convertirla en una solución y mejorarla paso a paso. Fuera del código, me encantan las motos y soy amante de las abejas.',highlights:['Estudio Ingeniería de Software en la Universidad Cooperativa de Colombia.','Motos y abejas son dos de mis grandes intereses.'],art:'bee'},
  {x:4,y:11,pathIndex:6,title:'Habilidades que cultivo',kicker:'COFRE 2 · APRENDIZAJE',badge:'Ciberseguridad · curiosidad en acción',text:'Me gusta mucho aprender sobre ciberseguridad. Como estudiante de Ingeniería de Software, me interesa entender cómo proteger los sistemas, reconocer riesgos y construir tecnología con más responsabilidad. Estoy formando esa base paso a paso y explorando este campo con curiosidad.',highlights:['Interés actual: ciberseguridad y protección de sistemas.','Mi formación en software me ayuda a conectar seguridad con la construcción de aplicaciones.'],art:'spark'},
  {x:2,y:9,pathIndex:10,title:'Proyectos en construcción',kicker:'COFRE 3 · PROYECTOS',badge:'Creación · ideas que toman forma',text:'Estos proyectos nacen de intereses distintos: tecnología para motociclistas, experiencias de aprendizaje, vínculos personales y herramientas con inteligencia artificial. Cada tarjeta cuenta qué puedes encontrar al abrir su repositorio o sitio.',art:'chest'},
  {x:0,y:7,pathIndex:14,title:'Fuera del código',kicker:'COFRE 4 · MIS INTERESES',badge:'Motos · abejas · curiosidad',text:'Las motos me entusiasman por todo lo que rodea cada recorrido: las máquinas, sus modificaciones y las historias que aparecen en el camino. También soy amante de las abejas; me fascinan su mundo y la forma en que cada aporte cuenta. Son intereses que mantienen viva mi curiosidad y me dan nuevas ideas para construir.',highlights:['Motos: pasión que también se convirtió en ideas para proyectos.','Abejas: un interés personal que acompaña el nombre y el espíritu de este juego.'],art:'spark'},
  {x:2,y:7,pathIndex:16,title:'Lo que me inspira',kicker:'COFRE 5 · HISTORIAS E IDEAS',badge:'Imaginación · crear con significado',text:'Me inspira crear experiencias que conectan con una historia y con lo que le importa a quien juega. Jakelin’s World es un videojuego 2D narrativo que hice para una persona muy especial en mi vida: reúne minijuegos relacionados con cosas que a ella le gustan y todavía está en desarrollo. También me ilusiona crear juegos para niños con retos amables, ideas claras y espacio para aprender jugando.',highlights:['Jakelin’s World: videojuego 2D narrativo con minijuegos, aún en desarrollo.','Me interesan los juegos para niños y la gamificación como formas de despertar curiosidad.'],art:'spark'},
  {x:2,y:0,pathIndex:27,title:'Último cofre · Contacto',kicker:'COFRE FINAL · META Y CONTACTO',badge:'Logro · Explorador del Sendero',text:'¡Encontraste la última parada! Gracias por recorrer el sendero y conocer un poco de mí. Me encanta aprender, compartir ideas y seguir creando. Si te interesa alguno de mis proyectos o quieres conversar, aquí puedes encontrarme.',highlights:['Instagram · @alejojcastro','GitHub · Abejandr0'],art:'trophy'}
];
const finalChestIndex=chests.length-1;
const projectLinks = [
  {label:'MotoTracer',description:'App móvil para registrar rodadas, administrar motocicletas y compartir rutas.',href:'https://github.com/Abejandr0/mototracer'},
  {label:'MotoMod',description:'Simulador de modificaciones para motocicletas y de su impacto mecánico.',href:'https://github.com/Abejandr0/mods-app'},
  {label:'Honey',description:'Aplicación para relojes inteligentes enfocada en la comunicación entre parejas.',href:'https://github.com/Abejandr0/honey'},
  {label:'CodeType',description:'Aprende programación mediante mecanografía en una aplicación de escritorio.',href:'https://github.com/Abejandr0/codeType'},
  {label:'AIverse',description:'Una experiencia de inteligencia artificial disponible para explorar en la web.',href:'https://aiverse-alejandro.duckdns.org/'},
  {label:'Jakelin’s World',description:'Videojuego 2D narrativo con minijuegos inspirados en sus gustos. En desarrollo.',status:'En desarrollo'}
];
const contactLinks = [
  {label:'Instagram · @alejojcastro',description:'Mi perfil de Instagram.',href:'https://www.instagram.com/alejojcastro/'},
  {label:'GitHub · Abejandr0',description:'Mis repositorios y proyectos de código.',href:'https://github.com/Abejandr0'}
];
const spawn = {x:2,y:15,dir:0};
const checkpoints = {
  start:{x:2,y:13,dir:1,chestIndex:0},
  skills:{x:4,y:11,dir:3,chestIndex:1},
  projects:{x:2,y:9,dir:3,chestIndex:2},
  interests:{x:0,y:7,dir:1,chestIndex:3},
  ideas:{x:2,y:7,dir:0,chestIndex:4},
  finish:{x:2,y:0,dir:0,chestIndex:finalChestIndex}
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
let previousFocus = null;
let hasSeenWelcomeTour = false;
let welcomeTourIndex = 0;
let welcomeTourReturnFocus = null;
let welcomeTouchStart = null;
let suppressWelcomeArtClick = false;
const visualSettings = {textScale:0,highContrast:false,reduceMotion:window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false};
try{hasSeenWelcomeTour=localStorage.getItem('sendero-welcome-seen')==='true'}catch{/* La guía aparece si el navegador no permite guardar esta preferencia. */}
try {
  const savedSettings=JSON.parse(localStorage.getItem('sendero-visual-settings')||'{}');
  if(Number.isInteger(savedSettings.textScale))visualSettings.textScale=Math.max(0,Math.min(2,savedSettings.textScale));
  if(typeof savedSettings.highContrast==='boolean')visualSettings.highContrast=savedSettings.highContrast;
  if(typeof savedSettings.reduceMotion==='boolean')visualSettings.reduceMotion=savedSettings.reduceMotion;
} catch {/* Las preferencias siguen disponibles aunque el navegador bloquee el almacenamiento local. */}

const key = (x,y) => `${x},${y}`;
const pause = ms => new Promise(resolve => setTimeout(resolve,ms));
function saveVisualSettings(){try{localStorage.setItem('sendero-visual-settings',JSON.stringify(visualSettings))}catch{/* La sesión conserva los ajustes si el almacenamiento local no está disponible. */}}
function applyVisualSettings(announce=false){
  document.body.classList.toggle('high-contrast',visualSettings.highContrast);
  document.body.classList.toggle('reduce-motion',visualSettings.reduceMotion);
  document.body.classList.toggle('force-motion',Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)&&!visualSettings.reduceMotion);
  document.body.classList.toggle('text-scale-1',visualSettings.textScale===1);
  document.body.classList.toggle('text-scale-2',visualSettings.textScale===2);
  $('#contrastButton').setAttribute('aria-pressed',String(visualSettings.highContrast));
  $('#motionButton').setAttribute('aria-pressed',String(visualSettings.reduceMotion));
  $('#textDecreaseButton').disabled=visualSettings.textScale===0;
  $('#textIncreaseButton').disabled=visualSettings.textScale===2;
  if(announce){
    const scaleLabel=['tamaño normal','interfaz ampliada al 108%','interfaz ampliada al 116%'][visualSettings.textScale];
    $('#accessibilityStatus').textContent=`Preferencias aplicadas: ${scaleLabel}, contraste ${visualSettings.highContrast?'alto':'normal'}, animaciones ${visualSettings.reduceMotion?'reducidas':'activas'}.`;
  }
  saveVisualSettings();
}
function updateMapStatus(){
  const direction=directions[player.dir];
  $('#mapStatus').textContent=`La abeja está en la columna ${player.x+1}, a ${(rows-1-player.y)*12} metros de altura, mirando al ${direction.label.toLowerCase()}. Has descubierto ${opened.size} de ${chests.length} paradas.`;
}
function showDiscovery(){
  const card=$('#discoveryCard');
  previousFocus=isRunning?$('#runButton'):document.activeElement;
  if(previousFocus?.disabled)previousFocus=$('#runButton');
  card.setAttribute('role','dialog');
  card.setAttribute('aria-modal','true');
  card.classList.add('show');
  $('#closeDiscovery').focus();
}
const welcomeTourSteps=[
  {topic:'BIENVENIDO',title:'El Sendero del polen',description:'Un portafolio que también se juega: explora mi trabajo mientras programas el vuelo de una abeja.',art:'bee',highlights:['Sigue el sendero a tu ritmo.','Cada cofre revela una parte del portafolio.']},
  {topic:'ACCESOS DIRECTOS',title:'Elige dónde empezar',description:'Los botones del mapa te llevan directo a Sobre mí, Habilidades, Proyectos, Mis intereses, Inspiración o Contacto. Cada uno abre esa sección sin jugar primero.',art:'flag',highlights:['Elige una sección cuando quieras saltar a una parte concreta.','Si prefieres la aventura completa, puedes jugar el reto del mapa.']},
  {topic:'PROGRAMA Y PRUEBA',title:'Toca bloques para crear una ruta',description:'Añade instrucciones con un toque, ordénalas con las flechas y pulsa “Ejecutar ruta”. También puedes arrastrar los bloques.',art:'spark',highlights:['La abeja sigue la secuencia de arriba hacia abajo.','El búho puede darte una pista cuando la necesites.']},
  {topic:'A TU MANERA',title:'Ajusta la experiencia',description:'Explora sin afán y cambia la forma en que ves el juego desde las opciones sobre el mapa.',art:'chest',highlights:['A− y A+ amplían la interfaz.','Activa más contraste o reduce las animaciones.']}
];
function renderWelcomeTourStep(index){
  welcomeTourIndex=Math.max(0,Math.min(welcomeTourSteps.length-1,index));
  const step=welcomeTourSteps[welcomeTourIndex];
  const card=$('#tourCard');card.classList.remove('is-changing');void card.offsetWidth;card.classList.add('is-changing');
  $('#tourCounter').textContent=`PASO ${welcomeTourIndex+1} DE ${welcomeTourSteps.length}`;
  $('#tourTopic').textContent=step.topic;$('#tourTitle').textContent=step.title;$('#tourDescription').textContent=step.description;
  $('#tourArt').innerHTML=artMarkup(step.art);
  const isLastTourStep=welcomeTourIndex===welcomeTourSteps.length-1;
  $('#tourArtButton').setAttribute('aria-label',isLastTourStep?'Empezar la aventura':`Siguiente consejo: ${welcomeTourSteps[welcomeTourIndex+1].title}`);
  $('#tourArtPromptText').textContent=isLastTourStep?'TOCA PARA EMPEZAR':'TOCA LA ILUSTRACIÓN PARA SEGUIR';
  $('#tourHighlights').replaceChildren(...step.highlights.map(text=>{const item=document.createElement('li');item.textContent=text;return item}));
  $('#tourProgress').style.width=`${((welcomeTourIndex+1)/welcomeTourSteps.length)*100}%`;
  $('.tour-progress-track').setAttribute('aria-valuenow',String(welcomeTourIndex+1));
  $('#tourPrevious').disabled=welcomeTourIndex===0;
  $('#tourNext').innerHTML=welcomeTourIndex===welcomeTourSteps.length-1?'Empezar a jugar <span aria-hidden="true">→</span>':'Siguiente <span aria-hidden="true">→</span>';
  const keepStepFocus=document.activeElement?.classList.contains('tour-step-dot');
  $('#tourStepNav').replaceChildren(...welcomeTourSteps.map((item,stepIndex)=>{const button=document.createElement('button');button.type='button';button.className=`tour-step-dot${stepIndex===welcomeTourIndex?' is-active':''}`;button.setAttribute('aria-label',`Ir al paso ${stepIndex+1}: ${item.title}`);if(stepIndex===welcomeTourIndex)button.setAttribute('aria-current','step');button.textContent=String(stepIndex+1);button.addEventListener('click',()=>renderWelcomeTourStep(stepIndex));return button}));
  if(keepStepFocus)$(`#tourStepNav .tour-step-dot:nth-child(${welcomeTourIndex+1})`).focus();
}
function openWelcomeTour(){
  if(isRunning||$('#discoveryCard').classList.contains('show'))return;
  welcomeTourReturnFocus=document.activeElement===document.body?null:document.activeElement;
  $('.game-shell').inert=true;document.body.classList.add('welcome-tour-open');
  const tour=$('#welcomeTour');tour.hidden=false;welcomeTourIndex=0;renderWelcomeTourStep(0);$('#tourSkip').focus();
}
function closeWelcomeTour(focusTarget){
  const tour=$('#welcomeTour');if(tour.hidden)return;
  tour.hidden=true;$('.game-shell').inert=false;document.body.classList.remove('welcome-tour-open');hasSeenWelcomeTour=true;
  try{localStorage.setItem('sendero-welcome-seen','true')}catch{/* La guía seguirá siendo accesible desde el botón superior. */}
  const target=focusTarget||welcomeTourReturnFocus||$('#replayWelcomeTour');welcomeTourReturnFocus=null;target?.focus();
}
function advanceWelcomeTour(){if(welcomeTourIndex===welcomeTourSteps.length-1)closeWelcomeTour($('#blockPalette .palette-block'));else renderWelcomeTourStep(welcomeTourIndex+1)}
function beeMarkup(){return `<svg class="bee-svg" viewBox="0 0 72 72" role="img" aria-label="Abeja exploradora">
  <path class="bee-wing wing-a" d="M25 31C19 18 9 17 8 25c-1 7 5 13 16 16l5-3Zm22 0c6-13 16-14 17-6 1 7-5 13-16 16l-5-3Z" fill="#d8f4f2" stroke="#87c9d0" stroke-width="1.5" stroke-linejoin="round"/>
  <path d="M22 34c-1-7 5-11 14-11s15 4 14 11c2 8 2 17-1 25-2 6-7 10-13 12-6-2-11-6-13-12-3-8-3-17-1-25Z" fill="#f8c742"/>
  <path d="M23 46c8 3.5 18 3.5 26 0l-.6 6.2c-7.7 3.2-17.1 3.2-24.8 0Zm2 11c6.7 2.7 15.3 2.7 22 0-1.9 5.4-5.4 9.1-11 11-5.6-1.9-9.1-5.6-11-11Z" fill="#514652"/>
  <path d="M26 25c3-2.2 6.3-3.2 10-3.2s7 .9 10 3.2" fill="none" stroke="#ffe88e" stroke-width="2" stroke-linecap="round"/>
  <circle cx="36" cy="31" r="14" fill="#ffd95e"/>
  <path d="M26 29c1-2 3-3 5-3m10 0c2 0 4 1 5 3" fill="none" stroke="#f4c147" stroke-width="1.5" stroke-linecap="round"/>
  <ellipse cx="30.5" cy="32" rx="3.7" ry="4.5" fill="#fffdf3"/><ellipse cx="41.5" cy="32" rx="3.7" ry="4.5" fill="#fffdf3"/>
  <circle cx="31.5" cy="33" r="1.65" fill="#354051"/><circle cx="42.5" cy="33" r="1.65" fill="#354051"/>
  <circle cx="24.5" cy="39" r="2.4" fill="#f39a94" opacity=".8"/><circle cx="47.5" cy="39" r="2.4" fill="#f39a94" opacity=".8"/>
  <path d="M33 39c1.7 2 4.3 2 6 0" fill="none" stroke="#76515a" stroke-width="1.7" stroke-linecap="round"/>
  <path d="M31 19c-1-3-3-5-6-6m16 6c1-3 3-5 6-6" fill="none" stroke="#65505a" stroke-width="1.7" stroke-linecap="round"/>
  <circle cx="25" cy="13" r="2" fill="#f19b91"/><circle cx="47" cy="13" r="2" fill="#f19b91"/>
  <path d="M13 25c3 1 5 3 7 6m39-6c-3 1-5 3-7 6" fill="none" stroke="#fff" stroke-width="1.3" stroke-linecap="round" opacity=".75"/>
</svg>`}
function artMarkup(type){
  const drawings = {
    bee:beeMarkup(),
    spark:'<svg viewBox="0 0 64 64" aria-hidden="true"><path d="m32 5 6 19 19 8-19 7-6 20-7-20-19-7 19-8z" fill="#ffc940" stroke="#d99928" stroke-width="2"/><circle cx="48" cy="15" r="4" fill="#f58b9a"/><circle cx="14" cy="48" r="3" fill="#62bb8b"/></svg>',
    chest:'<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M9 27h46v27H9z" fill="#e99d38" stroke="#a65d35" stroke-width="3"/><path d="M7 22q0-8 8-8h34q8 0 8 8v8H7z" fill="#ffc447" stroke="#a65d35" stroke-width="3"/><path d="M27 29h10v12H27z" rx="3" fill="#fff0b0" stroke="#a65d35" stroke-width="2"/><circle cx="32" cy="35" r="2" fill="#a65d35"/></svg>',
    finalChest:'<svg viewBox="0 0 64 64" aria-hidden="true"><ellipse cx="32" cy="55" rx="22" ry="5" fill="#8d6228" opacity=".2"/><path d="M11 29h42v24H11z" fill="#d8892e" stroke="#8d5b2c" stroke-width="2.5"/><path d="M8 26c0-7 5-11 12-11h24c7 0 12 4 12 11v7H8z" fill="#f5b83f" stroke="#9e692e" stroke-width="2.5"/><path d="M12 31h40v5H12z" fill="#ffdb72"/><path d="M27 32h10v13H27z" rx="3" fill="#fff0ad" stroke="#b47831" stroke-width="2"/><circle cx="32" cy="38" r="2" fill="#9e692e"/><path d="m32 4 3.5 6.8 7.5 1.1-5.4 5.2 1.3 7.4-6.9-3.6-6.9 3.6 1.3-7.4-5.4-5.2 7.5-1.1z" fill="#fff0a3" stroke="#c68c31" stroke-width="1.5" stroke-linejoin="round"/><path d="m17 21 2 3m28-3-2 3" stroke="#fff0a3" stroke-width="2" stroke-linecap="round"/></svg>',
    trophy:'<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M20 8h24v18c0 9-5 14-12 14s-12-5-12-14V8Z" fill="#ffd45b" stroke="#c58d2c" stroke-width="2.5"/><path d="M20 14H9v6c0 8 5 12 13 12m22-18h11v6c0 8-5 12-13 12" fill="none" stroke="#d59b35" stroke-width="4" stroke-linecap="round"/><path d="M32 40v9m-10 6h20l-3-6H25z" fill="#e7a83b" stroke="#bd812d" stroke-width="2" stroke-linejoin="round"/><path d="m32 13 2.4 4.8 5.3.8-3.8 3.7.9 5.2-4.8-2.5-4.8 2.5.9-5.2-3.8-3.7 5.3-.8z" fill="#fff9cf"/><path d="M13 45c3-3 5-3 7 0m31 0c-3-3-5-3-7 0" fill="none" stroke="#82b77b" stroke-width="3" stroke-linecap="round"/></svg>',
    flag:'<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M17 8v49" stroke="#65738b" stroke-width="4" stroke-linecap="round"/><path d="M20 10h31L43 22l8 11H20z" fill="#74c879" stroke="#3c9363" stroke-width="2" stroke-linejoin="round"/><path d="M13 58h14" stroke="#65738b" stroke-width="4" stroke-linecap="round"/></svg>'
  };
  return drawings[type] || drawings.spark;
}
function scenicType(x,y){const n=(x*7+y*11)%4;return ['tree','rock','flower','stump'][n]}
function buildBoard(){
  board.style.setProperty('--rows',rows);
  board.replaceChildren();
  for(let y=0;y<rows;y++)for(let x=0;x<columns;x++){
    const tile=document.createElement('div');tile.className='cell';tile.dataset.x=x;tile.dataset.y=y;
    if(pathSet.has(key(x,y)))tile.classList.add('walkable');else tile.classList.add('obstacle');
    const index=path.findIndex(([px,py])=>px===x&&py===y);
    if(index>=0){tile.style.setProperty('--path-order',index);if(index%2===0)tile.classList.add('path-sunlit')}
    const chestIndex=chests.findIndex(chest=>chest.x===x&&chest.y===y);
    if(chestIndex>=0){const isFinal=chestIndex===finalChestIndex;tile.classList.add('chest-cell');if(isFinal)tile.classList.add('final-chest-cell');const art=document.createElement('span');art.className='tile-art chest-art';art.innerHTML=artMarkup(isFinal?'finalChest':'chest');tile.append(art);const badge=document.createElement('span');badge.className=`treasure-count${isFinal?' final-treasure-count':''}`;badge.textContent=String(chestIndex+1);badge.setAttribute('aria-label',isFinal?'Cofre final':'Cofre');tile.append(badge)}
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
  const chest=chests[index];if(!chest||!opened.has(index))return;const tile=$(`.cell[data-x="${chest.x}"][data-y="${chest.y}"]`,board);if(!tile)return;
  if(index===finalChestIndex){
    const art=tile.querySelector('.chest-art');
    if(art){art.classList.remove('chest-art');art.classList.add('goal-art');art.innerHTML=artMarkup('trophy')}
    tile.querySelector('.treasure-count')?.remove();tile.classList.remove('chest-cell','chest-glow','opened-chest','chest-unsealing');tile.classList.add('revealed-path','goal-reached');return;
  }
  tile.querySelector('.chest-art')?.remove();tile.querySelector('.treasure-count')?.remove();tile.classList.remove('chest-cell','chest-glow','opened-chest','chest-unsealing');tile.classList.add('revealed-path');
}
function renderBoard(animateChest=-1){
  $$('.cell',board).forEach(tile=>{tile.classList.remove('player-cell');$('.bee',tile)?.remove()});
  const current=$(`.cell[data-x="${player.x}"][data-y="${player.y}"]`,board);
  if(current){current.classList.add('player-cell');const wrapper=document.createElement('span');wrapper.className='bee';wrapper.style.setProperty('--heading-turn',`${player.dir*90}deg`);wrapper.innerHTML=`${beeMarkup()}<span class="bee-heading" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3 5.5 11h4.2v10h4.6V11h4.2L12 3Z"/></svg></span>`;wrapper.setAttribute('aria-label',`Abeja mirando al ${directions[player.dir].label.toLowerCase()}`);current.append(wrapper);if(lastPlayerCell!==key(player.x,player.y)){wrapper.classList.add('bee-arrive');lastPlayerCell=key(player.x,player.y)}}
  chests.forEach((chest,index)=>{const tile=$(`.cell[data-x="${chest.x}"][data-y="${chest.y}"]`,board);if(!tile)return;if(opened.has(index)){if(index===animateChest&&$('.chest-art',tile)){tile.classList.add('opened-chest','chest-unsealing');$('.chest-art',tile).innerHTML=artMarkup('spark');window.setTimeout(()=>settleChest(index),900)}else settleChest(index)}else{tile.classList.remove('revealed-path','goal-reached','opened-chest','chest-unsealing');tile.classList.add('chest-cell','chest-glow');if(index===finalChestIndex)tile.classList.add('final-chest-cell');let art=$('.chest-art',tile);if(!art){art=document.createElement('span');art.className='tile-art chest-art';const badge=document.createElement('span');badge.className=`treasure-count${index===finalChestIndex?' final-treasure-count':''}`;badge.textContent=String(index+1);tile.append(art,badge)}art.innerHTML=artMarkup(index===finalChestIndex?'finalChest':'chest')}});
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
    const actions=document.createElement('span');actions.className='sequence-actions';actions.setAttribute('role','group');actions.setAttribute('aria-label',`Acciones para ${info.label}`);
    const up=document.createElement('button');up.className='move-command-button move-command-up';up.type='button';up.setAttribute('aria-label',`Mover ${info.label} hacia arriba`);up.textContent='↑';up.disabled=index===0;up.addEventListener('click',()=>moveCommandBy(index,-1));
    const down=document.createElement('button');down.className='move-command-button move-command-down';down.type='button';down.setAttribute('aria-label',`Mover ${info.label} hacia abajo`);down.textContent='↓';down.disabled=index===commands.length-1;down.addEventListener('click',()=>moveCommandBy(index,1));
    actions.append(up,down);
    const remove=document.createElement('button');remove.className='remove-block';remove.type='button';remove.setAttribute('aria-label',`Quitar ${info.label}`);remove.textContent='×';remove.addEventListener('click',()=>removeCommand(index));
    item.append(num,glyph,label,actions,remove);
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
  $('#missionCount').setAttribute('aria-label',`${count} de ${total} paradas descubiertas`);
  const honeyTrack=$('#honeyTrack');
  if(honeyTrack.children.length!==total)honeyTrack.replaceChildren(...Array.from({length:total},()=>document.createElement('span')));
  [...honeyTrack.children].forEach((segment,index)=>{const discovered=opened.has(index);segment.classList.add('honey-segment');segment.classList.toggle('is-filled',discovered);segment.setAttribute('aria-label',`Cofre ${index+1}${discovered?' descubierto':' pendiente'}`)});
  const progressRail=$('#progressRail');
  if(progressRail.children.length!==total)progressRail.replaceChildren(...chests.map(()=>{const node=document.createElement('span');node.className='progress-stop';node.innerHTML='<i></i>';return node}));
  [...progressRail.children].forEach((node,index)=>{const discovered=opened.has(index);node.classList.toggle('is-done',discovered);node.setAttribute('aria-label',`Checkpoint ${index+1}${discovered?' completado':' pendiente'}`)});
  $('#stepsText').textContent=steps;
  $$('.checkpoint').forEach(button=>{const point=checkpoints[button.dataset.checkpoint];const active=(point.x===player.x&&point.y===player.y)||(button.dataset.checkpoint==='start'&&steps===0&&opened.size===0);button.classList.toggle('active',active);if(active)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');const index=chests.findIndex(chest=>chest.x===point.x&&chest.y===point.y);const visited=index>=0&&opened.has(index);button.classList.toggle('visited',visited);button.setAttribute('aria-label',`${$('span',button).textContent}${visited?' · parada descubierta':''}`)});
}
function advice(title,message){$('#assistantTitle').textContent=title;$('#assistantMessage').textContent=message}
async function notify(message){
  const assistant=$('#assistant');assistant.classList.add('show','attention');advice('Búho guía',message);setTimeout(()=>assistant.classList.remove('attention'),550);
  const endpoint=window.PORTFOLIO_CONFIG?.aiCoachEndpoint;if(!endpoint)return;
  try{const response=await fetch(endpoint,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({message,player:{x:player.x,y:player.y,direction:directions[player.dir].label},openedChests:[...opened],steps})});if(!response.ok)return;const result=await response.json();if(typeof result.message==='string'&&result.message.trim())advice('Búho guía',result.message.trim().slice(0,280))}catch{/* Pistas locales disponibles sin configurar IA. */}
}
function renderHighlights(items=[]){const container=$('#discoveryHighlights');container.replaceChildren();items.forEach(text=>{const item=document.createElement('li');item.textContent=text;container.append(item)});container.hidden=items.length===0}
function renderLinks(items){const container=$('#discoveryLinks');container.replaceChildren();items.forEach(item=>{const card=document.createElement(item.href?'a':'article');card.className='discovery-project';if(item.href){card.href=item.href;card.target='_blank';card.rel='noopener noreferrer'}else card.classList.add('is-in-development');const copy=document.createElement('span');copy.className='discovery-project-copy';const title=document.createElement('strong');title.textContent=item.label;const description=document.createElement('span');description.textContent=item.description||'';copy.append(title,description);const marker=document.createElement('span');marker.className='discovery-project-marker';marker.textContent=item.href?'↗':(item.status||'En desarrollo');marker.setAttribute('aria-hidden','true');card.append(copy,marker);container.append(card)})}
function reveal(index){
  const chest=chests[index];const complete=index===finalChestIndex&&opened.size===chests.length;$('#discoveryKicker').textContent=complete?`¡META ALCANZADA! · ${chests.length}/${chests.length} PARADAS`:chest.kicker;$('#discoveryTitle').textContent=complete?'¡Meta alcanzada!':chest.title;$('#discoveryText').textContent=complete?'Abriste las seis paradas y llegaste al final del sendero. Gracias por acompañarme; soy Alejandro y me encantaría seguir en contacto.':chest.text;$('#discoveryArt').innerHTML=artMarkup(complete?'trophy':chest.art);const badge=$('#discoveryBadge');badge.hidden=false;badge.textContent=`✦ Insignia: ${complete?'Explorador del Sendero':chest.badge}`;renderHighlights(complete?['¡Abriste las seis paradas!','Puedes volver a cualquier sección desde los accesos directos del mapa.']:chest.highlights);renderLinks(index===2?projectLinks:index===finalChestIndex?contactLinks:[]);const card=$('#discoveryCard');card.setAttribute('aria-describedby','discoveryBadge discoveryText discoveryHighlights');card.classList.toggle('complete',complete);card.classList.remove('show');void card.offsetWidth;showDiscovery();updateMapStatus();if(complete)advice('¡Meta alcanzada!','¡Abriste las seis paradas y desbloqueaste la insignia de Explorador del Sendero!');else advice('¡Cofre descubierto!','¡Buen trabajo! El cofre se abre y deja el sendero libre para continuar.');
}
function nearestChest(){let best=-1,distance=Infinity;chests.forEach((chest,index)=>{if(opened.has(index))return;const d=Math.abs(player.x-chest.x)+Math.abs(player.y-chest.y);if(d<distance){best=index;distance=d}});return{index:best,distance}}
function giveHint(){
  const target=nearestChest();
  if(target.index<0){notify('Ya descubriste todas las paradas. ¡Buen trabajo!');return}
  const chest=chests[target.index];
  const currentIndex=path.findIndex(([x,y])=>x===player.x&&y===player.y);
  if(currentIndex===chest.pathIndex){notify(`Estás junto a la parada ${target.index+1}. Añade el bloque “Abrir cofre” para descubrirla.`);return}
  if(currentIndex<0){notify(`La siguiente parada está a ${target.distance} casillas. Busca las baldosas iluminadas y avanza con calma.`);return}
  const nextIndex=currentIndex+(chest.pathIndex>currentIndex?1:-1);
  const [nextX,nextY]=path[nextIndex];
  const directionIndex=directions.findIndex(direction=>direction.x===nextX-player.x&&direction.y===nextY-player.y);
  const relative=['de frente','a tu derecha','detrás de ti','a tu izquierda'][(directionIndex-player.dir+4)%4];
  const remaining=Math.abs(chest.pathIndex-currentIndex);
  notify(`La parada ${target.index+1} está a ${remaining} baldosas. Por ahora el sendero sigue ${relative}. Prueba avanzar y revisa el rumbo cuando el camino gire.`);
}
function jumpCheckpoint(checkpoint){const point=checkpoints[checkpoint];if(!point||isRunning)return;player={x:point.x,y:point.y,dir:point.dir};lastPlayerCell=null;openChest(point.chestIndex)}
function walk(distance=1){const dir=directions[player.dir];for(let n=0;n<distance;n++){const nx=player.x+dir.x,ny=player.y+dir.y;if(!pathSet.has(key(nx,ny))){const chestIndex=chests.findIndex((chest,index)=>chest.x===player.x&&chest.y===player.y&&!opened.has(index));if(chestIndex>=0){notify(`¡Tienes el cofre ${chestIndex+1} a tus pies! Usa “Abrir cofre” para descubrirlo.`);return false}const target=nearestChest();const targetPoint=target.index>=0?chests[target.index]:null;const turnNeeded=targetPoint&&Math.abs(player.x-targetPoint.x)+Math.abs(player.y-targetPoint.y)<5;notify(`La abeja no puede avanzar hacia ${directions[player.dir].label.toLowerCase()}. ${turnNeeded?'El sendero gira aquí; usa un bloque de giro.':'Hay un obstáculo en esa baldosa. Prueba a saltarlo si el camino sigue detrás.'}`);return false}player.x=nx;player.y=ny;steps++;renderBoard();updateProgress()}return true}
async function jump(){const dir=directions[player.dir],nx=player.x+dir.x*2,ny=player.y+dir.y*2;if(!pathSet.has(key(nx,ny))){notify('No hay una baldosa segura dos casillas adelante. Revisa el rumbo o avanza una casilla.');return false}$('.player-cell .bee')?.classList.add('bee-jump');await pause(170);player.x=nx;player.y=ny;steps+=2;renderBoard();updateProgress();return true}
function openChest(index){if(index<0||index>=chests.length)return false;const isNew=!opened.has(index);opened.add(index);renderBoard(isNew?index:-1);updateProgress();reveal(index);return true}
function interact(){let index=chests.findIndex((chest,i)=>chest.x===player.x&&chest.y===player.y&&!opened.has(i));if(index<0){const current=chests.findIndex(chest=>chest.x===player.x&&chest.y===player.y);if(current>=0)index=current;else{const nearby=nearestChest();if(nearby.index>=0&&nearby.distance<=1)index=nearby.index;else{notify(nearby.index>=0?`El cofre ${nearby.index+1} está a ${nearby.distance} casillas. Acércate y vuelve a interactuar.`:'¡Ya descubriste todos los cofres!');return false}}}return openChest(index)}
async function execute(){if(isRunning)return;if(!commands.length){notify('Agrega bloques tocando una instrucción o arrastrándola al programa.');return}isRunning=true;const button=$('#runButton');button.disabled=true;setRunControlsDisabled(true);const sequence=[...commands];try{for(const op of sequence){let success=true;if(op==='move')success=walk();else if(op==='jump')success=await jump();else if(op==='right'){player.dir=(player.dir+1)%4;renderBoard();updateProgress()}else if(op==='left'){player.dir=(player.dir+3)%4;renderBoard();updateProgress()}else if(op==='interact')success=interact();if(!success)break;if(op==='interact'&&$('#discoveryCard').classList.contains('show'))await new Promise(resolve=>{discoveryResolver=resolve});else await pause(220)}}finally{isRunning=false;button.disabled=false;setRunControlsDisabled(false);updateMapStatus();restoreDiscoveryFocus()}}
function addCommand(op,index=commands.length){if(isRunning||!commandsInfo[op])return;commands.splice(Math.max(0,Math.min(index,commands.length)),0,op);renderCommands()}
function removeCommand(index){if(isRunning||index<0||index>=commands.length)return;commands.splice(index,1);renderCommands();if(commands.length)$(`.program-block[data-index="${Math.min(index,commands.length-1)}"] .remove-block`)?.focus();else $('#workspace').focus()}
function moveCommand(from,to){if(isRunning||from===to||from<0||from>=commands.length)return;const [op]=commands.splice(from,1);commands.splice(from<to?to-1:to,0,op);renderCommands()}
function moveCommandBy(index,offset){const target=index+offset;if(isRunning||index<0||index>=commands.length||target<0||target>=commands.length)return;[commands[index],commands[target]]=[commands[target],commands[index]];renderCommands();$(`.program-block[data-index="${target}"] .move-command-${offset<0?'up':'down'}`)?.focus()}
function setRunControlsDisabled(disabled){document.body.classList.toggle('route-running',disabled);$$('.checkpoint,#resetButton,#portfolioButton,#blockPalette .palette-block,.move-command-button,.remove-block').forEach(control=>control.disabled=disabled);if(!disabled)renderCommands()}
function setTrashActive(active){trash.classList.toggle('is-over',active)}

$$('.palette-block').forEach(block=>{block.addEventListener('dragstart',event=>{event.dataTransfer.setData('text/plain',block.dataset.op);event.dataTransfer.effectAllowed='copy';block.classList.add('is-dragging')});block.addEventListener('dragend',()=>block.classList.remove('is-dragging'));block.addEventListener('click',()=>addCommand(block.dataset.op))});
workspace.addEventListener('dragover',event=>{event.preventDefault();workspace.classList.add('drag-over')});workspace.addEventListener('dragleave',event=>{if(!workspace.contains(event.relatedTarget))workspace.classList.remove('drag-over')});workspace.addEventListener('drop',event=>{event.preventDefault();workspace.classList.remove('drag-over');const value=event.dataTransfer.getData('text/plain');if(value.startsWith('reorder:'))moveCommand(Number(value.split(':')[1]),commands.length);else addCommand(value)});
trash.addEventListener('dragover',event=>{event.preventDefault();event.dataTransfer.dropEffect='move';setTrashActive(true)});trash.addEventListener('dragenter',event=>{event.preventDefault();setTrashActive(true)});trash.addEventListener('dragleave',event=>{if(!trash.contains(event.relatedTarget))setTrashActive(false)});trash.addEventListener('drop',event=>{event.preventDefault();const value=event.dataTransfer.getData('text/plain');setTrashActive(false);if(value.startsWith('reorder:'))removeCommand(Number(value.split(':')[1]));else notify('La papelera elimina bloques que ya están dentro de tu programa.')});
$('#runButton').addEventListener('click',execute);
$('#resetButton').addEventListener('click',()=>{if(isRunning)return;player={...spawn};commands=[];opened.clear();steps=0;lastPlayerCell=null;renderCommands();renderBoard();updateProgress();updateMapStatus();$('#discoveryCard').classList.remove('show','complete');$('#assistant').classList.add('show');advice('¡Listos para jugar!','Programa el vuelo y encuentra las seis paradas del sendero.')});
$$('.checkpoint').forEach(button=>button.addEventListener('click',()=>jumpCheckpoint(button.dataset.checkpoint)));
$('#hintButton').addEventListener('click',giveHint);
$('#replayWelcomeTour').addEventListener('click',openWelcomeTour);
$('#tourSkip').addEventListener('click',()=>closeWelcomeTour());
$('#tourPrevious').addEventListener('click',()=>renderWelcomeTourStep(welcomeTourIndex-1));
$('#tourNext').addEventListener('click',advanceWelcomeTour);
$('#tourArtButton').addEventListener('click',()=>{if(suppressWelcomeArtClick){suppressWelcomeArtClick=false;return}advanceWelcomeTour()});
$('#tourCard').addEventListener('touchstart',event=>{welcomeTouchStart={x:event.changedTouches[0].clientX,y:event.changedTouches[0].clientY,startedOnArt:Boolean(event.target.closest('#tourArtButton'))}},{passive:true});
$('#tourCard').addEventListener('touchend',event=>{if(!welcomeTouchStart)return;const gesture=welcomeTouchStart,dx=event.changedTouches[0].clientX-gesture.x,dy=event.changedTouches[0].clientY-gesture.y;welcomeTouchStart=null;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.25){if(gesture.startedOnArt){event.preventDefault();suppressWelcomeArtClick=true;window.setTimeout(()=>{suppressWelcomeArtClick=false},80)}renderWelcomeTourStep(welcomeTourIndex+(dx<0?1:-1))}},{passive:false});
$('#portfolioButton').addEventListener('click',()=>{$('#discoveryKicker').textContent='PORTAFOLIO';$('#discoveryTitle').textContent='¡Hola! Soy Alejandro';$('#discoveryText').textContent='Estudiante de Ingeniería de Software en la Universidad Cooperativa de Colombia, con interés en ciberseguridad, motos y abejas. Explora mis proyectos y encuéntrame en Instagram o GitHub.';$('#discoveryArt').innerHTML=artMarkup('bee');$('#discoveryBadge').hidden=true;renderHighlights([]);$('#discoveryCard').setAttribute('aria-describedby','discoveryText');renderLinks([...projectLinks,...contactLinks]);$('#discoveryCard').classList.remove('complete');showDiscovery()});
$('#textDecreaseButton').addEventListener('click',()=>{visualSettings.textScale=Math.max(0,visualSettings.textScale-1);applyVisualSettings(true)});
$('#textIncreaseButton').addEventListener('click',()=>{visualSettings.textScale=Math.min(2,visualSettings.textScale+1);applyVisualSettings(true)});
$('#contrastButton').addEventListener('click',()=>{visualSettings.highContrast=!visualSettings.highContrast;applyVisualSettings(true)});
$('#motionButton').addEventListener('click',()=>{visualSettings.reduceMotion=!visualSettings.reduceMotion;applyVisualSettings(true)});
$('#dismissAssistant').addEventListener('click',()=>$('#assistant').classList.remove('show','attention'));
function restoreDiscoveryFocus(){if(!previousFocus)return;if(previousFocus.isConnected&&!previousFocus.disabled){previousFocus.focus();previousFocus=null}else if(previousFocus.disabled&&isRunning){previousFocus=null;workspace.focus()}else if(!previousFocus.isConnected)previousFocus=null}
function closeDiscovery(){ $('#discoveryCard').classList.remove('show');restoreDiscoveryFocus();if(discoveryResolver){const resume=discoveryResolver;discoveryResolver=null;resume()}}
$('#closeDiscovery').addEventListener('click',closeDiscovery);$('#continueDiscovery').addEventListener('click',closeDiscovery);$('#discoveryCard').addEventListener('click',event=>{if(event.target.id==='discoveryCard')closeDiscovery()});
workspace.addEventListener('keydown',event=>{if(event.target!==workspace)return;if(event.key==='Enter'||event.key===' '){event.preventDefault();execute()}});
window.addEventListener('keydown',event=>{
  const tour=$('#welcomeTour');
  if(!tour.hidden){
    if(event.key==='Escape'){event.preventDefault();closeWelcomeTour();return}
    if(event.key==='ArrowRight'){event.preventDefault();advanceWelcomeTour();return}
    if(event.key==='ArrowLeft'){event.preventDefault();renderWelcomeTourStep(welcomeTourIndex-1);return}
    if(event.key==='Tab'){
      const focusable=[...tour.querySelectorAll('button:not([disabled]),a[href]')];
      if(!focusable.length){event.preventDefault();$('#tourSkip').focus();return}
      const first=focusable[0],last=focusable[focusable.length-1];
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
    }
    return;
  }
  const card=$('#discoveryCard');if(!card.classList.contains('show'))return;
  if(event.key==='Escape'){event.preventDefault();closeDiscovery();return}
  if(event.key==='Tab'){
    const focusable=[...card.querySelectorAll('button:not([disabled]),a[href]')];
    if(!focusable.length){event.preventDefault();$('#closeDiscovery').focus();return}
    const first=focusable[0],last=focusable[focusable.length-1];
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
  }
});
window.addEventListener('resize',updateCamera);
applyVisualSettings();
buildBoard();renderBoard();renderCommands();updateProgress();updateMapStatus();$('#assistant').classList.add('show');
if(!hasSeenWelcomeTour)window.setTimeout(()=>{if(!hasSeenWelcomeTour&&$('#welcomeTour').hidden)openWelcomeTour()},220);
