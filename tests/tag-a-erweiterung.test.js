// 4-Tage Tag A im Wandel: bis 27.09.2026 7 Zeilen mit Beinbeuger, 27.09.-02.10. 8 Zeilen (Glute & Hams
// dazu), seit 02.10.2026 wieder 7 Zeilen OHNE Beinbeuger (Wunsch: Beinbeuger nur 1x pro Woche mit 3 Saetzen,
// an Tag C). Eingetragene Wochen beider Altfassungen muessen per Kategorie richtig einsortiert werden;
// Werte der gestrichenen Beinbeuger-Zeile bleiben gespeichert (geparkt hinter dem Plan) — kein Verlust.
const { chromium } = (()=>{try{return require('playwright')}catch(e){return require('/opt/node22/lib/node_modules/playwright')}})();
const PEACH_URL=process.env.PEACH_URL||'http://127.0.0.1:8765/index.html';
let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};
(async()=>{const b=await chromium.launch();const page=await (await b.newContext({viewport:{width:390,height:844}})).newPage();
const errs=[];page.on('pageerror',e=>errs.push(e.message));
await page.goto(PEACH_URL);
const old7=['Hip Thrusts Langhantel','Kabel Kickback Schrägbank','Abduktionsmaschine','Split Squat Kurzhantel','Leg Curls sitzend','Adduktionsmaschine','Panatta Super Crunch'];
const old8=['Hip Thrusts Langhantel','Kabel Kickback Schrägbank','Abduktionsmaschine','Split Squat Kurzhantel','RDL Langhantel','Leg Curls sitzend (Precor)','Adduktionsmaschine','Panatta Super Crunch'];
const data={pv__done:1,pv__v3:1,pv__p3cycle1:1,
  'cycle2__w1__d1__e6':{exercise:'',extraSets:0,weight:'10',reps:['12']}};                     // Werte ohne Uebung
for(let w=1;w<=2;w++)old7.forEach((ex,e)=>{data['cycle2__w'+w+'__d0__e'+e]={exercise:ex,extraSets:0,weight:String(100+e*10+w),reps:['8','8']}});
old8.forEach((ex,e)=>{data['cycle2__w3__d0__e'+e]={exercise:ex,extraSets:0,weight:String(200+e*10),reps:['9','9']}});
await page.evaluate(d=>{localStorage.clear();localStorage.setItem('peach_mig_add','1');localStorage.setItem('peach_v4',JSON.stringify(d));localStorage.setItem('peach_ui',JSON.stringify({view:'training',week:4,cy:'cycle2',pt:'p4',openDays:{0:true}}));},data);
await page.reload();await page.waitForTimeout(300);
let st=await page.evaluate(()=>JSON.parse(localStorage.getItem('peach_v4')));
const at=(w,e)=>st['cycle2__w'+w+'__d0__e'+e]||{};
const parked=w=>Object.keys(st).filter(k=>k.startsWith('cycle2__w'+w+'__d0__e')&&+k.split('__e')[1]>=7).map(k=>st[k]);
for(const w of [1,2]){
  ok([0,1,2,3].every(e=>at(w,e).exercise===old7[e]),'W'+w+' (alte 7er-Fassung): Zeilen 1-4 unveraendert');
  ok(!at(w,4).exercise,'W'+w+': Glute-&-Hams-Zeile (e4) ist frei');
  ok(at(w,5).exercise==='Adduktionsmaschine'&&at(w,5).weight===String(150+w),'W'+w+': Adduktion in der Adduktoren-Zeile');
  ok(at(w,6).exercise==='Panatta Super Crunch'&&at(w,6).weight===String(160+w),'W'+w+': Bauch als letzte Zeile');
  const p=parked(w);ok(p.length===1&&p[0].exercise==='Leg Curls sitzend'&&p[0].weight===String(140+w),'W'+w+': Leg Curls geparkt, Gewicht erhalten');
}
ok([0,1,2,3,4].every(e=>at(3,e).exercise===old8[e])&&at(3,4).weight==='240','W3 (8er-Fassung): Zeilen 1-5 inkl. RDL unveraendert');
ok(at(3,5).exercise==='Adduktionsmaschine'&&at(3,5).weight==='260'&&at(3,6).exercise==='Panatta Super Crunch'&&at(3,6).weight==='270','W3: Adduktion und Bauch eine Zeile nach vorn');
const p3=parked(3);ok(p3.length===1&&p3[0].exercise==='Leg Curls sitzend (Precor)'&&p3[0].weight==='250','W3: Leg Curls (Precor) geparkt, Gewicht erhalten');
ok(Object.keys(st).filter(k=>/^cycle2__w[123]__d0__e\d+$/.test(k)).length===22,'Kein Eintrag verloren (7+7+8)');
ok(st['cycle2__w1__d1__e6']&&st['cycle2__w1__d1__e6'].weight==='10','Eintrag mit Werten, aber ohne Uebung bleibt erhalten');
// Woche 4: 7 Zeilen, Vorbelegung aus W3
const rows=await page.$$eval('.day-body .ex-row',rs=>rs.map(x=>[x.querySelector('.cat-badge').textContent,x.querySelector('.pick-btn-txt').textContent]));
ok(rows.length===7&&rows[4][0]==='Glute & Hams'&&rows[5][0]==='Adduktoren'&&rows[6][0]==='Bauch'&&!rows.some(r=>r[0]==='Beinbeuger'),'Tag A: 7 Uebungen, kein Beinbeuger, Bauch zuletzt');
ok(rows[4][1]==='RDL Langhantel'&&rows[5][1]==='Adduktionsmaschine','W4 erbt RDL und Adduktion aus W3');
ok((await page.textContent('#ph-0-5')).includes('Z2 W3 · Tag A'),'Adduktion W4: Vorwert aus W3 ('+(await page.textContent('#ph-0-5')).trim()+')');
// Tag C: Beinbeuger 3 Saetze
await page.evaluate(()=>{S.openDays={2:true};render()});await page.waitForTimeout(80);
const bb=await page.$$eval('.day-body .ex-row',rs=>rs.map(x=>[x.querySelector('.cat-badge').textContent,x.querySelector('.sets-info').textContent]).filter(r=>r[0]==='Beinbeuger'));
ok(bb.length===1&&bb[0][1].startsWith('3 Sätze'),'Tag C: Beinbeuger mit 3 Saetzen');
const snap=JSON.stringify(st);await page.reload();await page.waitForTimeout(250);
ok(JSON.stringify(await page.evaluate(()=>JSON.parse(localStorage.getItem('peach_v4'))))===snap,'Zweiter Start aendert nichts (idempotent)');
ok(await page.evaluate(()=>!!localStorage.getItem('peach_v4_pre_fix_last')),'Sicherheitskopie vor der Umsortierung vorhanden');
ok(errs.length===0,'keine JS-Fehler');console.log(fails?'FAILS '+fails:'ALL PASS');process.exitCode=fails?1:0;await b.close();})();
