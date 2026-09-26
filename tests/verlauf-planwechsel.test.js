// Echter Verlauf: 4 Tage Z1 W1-3, dann 3 Tage Z1 W1-12, dann 4 Tage Z2 -> Vorwerte/Uebernahme aus dem juengsten Zyklus.
// Peach-App Browser-Test — Aufruf ueber tests/run.sh (startet den lokalen Server).
// Einzeln: PEACH_URL=http://127.0.0.1:8765/index.html node tests/<datei>
const { chromium } = (()=>{try{return require('playwright')}catch(e){return require('/opt/node22/lib/node_modules/playwright')}})();
const PEACH_URL=process.env.PEACH_URL||'http://127.0.0.1:8765/index.html';
// Nicoles echter Verlauf: 4 Tage Z1 W1-3 (Juni), dann 3 Tage Z1 W1-12 (Juli-Sept), jetzt 4 Tage Z2 W1
let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};
(async()=>{const b=await chromium.launch();const page=await (await b.newContext({viewport:{width:390,height:844}})).newPage();
const errs=[];page.on('pageerror',e=>errs.push(e.message));
await page.goto(PEACH_URL);
const data=await page.evaluate(()=>{
  const pick={"Glute Max":["Hip Thrusts Langhantel","Kabel Kickback Flachbank","Hip Thrust Maschine"],"Glute Med":["Abduktionsmaschine","Kabel Abduktion Stehend"],"Glute & Hams":["RDL Langhantel","Leg Curls liegend","Glute Hyperextensions"],"Glute & Quad":["Split Squat Kurzhantel","Reverse Lunge"],"Adduktoren":["Adduktionsmaschine"],"Rücken":["Latzug (breit)","Rudermaschine (Panatta)"],"Brust":["Butterfly Maschine"],"Schultern":["KH Seitheben"],"Bauch":["Panatta Super Crunch","Pallof Press"],"Bizeps":["SZ Curls"],"Trizeps":["Pushdown Kabel"]};
  const pick4={...pick,"Glute Max":["Hip Thrust Maschine","Kickback Maschine","Glute Bridge Langhantel"],"Rücken":["LH Rudern","Latzug (eng)"]};
  const d={};
  const fill=(cy,pl,w0,w1,pk,base)=>pl.forEach((day,di)=>{const cnt={};day.e.forEach((sl,ei)=>{const i=cnt[sl.c]=(cnt[sl.c]||0);cnt[sl.c]++;const ex=pk[sl.c][i%pk[sl.c].length];
    for(let w=w0;w<=w1;w++){d[cy+'__w'+w+'__d'+di+'__e'+ei]={exercise:ex,extraSets:0,weight:String(base+w),reps:Array.from({length:sl.s},()=>String(sl.r[0]+1))};}})});
  fill('cycle1',P4_V1,1,3,pick4,100); fill('p3cycle1',P3_V1,1,12,pick,130);
  // Hip Thrusts Langhantel auch im 4-Tage-Zyklus 1 (Juni) -> darf NICHT als Vorwert kommen
  d['cycle1__w3__d3__e0']={exercise:'Hip Thrusts Langhantel',extraSets:0,weight:'130',reps:['9','10','12']};
  return d;});
await page.evaluate(d=>{localStorage.clear();localStorage.setItem('peach_mig_add','1');localStorage.setItem('peach_v4',JSON.stringify(d));localStorage.setItem('peach_ui',JSON.stringify({view:'training',week:1,cy:'cycle2',pt:'p4',openDays:{0:true}}));},data);
await page.reload();await page.waitForTimeout(300);
const rows=async()=>page.$$eval('.day-body .ex-row',rs=>rs.map(x=>({ex:x.querySelector('.pick-btn-txt').textContent,w:(x.querySelector('.w-wrap span[title]')||{}).textContent||'-',h:(x.querySelector('.phint')||{}).textContent||'-'})));
let r=await rows(); r.forEach(x=>console.log('  ',x.ex,'|',x.w,'|',x.h));
ok(r[0].ex==='Hip Thrusts Langhantel'&&r[0].h.startsWith('zuletzt: Z1 W12')&&r[0].h.includes('3-Tage')&&r[0].w==='(zuletzt 142)','4 Tage Z2 W1: Hip Thrust zeigt Z1 W12 (3 Tage, 142 kg) statt Z1 W3 (4 Tage)');
ok(r.every(x=>!/W3/.test(x.h)),'Kein Vorwert aus der alten 4-Tage-Woche 3');
ok(r[1].ex==='Kabel Kickback Flachbank','Uebernahme aus dem zuletzt trainierten Zyklus (3 Tage), nicht aus 4 Tage Z1');
// Woche 2: Vergleich gegen Woche 1 desselben Zyklus
await page.fill('#rp-0-0-0','8');await page.dispatchEvent('#rp-0-0-0','change');
await page.evaluate(()=>{const k='cycle2__w1__d0__e0';S.data[k]={...S.data[k],weight:'140'};save();S.week=2;render()});
r=await rows(); ok(r[0].h.startsWith('zuletzt: Z2 W1')&&r[0].w==='(zuletzt 140)','4 Tage Z2 W2: Vergleich gegen Z2 W1');
// alter 3-Tage-Zyklus W12 unveraendert gegen W11
await page.evaluate(()=>{S.pt='p3';S.cy='p3cycle1';S.week=12;S.openDays={0:true};render()});
r=await rows(); ok(r[0].h.startsWith('zuletzt: Z1 W11'),'3 Tage Z1 W12: Vorwert aus W11 ('+r[0].h+')');
ok(errs.length===0,'keine JS-Fehler');console.log(fails?'FAILS '+fails:'ALL PASS');process.exitCode=fails?1:0;await b.close();})();

