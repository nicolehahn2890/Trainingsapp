// Randfaelle aus der Code-Pruefung vom 02.10.2026 (Version -04):
// 1. Vorwert im gleichen Rep-Bereich aus der anderen Wochenart desselben flexiblen Zyklus
// 2. Uebernahme in neuen Zyklus: Quell-Nummer mit altem 3-Tage-Plan (Marker 2) -> juengste Auswahl gewinnt
// 3. Backup von vor heute einspielen: Zeilen sofort richtig (ohne Neustart), Eingaben im richtigen Eintrag
// 4. Beinbeuger Tag C 2 -> 3 Saetze: trainierte Wochen behalten ihre Satzzahl, "+"-Satz wird umgerechnet
// 5. Unlesbare Daten: Umschalter 3/4 Tage ueberschreibt peach_v4 nicht
// Peach-App Browser-Test — Aufruf ueber tests/run.sh (startet den lokalen Server).
// Einzeln: PEACH_URL=http://127.0.0.1:8765/index.html node tests/randfaelle.test.js
const { chromium } = (()=>{try{return require('playwright')}catch(e){return require('/opt/node22/lib/node_modules/playwright')}})();
const PEACH_URL=process.env.PEACH_URL||'http://127.0.0.1:8765/index.html';
let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};
(async()=>{const b=await chromium.launch();const page=await (await b.newContext({viewport:{width:390,height:844}})).newPage();
const errs=[];page.on('pageerror',e=>errs.push(e.message));
const fresh=async(data,ui)=>{await page.goto(PEACH_URL);await page.evaluate(([d,u])=>{localStorage.clear();localStorage.setItem('peach_mig_add','1');if(d!==null)localStorage.setItem('peach_v4',typeof d==='string'?d:JSON.stringify(d));if(u)localStorage.setItem('peach_ui',JSON.stringify(u));},[data,ui]);await page.reload();await page.waitForTimeout(250);};
const st=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('peach_v4')||'{}'));
const E=(ex,w,reps,x)=>({exercise:ex,extraSets:x||0,weight:String(w),reps});
const HT='Hip Thrusts Langhantel';

// 1. Vorwert gleicher Bereich aus der 3-Tage-Woche
await fresh({pv__done:1,pv__v3:1,pv__bb3:1,wt__cycle3__w2:'p3',
  'cycle3__w1__d0__e0':E(HT,140,['8','8','8']),'cycle3__w1__d3__e0':E(HT,120,['12','12','12']),
  'p3cycle3__w2__d0__e0':E(HT,145,['8','8','8']),'p3cycle3__w2__d2__e0':E(HT,125,['12','12','12']),
  'cycle3__w3__d0__e0':E(HT,150,['8','7','7'])},{view:'training',week:3,cy:'cycle3',pt:'p4',openDays:{3:true}});
const h1=(await page.textContent('#ph-3-0')).trim();
ok(h1.includes('zuletzt: Z3 W2 · Tag C · 3-Tage')&&!h1.includes('4–8'),'W3 Tag D (8-12): Vorwert aus 3-Tage-W2 im gleichen Bereich ('+h1+')');
ok((await page.$eval('#pw-3-0',e=>e.closest('.ex-row').textContent)).includes('(zuletzt 125)'),'Gewichtshinweis 125 (nicht 150 aus dem 4-8-Satz)');
ok(await page.$eval('#ih-3-0',e=>!e.classList.contains('hidden')).catch(()=>false),'"Gewicht steigern" (12 von 8-12 im 1. Satz)');
ok(await page.evaluate(()=>!exState(3,0).noCmp),'Vergleich aktiv (kein reiner Orientierungswert)');

// 2. Quell-Nummer mit altem 3-Tage-Plan (Marker 2): juengste Auswahl gewinnt
const d2={pv__done:1,pv__v3:1,pv__bb3:1,pv__p3cycle2:2};
for(let w=1;w<=6;w++)d2['cycle2__w'+w+'__d0__e0']=E(HT,100+w,['8','8','8']);
for(let w=7;w<=12;w++)d2['p3cycle2__w'+w+'__d0__e0']=E('Hip Thrust Maschine',100+w,['8','8','8']);
await fresh(d2,{view:'training',week:1,cy:'cycle3',pt:'p4',openDays:{0:true}});
ok((await page.textContent('#pw-0-0 .pick-btn-txt'))==='Hip Thrust Maschine','Z3 W1: Uebernahme der juengsten Auswahl (3-Tage-W12), nicht der aelteren 4-Tage-Wahl');

// 3. Backup von vor heute (Tag A in der 8er-Fassung, ohne pv__v3/pv__bb3)
const A8=[HT,'Kabel Kickback Liegend','Abduktionsmaschine','Split Squat Kurzhantel','RDL Langhantel','Leg Curls stehend','Adduktionsmaschine','Panatta Super Crunch'];
const bk={pv__done:1};A8.forEach((ex,i)=>{bk['cycle2__w3__d0__e'+i]=E(ex,50+i,['10','10'])});
await fresh({pv__done:1,pv__v3:1,pv__bb3:1},{view:'overview',week:4,cy:'cycle2',pt:'p4',openDays:{}});
await page.fill('#bk-ta',JSON.stringify({app:'peach',v:1,date:'2026-10-01',data:bk}));await page.click('.bk-imp');await page.waitForTimeout(150);
await page.evaluate(()=>{setView('training');setWeek(3);S.openDays={0:true};render()});await page.waitForTimeout(60);
let r=await page.$$eval('.day-body .ex-row',x=>x.map(e=>[e.querySelector('.cat-badge').textContent,e.querySelector('.pick-btn-txt').textContent]));
ok(r[6][1]==='Adduktionsmaschine'&&r[7][1]==='Panatta Super Crunch'&&r.length===8,'Import ohne Neustart: Tag A sofort richtig eingeordnet');
await page.evaluate(()=>{setWeek(4);S.openDays={0:true};render()});await page.waitForTimeout(60);
r=await page.$$eval('.day-body .ex-row',x=>x.map(e=>e.querySelector('.pick-btn-txt').textContent));
ok(r[6]==='Adduktionsmaschine'&&r[7]==='Panatta Super Crunch','W4 erbt die richtigen Uebungen');
await page.fill('.ex-row:has(#pw-0-6) .w-input','50');await page.dispatchEvent('.ex-row:has(#pw-0-6) .w-input','change');
let d=await st();ok(d['cycle2__w4__d0__e6']&&d['cycle2__w4__d0__e6'].exercise==='Adduktionsmaschine'&&d['cycle2__w4__d0__e6'].weight==='50','Eingabe landet im Adduktoren-Eintrag');
ok(Object.keys(d).some(k=>/^cycle2__w3__d0__e([8-9])$/.test(k)&&d[k].exercise==='Leg Curls stehend'),'Leg Curls aus dem Backup geparkt (gespeichert)');
const snap=JSON.stringify(Object.keys(d).sort().map(k=>[k,d[k]]));await page.reload();await page.waitForTimeout(250);
d=await st();ok(JSON.stringify(Object.keys(d).sort().map(k=>[k,d[k]]))===snap,'Neustart nach Import aendert nichts mehr');

// 4. Beinbeuger Tag C: 2 -> 3 Saetze
const LC='Leg Curls sitzend (Precor)';
await fresh({pv__done:1,pv__v3:1,
  'cycle2__w1__d2__e4':E(LC,40,['12','12'],0),           // mit 2 Saetzen fertig trainiert
  'cycle2__w2__d2__e4':E(LC,42,['10','10','10'],1),      // per "+" auf 3 Saetze
  'cycle2__w3__d2__e4':{exercise:LC,extraSets:0},         // vorbelegt, noch nicht trainiert
  'p3cycle5__w1__d1__e4':E(LC,30,['12','12','12'],0)},     // 3-Tage-Plan: unberuehrt
  {view:'training',week:1,cy:'cycle2',pt:'p4',openDays:{2:true}});
d=await st();
ok(d.pv__bb3===1&&d['cycle2__w1__d2__e4'].s0===2&&d['cycle2__w1__d2__e4'].extraSets===0,'W1: behaelt 2 Saetze (s0=2)');
ok(d['cycle2__w2__d2__e4'].extraSets===0&&!('s0' in d['cycle2__w2__d2__e4']),'W2: 2+1 Zusatzsatz -> 3 ohne Zusatzsatz');
ok(!('s0' in d['cycle2__w3__d2__e4'])&&d['cycle2__w3__d2__e4'].extraSets===0,'W3 (ohne Werte): neue Satzzahl 3');
ok(!('s0' in d['p3cycle5__w1__d1__e4']),'3-Tage-Plan unberuehrt');
const sets=async()=>(await page.$$('[id^="rp-2-4-"]')).length;
ok((await sets())===2&&!(await page.$eval('#done-2-4',e=>e.classList.contains('hidden'))),'W1 Tag C: 2 Satzfelder, weiter erledigt (✓)');
await page.evaluate(()=>{setWeek(2);S.openDays={2:true};render()});ok((await sets())===3&&!(await page.$eval('#done-2-4',e=>e.classList.contains('hidden'))),'W2: 3 Satzfelder, erledigt');
await page.evaluate(()=>{setWeek(3);S.openDays={2:true};render()});ok((await sets())===3,'W3: 3 Satzfelder');
await page.evaluate(()=>{setWeek(4);S.openDays={2:true};render()});ok((await sets())===3,'W4 (neu): 3 Satzfelder');
const snap4=JSON.stringify(await st());await page.reload();await page.waitForTimeout(200);
const st4=await st(),sn4=JSON.parse(snap4);const df4=Object.keys({...st4,...sn4}).filter(k=>JSON.stringify(st4[k])!==JSON.stringify(sn4[k]));if(df4.length)console.log('  DIFF',JSON.stringify(df4.map(k=>[k,sn4[k],st4[k]])));
ok(df4.length===0,'Umrechnung nur einmal (pv__bb3)');

// 5. Unlesbare Daten + Umschalter
await fresh('{"cycle3__w1__d0__e0":{"exercise":"Hip Thr',{view:'training',week:2,cy:'cycle3',pt:'p4',openDays:{}});
await page.click('#plan-p3');await page.waitForTimeout(80);
ok((await page.evaluate(()=>localStorage.getItem('peach_v4'))).includes('Hip Thr'),'Unlesbare Daten: Umschalter ueberschreibt peach_v4 nicht');
ok(await page.$eval('.plan-btn.active',e=>e.id)==='plan-p3','Umschalter funktioniert trotzdem (nur im Speicher)');

ok(errs.length===0,'Keine JS-Fehler '+(errs.length?JSON.stringify(errs):''));
console.log(fails?'FAILS: '+fails:'ALL PASS');process.exitCode=fails?1:0;await b.close();})().catch(e=>{console.log('ABBRUCH',e.message);process.exit(1)});
