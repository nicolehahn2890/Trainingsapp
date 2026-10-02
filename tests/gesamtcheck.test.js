// GESAMTCHECK (02.10.2026): realistischer Verlauf von Anfang bis heute und ein kompletter neuer Zyklus.
// Alt: 4 Tage Z1 W1-3 (Plan V1), 3 Tage Z1 W1-12 (Plan V1), 4 Tage Z2 W1 (Plan V2, Tag A noch MIT
// Beinbeuger). Dann Update auf den heutigen Stand und Zyklus 3 mit gemischten 3/4-Tage-Wochen,
// Uebungswechseln, Woche 12, Uebergang in Zyklus 4, Backup-Rundreise, Layout und Konsistenz-Audit.
// Peach-App Browser-Test — Aufruf ueber tests/run.sh (startet den lokalen Server).
// Einzeln: PEACH_URL=http://127.0.0.1:8765/index.html node tests/gesamtcheck.test.js
const { chromium } = (()=>{try{return require('playwright')}catch(e){return require('/opt/node22/lib/node_modules/playwright')}})();
const PEACH_URL=process.env.PEACH_URL||'http://127.0.0.1:8765/index.html';
let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:844}});const page=await ctx.newPage();
const errs=[];page.on('pageerror',e=>errs.push(e.message));
await page.goto(PEACH_URL);
const st=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('peach_v4')||'{}'));
const sheet=()=>page.isVisible('#sheet .sheet');
const active=()=>page.$eval('.plan-btn.active',e=>e.id);
const counts=()=>page.$$eval('.day-count',e=>e.map(x=>x.textContent.replace(/[^0-9/]/g,'')).join(','));
const rows=async di=>{await page.evaluate(di=>{S.openDays={[di]:true};render()},di);await page.waitForTimeout(40);return page.$$eval('.day-body .ex-row',r=>r.map(x=>[x.querySelector('.cat-badge').textContent,x.querySelector('.pick-btn-txt').textContent]))};
const noScroll=()=>page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth);

// ---------- 1. KONSISTENZ-AUDIT ----------
const A=await page.evaluate(()=>{
  const r={},all=[];for(const c in EXERCISES)for(const e of EXERCISES[c])all.push(e);
  r.n=all.length;r.dup=all.filter((e,i)=>all.indexOf(e)!==i);
  r.noTip=all.filter(e=>!TIPS[e]);r.recBad=[...REC].filter(e=>!all.includes(e));r.assistBad=[...ASSIST].filter(e=>!all.includes(e));
  const plans={P4,P3,P3_V2,P4_V1,P3_V1};r.catBad=[];r.rrBad=[];
  for(const k in plans)plans[k].forEach(d=>d.e.forEach(x=>{if(!EXERCISES[x.c]||!CC[x.c])r.catBad.push(k+':'+x.c);const rr=x.r.join('-');if(!['4-8','6-10','8-12'].includes(rr))r.rrBad.push(k+':'+rr);if(!(x.s>=2&&x.s<=3))r.rrBad.push(k+':s'+x.s)}));
  r.twinBad=[];P3.forEach((d,di)=>d.e.forEach((x,ei)=>{const t=x.t&&P4[x.t[0]]&&P4[x.t[0]].e[x.t[1]];if(!t||t.c!==x.c||t.r.join()!==x.r.join())r.twinBad.push(di+'|'+ei)}));
  r.twinUnique=new Set(P3.flatMap(d=>d.e.map(x=>x.t.join('|')))).size===P3.reduce((a,d)=>a+d.e.length,0);
  const upper=['Rücken','Schultern','Brust','Bizeps','Trizeps'],rank=c=>c==='Glute Max'?0:c==='Glute Med'?1:c==='Bauch'?4:upper.includes(c)?3:2;
  r.order=[P4,P3].every(p=>p.every(d=>d.e.every((x,i)=>i===0||rank(d.e[i-1].c)<=rank(x.c))&&d.e[d.e.length-1].c==='Bauch'&&d.e[d.e.length-1].s===2));
  r.gmaxPerDay=[P4,P3].map(p=>p.map(d=>d.e.filter(x=>x.c==='Glute Max').length).join('')).join('/');
  r.bb=[P4,P3].map(p=>p.flatMap(d=>d.e.filter(x=>x.c==='Beinbeuger').map(x=>x.s)).join('+')).join('/');
  r.build=/^\d{4}-\d{2}-\d{2}-\d{2}$/.test(BUILD_ID);
  return r;
});
ok(A.dup.length===0&&A.noTip.length===0&&A.recBad.length===0&&A.assistBad.length===0,'Audit: '+A.n+' Uebungen, keine Duplikate, alle mit Tipp, REC/ASSIST gueltig');
ok(A.catBad.length===0&&A.rrBad.length===0,'Audit: alle Plan-Kategorien mit Farbe/Uebungen, Wdh.-Bereiche 4-8/6-10/8-12, 2-3 Saetze '+JSON.stringify(A.catBad.concat(A.rrBad)));
ok(A.twinBad.length===0&&A.twinUnique,'Audit: Partnerzeilen gueltig und eindeutig');
ok(A.order,'Audit: Reihenfolge-Regel + Bauch 2 Saetze zuletzt (4 und 3 Tage)');
ok(A.gmaxPerDay==='2121/221','Audit: hoechstens 2 Glute-Max-Zeilen pro Tag ('+A.gmaxPerDay+')');
ok(A.bb==='3/3','Audit: Beinbeuger genau 1x pro Woche mit 3 Saetzen ('+A.bb+')');
ok(A.build,'Audit: BUILD_ID-Format JJJJ-MM-TT-NN');

// ---------- 2. ALTER STAND VOR DEM UPDATE ----------
const OLD_A8=['Hip Thrusts Langhantel','Kabel Kickback Liegend','Abduktionsmaschine','Split Squat Kurzhantel','RDL Langhantel','Leg Curls stehend','Adduktionsmaschine','Panatta Super Crunch'];
const old=await page.evaluate(A8=>{
  const d={pv__done:1,pv__cycle1:1,pv__p3cycle1:1,'tip__ex__Hip Thrusts Langhantel':'Fuesse weiter','set__ex__Abduktionsmaschine':'Sitz 3'};
  const pick=(c,i)=>EXERCISES[c][i%EXERCISES[c].length];
  const fill=(cy,pl,w1,w2)=>pl.forEach((day,di)=>{const cnt={};day.e.forEach((sl,ei)=>{const i=cnt[sl.c]=(cnt[sl.c]||0);cnt[sl.c]++;
    for(let w=w1;w<=w2;w++)d[cy+'__w'+w+'__d'+di+'__e'+ei]={exercise:pick(sl.c,i),extraSets:0,weight:String(30+w+ei),reps:Array.from({length:sl.s},()=>String(sl.r[1]-1))}})});
  fill('cycle1',P4_V1,1,3);fill('p3cycle1',P3_V1,1,12);
  // Z2 W1 im 4-Tage-Plan V2: Tag A noch in der 8er-Fassung (mit Beinbeuger), B-D wie heute
  A8.forEach((ex,ei)=>{d['cycle2__w1__d0__e'+ei]={exercise:ex,extraSets:0,weight:String(60+ei),reps:['8','8','8'].slice(0,ei===0||ei===3?3:2)}});
  const M={1:['Kickback Maschine','Kabel Abduktion Stehend','Latzug (breit)','Rudermaschine (Panatta)','KH Seitheben','Butterfly Reverse Maschine','Brustpresse (Panatta)','Crunches am Kabelzug'],
           2:['Hip Thrust Maschine','Glute Bridge Langhantel','3D Abduktor Maschine','Glute Hyperextensions','Leg Curls sitzend (Precor)','High Row Maschine','Seitheben Kabel','Pallof Press'],
           3:['Hip Thrusts Multipresse','Abduktionsmaschine stehend','Reverse Lunge','RDL Kurzhanteln','Beinstrecker Maschine (Panatta)','Adduktion Kabel Stehend','Dead Bug']};
  for(const di in M)M[di].forEach((ex,ei)=>{const sl=P4[di].e[ei];d['cycle2__w1__d'+di+'__e'+ei]={exercise:ex,extraSets:0,weight:String(40+ei),reps:Array.from({length:sl.s},()=>String(sl.r[1]))}});
  return d;
},OLD_A8);
const valCount=o=>Object.keys(o).filter(k=>/__w\d+__d\d+__e\d+$/.test(k)&&o[k]&&(o[k].weight||(o[k].reps||[]).some(Boolean))).length;
await page.evaluate(d=>{localStorage.clear();localStorage.setItem('peach_mig_add','1');localStorage.setItem('peach_v4',JSON.stringify(d));localStorage.setItem('peach_ui',JSON.stringify({view:'training',week:1,cy:'cycle2',pt:'p4',openDays:{}}));},old);
await page.reload();await page.waitForTimeout(350);
let d=await st();
ok(d.pv__v3===1&&!d.pv__p3cycle2&&!d.pv__cycle2,'Update: Markierung gelaufen, Zyklus 2 bleibt flexibel (kein Plan-Marker)');
ok(valCount(d)===valCount(old),'Update: keine Werte verloren ('+valCount(d)+' Eintraege mit Werten)');
const sameKeys=pre=>Object.keys(old).filter(k=>k.startsWith(pre)).every(k=>JSON.stringify(old[k])===JSON.stringify(d[k]));
ok(sameKeys('cycle1__')&&sameKeys('p3cycle1__')&&sameKeys('tip__')&&sameKeys('set__'),'Update: alte Zyklen, Notiz und Einstellung byte-gleich');
ok(d['cycle2__w1__d0__e4'].exercise==='RDL Langhantel'&&d['cycle2__w1__d0__e5'].exercise==='Adduktionsmaschine'&&d['cycle2__w1__d0__e6'].exercise==='Panatta Super Crunch','Update: Z2 W1 Tag A eingeordnet (Adduktion/Bauch eine Zeile nach vorn)');
ok(Object.keys(d).some(k=>/^cycle2__w1__d0__e([7-9]|\d\d)$/.test(k)&&d[k].exercise==='Leg Curls stehend'),'Update: Leg Curls aus Tag A geparkt (Werte gespeichert)');
ok((await counts())==='7/7,8/8,8/8,7/7','Z2 W1: alle Tage vollstaendig ('+(await counts())+')');
// Alte Zyklen: globaler Umschalter, alte Plaene, kein Wochen-Marker
await page.click('#cycle-cycle1');await page.waitForTimeout(60);
let t=await page.$$eval('.day-title',e=>e.map(x=>x.textContent).join('|'));ok(t.startsWith('Tag A – Beine'),'Z1 4 Tage: alter Plan');
await page.click('#plan-p3');await page.waitForTimeout(60);
t=await page.$$eval('.day-title',e=>e.map(x=>x.textContent).join('|'));
ok(t==='Tag A – Ganzkörper|Tag B – Ganzkörper|Tag C – Ganzkörper'&&!Object.keys(await st()).some(k=>k.startsWith('wt__cycle1')),'Z1 3 Tage: alter Plan, kein Wochen-Marker in altem Zyklus');
await page.click('#plan-p4');

// ---------- 3. ALLE ANSICHTEN RENDERN ----------
const R=await page.evaluate(()=>{const bad=[];let n=0;const keep=[S.pt,S.cy,S.week,S.view];
  for(const pt of ['p4','p3'])for(let c=1;c<=6;c++)for(let w=1;w<=12;w++)for(const v of ['training','overview']){
    S.pt=pt;S.cy=(pt==='p3'?'p3':'')+'cycle'+c;S.week=w;S.view=v;S.openDays={0:true,1:true,2:true,3:true};
    try{render();n++;const h=document.getElementById('view-'+v).innerHTML;if(/undefined|NaN|\[object/.test(h))bad.push(pt+c+'W'+w+v+':text')}catch(e){bad.push(pt+c+'W'+w+v+':'+e.message)}}
  [S.pt,S.cy,S.week,S.view]=keep;S.openDays={};render();return{n,bad}});
ok(R.bad.length===0,'Alle '+R.n+' Ansichten (2 Plaene x 6 Zyklen x 12 Wochen x 2, alle Tage offen) ohne Fehler/undefined/NaN '+R.bad.slice(0,3).join(' '));

// ---------- 4. NEUER ZYKLUS 3 MIT GEMISCHTEN WOCHEN ----------
await page.click('#cycle-cycle3');await page.evaluate(()=>setWeek(1));await page.waitForTimeout(60);
ok((await active())==='plan-p4'&&(await counts())==='0/7,0/8,0/8,0/7','Z3 W1: neuer Zyklus startet mit 4 Tagen (wie zuletzt angezeigt)');
let C=await rows(2);ok(C[4][0]==='Beinbeuger'&&C[4][1]==='Leg Curls sitzend (Precor)','Z3 W1: Beinbeuger Tag C aus Z2 uebernommen');
let Aw=await rows(0);ok(Aw.length===7&&Aw[4][1]==='RDL Langhantel'&&Aw[5][1]==='Adduktionsmaschine','Z3 W1: Tag A uebernimmt RDL/Adduktion');
// Woche 1 auf 3 Tage
await page.click('#plan-p3');await page.waitForTimeout(60);
ok(!(await sheet())&&(await counts())==='0/9,0/8,0/9','Z3 W1 -> 3 Tage (9/8/9)');
const B3=await rows(1);ok(B3[4][0]==='Beinbeuger'&&B3[4][1]==='Leg Curls sitzend (Precor)'&&B3.filter(r=>r[0]==='Glute Max').length===2,'3-Tage Tag B: Beinbeuger aus 4-Tage Tag C, 2x Glute Max');
const A3=await rows(0);ok(A3[6][1]==='Latzug (breit)'&&A3[7][1]==='KH Seitheben','3-Tage Tag A: Ruecken/Schultern aus 4-Tage Tag B');
ok((await page.textContent('#ph-0-0')).includes('zuletzt: Z2 W1 · Tag A · 4-Tage'),'Z3 W1 (3 Tage): Vorwert zur Orientierung aus Z2 W1 4-Tage');
ok((await page.$$('#pb-0-0 .pbadge')).length===0&&(await page.$$('#wp-box:not(.hidden)')).length===0,'Woche 1: kein Badge, kein Wochenbalken');
// Werte W1 (3 Tage) per Oberflaeche in Tag A Zeile 1
await page.fill('.day-body .w-input >> nth=0','62');await page.dispatchEvent('.day-body .w-input >> nth=0','change');
for(let i=0;i<3;i++){await page.fill('#rp-0-0-'+i,'8');await page.dispatchEvent('#rp-0-0-'+i,'input');}
// Rest der Woche 1 (3 Tage) und Wochen 2-11 gemischt per Daten
await page.evaluate(()=>{
  const fillWeek=(w,pt,base)=>{const pl=pt==='p3'?P3:P4,cy=(pt==='p3'?'p3':'')+'cycle3';S.data['wt__cycle3__w'+w]=pt;
    pl.forEach((day,di)=>day.e.forEach((sl,ei)=>{const k=cy+'__w'+w+'__d'+di+'__e'+ei;if(S.data[k]&&S.data[k].reps)return;S.week=w;S.pt=pt;S.cy=cy;
      const ex=inhEx(di,ei)||EXERCISES[sl.c][0];S.data[k]={exercise:ex,extraSets:0,weight:String(base+w),reps:Array.from({length:sl.s},()=>String(sl.r[1]))};save()}))};
  fillWeek(1,'p3',60);for(let w=2;w<=11;w++)fillWeek(w,w%3===0?'p3':'p4',60);
  S.week=1;syncPt();render();
});
// Woche 2 (4 Tage): Vergleich mit der 3-Tage-Woche 1
await page.evaluate(()=>setWeek(2));await page.waitForTimeout(60);
ok((await active())==='plan-p4','W2 als 4-Tage-Woche erkannt');
await rows(0);
ok((await page.textContent('#ph-0-0')).includes('Z3 W1 · Tag A · 3-Tage')&&(await page.textContent('#pb-0-0')).includes('Gleich'),'W2: Badge vergleicht mit 3-Tage-W1 (62 kg x 8 gegen 62 kg x 8 = '+(await page.textContent('#pb-0-0')).trim()+')');
await page.fill('.day-body .w-input >> nth=0','64');await page.dispatchEvent('.day-body .w-input >> nth=0','change');
ok((await page.textContent('#pb-0-0')).includes('Gewicht'),'W2: mehr Gewicht als in der 3-Tage-W1 -> "↑ Gewicht" live');
ok(!(await page.$eval('#wp-box',e=>e.classList.contains('hidden'))),'W2: Wochenbalken sichtbar');
// Woche 3 (3 Tage), Uebungswechsel nur diese Woche
await page.evaluate(()=>setWeek(3));await page.waitForTimeout(60);
ok((await active())==='plan-p3','W3 als 3-Tage-Woche erkannt');
await rows(0);const w3ex=await page.textContent('#pw-0-0 .pick-btn-txt');
await page.click('#pw-0-0 .pick-btn');await page.click('.dropdown .drop-opt[data-val="Hip Thrust Maschine"]');await page.waitForTimeout(60);
ok(await sheet(),'W3: Uebungswechsel fragt');await page.click('#sheet .sheet-btn:not(.pri)');await page.waitForTimeout(60);
ok((await page.$$('.once-chip')).length===1,'W3: Label "nur diese Woche"');
await page.evaluate(()=>setWeek(4));await page.waitForTimeout(60);await rows(0);
ok((await page.textContent('#pw-0-0 .pick-btn-txt'))===w3ex,'W4 (4 Tage) wieder mit Standard-Uebung '+w3ex);
// Wochen-Auswahl
await page.click('#week-label');await page.waitForTimeout(60);
const wk=await page.$$eval('#week-pick .wk-btn',e=>e.map(x=>x.className.includes('has')||x.className.includes('cur')));
ok(wk.slice(0,11).every(Boolean)&&!wk[11],'Wochen-Auswahl: W1-11 mit Eintraegen (3 und 4 Tage), W12 leer');
await page.keyboard.press('Escape');
// Uebersicht: Verlauf ueber beide Wochenarten
await page.evaluate(()=>{setWeek(11);setView('overview')});await page.waitForTimeout(80);
const ov=await page.textContent('.ov-ex >> nth=0');
ok(/Start: \d+ kg · Aktuell: 71 kg/.test(ov),'Uebersicht: Verlauf bis W11 inkl. 3-Tage-Wochen ('+ov.replace(/\s+/g,' ').match(/Start.*kg/)+')');
ok(await noScroll(),'Uebersicht 390 px ohne horizontales Scrollen');
await page.evaluate(()=>setView('training'));
// Woche 12: Banner, Vorauswahl
await page.evaluate(()=>setWeek(12));await page.waitForTimeout(60);
ok((await active())==='plan-p4','W12 startet wie W11 (4 Tage)');
const ban=await page.textContent('#view-training');
ok(ban.includes('Letzte Woche von Zyklus 3')&&ban.includes('Danach geht es mit Zyklus 4 weiter.'),'W12: Zyklus-Ende-Banner');
// Zyklus 4: Uebernahme aus der juengsten Woche (W11 = 4 Tage, W9 = 3 Tage)
await page.click('#cycle-cycle4');await page.evaluate(()=>setWeek(1));await page.waitForTimeout(60);
const z4=await rows(2);ok(z4.every(r=>r[1]!=='– Übung wählen –'),'Z4 W1: alle Zeilen vorbelegt');
await page.click('#plan-p3');await page.waitForTimeout(60);
const z43=[...(await rows(0)),...(await rows(1)),...(await rows(2))];ok(z43.every(r=>r[1]!=='– Übung wählen –'),'Z4 W1 (3 Tage): alle 26 Zeilen vorbelegt');
await page.click('#plan-p4');await page.waitForTimeout(40);

// ---------- 5. LAYOUT ----------
for(const wd of [390,430]){
  await page.setViewportSize({width:wd,height:844});
  await page.evaluate(()=>{setCycle('cycle3');setWeek(3);S.openDays={0:true};render()});await page.waitForTimeout(60);
  ok(await noScroll(),wd+' px: Training (3-Tage-Woche, Tag offen) ohne horizontales Scrollen');
  await page.click('#pw-0-1 .pick-btn');await page.click('.dropdown .drop-opt:not(.drop-empty-opt):not(.sel) >> nth=0');await page.waitForTimeout(60);
  ok(await sheet()&&await noScroll(),wd+' px: Abfrage-Fenster ohne horizontales Scrollen');
  const box=await page.$eval('#sheet .sheet',e=>{const r=e.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.bottom<=innerHeight});
  ok(box,wd+' px: Abfrage-Fenster komplett sichtbar');
  await page.click('#sheet .sheet-cancel');
}
await page.setViewportSize({width:390,height:844});

// ---------- 6. BACKUP-RUNDREISE ----------
const before=await st();
await page.evaluate(()=>setView('overview'));await page.evaluate(()=>{try{Object.defineProperty(navigator,'clipboard',{value:undefined,configurable:true})}catch(e){}});
await page.click('.bk-btn >> text=Backup kopieren');await page.waitForTimeout(60);
const bk=await page.inputValue('#bk-ta');
await page.evaluate(()=>{localStorage.removeItem('peach_v4');localStorage.removeItem('peach_ui')});await page.reload();await page.waitForTimeout(250);
await page.evaluate(()=>setView('overview'));await page.fill('#bk-ta',bk);await page.click('.bk-imp');await page.waitForTimeout(120);
const after=await st();
ok(JSON.stringify(Object.keys(after).sort().map(k=>[k,after[k]]))===JSON.stringify(Object.keys(before).sort().map(k=>[k,before[k]])),'Backup: Export -> leeres Geraet -> Import ergibt identische Daten (inkl. Wochen-Marker)');
await page.evaluate(()=>{setView('training');setCycle('cycle3');setWeek(9)});await page.waitForTimeout(60);
ok((await active())==='plan-p3','Nach Import: Z3 W9 wieder als 3-Tage-Woche');
const snap=JSON.stringify(after);await page.reload();await page.waitForTimeout(250);
const re=await st();const diff=Object.keys({...after,...re}).filter(k=>JSON.stringify(after[k])!==JSON.stringify(re[k]));
if(diff.length)console.log('  DIFF:',JSON.stringify(diff.slice(0,10).map(k=>[k,after[k],re[k]])));
const norm=o=>JSON.stringify(Object.keys(o).sort().map(k=>[k,o[k]]));
ok(diff.length===0&&norm(re)===norm(after),'Neustart nach allem: Inhalt unveraendert (Reihenfolge darf repairSlots sortieren)');

ok(errs.length===0,'Keine JS-Fehler im gesamten Lauf'+(errs.length?': '+errs.join(' | '):''));
console.log(fails?'FAILS: '+fails:'ALL PASS');process.exitCode=fails?1:0;await b.close();})().catch(e=>{console.log('ABBRUCH',e.message);process.exit(1)});
