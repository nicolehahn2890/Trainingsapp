// Rex als Maskottchen + Rexy-Look (23.10.2026, Kit-Werte seit Version -07): App-Ebene "Rex" ueber dem
// unveraenderten Peach-Designsystem. Prueft: Basis-Tokens (Designsystem) unveraendert, Rexy-Schriften
// (Bowlby One SC + Inter), Wortmarke "PEACH" wie Rexy (gelbes Schild, 3px-Rahmen, pinker Druckversatz),
// Sanduhr-Rex als gerahmte Comic-Kachel im Kopf (Flos Hintergrund, 112 px / 104 px bis 380 px / 84 px ab
// 425 px), Kopf rosa mit tuerkisen Knoepfen, Seite hellrosa, Bloecke in Kit-Creme, Tagesfarben (A Kit-Lila)
// + Pill-Schrift, Rexy-Kategorie- und Status-Farben, Stern als Gold-Scheibe, Fokus-Ring ink,
// Wochen-Karte OHNE Rex-Bild (Woche 1 ohne Karte), Rex-Reaktionen ("Puh" bei komplettem Tag, live; "Wow"
// im Banner Woche 12, dort kein "Puh"), Uebersicht OHNE Bild mit tuerkisen Vorwochen,
// theme-color, Rexy-App-Icon/Manifest (display:browser!), kein Ueberlauf auf 375/390/430 px.
// Peach-App Browser-Test — Aufruf ueber tests/run.sh (startet den lokalen Server).
const { chromium } = (()=>{try{return require('playwright')}catch(e){return require('/opt/node22/lib/node_modules/playwright')}})();
const PEACH_URL=process.env.PEACH_URL||'http://127.0.0.1:8765/index.html';
const BASE=PEACH_URL.replace(/index\.html$/,'');
let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};
const rgb=h=>'rgb('+[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)).join(', ')+')';
const PINK='#FF199B',CYAN='#00DDE8',YELLOW='#F5FF00',LIME='#C8FF00',VIOLET='#9B5CFF',CREAM='#FFF9E5',GOLD='#FFC23D',GREEN='#4FD06A',ROSE='#FA9ECC',ROSE_PALE='#FDE7F2',INK='#181016';
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
  // Kopf: Wortmarke + Sanduhr-Rex als gerahmte Kachel (alle Breiten)
  const hd=await page.evaluate(()=>{const h=document.getElementById('header').getBoundingClientRect(),i=document.querySelector('#header img.hdr-rex'),r=i&&i.getBoundingClientRect(),s=i&&getComputedStyle(i);
    return{h:Math.round(h.height),hb:Math.round(h.bottom),src:i&&i.getAttribute('src'),nw:i?i.naturalWidth:0,rh:r?Math.round(r.height):0,rb:r?Math.round(r.bottom):0,
      bw:s&&s.borderTopWidth,rad:s&&s.borderRadius,sh:s&&s.boxShadow,fit:s&&s.objectFit,txt:document.getElementById('header').innerText}});
  ok(hd.src==='rex-sanduhr.webp'&&hd.nw===250,W+' px: Sanduhr-Rex (mit Hintergrund) im Kopf geladen ('+hd.src+', '+hd.nw+' px)');
  ok(hd.rh===(W>=425?84:W<=380?104:112),W+' px: Kachel '+hd.rh+' px hoch (bis 380 px 104, schmal 112, ab 425 px 84)');
  ok(parseFloat(hd.bw)>=2&&hd.rad==='12px'&&/3px 3px/.test(hd.sh)&&hd.fit==='cover',W+' px: Kachel im ink-Rahmen mit hartem Schatten, unverzerrt ('+[hd.bw,hd.rad,hd.sh,hd.fit].join(' / ')+')');
  ok(hd.rb<=hd.hb-2,W+' px: Kachel liegt im Kopf (Kachel '+hd.rb+' / Kopf '+hd.hb+')');
  ok(!/Project/i.test(hd.txt)&&hd.h<=200,W+' px: Kopf ohne "Project", Hoehe '+hd.h+' px (max. 200 wie vorher)');
  if(W===390){
    // 1. Designsystem bleibt Basis: Tokens des Peach-Systems unveraendert
    const base=await page.evaluate(()=>{const s=getComputedStyle(document.documentElement);return['--peach','--pink','--lilac','--lime','--sky','--yellow','--cream','--bg','--ink','--green','--prog-up','--prog-same','--cat-glute-max'].map(v=>s.getPropertyValue(v).trim().toUpperCase())});
    ok(base.join(',')==='#F4A45E,#F18FB6,#B49DF2,#B6DD57,#8CCBE8,#F5CB44,#FBF3E7,#E9DEF8,#181016,#6FC36A,#6FC36A,#F5CB44,#EE8FB4','Basis-Tokens = Peach-Designsystem ('+base.join(' ')+')');
    // 2. Wortmarke wie Rexy: "PEACH", gelbes Schild, 3px ink, pinker Druckversatz
    const wm=await page.evaluate(()=>{const e=document.querySelector('#header .wordmark'),s=e&&getComputedStyle(e);return e?{t:e.innerText,bg:s.backgroundColor,bw:s.borderTopWidth,sh:s.boxShadow,ff:s.fontFamily}:null});
    ok(wm&&wm.t==='PEACH'&&wm.bg===rgb(YELLOW)&&wm.bw==='3px'&&wm.sh.includes(rgb(PINK))&&wm.sh.includes('5px 5px')&&/^"?Bowlby One SC/.test(wm.ff),'Wortmarke PEACH wie Rexy ('+JSON.stringify(wm)+')');
    // Schriften wie Rexy: Bowlby One SC fuer Titel, Inter fuer alles andere (auch die Tages-Pill = CountPill)
    const ff=await page.evaluate(()=>[document.body,document.querySelector('.day-title'),document.getElementById('dc-0'),document.querySelector('.pick-btn')].map(e=>getComputedStyle(e).fontFamily));
    ok(/^"?Inter/.test(ff[0])&&/^"?Bowlby One SC/.test(ff[1])&&/^"?Inter/.test(ff[2])&&/^"?Inter/.test(ff[3]),'Schriften Bowlby One SC + Inter ('+ff.join(' | ')+')');
    ok(await page.evaluate(()=>[...document.querySelectorAll('link[rel=stylesheet]')].some(l=>/family=Bowlby\+One\+SC&family=Inter/.test(l.href))),'Google Fonts laedt Bowlby One SC + Inter');
    // 3. Kopf rosa, Seite hellrosa, theme-color = Kopffarbe; Knoepfe im Kopf tuerkis (nie Pink auf Pink)
    const hdr=await page.evaluate(()=>[getComputedStyle(document.getElementById('header')).backgroundColor,getComputedStyle(document.body).backgroundColor,document.querySelector('meta[name=theme-color]').content]);
    ok(hdr[0]===rgb(ROSE)&&hdr[1]===rgb(ROSE_PALE)&&hdr[2].toUpperCase()===ROSE,'Kopf rosa, Seite hellrosa, theme-color gleich ('+hdr.join(' / ')+')');
    const hb=await page.evaluate(()=>['btn-training','plan-p4'].map(id=>getComputedStyle(document.getElementById(id)).backgroundColor).concat([...document.querySelectorAll('.week-arrow')].map(e=>getComputedStyle(e).backgroundColor)));
    ok(hb.every(c=>c===rgb(CYAN)),'Kopf-Knoepfe tuerkis ('+hb.join(' | ')+')');
    // 4. Tagesfarben A-D (A = Kit-Lila); Tages-Pill (ink) mit Schrift IMMER in der Kartenfarbe, auch auf Lila/Pink (Wunsch 23.10.2026)
    const days=await page.$$eval('.day-card',els=>els.map(e=>getComputedStyle(e).backgroundColor));
    ok(days.join('|')===[rgb(VIOLET),rgb(PINK),rgb(YELLOW),rgb(CYAN)].join('|'),'Tagesfarben A-D ('+days.join(' | ')+')');
    const pills=await page.evaluate(()=>[0,1,2,3].map(i=>getComputedStyle(document.getElementById('dc-'+i)).color));
    ok(pills.join('|')===[rgb(VIOLET),rgb(PINK),rgb(YELLOW),rgb(CYAN)].join('|'),'Tages-Pills: Schrift immer in der Kartenfarbe, auch auf Lila/Pink ('+pills.join(' | ')+')');
    // Fokus-Zeile in vollem ink (mit Deckkraft kam sie auf Lila/Pink unter 4,5:1)
    ok(await page.evaluate(()=>getComputedStyle(document.querySelector('.day-focus')).opacity==='1'),'Fokus-Zeile ohne Deckkraft');
    // Bloecke (Uebungszeile, Plan-Pill im Kopf) in Kit-Creme
    const blk=await page.evaluate(()=>[document.querySelector('.ex-row'),document.getElementById('plan-p3')].map(e=>getComputedStyle(e).backgroundColor));
    ok(blk.every(c=>c===rgb(CREAM)),'Bloecke in Kit-Creme ('+blk.join(' | ')+')');
    // 5. Status-Farben knallig (Rexy): Rep-Felder 6 = im Bereich (gelb), 8 = Obergrenze (gruen), 3 = darunter (rot)
    const reps=await page.evaluate(()=>[0,1,2].map(i=>getComputedStyle(document.getElementById('rp-0-0-'+i)).backgroundColor));
    ok(reps.join('|')===[rgb(YELLOW),rgb(GREEN),rgb('#FF5C5C')].join('|'),'Rep-Felder Neongelb / Gruen / Rot ('+reps.join(' | ')+')');
    const st=await page.evaluate(()=>{const p=document.querySelector('#pb-0-0 .pbadge'),dn=document.getElementById('done-0-0'),bar=document.getElementById('wp-bar'),cat=document.querySelector('#pw-0-0').closest('.ex-row').querySelector('.cat-badge');
      return{badge:p&&p.textContent,bc:p&&getComputedStyle(p).backgroundColor,done:getComputedStyle(dn).backgroundColor,bar:getComputedStyle(bar).backgroundColor,cat:getComputedStyle(cat).backgroundColor,add:getComputedStyle(document.querySelector('.add-set-btn')).backgroundColor}});
    ok(st.badge&&st.badge.includes('Gewicht')&&st.bc===rgb(GREEN),'Badge "↑ Gewicht" gruen ('+st.bc+')');
    ok(st.done===rgb(GREEN)&&st.bar===rgb(GREEN),'Erledigt-Haken + voller Wochenbalken gruen ('+st.done+' / '+st.bar+')');
    ok(st.cat===rgb('#FA86B6'),'Kategorie Glute Max in Rexy-Farbe ('+st.cat+')');
    ok(st.add===rgb(LIME),'Satz-hinzufuegen-Knopf Rex-Lime ('+st.add+')');
    // 6. Stern als Gold-Scheibe (Text bleibt hinter dem Namen, "★" bleibt im Text)
    await page.click('#pw-0-0 .pick-btn');await page.waitForTimeout(150);
    const star=await page.evaluate(()=>{const o=[...document.querySelectorAll('.dropdown .drop-opt')].find(x=>x.querySelector('.rec-star'));const s=o&&o.querySelector('.rec-star');const cs=s&&getComputedStyle(s);
      return o?{starts:o.textContent.startsWith(o.getAttribute('data-val')),bw:cs.borderTopWidth,round:cs.borderRadius,w:Math.round(s.getBoundingClientRect().width),bg:cs.backgroundColor}:null});
    ok(star&&star.starts&&parseFloat(star.bw)>=2&&star.round==='50%'&&star.w===20&&star.bg===rgb(GOLD),'Empfehlungs-Stern als Gold-Scheibe hinter dem Namen ('+JSON.stringify(star)+')');
    await page.keyboard.press('Escape');await page.waitForTimeout(100);
    // 7. Fokus-Ring ink (pinker Ring verschwand auf Tag B)
    await page.keyboard.press('Tab');await page.waitForTimeout(50);
    const fr=await page.evaluate(()=>{const s=getComputedStyle(document.activeElement);return[s.outlineStyle,s.outlineColor,s.outlineWidth]});
    ok(fr[0]==='solid'&&fr[1]===rgb(INK)&&fr[2]==='3px','Fokus-Ring 3px ink ('+fr.join(' ')+')');
    // 7b. Rex-Reaktion "Puh": erscheint LIVE (ohne renderT), sobald der offene Tag komplett ist
    ok(await page.evaluate(()=>document.getElementById('rm-0').children.length===0),'Tag A unvollstaendig: kein Rex-Moment');
    const rmLive=await page.evaluate(()=>{
      const n=plan()[0].e.length;
      for(let ei=0;ei<n;ei++){
        if(!exState(0,ei).cur.exercise)selEx(0,ei,(EXERCISES[plan()[0].e[ei].c]||[])[0]);
        const st=exState(0,ei);updW(0,ei,st.cur.weight||'20');
        if(ei<n-1)for(let i=0;i<st.ms;i++)updRep(0,ei,i,'8');
      }
      const before=document.getElementById('rm-0').children.length;
      // letzter Satz der letzten Uebung -> jetzt komplett; KEIN renderT dazwischen
      const last=n-1,ms=exState(0,last).ms;for(let i=0;i<ms;i++)updRep(0,last,i,'8');
      const rm=document.querySelector('#rm-0 .rex-moment'),img=rm&&rm.querySelector('img');
      return{before:before,txt:rm?rm.innerText:'',src:img&&img.getAttribute('src'),pill:document.getElementById('dc-0').textContent};
    });
    ok(rmLive.src==='rex-puh.webp'&&/TRAINING GESCHAFFT/i.test(rmLive.txt)&&/Übungen eingetragen/.test(rmLive.txt)&&rmLive.pill.startsWith('✓'),'Tag A komplett: Rex-Moment "Puh" erscheint live ('+JSON.stringify(rmLive)+')');
    await page.waitForTimeout(150);
    const rmImg=await page.evaluate(()=>{const i=document.querySelector('#rm-0 img'),r=i.getBoundingClientRect(),m=i.closest('.rex-moment');return{nw:i.naturalWidth,w:Math.round(r.width),h:Math.round(r.height),bg:getComputedStyle(m).backgroundColor,n:document.querySelectorAll('.rex-moment').length}});
    ok(rmImg.nw===192&&rmImg.w===64&&rmImg.h===64&&rmImg.bg===rgb(CREAM)&&rmImg.n===1,'Rex-Moment: Reaktion 64 px auf Kit-Creme, genau einer ('+JSON.stringify(rmImg)+')');
    // Woche 12: Banner mit "Wow", kein "Puh" (hoechstens ein Rex-Moment pro Ansicht)
    await page.evaluate(()=>{setWeek(12)});await page.waitForTimeout(150);
    // Hip Thrust mit 110 kg: Zugewinn in der Uebersicht (unten) bleibt +10 kg
    await page.evaluate(()=>{const n=plan()[0].e.length;for(let ei=0;ei<n;ei++){if(!exState(0,ei).cur.exercise)selEx(0,ei,(EXERCISES[plan()[0].e[ei].c]||[])[0]);const st=exState(0,ei);updW(0,ei,ei?'20':'110');for(let i=0;i<st.ms;i++)updRep(0,ei,i,'8')}renderT()});
    await page.waitForTimeout(150);
    const w12=await page.evaluate(()=>{const b=document.getElementById('cy-end'),i=b&&b.querySelector('img');return{n:document.querySelectorAll('.rex-moment').length,src:i&&i.getAttribute('src'),nw:i?i.naturalWidth:0,bg:b&&getComputedStyle(b).backgroundColor,txt:b?b.innerText:'',pill:document.getElementById('dc-0').textContent}});
    ok(w12.n===1&&w12.src==='rex-wow.webp'&&w12.nw===192&&w12.bg===rgb(YELLOW)&&/LETZTE WOCHE VON ZYKLUS 2/i.test(w12.txt)&&!/🏁/.test(w12.txt)&&w12.pill.startsWith('✓'),'Woche 12: Banner mit "Wow"-Rex, kein "Puh" trotz komplettem Tag ('+JSON.stringify(w12)+')');
    await page.evaluate(()=>{setWeek(2)});await page.waitForTimeout(150);
  }
  // 8. Wochen-Karte: sichtbar mit Vergleich, OHNE Rex-Bild (der Rex steht im Kopf)
  const wk=await page.evaluate(()=>{const box=document.getElementById('wp-box');return{vis:!box.classList.contains('hidden'),imgs:box.querySelectorAll('img').length,pct:document.getElementById('wp-pct').textContent}});
  ok(wk.vis&&wk.imgs===0,W+' px: Wochen-Karte sichtbar, ohne Rex-Bild ('+JSON.stringify(wk)+')');
  await page.evaluate(()=>{setWeek(1)});await page.waitForTimeout(150);
  ok(await page.evaluate(()=>document.getElementById('wp-box').classList.contains('hidden')),W+' px: Woche 1 ohne Wochen-Karte (kein Vergleich)');
  await page.evaluate(()=>{setWeek(3)});await page.waitForTimeout(150);
  await page.evaluate(()=>{updW(0,0,'110');updRep(0,0,0,'6')});await page.waitForTimeout(100);
  ok(await page.evaluate(()=>!document.getElementById('wp-box').classList.contains('hidden')&&document.getElementById('wp-pct').textContent==='100%'),W+' px: Erster Vergleich in Woche 3 -> Wochen-Karte erscheint live');
  ok(await page.evaluate(W=>document.documentElement.scrollWidth<=W,W),W+' px: Training ohne horizontalen Ueberlauf');
  // 9. Uebersicht: kein Bild, andere Wochen tuerkis (nicht rosa), aktuelle Woche Pink, Zugewinn als gruene Pill
  await page.evaluate(()=>{setView('overview')});await page.waitForTimeout(200);
  const ov=await page.evaluate(()=>{const v=document.getElementById('view-overview');const ex=[...v.querySelectorAll('.ov-ex')][0];const fills=ex.querySelectorAll('.ov-bar-fill'),g=ex.querySelector('.gain-pill');
    return{imgs:v.querySelectorAll('img').length,w1:getComputedStyle(fills[0]).backgroundColor,w3:getComputedStyle(fills[2]).backgroundColor,gain:g?[g.textContent,getComputedStyle(g).backgroundColor]:null}});
  ok(ov.imgs===0,W+' px: Uebersicht ohne Rex-Bild');
  if(W===390){
    ok(ov.w1===rgb(CYAN)&&ov.w3===rgb(PINK),'Uebersicht: Woche 1 tuerkis, aktuelle Woche 3 Pink ('+ov.w1+' / '+ov.w3+')');
    ok(ov.gain&&ov.gain[0]==='+10.0 kg'&&ov.gain[1]===rgb(GREEN),'Uebersicht: Zugewinn als gruene Pill ('+JSON.stringify(ov.gain)+')');
  }
  ok(await page.evaluate(W=>document.documentElement.scrollWidth<=W,W),W+' px: Uebersicht ohne horizontalen Ueberlauf');
  await page.context().close();
}
// 10. Dateien + Manifest: Icon 180x180, Manifest bleibt display:browser (sonst sind die Daten auf dem iPhone scheinbar weg)
const ctx=await b.newContext();const st={r:{}};
for(const f of ['rex-sanduhr.webp','rex-puh.webp','rex-wow.webp','apple-touch-icon.png?v=rexy','manifest.json'])st.r[f]=(await ctx.request.get(BASE+f)).status();
const m=JSON.parse(await (await ctx.request.get(BASE+'manifest.json')).text());
const png=await (await ctx.request.get(BASE+'apple-touch-icon.png?v=rexy')).body(); // PNG-Kopf: Breite/Hoehe ab Byte 16
ok(Object.values(st.r).every(s=>s===200),'Rex-Bilder, Icon und Manifest werden ausgeliefert ('+JSON.stringify(st.r)+')');
ok(m.display==='browser','Manifest display bleibt "browser"');
ok(m.theme_color.toUpperCase()===ROSE&&m.background_color.toUpperCase()===ROSE_PALE&&m.icons[0].src==='apple-touch-icon.png?v=rexy','Manifest: Farben = Kopf/Seite, Icon mit neuer Version');
ok(png.readUInt32BE(16)===180&&png.readUInt32BE(20)===180,'Home-Screen-Icon 180x180');
ok(errs.length===0,'keine JS-Fehler'+(errs.length?' ('+errs.slice(0,2).join(' | ')+')':''));
console.log(fails?'FAILS '+fails:'ALL PASS');process.exitCode=fails?1:0;await b.close();})();
