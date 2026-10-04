// Mehr Glute Med (04.10.2026): 4 Tage mit zweiter Glute-Med-Zeile 2x8-12 in Tag A (ohne 3-Tage-Partner),
// 3 Tage mit 3 statt 2 Saetzen in Tag A und Tag B -> je 10 Glute-Med-Saetze pro Woche.
// Prueft Planstruktur, die einmalige Umrechnung trainierter 3-Tage-Wochen (migGMSets, s0/Zusatzsaetze),
// Schutz alter Zyklen und des 4-Tage-Plans, Backup-Import und die Vorbelegung im neuen Zyklus.
// Peach-App Browser-Test — Aufruf ueber tests/run.sh (startet den lokalen Server).
// Einzeln: PEACH_URL=http://127.0.0.1:8765/index.html node tests/glute-med.test.js
const { chromium } = (()=>{try{return require('playwright')}catch(e){return require('/opt/node22/lib/node_modules/playwright')}})();
const PEACH_URL=process.env.PEACH_URL||'http://127.0.0.1:8765/index.html';
let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};
(async()=>{const b=await chromium.launch();const page=await (await b.newContext({viewport:{width:390,height:844}})).newPage();
const errs=[];page.on('pageerror',e=>errs.push(e.message));
const fresh=async(data,ui)=>{await page.goto(PEACH_URL);await page.evaluate(([d,u])=>{localStorage.clear();localStorage.setItem('peach_mig_add','1');if(d)localStorage.setItem('peach_v4',JSON.stringify(d));if(u)localStorage.setItem('peach_ui',JSON.stringify(u));},[data,ui]);await page.reload();await page.waitForTimeout(250);};
const st=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('peach_v4')||'{}'));
const sorted=o=>JSON.stringify(Object.keys(o).sort().map(k=>[k,o[k]]));
const E=(ex,w,reps,x)=>({exercise:ex,extraSets:x||0,weight:String(w),reps});
const show=async(cy,w,di)=>{await page.evaluate(([cy,w,di])=>{setCycle(cy);setWeek(w);S.openDays={[di]:true};render()},[cy,w,di]);await page.waitForTimeout(60)};
const nSets=(di,ei)=>page.$$eval('[id^="rp-'+di+'-'+ei+'-"]',e=>e.length);
const done=(di,ei)=>page.$eval('#done-'+di+'-'+ei,e=>!e.classList.contains('hidden')).catch(()=>false);
const rows=async di=>{await page.evaluate(di=>{S.openDays={[di]:true};render()},di);await page.waitForTimeout(60);return page.$$eval('.day-body .ex-row',r=>r.map(x=>[x.querySelector('.cat-badge').textContent,x.querySelector('.pick-btn-txt').textContent,x.querySelector('.sets-info').textContent]))};

// 1. PLANSTRUKTUR
await fresh(null,null);
const P=await page.evaluate(()=>{
  const gm=pl=>pl.reduce((a,d)=>a+d.e.filter(x=>x.c==='Glute Med').reduce((s,x)=>s+x.s,0),0);
  const pos=(pl,di)=>pl[di].e.map((x,i)=>x.c==='Glute Med'?i+':'+x.s+'x'+x.r.join('-'):null).filter(Boolean).join(',');
  return {gm4:gm(P4),gm3:gm(P3),a4:pos(P4,0),a3:pos(P3,0),b3:pos(P3,1),c3:pos(P3,2),twinA3:TWIN4['0|3']||null,
    a4c:P4[0].e.map(x=>x.c).join('|')};
});
ok(P.a4==='2:2x8-12,3:2x8-12','4 Tage Tag A: zwei Glute-Med-Zeilen 2x8-12 direkt nacheinander ('+P.a4+')');
ok(P.a4c==='Glute Max|Glute Max|Glute Med|Glute Med|Glute & Quad|Glute & Hams|Adduktoren|Bauch','4 Tage Tag A: Reihenfolge Glute Max > Glute Med > Rest > Bauch');
ok(P.twinA3===null,'Neue Zeile hat keinen 3-Tage-Partner');
ok(P.a3==='2:3x8-12'&&P.b3==='2:3x8-12'&&P.c3==='1:2x8-12,2:2x8-12','3 Tage: Glute Med Tag A/B 3 Saetze, Tag C unveraendert 2+2');
ok(P.gm4===10&&P.gm3===10,'Glute Med pro Woche: 4 Tage '+P.gm4+', 3 Tage '+P.gm3);

// 2. UMRECHNUNG TRAINIERTER 3-TAGE-WOCHEN (2 -> 3 Saetze)
const d0={pv__done:1,pv__v3:1,pv__bb3:1,wt__cycle2__w1:'p3',wt__cycle2__w2:'p3',wt__cycle2__w3:'p3',wt__cycle2__w4:'p4',pv__p3cycle1:2,
  'p3cycle2__w1__d0__e2':E('Abduktionsmaschine',50,['12','12'],0),           // mit 2 Saetzen fertig
  'p3cycle2__w1__d1__e3':E('Kabel Abduktion Stehend',40,['15','15'],0),      // falsche Zeile (G&H) -> wird einsortiert
  'p3cycle2__w1__d2__e1':E('Abduktionsmaschine stehend',30,['12','12'],0),   // Tag C: bleibt 2 Saetze
  'p3cycle2__w2__d0__e2':E('Abduktionsmaschine',52,['12','12','10'],1),      // per "+" schon auf 3
  'p3cycle2__w2__d1__e2':E('3D Abduktor Maschine',60,['10','10','10','10'],2),// 2+2 = 4
  'p3cycle2__w3__d0__e2':{exercise:'Abduktionsmaschine',extraSets:1},          // vorbelegt mit "+", ohne Werte
  'cycle2__w4__d0__e2':E('Abduktionsmaschine',55,['12','12'],0),             // 4 Tage: unberuehrt
  'p3cycle1__w1__d0__e2':E('Abduktionsmaschine',45,['12','12'],0)};          // alter 3-Tage-Plan V2: unberuehrt
await fresh(d0,{view:'training',week:1,cy:'p3cycle2',pt:'p3',openDays:{0:true}});
let d=await st();
const g=k=>d[k]||{};
ok(d.pv__gm3===1,'Merker pv__gm3 gesetzt');
ok(g('p3cycle2__w1__d0__e2').s0===2&&g('p3cycle2__w1__d0__e2').extraSets===0,'W1 Tag A: behaelt 2 Saetze (s0=2)');
ok(g('p3cycle2__w1__d1__e2').exercise==='Kabel Abduktion Stehend'&&g('p3cycle2__w1__d1__e2').s0===2&&g('p3cycle2__w1__d1__e2').weight==='40','W1 Tag B: Eintrag aus falscher Zeile einsortiert und umgerechnet (s0=2)');
ok(!('s0' in g('p3cycle2__w1__d2__e1')),'Tag C unberuehrt');
ok(g('p3cycle2__w2__d0__e2').extraSets===0&&!('s0' in g('p3cycle2__w2__d0__e2')),'W2 Tag A: 2+1 -> 3 ohne Zusatzsatz');
ok(g('p3cycle2__w2__d1__e2').extraSets===1&&!('s0' in g('p3cycle2__w2__d1__e2')),'W2 Tag B: 2+2 -> 3+1');
ok(g('p3cycle2__w3__d0__e2').extraSets===0&&!('s0' in g('p3cycle2__w3__d0__e2')),'W3 (ohne Werte): 2+1 -> 3');
ok(sorted(g('cycle2__w4__d0__e2'))===sorted(d0['cycle2__w4__d0__e2'])&&sorted(g('p3cycle1__w1__d0__e2'))===sorted(d0['p3cycle1__w1__d0__e2']),'4-Tage-Woche und alter 3-Tage-Plan (Marker 2) unveraendert');
ok((await nSets(0,2))===2&&await done(0,2),'W1 Tag A: 2 Satzfelder, weiter erledigt (✓)');
await show('cycle2',1,1);ok((await nSets(1,2))===2&&await done(1,2),'W1 Tag B: 2 Satzfelder, erledigt');
await show('cycle2',2,0);ok((await nSets(0,2))===3&&await done(0,2),'W2 Tag A: 3 Satzfelder, erledigt');
await show('cycle2',2,1);ok((await nSets(1,2))===4&&await done(1,2),'W2 Tag B: 4 Satzfelder, erledigt');
await show('cycle2',3,0);ok((await nSets(0,2))===3,'W3 Tag A: 3 Satzfelder');
await show('cycle2',4,0);ok((await nSets(0,2))===2&&(await nSets(0,3))===2,'W4 (4 Tage): beide Glute-Med-Zeilen mit 2 Saetzen');
await show('cycle2',5,0);await page.click('#plan-p3');await page.waitForTimeout(80);
const r5=await rows(0); // Umschalter klappt offene Tage zu -> rows() oeffnet Tag A wieder
ok((await nSets(0,2))===3,'W5 (3 Tage, neu): Glute Med Tag A mit 3 Saetzen');ok(r5[2][1]==='Abduktionsmaschine'&&r5[2][2].startsWith('3 Sätze'),'W5: Uebung aus der 4-Tage-Vorwoche, "3 Sätze" ('+r5[2][2]+')');
d=await st();const snap=sorted(d);await page.reload();await page.waitForTimeout(250);
ok(sorted(await st())===snap,'Neustart aendert nichts mehr (Umrechnung nur einmal)');

// 3. BACKUP OHNE MERKER: Umrechnung beim Einspielen
await fresh({pv__done:1,pv__v3:1,pv__bb3:1,pv__gm3:1},{view:'overview',week:1,cy:'p3cycle3',pt:'p3',openDays:{}});
const bk={pv__done:1,pv__v3:1,pv__bb3:1,wt__cycle3__w1:'p3','p3cycle3__w1__d1__e2':E('Abduktionsmaschine',50,['12','12'],0)};
await page.fill('#bk-ta',JSON.stringify({app:'peach',v:1,date:'2026-10-03',data:bk}));await page.click('.bk-imp');await page.waitForTimeout(150);
d=await st();ok(d.pv__gm3===1&&g('p3cycle3__w1__d1__e2').s0===2,'Backup vom 03.10.: Glute Med Tag B behaelt 2 Saetze (s0=2)');
ok((await page.textContent('#bk-status')).includes('1 Einträge'),'Merker zaehlen nicht als Eintraege: '+(await page.textContent('#bk-status')));
await page.evaluate(()=>setView('training'));await show('cycle3',1,1);ok((await nSets(1,2))===2&&await done(1,2),'Nach Import ohne Neustart: 2 Satzfelder, erledigt');

// 4. NEUER ZYKLUS: Vorbelegung beider Glute-Med-Zeilen ohne Dopplung, 3-Tage-Woche ueber Partner
const z={pv__done:1,pv__v3:1,pv__bb3:1,pv__gm3:1,
  'cycle3__w12__d0__e2':E('Abduktionsmaschine',60,['12','12'],0),'cycle3__w12__d1__e1':E('Kabel Abduktion Stehend',20,['12','12'],0),
  'cycle3__w12__d2__e2':E('3D Abduktor Maschine',70,['12','12'],0),'cycle3__w12__d3__e1':E('Abduktionsmaschine stehend',40,['12','12'],0)};
await fresh(z,{view:'training',week:1,cy:'cycle4',pt:'p4',openDays:{0:true}});
let A=await rows(0);
ok(A[2][1]==='Abduktionsmaschine'&&A[3][0]==='Glute Med'&&A[3][1]!=='– Übung wählen –'&&A[3][1]!==A[2][1],'Z4 W1 (4 Tage): 1. Zeile wie bisher, 2. Zeile vorbelegt ohne Dopplung ('+A[3][1]+')');
await page.click('#plan-p3');await page.waitForTimeout(80);
A=await rows(0);const B=await rows(1);
ok(A[2][1]==='Abduktionsmaschine'&&A[2][2].startsWith('3 Sätze')&&B[2][1]==='3D Abduktor Maschine'&&B[2][2].startsWith('3 Sätze'),'Z4 W1 (3 Tage): Glute Med Tag A/B aus den Partnerzeilen, je 3 Saetze');
ok(await page.evaluate(()=>Object.keys(S.data).filter(k=>/^p3?cycle4__w/.test(k)).length===0),'Nur Ansehen speichert keine Eintraege');

ok(errs.length===0,'Keine JS-Fehler '+(errs.length?JSON.stringify(errs):''));
console.log(fails?'FAILS: '+fails:'ALL PASS');process.exitCode=fails?1:0;await b.close();})().catch(e=>{console.log('ABBRUCH',e.message);process.exit(1)});
