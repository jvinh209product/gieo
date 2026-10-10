export const JOURNAL_KEY='gieo.garden.v1';
export class SessionClock {
 constructor(now=()=>performance.now()){this.now=now;this.status='ready';this.duration=60;this.accumulated=0;this.startedAt=0;}
 configure(duration){this.duration=duration;this.accumulated=0;this.status='ready';}
 start(){if(this.status==='running')return; if(this.status==='complete'){this.accumulated=0;}this.startedAt=this.now();this.status='running';}
 get elapsed(){return Math.min(this.duration, this.accumulated+(this.status==='running'?(this.now()-this.startedAt)/1000:0));}
 get remaining(){return Math.max(0,this.duration-this.elapsed);}
 get progress(){return Math.min(1,this.elapsed/this.duration);}
 pause(){if(this.status!=='running')return;this.accumulated=this.elapsed;this.status='paused';}
 end(){this.accumulated=this.elapsed;this.status='complete';}
 reset(){this.accumulated=0;this.status='ready';}
 tick(){if(this.status==='running'&&this.remaining<=0){this.accumulated=this.duration;this.status='complete';return true;}return false;}
}
export function validEntry(e){return e&&typeof e.id==='string'&&e.id.length>0&&e.id.length<200&&typeof e.body==='string'&&e.body.trim().length>0&&e.body.length<=100000&&typeof e.createdAt==='string'&&Number.isFinite(Date.parse(e.createdAt))&&(!e.updatedAt||(typeof e.updatedAt==='string'&&Number.isFinite(Date.parse(e.updatedAt))))&&(!e.title||(typeof e.title==='string'&&e.title.length<=300))&&(!e.emotion||(typeof e.emotion==='string'&&e.emotion.length<=100))&&(!e.sourceRef||(typeof e.sourceRef==='string'&&e.sourceRef.length<=256));}
export function parseJournal(text){const data=JSON.parse(text);if(data.schemaVersion!==1||!Array.isArray(data.entries)||data.entries.length>10000||!data.entries.every(validEntry)||new Set(data.entries.map(e=>e.id)).size!==data.entries.length)throw new Error('Invalid journal');return data.entries;}
export function saveJournal(storage,entries){if(!entries.every(validEntry))throw new Error('Invalid entry');storage.setItem(JOURNAL_KEY,JSON.stringify({schemaVersion:1,entries}));}
export function normalized(s){return s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase();}
export function initialLanguage(params,storage){const explicit=params.get('lang');if(explicit==='en'||explicit==='vi')return explicit;try{const saved=storage.getItem('gieo.language');return saved==='vi'?'vi':'en';}catch{return 'en';}}
