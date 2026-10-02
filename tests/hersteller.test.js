// Hersteller-Varianten (30.09.2026): Leg Curls liegend und Beinstrecker Maschine gibt es in der Auswahl nur
// noch als (Panatta) / (Precor), Leg Curls sitzend nur als (Precor) (steht nur dort). Alte Eintraege mit den bisherigen Namen bleiben unveraendert
// an ihrer Zeile; neue Zyklen schlagen die alten Namen nicht mehr vor.
// Peach-App Browser-Test — Aufruf ueber tests/run.sh (startet den lokalen Server).
const { chromium } = (()=>{try{return require('playwright')}catch(e){return require('/opt/node22/lib/node_modules/playwright')}})();
const PEACH_URL=process.env.PEACH_URL||'http://127.0.0.1:8765/index.html';
let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};
(async()=>{const b=await chromium.launch();const page=await (await b.newContext({viewport:{width:390,height:844}})).newPage();
const errs=[];page.on('pageerror',e=>errs.push(e.message));
await page.goto(PEACH_URL);
// p3cycle1 = alter 3-Tage-Plan (Tag A e4 Glute & Hams), cycle2 = neuer 4-Tage-Plan (Tag A e5 Beinbeuger, Tag D e4 Beinstrecker)
const d={pv__done:1,pv__p3cycle1:1,
 'p3cycle1__w12__d0__e4':{exercise:'Leg Curls liegend',extraSets:0,weight:'30',reps:['10','10']},
 'cycle2__w1__d0__e5':{exercise:'Leg Curls sitzend',extraSets:0,weight:'25',reps:['12','12']},
 'cycle2__w1__d3__e4':{exercise:'Beinstrecker Maschine',extraSets:0,weight:'40',reps:['12','12']},
 'set__ex__Leg Curls sitzend':'Sitz 3'};
await page.evaluate(d=>{localStorage.clear();localStorage.setItem('peach_mig_add','1');localStorage.setItem('peach_v4',JSON.stringify(d));localStorage.setItem('peach_ui',JSON.stringify({view:'training',week:2,cy:'cycle2',pt:'p4',openDays:{0:true}}));},d);
await page.reload();await page.waitForTimeout(300);
const st=await page.evaluate(()=>JSON.parse(localStorage.getItem('peach_v4')));
// Plan-Marker (pv__v3 seit 02.10.2026) sind keine Trainingsdaten
const same=(a,b)=>{const ks=new Set([...Object.keys(a),...Object.keys(b)].filter(k=>k.indexOf('pv__')!==0||k==='pv__p3cycle1'));return [...ks].every(k=>JSON.stringify(a[k])===JSON.stringify(b[k]))};
ok(same(st,d),'Alte Eintraege (liegend, sitzend, Beinstrecker, Einstellung) unveraendert');
const txt=async sel=>(await page.textContent(sel).catch(()=>''));
ok((await txt('#pw-0-5 .pick-btn-txt'))==='Leg Curls sitzend','Z2 W2: alte Auswahl "Leg Curls sitzend" steht weiter in der Beinbeuger-Zeile');
// Dropdowns
await page.click('#pw-0-5 .pick-btn');await page.waitForTimeout(120);
let opts=await page.$$eval('.dropdown .drop-opt:not(.drop-empty-opt)',e=>e.map(x=>x.getAttribute('data-val')));
ok(JSON.stringify(opts)===JSON.stringify(['Leg Curls sitzend (Precor)','Leg Curls liegend (Panatta)','Leg Curls liegend (Precor)','Leg Curls stehend','Nordic Curls']),'Beinbeuger-Auswahl: '+opts.join(', '));
ok(await page.$$eval('.dropdown .drop-opt:not(.drop-empty-opt)',e=>e.slice(0,3).every(x=>x.textContent.includes('★'))),'Hersteller-Varianten mit Empfehlungs-Stern');
await page.click('.dropdown .drop-opt[data-val="Leg Curls liegend (Precor)"]');await page.waitForTimeout(150);
// Woche 2, andere Uebung als in Woche 1 -> Rueckfrage, "Ab jetzt im Zyklus"
ok(await page.isVisible('#sheet .sheet'),'Wechsel ab Woche 2 fragt nach (nur diese Woche / ab jetzt)');
await page.click('#sheet .sheet-btn.pri');await page.waitForTimeout(120);
ok((await txt('#pw-0-5 .pick-btn-txt'))==='Leg Curls liegend (Precor)','Auswahl "Leg Curls liegend (Precor)" gespeichert');
ok(await page.evaluate(()=>!!TIPS['Leg Curls liegend (Precor)']&&TIPS['Leg Curls liegend (Precor)']===TIPS['Leg Curls liegend']&&!!TIPS['Leg Curls sitzend (Precor)']&&!TIPS['Leg Curls sitzend (Panatta)']),'Ausfuehrungstipps fuer die Varianten vorhanden, keiner fuer Leg Curls sitzend (Panatta)');
ok(!(await txt('#pw-0-5')).includes('zuletzt')&&!(await page.$eval('#pw-0-5',e=>e.closest('.ex-row').textContent)).includes('(zuletzt'),'Neue Variante: kein Vorwert vom anderen Geraet');
await page.evaluate(()=>{S.openDays={3:true};render()});
await page.click('#pw-3-4 .pick-btn');await page.waitForTimeout(120);
opts=await page.$$eval('.dropdown .drop-opt:not(.drop-empty-opt)',e=>e.map(x=>x.getAttribute('data-val')));
ok(JSON.stringify(opts)===JSON.stringify(['Beinstrecker Maschine (Panatta)','Beinstrecker Maschine (Precor)','Beinstrecker einbeinig']),'Beinstrecker-Auswahl: '+opts.join(', '));
await page.click('body',{position:{x:5,y:5}});
// neuer Zyklus: alte Namen werden nicht vorgeschlagen
await page.evaluate(()=>{S.cy='cycle3';S.week=1;S.openDays={0:true,3:true};render()});
ok((await txt('#pw-0-5 .pick-btn-txt'))==='Leg Curls liegend (Precor)','Z3 W1: Beinbeuger uebernimmt die neu gewaehlte Variante');
ok((await txt('#pw-3-4 .pick-btn-txt'))==='– Übung wählen –','Z3 W1: Beinstrecker-Zeile leer (altes "Beinstrecker Maschine" ohne Hersteller wird nicht vorgeschlagen)');
// Nach Neustart: repairSlots laesst alte Namen an ihrer Zeile
await page.reload();await page.waitForTimeout(250);
const st2=await page.evaluate(()=>JSON.parse(localStorage.getItem('peach_v4')));
ok(st2['p3cycle1__w12__d0__e4'].exercise==='Leg Curls liegend'&&st2['cycle2__w1__d0__e5'].exercise==='Leg Curls sitzend'&&st2['cycle2__w1__d3__e4'].exercise==='Beinstrecker Maschine','Nach Neustart: alte Eintraege an derselben Zeile');
ok(errs.length===0,'keine JS-Fehler');console.log(fails?'FAILS '+fails:'ALL PASS');process.exitCode=fails?1:0;await b.close();})();
