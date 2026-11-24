// Trap Bar Deadlift in Glute & Hams (24.11.2026): neue Uebung mit Tipp (hueftbetont fuer Po-Fokus), ohne Stern,
// waehlbar in jeder Glute-&-Hams-Zeile, Auswahl und Gewicht werden gespeichert und in die Folgewoche vererbt.
// Peach-App Browser-Test — Aufruf ueber tests/run.sh (startet den lokalen Server).
const { chromium } = (()=>{try{return require('playwright')}catch(e){return require('/opt/node22/lib/node_modules/playwright')}})();
const PEACH_URL=process.env.PEACH_URL||'http://127.0.0.1:8765/index.html';
let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};
(async()=>{const b=await chromium.launch();const page=await (await b.newContext({viewport:{width:390,height:844}})).newPage();
const errs=[];page.on('pageerror',e=>errs.push(e.message));
await page.goto(PEACH_URL);
// cycle2 = aktueller 4-Tage-Plan: Tag A e5 Glute & Hams 2x4-8 (schwere Zeile)
const base={pv__done:1,pv__v3:1,pv__bb3:1,pv__gm3:1,pv__gx48:1};
await page.evaluate(d=>{localStorage.clear();localStorage.setItem('peach_mig_add','1');localStorage.setItem('peach_v4',JSON.stringify(d));localStorage.setItem('peach_ui',JSON.stringify({view:'training',week:1,cy:'cycle2',pt:'p4',openDays:{0:true}}));},base);
await page.reload();await page.waitForTimeout(300);
const T='Trap Bar Deadlift';
ok(await page.evaluate(T=>EXERCISES['Glute & Hams'].includes(T)&&EXERCISES['Glute & Hams'].length===9&&CATOF[T]==='Glute & Hams'&&!REC.has(T)&&!isAssist(T)&&!RETIRED[T],T),'Trap Bar Deadlift: in Glute & Hams (9 Uebungen), Kategorie bekannt, kein Stern, nicht assistiert');
ok(await page.evaluate(T=>/Stand:/.test(TIPS[T])&&/Ausführung:/.test(TIPS[T])&&/Po-Fokus/.test(TIPS[T])&&!/°/.test(TIPS[T]),T),'Tipp mit Stand + Ausfuehrung und Po-Fokus-Hinweis');
ok(await page.evaluate(()=>{const p=planOf('cycle2');return p[0].e[5].c==='Glute & Hams'&&p[0].e[5].r.join('-')==='4-8'}),'Plan unveraendert: 4-Tage Tag A Zeile 6 = Glute & Hams 4-8');
// Dropdown Tag A Glute & Hams
await page.click('#pw-0-5 .pick-btn');await page.waitForTimeout(120);
const opts=await page.$$eval('.dropdown .drop-opt:not(.drop-empty-opt)',e=>e.map(x=>({v:x.getAttribute('data-val'),t:x.textContent})));
ok(opts.length===9&&opts.some(o=>o.v===T&&!o.t.includes('★'))&&opts.some(o=>o.v==='B-Stance RDL'&&o.t.includes('★')),'Auswahl Glute & Hams: 9 Uebungen, Trap Bar Deadlift ohne Stern ('+opts.map(o=>o.v).join(', ')+')');
await page.click('.dropdown .drop-opt[data-val="'+T+'"]');await page.waitForTimeout(150);
ok(!(await page.isVisible('#sheet .sheet').catch(()=>false)),'Woche 1: keine Wechsel-Rueckfrage');
const txt=async sel=>(await page.textContent(sel).catch(()=>''));
ok((await txt('#pw-0-5 .pick-btn-txt'))===T,'Auswahl "Trap Bar Deadlift" steht in der Zeile');
// Gewicht + Reps eintragen
const exRow=await (await page.$('#pw-0-5')).evaluateHandle(e=>e.closest('.ex-row'));
await (await exRow.$('.w-input')).fill('80');
for(const r of await exRow.$$('.rep-inp'))await r.fill('7');
await page.waitForTimeout(150);
let st=await page.evaluate(()=>JSON.parse(localStorage.getItem('peach_v4')));
const e=st['cycle2__w1__d0__e5'];
ok(e&&e.exercise===T&&e.weight==='80'&&e.reps.length===2&&e.reps.every(x=>x==='7'),'Gespeichert unter cycle2__w1__d0__e5 ('+JSON.stringify(e)+')');
ok(await page.isVisible('#done-0-5'),'Erledigt-Haken nach allen Saetzen');
// Tipp oeffnen
await (await exRow.$('.tip-toggle')).click();await page.waitForTimeout(150);
ok((await page.$eval('#pw-0-5',e=>e.closest('.ex-row').textContent)).includes('hüftbetont'),'Tipp wird angezeigt');
// Woche 2: Uebung vererbt, Vorwert aus Woche 1
await page.evaluate(()=>{const u=JSON.parse(localStorage.getItem('peach_ui'));u.week=2;u.openDays={0:true};localStorage.setItem('peach_ui',JSON.stringify(u));});
await page.reload();await page.waitForTimeout(300);
ok((await txt('#pw-0-5 .pick-btn-txt'))===T,'Woche 2: Trap Bar Deadlift vererbt');
const r2=await page.$eval('#pw-0-5',e=>e.closest('.ex-row').textContent);
ok(r2.includes('(zuletzt 80)')&&r2.includes('Z2 W1'),'Woche 2: Vorwert 80 aus Z2 W1');
// Start-Korrekturen lassen den Eintrag an seiner Zeile
st=await page.evaluate(()=>JSON.parse(localStorage.getItem('peach_v4')));
ok(st['cycle2__w1__d0__e5']&&st['cycle2__w1__d0__e5'].exercise===T,'Nach Neustart: Eintrag an derselben Zeile');
ok(errs.length===0,'keine JS-Fehler '+errs.join(' | '));console.log(fails?'FAILS '+fails:'ALL PASS');process.exitCode=fails?1:0;await b.close();})();
