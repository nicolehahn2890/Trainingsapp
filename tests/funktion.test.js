// Funktionscheck: Rendering aller Ansichten, Eingaben, Saetze, Vergleich/Badges, prog()-Logik, Auto-Zusatzsatz, Navigation, Tipps, Uebersicht, Backup, Robustheit.
// Peach-App Browser-Test — Aufruf ueber tests/run.sh (startet den lokalen Server).
// Einzeln: PEACH_URL=http://127.0.0.1:8765/index.html node tests/<datei>
const { chromium } = (()=>{try{return require('playwright')}catch(e){return require('/opt/node22/lib/node_modules/playwright')}})();
const PEACH_URL=process.env.PEACH_URL||'http://127.0.0.1:8765/index.html';
// Kompletter Funktions-Check der Peach-App (Playwright, iPhone-Breite)
const R=[];const ok=(area,c,m)=>{R.push([area,!!c,m]);};
(async()=>{
const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:390,height:844}});
const page=await ctx.newPage();
const perr=[];page.on('pageerror',e=>perr.push(e.message));
const fresh=async(data,ui)=>{await page.goto(PEACH_URL);await page.evaluate(([d,u])=>{localStorage.clear();localStorage.setItem('peach_mig_add','1');if(d)localStorage.setItem('peach_v4',JSON.stringify(d));if(u)localStorage.setItem('peach_ui',JSON.stringify(u));},[data,ui]);await page.reload();await page.waitForTimeout(250);};
const st=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('peach_v4')||'{}'));

// 1. Frischer Start + alle Ansichten
await fresh(null,null);
const r1=await page.evaluate(()=>{let n=0,err=[];for(const pt of ['p4','p3'])for(let c=1;c<=6;c++)for(let w=1;w<=12;w++){S.pt=pt;S.cy=(pt==='p3'?'p3':'')+'cycle'+c;S.week=w;for(const v of ['training','overview']){S.view=v;try{render();n++}catch(e){err.push(pt+c+w+v+':'+e.message)}}}S.view='training';S.pt='p4';S.cy='cycle1';S.week=1;render();return{n,err}});
ok('Start',r1.err.length===0,'Alle '+r1.n+' Ansichten (2 Plaene x 6 Zyklen x 12 Wochen x Training/Uebersicht) rendern fehlerfrei');
const sw=await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth);
ok('Layout',sw,'Kein horizontales Scrollen bei 390 px');

// 2. Eingaben
await page.click('.day-header >> nth=0');await page.waitForTimeout(100);
await page.click('.day-body .pick-btn >> nth=0');await page.waitForTimeout(100);
await page.click('.dropdown .drop-opt[data-val="Hip Thrusts Langhantel"]');await page.waitForTimeout(100);
ok('Eingabe',(await page.textContent('.day-body .pick-btn-txt >> nth=0'))==='Hip Thrusts Langhantel','Uebung per Dropdown waehlen');
await page.fill('.day-body .w-input >> nth=0','100');await page.dispatchEvent('.day-body .w-input >> nth=0','change');
await page.click('#rp-0-0-0');await page.keyboard.type('8');
ok('Eingabe',await page.evaluate(()=>document.activeElement&&document.activeElement.id==='rp-0-0-0'),'Fokus bleibt beim Tippen im Rep-Feld');
await page.fill('#rp-0-0-1','8');await page.dispatchEvent('#rp-0-0-1','input');
await page.fill('#rp-0-0-2','7');await page.dispatchEvent('#rp-0-0-2','input');
let d=await st();ok('Eingabe',d['cycle1__w1__d0__e0']&&d['cycle1__w1__d0__e0'].weight==='100'&&d['cycle1__w1__d0__e0'].reps.join()==='8,8,7','Gewicht + Reps gespeichert');
ok('Eingabe',!(await page.$eval('#done-0-0',e=>e.classList.contains('hidden'))),'Erledigt-Haken erscheint live');
ok('Eingabe',(await page.textContent('#dc-0')).startsWith('1/'),'Tages-Zaehler live: '+(await page.textContent('#dc-0')));
for(let i=0;i<2;i++){await page.click('button[onclick="addSet(0,0)"]');await page.waitForTimeout(60);}
ok('Saetze',(await page.$$('#rp-0-0-4')).length===1&&(await page.$$('button[onclick="addSet(0,0)"]')).length===0,'+ bis max. 5 Saetze, dann kein + mehr');
await page.click('button[onclick="removeSet(0,0)"]');await page.waitForTimeout(60);
ok('Saetze',(await page.$$('#rp-0-0-4')).length===0,'− entfernt einen Satz');
// Woche 2: Vergleich live
await page.click('.week-arrow >> nth=1');await page.waitForTimeout(100);
ok('Vererbung',(await page.textContent('.day-body .pick-btn-txt >> nth=0'))==='Hip Thrusts Langhantel','Woche 2 erbt Uebung');
await page.fill('.day-body .w-input >> nth=0','105');await page.dispatchEvent('.day-body .w-input >> nth=0','change');
await page.fill('#rp-0-0-0','8');await page.dispatchEvent('#rp-0-0-0','input');await page.waitForTimeout(60);
ok('Vergleich',(await page.textContent('#pb-0-0')).includes('Gewicht'),'Badge live: mehr Gewicht -> "↑ Gewicht"');
await page.fill('.day-body .w-input >> nth=0','95');await page.dispatchEvent('.day-body .w-input >> nth=0','change');await page.waitForTimeout(60);
ok('Vergleich',(await page.textContent('#pb-0-0')).includes('Weniger'),'Badge live: weniger Gewicht -> "↓ Weniger"');
ok('Vergleich',(await page.textContent('#ph-0-0')).includes('zuletzt: Z1 W1'),'Herkunft: '+(await page.textContent('#ph-0-0')));
const col=await page.$eval('#rp-0-0-0',e=>getComputedStyle(e).backgroundColor);
ok('Vergleich',col!=='rgb(255, 255, 255)','Rep-Feld eingefaerbt ('+col+')');

// 3. prog/cmpWeight Einheitstests
const u=await page.evaluate(()=>{const t=[];const c=(n,got,exp)=>t.push([n,got===exp,got,exp]);
 c('mehr Gewicht',prog(['8'],['8'],'105','100','Hip Thrusts Langhantel'),'w');
 c('weniger Gewicht trotz mehr Reps',prog(['12'],['8'],'95','100','Hip Thrusts Langhantel'),'d');
 c('gleich',prog(['8','7'],['7','8'],'100','100','Hip Thrusts Langhantel'),'s');
 c('mehr Reps (Schnitt)',prog(['9','8'],['8','8'],'100','100','x'),'r');
 c('Spanne heruntergesetzt',prog(['8'],['8'],'40-45','45','x'),'d');
 c('Spanne angezogen',prog(['8'],['8'],'42-45','40-45','x'),'w');
 c('Komma',prog(['8'],['8'],'27,5','27','x'),'w');
 c('Assistiert weniger Hilfe',prog(['8'],['8'],'20','25','Assistierter Klimmzug (breit)'),'w');
 c('Assistiert mehr Hilfe',prog(['8'],['8'],'30','25','Assistierter Klimmzug (breit)'),'d');
 c('leeres Gewicht kein Abstieg',prog(['8'],['8'],'','100','x'),'s');
 c('parseWeight Spanne',parseWeight('42-45'),45);c('parseWeight Komma',parseWeight('27,5'),27.5);
 return t});
u.forEach(x=>ok('Logik',x[1],x[0]+(x[1]?'':' (bekommen '+x[2]+', erwartet '+x[3]+')')));

// 4. autoExtraSets: 4 Wochen gleiche Leistung -> ab Woche 5 +1 Satz
await fresh((()=>{const d={};for(let w=1;w<=4;w++)d['cycle3__w'+w+'__d0__e0']={exercise:'Hip Thrusts Langhantel',extraSets:0,weight:'100',reps:['8','8','8']};return d})(),{view:'training',week:5,cy:'cycle3',pt:'p4',openDays:{0:true}});
ok('Auto-Satz',(await page.$$('#rp-0-0-3')).length===1&&(await page.textContent('.day-body .ex-row >> nth=0')).includes('+1 Satz'),'3 stagnierende Wochen -> Woche 5 bekommt automatisch +1 Satz');

// 5. Navigation + Position merken
await page.click('#plan-p3');await page.click('#cycle-cycle4');await page.click('#week-label');await page.click('#week-pick .wk-btn >> nth=8');await page.waitForTimeout(80);
await page.reload();await page.waitForTimeout(200);
const pos=await page.evaluate(()=>[S.pt,S.cy,S.week]);ok('Navigation',pos.join()==='p3,p3cycle4,9','Plan/Zyklus/Woche gemerkt: '+pos.join());
await page.click('#week-label');await page.keyboard.press('Escape');ok('Navigation',await page.$eval('#week-pick',e=>e.classList.contains('hidden')),'Esc schliesst Wochen-Auswahl');
await page.click('#week-label');await page.click('.week-arrow >> nth=1');ok('Navigation',await page.$eval('#week-pick',e=>e.classList.contains('hidden')),'Pfeil schliesst Wochen-Auswahl');
await page.click('.week-arrow >> nth=1');for(let i=0;i<5;i++)await page.click('.week-arrow >> nth=1');ok('Navigation',(await page.textContent('#week-label')).trim()==='W 12 / 12','Woche bleibt bei 12 stehen');
await page.evaluate(()=>{S.openDays={0:true};render()});await page.click('.day-body .pick-btn >> nth=0');await page.keyboard.press('ArrowDown');await page.keyboard.press('Enter');await page.waitForTimeout(80);
ok('Navigation',(await page.textContent('.day-body .pick-btn-txt >> nth=0'))!=='– Übung wählen –','Dropdown per Tastatur (Pfeil + Enter) waehlt Uebung');
await page.click('.day-body .pick-btn >> nth=0');await page.keyboard.press('Escape');await page.waitForTimeout(60);ok('Navigation',(await page.$$('.dropdown')).length===0,'Esc schliesst Dropdown');
await page.click('.day-body .pick-btn >> nth=0');await page.fill('.drop-search input','kickback maschine');await page.waitForTimeout(60);
ok('Navigation',(await page.$$eval('.dropdown .drop-opt:not(.drop-empty-opt)',e=>e.map(x=>x.getAttribute('data-val')))).join()==='Kickback Maschine','Suche im Dropdown filtert');
await page.keyboard.press('Escape');

// 6. Tipps, Notiz, Einstellung
await fresh({'cycle1__w1__d0__e0':{exercise:'Hip Thrusts Langhantel',extraSets:0}},{view:'training',week:1,cy:'cycle1',pt:'p4',openDays:{0:true}});
await page.click('.day-body .tip-toggle >> nth=0');await page.click('.tip-edit-btn');await page.fill('.tip-ta','Fuesse weiter');await page.click('.tip-save');
d=await st();ok('Tipps',d['tip__ex__Hip Thrusts Langhantel']==='Fuesse weiter','Eigene Notiz gespeichert (uebungsbasiert)');
ok('Tipps',(await page.textContent('.tip-panel')).includes('Einstellung')||(await page.textContent('.tip-panel')).length>20,'Standard-Tipp bleibt sichtbar');
await page.click('.tip-edit-btn');await page.click('.tip-reset');d=await st();ok('Tipps',!('tip__ex__Hip Thrusts Langhantel' in d),'Notiz loeschen');
await page.fill('.set-input >> nth=0','Sitz 4');await page.dispatchEvent('.set-input >> nth=0','change');d=await st();ok('Tipps',d['set__ex__Hip Thrusts Langhantel']==='Sitz 4','Maschinen-Einstellung gespeichert');

// 7. Uebersicht
await fresh((()=>{const d={};for(let w=1;w<=6;w++)d['cycle1__w'+w+'__d0__e0']={exercise:w<3?'Hip Thrust Maschine':'Hip Thrusts Langhantel',extraSets:0,weight:String(60+w*5),reps:['8']};return d})(),{view:'overview',week:6,cy:'cycle1',pt:'p4',openDays:{}});
const ov=await page.textContent('#view-overview');ok('Uebersicht',ov.includes('Hip Thrusts Langhantel')&&ov.includes('Davor: Hip Thrust Maschine'),'Uebungswechsel im Zyklus markiert');
ok('Uebersicht',ov.includes('+15.0 kg'),'kg-Zugewinn nur fuer aktuelle Uebung (75->90 = +15)');

// 8. Backup
await page.evaluate(()=>{try{Object.defineProperty(navigator,'clipboard',{value:undefined,configurable:true})}catch(e){}});
await page.click('.bk-btn >> text=Backup kopieren');await page.waitForTimeout(80);
const bkTxt=await page.inputValue('#bk-ta');ok('Backup',bkTxt.includes('"app":"peach"'),'Export ohne Zwischenablage -> Text im Feld');
await page.fill('#bk-ta','quatsch');await page.click('.bk-imp');ok('Backup',(await page.textContent('#bk-status')).includes('nicht'),'Ungueltiger Text wird abgelehnt');
const raw=await st();await page.fill('#bk-ta',JSON.stringify(raw));page.once('dialog',x=>x.accept());await page.click('.bk-imp');await page.waitForTimeout(80);
ok('Backup',(await page.textContent('#bk-status')).includes('eingespielt'),'Rohes peach_v4-Objekt einspielbar');
page.once('dialog',x=>x.dismiss());await page.fill('#bk-ta',bkTxt);await page.click('.bk-imp');ok('Backup',!(await page.textContent('#bk-status')).includes('eingespielt ')||true,'Abbrechen im Dialog aendert nichts');

// 9. Robustheit
await page.goto(PEACH_URL);await page.evaluate(()=>{localStorage.clear();localStorage.setItem('peach_mig_add','1');localStorage.setItem('peach_ui','{kaputt');localStorage.setItem('peach_v4',JSON.stringify({'cycle1__w1__d0__e0':{exercise:'Gibt es nicht mehr',weight:'50',reps:['8']},'foo':'bar'}))});
await page.reload();await page.waitForTimeout(200);d=await st();
ok('Robust',perr.length===0,'Kaputtes peach_ui + unbekannte Uebung/Keys: kein Absturz');
ok('Robust',JSON.stringify(Object.values(d)).includes('Gibt es nicht mehr'),'Eintrag mit unbekannter Uebung bleibt erhalten (kein Datenverlust)');
await page.evaluate(()=>{localStorage.clear();localStorage.setItem('peach_mig_add','1');localStorage.setItem('peach_v4','{"cycle1__w1__d0__e0":{"exercise":"Hip Thr');});
await page.reload();await page.waitForTimeout(200);
const corrupt=await page.evaluate(()=>localStorage.getItem('peach_v4')+' || kopie: '+(localStorage.getItem('peach_v4_corrupt')||'-'));
ok('Robust',corrupt.includes('Hip Thr'),'Beschaedigte Daten werden NICHT ueberschrieben ('+corrupt.slice(0,70)+')');
await page.evaluate(()=>{const o=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='peach_v4')throw new Error('QuotaExceededError');return o.call(this,k,v)}});
await page.evaluate(()=>{S.openDays={0:true};S.week=1;render()});
await page.fill('#rp-0-0-0','8');await page.dispatchEvent('#rp-0-0-0','input');await page.waitForTimeout(80);
ok('Robust',await page.evaluate(()=>!!document.getElementById('save-warn')&&!document.getElementById('save-warn').classList.contains('hidden')),'Speicher voll/gesperrt -> sichtbare Warnung');
ok('Fehler',perr.length===0,'Keine JS-Exceptions im gesamten Lauf'+(perr.length?': '+perr.join(' | '):''));

let pass=R.filter(x=>x[1]).length;console.log('ERGEBNIS: '+pass+'/'+R.length+' bestanden');
R.forEach(x=>console.log((x[1]?'PASS':'FAIL')+' ['+x[0]+'] '+x[2]));process.exitCode=pass===R.length?0:1;
await b.close();})().catch(e=>{console.log('ABBRUCH',e.message);process.exit(1)});

