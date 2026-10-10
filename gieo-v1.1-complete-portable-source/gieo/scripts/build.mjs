import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {content} from '../src/content.js';
import {ui} from '../src/i18n.js';
import {createViews,escapeHTML} from '../src/views.js';
import {SessionClock} from '../src/core.js';
import {siteOrigin} from './site-config.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dist=path.join(root,'dist');
const origin=siteOrigin(process.env);
fs.rmSync(dist,{recursive:true,force:true});
fs.mkdirSync(dist,{recursive:true});
fs.cpSync(path.join(root,'public'),dist,{recursive:true});
fs.mkdirSync(path.join(dist,'assets'),{recursive:true});
for(const file of fs.readdirSync(path.join(root,'src'))){if(file.endsWith('.js')||file==='styles.css'){fs.copyFileSync(path.join(root,'src',file),path.join(dist,'assets',file));}}
const routes=['/','/explore','/stories','/sanctuary','/garden','/library','/about',...content.lessons.map(x=>'/explore/'+x.slug),...content.stories.map(x=>'/stories/'+x.slug)];
const base=fs.readFileSync(path.join(root,'src/index.html'),'utf8');
let checks=0;
for(const route of [...routes,'/404']){
 const clock=new SessionClock();
 const state={path:route,menu:false,reduce:false,seed:'thought',connection:null,exploreFilter:'all',storiesFilter:'all',choices:{},query:'',libraryType:'all',libraryCategory:'all',gardenDraft:{},prompt:0,volume:.2,sound:false};
 for(const lang of ['en','vi']){const v=createViews({state,lang,entries:[],clock,session:{id:'minute',title:ui.oneMinute,mode:'silent',cues:content.sessions[0].cues}});const page=v.page(route);if(page.includes('undefined'))throw Error('Unresolved content on '+route+' / '+lang);checks++;}
 const v=createViews({state,lang:'en',entries:[],clock,session:{id:'minute',title:ui.oneMinute,mode:'silent',cues:content.sessions[0].cues}});
 const page=v.header()+`<main id="main" tabindex="-1">${v.page(route)}</main>`+v.footer();
 const item=content.lessons.find(x=>route==='/explore/'+x.slug)||content.stories.find(x=>route==='/stories/'+x.slug);
 const title=route==='/'?ui.metaTitle.en:(item?.title.en||ui[route.slice(1)]?.en||ui.notFound.en)+' — GIEO.';
 const desc=item?(item.intro?.en||item.body.en).slice(0,240):ui.metaDescription.en;
 let html=base.replace(/<title>[\s\S]*?<\/title>/,`<title>${escapeHTML(title)}</title>`).replace(/<meta name="description" content="[^"]*">/,`<meta name="description" content="${escapeHTML(desc)}">`).replace(/<div id="app">[\s\S]*?<\/main><\/div>/,`<div id="app">${page}</div>`);
 html=html.replace('<body>',`<body class="${route==='/'?'home-page':route==='/sanctuary'?'dark-page':'paper-page'}">`);
 html=html.replace(/(<link rel="canonical" href=")[^"]+/,`$1${origin}${route==='/'?'/':route}?lang=en`);
 html=html.replace(/(<meta property="og:url" content=")[^"]+/,`$1${origin}${route==='/'?'/':route}`);
 html=html.replace(/(<meta property="og:image" content=")[^"]+/,`$1${origin}/assets/landscape.webp`);
 html=html.replace(/(<link rel="alternate" hreflang="(en|vi|x-default)" href=")[^"]+/g,(_,prefix,locale)=>prefix+escapeHTML(origin+route+'?lang='+(locale==='vi'?'vi':'en')));
 html=html.replace(/(<meta property="og:title" content=")[^"]+/,`$1${escapeHTML(title)}`).replace(/(<meta property="og:description" content=")[^"]+/,`$1${escapeHTML(desc)}`);
 const folder=route==='/404'?dist:path.join(dist,route);fs.mkdirSync(folder,{recursive:true});fs.writeFileSync(path.join(folder,route==='/404'?'404.html':'index.html'),html);
}
fs.writeFileSync(path.join(dist,'robots.txt'),'User-agent: *\nAllow: /\n'+(origin?'Sitemap: '+origin+'/sitemap.xml\n':''));
if(origin)fs.writeFileSync(path.join(dist,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+routes.map(r=>'<url><loc>'+escapeHTML(origin+r)+'</loc></url>').join('')+'</urlset>');
console.log(`Built ${routes.length} real routes. Verified ${checks} English/Vietnamese page renders.`);
if(!origin)console.log('No build-time site origin configured: metadata uses local paths; sitemap is omitted. Set SITE_URL to the confirmed production origin for absolute SEO metadata.');
