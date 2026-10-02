// Uebungswechsel ab Woche 2 (02.10.2026): Rueckfrage "Nur diese Woche" / "Ab jetzt im Zyklus",
// Label "nur diese Woche", Vererbung der bisherigen Uebung, Abbrechen, keine Frage in Woche 1,
// bei leerer Vorwoche oder gleicher Uebung; der naechste Zyklus uebernimmt die Standard-Uebung.
// Peach-App Browser-Test — Aufruf ueber tests/run.sh (startet den lokalen Server).
// Einzeln: PEACH_URL=http://127.0.0.1:8765/index.html node tests/uebungswechsel.test.js
const { chromium } = (()=>{try{return require('playwright')}catch(e){return require('/opt/node22/lib/node_modules/playwright')}})();
const PEACH_URL=process.env.PEACH_URL||'http://127.0.0.1:8765/index.html';
let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};
(async()=>{const b=await chromium.launch();const page=await (await b.newContext({viewport:{width:390,height:844}})).newPage();
const errs=[];page.on('pageerror',e=>errs.push(e.message));
await page.goto(PEACH_URL);
const data={pv__done:1,pv__v3:1,
 'cycle3__w1__d0__e0':{exercise:'Hip Thrusts Langhantel',extraSets:0,weight:'100',reps:['8','8','7']},
 'cycle3__w1__d0__e1':{exercise:'Kabel Kickback Stehend',extraSets:0,weight:'20',reps:['12','12']}};
await page.evaluate(d=>{localStorage.clear();localStorage.setItem('peach_mig_add','1');localStorage.setItem('peach_v4',JSON.stringify(d));
  localStorage.setItem('peach_ui',JSON.stringify({view:'training',week:2,cy:'cycle3',pt:'p4',openDays:{0:true}}));},data);
await page.reload();await page.waitForTimeout(250);
const st=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('peach_v4')));
const pick=async(row,ex)=>{await page.click('#pw-0-'+row+' .pick-btn');await page.waitForTimeout(80);await page.click('.dropdown .drop-opt[data-val="'+ex+'"]');await page.waitForTimeout(120)};
const txt=async row=>page.textContent('#pw-0-'+row+' .pick-btn-txt');
const sheet=()=>page.isVisible('#sheet .sheet');
const chip=async row=>(await page.$$('#pw-0-'+row+' ~ .ex-status .once-chip')).length>0;
const week=async w=>{await page.evaluate(w=>setWeek(w),w);await page.evaluate(()=>{S.openDays={0:true};render()});await page.waitForTimeout(80)};

// Woche 2: Vorbelegung aus Woche 1, Wechsel fragt nach
ok((await txt(0))==='Hip Thrusts Langhantel','W2 erbt Hip Thrusts Langhantel aus W1');
await pick(0,'Hip Thrust Maschine');
ok(await sheet(),'Andere Uebung als in der Vorwoche -> Rueckfrage erscheint');
const sTxt=await page.textContent('#sheet .sheet');
ok(sTxt.includes('Hip Thrust Maschine')&&sTxt.includes('statt Hip Thrusts Langhantel')&&sTxt.includes('Nur diese Woche')&&sTxt.includes('Ab jetzt im Zyklus'),'Text: neue statt alte Uebung, beide Optionen');
ok(!(await st())['cycle3__w2__d0__e0'],'Vor der Antwort wird nichts gespeichert');
// Nur diese Woche
await page.click('#sheet .sheet-btn:not(.pri)');await page.waitForTimeout(120);
let d=await st();
ok(!(await sheet())&&(await txt(0))==='Hip Thrust Maschine','"Nur diese Woche": Auswahl uebernommen, Fenster zu');
ok(d['cycle3__w2__d0__e0'].exercise==='Hip Thrust Maschine'&&d['cycle3__w2__d0__e0'].base==='Hip Thrusts Langhantel','Gespeichert mit Standard-Uebung (base)');
ok(await chip(0),'Label "nur diese Woche" an der Zeile');
ok(await page.$eval('#pw-0-0 ~ .ex-status',e=>getComputedStyle(e).display!=='none'),'Status-Zeile mit Label sichtbar');
await page.fill('.day-body .w-input >> nth=0','90');
await page.dispatchEvent('.day-body .w-input >> nth=0','change');
d=await st();ok(d['cycle3__w2__d0__e0'].weight==='90'&&d['cycle3__w2__d0__e0'].base==='Hip Thrusts Langhantel','Gewicht eintragen behaelt den einmaligen Wechsel');
// Woche 3: wieder die Standard-Uebung
await week(3);
ok((await txt(0))==='Hip Thrusts Langhantel'&&!(await chip(0)),'W3 zeigt wieder Hip Thrusts Langhantel, ohne Label');
ok((await page.textContent('#ph-0-0')).includes('zuletzt: Z3 W1'),'W3: Vorwert von Hip Thrusts Langhantel aus W1');
// Ab jetzt im Zyklus
await pick(0,'Hip Thrust Maschine');ok(await sheet(),'W3: Wechsel fragt erneut');
await page.click('#sheet .sheet-btn.pri');await page.waitForTimeout(120);
d=await st();ok(d['cycle3__w3__d0__e0'].exercise==='Hip Thrust Maschine'&&!('base' in d['cycle3__w3__d0__e0'])&&!(await chip(0)),'"Ab jetzt im Zyklus": ohne base, ohne Label');
ok((await page.textContent('#ph-0-0')).includes('zuletzt: Z3 W2'),'Vorwert der Hip Thrust Maschine aus W2 (einmaliger Wechsel zaehlt als Verlauf)');
await week(4);ok((await txt(0))==='Hip Thrust Maschine','W4 erbt die neue Uebung');
await week(6);ok((await txt(0))==='Hip Thrust Maschine','W6 (ueber leere W5 hinweg) erbt die neue Uebung');
// Nachtraeglich: W2 "nur diese Woche" -> "ab jetzt"
await week(2);ok(await chip(0),'W2 traegt weiter das Label');
await pick(0,'Hip Thrust Maschine');ok(await sheet(),'Dieselbe Uebung erneut waehlen fragt noch einmal');
await page.click('#sheet .sheet-btn.pri');await page.waitForTimeout(120);
d=await st();ok(!('base' in d['cycle3__w2__d0__e0'])&&!(await chip(0))&&d['cycle3__w2__d0__e0'].weight==='90','W2 jetzt "ab jetzt", Gewicht bleibt');
// Abbrechen / Hintergrund / Esc
await week(4);
await pick(0,'Glute Bridge Langhantel');await page.click('#sheet .sheet-cancel');await page.waitForTimeout(100);
d=await st();ok(!(await sheet())&&(await txt(0))==='Hip Thrust Maschine'&&!d['cycle3__w4__d0__e0'],'Abbrechen: nichts geaendert, nichts gespeichert');
await pick(0,'Glute Bridge Langhantel');await page.mouse.click(195,60);await page.waitForTimeout(100);
ok(!(await sheet())&&(await txt(0))==='Hip Thrust Maschine','Tipp auf den Hintergrund schliesst ohne Aenderung');
await pick(0,'Glute Bridge Langhantel');await page.keyboard.press('Escape');await page.waitForTimeout(100);
ok(!(await sheet())&&(await txt(0))==='Hip Thrust Maschine','Esc schliesst ohne Aenderung');
// Keine Frage: gleiche Uebung wie Vorwoche, nochmal gleiche Auswahl, leere Vorwoche, Woche 1
await pick(0,'Hip Thrust Maschine');d=await st();
ok(!(await sheet())&&d['cycle3__w4__d0__e0']&&d['cycle3__w4__d0__e0'].exercise==='Hip Thrust Maschine','Gleiche Uebung wie Vorwoche: keine Frage');
await pick(0,'Hip Thrust Maschine');ok(!(await sheet()),'Unveraenderte Auswahl erneut: keine Frage');
await pick(2,'Abduktionsmaschine');d=await st();
ok(!(await sheet())&&d['cycle3__w4__d0__e2'].exercise==='Abduktionsmaschine','Leere Vorwoche: keine Frage');
await week(1);await pick(1,'Kickback Maschine');d=await st();
ok(!(await sheet())&&d['cycle3__w1__d0__e1'].exercise==='Kickback Maschine','Woche 1: keine Frage');
// Leeren der Zeile: keine Frage
await week(5);await page.click('#pw-0-1 .pick-btn');await page.click('.dropdown .drop-empty-opt');await page.waitForTimeout(100);
d=await st();ok(!(await sheet())&&d['cycle3__w5__d0__e1'].exercise==='','Zeile leeren: keine Frage');
// Naechster Zyklus uebernimmt die Standard-Uebung, nicht den einmaligen Wechsel aus W12
await page.evaluate(()=>{S.data['cycle3__w12__d0__e0']={exercise:'Kickback Maschine',base:'Hip Thrust Maschine',extraSets:0,weight:'40',reps:['8']};save();setCycle('cycle4');setWeek(1);S.openDays={0:true};render()});
await page.waitForTimeout(100);
ok((await txt(0))==='Hip Thrust Maschine','Z4 W1 uebernimmt die Standard-Uebung (einmaliger Wechsel in W12 zaehlt nicht)');
// Tastatur: Pfeil + Enter loest ebenfalls die Frage aus
await page.evaluate(()=>{setCycle('cycle3');setWeek(7);S.openDays={0:true};render()});await page.waitForTimeout(80);
await page.click('#pw-0-0 .pick-btn');await page.fill('.drop-search input','bridge langhantel');await page.keyboard.press('Enter');await page.waitForTimeout(100);
ok(await sheet(),'Auswahl per Tastatur fragt ebenfalls');
await page.click('#sheet .sheet-btn:not(.pri)');await page.waitForTimeout(100);
d=await st();ok(d['cycle3__w7__d0__e0'].exercise==='Glute Bridge Langhantel'&&d['cycle3__w7__d0__e0'].base==='Hip Thrust Maschine','Tastatur + "Nur diese Woche" gespeichert');
// Layout 390 px mit offenem Fenster
await pick(0,'Kickback Maschine');
ok(await sheet()&&await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth),'Fenster offen: kein horizontales Scrollen');
await page.screenshot({path:require('path').join(require('os').tmpdir(),'peach-uebungswechsel.png')});
await page.click('#sheet .sheet-cancel');
ok(errs.length===0,'Keine JS-Fehler '+(errs.length?JSON.stringify(errs):''));
console.log(fails?'FAILS: '+fails:'ALL PASS');process.exitCode=fails?1:0;await b.close();})().catch(e=>{console.log('ABBRUCH',e.message);process.exit(1)});
