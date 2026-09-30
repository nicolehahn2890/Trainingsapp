// Badge (↑ Gewicht / ↑ Reps / = Gleich / ↓ Weniger) und Erledigt-Haken stehen IMMER in der 2. Zeile
// unter der Uebungsauswahl — vorher rutschte nur ein breites Badge runter, "= Gleich" blieb daneben.
// Peach-App Browser-Test — Aufruf ueber tests/run.sh (startet den lokalen Server).
const { chromium } = (()=>{try{return require('playwright')}catch(e){return require('/opt/node22/lib/node_modules/playwright')}})();
const PEACH_URL=process.env.PEACH_URL||'http://127.0.0.1:8765/index.html';
let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};
(async()=>{const b=await chromium.launch();const errs=[];
// 390 px (iPhone) und 430 px (iPhone Pro Max): auf der breiteren Zeile passte "= Gleich" frueher noch daneben
for(const W of [390,430]){
const page=await (await b.newContext({viewport:{width:W,height:844}})).newPage();
page.on('pageerror',e=>errs.push(e.message));
await page.goto(PEACH_URL);
// 3 Tage (alter Plan), Tag B: e3 Glute Med, e5 Glute & Quad, e6 Ruecken, e8 Schultern
const d={pv__done:1,pv__p3cycle1:1,
 'p3cycle1__w11__d1__e3':{exercise:'3D Abduktor Maschine',extraSets:0,weight:'74',reps:['20','20']},
 'p3cycle1__w11__d1__e5':{exercise:'Split Squat Multipresse',extraSets:0,weight:'26',reps:['8','8']},
 'p3cycle1__w11__d1__e6':{exercise:'High Row Maschine',extraSets:0,weight:'17',reps:['12','12']},
 'p3cycle1__w11__d1__e8':{exercise:'Seithebemaschine (sitzend)',extraSets:0,weight:'16',reps:['10','10']},
 'p3cycle1__w12__d1__e3':{exercise:'3D Abduktor Maschine',extraSets:0,weight:'75',reps:['22','25']},
 'p3cycle1__w12__d1__e5':{exercise:'Split Squat Multipresse',extraSets:0,weight:'20',reps:['8','8']},
 'p3cycle1__w12__d1__e6':{exercise:'High Row Maschine',extraSets:0,weight:'17',reps:['12','12']}};
await page.evaluate(d=>{localStorage.clear();localStorage.setItem('peach_mig_add','1');localStorage.setItem('peach_v4',JSON.stringify(d));localStorage.setItem('peach_ui',JSON.stringify({view:'training',week:12,cy:'p3cycle1',pt:'p3',openDays:{1:true}}));},d);
await page.reload();await page.waitForTimeout(300);
const geo=ei=>page.evaluate(ei=>{const r=e=>e&&e.getBoundingClientRect();const pk=r(document.getElementById('pw-1-'+ei)),bd=r(document.querySelector('#pb-1-'+ei+' .pbadge')),dn=r(document.getElementById('done-1-'+ei));
  return{txt:(document.querySelector('#pb-1-'+ei+' .pbadge')||{}).textContent||'',below:!!bd&&bd.top>=pk.bottom-1,left:bd?Math.round(bd.left):-1,sameRow:!!bd&&!!dn&&Math.abs((bd.top+bd.bottom)/2-(dn.top+dn.bottom)/2)<3}},ei);
const lefts=[];
for(const [ei,want] of [[3,'Gewicht'],[5,'Weniger'],[6,'Gleich']]){
  const g=await geo(ei);lefts.push(g.left);
  ok(g.txt.includes(want)&&g.below&&g.sameRow,W+' px: "'+g.txt+'" steht in der 2. Zeile, ✓ daneben');
}
ok(lefts.every(x=>x===lefts[0]),W+' px: Alle Badges beginnen buendig links ('+lefts.join('/')+')');
// Zeile ohne Badge und ohne Haken: keine leere 2. Zeile
const empty=await page.evaluate(()=>{const s=document.querySelector('#pw-1-8').parentElement.querySelector('.ex-status');return s?s.getBoundingClientRect().height:-1});
ok(empty===0,W+' px: Ohne Badge/Haken keine leere Zeile (Hoehe '+empty+')');
// live: Haken erscheint -> Zeile erscheint
await page.evaluate(()=>{updW(1,8,'10')});for(const i of [0,1])await page.fill('#rp-1-8-'+i,'10');
const h=await page.evaluate(()=>{const s=document.querySelector('#pw-1-8').parentElement.querySelector('.ex-status');return s?s.getBoundingClientRect().height:-1});
ok(h>0,W+' px: Uebung fertig -> Status-Zeile mit ✓ erscheint live (Hoehe '+Math.round(h)+')');
ok(await page.evaluate(W=>document.documentElement.scrollWidth<=W,W),W+' px: Kein horizontaler Ueberlauf');
await page.context().close();
}
ok(errs.length===0,'keine JS-Fehler');console.log(fails?'FAILS '+fails:'ALL PASS');process.exitCode=fails?1:0;await b.close();})();
