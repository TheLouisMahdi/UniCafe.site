// Read-only HTTPS verification with public DNS and normal certificate validation.
// This does not alter the computer's DNS or TLS settings.
import https from 'node:https';
import assert from 'node:assert/strict';
const host=process.argv[2] || 'unicafe-znu.pages.dev';
const dns=await fetch(`https://1.1.1.1/dns-query?name=${encodeURIComponent(host)}&type=A`,{headers:{accept:'application/dns-json'}}).then(r=>r.json());
const addresses=(dns.Answer||[]).filter(a=>a.type===1).map(a=>a.data);
console.log(JSON.stringify({host,dnsStatus:dns.Status,addresses}));
assert.ok(addresses.length,'No public A records yet');
const lookup=(name,options,callback)=>options.all ? callback(null,addresses.map(address=>({address,family:4}))) : callback(null,addresses[0],4);
for(const path of ['/','/drinks','/about','/contact','/club','/admin','/assets/config.js','/assets/app.js','/assets/backend.js','/robots.txt','/missing-unicafe-test']) {
 const result=await new Promise((resolve,reject)=>{
  const req=https.get(`https://${host}${path}`,{lookup,timeout:15000},r=>{
   let body='';r.setEncoding('utf8');r.on('data',s=>body+=s);r.on('end',()=>resolve({path,status:r.statusCode,csp:Boolean(r.headers['content-security-policy']),bytes:Buffer.byteLength(body),tls:r.socket?.authorized,body}));
  });req.on('error',reject);req.on('timeout',()=>req.destroy(new Error('HTTPS timeout')));
 });
 console.log(JSON.stringify({...result,body:undefined}));
 assert.equal(result.status,path.includes('missing-')?404:200,`HTTP status ${path}`);
 if(path==='/') assert.ok(result.body.includes('UniCafe'));
}
