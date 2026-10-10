import {content} from './content.js';
import {ui} from './i18n.js';
import {createViews,escapeHTML,formatTime} from './views.js';
import {art} from './art.js';
import {SessionClock,JOURNAL_KEY,parseJournal,saveJournal,initialLanguage} from './core.js';
const app=document.querySelector('#app');
let lang='en';
try{lang=initialLanguage(new URLSearchParams(location.search),localStorage);}catch{const value=new URLSearchParams(location.search).get('lang');lang=value==='vi'?'vi':'en';}
try{localStorage.setItem('gieo.language',lang);}catch{}
let entries=[];
let loadBlocked=false;
try{const saved=localStorage.getItem(JOURNAL_KEY);if(saved)entries=parseJournal(saved);}catch{loadBlocked=true;}
const osMotion=matchMedia('(prefers-reduced-motion: reduce)');
let savedMotion=false;try{savedMotion=localStorage.getItem('gieo.reduce')==='true';}catch{}
const state={path:location.pathname.replace(/\/$/,'')||'/',menu:false,reduce:osMotion.matches||savedMotion,seed:'thought',connection:null,exploreFilter:'all',storiesFilter:'all',choices:{},query:'',libraryType:'all',libraryCategory:'all',gardenDraft:{},modalDraft:{},prompt:Math.floor(Math.random()*4),breathVisual:false,sound:false,volume:.2};
let sessionID='minute';
const clock=new SessionClock(()=>Date.now());
let modal=null;
let focusBeforeDialog=null;
let soundContext=null,soundGain=null,soundSource=null;
let scrollFrame=null,lastScene=-1,lastCue=-1,lastClockStatus='',currentPageTitle='';
let views;
const session=()=>{
 const guided=content.sessions.find(x=>x.id===sessionID);if(guided)return guided;
 const base=content.sessions[0];
 return {id:sessionID,title:ui[sessionID==='minute'?'oneMinute':sessionID==='breath'?'followBreath':'atmosphere'],mode:sessionID==='minute'?'silent':'breath',cues:base.cues};
};
function selectSession(id,duration){
 if(clock.status==='running'){toast('sessionChanged');return;}
 if(!['minute','breath','ambient',...content.sessions.map(x=>x.id)].includes(id))return;
 sessionID=id;const guided=content.sessions.find(x=>x.id===id);
 clock.configure(duration||guided?.duration||(id==='minute'?60:id==='breath'?180:300));lastCue=-1;
 stopSound();state.sound=false;
}
const initParams=new URLSearchParams(location.search);
if(state.path==='/sanctuary')selectSession(initParams.get('session')||'minute');
function captureDrafts(){
 document.querySelectorAll('form[data-form]').forEach(form=>{const obj=Object.fromEntries(new FormData(form));state[form.dataset.form==='garden'?'gardenDraft':'modalDraft']=obj;});
}
function render(preserve=true){
 const y=scrollY;
 captureDrafts();
 const focused=document.activeElement?.id;
 const active=document.activeElement;
 const focusAttribute=['data-lang','data-choice','data-menu','data-filter','data-session','data-clock','data-seed','data-connection','data-prompt','data-library','data-sound','data-motion'].find(k=>active?.hasAttribute(k));
 const focusValue=focusAttribute?active.getAttribute(focusAttribute):null;
 views=createViews({state,lang,entries,clock,session:session()});
 document.documentElement.lang=lang;
 document.documentElement.classList.toggle('reduced',state.reduce);
 document.body.className=state.path==='/'?'home-page':state.path==='/sanctuary'?'dark-page':'paper-page';
 document.body.classList.toggle('menu-open',state.menu);
 app.innerHTML=views.header()+`<main id="main" tabindex="-1">${views.page(state.path)}</main>`+views.footer();
 updateMetadata();
 if(modal)mountDialog();
 if(preserve){window.scrollTo({top:y,behavior:'instant'});if(focused){document.getElementById(focused)?.focus({preventScroll:true});}else if(focusAttribute){document.querySelector(`[${focusAttribute}="${CSS.escape(focusValue)}"]`)?.focus({preventScroll:true});}}
 lastScene=-1;onScroll();updateTimer();
}
function updateMetadata(){
 const lesson=content.lessons.find(x=>state.path==='/explore/'+x.slug),story=content.stories.find(x=>state.path==='/stories/'+x.slug);
 const page=state.path.split('/')[1];
 const heading=(lesson||story)?.title[lang]||(ui[page]?.[lang]);
 currentPageTitle=state.path==='/'?ui.metaTitle[lang]:(heading?heading+' — GIEO.':ui.notFound[lang]+' — GIEO.');
 document.title=currentPageTitle;
 const description=(lesson?.intro[lang]||story?.body[lang]||ui.metaDescription[lang]).slice(0,250);
 document.querySelector('meta[name="description"]').content=description;
 document.querySelector('meta[property="og:title"]').content=currentPageTitle;
 document.querySelector('meta[property="og:description"]').content=description;
 document.querySelector('meta[property="og:url"]').content=location.origin+state.path+'?lang='+lang;
 document.querySelector('meta[property="og:image"]').content=location.origin+'/assets/landscape.webp';
 document.querySelector('link[rel="canonical"]').href=location.origin+state.path+'?lang='+lang;
 document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(el=>{el.href=location.origin+state.path+'?lang='+(el.hreflang==='vi'?'vi':'en');});
}
function navigate(url,pop=false){
 captureDrafts();closeDialog();state.menu=false;
 if(state.path==='/sanctuary'&&url.pathname!=='/sanctuary'){clock.pause();stopSound();state.sound=false;}
 const next=url.pathname.replace(/\/$/,'')||'/';
 if(next==='/library'&&url.hash){state.libraryCategory='all';state.libraryType='all';state.query='';}
 const params=new URLSearchParams(url.search);const explicit=params.get('lang');if(['en','vi'].includes(explicit))lang=explicit;
 if(next==='/sanctuary'&&params.get('session')&&params.get('session')!==sessionID)selectSession(params.get('session'));
 if(!pop)history.pushState({},'',url.pathname+url.search+url.hash);
 state.path=next;render(false);
 if(url.hash){requestAnimationFrame(()=>goAnchor(url.hash));}
 else {scrollTo({top:0,behavior:'instant'});document.querySelector('#main')?.focus({preventScroll:true});}
}
function goAnchor(hash){const target=document.getElementById(hash.slice(1));if(target?.tagName==='DETAILS')target.open=true;target?.scrollIntoView({behavior:state.reduce?'instant':'smooth'});}
function setLanguage(next){
 if(lang===next)return;
 lang=next;try{localStorage.setItem('gieo.language',lang);}catch{}
 const url=new URL(location.href);url.searchParams.set('lang',lang);history.replaceState({},'',url.pathname+url.search+url.hash);
 render(true);
 document.querySelector(`[data-lang="${lang}"]`)?.focus({preventScroll:true});
}
function toast(key){const node=document.querySelector('#toast');node.textContent=ui[key]?.[lang]||key;node.classList.add('visible');clearTimeout(toast.timeout);toast.timeout=setTimeout(()=>node.classList.remove('visible'),6500);}
function updateTimer(){
 const justComplete=clock.tick();
 if(justComplete){stopSound();state.sound=false;if(state.path==='/sanctuary')render(true);return;}
 const time=document.querySelector('.timer-time');if(!time)return;
 time.textContent=formatTime(clock.remaining);
 const progress=document.querySelector('.timer-progress');if(progress)progress.style.strokeDashoffset=804.25*clock.progress;
 const cue=clock.status==='complete'?5:Math.min(4,Math.floor(clock.progress*5));
 if(cue!==lastCue){document.querySelector('.guided-caption').textContent=session().cues[cue][lang];lastCue=cue;}
 if(clock.status!==lastClockStatus){const key=clock.status==='ready'?'ready':clock.status==='paused'?'paused':clock.status==='complete'?'complete':'running';document.querySelector('.session-status').textContent=ui[key][lang];lastClockStatus=clock.status;}
}
async function startSound(){
 try{
  const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)throw Error('No Web Audio');
  soundContext??=new Audio();await soundContext.resume();
  if(soundSource){soundSource.stop();soundSource.disconnect();}
  const buffer=soundContext.createBuffer(1,soundContext.sampleRate*4,soundContext.sampleRate);const samples=buffer.getChannelData(0);let last=0;
  for(let i=0;i<samples.length;i++){const white=Math.random()*2-1;last=(last+white*.03)/1.03;samples[i]=last*3.5;}
  soundSource=soundContext.createBufferSource();soundSource.buffer=buffer;soundSource.loop=true;
  const filter=soundContext.createBiquadFilter();filter.type='lowpass';filter.frequency.value=900;
  soundGain=soundContext.createGain();soundGain.gain.value=state.volume*.6;
  soundSource.connect(filter);filter.connect(soundGain);soundGain.connect(soundContext.destination);soundSource.start();state.sound=true;
 }catch{state.sound=false;toast('audioError');}
}
function stopSound(){if(soundSource){try{soundSource.stop();soundSource.disconnect();}catch{}soundSource=null;}if(soundGain){soundGain.disconnect();soundGain=null;}soundContext?.suspend().catch(()=>{});}
function mountDialog(){
 document.querySelector('.gieo-dialog')?.remove();
 document.querySelector('#dialog-root').innerHTML=views.dialog(modal);
 const d=document.querySelector('.gieo-dialog');d.showModal();
 d.addEventListener('cancel',event=>{event.preventDefault();closeDialog();});
 if(modal.type==='compose')d.querySelector('textarea')?.focus({preventScroll:true});
 else d.querySelector('[data-close-dialog]:not(.dialog-close)')?.focus({preventScroll:true});
}
function openComposer(ref,id){
 captureDrafts();focusBeforeDialog=document.activeElement;
 const [type,slug]=(ref||'').split(':');
 const item=type==='lesson'?content.lessons.find(x=>x.slug===slug):type==='story'?content.stories.find(x=>x.slug===slug):null;
 const existing=id?entries.find(x=>x.id===id):null;
 state.modalDraft=existing?{...existing}:{...state.modalDraft,id:'',sourceRef:ref||''};
 modal={type:'compose',question:item?.question|| (type==='session'?ui.feelNow:null)};
 mountDialog();
}
function closeDialog(){if(!modal)return;captureDrafts();document.querySelector('.gieo-dialog')?.close();document.querySelector('#dialog-root').innerHTML='';modal=null;focusBeforeDialog?.focus?.({preventScroll:true});}
function confirmDialog(key,action){focusBeforeDialog=document.activeElement;modal={type:'confirm',key,action};mountDialog();}
function persist(next,allowReset=false){
 try{if(loadBlocked&&!allowReset)throw Error('Stored data unreadable');saveJournal(localStorage,next);entries=next;loadBlocked=false;return true;}catch{toast('saveError');return false;}
}
function saveEntry(form){
 const data=Object.fromEntries(new FormData(form));
 if(!data.body?.trim()){form.querySelector('.form-error').textContent=ui.missingBody[lang];return;}
 const old=entries.find(x=>x.id===data.id);
 const now=new Date().toISOString();
 const entry={id:old?.id||crypto.randomUUID(),schemaVersion:1,createdAt:old?.createdAt||now,updatedAt:now,title:data.title||'',body:data.body,emotion:data.emotion||'',sourceRef:data.sourceRef||''};
 const next=old?entries.map(x=>x.id===old.id?entry:x):[...entries,entry];
 if(!persist(next)){form.querySelector('.form-error').textContent=ui.saveError[lang];return;}
 form.reset();for(const el of form.querySelectorAll('input,textarea,select')){el.value='';}state.gardenDraft={};state.modalDraft={};if(modal){modal=null;document.querySelector('#dialog-root').innerHTML='';}
 render(true);toast('saved');focusBeforeDialog?.focus?.({preventScroll:true});
}
function downloadJournal(){
 const blob=new Blob([JSON.stringify({schemaVersion:1,exportedAt:new Date().toISOString(),entries},null,2)],{type:'application/json'});
 const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='GIEO-reflections-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
async function importJournal(file){
 try{if(!file||file.size>5*1024*1024)throw Error('Invalid file');const incoming=parseJournal(await file.text());const existingIDs=new Set(entries.map(x=>x.id));const merged=[...entries,...incoming.filter(x=>!existingIDs.has(x.id))];if(!persist(merged))return;render(true);toast('imported');}catch{toast('importError');}
}
function onScroll(){
 document.querySelector('.site-header')?.classList.toggle('scrolled',scrollY>24);
 const panels=[...document.querySelectorAll('.journey-panel')];if(!panels.length)return;
 const mid=innerHeight*.48;let best=Infinity,index=0;
 panels.forEach((p,i)=>{const r=p.getBoundingClientRect();const distance=Math.abs(r.top+r.height*.5-mid);if(distance<best){best=distance;index=i;}});
 const world=document.querySelector('.world');world?.classList.toggle('offscreen',document.querySelector('.journey').getBoundingClientRect().bottom<0);
 if(index!==lastScene){lastScene=index;world.dataset.stage=index;document.querySelector('.world-object').innerHTML=art(panels[index].dataset.art,{season:index===3||index===6?3:0});document.querySelector('.journey').dataset.stage=index;document.querySelectorAll('.journey-dots a').forEach((a,i)=>{a.classList.toggle('active',i===index);if(i===index)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
}
document.addEventListener('click',async event=>{
 const target=event.target.closest('button,a');if(!target)return;
 try{
 if(target.matches('[data-lang]')){setLanguage(target.dataset.lang);return;}
 if(target.matches('[data-menu]')){state.menu=!state.menu;render(true);document.querySelector('[data-menu]')?.focus({preventScroll:true});return;}
 if(target.matches('[data-motion],[data-read-mode]')){state.reduce=state.reduce?osMotion.matches:true;try{localStorage.setItem('gieo.reduce',String(state.reduce));}catch{}render(true);return;}
 if(target.matches('[data-seed]')){state.seed=target.dataset.seed;render(true);return;}
 if(target.matches('[data-connection]')){state.connection=target.dataset.connection;render(true);return;}
 if(target.matches('[data-filter]')){const[scope,k]=target.dataset.filter.split(':');state[scope+'Filter']=k;render(true);return;}
 if(target.matches('[data-choice]')){const[slug,index]=target.dataset.choice.split(':');state.choices[slug]=Number(index);render(true);document.querySelector(`[data-choice="${target.dataset.choice}"]`)?.focus({preventScroll:true});return;}
 if(target.matches('[data-compose]')){openComposer(target.dataset.compose);return;}
 if(target.matches('[data-close-dialog]')){closeDialog();return;}
 if(target.matches('[data-confirm-dialog]')){const action=modal?.action;closeDialog();action?.();return;}
 if(target.matches('[data-session]')){selectSession(target.dataset.session);render(true);return;}
 if(target.matches('[data-clock]')){
  const action=target.dataset.clock;
  if(action==='start')clock.start();if(action==='pause')clock.pause();if(action==='end'){clock.end();stopSound();state.sound=false;}if(action==='reset'||action==='close'){clock.reset();stopSound();state.sound=false;}
  render(true);return;
 }
 if(target.matches('[data-sound]')){if(state.sound){stopSound();state.sound=false;}else await startSound();render(true);return;}
 if(target.matches('[data-prompt]')){state.prompt=(state.prompt+1)%4;render(true);return;}
 if(target.matches('[data-edit]')){openComposer('',target.dataset.edit);return;}
 if(target.matches('[data-delete]')){confirmDialog('deleteConfirm',()=>{if(persist(entries.filter(x=>x.id!==target.dataset.delete)))render(true);});return;}
 if(target.matches('[data-clear]')){confirmDialog('clearConfirm',()=>{if(persist([],true))render(true);});return;}
 if(target.matches('[data-export]')){downloadJournal();return;}
 if(target.matches('[data-import]')){document.querySelector('#import-file').click();return;}
 if(target.matches('[data-library]')){state.libraryCategory=target.dataset.library;render(true);return;}
 if(target.tagName==='A'&&!event.metaKey&&!event.ctrlKey&&!event.shiftKey&&!event.altKey&&target.target!=='_blank'&&!target.hasAttribute('download')){
  const url=new URL(target.href,location.href);if(url.origin!==location.origin)return;
  if(url.pathname===location.pathname&&url.hash){event.preventDefault();if(state.path==='/library'&&!document.getElementById(url.hash.slice(1))){state.libraryCategory='all';state.libraryType='all';state.query='';render(true);}history.pushState({},'',url.pathname+url.search+url.hash);goAnchor(url.hash);return;}
  event.preventDefault();navigate(url);
 }
 }catch(error){toast('genericError');console.error('GIEO interaction error',error.name);}
});
document.addEventListener('submit',event=>{if(event.target.matches('form[data-form]')){event.preventDefault();saveEntry(event.target);}});
document.addEventListener('input',event=>{
 const el=event.target;
 if(el.id==='library-search'){state.query=el.value;document.querySelector('#library-results').innerHTML=views.libraryResults();}
 if(el.id==='volume'){state.volume=Number(el.value);if(soundGain)soundGain.gain.setTargetAtTime(state.volume*.6,soundContext.currentTime,.08);}
 if(el.id==='season-range'){state.choices.impermanence=Number(el.value);render(true);document.querySelector('#season-range').focus({preventScroll:true});}
 if(el.closest('[data-form]'))captureDrafts();
});
document.addEventListener('change',event=>{
 const el=event.target;
 if(el.id==='library-type'){state.libraryType=el.value;document.querySelector('#library-results').innerHTML=views.libraryResults();}
 if(el.id==='guided-select'){selectSession(el.value);render(true);}
 if(el.id==='duration-select'){if(clock.status==='running'){el.value=clock.duration/60;toast('sessionChanged');return;}selectSession(sessionID,Number(el.value)*60);render(true);}
 if(el.id==='breath-visual'){state.breathVisual=el.checked;render(true);}
 if(el.id==='import-file')importJournal(el.files[0]);
});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&state.menu){state.menu=false;render(true);}if(event.key==='Tab'&&state.menu){const elements=[document.querySelector('[data-menu]'),...document.querySelectorAll('.mobile-nav a')];const first=elements[0],last=elements.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}});
window.addEventListener('popstate',()=>navigate(new URL(location.href),true));
window.addEventListener('scroll',()=>{if(scrollFrame===null){scrollFrame=requestAnimationFrame(()=>{onScroll();scrollFrame=null;});}},{passive:true});
window.addEventListener('pointermove',event=>{if(state.reduce||state.path!=='/')return;const world=document.querySelector('.world-object');if(world){world.style.setProperty('--pointer-x',(event.clientX/innerWidth-.5)*14+'px');world.style.setProperty('--pointer-y',(event.clientY/innerHeight-.5)*10+'px');}},{passive:true});
document.addEventListener('visibilitychange',()=>{updateTimer();document.documentElement.classList.toggle('tab-hidden',document.hidden);});
window.addEventListener('pagehide',()=>{stopSound();clock.pause();});
osMotion.addEventListener('change',()=>{state.reduce=osMotion.matches||savedMotion;render(true);});
setInterval(updateTimer,250);
render(false);
if(location.hash)requestAnimationFrame(()=>goAnchor(location.hash));
if(loadBlocked)toast('loadError');
