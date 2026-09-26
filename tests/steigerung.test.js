// Steigerungsregel: Obergrenze im 1. Satz erreicht -> Hinweis "Gewicht steigern" ab Woche 2, verschwindet bei mehr Gewicht.
// Peach-App Browser-Test — Aufruf ueber tests/run.sh (startet den lokalen Server).
// Einzeln: PEACH_URL=http://127.0.0.1:8765/index.html node tests/<datei>
const { chromium } = (()=>{try{return require('playwright')}catch(e){return require('/opt/node22/lib/node_modules/playwright')}})();
const PEACH_URL=process.env.PEACH_URL||'http://127.0.0.1:8765/index.html';
let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};
(async()=>{const b=await chromium.launch();const page=await (await b.newContext({viewport:{width:390,height:844}})).newPage();
const errs=[];page.on('pageerror',e=>errs.push(e.message));
await page.goto(PEACH_URL);
await page.evaluate(()=>{const d={pv__done:1,
 'cycle3__w1__d0__e0':{exercise:'Hip Thrusts Langhantel',extraSets:0,weight:'140',reps:['8','7','6']},   // 4-8: Obergrenze erreicht
 'cycle3__w1__d0__e1':{exercise:'Kabel Kickback Stehend',extraSets:0,weight:'20',reps:['11','12']},      // 8-12: nicht erreicht
 'cycle3__w1__d1__e2':{exercise:'Assistierter Klimmzug (breit)',extraSets:0,weight:'25',reps:['10','9','8']} // Rücken 6-10 assistiert
};localStorage.clear();localStorage.setItem('peach_mig_add','1');localStorage.setItem('peach_v4',JSON.stringify(d));
localStorage.setItem('peach_ui',JSON.stringify({view:'training',week:1,cy:'cycle3',pt:'p4',openDays:{0:true}}));});
await page.reload();await page.waitForTimeout(250);
ok((await page.$$('#ih-0-0')).length===0,'Woche 1: kein Steigerungs-Hinweis');
await page.evaluate(()=>{S.week=2;render()});
const vis=async id=>page.$eval(id,e=>!e.classList.contains('hidden')).catch(()=>false);
ok(await vis('#ih-0-0'),'Woche 2: Hip Thrust (8 von 4-8 im 1. Satz) -> "'+(await page.textContent('#ih-0-0').catch(()=>'-'))+'"');
ok(!(await vis('#ih-0-1')),'Kickback (11 von 8-12) -> kein Hinweis');
await page.fill('.day-body .w-input >> nth=0','140');await page.dispatchEvent('.day-body .w-input >> nth=0','change');
ok(await vis('#ih-0-0'),'Gleiches Gewicht eingetragen -> Hinweis bleibt');
await page.fill('.day-body .w-input >> nth=0','145');await page.dispatchEvent('.day-body .w-input >> nth=0','change');
ok(!(await vis('#ih-0-0')),'Mehr Gewicht eingetragen -> Hinweis verschwindet live');
const line=await page.$eval('.day-body .ex-row .sets-info',e=>e.getBoundingClientRect().height);
await page.fill('.day-body .w-input >> nth=0','140');await page.dispatchEvent('.day-body .w-input >> nth=0','change');
const h=await page.$eval('.day-body .ex-row .sets-info',e=>e.getBoundingClientRect().height);
ok(h<30,'Hinweis passt in eine Zeile (Hoehe '+Math.round(h)+' px)');
await page.evaluate(()=>{S.openDays={1:true};render()});
ok((await page.textContent('#ih-1-2').catch(()=>''))==='▼ Hilfe senken','Assistierter Klimmzug: "▼ Hilfe senken"');
ok(errs.length===0,'keine JS-Fehler');console.log(fails?'FAILS '+fails:'ALL PASS');process.exitCode=fails?1:0;await b.close();})();

