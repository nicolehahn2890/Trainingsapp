// Flexible Woche (02.10.2026): 3 oder 4 Tage pro WOCHE, 3-Tage-Plan V3 (60 Saetze) mit Partnerzeilen
// zum 4-Tage-Plan, Uebernahme der Uebungen in beide Richtungen, Vorwerte/Steigerung/Auto-Satz/Uebersicht
// ueber beide Wochenarten, Rueckfrage beim Umstellen einer Woche mit Werten, Schutz alter Zyklen
// (Marker 2 fuer den bisherigen 3-Tage-Plan, globaler Umschalter in Zyklen mit Plan-Marker).
// Peach-App Browser-Test — Aufruf ueber tests/run.sh (startet den lokalen Server).
// Einzeln: PEACH_URL=http://127.0.0.1:8765/index.html node tests/flex-woche.test.js
const { chromium } = (()=>{try{return require('playwright')}catch(e){return require('/opt/node22/lib/node_modules/playwright')}})();
const PEACH_URL=process.env.PEACH_URL||'http://127.0.0.1:8765/index.html';
let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};
(async()=>{const b=await chromium.launch();const page=await (await b.newContext({viewport:{width:390,height:844}})).newPage();
const errs=[];page.on('pageerror',e=>errs.push(e.message));
const fresh=async(data,ui)=>{await page.goto(PEACH_URL);await page.evaluate(([d,u])=>{localStorage.clear();localStorage.setItem('peach_mig_add','1');if(d)localStorage.setItem('peach_v4',JSON.stringify(d));if(u)localStorage.setItem('peach_ui',JSON.stringify(u));},[data,ui]);await page.reload();await page.waitForTimeout(250);};
const st=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('peach_v4')||'{}'));
const sheet=()=>page.isVisible('#sheet .sheet');
const active=()=>page.$eval('.plan-btn.active',e=>e.id);
const counts=()=>page.$$eval('.day-count',e=>e.map(x=>x.textContent.replace(/[^0-9/]/g,'')).join(','));
const rows=async di=>{await page.evaluate(di=>{S.openDays={[di]:true};render()},di);await page.waitForTimeout(60);return page.$$eval('.day-body .ex-row',r=>r.map(x=>x.querySelector('.pick-btn-txt').textContent))};

// 1. PLAN-STRUKTUR
await fresh(null,null);
const P=await page.evaluate(()=>{
  const sum=p=>p.map(d=>d.e.reduce((a,x)=>a+x.s,0));
  const cat={};P3.forEach(d=>d.e.forEach(x=>cat[x.c]=(cat[x.c]||0)+x.s));
  const twinOk=P3.every(d=>d.e.every(x=>{const t=x.t&&P4[x.t[0]]&&P4[x.t[0]].e[x.t[1]];return t&&t.c===x.c&&t.r[0]===x.r[0]&&t.r[1]===x.r[1]}));
  const upper=['Rücken','Schultern','Brust','Bizeps','Trizeps'],rank=c=>c==='Glute Max'?0:c==='Glute Med'?1:c==='Bauch'?4:upper.includes(c)?3:2;
  return {sets:sum(P3),rows:P3.map(d=>d.e.length),v2:sum(P3_V2),cat,twinOk,twins:Object.keys(TWIN4).length,
    order:P3.every(d=>d.e.every((x,i)=>i===0||rank(d.e[i-1].c)<=rank(x.c))),bauch:P3.every(d=>d.e[d.e.length-1].c==='Bauch'&&d.e[d.e.length-1].s===2),
    labels:P3.map(d=>d.l),gmaxB:P3[1].e.filter(x=>x.c==='Glute Max').length};
});
ok(P.sets.join()==='22,19,19'&&P.sets.reduce((a,x)=>a+x)===60,'3-Tage-Plan V3: 22/19/19 = 60 Saetze');
ok(P.rows.join()==='9,8,9','9/8/9 Uebungen');
ok(P.gmaxB===2,'Tag B: nur zwei Glute-Max-Zeilen');
ok(P.v2.join()==='18,19,19','Bisheriger Plan als P3_V2 erhalten (56 Saetze)');
const c=P.cat;ok(c['Glute Max']===13&&c['Glute Med']===8&&c['Glute & Quad']===5&&c['Glute & Hams']===7&&c['Adduktoren']===4&&c['Beinbeuger']===3&&c['Beinstrecker']===2&&c['Rücken']===5&&c['Schultern']===5&&c['Brust']===2&&c['Bauch']===6,'Wochenvolumen pro Kategorie wie vereinbart: '+JSON.stringify(c));
ok(P.twinOk&&P.twins===26,'Jede 3-Tage-Zeile hat eine Partnerzeile (gleiche Kategorie + Wdh.-Bereich), keine doppelt ('+P.twins+')');
ok(P.order&&P.bauch,'Reihenfolge Glute Max > Glute Med > Rest > Oberkoerper > Bauch (2 Saetze) zuletzt');

// 2. FLEXIBLE WOCHE
// 4-Tage-Woche 1 komplett, je Zeile eine eigene Uebung; Reps am oberen Ende (Steigerungs-Hinweis)
const M=[['Hip Thrusts Langhantel','Kabel Kickback Stehend','Abduktionsmaschine','Split Squat Kurzhantel','RDL Langhantel','Leg Curls sitzend (Precor)','Adduktionsmaschine','Panatta Super Crunch'],
 ['Kickback Maschine','Kabel Abduktion Stehend','Latzug (breit)','Rudermaschine (Panatta)','KH Seitheben','Butterfly Reverse Maschine','Brustpresse (Panatta)','Crunches am Kabelzug'],
 ['Hip Thrust Maschine','Glute Bridge Langhantel','3D Abduktor Maschine','Glute Hyperextensions','Leg Curls stehend','High Row Maschine','Seitheben Kabel','Pallof Press'],
 ['Hip Thrusts Multipresse','Abduktionsmaschine stehend','Reverse Lunge','RDL Kurzhanteln','Beinstrecker Maschine (Panatta)','Adduktion Kabel Stehend','Dead Bug']];
const base=await page.evaluate(M=>{const d={pv__done:1,pv__v3:1};P4.forEach((day,di)=>day.e.forEach((sl,ei)=>{d['cycle3__w1__d'+di+'__e'+ei]={exercise:M[di][ei],extraSets:0,weight:'50',reps:Array.from({length:sl.s},()=>String(sl.r[1]))}}));return d},M);
await fresh(base,{view:'training',week:2,cy:'cycle3',pt:'p4',openDays:{}});
ok((await active())==='plan-p4'&&(await counts())==='0/8,0/8,0/8,0/7','W2 startet wie die Vorwoche mit 4 Tagen');
await page.click('#plan-p3');await page.waitForTimeout(120);
let d=await st();
ok(!(await sheet())&&(await active())==='plan-p3'&&(await counts())==='0/9,0/8,0/9'&&d['wt__cycle3__w2']==='p3','Leere Woche -> 3 Tage ohne Rueckfrage, Wahl als wt__cycle3__w2 gespeichert');
const exp3=await page.evaluate(M=>P3.map(d=>d.e.map(x=>M[x.t[0]][x.t[1]])),M);
const got3=[await rows(0),await rows(1),await rows(2)];
ok(JSON.stringify(got3)===JSON.stringify(exp3),'3-Tage-Woche uebernimmt alle Uebungen der Partnerzeilen aus der 4-Tage-Woche');
console.log('  A:',got3[0].join(' | '));
await rows(0);
ok((await page.textContent('#ph-0-6')).includes('zuletzt: Z3 W1 · Tag B · 4-Tage'),'Vorwert Ruecken (3 Tage, Tag A) aus 4-Tage-Woche Tag B: '+(await page.textContent('#ph-0-6')).trim());
ok(await page.$eval('#ih-0-0',e=>!e.classList.contains('hidden')).catch(()=>false),'"Gewicht steigern" auch mit Vorwoche im anderen Plan');
ok(await page.evaluate(()=>!exState(0,0).p&&exState(0,0).hasPrev&&!exState(0,0).noCmp),'Vorwert aus dem anderen Plan wird verglichen (Badge erst mit Werten)');
// Werte in der 3-Tage-Woche
await page.fill('.day-body .w-input >> nth=0','55');await page.dispatchEvent('.day-body .w-input >> nth=0','change');
for(let i=0;i<3;i++){await page.fill('#rp-0-0-'+i,'8');await page.dispatchEvent('#rp-0-0-'+i,'input');}
await page.waitForTimeout(80);
d=await st();ok(d['p3cycle3__w2__d0__e0']&&d['p3cycle3__w2__d0__e0'].weight==='55'&&!d['cycle3__w2__d0__e0'],'Werte der 3-Tage-Woche unter p3cycle3 gespeichert');
ok((await page.textContent('#pb-0-0')).includes('Gewicht'),'Badge vergleicht mit der 4-Tage-Vorwoche (50 -> 55 = mehr Gewicht)');
// Wechsel "ab jetzt" (Ruecken) und "nur diese Woche" (Glute Med Tag C)
await page.click('#pw-0-6 .pick-btn');await page.click('.dropdown .drop-opt[data-val="Latzug Maschine (Panatta)"]');await page.waitForTimeout(80);
await page.click('#sheet .sheet-btn.pri');await page.waitForTimeout(80);
await rows(2);await page.click('#pw-2-2 .pick-btn');await page.click('.dropdown .drop-opt[data-val="Fire Hydrants Kabel"]');await page.waitForTimeout(80);
await page.click('#sheet .sheet-btn:not(.pri)');await page.waitForTimeout(80);
d=await st();ok(d['p3cycle3__w2__d0__e6'].exercise==='Latzug Maschine (Panatta)'&&d['p3cycle3__w2__d2__e2'].base==='Kabel Abduktion Stehend','Wechsel in der 3-Tage-Woche gespeichert (ab jetzt / nur diese Woche)');
// W3: Vorauswahl wie W2 (3 Tage)
await page.click('.week-arrow >> nth=1');await page.waitForTimeout(100);
ok((await active())==='plan-p3'&&(await counts())==='0/9,0/8,0/9','W3 startet wie die Vorwoche mit 3 Tagen');
let r=await rows(2);ok(r[2]==='Kabel Abduktion Stehend','W3: einmaliger Wechsel zurueckgenommen');
// W3 auf 4 Tage
await page.click('#plan-p4');await page.waitForTimeout(100);
ok(!(await sheet())&&(await counts())==='0/8,0/8,0/8,0/7','W3 auf 4 Tage umgestellt');
const A=await rows(0),B=await rows(1);
ok(B[2]==='Latzug Maschine (Panatta)','4-Tage-Woche uebernimmt "ab jetzt"-Wechsel aus der 3-Tage-Woche (Partnerzeile)');
ok(B[1]==='Kabel Abduktion Stehend','"Nur diese Woche" aus der 3-Tage-Woche wirkt nicht weiter');
ok(A[5]==='Leg Curls sitzend (Precor)'&&B[0]==='Kickback Maschine'&&B[3]==='Rudermaschine (Panatta)'&&B[5]==='Butterfly Reverse Maschine','Zeilen ohne Partner (Beinbeuger Tag A, Glute Max/Ruecken 2/Schultern 2 Tag B) aus der letzten 4-Tage-Woche');
await rows(0);ok((await page.textContent('#ph-0-0')).includes('zuletzt: Z3 W2 · Tag A · 3-Tage'),'Vorwert in der 4-Tage-Woche aus der 3-Tage-Woche davor');
// Zusatzsatz wandert mit
await page.evaluate(()=>{setWeek(2);S.openDays={0:true};render()});await page.click('button[onclick="addSet(0,0)"]');await page.waitForTimeout(60);
await page.evaluate(()=>{setWeek(3);S.openDays={0:true};render()});await page.waitForTimeout(60);
ok((await page.$$('#rp-0-0-3')).length===1,'Zusatzsatz aus der 3-Tage-Woche gilt in der 4-Tage-Woche danach');
// Navigation + Neustart
await page.evaluate(()=>setWeek(1));ok((await active())==='plan-p4','W1 zeigt 4 Tage (Eintraege)');
await page.evaluate(()=>setWeek(2));ok((await active())==='plan-p3','W2 zeigt 3 Tage');
await page.reload();await page.waitForTimeout(250);
ok((await active())==='plan-p3'&&await page.evaluate(()=>S.cy==='p3cycle3'&&S.week===2),'Nach Neustart: W2 weiter mit 3 Tagen');
await page.click('#week-label');await page.waitForTimeout(80);
let wk=await page.$$eval('#week-pick .wk-btn',e=>e.map(x=>x.className));
ok(wk[0].includes('has')&&wk[1].includes('cur')&&!wk[2].includes('has'),'Wochen-Auswahl markiert 3- und 4-Tage-Wochen mit Werten');
await page.keyboard.press('Escape');
// Umstellen einer Woche mit Werten: Rueckfrage
await page.click('#plan-p4');await page.waitForTimeout(100);
ok(await sheet()&&(await page.textContent('#sheet .sheet')).includes('Woche 2 auf 4 Tage'),'Woche mit Werten umstellen -> Rueckfrage');
await page.click('#sheet .sheet-cancel');await page.waitForTimeout(80);
ok((await active())==='plan-p3'&&(await st())['wt__cycle3__w2']==='p3','Abbrechen: bleibt bei 3 Tagen');
await page.click('#plan-p4');await page.click('#sheet .sheet-btn.pri');await page.waitForTimeout(100);
d=await st();ok((await active())==='plan-p4'&&d['wt__cycle3__w2']==='p4'&&d['p3cycle3__w2__d0__e0'].weight==='55','Umstellen: 4 Tage, Werte der 3-Tage-Woche bleiben gespeichert');
await page.click('#plan-p3');await page.waitForTimeout(100);
ok(!(await sheet())&&(await active())==='plan-p3','Zurueck auf 3 Tage ohne Rueckfrage (4-Tage-Woche ohne Werte)');
await rows(0);ok((await page.inputValue('.day-body .w-input >> nth=0'))==='55','Werte der 3-Tage-Woche wieder da');
// Uebersicht: 3- und 4-Tage-Wochen in einem Verlauf
await page.evaluate(()=>{setWeek(3);setView('overview')});await page.waitForTimeout(100);
ok((await page.textContent('.ov-ex >> nth=0')).includes('Start: 50 kg · Aktuell: 55 kg'),'Uebersicht (4 Tage) zeigt W2 aus der 3-Tage-Woche: '+(await page.textContent('.ov-ex >> nth=0')).replace(/\s+/g,' ').slice(0,90));
await page.evaluate(()=>setView('training'));
// Naechster Zyklus: Uebernahme aus der juengsten Woche, egal ob 3 oder 4 Tage
await page.evaluate(()=>{S.data['p3cycle3__w12__d1__e4']={exercise:'Nordic Curls',extraSets:0,weight:'0',reps:['6','6','6']};S.data['wt__cycle3__w12']='p3';save();setCycle('cycle4');setWeek(1)});
await page.evaluate(()=>setPlan('p4'));
const A4=await rows(0),C4=await rows(2);
ok(C4[4]==='Nordic Curls'&&A4[5]==='Leg Curls sitzend (Precor)','Z4 W1 (4 Tage): Beinbeuger Tag C aus 3-Tage-W12, Tag A (ohne Partner) aus der letzten 4-Tage-Woche');
ok((await rows(1))[2]==='Latzug Maschine (Panatta)','Z4 W1: "ab jetzt"-Wechsel aus der 3-Tage-Woche kommt im neuen Zyklus an');

// 3. AUTO-ZUSATZSATZ ueber gemischte Wochen (4/3/4/3 Tage, gleiche Leistung)
const mix={pv__done:1,pv__v3:1,wt__cycle4__w2:'p3',wt__cycle4__w4:'p3'};
[1,2,3,4].forEach(w=>{mix[(w%2?'':'p3')+'cycle4__w'+w+'__d0__e0']={exercise:'Hip Thrusts Langhantel',extraSets:0,weight:'100',reps:['6','6','6']}});
await fresh(mix,{view:'training',week:5,cy:'cycle4',pt:'p4',openDays:{0:true}});
ok((await active())==='plan-p3','W5 startet wie W4 mit 3 Tagen');
ok((await page.$$('#rp-0-0-3')).length===1&&(await page.textContent('.day-body .ex-row >> nth=0')).includes('+1 Satz'),'3 stagnierende Wochen ueber 3- und 4-Tage-Wochen -> Auto-Zusatzsatz in W5');

// 4. ALTE DATEN: bisheriger 3-Tage-Plan (V2) bleibt, alte Zyklen schalten global
const v2={pv__done:1,pv__cycle1:1,
 'p3cycle2__w1__d0__e4':{exercise:'Adduktionsmaschine',extraSets:0,weight:'60',reps:['12','12']},
 'p3cycle2__w1__d0__e5':{exercise:'Latzug (breit)',extraSets:0,weight:'40',reps:['10','10']},
 'p3cycle2__w1__d1__e4':{exercise:'Leg Curls stehend',extraSets:0,weight:'20',reps:['12','12','12']},
 'cycle1__w1__d0__e0':{exercise:'Hip Thrusts Langhantel',extraSets:0,weight:'90',reps:['8','8','8']}};
await fresh(v2,{view:'training',week:1,cy:'p3cycle2',pt:'p3',openDays:{0:true}});
d=await st();
const strip=o=>JSON.stringify(Object.keys(o).filter(k=>!k.startsWith('pv__')).sort().map(k=>[k,o[k]]));
ok(d.pv__p3cycle2===2&&d.pv__v3===1&&!d.pv__p3cycle3,'3-Tage-Zyklus mit V2-Werten bekommt Marker 2, leere Zyklen nicht');
ok(strip(d)===strip(v2),'V2-Daten unveraendert (keine Umsortierung)');
ok(await page.evaluate(()=>!!localStorage.getItem('peach_v4_pre_v3')),'Sicherheitskopie peach_v4_pre_v3');
r=await rows(0);ok(r.length===8&&r[4]==='Adduktionsmaschine'&&r[5]==='Latzug (breit)','Zyklus 2 (3 Tage) zeigt weiter den bisherigen Plan (8 Zeilen, Adduktoren an Platz 5)');
await page.click('#plan-p4');await page.waitForTimeout(80);
d=await st();ok(!d['wt__cycle2__w1']&&(await active())==='plan-p4','Zyklus mit Plan-Marker: Umschalter global wie bisher (kein Wochen-Marker)');
await page.click('#cycle-cycle3');await page.click('#plan-p3');await page.waitForTimeout(80);
ok((await counts())==='0/9,0/8,0/9','Leerer Zyklus 3: neuer 3-Tage-Plan');
await page.reload();await page.waitForTimeout(200);
const d2=await st();ok(strip(d2).length>0&&JSON.stringify(Object.keys(d2).filter(k=>k.startsWith('p3cycle2')).map(k=>d2[k]))===JSON.stringify(Object.keys(v2).filter(k=>k.startsWith('p3cycle2')).map(k=>v2[k])),'Neustart: V2-Daten weiter unveraendert (idempotent)');
// Backup ohne pv__v3 wird beim Einspielen markiert
await page.click('#btn-overview');await page.waitForTimeout(100);
const old={...v2};await page.fill('#bk-ta',JSON.stringify({app:'peach',v:1,date:'2026-09-30',data:old}));
page.once('dialog',x=>x.accept());await page.click('.bk-imp');await page.waitForTimeout(150);
d=await st();ok(d.pv__p3cycle2===2&&d.pv__v3===1,'Backup vom alten Stand: 3-Tage-Zyklus beim Einspielen markiert');
ok((await page.textContent('#bk-status')).includes('4 Einträge'),'Marker zaehlen nicht als Eintraege: '+(await page.textContent('#bk-status')));

// 4b. Tag B aus der kurzen Fassung mit drei Glute-Max-Zeilen (02.10.2026, Version -01): Eintraege
// rutschen per Kategorie an ihre Zeile, die gestrichene dritte Glute-Max-Zeile wird geparkt (Werte bleiben)
const old9=['Hip Thrust Maschine','Glute Bridge Langhantel','Kickback Maschine','3D Abduktor Maschine','Glute Hyperextensions','Leg Curls stehend','High Row Maschine','Brustpresse (Panatta)','Pallof Press'];
const b9={pv__done:1,pv__v3:1,wt__cycle3__w1:'p3'};
old9.forEach((ex,i)=>{b9['p3cycle3__w1__d1__e'+i]={exercise:ex,extraSets:0,weight:String(30+i),reps:['10','10']}});
await fresh(b9,{view:'training',week:1,cy:'p3cycle3',pt:'p3',openDays:{1:true}});
d=await st();
const rowsB=await page.$$eval('.day-body .ex-row',r=>r.map(x=>x.querySelector('.pick-btn-txt').textContent));
ok(JSON.stringify(rowsB)===JSON.stringify(old9.filter((x,i)=>i!==2)),'Tag B zeigt die 8 Zeilen in richtiger Reihenfolge: '+rowsB.join(' | '));
const parked=Object.keys(d).filter(k=>/^p3cycle3__w1__d1__e(\d+)$/.test(k)&&+k.split('__e')[1]>=8).map(k=>d[k]);
ok(parked.length===1&&parked[0].exercise==='Kickback Maschine'&&parked[0].weight==='32','Gestrichene Zeile (Kickback Maschine) geparkt, Werte erhalten');
ok(Object.keys(d).filter(k=>k.startsWith('p3cycle3__w1__d1__')).length===9,'Kein Eintrag verloren (9 von 9)');

// 5. Tempo: 5 volle Zyklen, gemischte Wochen
const big=await page.evaluate(()=>{const d={pv__done:1,pv__v3:1};for(let c=1;c<=5;c++)for(let w=1;w<=12;w++){const p3=(w%3===0);if(p3)d['wt__cycle'+c+'__w'+w]='p3';const pl=p3?P3:P4;pl.forEach((day,di)=>day.e.forEach((sl,ei)=>{d[(p3?'p3':'')+'cycle'+c+'__w'+w+'__d'+di+'__e'+ei]={exercise:EXERCISES[sl.c][ei%EXERCISES[sl.c].length],extraSets:0,weight:String(40+w),reps:Array.from({length:sl.s},()=>'10')}}))}return d});
await fresh(big,{view:'training',week:12,cy:'cycle6',pt:'p4',openDays:{0:true}});
// ohne Zwischenspeicher (wie direkt nach einer Eingabe: save() leert die Caches)
const ms=await page.evaluate(()=>{const t=performance.now();for(let i=0;i<5;i++){_exIdx=null;_carry={};_wk={};S.cy='cycle5';S.week=11;syncPt();S.openDays={0:true};render()}return (performance.now()-t)/5});
ok(ms<250,'Render mit 5 vollen Zyklen (Cache leer): '+Math.round(ms)+' ms');

ok(errs.length===0,'Keine JS-Fehler '+(errs.length?JSON.stringify(errs):''));
console.log(fails?'FAILS: '+fails:'ALL PASS');process.exitCode=fails?1:0;await b.close();})().catch(e=>{console.log('ABBRUCH',e.message);process.exit(1)});
