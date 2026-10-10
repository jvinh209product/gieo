import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {routes} from './routes.mjs';
import {siteOrigin} from './site-config.mjs';
import {resolvePublicFile} from './serve.mjs';
import {createViews} from '../src/views.js';
import {content} from '../src/content.js';
import {ui} from '../src/i18n.js';
import {SessionClock} from '../src/core.js';
const digest=file=>createHash('sha256').update(fs.readFileSync(file)).digest('hex');
test('Vercel rules cover only the real routes and every destination exists',()=>{
 const config=JSON.parse(fs.readFileSync('vercel.json','utf8'));
 assert.equal(config.framework,null);assert.equal(config.outputDirectory,'dist');
 assert.equal(config.installCommand,'npm ci');assert.equal(config.buildCommand,'npm run build');
 assert.deepEqual(config.rewrites.map(x=>x.source).sort(),[...routes].sort());
 for(const rule of config.rewrites){assert.ok(!rule.source.includes('*'));assert.ok(!rule.source.includes('assets'));assert.ok(fs.statSync('dist'+rule.destination).isFile());}
 assert.ok(fs.existsSync('dist/404.html'));
});
test('direct nested requests resolve without homepage fallbacks and missing assets stay 404',()=>{
 for(const route of routes){for(const suffix of route==='/'?['','?lang=vi']:['','/','?lang=vi']){const result=resolvePublicFile(route+suffix);assert.equal(result.status,200,route+suffix);assert.equal(result.file,path.resolve('dist'+(route==='/'?'':route)+'/index.html'));}}
 for(const file of ['/assets/not-a-module.js','/assets/missing.webp','/missing.css']){const result=resolvePublicFile(file);assert.equal(result.status,404);assert.ok(!result.file);assert.ok(!result.type.includes('html'));}
 assert.equal(resolvePublicFile('/unimplemented-article').status,404);
 assert.equal(resolvePublicFile('/%00').status,400);
 assert.equal(resolvePublicFile('/%2e%2e%2fpackage.json').status,403);
});
test('all copied runtime modules, font/image assets and declared resource references are local',()=>{
 for(const name of fs.readdirSync('src').filter(x=>x.endsWith('.js'))){
  const source=fs.readFileSync('src/'+name,'utf8');
  assert.equal(digest('src/'+name),digest('dist/assets/'+name));
  for(const match of source.matchAll(/from\s+['"]([^'"]+)['"]/g)){assert.ok(match[1].startsWith('./'),match[1]);assert.ok(fs.existsSync(path.join('dist/assets',match[1])),match[1]);}
  assert.ok(!/chatgpt\.site|https?:\/\/localhost|https?:\/\/[^'"\s]+\.github\.dev|fetch\s*\(/.test(source),name);
 }
 for(const name of fs.readdirSync('public/assets'))assert.equal(digest('public/assets/'+name),digest('dist/assets/'+name));
 const css=fs.readFileSync('dist/assets/styles.css','utf8');
 for(const match of css.matchAll(/url\((?:(['"])(.*?)\1|([^\s)]+))\)/g)){const target=match[2]||match[3];if(target.startsWith('data:')||target.startsWith('#'))continue;assert.ok(target.startsWith('/assets/'),target);assert.equal(resolvePublicFile(target).status,200,target);}
 for(const route of routes){const html=fs.readFileSync('dist'+(route==='/'?'':route)+'/index.html','utf8');assert.ok(!html.includes('chatgpt.site'));for(const match of html.matchAll(/(?:src|href)="(\/assets\/[^\"]+)"/g))assert.equal(resolvePublicFile(match[1]).status,200,match[1]);}
});
test('canonical origins are optional, validate safely, and use confirmed Vercel variables',()=>{
 assert.equal(siteOrigin({}),'');assert.equal(siteOrigin({SITE_URL:'https://gieo.example/'}),'https://gieo.example');
 assert.equal(siteOrigin({VERCEL_PROJECT_PRODUCTION_URL:'gieo.example',VERCEL_URL:'preview.example'}),'https://gieo.example');
 assert.equal(siteOrigin({VERCEL_URL:'preview.example'}),'https://preview.example');
 assert.equal(siteOrigin({SITE_URL:'http://localhost:4173'}),'http://localhost:4173');
 for(const SITE_URL of ['not-a-url','http://example.com','https://user:secret@example.com','https://example.com/path','https://example.com/?token=secret'])assert.throws(()=>siteOrigin({SITE_URL}));
 const origin=siteOrigin(process.env);
 const html=fs.readFileSync('dist/explore/impermanence/index.html','utf8');
 assert.ok(html.includes('href="'+origin+'/explore/impermanence?lang=en"'));
 assert.ok(html.includes('content="'+origin+'/assets/landscape.webp"'));
 assert.equal(fs.existsSync('dist/sitemap.xml'),Boolean(origin));
});
test('seven scenes and the secure global creator credit remain in both languages on all routes',()=>{
 const state={path:'/',menu:false,reduce:false,seed:'thought',connection:null,choices:{},exploreFilter:'all',storiesFilter:'all',query:'',libraryType:'all',libraryCategory:'all',gardenDraft:{},modalDraft:{},prompt:0,sound:false,volume:.2};
 for(const lang of ['en','vi']){
  const views=createViews({state,lang,entries:[],clock:new SessionClock(),session:{id:'minute',title:ui.oneMinute,mode:'silent',cues:content.sessions[0].cues}});
  const home=views.page('/');assert.equal((home.match(/data-scene="[0-6]"/g)||[]).length,7);assert.ok(home.includes('skip-journey'));
  for(const route of routes){const html=views.header()+views.page(route)+views.footer();assert.equal((html.match(/class="site-footer"/g)||[]).length,1);assert.equal((html.match(/Design and Develop by/g)||[]).length,1);assert.ok(html.includes('href="https://vinh-nguyen-portfolio-three.vercel.app/" target="_blank" rel="noopener noreferrer"'));assert.ok(html.includes('Vinh Nguyen'));}
 }
});
