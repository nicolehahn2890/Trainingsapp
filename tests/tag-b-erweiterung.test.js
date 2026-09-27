// 27.09.2026: 4-Tage Tag B bekam eine zweite Ruecken-Zeile (2x8-12) und danach eine zweite
// Schulter-Zeile (2x8-12). Wochen, die in der 8er- (vor beiden) oder 9er-Aufteilung (nach dem
// Ruecken, vor der Schulter) eingetragen wurden, muessen per Kategorie richtig einsortiert werden.
const { chromium } = (()=>{try{return require('playwright')}catch(e){return require('/opt/node22/lib/node_modules/playwright')}})();
const PEACH_URL=process.env.PEACH_URL||'http://127.0.0.1:8765/index.html';
let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};
(async()=>{const b=await chromium.launch();const page=await (await b.newContext({viewport:{width:390,height:844}})).newPage();
const errs=[];page.on('pageerror',e=>errs.push(e.message));
await page.goto(PEACH_URL);
// Ziel-Layout Tag B: 0 GM, 1 GMed, 2 Ruecken, 3 Ruecken, 4 Schultern, 5 Schultern, 6 Brust, 7 Bizeps, 8 Trizeps, 9 Bauch
const L8=['Kabel Kickback Schrägbank','Abduktionsmaschine','Latzug (breit)','KH Seitheben','Butterfly Maschine','SZ Curls','Pushdown Kabel','Panatta Super Crunch'];
const T8=[0,1,2,4,6,7,8,9];                      // 8er-Layout -> Zielzeile
const L9=['Kabel Kickback Schrägbank','Abduktionsmaschine','Latzug (breit)','Rudermaschine (Panatta)','KH Seitheben','Butterfly Maschine','SZ Curls','Pushdown Kabel','Panatta Super Crunch'];
const T9=[0,1,2,3,4,6,7,8,9];                    // 9er-Layout -> Zielzeile
const data={pv__done:1,pv__p3cycle1:1,
  'p3cycle1__w12__d1__e5':{exercise:'Rudermaschine (Panatta)',extraSets:0,weight:'45',reps:['10','10']},
  'p3cycle1__w12__d0__e6':{exercise:'Butterfly Reverse Maschine',extraSets:0,weight:'30',reps:['12','12']}};
[1,2].forEach(w=>L8.forEach((ex,e)=>{data['cycle2__w'+w+'__d1__e'+e]={exercise:ex,extraSets:0,weight:String(20+e*5+w),reps:['10','10']}}));
L9.forEach((ex,e)=>{data['cycle2__w3__d1__e'+e]={exercise:ex,extraSets:0,weight:String(50+e*5),reps:['10','10']}});
await page.evaluate(d=>{localStorage.clear();localStorage.setItem('peach_mig_add','1');localStorage.setItem('peach_v4',JSON.stringify(d));localStorage.setItem('peach_ui',JSON.stringify({view:'training',week:4,cy:'cycle2',pt:'p4',openDays:{1:true}}));},data);
await page.reload();await page.waitForTimeout(300);
const st=await page.evaluate(()=>JSON.parse(localStorage.getItem('peach_v4')));
const at=(w,e)=>st['cycle2__w'+w+'__d1__e'+e]||{};
for(const w of [1,2]){
  ok(L8.every((ex,i)=>at(w,T8[i]).exercise===ex&&at(w,T8[i]).weight===String(20+i*5+w)),'W'+w+' (8er-Layout): alle Eintraege inkl. Gewicht in der richtigen Zeile');
  ok(!at(w,3).exercise&&!at(w,5).exercise,'W'+w+': neue Zeilen (2. Ruecken, 2. Schulter) frei');
}
ok(L9.every((ex,i)=>at(3,T9[i]).exercise===ex&&at(3,T9[i]).weight===String(50+i*5)),'W3 (9er-Layout): alle Eintraege inkl. Gewicht in der richtigen Zeile');
ok(!at(3,5).exercise,'W3: neue 2. Schulter-Zeile frei');
const rows=await page.$$eval('.day-body .ex-row',rs=>rs.map(x=>[x.querySelector('.cat-badge').textContent,x.querySelector('.pick-btn-txt').textContent,x.querySelector('.sets-info').textContent]));
ok(rows.length===10&&rows[3][0]==='Rücken'&&rows[5][0]==='Schultern'&&rows[5][2].includes('8–12')&&rows[9][0]==='Bauch','Tag B: 10 Uebungen, 2. Ruecken an 4., 2. Schulter an 6. Stelle, Bauch zuletzt');
ok(rows[3][1]==='Rudermaschine (Panatta)','W4: 2. Ruecken-Zeile uebernimmt Rudern aus W3 ('+rows[3][1]+')');
ok(rows[5][1]==='Butterfly Reverse Maschine','W4: 2. Schulter-Zeile vorbelegt, nicht doppelt ('+rows[5][1]+')');
const snap=JSON.stringify(st);await page.reload();await page.waitForTimeout(250);
ok(JSON.stringify(await page.evaluate(()=>JSON.parse(localStorage.getItem('peach_v4'))))===snap,'Zweiter Start aendert nichts (idempotent)');
ok(errs.length===0,'keine JS-Fehler');console.log(fails?'FAILS '+fails:'ALL PASS');process.exitCode=fails?1:0;await b.close();})();
