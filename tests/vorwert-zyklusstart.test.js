// Vorwert in Woche 1 eines neuen Zyklus, wenn in derselben Woche schon trainiert wurde (Screenshot 07.10.2026):
// Tag C Hip Thrust 6-10 zeigte den 4-8-Wert von Tag A derselben Woche, die 8-12-Zeile darunter das gerade
// eingetippte Gewicht der 6-10-Zeile (ohne Reps). Richtig: gleicher Rep-Bereich aus dem Zyklus davor.
// Peach-App Browser-Test — Aufruf ueber tests/run.sh (startet den lokalen Server).
// Einzeln: PEACH_URL=http://127.0.0.1:8765/index.html node tests/<datei>
const { chromium } = (()=>{try{return require('playwright')}catch(e){return require('/opt/node22/lib/node_modules/playwright')}})();
const PEACH_URL=process.env.PEACH_URL||'http://127.0.0.1:8765/index.html';
let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};
(async()=>{const b=await chromium.launch();const page=await (await b.newContext({viewport:{width:390,height:844}})).newPage();
const errs=[];page.on('pageerror',e=>errs.push(e.message));
await page.goto(PEACH_URL);
// Verlauf wie bei Nicole: 4 Tage Z1 W1-3, 3 Tage Z1 W1-12 (alter Plan), jetzt 4 Tage Z2 W1.
// Hip Thrust Langhantel in allen drei Bereichen: 4-8 = 150+w, 6-10 = 140+w, 8-12 = 125+w.
const data=await page.evaluate(()=>{
  const pick={"Glute Max":["Hip Thrusts Langhantel","Hip Thrusts Langhantel"],"Glute Med":["Abduktionsmaschine","Kabel Abduktion Stehend"],"Glute & Hams":["RDL Langhantel","Glute Hyperextensions"],"Glute & Quad":["Split Squat Kurzhantel","Reverse Lunge"],"Adduktoren":["Adduktionsmaschine"],"Rücken":["Latzug (breit)","Rudermaschine (Panatta)"],"Brust":["Butterfly Maschine"],"Schultern":["KH Seitheben"],"Bauch":["Panatta Super Crunch","Pallof Press"],"Bizeps":["SZ Curls"],"Trizeps":["Pushdown Kabel"]};
  const base={4:150,6:140,8:125};
  const d={};
  const fill=(cy,pl,w0,w1)=>pl.forEach((day,di)=>{const cnt={};day.e.forEach((sl,ei)=>{const i=cnt[sl.c]=(cnt[sl.c]||0);cnt[sl.c]++;const ex=pick[sl.c][i%pick[sl.c].length];
    for(let w=w0;w<=w1;w++){d[cy+'__w'+w+'__d'+di+'__e'+ei]={exercise:ex,extraSets:0,weight:String(base[sl.r[0]]+w),reps:Array.from({length:sl.s},()=>String(sl.r[0]+1))};}})});
  fill('cycle1',P4_V1,1,3); fill('p3cycle1',P3_V1,1,12);
  return d;});
await page.evaluate(d=>{localStorage.clear();localStorage.setItem('peach_mig_add','1');localStorage.setItem('peach_v4',JSON.stringify(d));localStorage.setItem('peach_ui',JSON.stringify({view:'training',week:1,cy:'cycle2',pt:'p4',openDays:{2:true}}));},data);
await page.reload();await page.waitForTimeout(300);
const st=(di,ei)=>page.evaluate(([di,ei])=>{const s=exState(di,ei);return{ex:s.cur.exercise,w:s.prv.weight||'',src:s.srcL,orient:!!s.prv._orient,rr:(s.prv._src||{}).rr||'',p:s.p}},[di,ei]);
const grab=()=>page.evaluate(()=>{const out=[];plan().forEach((day,di)=>day.e.forEach((ex,ei)=>{const s=exState(di,ei);out.push({di,orient:!!s.prv._orient,has:s.hasPrev,t:di+'/'+ei+' '+(s.cur.exercise||'')+' '+(s.prv.weight||'')+' '+s.srcL+' '+(s.prv._orient?(s.prv._src||{}).rr:'')})}));return out});

// Wie im Screenshot: Tag C zweimal Hip Thrust Langhantel (6-10 und 8-12), Tag B Glute Max eine andere Uebung
await page.evaluate(()=>{
  S.data[mk(S.cy,1,1,0)]={exercise:'Kabel Kickback Stehend',extraSets:0};
  S.data[mk(S.cy,1,2,0)]={exercise:'Hip Thrusts Langhantel',extraSets:0};
  S.data[mk(S.cy,1,2,1)]={exercise:'Hip Thrusts Langhantel',extraSets:0};
  save();render()});
// Vorher: Woche 1 noch ohne Werte
const before=await grab();
let c0=await st(2,0),c1=await st(2,1);
console.log('  leer  Tag C 6-10:',c0.w,c0.src,c0.orient?'(Orientierung '+c0.rr+')':'');
console.log('  leer  Tag C 8-12:',c1.w,c1.src,c1.orient?'(Orientierung '+c1.rr+')':'');

// Nicole trainiert Tag A und Tag B in Woche 1, dann Tag C: 142 kg eingetippt, noch keine Reps
await page.evaluate(()=>{
  const put=(di,ei,v)=>{initKey(di,ei);const k=mk(S.cy,S.week,di,ei);S.data[k]={...S.data[k],...v}};
  plan()[0].e.forEach((sl,ei)=>put(0,ei,{weight:sl.r[0]===4?'145':'120',reps:Array.from({length:sl.s},(_,i)=>String(i?10:8))}));
  plan()[1].e.forEach((sl,ei)=>put(1,ei,{weight:String(40+ei),reps:Array.from({length:sl.s},()=>'10')}));
  put(2,0,{weight:'142'});
  save();render();
});
c0=await st(2,0);c1=await st(2,1);
console.log('  danach Tag C 6-10:',c0.w,c0.src,c0.orient?'(Orientierung '+c0.rr+')':'');
console.log('  danach Tag C 8-12:',c1.w,c1.src,c1.orient?'(Orientierung '+c1.rr+')':'');
ok(c0.ex==='Hip Thrusts Langhantel'&&c0.w==='152'&&!c0.orient&&c0.src.startsWith('Z1 W12'),'Tag C Hip Thrust 6-10: 152 kg aus Z1 W12 (6-10), nicht 145 kg aus Tag A 4-8 derselben Woche');
ok(c1.ex==='Hip Thrusts Langhantel'&&c1.w==='137'&&!c1.orient&&c1.src.startsWith('Z1 W12'),'Tag C Hip Thrust 8-12: 137 kg aus Z1 W12 (8-12), nicht das eben getippte 142 der Zeile darueber');
// Sichtbar in der App
const rows=await page.$$eval('.day-body .ex-row',rs=>rs.map(x=>({w:(x.querySelector('.w-wrap span[title]')||{}).textContent||'-',h:(x.querySelector('.phint')||{}).textContent||'-'})));
console.log('  Anzeige:',rows[0].w,'|',rows[0].h,'||',rows[1].w,'|',rows[1].h);
ok(rows[0].w==='(zuletzt 152)'&&!/Tag A/.test(rows[0].h)&&!/Wdh/.test(rows[0].h),'Anzeige 6-10: "(zuletzt 152)", keine Herkunft Tag A, kein fremder Bereich');
ok(rows[1].w==='(zuletzt 137)'&&!/Z2 W1/.test(rows[1].h),'Anzeige 8-12: "(zuletzt 137)", nicht aus Z2 W1');
// Woche 1 bleibt stabil: hatte eine Zeile in Tag C/D einen Vorwert im GLEICHEN Bereich, darf das Training von
// Tag A/B (andere Bereiche) ihn nicht durch einen Orientierungswert ersetzen. Neuer Wert im gleichen Bereich
// aus dieser Woche (gleiche Uebung an Tag B) ist richtig.
const after=await grab();
let diff=0;
before.forEach((x,i)=>{const y=after[i];if(x.di<2)return;if(x.t!==y.t)console.log('  ',x.t,'->',y.t);if(x.has&&!x.orient&&y.orient){diff++;console.log('  FALSCH',x.t,'->',y.t)}});
ok(diff===0,'Tag C/D: kein Vorwert im gleichen Bereich wird durch einen Wert aus einem anderen Bereich ersetzt');

// Woche 2: Vergleich gegen Woche 1 desselben Zyklus (gleicher Bereich)
await page.evaluate(()=>{const k=mk(S.cy,1,2,0);S.data[k]={...S.data[k],reps:['8','8','7']};S.data[mk(S.cy,1,2,1)]={...S.data[mk(S.cy,1,2,1)],weight:'130',reps:['10','10']};save();S.week=2;render()});
c0=await st(2,0);c1=await st(2,1);
ok(c0.w==='142'&&c0.src.startsWith('Z2 W1 · Tag C')&&!c0.orient,'Woche 2 Tag C 6-10: Vergleich gegen Z2 W1 Tag C (142)');
ok(c1.w==='130'&&c1.src.startsWith('Z2 W1 · Tag C')&&!c1.orient,'Woche 2 Tag C 8-12: Vergleich gegen Z2 W1 Tag C (130)');

// Gleiche Uebung zweimal am selben Tag im gleichen Bereich (4 Tage Tag A, zwei Glute-Med-Zeilen):
// die zweite Zeile vergleicht mit ihrer Vorwoche, nicht mit der ersten Zeile von heute.
await page.evaluate(()=>{
  S.week=1;S.data[mk(S.cy,1,0,2)]={...S.data[mk(S.cy,1,0,2)],exercise:'Kabel Abduktion Stehend',weight:'20',reps:['12','12']};
  S.data[mk(S.cy,1,0,3)]={...S.data[mk(S.cy,1,0,3)],exercise:'Kabel Abduktion Stehend',weight:'15',reps:['12','12']};
  S.week=2;initKey(0,2);S.data[mk(S.cy,2,0,2)]={...S.data[mk(S.cy,2,0,2)],weight:'22',reps:['10','10']};save();render()});
const g2=await st(0,3);
ok(g2.ex==='Kabel Abduktion Stehend'&&g2.w==='15'&&g2.src.startsWith('Z2 W1 · Tag A'),'Zweite Glute-Med-Zeile Tag A: Vorwert 15 aus Z2 W1, nicht 22 aus der Zeile darueber (heute)');

// Unveraendert: Plan-Wechsel-Regel — gleicher Bereich aus einem AELTEREN Zyklus als dem zuletzt trainierten
// zaehlt nicht (nur Orientierung mit dem juengsten Wert). Glute Bridge: 6-10 nur in 3 Tage Z1, in Z2 nur 4-8.
await page.evaluate(()=>{
  S.data['p3cycle1__w12__d1__e2']={exercise:'Glute Bridge Langhantel',extraSets:0,weight:'100',reps:['8','8','8']};
  S.data['cycle2__w2__d0__e0']={exercise:'Glute Bridge Langhantel',extraSets:0,weight:'110',reps:['6','6','6']};
  S.data['cycle3__w1__d2__e0']={exercise:'Glute Bridge Langhantel',extraSets:0};
  S.cy='cycle3';S.week=1;save();render()});
const z3=await st(2,0);
console.log('  Z3 W1 Tag C 6-10:',z3.ex,z3.w,z3.src,z3.orient?'(Orientierung '+z3.rr+')':'');
ok(z3.ex==='Glute Bridge Langhantel'&&z3.orient&&z3.w==='110'&&z3.src.startsWith('Z2 W2 · Tag A')&&z3.rr==='4-8','Z3 W1: gleicher Bereich nur aus aelterem Zyklus -> Orientierung mit Z2 W2 (4-8), nicht Z1 W12');

ok(errs.length===0,'keine JS-Fehler'+(errs.length?': '+errs.join(' | '):''));console.log(fails?'FAILS '+fails:'ALL PASS');process.exitCode=fails?1:0;await b.close();})();
