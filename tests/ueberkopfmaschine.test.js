// Ueberkopfmaschine nach Hersteller (27.11.2026): in der Schulter-Auswahl nur noch "Überkopfmaschine (Panatta)" und
// "Überkopfmaschine (Precor)". Die bisherige allgemeine Maschine war die Precor (Wunsch): migUeberkopf benennt alte
// Eintraege (exercise + base), Einstellung und Notiz auf "Überkopfmaschine (Precor)" um — Vorwerte laufen weiter.
// Der alte Name bleibt in RETIRED (Kategorie + Tipp-Kopie). Auch beim Backup-Import.
// Peach-App Browser-Test — Aufruf ueber tests/run.sh (startet den lokalen Server).
const { chromium } = (()=>{try{return require('playwright')}catch(e){return require('/opt/node22/lib/node_modules/playwright')}})();
const PEACH_URL=process.env.PEACH_URL||'http://127.0.0.1:8765/index.html';
let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};
const sortKeys=o=>JSON.stringify(Object.keys(o).sort().map(k=>[k,o[k]]));
(async()=>{const b=await chromium.launch();const page=await (await b.newContext({viewport:{width:390,height:844}})).newPage();
const errs=[];page.on('pageerror',e=>errs.push(e.message));
await page.goto(PEACH_URL);
// cycle2 = aktueller 4-Tage-Plan: Tag B e4 Schultern 3x8-12, Tag B e5 Schultern 2x8-12.
// cycle1 = alter 4-Tage-Plan (Marker 1, Tag B e2 = Schultern) — auch dort wird umbenannt.
const OLD='Überkopfmaschine',PA='Überkopfmaschine (Panatta)',PR='Überkopfmaschine (Precor)';
const M={pv__done:1,pv__v3:1,pv__bb3:1,pv__gm3:1,pv__gx48:1};
const d={...M,pv__cycle1:1,
 'cycle1__w12__d1__e2':{exercise:OLD,extraSets:0,weight:'17,5',reps:['12','11','10']},
 'cycle2__w1__d1__e4':{exercise:OLD,extraSets:1,weight:'20',reps:['10','10','10','9']},
 ['set__ex__'+OLD]:'Sitz 4',['tip__ex__'+OLD]:'Griffe eng'};
const setData=async(data,ui)=>{await page.evaluate(([d,u])=>{localStorage.clear();localStorage.setItem('peach_mig_add','1');localStorage.setItem('peach_v4',JSON.stringify(d));localStorage.setItem('peach_ui',JSON.stringify(u));},[data,ui]);await page.reload();await page.waitForTimeout(300);};
await setData(d,{view:'training',week:2,cy:'cycle2',pt:'p4',openDays:{1:true}});
// Auswahl + Stammdaten
ok(await page.evaluate(([OLD,PA,PR])=>{const s=EXERCISES['Schultern'];return s.length===15&&s.includes(PA)&&s.includes(PR)&&!s.includes(OLD)&&s.indexOf(PR)===s.indexOf(PA)+1&&s[s.indexOf(PA)-1]==='KH Überkopfdrücken'},[OLD,PA,PR]),'Schultern: 15 Uebungen, beide Varianten an der Stelle der allgemeinen Maschine, allgemeine raus');
ok(await page.evaluate(([OLD,PA,PR])=>RETIRED[OLD]==='Schultern'&&CATOF[OLD]==='Schultern'&&CATOF[PA]==='Schultern'&&CATOF[PR]==='Schultern',[OLD,PA,PR]),'Allgemeiner Name in RETIRED, Kategorie bleibt bekannt');
ok(await page.evaluate(([OLD,PA,PR])=>!!TIPS[OLD]&&TIPS[PA]===TIPS[OLD]&&TIPS[PR]===TIPS[OLD],[OLD,PA,PR]),'Tipps fuer beide Varianten vorhanden');
ok(await page.evaluate(([OLD,PA,PR])=>!REC.has(OLD)&&!REC.has(PA)&&!REC.has(PR)&&!isAssist(PA)&&!isAssist(PR),[OLD,PA,PR]),'Kein Stern, nicht assistiert (wie vorher)');
// Umbenennung
let st=await page.evaluate(()=>JSON.parse(localStorage.getItem('peach_v4')));
ok(JSON.stringify(st['cycle2__w1__d1__e4'])===JSON.stringify({...d['cycle2__w1__d1__e4'],exercise:PR}),'Z2 W1: Eintrag heisst jetzt Precor, Werte + Zusatzsatz unveraendert');
ok(JSON.stringify(st['cycle1__w12__d1__e2'])===JSON.stringify({...d['cycle1__w12__d1__e2'],exercise:PR}),'Alter Zyklus (Marker) ebenfalls umbenannt, Werte unveraendert');
ok(st['set__ex__'+PR]==='Sitz 4'&&st['tip__ex__'+PR]==='Griffe eng'&&!(('set__ex__'+OLD) in st)&&!(('tip__ex__'+OLD) in st),'Einstellung und Notiz auf Precor uebertragen');
ok(!Object.values(st).some(v=>v&&typeof v==='object'&&(v.exercise===OLD||v.base===OLD)),'Kein Eintrag mehr mit dem allgemeinen Namen');
ok(await page.evaluate(d=>{const c=JSON.parse(localStorage.getItem('peach_v4_pre_ukm')||'null');return c&&c['cycle2__w1__d1__e4'].exercise===d['cycle2__w1__d1__e4'].exercise},d),'Sicherheitskopie peach_v4_pre_ukm mit dem Stand davor');
// Anzeige Woche 2: Precor vererbt, Vorwert aus Woche 1, Einstellung sichtbar
const txt=async sel=>(await page.textContent(sel).catch(()=>''));
ok((await txt('#pw-1-4 .pick-btn-txt'))===PR,'Z2 W2: Zeile zeigt "Überkopfmaschine (Precor)"');
const row=await page.$eval('#pw-1-4',e=>e.closest('.ex-row').textContent);
ok(row.includes('(zuletzt 20)')&&row.includes('Z2 W1'),'Z2 W2: Vorwert 20 aus Z2 W1 laeuft weiter');
ok(await page.$eval('#pw-1-4',e=>{const i=e.closest('.ex-row').querySelector('.set-input');return !!i&&i.value==='Sitz 4'}),'Z2 W2: Einstellung "Sitz 4" steht im Feld');
ok((await page.$$eval('#pw-1-4',e=>e[0].closest('.ex-row').querySelectorAll('.rep-inp').length))===4,'Z2 W2: Zusatzsatz vererbt (4 Saetze)');
// Dropdown
await page.click('#pw-1-4 .pick-btn');await page.waitForTimeout(120);
const opts=await page.$$eval('.dropdown .drop-opt:not(.drop-empty-opt)',e=>e.map(x=>x.getAttribute('data-val')));
ok(opts.length===15&&opts.includes(PA)&&opts.includes(PR)&&!opts.includes(OLD),'Schulter-Auswahl: '+opts.join(', '));
await page.click('body',{position:{x:5,y:5}});await page.waitForTimeout(80);
// zweite Schulter-Zeile: Panatta waehlbar
await page.click('#pw-1-5 .pick-btn');await page.waitForTimeout(120);
await page.click('.dropdown .drop-opt[data-val="'+PA+'"]');await page.waitForTimeout(150);
if(await page.isVisible('#sheet .sheet').catch(()=>false)){await page.click('#sheet .sheet-btn.pri');await page.waitForTimeout(120);}
ok((await txt('#pw-1-5 .pick-btn-txt'))===PA,'Zweite Schulter-Zeile: "Überkopfmaschine (Panatta)" gespeichert');
// neuer Zyklus: Precor wird uebernommen
await page.evaluate(()=>{S.cy='cycle3';S.week=1;S.openDays={1:true};render()});
ok((await txt('#pw-1-4 .pick-btn-txt'))===PR,'Z3 W1: Schulter-Zeile uebernimmt die Precor-Variante');
// Zweiter Start aendert nichts mehr
st=await page.evaluate(()=>JSON.parse(localStorage.getItem('peach_v4')));
await page.reload();await page.waitForTimeout(300);
const st2=await page.evaluate(()=>JSON.parse(localStorage.getItem('peach_v4')));
ok(sortKeys(st)===sortKeys(st2),'Zweiter Start: Daten unveraendert (idempotent)');
// Variante hat schon eigene Einstellung/Notiz -> alte bleibt unter altem Namen stehen; einmaliger Wechsel (base)
await setData({...M,
 'cycle2__w1__d1__e4':{exercise:OLD,extraSets:0,weight:'20',reps:['10','10','10']},
 'cycle2__w2__d1__e4':{exercise:'KH Seitheben',base:OLD,extraSets:0,weight:'6',reps:['12','12','12']},
 'cycle2__w3__d1__e4':{exercise:PR,base:OLD,extraSets:0,weight:'22',reps:['9','9','9']},
 ['set__ex__'+OLD]:'Sitz 4',['set__ex__'+PR]:'Sitz 5',['tip__ex__'+OLD]:'Griffe eng'},
 {view:'training',week:4,cy:'cycle2',pt:'p4',openDays:{1:true}});
st=await page.evaluate(()=>JSON.parse(localStorage.getItem('peach_v4')));
ok(st['set__ex__'+PR]==='Sitz 5'&&st['set__ex__'+OLD]==='Sitz 4','Vorhandene Precor-Einstellung bleibt, alte bleibt unter altem Namen (nichts verloren)');
ok(st['tip__ex__'+PR]==='Griffe eng'&&!(('tip__ex__'+OLD) in st),'Notiz ohne Konflikt uebertragen');
ok(st['cycle2__w2__d1__e4'].exercise==='KH Seitheben'&&st['cycle2__w2__d1__e4'].base===PR,'Einmaliger Wechsel: base auf Precor umbenannt');
ok(st['cycle2__w3__d1__e4'].exercise===PR&&!('base' in st['cycle2__w3__d1__e4']),'base = gleiche Maschine wie exercise -> base entfernt');
ok((await txt('#pw-1-4 .pick-btn-txt'))===PR,'Z2 W4: Precor vererbt');
// Backup-Import mit altem Namen
await setData({...M},{view:'overview',week:1,cy:'cycle2',pt:'p4',openDays:{}});
await page.evaluate(([OLD,M])=>{window.confirm=()=>true;document.getElementById('bk-ta').value=JSON.stringify({app:'peach',v:1,data:{...M,'cycle2__w1__d1__e4':{exercise:OLD,extraSets:0,weight:'20',reps:['10','10','10']},['set__ex__'+OLD]:'Sitz 4'}});impBackup()},[OLD,M]);
await page.waitForTimeout(200);
st=await page.evaluate(()=>JSON.parse(localStorage.getItem('peach_v4')));
ok(st['cycle2__w1__d1__e4']&&st['cycle2__w1__d1__e4'].exercise===PR&&st['set__ex__'+PR]==='Sitz 4'&&!(('set__ex__'+OLD) in st),'Backup-Import: alter Name wird auf Precor umbenannt');
// Ohne betroffene Daten: kein Speichern, keine Sicherheitskopie
await setData({...M,'cycle2__w1__d1__e4':{exercise:'KH Seitheben',extraSets:0,weight:'6',reps:['12','12','12']}},{view:'training',week:1,cy:'cycle2',pt:'p4',openDays:{1:true}});
ok(await page.evaluate(()=>localStorage.getItem('peach_v4_pre_ukm')===null),'Ohne Ueberkopfmaschine-Daten: keine Sicherheitskopie');
ok(errs.length===0,'keine JS-Fehler '+errs.join(' | '));console.log(fails?'FAILS '+fails:'ALL PASS');process.exitCode=fails?1:0;await b.close();})();
