// Bugcheck 11.11.2026 — 13 Korrekturen + neuer Zyklus ueber "+":
//  1 Wdh.-Badge erst bei vollstaendigen Saetzen · 2 Gewicht/Einstellung sofort gespeichert, kein Schreiben in die
//  naechste Woche · 3 Uebungswechsel mit Werten (siehe uebungswechsel.test.js) · 4 Auto-Satz abwaehlbar ·
//  5 geleerte Uebung bleibt leer · 6 Zusatzsatz ueber ausgelassene Woche · 7 Notiz-Entwurf bleibt ·
//  8 assistiert 0 kg Hilfe · 9 Gewichts-Schreibweisen · 10 kaputter Eintrag loescht nichts ·
//  11 Lese-Warnung weg nach Import · 12 peach_v4 "null" · 13 Zyklus hinzufuegen
// Peach-App Browser-Test — Aufruf ueber tests/run.sh (startet den lokalen Server).
// Einzeln: PEACH_URL=http://127.0.0.1:8765/index.html node tests/bugcheck-1111.test.js
const { chromium } = (()=>{try{return require('playwright')}catch(e){return require('/opt/node22/lib/node_modules/playwright')}})();
const PEACH_URL=process.env.PEACH_URL||'http://127.0.0.1:8765/index.html';
let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};
(async()=>{const b=await chromium.launch();const page=await (await b.newContext({viewport:{width:390,height:844}})).newPage();
const errs=[];page.on('pageerror',e=>errs.push(e.message));page.on('dialog',d=>d.accept());
const FL={pv__done:1,pv__v3:1,pv__bb3:1,pv__gm3:1,pv__gx48:1};
const HT=(w,r,x)=>({exercise:'Hip Thrusts Langhantel',extraSets:x||0,weight:w,reps:r});
// d: Objekt oder Rohtext fuer peach_v4
const seed=async(d,ui)=>{await page.goto(PEACH_URL);await page.evaluate(([d,ui])=>{localStorage.clear();localStorage.setItem('peach_mig_add','1');
  localStorage.setItem('peach_v4',typeof d==='string'?d:JSON.stringify(d));localStorage.setItem('peach_ui',JSON.stringify(ui))},[d,ui]);await page.reload();await page.waitForTimeout(200)};
const UI=(w,o)=>({view:'training',week:w,cy:'cycle3',pt:'p4',openDays:{0:true},...o});
const st=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('peach_v4')));
const badge=async()=>(await page.textContent('#pb-0-0')).trim();
const sheet=()=>page.isVisible('#sheet .sheet');

// --- 1: Wdh.-Vergleich erst, wenn alle Saetze des Vorwerts eingetragen sind
await seed({...FL,cycle3__w1__d0__e0:HT('140',['8','6','5'])},UI(2));
await page.fill('#rp-0-0-0','8');
ok((await badge())===''&&await page.$eval('#wp-box',e=>e.classList.contains('hidden')),'1: nach dem 1. Satz (8 gegen 8/6/5) kein Badge, Wochenbalken zaehlt nicht mit');
await page.fill('#rp-0-0-1','6');ok((await badge())==='','1: nach 2 von 3 Saetzen weiter kein Badge');
await page.fill('#rp-0-0-2','5');ok((await badge()).includes('Gleich'),'1: alle Saetze 8/6/5 -> "= Gleich"');
await page.fill('#rp-0-0-2','6');ok((await badge()).includes('Reps')&&(await page.textContent('#wp-sub')).startsWith('1/1'),'1: 8/6/6 -> "↑ Reps", Balken 1/1');
await page.fill('#rp-0-0-1','');await page.fill('#rp-0-0-2','');await page.fill('.day-body .w-input >> nth=0','145');
ok((await badge()).includes('Gewicht'),'1: mehr Gewicht zaehlt sofort, auch mit offenen Saetzen');
await page.fill('.day-body .w-input >> nth=0','135');ok((await badge()).includes('Weniger'),'1: weniger Gewicht zaehlt sofort');
ok(await page.evaluate(()=>prog(['8'],['8','6','5'],'140','140','x')==='r'),'1: prog ohne Satzzahl (Auto-Satz) rechnet unveraendert');

// --- 2: Gewicht + Einstellung bei jedem Tastendruck gespeichert; Wochenwechsel schreibt nichts in die neue Woche
await seed({...FL,cycle3__w1__d0__e0:HT('140',['8','7','6'])},UI(2));
await page.click('.day-body .w-input >> nth=0');await page.keyboard.type('145');
ok((await st()).cycle3__w2__d0__e0.weight==='145','2: Gewicht ohne Verlassen des Feldes gespeichert');
await page.click('.day-body .set-input >> nth=0');await page.keyboard.type('Sitz 4');
ok((await st())['set__ex__Hip Thrusts Langhantel']==='Sitz 4','2: Einstellung ohne Verlassen des Feldes gespeichert');
await page.click('.day-body .w-input >> nth=0');await page.keyboard.type('0');
await page.evaluate(()=>setWeek(3));await page.waitForTimeout(100);
let d=await st();ok(d.cycle3__w2__d0__e0.weight==='1450'&&!d.cycle3__w3__d0__e0,'2: Wochenwechsel bei aktivem Gewichtsfeld -> nichts in Woche 3');
await page.evaluate(()=>{setWeek(2);S.openDays={0:true};render()});await page.click('#rp-0-0-0');await page.keyboard.type('9');
await page.evaluate(()=>setWeek(3));await page.waitForTimeout(100);
d=await st();ok(d.cycle3__w2__d0__e0.reps[0]==='9'&&!d.cycle3__w3__d0__e0,'2: Wochenwechsel bei aktivem Wdh.-Feld -> nichts in Woche 3');

// --- 4: Auto-Satz per "−" abwaehlen, per "+" zurueckholen
const stag={...FL};for(let w=1;w<=5;w++)stag['cycle3__w'+w+'__d0__e1']={exercise:'Kabel Kickback Stehend',extraSets:0,weight:'20',reps:['10','10']};
await seed(stag,UI(5));
const row=()=>page.$eval('#pw-0-1',e=>{const r=e.closest('.ex-row');return{n:r.querySelectorAll('.rep-inp').length,btn:[...r.querySelectorAll('.add-set-btn')].map(x=>x.textContent).join(''),done:!r.querySelector('.done-chip').classList.contains('hidden'),auto:r.textContent.includes('+1 Satz')}});
let r=await row();ok(r.n===3&&r.auto&&r.btn==='−+'&&!r.done,'4: W5 mit Auto-Satz: 3 Felder, "−" vorhanden, noch kein ✓');
await page.click('.ex-row:has(#pw-0-1) .add-set-btn >> nth=0');await page.waitForTimeout(80);r=await row();
ok(r.n===2&&!r.auto&&r.done&&(await st()).cycle3__w5__d0__e1.noAuto===true&&(await st()).cycle3__w5__d0__e1.extraSets===0,'4: "−" waehlt den Auto-Satz ab -> 2 Saetze, ✓, Merker noAuto');
await page.reload();await page.waitForTimeout(200);ok((await row()).n===2,'4: bleibt nach Neustart abgewaehlt');
await page.evaluate(()=>addSet(0,1));r=await row();ok(r.n===3&&r.auto&&!(await st()).cycle3__w5__d0__e1.noAuto&&(await st()).cycle3__w5__d0__e1.extraSets===0,'4: "+" holt den Auto-Satz zurueck (kein Zusatzsatz)');
await page.evaluate(()=>{addSet(0,1)});r=await row();ok(r.n===4,'4: weiteres "+" = eigener Zusatzsatz');
await page.evaluate(()=>{removeSet(0,1)});ok((await row()).n===3&&(await row()).auto,'4: "−" nimmt zuerst den eigenen Zusatzsatz');

// --- 5: bewusst geleerte Uebung bleibt nach Neustart leer
await seed({...FL,cycle3__w1__d0__e0:HT('140',['8','7','6'])},UI(2));
await page.evaluate(()=>selEx(0,0,''));await page.reload();await page.waitForTimeout(200);
ok((await page.textContent('#pw-0-0 .pick-btn-txt')).includes('wählen')&&(await st()).cycle3__w2__d0__e0.exercise==='','5: geleerte Zeile bleibt nach Neustart leer');
const k1=JSON.stringify(await st());await page.reload();await page.waitForTimeout(200);ok(JSON.stringify(await st())===k1,'5: zweiter Start aendert nichts mehr');
await page.evaluate(()=>{S.week=3;render()});ok((await page.textContent('#pw-0-0 .pick-btn-txt')).includes('wählen'),'5: Folgewoche erbt die leere Zeile');
// leerer Platzhalter in fremder Zeile weicht einem Eintrag, der dorthin gehoert
await seed({...FL,cycle3__w1__d0__e0:{exercise:'',extraSets:0},cycle3__w1__d0__e3:HT('140',['8','7','6'])},UI(1));
d=await st();ok(d.cycle3__w1__d0__e0.exercise==='Hip Thrusts Langhantel'&&!d.cycle3__w1__d0__e3,'5: Eintrag mit Uebung hat Vorrang vor dem leeren Platzhalter');

// --- 6: Zusatzsatz ueber ausgelassene Woche
await seed({...FL,cycle3__w1__d0__e0:HT('140',['8','7','6','5'],1)},UI(3));
ok(await page.evaluate(()=>exState(0,0).ms)===4&&(await page.$$('#rp-0-0-3')).length===1,'6: W3 (W2 leer) erbt den Zusatzsatz aus W1');
await page.fill('#rp-0-0-0','8');ok((await st()).cycle3__w3__d0__e0.extraSets===1,'6: beim Eintragen mitgespeichert');

// --- 7: Notiz-Entwurf uebersteht einen Neuaufbau
await seed({...FL,cycle3__w1__d0__e0:HT('140',['8','7','6'])},UI(2));
await page.evaluate(()=>{const k=mkt(S.cy,S.week,0,0);togTip(k);edTip(k)});
await page.fill('.tip-ta','Fersen tief');await page.evaluate(()=>addSet(0,1));
ok((await page.inputValue('.tip-ta'))==='Fersen tief','7: Entwurf bleibt nach "+" Satz');
await page.click('.tip-cancel');await page.evaluate(()=>edTip(mkt(S.cy,S.week,0,0)));ok((await page.inputValue('.tip-ta'))==='','7: Abbrechen verwirft den Entwurf');
await page.fill('.tip-ta','Neu');await page.click('.tip-save');
ok((await st())['tip__ex__Hip Thrusts Langhantel']==='Neu'&&await page.evaluate(()=>Object.keys(S.tipDraft).length===0),'7: Speichern uebernimmt und leert den Entwurf');

// --- 8: assistierte Uebung, 0 kg Hilfe
const AK=(w,r)=>({exercise:'Assistierter Klimmzug (breit)',extraSets:0,weight:w,reps:r});
await seed({...FL,cycle3__w1__d1__e2:AK('5',['10','10','10']),cycle3__w2__d1__e2:AK('0',['8','8','8'])},UI(2,{openDays:{1:true}}));
ok((await page.textContent('#pb-1-2')).includes('Hilfe')&&await page.evaluate(()=>exState(1,2).p==='w'),'8: 5 -> 0 kg Hilfe = Steigerung');
ok(await page.evaluate(()=>prog(['8'],['8'],'5','0','Assistierter Klimmzug (breit)')==='d'&&prog(['8'],['8'],'0','0','Assistierter Klimmzug (breit)')==='s'&&cmpWeight('0','20')===0),'8: 0 -> 5 = mehr Hilfe; 0 gegen 0 = gleich; normale Uebung mit 0 bleibt ohne Vergleich');
await page.evaluate(()=>{S.week=3;render()});
ok((await page.$$('#ih-1-2')).length===0,'8: bei 0 kg Hilfe kein Hinweis "Hilfe senken"');
await page.evaluate(()=>setView('overview'));
const ov=await page.$$eval('.ov-ex',els=>{const e=els.find(x=>x.textContent.includes('Assistierter Klimmzug'));return{t:e.textContent,h:[...e.querySelectorAll('.ov-bar-fill')].slice(0,2).map(f=>f.style.height)}});
ok(ov.t.includes('Start: 5 kg')&&ov.t.includes('Aktuell: 0 kg')&&ov.t.includes('5.0 kg Hilfe')&&ov.h[1]==='100%'&&parseInt(ov.h[0])<100,'8: Uebersicht zeigt die 0-kg-Woche als hoechsten Balken ('+ov.h.join('/')+')');

// --- 9: Gewichts-Schreibweisen
ok(await page.evaluate(()=>cmpWeight('40–42','40')===1&&cmpWeight('40/42','40')===1&&cmpWeight('40 — 42','40-42')===0&&parseWeight('40–42')===42&&parseWeight('40/42')===42),'9: langer Strich und Schraegstrich zaehlen als Spanne');
ok(await page.evaluate(()=>cmpWeight('2x20','20')===0&&cmpWeight('2 x 22,5','20')===1&&parseWeight('2x20')===20&&parseWeight('2×20')===20),'9: "2x20" zaehlt als 20');
ok(await page.evaluate(()=>cmpWeight('40-42','40')===1&&cmpWeight('42,5','40')===1&&cmpWeight('45','40-45')===1&&cmpWeight('40-45','45')===-1&&parseWeight('25-27')===27&&parseWeight('20-25',true)===20&&parseWeight('')===0),'9: bisherige Schreibweisen unveraendert');

// --- 10: kaputter Eintrag (null) loescht nichts — Start und Import
const good={cycle3__w1__d0__e0:HT('140',['8','7','6']),cycle3__w1__d1__e2:{exercise:'Latzug (breit)',weight:'40',reps:['10','9','8']}};
const bad=JSON.stringify({...FL,...good,cycle3__w1__d0__e1:null,cycle3__w1__d0__e2:{exercise:'Abduktionsmaschine',weight:'50',reps:'kaputt'}});
await seed(bad,UI(2));
let mem=await page.evaluate(()=>S.data);
ok(mem.cycle3__w1__d0__e0.weight==='140'&&mem.cycle3__w1__d1__e2.weight==='40'&&!('cycle3__w1__d0__e1' in mem)&&Array.isArray(mem.cycle3__w1__d0__e2.reps),'10: Start mit null-Eintrag: lesbare Eintraege bleiben, kaputter faellt weg');
ok(await page.evaluate(()=>localStorage.getItem('peach_v4_corrupt'))===bad&&await page.$eval('#save-warn',e=>e.classList.contains('hidden')),'10: Rohtext gesichert (peach_v4_corrupt), keine Warnung');
await page.fill('#rp-0-0-0','8');d=await st();ok(d.cycle3__w1__d0__e0.weight==='140'&&d.cycle3__w1__d1__e2.weight==='40'&&d.cycle3__w2__d0__e0.reps[0]==='8','10: naechste Eingabe speichert den vollstaendigen Stand');
await seed({...FL,cycle3__w5__d0__e0:HT('100',['8','8','8'])},UI(2,{view:'overview'}));
await page.fill('#bk-ta',JSON.stringify({app:'peach',v:1,data:JSON.parse(bad)}));await page.click('.bk-imp');await page.waitForTimeout(200);
d=await st();ok(d.cycle3__w1__d0__e0.weight==='140'&&d.cycle3__w1__d1__e2.weight==='40'&&!d.cycle3__w5__d0__e0&&(await page.textContent('#bk-status')).includes('eingespielt'),'10: Import mit null-Eintrag: alle lesbaren Eintraege da');
for(const junk of ['[1,2]','null','{"app":"peach","data":[1]}']){await page.fill('#bk-ta',junk);await page.click('.bk-imp');await page.waitForTimeout(80);
  ok((await page.textContent('#bk-status')).includes('ungültig')&&(await st()).cycle3__w1__d0__e0.weight==='140','10: Import "'+junk+'" abgelehnt, Daten unveraendert');}
// repairSlots bricht ab -> Stand davor bleibt
await seed({...FL,...good},UI(2));
ok(await page.evaluate(()=>{const o=planOf;try{window.planOf=()=>{throw new Error('x')};repairSlots()}catch(e){}finally{window.planOf=o}return S.data.cycle3__w1__d0__e0.weight==='140'&&S.data.cycle3__w1__d1__e2.weight==='40'}),'10: Abbruch in repairSlots setzt den Stand davor zurueck');

// --- 11 + 12: unlesbare Daten
await seed('{kaputt',UI(2,{view:'overview'}));
ok((await page.textContent('#save-warn')).includes('nicht gelesen'),'11: unlesbare Daten -> Warnung');
await page.fill('#bk-ta',JSON.stringify({app:'peach',v:1,data:{...FL,...good}}));await page.click('.bk-imp');await page.waitForTimeout(200);
ok(await page.$eval('#save-warn',e=>e.classList.contains('hidden'))&&await page.evaluate(()=>loadFailed===false)&&(await st()).cycle3__w1__d0__e0.weight==='140','11: nach dem Import ist die Warnung weg, Daten gespeichert');
ok(await page.evaluate(()=>localStorage.getItem('peach_v4_corrupt'))==='{kaputt','11: unlesbarer Rohtext bleibt gesichert');
for(const raw of ['null','[]','5','"x"']){await seed(raw,UI(2));
  ok((await page.$$('.day-card')).length===4&&(await page.textContent('#save-warn')).includes('nicht gelesen')&&await page.evaluate(()=>localStorage.getItem('peach_v4'))===raw,'12: peach_v4='+raw+' -> App laeuft, Warnung, nichts ueberschrieben');}

// --- 13: Zyklus ueber "+" hinzufuegen
await seed({...FL,cycle6__w12__d0__e0:HT('150',['8','8','8'])},{view:'training',week:12,cy:'cycle6',pt:'p4',openDays:{}});
ok((await page.$$('#cycle-btns .cycle-btn')).length===6&&await page.isVisible('.cycle-add'),'13: 6 Zyklen + "+"');
ok((await page.textContent('#cy-end')).includes('Für Zyklus 7')&&!(await page.textContent('#cy-end')).includes('(neu)'),'13: Banner Z6 W12 verweist auf das "+"');
await page.click('.cycle-add');ok((await sheet())&&(await page.textContent('#sheet .sheet')).includes('Zyklus 7 hinzufügen'),'13: "+" fragt nach');
await page.click('#sheet .sheet-cancel');ok((await page.$$('#cycle-btns .cycle-btn')).length===6&&!(await st()).cyc__n,'13: Abbrechen legt nichts an');
await page.click('.cycle-add');await page.click('#sheet .sheet-btn.pri');await page.waitForTimeout(150);
ok((await page.$$('#cycle-btns .cycle-btn')).length===7&&(await st()).cyc__n===7&&await page.evaluate(()=>S.cy==='cycle7'&&S.week===1)&&await page.$eval('#cycle-cycle7',e=>e.classList.contains('active')),'13: Zyklus 7 angelegt, aktiv, Woche 1');
ok(await page.$eval('#cycle-cycle7',e=>{const r=e.getBoundingClientRect(),p=e.parentNode.getBoundingClientRect();return r.left>=p.left-1&&r.right<=p.right+1}),'13: aktiver Zyklus im sichtbaren Bereich');
await page.evaluate(()=>{S.openDays={0:true};render()});
ok((await page.textContent('#pw-0-0 .pick-btn-txt'))==='Hip Thrusts Langhantel'&&(await page.textContent('#ph-0-0')).includes('Z6 W12'),'13: Zyklus 7 uebernimmt Uebung und Vorwert aus Zyklus 6');
await page.fill('#rp-0-0-0','8');await page.reload();await page.waitForTimeout(200);
ok(await page.evaluate(()=>S.cy==='cycle7')&&(await page.$$('#cycle-btns .cycle-btn')).length===7&&(await st()).cycle7__w1__d0__e0.reps[0]==='8','13: nach Neustart weiter in Zyklus 7, Eintrag gespeichert');
await page.evaluate(()=>{S.week=12;render()});ok((await page.textContent('#cy-end')).includes('Für Zyklus 8'),'13: Banner in Z7 W12 verweist auf Zyklus 8');
await page.evaluate(()=>setCycle('cycle3'));await page.evaluate(()=>{S.week=12;render()});ok((await page.textContent('#cy-end')).includes('Zyklus 4 weiter'),'13: mittlerer Zyklus: Banner wie bisher');
for(const W of [320,375,390,430]){await page.setViewportSize({width:W,height:800});await page.evaluate(()=>{for(let i=8;i<=12;i++)S.data.cyc__n=i;render()});
  const m=await page.evaluate(()=>({ov:document.documentElement.scrollWidth>window.innerWidth,add:document.querySelector('.cycle-add').getBoundingClientRect().right<=window.innerWidth,rows:new Set([...document.querySelectorAll('#cycle-btns .cycle-btn')].map(e=>Math.round(e.getBoundingClientRect().top))).size}));
  ok(!m.ov&&m.add&&m.rows===1,W+' px: 12 Zyklen in einer Zeile, "+" sichtbar, kein Seiten-Ueberlauf');}
// Backup nimmt die Zyklus-Zahl mit
await page.setViewportSize({width:390,height:844});
const bkp=JSON.stringify({app:'peach',v:1,data:await page.evaluate(()=>S.data)});
await seed({...FL},{view:'overview',week:1,cy:'cycle1',pt:'p4',openDays:{}});
await page.fill('#bk-ta',bkp);await page.click('.bk-imp');await page.waitForTimeout(200);
ok((await page.$$('#cycle-btns .cycle-btn')).length===12,'13: Backup-Import stellt die Zyklen wieder her');

ok(errs.length===0,'keine JS-Fehler'+(errs.length?': '+errs.join(' | '):''));
console.log(fails?'FAILS '+fails:'ALL PASS');process.exitCode=fails?1:0;await b.close();
})().catch(e=>{console.log('ABBRUCH '+e.message);process.exit(1)});
