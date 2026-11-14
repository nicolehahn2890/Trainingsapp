// Gewichtsspanne zaehlt mit ihrem MITTELWERT (Wunsch 14.11.2026): Abduktionsmaschine Vorwoche "105-107",
// diese Woche 106 -> gleiches Gewicht, die Reps entscheiden. Vorher zaehlte nur der obere Wert (107) und
// das Badge stand auf "↓ Weniger", obwohl mehr Reps geschafft wurden.
// Peach-App Browser-Test — Aufruf ueber tests/run.sh (startet den lokalen Server).
// Einzeln: PEACH_URL=http://127.0.0.1:8765/index.html node tests/<datei>
const { chromium } = (()=>{try{return require('playwright')}catch(e){return require('/opt/node22/lib/node_modules/playwright')}})();
const PEACH_URL=process.env.PEACH_URL||'http://127.0.0.1:8765/index.html';
let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};
(async()=>{const b=await chromium.launch();const page=await (await b.newContext({viewport:{width:390,height:844}})).newPage();
const errs=[];page.on('pageerror',e=>errs.push(e.message));
await page.goto(PEACH_URL);
const EX='Abduktionsmaschine';
// 4 Tage, Zyklus 2 (neuer Plan). Tag B Glute Med = d1 e1 (2x8-12) — wie im Screenshot: Z2 W5 -> W6.
const data={pv__done:1,pv__v3:1,pv__bb3:1,pv__gm3:1,pv__gx48:1,
  'cycle2__w5__d1__e1':{exercise:EX,extraSets:0,weight:'105-107',reps:['12','15']},
  'cycle2__w6__d1__e1':{exercise:EX,extraSets:0,weight:'106',reps:['15','20']},
};
await page.evaluate(d=>{localStorage.clear();localStorage.setItem('peach_mig_add','1');localStorage.setItem('peach_v4',JSON.stringify(d));localStorage.setItem('peach_ui',JSON.stringify({view:'training',week:6,cy:'cycle2',pt:'p4',openDays:{1:true}}));},data);
await page.reload();await page.waitForTimeout(300);
const st=()=>page.evaluate(()=>{const s=exState(1,1);return{w:s.prv.weight||'',src:s.srcL,p:s.p}});
const badge=()=>page.textContent('#pb-1-1');
const setCur=(w,r)=>page.evaluate(([w,r])=>{const k=mk(S.cy,S.week,1,1);S.data[k]={...S.data[k],weight:w,reps:r};save();render()},[w,r]);

// Screenshot-Fall: 106 gegen 105-107, Reps 15/20 gegen 12/15
let c=await st();console.log('  Vorwert:',c.w,c.src,'-> Status',c.p);
ok(c.w==='105-107'&&c.src.startsWith('Z2 W5 · Tag B'),'Vorwert "105-107" aus Z2 W5 Tag B');
ok(c.p==='r'&&(await badge()).includes('Reps'),'106 nach "105-107" mit mehr Reps -> "↑ Reps" (vorher "↓ Weniger")');
ok((await page.textContent('.day-body')).includes('(zuletzt 105-107)'),'Anzeige am Gewichtsfeld bleibt "(zuletzt 105-107)"');
// gleiche Reps -> gleiche Leistung
await setCur('106',['12','15']);c=await st();
ok(c.p==='s'&&(await badge()).includes('Gleich'),'106 nach "105-107" mit gleichen Reps -> "= Gleich"');
// weniger Reps bei gleichem Gewicht -> weniger (ueber die Reps, nicht ueber das Gewicht)
await setCur('106',['10','12']);c=await st();ok(c.p==='d','106 nach "105-107" mit weniger Reps -> "↓ Weniger"');
// ueber/unter der Mitte, mit mehr Reps: das Gewicht entscheidet
await setCur('107',['15','20']);c=await st();ok(c.p==='w'&&(await badge()).includes('Gewicht'),'107 nach "105-107" -> "↑ Gewicht"');
await setCur('105',['15','20']);c=await st();ok(c.p==='d'&&(await badge()).includes('Weniger'),'105 nach "105-107" -> "↓ Weniger" (trotz mehr Reps)');
// Spanne gegen Spanne
await setCur('105-107',['15','20']);c=await st();ok(c.p==='r','gleiche Spanne, mehr Reps -> "↑ Reps"');
await setCur('106-108',['12','15']);c=await st();ok(c.p==='w','"106-108" nach "105-107" -> "↑ Gewicht"');
await setCur('104-108',['12','15']);c=await st();ok(c.p==='s','"104-108" nach "105-107" (gleiche Mitte) -> "= Gleich"');
// live beim Tippen: Badge folgt der Eingabe
await page.fill('.day-body .w-input >> nth=1','106');await page.waitForTimeout(80);
ok((await badge()).includes('Gleich'),'Eingabe 106 im Gewichtsfeld -> Badge live "= Gleich"');

// Einheitstests: Mittelwert-Regel und die bisherigen Faelle
const u=await page.evaluate(()=>{const t=[];const c=(n,got,exp)=>t.push([n,got===exp,got,exp]);
 c('106 vs 105-107',cmpWeight('106','105-107'),0);
 c('105-107 vs 106',cmpWeight('105-107','106'),0);
 c('106,5 vs 105-107',cmpWeight('106,5','105-107'),1);
 c('105,5 vs 105-107',cmpWeight('105,5','105-107'),-1);
 c('27,5 vs 25-30',cmpWeight('27,5','25-30'),0);
 c('45 vs 40-45 (Rahmen angezogen)',cmpWeight('45','40-45'),1);
 c('40-45 vs 45 (Rahmen heruntergesetzt)',cmpWeight('40-45','45'),-1);
 c('42-45 vs 40-45',cmpWeight('42-45','40-45'),1);
 c('40-45 vs 44 (Mitte 42,5)',cmpWeight('40-45','44'),-1);
 c('leeres Feld kein Abstieg',cmpWeight('','105-107'),0);
 c('assistiert: 22,5 vs 20-25',cmpWeight('22,5','20-25',true),0);
 c('assistiert: 20 vs 20-25 weniger Hilfe',cmpWeight('20','20-25',true),1);
 c('assistiert: 25 vs 20-25 mehr Hilfe',cmpWeight('25','20-25',true),-1);
 c('assistiert: 0 vs 5',cmpWeight('0','5',true),1);
 c('parseWeight 105-107',parseWeight('105-107'),106);
 c('parseWeight 106',parseWeight('106'),106);
 c('parseWeight leer',parseWeight(''),0);
 return t});
u.forEach(x=>ok(x[1],'Logik: '+x[0]+(x[1]?'':' (bekommen '+x[2]+', erwartet '+x[3]+')')));

// Uebersicht: gleiche Last -> gleicher Balken, kein Rueckgang von "107" auf 106
await setCur('106',['15','20']);
await page.evaluate(()=>{S.data['cycle2__w4__d1__e1']={exercise:'Abduktionsmaschine',extraSets:0,weight:'100',reps:['12','12']};save();setView('overview')});
await page.waitForTimeout(200);
const ov=await page.evaluate(()=>{const day=document.querySelectorAll('.ov-day')[1],ex=day.querySelectorAll('.ov-ex')[1];
  const hs=[...ex.querySelectorAll('.ov-bar-fill')].map(x=>x.style.height);return{txt:ex.textContent,h5:hs[4],h6:hs[5]}});
console.log('  Uebersicht:',ov.txt.replace(/\s+/g,' ').slice(0,140),'| W5',ov.h5,'W6',ov.h6);
ok(ov.h5===ov.h6&&ov.h5!=='0%','Uebersicht: W5 ("105-107") und W6 (106) gleich hoch');
ok(ov.txt.includes('Start: 100 kg')&&ov.txt.includes('Aktuell: 106 kg')&&ov.txt.includes('+6.0 kg'),'Uebersicht: Start 100, Aktuell 106, +6.0 kg');

ok(errs.length===0,'keine JS-Fehler'+(errs.length?': '+errs.join(' | '):''));
console.log('ERGEBNIS: '+(fails?fails+' FEHLER':'ALL PASS'));await b.close();process.exit(fails?1:0)})().catch(e=>{console.log('ABBRUCH '+e.message);process.exit(1)});
