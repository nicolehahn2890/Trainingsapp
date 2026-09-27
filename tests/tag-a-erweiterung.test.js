// 27.09.2026: 4-Tage Tag A bekommt eine Glute-&-Hams-Zeile (nach Glute & Quad). Bereits eingetragene
// Wochen in der alten 7er-Aufteilung muessen per Kategorie richtig einsortiert werden — ohne Verlust.
const { chromium } = (()=>{try{return require('playwright')}catch(e){return require('/opt/node22/lib/node_modules/playwright')}})();
const PEACH_URL=process.env.PEACH_URL||'http://127.0.0.1:8765/index.html';
let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};
(async()=>{const b=await chromium.launch();const page=await (await b.newContext({viewport:{width:390,height:844}})).newPage();
const errs=[];page.on('pageerror',e=>errs.push(e.message));
await page.goto(PEACH_URL);
const old=['Hip Thrusts Langhantel','Kabel Kickback Schrägbank','Abduktionsmaschine','Split Squat Kurzhantel','Leg Curls sitzend','Adduktionsmaschine','Panatta Super Crunch'];
const data={pv__done:1,pv__p3cycle1:1,
  'p3cycle1__w12__d1__e0':{exercise:'RDL Langhantel',extraSets:0,weight:'90',reps:['8','8']}, // Historie fuer Vorbelegung
  'cycle2__w1__d1__e6':{exercise:'',extraSets:0,weight:'10',reps:['12']}};                     // Werte ohne Uebung
for(let w=1;w<=2;w++)old.forEach((ex,e)=>{data['cycle2__w'+w+'__d0__e'+e]={exercise:ex,extraSets:0,weight:String(100+e*10+w),reps:['8','8']}});
await page.evaluate(d=>{localStorage.clear();localStorage.setItem('peach_mig_add','1');localStorage.setItem('peach_v4',JSON.stringify(d));localStorage.setItem('peach_ui',JSON.stringify({view:'training',week:2,cy:'cycle2',pt:'p4',openDays:{0:true}}));},data);
await page.reload();await page.waitForTimeout(300);
let st=await page.evaluate(()=>JSON.parse(localStorage.getItem('peach_v4')));
const at=(w,e)=>st['cycle2__w'+w+'__d0__e'+e]||{};
for(const w of [1,2]){
  ok(!at(w,4).exercise,'W'+w+': neue Glute-&-Hams-Zeile (e4) ist frei');
  ok(at(w,5).exercise==='Leg Curls sitzend'&&at(w,5).weight===String(140+w),'W'+w+': Leg Curls (inkl. Gewicht) in der Beinbeuger-Zeile');
  ok(at(w,6).exercise==='Adduktionsmaschine'&&at(w,6).weight===String(150+w),'W'+w+': Adduktion in der Adduktoren-Zeile');
  ok(at(w,7).exercise==='Panatta Super Crunch'&&at(w,7).weight===String(160+w),'W'+w+': Bauch als letzte Zeile');
  ok([0,1,2,3].every(e=>at(w,e).exercise===old[e]),'W'+w+': Zeilen davor unveraendert');
}
ok(st['cycle2__w1__d1__e6']&&st['cycle2__w1__d1__e6'].weight==='10','Eintrag mit Werten, aber ohne Uebung bleibt erhalten');
const rows=await page.$$eval('.day-body .ex-row',rs=>rs.map(x=>[x.querySelector('.cat-badge').textContent,x.querySelector('.pick-btn-txt').textContent]));
ok(rows.length===8&&rows[4][0]==='Glute & Hams'&&rows[7][0]==='Bauch','Tag A zeigt 8 Uebungen, Glute & Hams an 5. Stelle, Bauch zuletzt');
ok(rows[4][1]==='RDL Langhantel','Neue Zeile ist mit deiner letzten Hueftbeuge-Uebung vorbelegt ('+rows[4][1]+')');
const h=await page.textContent('#ph-0-5');ok(h.includes('Z2 W1 · Tag A'),'Beinbeuger Woche 2: Vorwert aus Woche 1 ('+h.trim()+')');
const snap=JSON.stringify(st);await page.reload();await page.waitForTimeout(250);
ok(JSON.stringify(await page.evaluate(()=>JSON.parse(localStorage.getItem('peach_v4'))))===snap,'Zweiter Start aendert nichts (idempotent)');
ok(await page.evaluate(()=>!!localStorage.getItem('peach_v4_pre_fix_last')),'Sicherheitskopie vor der Umsortierung vorhanden');
ok(errs.length===0,'keine JS-Fehler');console.log(fails?'FAILS '+fails:'ALL PASS');process.exitCode=fails?1:0;await b.close();})();
