// 27.09.2026: 4-Tage Tag B bekommt eine zweite Ruecken-Zeile (2x8-12, nach Ruecken 3x6-10). Bereits
// eingetragene Wochen in der alten 8er-Aufteilung muessen per Kategorie richtig einsortiert werden.
const { chromium } = (()=>{try{return require('playwright')}catch(e){return require('/opt/node22/lib/node_modules/playwright')}})();
const PEACH_URL=process.env.PEACH_URL||'http://127.0.0.1:8765/index.html';
let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};
(async()=>{const b=await chromium.launch();const page=await (await b.newContext({viewport:{width:390,height:844}})).newPage();
const errs=[];page.on('pageerror',e=>errs.push(e.message));
await page.goto(PEACH_URL);
const old=['Kabel Kickback Schrägbank','Abduktionsmaschine','Latzug (breit)','KH Seitheben','Butterfly Maschine','SZ Curls','Pushdown Kabel','Panatta Super Crunch'];
const data={pv__done:1,pv__p3cycle1:1,
  'p3cycle1__w12__d1__e5':{exercise:'Rudermaschine (Panatta)',extraSets:0,weight:'45',reps:['10','10']}}; // Historie fuer Vorbelegung
for(let w=1;w<=2;w++)old.forEach((ex,e)=>{data['cycle2__w'+w+'__d1__e'+e]={exercise:ex,extraSets:0,weight:String(20+e*5+w),reps:['10','10']}});
await page.evaluate(d=>{localStorage.clear();localStorage.setItem('peach_mig_add','1');localStorage.setItem('peach_v4',JSON.stringify(d));localStorage.setItem('peach_ui',JSON.stringify({view:'training',week:2,cy:'cycle2',pt:'p4',openDays:{1:true}}));},data);
await page.reload();await page.waitForTimeout(300);
const st=await page.evaluate(()=>JSON.parse(localStorage.getItem('peach_v4')));
const at=(w,e)=>st['cycle2__w'+w+'__d1__e'+e]||{};
for(const w of [1,2]){
  ok([0,1,2].every(e=>at(w,e).exercise===old[e]),'W'+w+': Glute Max, Glute Med, Ruecken 1 unveraendert');
  ok(!at(w,3).exercise,'W'+w+': neue Ruecken-Zeile (e3) ist frei');
  ok([3,4,5,6,7].every(i=>at(w,i+1).exercise===old[i]&&at(w,i+1).weight===String(20+i*5+w)),'W'+w+': Schultern, Brust, Bizeps, Trizeps, Bauch inkl. Gewicht eine Zeile weiter');
}
const rows=await page.$$eval('.day-body .ex-row',rs=>rs.map(x=>[x.querySelector('.cat-badge').textContent,x.querySelector('.pick-btn-txt').textContent,x.querySelector('.sets-info').textContent]));
ok(rows.length===9&&rows[3][0]==='Rücken'&&rows[3][2].includes('8–12')&&rows[8][0]==='Bauch','Tag B zeigt 9 Uebungen, 2. Ruecken 2x8-12 an 4. Stelle, Bauch zuletzt');
ok(rows[3][1]==='Rudermaschine (Panatta)','Neue Zeile ist mit deiner letzten Rudern-Uebung vorbelegt ('+rows[3][1]+')');
ok(rows[2][1]!==rows[3][1],'Keine doppelte Uebung an einem Tag');
const snap=JSON.stringify(st);await page.reload();await page.waitForTimeout(250);
ok(JSON.stringify(await page.evaluate(()=>JSON.parse(localStorage.getItem('peach_v4'))))===snap,'Zweiter Start aendert nichts (idempotent)');
ok(errs.length===0,'keine JS-Fehler');console.log(fails?'FAILS '+fails:'ALL PASS');process.exitCode=fails?1:0;await b.close();})();
