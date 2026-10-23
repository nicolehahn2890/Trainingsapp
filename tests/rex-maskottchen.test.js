// Rex als Maskottchen + Rex-Farben (23.10.2026): App-Ebene "Rex" ueber dem unveraenderten
// Peach-Designsystem. Prueft: Basis-Tokens (Designsystem) unveraendert, Rex-Kopf im Header,
// Kopf rosa mit tuerkisen Knoepfen (nie Pink auf Pink), Seite hellrosa, Tagesfarben, knallige
// Status-Farben (Rep-Felder, Badge, Haken, voller Wochenbalken), Rex in der Wochen-Karte (nur wenn
// sie sichtbar ist, Woche 1 nie), Uebersicht OHNE Rex-Bild, theme-color = Kopffarbe,
// Icon/Manifest (display:browser!), kein Ueberlauf auf 375/390/430 px.
// Peach-App Browser-Test — Aufruf ueber tests/run.sh (startet den lokalen Server).
const { chromium } = (()=>{try{return require('playwright')}catch(e){return require('/opt/node22/lib/node_modules/playwright')}})();
const PEACH_URL=process.env.PEACH_URL||'http://127.0.0.1:8765/index.html';
const BASE=PEACH_URL.replace(/index\.html$/,'');
let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};
const rgb=h=>'rgb('+[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)).join(', ')+')';
const PINK='#F6409F',CYAN='#22E3F0',YELLOW='#FAF22E',GREEN='#4FD06A',ROSE='#FA9ECC',ROSE_PALE='#FDE7F2',LILAC='#B49DF2';
(async()=>{const b=await chromium.launch();const errs=[];
// Zyklus 2 (aktueller 4-Tage-Plan): Hip Thrust (Tag A, 4-8) in Woche 1 und 2 -> Woche 2 hat einen Vergleich
const d={pv__done:1,pv__v3:1,pv__bb3:1,pv__gm3:1,pv__gx48:1,
 'cycle2__w1__d0__e0':{exercise:'Hip Thrusts Langhantel',extraSets:0,weight:'100',reps:['6','6','6']},
 'cycle2__w2__d0__e0':{exercise:'Hip Thrusts Langhantel',extraSets:0,weight:'105',reps:['6','8','3']}};
for(const W of [390,375,430]){
  const page=await (await b.newContext({viewport:{width:W,height:844}})).newPage();
  page.on('pageerror',e=>errs.push(e.message));
  await page.goto(PEACH_URL);
  await page.evaluate(d=>{localStorage.clear();localStorage.setItem('peach_mig_add','1');localStorage.setItem('peach_v4',JSON.stringify(d));localStorage.setItem('peach_ui',JSON.stringify({view:'training',week:2,cy:'cycle2',pt:'p4',openDays:{0:true}}));},d);
  await page.reload();await page.waitForLoadState('load');await page.waitForTimeout(300);
  if(W===390){
    // 1. Designsystem bleibt Basis: Tokens des Peach-Systems unveraendert
    const base=await page.evaluate(()=>{const s=getComputedStyle(document.documentElement);return['--peach','--pink','--lilac','--lime','--sky','--yellow','--cream','--bg','--ink','--green','--prog-up','--prog-same'].map(v=>s.getPropertyValue(v).trim().toUpperCase())});
    ok(base.join(',')==='#F4A45E,#F18FB6,#B49DF2,#B6DD57,#8CCBE8,#F5CB44,#FBF3E7,#E9DEF8,#181016,#6FC36A,#6FC36A,#F5CB44','Basis-Tokens = Peach-Designsystem ('+base.join(' ')+')');
    // 2. Rex-Kopf im Header, geladen, rund im ink-Rahmen
    const head=await page.evaluate(()=>{const i=document.querySelector('#header .logo-badge img.logo-rex');const bd=i&&getComputedStyle(i.parentElement);return i?{src:i.getAttribute('src'),nw:i.naturalWidth,round:bd.borderRadius,bw:bd.borderTopWidth}:null});
    ok(head&&/rex-apfel-kopf\.webp$/.test(head.src)&&head.nw===300,'Rex-Kopf im Header geladen ('+JSON.stringify(head)+')');
    // (2,5px rundet Chromium bei Pixeldichte 1 auf 2px ab)
    ok(head&&head.round==='50%'&&parseFloat(head.bw)>=2,'Rex-Kopf rund im ink-Rahmen ('+(head&&head.bw)+')');
    // 3. Kopf rosa, Seite hellrosa, theme-color = Kopffarbe
    const hdr=await page.evaluate(()=>[getComputedStyle(document.getElementById('header')).backgroundColor,getComputedStyle(document.body).backgroundColor,document.querySelector('meta[name=theme-color]').content]);
    ok(hdr[0]===rgb(ROSE)&&hdr[1]===rgb(ROSE_PALE)&&hdr[2].toUpperCase()===ROSE,'Kopf rosa, Seite hellrosa, theme-color gleich ('+hdr.join(' / ')+')');
    // 4. Knoepfe im Kopf tuerkis (aktiver Tab, aktive Plan-Pill, Pfeile) — nie Pink auf Pink
    const hb=await page.evaluate(()=>['btn-training','plan-p4'].map(id=>getComputedStyle(document.getElementById(id)).backgroundColor).concat([...document.querySelectorAll('.week-arrow')].map(e=>getComputedStyle(e).backgroundColor)));
    ok(hb.every(c=>c===rgb(CYAN)),'Kopf-Knoepfe tuerkis ('+hb.join(' | ')+')');
    // 5. Tagesfarben: A Lila, B Rex-Pink, C Rex-Gelb, D Rex-Cyan
    const days=await page.$$eval('.day-card',els=>els.map(e=>getComputedStyle(e).backgroundColor));
    ok(days.join('|')===[rgb(LILAC),rgb(PINK),rgb(YELLOW),rgb(CYAN)].join('|'),'Tagesfarben A-D ('+days.join(' | ')+')');
    const pill=await page.$eval('#dc-1',e=>[getComputedStyle(e).color,getComputedStyle(e).backgroundColor]);
    ok(pill[0]===rgb(PINK)&&pill[1]===rgb('#181016'),'Tages-Pill Tag B: Pink auf ink ('+pill.join(' / ')+')');
    // 6. Status-Farben knallig (Rexy): Rep-Felder 6 = im Bereich (gelb), 8 = Obergrenze (gruen), 3 = darunter (rot)
    const reps=await page.evaluate(()=>[0,1,2].map(i=>getComputedStyle(document.getElementById('rp-0-0-'+i)).backgroundColor));
    ok(reps.join('|')===[rgb(YELLOW),rgb(GREEN),rgb('#FF5C5C')].join('|'),'Rep-Felder Neongelb / Gruen / Rot ('+reps.join(' | ')+')');
    const st=await page.evaluate(()=>{const p=document.querySelector('#pb-0-0 .pbadge'),dn=document.getElementById('done-0-0'),bar=document.getElementById('wp-bar');
      return{badge:p&&p.textContent,bc:p&&getComputedStyle(p).backgroundColor,done:getComputedStyle(dn).backgroundColor,bar:getComputedStyle(bar).backgroundColor}});
    ok(st.badge&&st.badge.includes('Gewicht')&&st.bc===rgb(GREEN),'Badge "↑ Gewicht" gruen ('+st.bc+')');
    ok(st.done===rgb(GREEN)&&st.bar===rgb(GREEN),'Erledigt-Haken + voller Wochenbalken gruen ('+st.done+' / '+st.bar+')');
    const add=await page.$eval('.add-set-btn',e=>getComputedStyle(e).backgroundColor);
    ok(add===rgb('#B5F23D'),'Satz-hinzufuegen-Knopf Rex-Lime ('+add+')');
  }
  // 7. Wochen-Karte mit Rex (Woche 2 hat einen Vergleich)
  const wk=await page.evaluate(()=>{const box=document.getElementById('wp-box');const i=box&&box.querySelector('.wp-rex img');const r=i&&i.getBoundingClientRect(),m=box.querySelector('.wp-main').getBoundingClientRect();
    return{vis:!!box&&!box.classList.contains('hidden'),nw:i?i.naturalWidth:0,left:r?r.right<=m.left:false,pct:document.getElementById('wp-pct').textContent}});
  ok(wk.vis&&wk.nw===500&&wk.left,W+' px: Wochen-Karte sichtbar, Rex links geladen ('+JSON.stringify(wk)+')');
  // 8. Woche 1: kein Vergleich -> Karte (und damit Rex) versteckt; erster Vergleich laesst sie live erscheinen
  await page.evaluate(()=>{setWeek(1)});await page.waitForTimeout(150);
  ok(await page.evaluate(()=>document.getElementById('wp-box').classList.contains('hidden')),W+' px: Woche 1 ohne Wochen-Karte (kein Vergleich)');
  await page.evaluate(()=>{setWeek(3)});await page.waitForTimeout(150);
  ok(await page.evaluate(()=>document.getElementById('wp-box').classList.contains('hidden')),W+' px: Woche 3 ohne Eintraege: Karte versteckt');
  await page.evaluate(()=>{updW(0,0,'110');updRep(0,0,0,'6')});await page.waitForTimeout(100);
  const live=await page.evaluate(()=>{const box=document.getElementById('wp-box');return{vis:!box.classList.contains('hidden'),rex:!!box.querySelector('.wp-rex img'),pct:document.getElementById('wp-pct').textContent}});
  ok(live.vis&&live.rex&&live.pct==='100%',W+' px: Erster Vergleich in Woche 3 -> Karte mit Rex erscheint live ('+JSON.stringify(live)+')');
  ok(await page.evaluate(W=>document.documentElement.scrollWidth<=W,W),W+' px: Training ohne horizontalen Ueberlauf');
  // 9. Uebersicht: kein Rex-Bild (Wunsch: dort waere es zu viel), Balken andere Wochen rosa, aktuelle Woche Pink
  await page.evaluate(()=>{setView('overview')});await page.waitForTimeout(200);
  const ov=await page.evaluate(()=>{const v=document.getElementById('view-overview');const fills=[...v.querySelectorAll('.ov-ex')][0].querySelectorAll('.ov-bar-fill');
    return{imgs:v.querySelectorAll('img').length,w1:getComputedStyle(fills[0]).backgroundColor,w3:getComputedStyle(fills[2]).backgroundColor}});
  ok(ov.imgs===0,W+' px: Uebersicht ohne Rex-Bild');
  if(W===390)ok(ov.w1===rgb(ROSE)&&ov.w3===rgb(PINK),'Uebersicht: Woche 1 rosa, aktuelle Woche 3 Pink ('+ov.w1+' / '+ov.w3+')');
  ok(await page.evaluate(W=>document.documentElement.scrollWidth<=W,W),W+' px: Uebersicht ohne horizontalen Ueberlauf');
  await page.context().close();
}
// 10. Dateien + Manifest: Icon 180x180, Manifest bleibt display:browser (sonst sind die Daten auf dem iPhone scheinbar weg)
const ctx=await b.newContext();const st={r:{}};
for(const f of ['rex-apfel.webp','rex-apfel-kopf.webp','apple-touch-icon.png?v=rex','manifest.json'])st.r[f]=(await ctx.request.get(BASE+f)).status();
const m=JSON.parse(await (await ctx.request.get(BASE+'manifest.json')).text());
const png=await (await ctx.request.get(BASE+'apple-touch-icon.png?v=rex')).body(); // PNG-Kopf: Breite/Hoehe ab Byte 16
ok(Object.values(st.r).every(s=>s===200),'Bilder, Icon und Manifest werden ausgeliefert ('+JSON.stringify(st.r)+')');
ok(m.display==='browser','Manifest display bleibt "browser"');
ok(m.theme_color.toUpperCase()===ROSE&&m.background_color.toUpperCase()===ROSE_PALE&&m.icons[0].src==='apple-touch-icon.png?v=rex','Manifest: Farben = Kopf/Seite, Icon mit neuer Version');
ok(png.readUInt32BE(16)===180&&png.readUInt32BE(20)===180,'Home-Screen-Icon 180x180');
ok(errs.length===0,'keine JS-Fehler'+(errs.length?' ('+errs.slice(0,2).join(' | ')+')':''));
console.log(fails?'FAILS '+fails:'ALL PASS');process.exitCode=fails?1:0;await b.close();})();
