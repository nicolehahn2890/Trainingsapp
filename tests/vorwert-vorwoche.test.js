// Vergleich mit der Vorwoche statt mit einem anderen Tag derselben Woche (Wunsch 07.10.2026):
// Nicole macht dieselbe Uebung im gleichen Wdh.-Bereich an zwei Tagen einer Woche. Innerhalb einer Woche
// muss nicht gesteigert werden -> Tag B vergleicht mit Tag B, Tag C mit Tag C (auch ueber 3/4-Tage-Wochen).
// Peach-App Browser-Test — Aufruf ueber tests/run.sh (startet den lokalen Server).
// Einzeln: PEACH_URL=http://127.0.0.1:8765/index.html node tests/<datei>
const { chromium } = (()=>{try{return require('playwright')}catch(e){return require('/opt/node22/lib/node_modules/playwright')}})();
const PEACH_URL=process.env.PEACH_URL||'http://127.0.0.1:8765/index.html';
let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};
(async()=>{const b=await chromium.launch();const page=await (await b.newContext({viewport:{width:390,height:844}})).newPage();
const errs=[];page.on('pageerror',e=>errs.push(e.message));
await page.goto(PEACH_URL);
const EX='Kabel Abduktion Stehend';
// 4 Tage, Zyklus 2 (neuer Plan, flexibel). Tag B Glute Med = d1 e1, Tag C Glute Med = d2 e2 (beide 2x8-12).
const e=(w,r)=>({exercise:EX,extraSets:0,weight:String(w),reps:r});
const data={pv__done:1,pv__v3:1,pv__bb3:1,pv__gm3:1,
  'cycle1__w12__d1__e1':e(19,['12','12']),'cycle1__w12__d2__e2':e(16,['12','12']),
  'cycle2__w1__d1__e1':e(20,['12','12']),'cycle2__w1__d2__e2':e(17,['10','10']),
  'cycle2__w2__d1__e1':e(21,['12','12']),
};
await page.evaluate(d=>{localStorage.clear();localStorage.setItem('peach_mig_add','1');localStorage.setItem('peach_v4',JSON.stringify(d));localStorage.setItem('peach_ui',JSON.stringify({view:'training',week:2,cy:'cycle2',pt:'p4',openDays:{2:true}}));},data);
await page.reload();await page.waitForTimeout(300);
const st=(di,ei)=>page.evaluate(([di,ei])=>{const s=exState(di,ei);return{ex:s.cur.exercise,w:s.prv.weight||'',src:s.srcL,orient:!!s.prv._orient,p:s.p,inc:incDue(s)}},[di,ei]);
const go=(cy,w,pt)=>page.evaluate(([cy,w,pt])=>{S.cy=cy;S.week=w;S.pt=pt;render()},[cy,w,pt]);

// Woche 2: Tag B ist schon trainiert (21 kg) -> Tag C vergleicht trotzdem mit Tag C der Woche 1 (17 kg)
let c=await st(2,2);console.log('  W2 Tag C:',c.ex,c.w,c.src);
ok(c.ex===EX&&c.w==='17'&&c.src.startsWith('Z2 W1 · Tag C'),'W2 Tag C: Vorwert 17 aus Z2 W1 Tag C, nicht 21 aus Tag B derselben Woche');
const shown=await page.$$eval('.day-body .ex-row',rs=>rs.map(x=>({w:(x.querySelector('.w-wrap span[title]')||{}).textContent||'-',h:(x.querySelector('.phint')||{}).textContent||'-'})));
ok(shown[2].w==='(zuletzt 17)'&&shown[2].h.startsWith('zuletzt: Z2 W1 · Tag C'),'Anzeige Tag C: "(zuletzt 17)" · Z2 W1 · Tag C');
// Tag C mit 17 kg und gleichen Reps wie letzte Woche -> "gleich", nicht "weniger" (gegen Tag B mit 21)
await page.evaluate(()=>{initKey(2,2);const k=mk(S.cy,S.week,2,2);S.data[k]={...S.data[k],weight:'17',reps:['10','10']};save();render()});
c=await st(2,2);ok(c.p==='s','W2 Tag C 17 kg x 10/10 wie W1 Tag C -> gleiche Leistung (nicht "weniger" gegen Tag B)');
// Woche 2 Tag B vergleicht mit Tag B der Woche 1 (20), nicht mit dem juengeren Tag C der Woche 1 (17)
const bB=await st(1,1);console.log('  W2 Tag B:',bB.w,bB.src);
ok(bB.w==='20'&&bB.src.startsWith('Z2 W1 · Tag B'),'W2 Tag B: Vorwert 20 aus Z2 W1 Tag B, nicht 17 aus Tag C');

// Woche 3: Tag C ist in Woche 2 doch ausgefallen (Eintrag wieder raus) -> letzter eigener Wert (W1 Tag C),
// nicht Tag B der Woche 2
await page.evaluate(()=>{delete S.data['cycle2__w2__d2__e2'];save();S.week=3;render()});
c=await st(2,2);console.log('  W3 Tag C (W2 ausgefallen):',c.w,c.src);
ok(c.w==='17'&&c.src.startsWith('Z2 W1 · Tag C'),'W3 Tag C nach ausgefallener W2: letzter eigener Wert 17 (Z2 W1 Tag C), nicht 21 von Tag B');

// Woche 1 im neuen Zyklus: eigene Zeile aus dem Zyklus davor (Z1 W12 Tag C 16), nicht Tag B (19)
await go('cycle2',1,'p4');
c=await st(2,2);console.log('  W1 Tag C:',c.w,c.src);
ok(c.w==='16'&&c.src.startsWith('Z1 W12 · Tag C'),'Z2 W1 Tag C: Vorwert aus Z1 W12 Tag C (16), nicht Tag B (19)');
const bW1=await st(1,1);ok(bW1.w==='19'&&bW1.src.startsWith('Z1 W12 · Tag B'),'Z2 W1 Tag B: Vorwert aus Z1 W12 Tag B (19)');

// Nur ein anderer Tag hat die Uebung (neue Zeile) -> juengster Wert eines anderen Tages aus FRUEHEREN Wochen
await page.evaluate(()=>{S.week=4;S.data['cycle2__w4__d3__e1']={exercise:'Kabel Abduktion Stehend',extraSets:0};S.data['cycle2__w4__d1__e1']={exercise:'Kabel Abduktion Stehend',extraSets:0,weight:'25',reps:['12','12']};save();render()});
c=await st(3,1);console.log('  W4 Tag D (Uebung neu in der Zeile):',c.w,c.src);
ok(c.w==='21'&&c.src.startsWith('Z2 W2 · Tag B'),'W4 Tag D neu mit der Uebung: juengster Wert aus frueherer Woche (Z2 W2 Tag B 21), nicht 25 aus dieser Woche');

// 3/4-Tage-Woche: Partnerzeilen. 3-Tage Tag B Glute Med (d1 e2) <-> 4-Tage Tag C, 3-Tage Tag C 2. Glute Med (d2 e2) <-> 4-Tage Tag B
await page.evaluate(()=>{
  S.data['wt__cycle2__w5']='p3';
  S.data['p3cycle2__w5__d1__e2']={exercise:'Kabel Abduktion Stehend',extraSets:0,weight:'18',reps:['12','12','12']}; // = Tag C
  S.data['p3cycle2__w5__d2__e2']={exercise:'Kabel Abduktion Stehend',extraSets:0,weight:'26',reps:['12','12']};       // = Tag B
  S.data['wt__cycle2__w6']='p4';S.week=6;syncPt();save();render()});
const p6C=await st(2,2),p6B=await st(1,1);console.log('  W6 (4 Tage) Tag C:',p6C.w,p6C.src,'| Tag B:',p6B.w,p6B.src);
ok(p6C.w==='18'&&p6C.src.includes('Tag B')&&p6C.src.includes('3-Tage'),'4-Tage W6 Tag C vergleicht mit der Partnerzeile der 3-Tage-Woche 5 (Tag B, 18)');
ok(p6B.w==='26'&&p6B.src.includes('Tag C')&&p6B.src.includes('3-Tage'),'4-Tage W6 Tag B vergleicht mit der Partnerzeile der 3-Tage-Woche 5 (Tag C, 26)');

ok(errs.length===0,'keine JS-Fehler'+(errs.length?': '+errs.join(' | '):''));console.log(fails?'FAILS '+fails:'ALL PASS');process.exitCode=fails?1:0;await b.close();})();
