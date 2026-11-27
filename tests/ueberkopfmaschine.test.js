// Ueberkopfmaschine nach Hersteller (27.11.2026): in der Schulter-Auswahl nur noch "Überkopfmaschine (Panatta)" und
// "Überkopfmaschine (Precor)". Der allgemeine Name steht in RETIRED: alte Eintraege bleiben unveraendert an ihrer
// Zeile, die laufende Zeile behaelt ihn bis zum Wechsel, neue Zyklen schlagen ihn nicht mehr vor.
// Peach-App Browser-Test — Aufruf ueber tests/run.sh (startet den lokalen Server).
const { chromium } = (()=>{try{return require('playwright')}catch(e){return require('/opt/node22/lib/node_modules/playwright')}})();
const PEACH_URL=process.env.PEACH_URL||'http://127.0.0.1:8765/index.html';
let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};
(async()=>{const b=await chromium.launch();const page=await (await b.newContext({viewport:{width:390,height:844}})).newPage();
const errs=[];page.on('pageerror',e=>errs.push(e.message));
await page.goto(PEACH_URL);
// cycle2 = aktueller 4-Tage-Plan: Tag B e4 Schultern 3x8-12, Tag B e5 Schultern 2x8-12
const OLD='Überkopfmaschine',PA='Überkopfmaschine (Panatta)',PR='Überkopfmaschine (Precor)';
const d={pv__done:1,pv__v3:1,pv__bb3:1,pv__gm3:1,pv__gx48:1,
 'cycle2__w1__d1__e4':{exercise:OLD,extraSets:0,weight:'20',reps:['10','10','10']},
 ['set__ex__'+OLD]:'Sitz 4',['tip__ex__'+OLD]:'Griffe eng'};
await page.evaluate(d=>{localStorage.clear();localStorage.setItem('peach_mig_add','1');localStorage.setItem('peach_v4',JSON.stringify(d));localStorage.setItem('peach_ui',JSON.stringify({view:'training',week:2,cy:'cycle2',pt:'p4',openDays:{1:true}}));},d);
await page.reload();await page.waitForTimeout(300);
ok(await page.evaluate(([OLD,PA,PR])=>{const s=EXERCISES['Schultern'];return s.length===15&&s.includes(PA)&&s.includes(PR)&&!s.includes(OLD)&&s.indexOf(PR)===s.indexOf(PA)+1&&s[s.indexOf(PA)-1]==='KH Überkopfdrücken'},[OLD,PA,PR]),'Schultern: 15 Uebungen, beide Varianten an der Stelle der allgemeinen Maschine, allgemeine raus');
ok(await page.evaluate(([OLD,PA,PR])=>RETIRED[OLD]==='Schultern'&&CATOF[OLD]==='Schultern'&&CATOF[PA]==='Schultern'&&CATOF[PR]==='Schultern',[OLD,PA,PR]),'Allgemeiner Name in RETIRED, Kategorie bleibt bekannt');
ok(await page.evaluate(([OLD,PA,PR])=>!!TIPS[OLD]&&TIPS[PA]===TIPS[OLD]&&TIPS[PR]===TIPS[OLD],[OLD,PA,PR]),'Tipps fuer beide Varianten vorhanden');
ok(await page.evaluate(([OLD,PA,PR])=>!REC.has(OLD)&&!REC.has(PA)&&!REC.has(PR)&&!isAssist(PA)&&!isAssist(PR),[OLD,PA,PR]),'Kein Stern, nicht assistiert (wie vorher)');
// Daten unveraendert
const st=await page.evaluate(()=>JSON.parse(localStorage.getItem('peach_v4')));
ok(JSON.stringify(st['cycle2__w1__d1__e4'])===JSON.stringify(d['cycle2__w1__d1__e4'])&&st['set__ex__'+OLD]==='Sitz 4'&&st['tip__ex__'+OLD]==='Griffe eng','Alter Eintrag, Einstellung und Notiz unveraendert');
const txt=async sel=>(await page.textContent(sel).catch(()=>''));
ok((await txt('#pw-1-4 .pick-btn-txt'))===OLD,'Z2 W2: laufende Zeile behaelt "Überkopfmaschine"');
// Dropdown
await page.click('#pw-1-4 .pick-btn');await page.waitForTimeout(120);
const opts=await page.$$eval('.dropdown .drop-opt:not(.drop-empty-opt)',e=>e.map(x=>x.getAttribute('data-val')));
ok(opts.length===15&&opts.includes(PA)&&opts.includes(PR)&&!opts.includes(OLD),'Schulter-Auswahl: '+opts.join(', '));
await page.click('.dropdown .drop-opt[data-val="'+PR+'"]');await page.waitForTimeout(150);
ok(await page.isVisible('#sheet .sheet'),'Wechsel ab Woche 2 fragt nach');
await page.click('#sheet .sheet-btn.pri');await page.waitForTimeout(120);
ok((await txt('#pw-1-4 .pick-btn-txt'))===PR,'Auswahl "Überkopfmaschine (Precor)" gespeichert');
const row=await page.$eval('#pw-1-4',e=>e.closest('.ex-row').textContent);
ok(!row.includes('(zuletzt'),'Neue Variante: kein Vorwert vom allgemeinen Eintrag');
// zweite Schulter-Zeile: Panatta waehlbar
await page.click('#pw-1-5 .pick-btn');await page.waitForTimeout(120);
await page.click('.dropdown .drop-opt[data-val="'+PA+'"]');await page.waitForTimeout(150);
if(await page.isVisible('#sheet .sheet').catch(()=>false)){await page.click('#sheet .sheet-btn.pri');await page.waitForTimeout(120);}
ok((await txt('#pw-1-5 .pick-btn-txt'))===PA,'Zweite Schulter-Zeile: "Überkopfmaschine (Panatta)" gespeichert');
// neuer Zyklus: Variante wird uebernommen
await page.evaluate(()=>{S.cy='cycle3';S.week=1;S.openDays={1:true};render()});
ok((await txt('#pw-1-4 .pick-btn-txt'))===PR,'Z3 W1: Schulter-Zeile uebernimmt die Precor-Variante');
// neuer Zyklus ohne Wechsel: allgemeiner Name wird nicht vorgeschlagen
await page.evaluate(d=>{localStorage.setItem('peach_v4',JSON.stringify(d));localStorage.setItem('peach_ui',JSON.stringify({view:'training',week:1,cy:'cycle3',pt:'p4',openDays:{1:true}}));},d);
await page.reload();await page.waitForTimeout(300);
ok((await txt('#pw-1-4 .pick-btn-txt'))!==OLD,'Z3 W1: allgemeine "Überkopfmaschine" wird nicht vorgeschlagen ('+(await txt('#pw-1-4 .pick-btn-txt'))+')');
const st2=await page.evaluate(()=>JSON.parse(localStorage.getItem('peach_v4')));
ok(st2['cycle2__w1__d1__e4']&&st2['cycle2__w1__d1__e4'].exercise===OLD,'Nach Neustart: alter Eintrag an derselben Zeile');
ok(errs.length===0,'keine JS-Fehler '+errs.join(' | '));console.log(fails?'FAILS '+fails:'ALL PASS');process.exitCode=fails?1:0;await b.close();})();
