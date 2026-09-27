// 27.09.2026: 4-Tage Tag B bekam eine zweite Ruecken-Zeile (2x8-12) und eine zweite Schulter-Zeile
// (2x8-12); danach wurden Bizeps und Trizeps gestrichen. Wochen aus allen drei frueheren Aufteilungen
// (8er: vor beiden Ergaenzungen, 9er: nach dem Ruecken, 10er: mit Armen) muessen per Kategorie richtig
// einsortiert werden. Arm-Eintraege mit Werten bleiben gespeichert (unsichtbar hinter dem Plan),
// leere Arm-Platzhalter fallen weg.
const { chromium } = (()=>{try{return require('playwright')}catch(e){return require('/opt/node22/lib/node_modules/playwright')}})();
const PEACH_URL=process.env.PEACH_URL||'http://127.0.0.1:8765/index.html';
let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};
(async()=>{const b=await chromium.launch();const page=await (await b.newContext({viewport:{width:390,height:844}})).newPage();
const errs=[];page.on('pageerror',e=>errs.push(e.message));
await page.goto(PEACH_URL);
// Ziel-Layout Tag B: 0 GM, 1 GMed, 2 Ruecken, 3 Ruecken, 4 Schultern, 5 Schultern, 6 Brust, 7 Bauch
// Arme mit Werten -> geparkt auf 8 und 9 (nicht sichtbar)
const L8=['Kabel Kickback Schrägbank','Abduktionsmaschine','Latzug (breit)','KH Seitheben','Butterfly Maschine','SZ Curls','Pushdown Kabel','Panatta Super Crunch'];
const T8=[0,1,2,4,6,8,9,7];
const L9=['Kabel Kickback Schrägbank','Abduktionsmaschine','Latzug (breit)','Rudermaschine (Panatta)','KH Seitheben','Butterfly Maschine','SZ Curls','Pushdown Kabel','Panatta Super Crunch'];
const T9=[0,1,2,3,4,6,8,9,7];
const L10=['Kabel Kickback Schrägbank','Abduktionsmaschine','Latzug (breit)','Rudermaschine (Panatta)','KH Seitheben','Butterfly Reverse Maschine','Butterfly Maschine','SZ Curls','Pushdown Kabel','Panatta Super Crunch'];
const T10=[0,1,2,3,4,5,6,8,9,7];
const data={pv__done:1,pv__p3cycle1:1};
L8.forEach((ex,e)=>{data['cycle2__w1__d1__e'+e]={exercise:ex,extraSets:0,weight:String(20+e*5),reps:['10','10']}});
L9.forEach((ex,e)=>{data['cycle2__w2__d1__e'+e]={exercise:ex,extraSets:0,weight:String(50+e*5),reps:['10','10']}});
L10.forEach((ex,e)=>{data['cycle2__w3__d1__e'+e]={exercise:ex,extraSets:0,weight:String(80+e*5),reps:['10','10']}});
data['cycle2__w5__d1__e7']={exercise:'SZ Curls',extraSets:0,weight:'',reps:['','']};   // leerer Arm-Platzhalter
await page.evaluate(d=>{localStorage.clear();localStorage.setItem('peach_mig_add','1');localStorage.setItem('peach_v4',JSON.stringify(d));localStorage.setItem('peach_ui',JSON.stringify({view:'training',week:4,cy:'cycle2',pt:'p4',openDays:{1:true}}));},data);
await page.reload();await page.waitForTimeout(300);
const st=await page.evaluate(()=>JSON.parse(localStorage.getItem('peach_v4')));
const at=(w,e)=>st['cycle2__w'+w+'__d1__e'+e]||{};
const same=(w,L,T,base)=>L.every((ex,i)=>at(w,T[i]).exercise===ex&&at(w,T[i]).weight===String(base+i*5));
ok(same(1,L8,T8,20),'W1 (8er-Layout): alle Eintraege inkl. Gewicht richtig, Arme geparkt');
ok(!at(1,3).exercise&&!at(1,5).exercise,'W1: 2. Ruecken- und 2. Schulter-Zeile frei');
ok(same(2,L9,T9,50),'W2 (9er-Layout): alle Eintraege inkl. Gewicht richtig, Arme geparkt');
ok(!at(2,5).exercise,'W2: 2. Schulter-Zeile frei');
ok(same(3,L10,T10,80),'W3 (10er-Layout mit Armen): alle Eintraege inkl. Gewicht richtig, Arme geparkt');
ok(!st['cycle2__w5__d1__e7']&&!st['cycle2__w5__d1__e8'],'Leerer Arm-Platzhalter faellt weg');
const rows=await page.$$eval('.day-body .ex-row',rs=>rs.map(x=>[x.querySelector('.cat-badge').textContent,x.querySelector('.pick-btn-txt').textContent,x.querySelector('.sets-info').textContent]));
ok(rows.length===8&&rows[3][0]==='Rücken'&&rows[5][0]==='Schultern'&&rows[5][2].includes('8–12')&&rows[6][0]==='Brust'&&rows[7][0]==='Bauch','Tag B: 8 Uebungen, 2. Ruecken an 4., 2. Schulter an 6. Stelle, Bauch zuletzt');
ok(!rows.some(r=>r[0]==='Bizeps'||r[0]==='Trizeps'),'Tag B: keine Arm-Uebungen mehr');
ok(rows[3][1]==='Rudermaschine (Panatta)','W4: 2. Ruecken-Zeile uebernimmt Rudern ('+rows[3][1]+')');
ok(rows[5][1]==='Butterfly Reverse Maschine','W4: 2. Schulter-Zeile uebernimmt Reverse Butterfly ('+rows[5][1]+')');
ok(rows[7][1]==='Panatta Super Crunch','W4: Bauch vorbelegt ('+rows[7][1]+')');
const focus=await page.$$eval('.day-focus',fs=>fs.map(f=>f.textContent));
ok(focus.some(f=>f==='Rücken · Schultern'),'Fokuszeile Tag B: "Rücken · Schultern" ('+focus.join(' | ')+')');
const snap=JSON.stringify(st);await page.reload();await page.waitForTimeout(250);
ok(JSON.stringify(await page.evaluate(()=>JSON.parse(localStorage.getItem('peach_v4'))))===snap,'Zweiter Start aendert nichts (idempotent)');
ok(errs.length===0,'keine JS-Fehler');console.log(fails?'FAILS '+fails:'ALL PASS');process.exitCode=fails?1:0;await b.close();})();
