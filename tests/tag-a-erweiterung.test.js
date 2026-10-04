// 4-Tage Tag A im Wandel: bis 27.09.2026 7 Zeilen mit Beinbeuger, 27.09.-02.10. 8 Zeilen (Glute & Hams
// dazu), 02.10.-04.10. 7 Zeilen OHNE Beinbeuger (Wunsch: Beinbeuger nur 1x pro Woche mit 3 Saetzen, an Tag C),
// seit 04.10.2026 8 Zeilen mit ZWEITER Glute-Med-Zeile direkt nach der ersten (Wunsch: mehr Glute Med).
// Eingetragene Wochen aller Altfassungen muessen per Kategorie richtig einsortiert werden; die neue
// Glute-Med-Zeile bleibt in alten Wochen frei; Werte der gestrichenen Beinbeuger-Zeile bleiben gespeichert
// (geparkt hinter dem Plan) — kein Verlust.
const { chromium } = (()=>{try{return require('playwright')}catch(e){return require('/opt/node22/lib/node_modules/playwright')}})();
const PEACH_URL=process.env.PEACH_URL||'http://127.0.0.1:8765/index.html';
let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};
(async()=>{const b=await chromium.launch();const page=await (await b.newContext({viewport:{width:390,height:844}})).newPage();
const errs=[];page.on('pageerror',e=>errs.push(e.message));
await page.goto(PEACH_URL);
const old7=['Hip Thrusts Langhantel','Kabel Kickback Schrägbank','Abduktionsmaschine','Split Squat Kurzhantel','Leg Curls sitzend','Adduktionsmaschine','Panatta Super Crunch'];
const old8=['Hip Thrusts Langhantel','Kabel Kickback Schrägbank','Abduktionsmaschine','Split Squat Kurzhantel','RDL Langhantel','Leg Curls sitzend (Precor)','Adduktionsmaschine','Panatta Super Crunch'];
const cur7=['Hip Thrusts Langhantel','Kabel Kickback Schrägbank','Abduktionsmaschine','Split Squat Kurzhantel','RDL Langhantel','Adduktionsmaschine','Panatta Super Crunch'];
const data={pv__done:1,pv__v3:1,pv__p3cycle1:1,
  'cycle2__w1__d1__e6':{exercise:'',extraSets:0,weight:'10',reps:['12']}};                     // Werte ohne Uebung
for(let w=1;w<=2;w++)old7.forEach((ex,e)=>{data['cycle2__w'+w+'__d0__e'+e]={exercise:ex,extraSets:0,weight:String(100+e*10+w),reps:['8','8']}});
old8.forEach((ex,e)=>{data['cycle2__w3__d0__e'+e]={exercise:ex,extraSets:0,weight:String(200+e*10),reps:['9','9']}});
cur7.forEach((ex,e)=>{data['cycle2__w4__d0__e'+e]={exercise:ex,extraSets:0,weight:String(300+e*10),reps:['10','10']}});
await page.evaluate(d=>{localStorage.clear();localStorage.setItem('peach_mig_add','1');localStorage.setItem('peach_v4',JSON.stringify(d));localStorage.setItem('peach_ui',JSON.stringify({view:'training',week:5,cy:'cycle2',pt:'p4',openDays:{0:true}}));},data);
await page.reload();await page.waitForTimeout(300);
let st=await page.evaluate(()=>JSON.parse(localStorage.getItem('peach_v4')));
const at=(w,e)=>st['cycle2__w'+w+'__d0__e'+e]||{};
const parked=w=>Object.keys(st).filter(k=>k.startsWith('cycle2__w'+w+'__d0__e')&&+k.split('__e')[1]>=8).map(k=>st[k]);
for(const w of [1,2]){
  ok([0,1,2].every(e=>at(w,e).exercise===old7[e]),'W'+w+' (alte 7er-Fassung): Zeilen 1-3 unveraendert');
  ok(!at(w,3).exercise,'W'+w+': neue 2. Glute-Med-Zeile (e3) ist frei');
  ok(at(w,4).exercise==='Split Squat Kurzhantel'&&at(w,4).weight===String(130+w),'W'+w+': Split Squat in der Glute-&-Quad-Zeile (e4)');
  ok(!at(w,5).exercise,'W'+w+': Glute-&-Hams-Zeile (e5) ist frei');
  ok(at(w,6).exercise==='Adduktionsmaschine'&&at(w,6).weight===String(150+w),'W'+w+': Adduktion in der Adduktoren-Zeile');
  ok(at(w,7).exercise==='Panatta Super Crunch'&&at(w,7).weight===String(160+w),'W'+w+': Bauch als letzte Zeile');
  const p=parked(w);ok(p.length===1&&p[0].exercise==='Leg Curls sitzend'&&p[0].weight===String(140+w),'W'+w+': Leg Curls geparkt, Gewicht erhalten');
}
ok([0,1,2].every(e=>at(3,e).exercise===old8[e])&&!at(3,3).exercise&&at(3,4).exercise==='Split Squat Kurzhantel'&&at(3,5).exercise==='RDL Langhantel'&&at(3,5).weight==='240','W3 (8er-Fassung mit Beinbeuger): 2. Glute Med frei, Split Squat/RDL eine Zeile weiter');
ok(at(3,6).exercise==='Adduktionsmaschine'&&at(3,6).weight==='260'&&at(3,7).exercise==='Panatta Super Crunch'&&at(3,7).weight==='270','W3: Adduktion und Bauch an ihrer Zeile');
const p3=parked(3);ok(p3.length===1&&p3[0].exercise==='Leg Curls sitzend (Precor)'&&p3[0].weight==='250','W3: Leg Curls (Precor) geparkt, Gewicht erhalten');
ok([0,1,2].every(e=>at(4,e).exercise===cur7[e])&&!at(4,3).exercise&&[4,5,6,7].every(e=>at(4,e).exercise===cur7[e-1]&&at(4,e).weight===String(300+(e-1)*10)),'W4 (7er-Fassung 02.-04.10.): alles ab Glute & Quad eine Zeile weiter, 2. Glute Med frei');
ok(parked(4).length===0,'W4: nichts geparkt');
ok(Object.keys(st).filter(k=>/^cycle2__w[1234]__d0__e\d+$/.test(k)).length===29,'Kein Eintrag verloren (7+7+8+7)');
ok(st['cycle2__w1__d1__e6']&&st['cycle2__w1__d1__e6'].weight==='10','Eintrag mit Werten, aber ohne Uebung bleibt erhalten');
// Woche 5: 8 Zeilen, Vorbelegung aus W4
const rows=await page.$$eval('.day-body .ex-row',rs=>rs.map(x=>[x.querySelector('.cat-badge').textContent,x.querySelector('.pick-btn-txt').textContent,x.querySelector('.sets-info').textContent]));
ok(rows.length===8&&rows[2][0]==='Glute Med'&&rows[3][0]==='Glute Med'&&rows[4][0]==='Glute & Quad'&&rows[5][0]==='Glute & Hams'&&rows[6][0]==='Adduktoren'&&rows[7][0]==='Bauch'&&!rows.some(r=>r[0]==='Beinbeuger'),'Tag A: 8 Uebungen, 2x Glute Med nach Glute Max, kein Beinbeuger, Bauch zuletzt');
ok(rows[3][2].startsWith('2 Sätze')&&rows[3][2].includes('8–12'),'2. Glute-Med-Zeile: 2 Saetze 8-12 ('+rows[3][2]+')');
ok(rows[2][1]==='Abduktionsmaschine'&&rows[5][1]==='RDL Langhantel'&&rows[6][1]==='Adduktionsmaschine','W5 erbt Abduktion, RDL und Adduktion aus W4');
ok(rows[3][1]!=='Abduktionsmaschine','2. Glute-Med-Zeile ohne Dopplung der ersten ('+rows[3][1]+')');
ok((await page.textContent('#ph-0-6')).includes('Z2 W4 · Tag A'),'Adduktion W5: Vorwert aus W4 ('+(await page.textContent('#ph-0-6')).trim()+')');
// Tag C: Beinbeuger 3 Saetze
await page.evaluate(()=>{S.openDays={2:true};render()});await page.waitForTimeout(80);
const bb=await page.$$eval('.day-body .ex-row',rs=>rs.map(x=>[x.querySelector('.cat-badge').textContent,x.querySelector('.sets-info').textContent]).filter(r=>r[0]==='Beinbeuger'));
ok(bb.length===1&&bb[0][1].startsWith('3 Sätze'),'Tag C: Beinbeuger mit 3 Saetzen');
const snap=JSON.stringify(st);await page.reload();await page.waitForTimeout(250);
ok(JSON.stringify(await page.evaluate(()=>JSON.parse(localStorage.getItem('peach_v4'))))===snap,'Zweiter Start aendert nichts (idempotent)');
ok(await page.evaluate(()=>!!localStorage.getItem('peach_v4_pre_fix_last')),'Sicherheitskopie vor der Umsortierung vorhanden');
ok(errs.length===0,'keine JS-Fehler');console.log(fails?'FAILS '+fails:'ALL PASS');process.exitCode=fails?1:0;await b.close();})();
