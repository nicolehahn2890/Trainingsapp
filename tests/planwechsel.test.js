// Plan-Versionen: alte Zyklen behalten alten Plan, neue Zyklen neuen Plan, Uebernahme der Uebungen, Reihenfolge, Bauch zuletzt, Leg Curls nur unter Beinbeuger, Backup-Import, Wochen-Auswahl.
// Peach-App Browser-Test — Aufruf ueber tests/run.sh (startet den lokalen Server).
// Einzeln: PEACH_URL=http://127.0.0.1:8765/index.html node tests/<datei>
const { chromium } = (()=>{try{return require('playwright')}catch(e){return require('/opt/node22/lib/node_modules/playwright')}})();
const PEACH_URL=process.env.PEACH_URL||'http://127.0.0.1:8765/index.html';
let fails=0; const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m); if(!c)fails++;};
(async()=>{
  const b=await chromium.launch();
  const ctx=await b.newContext({viewport:{width:390,height:844}});
  const page=await ctx.newPage();
  const errs=[]; page.on('pageerror',e=>errs.push(e.message)); 
  await page.goto(PEACH_URL);
  // Altdaten im ALTEN Layout erzeugen: p3cycle2 W1-12 (aktueller 3-Tage-Zyklus), cycle1 W1-12 (4 Tage)
  const legacy=await page.evaluate(()=>{
    const pick={"Glute Max":["Hip Thrusts Langhantel","Kabel Kickback Stehend","Hip Thrust Maschine"],"Glute Med":["Abduktionsmaschine","Kabel Abduktion Stehend"],"Glute & Hams":["RDL Langhantel","Leg Curls liegend","Glute Hyperextensions"],"Glute & Quad":["Split Squat Kurzhantel","Reverse Lunge"],"Adduktoren":["Adduktionsmaschine"],"Rücken":["Latzug (breit)","Rudermaschine (Panatta)"],"Brust":["Butterfly Maschine"],"Schultern":["KH Seitheben"],"Bauch":["Panatta Super Crunch","Pallof Press"],"Bizeps":["SZ Curls"],"Trizeps":["Pushdown Kabel"]};
    const d={};
    const fill=(cy,pl)=>pl.forEach((day,di)=>{const cnt={};day.e.forEach((sl,ei)=>{const i=cnt[sl.c]=(cnt[sl.c]||0);cnt[sl.c]++;const ex=pick[sl.c][i%pick[sl.c].length];
      for(let w=1;w<=12;w++){d[cy+'__w'+w+'__d'+di+'__e'+ei]={exercise:ex,extraSets:0,weight:String(40+w+ei),reps:Array.from({length:sl.s},()=>String(sl.r[1]))};}})});
    fill('p3cycle2',P3_V1); fill('cycle1',P4_V1);
    d['tip__ex__Hip Thrusts Langhantel']='Meine Notiz'; d['set__ex__Leg Curls liegend']='Sitz 4';
    return d;
  });
  await page.evaluate(d=>{localStorage.clear();localStorage.setItem('peach_mig_add','1');localStorage.setItem('peach_v4',JSON.stringify(d));localStorage.setItem('peach_ui',JSON.stringify({view:'training',week:12,cy:'p3cycle2',pt:'p3',openDays:{}}));},legacy);
  await page.reload(); await page.waitForTimeout(300);
  let st=await page.evaluate(()=>JSON.parse(localStorage.getItem('peach_v4')));
  ok(st.pv__p3cycle2===1&&st.pv__cycle1===1&&st.pv__done===1,'Alte Zyklen markiert (pv__p3cycle2, pv__cycle1, pv__done)');
  ok(!st.pv__p3cycle3&&!st.pv__cycle2,'Leere Zyklen NICHT markiert');
  const strip=o=>{const c={...o};Object.keys(c).filter(k=>k.startsWith('pv__')).forEach(k=>delete c[k]);return JSON.stringify(Object.keys(c).sort().map(k=>[k,c[k]]))};
  ok(strip(st)===strip(legacy),'Alle Altdaten unveraendert (inkl. Leg Curls in alter Glute-&-Hams-Zeile, Notiz, Einstellung)');
  // Wochen-Auswahl
  await page.click('#week-label'); await page.waitForTimeout(120);
  let wk=await page.$$eval('#week-pick .wk-btn',e=>e.map(x=>x.className));
  ok(wk.length===12&&wk[11].includes('cur')&&wk[0].includes('has'),'Wochen-Auswahl: 12 Wochen, W12 aktuell, W1 mit Eintraegen markiert');
  await page.click('#week-pick .wk-btn >> nth=6'); await page.waitForTimeout(150);
  ok((await page.textContent('#week-label')).trim()==='W 7 / 12'&&await page.$eval('#week-pick',e=>e.classList.contains('hidden')),'Tipp auf 7 springt direkt zu Woche 7 und schliesst');
  await page.click('#week-label'); await page.waitForTimeout(80);
  await page.click('#content',{position:{x:30,y:300}}).catch(()=>{}); await page.waitForTimeout(80);
  ok(await page.$eval('#week-pick',e=>e.classList.contains('hidden')),'Tipp daneben schliesst die Wochen-Auswahl');
  await page.evaluate(()=>{S.week=12;saveUI();render()});
  // Alter Zyklus zeigt alten Plan
  let labels=await page.$$eval('.day-title',e=>e.map(x=>x.textContent));
  ok(labels.join('|')==='Tag A – Ganzkörper|Tag B – Ganzkörper|Tag C – Ganzkörper','p3cycle2 zeigt alten Plan: '+labels.join(' | '));
  await page.click('.day-header >> nth=1'); await page.waitForTimeout(150);
  let picks=await page.$$eval('.day-body .pick-btn-txt',e=>e.map(x=>x.textContent));
  ok(picks.length===10&&picks[0]==='RDL Langhantel'&&picks[1]==='Leg Curls liegend','Alter Tag B: 10 Zeilen, Leg Curls liegend bleibt in Glute-&-Hams-Zeile: '+picks.slice(0,3).join(', '));
  let banner=await page.textContent('#view-training');
  ok(banner.includes('Danach startet Zyklus 3 mit dem neuen Plan'),'Woche-12-Hinweis nennt neuen Plan ab Zyklus 3');
  // Zyklus 3 -> neuer Plan + Uebernahme
  await page.click('#cycle-cycle3'); await page.click('.week-arrow >> nth=0'); 
  for(let i=0;i<12;i++){await page.click('.week-arrow >> nth=0');}
  await page.waitForTimeout(150);
  labels=await page.$$eval('.day-title',e=>e.map(x=>x.textContent));
  ok(labels.join('|')==='Tag A – Po Kraft|Tag B – Po & Beinrückseite|Tag C – Hüfte & Sanduhr','p3cycle3 zeigt neuen Plan: '+labels.join(' | '));
  const cnts=await page.$$eval('.day-count',e=>e.map(x=>x.textContent));
  ok(cnts.join('|')==='0/8 Übungen|0/8 Übungen|0/9 Übungen','Neue Tage 8/8/9 Uebungen: '+cnts.join(' | '));
  const dayRows=async di=>{await page.click('.day-header >> nth='+di);await page.waitForTimeout(120);return page.$$eval('.day-body .ex-row',rows=>rows.map(r=>[r.querySelector('.cat-badge').textContent,r.querySelector('.pick-btn-txt').textContent,r.querySelector('.sets-info').textContent.split(' Reps')[0]]))};
  const A=await dayRows(0),B=await dayRows(1),C=await dayRows(2);
  console.log('  A:',JSON.stringify(A));console.log('  B:',JSON.stringify(B));console.log('  C:',JSON.stringify(C));
  const upper=['Rücken','Schultern','Brust','Bizeps','Trizeps'];
  const rank=c=>c==='Glute Max'?0:c==='Glute Med'?1:c==='Bauch'?4:upper.includes(c)?3:2;
  ok([A,B,C].every(d=>d.every((r,i)=>i===0||rank(d[i-1][0])<=rank(r[0]))),'Reihenfolge: Glute Max, Glute Med, Rest, Oberkoerper, Bauch');
  ok([A,B,C].every(d=>d[d.length-1][0]==='Bauch'&&d[d.length-1][2].startsWith('2 Sätze')),'Jeder Tag endet mit Bauch 2 Saetze');
  ok(A[0][1]==='Hip Thrusts Langhantel','Uebernahme: Glute Max 4-8 -> Hip Thrusts Langhantel');
  const bb=B.find(r=>r[0]==='Beinbeuger'); ok(bb&&bb[1]==='Leg Curls liegend','Uebernahme: Leg Curls aus alter G&H-Zeile landen im Beinbeuger-Platz');
  const gh=B.find(r=>r[0]==='Glute & Hams'); ok(gh&&gh[1]!=='Leg Curls liegend'&&gh[1]!=='– Übung wählen –','Glute & Hams bekommt Hueftbeuge-Uebung: '+(gh&&gh[1]));
  const bs=C.find(r=>r[0]==='Beinstrecker'); ok(bs&&bs[1]==='– Übung wählen –','Beinstrecker (neu) bleibt leer');
  const gm=C.filter(r=>r[0]==='Glute Med').map(r=>r[1]); ok(gm.length===2&&gm[0]!==gm[1],'Tag C: zwei Glute-Med-Plaetze ohne Dopplung: '+gm.join(' / '));
  st=await page.evaluate(()=>JSON.parse(localStorage.getItem('peach_v4')));
  ok(!Object.keys(st).some(k=>k.startsWith('p3cycle3')),'Uebernahme ist nur Vorbelegung (nichts gespeichert)');
  // Dropdowns: keine doppelten Leg Curls
  await page.click('.day-header >> nth=1'); await page.waitForTimeout(120);
  const ghi=B.findIndex(r=>r[0]==='Glute & Hams');
  await page.click('.day-body .pick-btn >> nth='+ghi); await page.waitForTimeout(120);
  let opts=await page.$$eval('.dropdown .drop-opt:not(.drop-empty-opt)',e=>e.map(x=>x.getAttribute('data-val')));
  ok(opts.length===8&&!opts.some(o=>/Curl/.test(o)),'Glute & Hams Dropdown ohne Leg Curls ('+opts.length+')');
  await page.keyboard.press('Escape'); await page.click('body',{position:{x:5,y:5}}); await page.waitForTimeout(100);
  const bi=B.findIndex(r=>r[0]==='Beinbeuger');
  await page.click('.day-body .pick-btn >> nth='+bi); await page.waitForTimeout(120);
  opts=await page.$$eval('.dropdown .drop-opt:not(.drop-empty-opt)',e=>e.map(x=>x.textContent.trim()));
  ok(opts.length===4&&opts[0].startsWith('Leg Curls sitzend')&&opts[0].includes('★'),'Beinbeuger Dropdown: '+opts.join(', '));
  await page.click('body',{position:{x:5,y:5}}); await page.waitForTimeout(100);
  // Vorwert zur Orientierung in Woche 1 (Leg Curls liegend 8-12 gab es im alten P3 nicht, Hip Thrust 4-8 schon)
  await page.click('.day-header >> nth=0'); await page.waitForTimeout(120);
  const foc=await page.$$eval('.day-focus',e=>e.map(x=>x.textContent)); ok(foc.length===3&&foc[2].includes('Glute Med doppelt'),'Fokus-Zeile unter jedem neuen Tag: '+foc[0]);
  const hint=await page.textContent('#ph-0-0'); ok(hint.includes('zuletzt: Z2 W12'),'Woche 1: Herkunft des letzten Werts: '+hint.trim().slice(0,80));
  // Eintragen speichert die uebernommene Uebung
  await page.fill('#rp-0-0-0','8'); await page.dispatchEvent('#rp-0-0-0','change'); await page.waitForTimeout(100);
  st=await page.evaluate(()=>JSON.parse(localStorage.getItem('peach_v4')));
  ok(st['p3cycle3__w1__d0__e0']&&st['p3cycle3__w1__d0__e0'].exercise==='Hip Thrusts Langhantel','Eintrag speichert uebernommene Uebung');
  // Reload: bleibt neuer Plan, Daten stabil (idempotent)
  const before=JSON.stringify(st);
  await page.reload(); await page.waitForTimeout(300);
  st=await page.evaluate(()=>JSON.parse(localStorage.getItem('peach_v4')));
  ok(JSON.stringify(st)===before,'Neustart aendert nichts (idempotent)');
  labels=await page.$$eval('.day-title',e=>e.map(x=>x.textContent));
  ok(labels[0]==='Tag A – Po Kraft','Nach Neustart weiter neuer Plan in Zyklus 3 (Position gemerkt)');
  // Woche 2 erbt Uebung aus Woche 1
  await page.click('.week-arrow >> nth=1'); await page.waitForTimeout(120);
  await page.evaluate(()=>{S.openDays={0:true};render()}); await page.waitForTimeout(120);
  const w2=await page.textContent('.day-body .pick-btn-txt >> nth=0'); ok(w2==='Hip Thrusts Langhantel','Woche 2 erbt Uebung');
  // 4 Tage, Zyklus 2 (leer) -> neuer 4-Tage-Plan
  await page.click('#plan-p4'); await page.click('#cycle-cycle2'); await page.waitForTimeout(150);
  labels=await page.$$eval('.day-title',e=>e.map(x=>x.textContent));
  const c4=await page.$$eval('.day-count',e=>e.map(x=>x.textContent.replace(/[^0-9/]/g,'')));
  ok(labels.join('|')==='Tag A – Po Kraft|Tag B – Oberkörper & Po|Tag C – Po & Beinrückseite|Tag D – Po-Volumen & Beine'&&c4.join(',')==='0/7,0/8,0/8,0/7','4 Tage neu: '+labels.join(' | ')+' / '+c4.join(','));
  await page.click('#cycle-cycle1'); await page.waitForTimeout(120);
  labels=await page.$$eval('.day-title',e=>e.map(x=>x.textContent));
  ok(labels[0]==='Tag A – Beine','cycle1 (4 Tage, alt) zeigt alten Plan');
  // Zyklus 4-6 + Position merken
  await page.click('#cycle-cycle5'); await page.reload(); await page.waitForTimeout(250);
  const act=await page.$eval('.cycle-btn.active',e=>e.id); ok(act==='cycle-cycle5','Zyklus 5 waehlbar und nach Neustart gemerkt');
  // Backup-Import eines alten Backups (ohne Marker)
  await page.click('#btn-overview'); await page.waitForTimeout(150);
  await page.fill('#bk-ta',JSON.stringify({app:'peach',v:1,date:'2026-09-01',data:legacy}));
  page.once('dialog',d=>d.accept());
  await page.click('.bk-imp'); await page.waitForTimeout(200);
  st=await page.evaluate(()=>JSON.parse(localStorage.getItem('peach_v4')));
  ok(st.pv__p3cycle2===1&&st.pv__cycle1===1&&st.pv__done===1&&!st.pv__p3cycle3,'Altes Backup wird beim Einspielen markiert');
  ok(errs.length===0,'Keine JS-Fehler '+(errs.length?JSON.stringify(errs):''));
  // Screenshots
  await page.click('#btn-training'); await page.click('#plan-p3'); await page.click('#cycle-cycle3');
  await page.evaluate(()=>{S.week=1;saveUI();render()}); await page.click('.day-header >> nth=1'); await page.waitForTimeout(200);
  await page.evaluate(()=>window.scrollTo(0,0));
  await page.evaluate(()=>{S.openDays={};render()}); await page.click('#week-label'); await page.waitForTimeout(200);
  await page.evaluate(()=>{const d=JSON.parse(localStorage.getItem('peach_v4'));
    d['p3cycle4__w1__d1__e0']={exercise:'RDL Langhantel',extraSets:0,weight:'60',reps:['10','9','8']};
    d['p3cycle4__w1__d1__e1']={exercise:'Hip Thrusts Langhantel',extraSets:0,weight:'100',reps:['8','8','7']};
    localStorage.setItem('peach_v4',JSON.stringify(d));});
  await page.reload(); await page.waitForTimeout(300);
  st=await page.evaluate(()=>JSON.parse(localStorage.getItem('peach_v4')));
  const e0=st['p3cycle4__w1__d1__e0'],e3=st['p3cycle4__w1__d1__e3'];
  ok(e0&&e0.exercise==='Hip Thrusts Langhantel'&&e0.weight==='100'&&e3&&e3.exercise==='RDL Langhantel'&&e3.weight==='60'&&!st['p3cycle4__w1__d1__e1'],'Eintraege aus der ersten V2-Reihenfolge landen in der richtigen Zeile (inkl. Rep-Bereich)');
  const snap=JSON.stringify(st); await page.reload(); await page.waitForTimeout(250);
  ok(JSON.stringify(await page.evaluate(()=>JSON.parse(localStorage.getItem('peach_v4'))))===snap,'Umsortierung idempotent (zweiter Start aendert nichts)');
  // Eintrag in NEUER Reihenfolge bleibt unberuehrt
  await page.evaluate(()=>{const d=JSON.parse(localStorage.getItem('peach_v4'));d['p3cycle5__w1__d2__e1']={exercise:'Abduktionsmaschine',extraSets:0,weight:'50',reps:['12']};d['p3cycle5__w1__d2__e0']={exercise:'Hip Thrust Maschine',extraSets:0,weight:'80',reps:['10']};localStorage.setItem('peach_v4',JSON.stringify(d));});
  await page.reload(); await page.waitForTimeout(250);
  st=await page.evaluate(()=>JSON.parse(localStorage.getItem('peach_v4')));
  ok(st['p3cycle5__w1__d2__e1'].exercise==='Abduktionsmaschine'&&st['p3cycle5__w1__d2__e0'].exercise==='Hip Thrust Maschine','Eintraege in neuer Reihenfolge bleiben unberuehrt');
  console.log(fails?('FAILS: '+fails):'ALL PASS');process.exitCode=fails?1:0;
  await b.close();
})();

