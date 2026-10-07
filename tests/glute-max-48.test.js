// Glute Max 4-8 statt 8-12 (Wunsch 07.10.2026): 4 Tage Tag D und 3 Tage Tag C (Partnerzeilen).
// Bereits trainierte 8-12-Wochen behalten ihren Bereich (r0='8-12', migGXRange), neue Wochen laufen mit 4-8.
// Peach-App Browser-Test — Aufruf ueber tests/run.sh (startet den lokalen Server).
// Einzeln: PEACH_URL=http://127.0.0.1:8765/index.html node tests/<datei>
const { chromium } = (()=>{try{return require('playwright')}catch(e){return require('/opt/node22/lib/node_modules/playwright')}})();
const PEACH_URL=process.env.PEACH_URL||'http://127.0.0.1:8765/index.html';
let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};
(async()=>{const b=await chromium.launch();const page=await (await b.newContext({viewport:{width:390,height:844}})).newPage();
const errs=[];page.on('pageerror',e=>{errs.push(e.message);console.log('  JSERR',e.stack.split('\n').slice(0,4).join(' | '))});
const fresh=async(data,ui)=>{await page.goto(PEACH_URL);await page.evaluate(([d,u])=>{localStorage.clear();localStorage.setItem('peach_mig_add','1');if(d!==null)localStorage.setItem('peach_v4',JSON.stringify(d));if(u)localStorage.setItem('peach_ui',JSON.stringify(u));},[data,ui]);await page.reload();await page.waitForTimeout(250);};
const st=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('peach_v4')||'{}'));
const sorted=d=>JSON.stringify(Object.keys(d).sort().map(k=>[k,d[k]]));
const E=(ex,w,reps)=>({exercise:ex,extraSets:0,weight:String(w),reps});
const HT='Hip Thrusts Langhantel';
const show=(cy,w,pt,day)=>page.evaluate(([cy,w,pt,day])=>{S.cy=cy;S.week=w;S.pt=pt;S.openDays={[day]:true};render()},[cy,w,pt,day]);
const meta=(di,ei)=>page.$eval('#pw-'+di+'-'+ei,e=>e.closest('.ex-row').querySelector('.sets-info').textContent);
const vor=(di,ei)=>page.evaluate(([di,ei])=>{const s=exState(di,ei);return{w:s.prv.weight||'',src:s.srcL,orient:!!s.prv._orient,rr:(s.prv._src||{}).rr||'',r:s.ex.r.join('-'),p:s.p,inc:incDue(s)}},[di,ei]);

// 1. PLAENE
await page.goto(PEACH_URL);
const pl=await page.evaluate(()=>({d:P4[3].e[0],c:P3[2].e[0],fs:[...P4,...P3,...P3_V2].map(x=>x.f||'')}));
ok(pl.d.c==='Glute Max'&&pl.d.s===3&&pl.d.r.join('-')==='4-8','4 Tage Tag D: Glute Max 3x4-8');
ok(pl.c.c==='Glute Max'&&pl.c.s===3&&pl.c.r.join('-')==='4-8'&&pl.c.t.join()==='3,0','3 Tage Tag C: Glute Max 3x4-8, Partner 4-Tage Tag D');
// Fokus-Zeilen unter den Tagesnamen ohne Wdh.-Bereiche (Wunsch 07.10.2026)
ok(pl.fs.every(f=>f&&!/Wdh|\d/.test(f)),'Fokus-Zeilen ohne Wdh.-Bereiche: '+pl.fs.join(' | '));

// 2. UMRECHNUNG: Nicoles Zyklus 2 — W1 4 Tage, W2 3 Tage (Tag D/Tag C mit 8-12 trainiert), W3 4 Tage leer.
// Alter Zyklus 1 (Marker) bleibt unberuehrt.
const data={pv__done:1,pv__v3:1,pv__bb3:1,pv__gm3:1,pv__cycle1:1,wt__cycle2__w2:'p3',
  'cycle1__w12__d3__e0':E(HT,118,['12','12','12']),
  'cycle2__w1__d0__e0':E(HT,140,['8','8','8']),'cycle2__w1__d3__e0':E(HT,115,['12','11','10']),
  'p3cycle2__w2__d0__e0':E(HT,142,['8','8','7']),'p3cycle2__w2__d2__e0':E(HT,117,['12','12','11']),
  'cycle2__w3__d3__e0':{exercise:HT,extraSets:0}};
await fresh(data,{view:'training',week:3,cy:'cycle2',pt:'p4',openDays:{3:true}});
let d=await st();
ok(d.pv__gx48===1,'Merker pv__gx48 gesetzt');
ok(d['cycle2__w1__d3__e0'].r0==='8-12'&&d['p3cycle2__w2__d2__e0'].r0==='8-12','Trainierte Wochen (4 Tage Tag D, 3 Tage Tag C) behalten 8-12 (r0)');
ok(!d['cycle2__w3__d3__e0'].r0,'Leere Woche ohne r0 -> laeuft mit 4-8');
ok(!d['cycle2__w1__d0__e0'].r0&&!d['p3cycle2__w2__d0__e0'].r0,'Tag A unberuehrt');
ok(!d['cycle1__w12__d3__e0'].r0&&d['cycle1__w12__d3__e0'].weight==='118','Alter Zyklus (Marker) unberuehrt');
ok(d['cycle2__w1__d3__e0'].weight==='115'&&d['cycle2__w1__d3__e0'].reps.join()==='12,11,10','Werte unveraendert');
const snap=sorted(d);await page.reload();await page.waitForTimeout(250);
ok(sorted(await st())===snap,'Neustart aendert nichts mehr (Umrechnung nur einmal)');

// Anzeige: keine Zahlen in den Fokus-Zeilen der Tage
const foc=await page.$$eval('.day-focus',e=>e.map(x=>x.textContent));
ok(foc.length===4&&foc.every(f=>!/Wdh|\d/.test(f)),'Tages-Kopf zeigt keine Wdh.-Bereiche: '+foc.join(' | '));

// 3. ANZEIGE + VORWERT
let v=await vor(3,0);console.log('  W3 Tag D:',v.r,v.w,v.src,v.orient?'(Orientierung '+v.rr+')':'');
ok(v.r==='4-8'&&(await meta(3,0)).includes('4–8 Reps'),'W3 Tag D zeigt "4–8 Reps"');
ok(v.w==='142'&&!v.orient&&v.src.startsWith('Z2 W2 · Tag A · 3-Tage'),'W3 Tag D 4-8: Vorwert aus dem 4-8-Satz (Z2 W2 Tag A, 142), nicht die 8-12-Werte von Tag D');
await show('cycle2',1,'p4',3);
v=await vor(3,0);ok(v.r==='8-12'&&(await meta(3,0)).includes('8–12 Reps'),'W1 Tag D (schon trainiert) zeigt weiter "8–12 Reps"');
await show('p3cycle2',2,'p3',2);
v=await vor(2,0);console.log('  W2 (3 Tage) Tag C:',v.r,v.w,v.src);
ok(v.r==='8-12'&&v.w==='115'&&!v.orient&&v.src.startsWith('Z2 W1 · Tag D'),'W2 3 Tage Tag C (8-12 trainiert): Vergleich gegen W1 Tag D im gleichen Bereich (115)');
ok(v.p==='w','W2 Tag C: 117 gegen 115 kg im gleichen Bereich -> "Gewicht gesteigert" (Badge '+v.p+')');
// Rep-Farbe: 8 Reps sind in 4-8 das obere Ende (gruen), in 8-12 das untere Ende
await show('cycle2',3,'p4',3);
await page.fill('#rp-3-0-0','8');await page.$eval('#rp-3-0-0',e=>e.blur()); // Feld verlassen wie in der App (change)
const col=await page.evaluate(()=>{const n=c=>{const x=document.createElement('div');x.style.background=c;return x.style.background};
  return{inp:document.getElementById('rp-3-0-0').style.background,c48:n(rcol('8',[4,8])),c812:n(rcol('8',[8,12]))}});
ok(col.c48!==col.c812&&col.inp===col.c48,'W3 Tag D: Rep-Feld nach 4-8 eingefaerbt (8 = oberes Ende)');
d=await st();ok(!d['cycle2__w3__d3__e0'].r0,'Neuer Eintrag in W3 ohne r0');

// 4. 3-TAGE-WOCHE NEU: Tag C mit 4-8, Vorwert aus W3 Tag D (Partnerzeile, gleicher Bereich)
await page.evaluate(()=>{const k='cycle2__w3__d3__e0';S.data[k]={...S.data[k],weight:'130',reps:['8','7','6']};S.data.wt__cycle2__w4='p3';save()});
await show('p3cycle2',4,'p3',2);
v=await vor(2,0);console.log('  W4 (3 Tage) Tag C:',v.r,v.w,v.src);
ok(v.r==='4-8'&&v.w==='130'&&v.src.startsWith('Z2 W3 · Tag D · 4-Tage'),'W4 3 Tage Tag C 4-8: Vorwert aus W3 Tag D (130)');

// 4b. UEBERSICHT: 8-12-Wochen grau und nicht eingerechnet (kein "+15 kg" durch den Bereichswechsel)
await page.evaluate(()=>{S.cy='cycle2';S.pt='p4';S.week=3;setView('overview')});await page.waitForTimeout(80);
const ov=await page.$$eval('.ov-day',ds=>{const d=ds[3].querySelector('.ov-ex');return{txt:d.textContent,grey:[...d.querySelectorAll('.ov-bar-fill')].map(f=>f.style.background)}});
console.log('  Uebersicht Tag D:',ov.txt.replace(/\s+/g,' ').slice(0,160));
ok(!/\+\d/.test(ov.txt)&&ov.txt.includes('Start: 130 kg')&&ov.txt.includes('Davor: 8–12 Wdh.'),'Uebersicht Tag D: kein kg-Zugewinn ueber den Bereichswechsel, Hinweis "Davor: 8–12 Wdh."');
ok(ov.grey[0].includes('text-ghost')&&ov.grey[1].includes('text-ghost')&&!ov.grey[2].includes('text-ghost'),'Uebersicht Tag D: W1/W2 (8-12) grau, W3 (4-8) farbig');
await page.evaluate(()=>setView('training'));

// 5. BACKUP OHNE MERKER: Umrechnung beim Einspielen
await fresh({pv__done:1,pv__v3:1,pv__bb3:1,pv__gm3:1,pv__gx48:1},{view:'overview',week:1,cy:'cycle3',pt:'p4',openDays:{}});
const bk={pv__done:1,pv__v3:1,pv__bb3:1,pv__gm3:1,'cycle3__w1__d3__e0':E(HT,110,['12','12','12'])};
await page.fill('#bk-ta',JSON.stringify({app:'peach',v:1,date:'2026-10-06',data:bk}));
page.once('dialog',dl=>dl.accept());
await page.click('.bk-imp');await page.waitForTimeout(200);
d=await st();ok(d.pv__gx48===1&&d['cycle3__w1__d3__e0'].r0==='8-12','Backup vom 06.10.: Tag D behaelt 8-12 (r0)');

ok(errs.length===0,'keine JS-Fehler'+(errs.length?': '+errs.join(' | '):''));console.log(fails?'FAILS '+fails:'ALL PASS');process.exitCode=fails?1:0;await b.close();})();
