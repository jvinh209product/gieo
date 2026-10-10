export function siteOrigin(env={}) {
 const raw=env.SITE_URL?.trim() || (env.VERCEL_PROJECT_PRODUCTION_URL ? 'https://'+env.VERCEL_PROJECT_PRODUCTION_URL : env.VERCEL_URL ? 'https://'+env.VERCEL_URL : '');
 if(!raw)return '';
 let url;
 try{url=new URL(raw);}catch{throw Error('SITE_URL must be an absolute HTTPS origin, such as the confirmed Vercel or custom domain.');}
 const local=['localhost','127.0.0.1','[::1]'].includes(url.hostname);
 if((url.protocol!=='https:'&&!(local&&url.protocol==='http:'))||url.username||url.password||url.search||url.hash||url.pathname!=='/')throw Error('SITE_URL must contain only an HTTPS origin (no path, credentials, query or fragment). HTTP is allowed for local development only.');
 return url.origin;
}
