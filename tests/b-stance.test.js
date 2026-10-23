// B-Stance RDL statt Single-Leg RDL (23.10.2026): neue Uebung in Glute & Hams (mit Tipp und Stern),
// Single-Leg RDL ist aussortiert (RETIRED) — alte Eintraege bleiben an ihrer Zeile, die Auswahl zeigt
// sie nicht mehr, neue Zyklen schlagen sie nicht mehr vor.
// Peach-App Browser-Test — Aufruf ueber tests/run.sh (startet den lokalen Server).
const { chromium } = (()=>{try{return require('playwright')}catch(e){return require('/opt/node22/lib/node_modules/playwright')}})();
const PEACH_URL=process.env.PEACH_URL||'http://127.0.0.1:8765/index.html';
let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};
(async()=>{const b=await chromium.launch();const page=await (await b.newContext({viewport:{width:390,height:844}})).newPage();
const errs=[];page.on('pageerror',e=>errs.push(e.message));
await page.goto(PEACH_URL);
// cycle2 = aktueller 4-Tage-Plan: Tag C e3 Glute & Hams 3x6-10, Tag D e3 Glute & Hams 2x8-12
const d={pv__done:1,pv__v3:1,pv__bb3:1,pv__gm3:1,pv__gx48:1,
 'cycle2__w1__d2__e3':{exercise:'Single-Leg RDL',extraSets:0,weight:'12',reps:['10','9','9']},
 'set__ex__Single-Leg RDL':'KH 12'};
await page.evaluate(d=>{localStorage.clear();localStorage.setItem('peach_mig_add','1');localStorage.setItem('peach_v4',JSON.stringify(d));localStorage.setItem('peach_ui',JSON.stringify({view:'training',week:2,cy:'cycle2',pt:'p4',openDays:{2:true}}));},d);
await page.reload();await page.waitForTimeout(300);
const st=await page.evaluate(()=>JSON.parse(localStorage.getItem('peach_v4')));
ok(JSON.stringify(st['cycle2__w1__d2__e3'])===JSON.stringify(d['cycle2__w1__d2__e3'])&&st['set__ex__Single-Leg RDL']==='KH 12','Alter Single-Leg-Eintrag und Einstellung unveraendert');
const txt=async sel=>(await page.textContent(sel).catch(()=>''));
ok((await txt('#pw-2-3 .pick-btn-txt'))==='Single-Leg RDL','Z2 W2: laufende Auswahl "Single-Leg RDL" bleibt in der Zeile');
ok(await page.evaluate(()=>CATOF['Single-Leg RDL']==='Glute & Hams'&&!!RETIRED['Single-Leg RDL']&&!!TIPS['Single-Leg RDL']&&!EXERCISES['Glute & Hams'].includes('Single-Leg RDL')),'Single-Leg RDL: bekannt (Kategorie, Tipp), aber nicht mehr in der Auswahl-Liste');
ok(await page.evaluate(()=>EXERCISES['Glute & Hams'].includes('B-Stance RDL')&&CATOF['B-Stance RDL']==='Glute & Hams'&&REC.has('B-Stance RDL')&&!REC.has('Single-Leg RDL')&&/Stand:/.test(TIPS['B-Stance RDL'])&&/Ausführung:/.test(TIPS['B-Stance RDL'])),'B-Stance RDL: in Glute & Hams, mit Stern und Tipp (Stand + Ausfuehrung)');
// Dropdown
await page.click('#pw-2-3 .pick-btn');await page.waitForTimeout(120);
const opts=await page.$$eval('.dropdown .drop-opt:not(.drop-empty-opt)',e=>e.map(x=>({v:x.getAttribute('data-val'),t:x.textContent})));
ok(opts.length===8&&opts.some(o=>o.v==='B-Stance RDL'&&o.t.includes('★'))&&!opts.some(o=>o.v==='Single-Leg RDL'),'Glute-&-Hams-Auswahl: B-Stance RDL mit Stern, kein Single-Leg RDL ('+opts.map(o=>o.v).join(', ')+')');
await page.click('.dropdown .drop-opt[data-val="B-Stance RDL"]');await page.waitForTimeout(150);
ok(await page.isVisible('#sheet .sheet'),'Wechsel ab Woche 2 fragt nach (nur diese Woche / ab jetzt)');
await page.click('#sheet .sheet-btn.pri');await page.waitForTimeout(120);
ok((await txt('#pw-2-3 .pick-btn-txt'))==='B-Stance RDL','Auswahl "B-Stance RDL" gespeichert');
ok(!(await page.$eval('#pw-2-3',e=>e.closest('.ex-row').textContent)).includes('(zuletzt'),'B-Stance RDL: kein Vorwert von Single-Leg RDL');
// neuer Zyklus ohne Wechsel: Single-Leg RDL wird nicht vorgeschlagen
await page.evaluate(()=>{localStorage.setItem('peach_v4',JSON.stringify({pv__done:1,pv__v3:1,pv__bb3:1,pv__gm3:1,pv__gx48:1,'cycle2__w12__d2__e3':{exercise:'Single-Leg RDL',extraSets:0,weight:'12',reps:['10','10','10']}}));localStorage.setItem('peach_ui',JSON.stringify({view:'training',week:1,cy:'cycle3',pt:'p4',openDays:{2:true}}));});
await page.reload();await page.waitForTimeout(300);
ok((await txt('#pw-2-3 .pick-btn-txt'))!=='Single-Leg RDL','Z3 W1: Single-Leg RDL wird nicht in den neuen Zyklus uebernommen ('+(await txt('#pw-2-3 .pick-btn-txt'))+')');
const st2=await page.evaluate(()=>JSON.parse(localStorage.getItem('peach_v4')));
ok(st2['cycle2__w12__d2__e3']&&st2['cycle2__w12__d2__e3'].exercise==='Single-Leg RDL','Nach Neustart: alter Eintrag an derselben Zeile');
ok(errs.length===0,'keine JS-Fehler');console.log(fails?'FAILS '+fails:'ALL PASS');process.exitCode=fails?1:0;await b.close();})();
