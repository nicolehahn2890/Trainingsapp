// Vorwert-Regel: Woche 1 und Woche 2 eines neuen Zyklus zeigen fuer jede Uebung denselben Vorwert; gleicher Rep-Bereich zuerst.
// Peach-App Browser-Test — Aufruf ueber tests/run.sh (startet den lokalen Server).
// Einzeln: PEACH_URL=http://127.0.0.1:8765/index.html node tests/<datei>
const { chromium } = (()=>{try{return require('playwright')}catch(e){return require('/opt/node22/lib/node_modules/playwright')}})();
const PEACH_URL=process.env.PEACH_URL||'http://127.0.0.1:8765/index.html';
// Nicoles Verlauf mit Hip Thrust 2x an Tag A (4-8: 148 kg, 8-12: 135 kg) -> Woche 1 und 2 muessen gleich sein
let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};
(async()=>{const b=await chromium.launch();const page=await (await b.newContext({viewport:{width:390,height:844}})).newPage();
const errs=[];page.on('pageerror',e=>errs.push(e.message));
await page.goto(PEACH_URL);
const data=await page.evaluate(()=>{
  const pick={"Glute Max":["Hip Thrusts Langhantel","Hip Thrusts Langhantel","Kabel Kickback Schrägbank"],"Glute Med":["Abduktionsmaschine","Kabel Abduktion Stehend"],"Glute & Hams":["RDL Langhantel","Leg Curls liegend","Glute Hyperextensions"],"Glute & Quad":["Split Squat Kurzhantel","Reverse Lunge"],"Adduktoren":["Adduktionsmaschine"],"Rücken":["Latzug (breit)","Rudermaschine (Panatta)"],"Brust":["Butterfly Maschine"],"Schultern":["KH Seitheben"],"Bauch":["Panatta Super Crunch","Pallof Press"],"Bizeps":["SZ Curls"],"Trizeps":["Pushdown Kabel"]};
  const d={};
  const fill=(cy,pl,w0,w1,base)=>pl.forEach((day,di)=>{const cnt={};day.e.forEach((sl,ei)=>{const i=cnt[sl.c]=(cnt[sl.c]||0);cnt[sl.c]++;const ex=pick[sl.c][i%pick[sl.c].length];
    for(let w=w0;w<=w1;w++){const wt=sl.r[0]===4?base+w:sl.r[0]===6?base-5+w:base-13+w;d[cy+'__w'+w+'__d'+di+'__e'+ei]={exercise:ex,extraSets:0,weight:String(wt),reps:Array.from({length:sl.s},()=>String(sl.r[0]+1))};}})});
  fill('cycle1',P4_V1,1,3,110); fill('p3cycle1',P3_V1,1,12,136);
  return d;});
await page.evaluate(d=>{localStorage.clear();localStorage.setItem('peach_mig_add','1');localStorage.setItem('peach_v4',JSON.stringify(d));localStorage.setItem('peach_ui',JSON.stringify({view:'training',week:1,cy:'cycle2',pt:'p4',openDays:{}}));},data);
await page.reload();await page.waitForTimeout(300);
const grab=async()=>page.evaluate(()=>{const out=[];plan().forEach((day,di)=>day.e.forEach((ex,ei)=>{const st=exState(di,ei);out.push({d:di,e:ei,c:ex.c,r:ex.r.join('-'),ex:st.cur.exercise,w:st.prv.weight||'',src:st.srcL,rr:st.prv._orient?(st.prv._src||{}).rr:''})}));return out});
const w1=await grab();await page.evaluate(()=>{S.week=2;render()});const w2=await grab();
let diff=0;w1.forEach((x,i)=>{const y=w2[i];if(x.w!==y.w||x.src!==y.src||x.rr!==y.rr){diff++;console.log('  DIFF',x.c,x.r,x.ex,'| W1',x.w,x.src,x.rr,'| W2',y.w,y.src,y.rr)}});
ok(diff===0,'Woche 1 und Woche 2 zeigen fuer alle '+w1.length+' Uebungen denselben Vorwert');
const ht=w1[0];console.log('  Tag A Hip Thrust 4-8:',ht.w,'kg',ht.src,ht.rr||'');
ok(ht.w==='148'&&ht.src.startsWith('Z1 W12')&&!ht.rr,'Hip Thrust 4-8: 148 kg aus Z1 W12, gleicher Bereich (nicht 135 kg aus 8-12)');
const rdl=w1.find(x=>x.c==='Glute & Hams'&&x.r==='6-10');console.log('  RDL 6-10:',rdl.ex,rdl.w,rdl.src,rdl.rr);
ok(rdl.src.startsWith('Z1 W12')&&!rdl.src.includes('W3'),'RDL 6-10: juengster Wert (Z1 W12, 3 Tage), nicht Z1 W3 (4 Tage, Juni)');
ok(w1.every(x=>!x.src||!/W3 /.test(x.src+' ')),'Kein Vorwert aus der alten Woche 3');
ok(errs.length===0,'keine JS-Fehler');console.log(fails?'FAILS '+fails:'ALL PASS');process.exitCode=fails?1:0;await b.close();})();

