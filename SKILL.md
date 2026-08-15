---
name: peach-project
description: >
  Use this skill for EVERY request related to the Peach Project — a glute-focused
  fitness tracking app built in standalone HTML, deployed to GitHub Pages.
  Trigger on any mention of: "Trainingsapp", "Peach Project", "Peach App", "Glute",
  "Uebungen", "Exercise", "Deload", "Woche", "Trainingsplan", "fitness app",
  "nicolehahn2890.github.io/Trainingsapp", or any request to add/fix/style features
  in the fitness app. Also trigger when the user uploads an HTML file related to the app.
  Never skip this skill for fitness app work.
---

# Peach Project — Skill

## Wer ist die Nutzerin?

Rexi — kein Coding-Hintergrund, kein Terminal. Ausschliesslich Claude.ai. Deutsch, Du-Anrede.
Deployment: Claude-Sessions pushen direkt auf main (GitHub Pages deployt automatisch).
Fallback ohne Session: GitHub Browser-Interface (Stift-Symbol, Strg+A, Inhalt ersetzen, Commit).
Koerperdaten: 169 cm, 56 kg — Tipps und Maschinen-Einstellungen darauf zuschneiden
(mittlere Sitz-/Lehnenpositionen als Startpunkt, wenig Unterstuetzung beim assistierten Klimmzug).
Trainingsziel: Glute-Fokus + schmale Beine (Quad-Betonung vermeiden).

**WICHTIG: Aenderungen IMMER direkt auf `main` pushen — NIEMALS Feature-Branches oder Pull
Requests anlegen!** GitHub Pages deployt von `main`; nur dort wird die App live. Rexi hat das
mehrfach klargestellt: ALLES auf main, unabhaengig davon, welchen Branch eine Session/ein
Harness vorgibt. Falls eine Session auf einem anderen Branch startet (z.B. `claude/...`),
trotzdem den Stand von `origin/main` als Basis nehmen und das Ergebnis auf `main` pushen —
keine Seiten-Branches anlegen, keine PRs. Hinweis: In Web-/Cloud-Sessions kann der Push
auf main einmalig eine Sicherheitsfreigabe verlangen; dann kurz bestaetigen lassen.

---

## Was ist die App?

- Live-URL: https://nicolehahn2890.github.io/Trainingsapp/
- Repository: github.com/nicolehahn2890/Trainingsapp
- Technologie: Standalone HTML-Datei (kein Framework, kein Build-Schritt)
- Repo-Dateien: index.html (App), apple-touch-icon.png (Home-Screen-Icon),
  manifest.json (display:browser — Icon oeffnet Safari, NICHT standalone!),
  Peach_Project.pdf (Plan-Doku, 41 Seiten), SKILL.md (diese Datei)
- localStorage-Keys: peach_v4 (Trainingsdaten — NIEMALS umbenennen!),
  peach_ver (Auto-Update-Guard: Commit-SHA, fuer den bereits neu geladen wurde),
  peach_ui (zuletzt offene Position: view/week/cy/pt/openDays — getrennt von peach_v4).
  (peach_theme wurde entfernt — es gibt keinen Dark Mode mehr.)
- Gym: Workshop Fitness Barcelona, Carrer d'Avila 120, El Poblenou. Panatta, Precor, Rogue, Eleiko, TRX.

---

## Design-System

### Neobrutalism · NUR Hell (Dark Mode entfernt!)
- Die App ist seit dem Redesign **dauerhaft hell** — es gibt KEINEN Dark Mode mehr.
  Der runde Sonne/Mond-Button, applyTheme()/toggleTheme(), der Key peach_theme, der
  theme-color-Wechsel und der theme-State wurden komplett entfernt. NIEMALS wieder einen
  .light/.dark-Branch oder Theme-Umschalter einbauen.
- Design-Sprache: flache, knallige Farb-BLOECKE auf hellem Lavendel-Hintergrund,
  fast-schwarze INK-Rahmen ueberall, harte Offset-Schatten OHNE Blur, dicke 2,5px-Rahmen,
  runde Pills. KEIN Verlauf (gradient), KEIN Glow, KEIN Blur.
- ALLE Tokens liegen als CSS-Variablen in EINEM `:root` (kein :root.light/.dark mehr).
- **NIEMALS Hex-Farben hart in CSS-Klassen schreiben — immer `var(--...)`.** In JS-HTML-
  Strings Tokens als `var(--peach)` etc. nutzen; nur die datengetriebenen Farben (Kategorie
  CC, Tagesfarbe DAYBG, pbadge/rcol-Performance) sind als Hex in JS hinterlegt.
- "Press"-Interaktion: Buttons mit Klasse `nb-shadow` ruecken auf :active um translate(2px,2px)
  und ihr Schatten kollabiert auf --sh-press (1px). Neue Schatten-Buttons brauchen diese Klasse.
- Fokus-Ring (a11y): globales `:focus-visible` = 3px solid var(--focus) (Peach) + 2px Offset,
  mit !important — NICHT durch outline:none uebersteuern, der Ring soll ueberall erscheinen.
- Disabled-Buttons: globales `button:disabled` = flach & cream (var(--cream)-Hintergrund,
  var(--text-dim) Text+Rahmen, kein Schatten, kein Press-Transform, cursor not-allowed).
- Badges (.cat-badge Kategorie, .pbadge Fortschritt): 12px (von 10px erhoeht — Lesbarkeit).

### Fonts
- Display (Logo, Screen-Titel, Tag-Titel, grosse Zahlen): **Archivo Black**, UPPERCASE,
  letter-spacing -0.5 bis -1px → Token `--font-display`
- Body / UI: **Space Grotesk** (Gewichte 400–700; NICHT 800 — sonst faux-bold) → `--font-sans`
- Beide via Google Fonts CDN im <head>. Alle Inputs bleiben 16px (iOS-Anti-Zoom).

### Farb-Tokens (Auszug — vollstaendige Liste im :root von index.html)
Ink (Rahmen / Schatten / Text auf Bloecken): --ink #181016
Bright-Palette: --peach #F4A45E (Primaer), --pink #F18FB6, --lilac #B49DF2 (Header),
  --lime #B6DD57, --sky #8CCBE8, --yellow #F5CB44, --cream #FBF3E7
Seite: --bg #E9DEF8 (Lavendel). Felder: weiss #FFF mit Ink-Rahmen.
Text-Rampe: #181016 → #45343D → #5E4C55 → #7E6C76 → #A2929C
Radien: --r-sm 10 / --r-md 12 / --r-lg 16 / --r-xl 20 / --r-pill 999. Rahmenbreite --bw 2,5px.
Schatten (solid Ink, kein Blur): --sh-xs 2px / --sh-sm 3px / --sh-card 4px /
  --sh-header 0 3px / --sh-drop 5px / --sh-press 1px.

### Tagesfarben (DAYBG — je Tag-Card eine Farbe)
Tag A Peach #F4A45E · Tag B Pink #F18FB6 · Tag C Lime #B6DD57 · Tag D Sky #8CCBE8
Die Tages-Count-Pill ist ink mit der Tagesfarbe als Textfarbe (✓-Praefix wenn komplett);
in der Uebersicht ist das Tages-Label eine Pille in der jeweiligen Tagesfarbe.

### Kategorie-Farben (CC) — solide Pill, 2px Ink-Rahmen, schwarzer Uppercase-Text
  Glute Max #EE8FB4, Glute Med #B49DF2, Adduktoren #7FD1C1, Glute & Quad #E8B86A, Glute & Hams #A7D98C
  Ruecken #84C3E0, Brust #F0A0A0, Schultern #C2DB7E, Bizeps #E6C57E
  Trizeps #93B6E0, Bauch #D6D080

### Fortschritts-Farben (pbadge = solide Pill; rcol = ganzes Rep-Feld gefuellt)
  Gruen #6FC36A = Gewicht gesteigert (--prog-up)
  Blau  #5EA8E0 = Mehr Reps (--prog-reps)
  Gelb  #F5CB44 = Gleiche Leistung / Deload (--prog-same)
  Rot   #EC6A6A = Weniger als Vorwoche (--prog-down)

### Marke / Assets
Logo: Pixel-Art-Pfirsich SVG 16x16 (crispEdges), eingefasst in einen 40px Cream-Kreis-Block.
Favicon: Pfirsich-Emoji als SVG-Data-URI im <head>.
Home-Screen-Icon: apple-touch-icon.png (180x180), verlinkt mit apple-mobile-web-app-title.
  Neues Neobrutalism-Motiv: Pixel-Pfirsich in einem Cream-Kreis mit 7px Ink-Rahmen + hartem
  Schatten auf Lilac-Hintergrund (#B49DF2) — spiegelt den Header. Vollflaechig (kein
  transparenter Rand), iOS rundet die Ecken selbst. Erzeugt durch Rendern eines kleinen
  Icon-HTML mit Puppeteer (Viewport 180x180, dsf 1) -> Screenshot als PNG.
theme-color-Meta + manifest sind jetzt hell (#B49DF2 / #E9DEF8).
WICHTIG (localStorage!): Seit iOS 16.4 oeffnet Apple JEDES Home-Screen-Lesezeichen
standardmaessig als eigenstaendige Web-App mit EIGENEM (leerem) localStorage-Container —
auch ohne apple-mobile-web-app-capable. Die Trainingsdaten liegen aber in Safari!
Loesung (eingebaut): manifest.json mit "display": "browser" — damit oeffnet das Icon
wieder Safari mit den vorhandenen Daten. NIEMALS auf display:standalone aendern und
NIEMALS apple-mobile-web-app-capable hinzufuegen, sonst sind die Daten scheinbar weg.
Nach Manifest-Aenderungen muss das Icon auf dem iPhone entfernt und neu hinzugefuegt
werden (iOS liest das Manifest nur beim Hinzufuegen).
Empfohlene Uebungen (REC-Set) erhalten im Dropdown einen goldenen Stern (★).

---

## App-Architektur

### State-Objekt S
```
S = {
  cy: "cycle1",     // cycle1-3 (4-Tage-Plan) bzw. p3cycle1-3 (3-Tage-Plan)
  pt: "p4",         // Plan-Typ: "p4" (4 Tage, Default) | "p3" (3 Tage)
  week: 1,          // 1-12
  view: "training", // "training" | "overview"
  data: {},
  drop: null,
  dropSearch: "",
  tips: {},
  tipEdit: {},
  openDays: {},     // mobile-friendly: standardmaessig zu, Accordion-Stil
  animDay: null,    // Tag-Index der gerade aufgeklappt wurde (einmalige Einblend-Animation)
  dropAnim: false,  // true nur waehrend togDrop -> Dropdown-Einblend-Animation (nicht bei Suche)
}                   // (kein theme mehr — Dark Mode entfernt)
```

### Key-Formate
```
Workout:      [cycle]__w[week]__d[dayIdx]__e[exIdx]
              [cycle] = cycle1-3 (4-Tage-Plan) ODER p3cycle1-3 (3-Tage-Plan).
              Die Plaene sind dadurch komplett getrennt — NIEMALS Keys mischen/migrieren!
Tipp-Notiz:   tip__ex__[Uebungsname]  (gilt ueber alle Wochen/Tage/Zyklen!)
              WICHTIG: Seit dem Notiz-Update ist das eine ZUSAETZLICHE eigene Notiz,
              KEIN Override mehr! Der Standard-Tipp aus TIPS wird IMMER angezeigt,
              die Notiz erscheint darunter ("Deine Notiz"). savTip loescht den Key
              bei leerem Text. Vorteil: TIPS-Updates erreichen die Nutzerin immer.
Einstellung:  set__ex__[Uebungsname]  (Maschinen-Einstellung, uebungsbasiert wie Tipps)
Slot:         tip__[cycle]__w[week]__d[dayIdx]__e[exIdx]  (nur UI-State)
```

### Wichtige Funktionen
```
mk(cy,week,di,ei)       Workout-Key
mkt(cy,week,di,ei)      Slot-Key
initKey(di,ei)          Key mit Vorwoche-Daten init — IMMER statt mk() beim Schreiben!
plan()                  gibt P3 (S.pt==='p3') oder P4 (Default) zurueck
cyBase()                Zyklus ohne Plan-Praefix ('p3cycle2' -> 'cycle2') — fuer Buttons + Deload-Text
setPlan(pt)             Plan-Umschalter 'p3'/'p4' (Header-Pills "3 Tage"/"4 Tage", Klasse .plan-btn).
                        Behaellt die Zyklus-Nummer (cycle2 <-> p3cycle2), schliesst offene Tage/Dropdown,
                        speichert via saveUI(). Daten der Plaene bleiben strikt getrennt (p3-Key-Praefix).
parseWeight(w,inv)      Parst "25-27" -> 27 (oberer Wert), "27,5" -> 27.5 (Komma -> Punkt).
                        inv=true (assistierte Uebung): aus einer Spanne zaehlt der KLEINERE
                        Wert ("20-25" -> 20), weil weniger Hilfe die bessere Leistung ist.
isAssist(ex)            true fuer Uebungen aus ASSIST (Gegengewichts-Maschinen)
isWeightRange(w)        true bei echter Spanne ("42-45"), false bei Einzelwert oder "45-45"
prog(cr,pr,cw,pw,ex)    'w'|'r'|'s'|'d' Fortschritts-Status. ex nur noetig um assistierte
                        Uebungen zu erkennen (dort dreht sich die Gewichtsrichtung um).
                        Gewicht schlaegt Reps (weniger
                        Gewicht -> immer 'd'); Reps als DURCHSCHNITT pro ausgefuelltem Satz.
findLastExData(di,ei,ex) Sucht den letzten gespeicherten Wert dieser Uebung IM SELBEN
                        REP-BEREICH UEBERALL in der Historie (alle Zyklen, Wochen, Tage,
                        Positionen) — nicht mehr nur an derselben Plan-Position in Vorwochen.
                        Liefert zusaetzlich _src {pt,cy,w,di} als Herkunft. Rueckfall auf den
                        anderen Plan (nur lesend), wenn im aktuellen Plan noch nichts steht.
exOrd(cy,w,di,ei)       Reihenfolge-Wert eines Eintrags: Zyklus > Woche > Tag > Position
repRange(pt,di,ei)      Rep-Bereich eines Plan-Platzes als String ("4-8"); '' wenn es den Platz
                        im Plan nicht (mehr) gibt — solche Eintraege bleiben aus dem Index raus.
exKey(ex,rr)            Index-Schluessel "Uebung||4-8"
exIndex()               Baut/cached den Index exKey -> Eintraege (aufsteigend). Cache
                        _exIdx wird in save() verworfen — jede Datenaenderung geht durch save().
srcLabel(src)           "Z1 W5 · Tag A" (bei Plan-Rueckfall zusaetzlich "3-Tage"/"4-Tage")
rcol(v,r)               Performance-Farbe, mit der das ganze Rep-Feld gefuellt wird (leer -> weiss)
esc(s)                  HTML-escape
autoExtraSets(di,ei)    0 oder 1. Braucht 3 stagnierende WOCHENVERGLEICHE ('s'/'d') in Folge bei
                        gleicher Uebung -> greift fruehestens in WOCHE 5 (W2vsW1 + W3vsW2 + W4vsW3).
                        Der Guard "if(S.week<4)return 0" ist nur ein Early-Out. Verifiziert per Test.
toggleDay(di)           Accordion: andere Tage schliessen sich automatisch (setzt S.animDay fuer Animation)
onDS(di,ei,v)           Dropdown-Suche — stellt nach renderT() Fokus + Cursor im Suchfeld wieder her
dsKey(di,ei,e)          Tastatur im Dropdown-Suchfeld: Pfeile bewegen .hl-Highlight (Peach), Enter
                        waehlt, Esc schliesst — reines DOM-Update, kein renderT
updSetting(di,ei,v)     Speichert Maschinen-Einstellung unter set__ex__[Name] — KEIN renderT!
                        Leerer Wert loescht den Key. Feld (.set-input, Zahnrad-Symbol) erscheint
                        nur wenn eine Uebung gewaehlt ist, zwischen ex-meta und reps-row.
exDone(di,ei)           true wenn Uebung gewaehlt UND alle Saetze der aktuellen Woche Reps haben
refreshDone(di,ei)      Aktualisiert Erledigt-Haken (#done-di-ei) + Tages-Pill (#dc-di) GEZIELT im DOM
                        — wird von updRep aufgerufen, KEIN renderT (Fokus bleibt erhalten)!
exState(di,ei)          EINE Quelle fuer den Zustand einer Uebungszeile: {ex,cur,prv,ms,autoX,reps,
                        hasPrev,p,srcL}. Genutzt von renderEx, refreshProg und weekStats — dadurch
                        koennen Badge, Hinweis und Fortschrittsbalken nicht auseinanderlaufen.
                        reps ist auf ms GESCHNITTEN (entfernte Zusatzsaetze zaehlen nicht mehr mit).
hintHTML(st)            Baut die VW-Zeile ("VW: 17 kg · 12 / 12 Wdh … → Gleiche Leistung!")
refreshProg(di,ei)      Zieht Badge (#pb-di-ei), VW-Hinweis (#ph-di-ei), Rep-Feld-Farben
                        (#rp-di-ei-i) und den Wochenbalken LIVE nach — KEIN renderT.
                        Wird von updRep UND updW aufgerufen.
weekStats()             {tot,imp,pct} der aktuellen Woche, auf Basis von exState
refreshWeekBar()        Schreibt weekStats() in #wp-box/#wp-pct/#wp-bar/#wp-sub (Block existiert
                        immer, ist bei tot=0 nur .hidden)
flashView()             Sanfter Einblend-Effekt der aktiven Ansicht (Tab-/Zyklus-/Wochen-Wechsel)
saveUI()                Merkt die aktuelle Position (view/week/cy/openDays) im Key peach_ui. Wird in
                        setView/setCycle/changeWeek/toggleDay aufgerufen; beim Start wird peach_ui
                        validiert zurueck in S geladen, damit die App dort weitermacht. peach_v4 unberuehrt.
expBackup()             Backup: JSON {app:'peach',v:1,date,data:S.data} in die Zwischenablage,
                        Fallback: Text ins bk-ta-Feld + markieren. UI unten in der Uebersicht (bk-card).
impBackup()             Import: akzeptiert das Wrapper-Format ODER rohes peach_v4-Objekt. Validiert
                        Keys (__w_d_e / tip__ / set__), confirm() vor Ueberschreiben.
checkUpdate()           Auto-Update gegen iOS-Webapp-Cache: GitHub-API (commits/main) liefert Datum+SHA;
                        ist der Commit neuer als BUILD_TS, einmaliger location.replace mit ?v=sha
                        (Cache-Buster). peach_ver verhindert Reload-Schleifen. Laeuft beim Start und
                        bei visibilitychange (App aus Hintergrund), gedrosselt auf 1x/Minute.
```

### Vergleichslogik (wichtig!)
- Fortschrittsvergleich nutzt findLastExData() — vergleicht mit letztem Wert DIESER Uebung
- Der Vorwert haengt an UEBUNG + REP-BEREICH, NICHT am Platz im Plan: gesucht wird ueber alle
  Zyklen, Wochen, Tage und Positionen. Eine Uebung, die von Tag A nach Tag D wandert, vier
  Wochen pausiert oder erst im neuen Zyklus wiederkommt, behaelt ihren Vorwert. Beruecksichtigt
  werden nur Eintraege VOR der aktuellen Position (exOrd: Zyklus > Woche > Tag > Position),
  spaetere Wochen/Tage werden nie als "Vorwert" angezeigt.
- WICHTIG: Der Rep-Bereich gehoert ZWINGEND zum Vergleichsschluessel (exKey "Uebung||4-8").
  Dieselbe Uebung laeuft im 4-8er Slot mit deutlich mehr Gewicht als im 8-12er Slot (z. B.
  Hip Thrusts 134 kg vs. 115 kg) — ohne diese Trennung zieht der 8-12er Slot den viel zu
  hohen 4-8er Vorwert und meldet dauerhaft "weniger". Gibt es zu einer Uebung im aktuellen
  Rep-Bereich noch keinen Wert, wird BEWUSST gar kein Vorwert gezeigt (kein Rueckfall auf
  einen anderen Rep-Bereich). Der Bereich kommt aus dem Plan via repRange(), nicht aus den
  gespeicherten Daten — Eintraege an Plan-Positionen, die es nicht mehr gibt, fallen raus.
- Deshalb kann es auch in Woche 1 (und im neuen Zyklus) Vorwerte + Fortschritts-Badges geben.
  Die frueheren Guards `if(S.week>1)` in renderT/renderEx sind durch `hasPrev` ersetzt.
- Herkunft wird transparent angezeigt: hinter dem VW-Hinweis steht "(Z1 W5 · Tag A)".
- Plan-Trennung bleibt beim SPEICHERN strikt (p3-Praefix). Nur beim LESEN gibt es einen
  Rueckfall auf den jeweils anderen Plan, wenn im aktuellen Plan noch kein Wert existiert;
  das Label nennt dann "3-Tage"/"4-Tage".
- Wenn Uebung gewechselt wird, startet Vergleich frisch
- Gewicht: parseWeight() unterstuetzt Bereiche wie "25-27" (nimmt oberen Wert 27) und Komma wie "27,5". Auch renderOv (Uebersicht) nutzt parseWeight() — nie parseFloat(), das gibt bei "42-45" nur 42 zurueck.
- ASSISTIERTE UEBUNGEN (Set ASSIST, aktuell die beiden "Assistierter Klimmzug"-Varianten):
  Das eingetragene Gewicht ist das GEGENGEWICHT der Maschine — WENIGER ist mehr Leistung.
  Fuer diese Uebungen dreht sich alles um: prog() ('w' bei cu<pu), parseWeight nimmt aus einer
  Spanne den kleineren Wert, das Badge heisst "↓ Hilfe"/"↑ Hilfe", das Eingabefeld heisst
  "Hilfe:" statt "Gewicht:", der Hinweis sagt "Weniger Gegengewicht – staerker geworden!",
  und in der Uebersicht wird die Balkenhoehe gespiegelt (weniger Hilfe = hoeherer Balken)
  plus Bilanz als "−X kg Hilfe". Neue Maschinen dieser Art NUR in ASSIST eintragen — der
  Rest folgt automatisch.
- GEWICHT SCHLAEGT REPS: das Gewicht wird IMMER zuerst geprueft. cu>pu -> 'w', cu<pu -> 'd'
  (auch wenn dabei mehr Reps geschafft wurden — weniger Gewicht ist weniger Leistung).
  Erst bei gleichem Gewicht (oder fehlendem Vorgewicht) entscheiden die Reps.
  Ein noch LEERES Gewichtsfeld (cu=0) zaehlt NICHT als Abstieg — sonst waere jede Uebung
  waehrend der Eingabe rot.
- Spanne vs. Einzelwert: glatter Einzelwert auf gleichem Top schlaegt eine Spanne (45 > 42-45 -> 'w'), via Helper isWeightRange(). Zwei gleiche Spannen oder Einzelwerte -> kein 'w'. Gelockerte Spanne (42-45 nach glattem 45) -> kein 'w', faellt auf den Rep-Vergleich durch.
- Reps: Vergleich ueber den DURCHSCHNITT pro ausgefuelltem Satz, NICHT Satz-fuer-Satz und
  NICHT als Gesamtsumme. 12/15 zaehlt gleich wie 15/12 -> 's'. Hoeherer Schnitt -> 'r',
  niedriger -> 'd'. (Positionsweise meldete faelschlich 'd' sobald ein einzelner Satz
  niedriger war; die Gesamtsumme meldete faelschlich 'r' bei einem zusaetzlichen Satz und
  faelschlich 'd' solange die Woche erst halb ausgefuellt war.)
- Fortschritt wird nur berechnet wenn aktuelle Woche tatsaechlich Reps hat
- LIVE-AKTUALISIERUNG: Badge, VW-Hinweis, Rep-Feld-Farben und Wochenbalken werden bei jeder
  Rep- und Gewichts-Eingabe per refreshProg() nachgezogen. Ohne das zeigten sie den Stand von
  VOR der letzten Aenderung (z. B. noch "Gleiche Leistung", obwohl das Gewicht gerade reduziert
  wurde) — es sah aus, als wuerde sich die App irren. NIEMALS renderT() daraus aufrufen!
- Nur die Saetze der AKTUELLEN Satzanzahl (ms) zaehlen. Wird ein Zusatzsatz entfernt, bleibt
  seine Zahl in S.data stehen — exState schneidet reps deshalb auf ms.
- WeekProgress-Balken nutzt ebenfalls findLastExData()
- autoExtraSets bricht Streak ab wenn Uebung gewechselt wurde

### Mobile-Optimierung
- Tage standardmaessig ZUGEKLAPPT (`S.openDays[di]===true` zum Aufklappen)
- Accordion-Verhalten: aufklappen eines Tages schliesst alle anderen
- Spart Scrollen auf dem iPhone
- Alle Eingabefelder (w-input, rep-inp, drop-search input, tip-ta, set-input) haben font-size 16px —
  verhindert Auto-Zoom auf iOS! Nicht verkleinern.
- Touch-Ziele vergroessert: week-arrow 38px, add-set-btn 38px, pick-btn min-height 40px, rep-inp 46px breit

### UI-Status-Elemente (Neobrutalism)
- Tages-Pill im day-header (`#dc-[di]`, Klasse day-count): "x/y Uebungen" — ink-Pille mit der
  Tagesfarbe als Textfarbe; ✓-Praefix wenn alle Uebungen erledigt (refreshDone setzt nur den Text)
- Erledigt-Haken pro Uebung (`#done-[di]-[ei]`, Klasse done-chip): gruener Kreis mit Ink-Rahmen,
  sichtbar wenn exDone() — Toggle via hidden-Klasse
- Beide werden bei Rep-Eingabe LIVE per refreshDone() aktualisiert (gezieltes DOM-Update, kein renderT)
- Rep-Feld (.rep-inp): leer = weiss; ausgefuellt wird das GANZE Feld mit der Performance-Farbe
  gefuellt (rcol: rot unter Bereich, gelb im Bereich, gruen am/ueber Top), Text bleibt ink
- Fortschritt-Block (.week-progress): Cream-Block mit grosser %-Zahl (Archivo Black) + Kapsel-Bar
  (Peach-Fuellung, gruen bei 100%)
- Uebersicht: vertikale Kapsel-Balken (.ov-bar = Pill-Track, .ov-bar-fill von unten) —
  aktuelle Woche (S.week) Peach, andere Wochen Lilac, Wochen mit einer ANDEREN Uebung grau
  (--text-ghost). Titel = zuletzt trainierte Uebung; kg-Zugewinn und Start/Aktuell zaehlen nur
  Wochen MIT DIESER Uebung, darunter die Zeile "Davor hier: … (grau) – nicht mit eingerechnet"
- Animationen: fadeSlide (Ansicht/Tag aufklappen), dropIn (Dropdown nur beim Oeffnen, nicht bei Suche)
- Einstellungs-Feld (gelbes Zahnrad-Chip + .set-input): erscheint sobald eine Uebung gewaehlt ist,
  zwischen ex-meta und reps-row. Speichert uebungsbasiert (set__ex__Name) via updSetting() — ohne renderT
- KEIN Theme-Button mehr (Dark Mode entfernt) — der header-right enthaelt nur die beiden Tab-Pills
- Tipp-Panel: Standard-Tipp (TIPS) immer sichtbar; eigene Notiz (tip__ex__) darunter mit
  Label "Deine Notiz" (.tip-note, .tip-note-lbl); Editor bearbeitet NUR die Notiz

### Daten-Vererbung zwischen Wochen
Vererbt: exercise, extraSets — NICHT: reps, weight

---

## WICHTIGE CODING-REGELN

1. initKey statt mk() beim Schreiben verwenden
2. peach_v4 nie umbenennen
3. Neue Uebungen in EXERCISES + TIPS eintragen (TIPS-Key muss EXAKT dem EXERCISES-Namen entsprechen!), optional in REC.
   Gegengewichts-Maschinen (assistierte Klimmzuege o. ae.) ZUSAETZLICH in ASSIST eintragen —
   sonst wird ihr Fortschritt falsch herum gerechnet.
   Maschinen-Tipps folgen dem Format: "Zahnrad-Emoji Einstellung: ...\nAusfuehrung: ..." —
   Einstell-Checkliste (Gelenk auf Drehachse, Polster-Positionen, Startposition fuer 169 cm)
   plus Ausfuehrungs-Cues, zugeschnitten auf Glute-Fokus / schmale Beine
4. KEIN Grad-Zeichen (°) in Strings im Script — zerstoert den JS-Parser! "Grad" ausschreiben
5. Keine renderT() in updRep/updW
6. plan() gibt P3 oder P4 zurueck (je nach S.pt) — beide Plaene folgen denselben Regeln
   (Steigerung, autoExtraSets, Vererbung, Deload); 3-Tage-Daten IMMER unter p3cycle-Keys
7. Bei groesseren Aenderungen: Python-Script verwenden, am Ende node --check ausfuehren
8. Sonderzeichen generell meiden in JS-Strings
9. Gewicht IMMER mit parseWeight() parsen, nie parseFloat() — sonst geht der obere Bereichswert verloren ("42-45" -> 42)
10. Bei JEDEM Deploy die Konstante BUILD_TS in index.html aktualisieren: auf Commit-Zeit
    plus ca. 5 Minuten setzen (ISO-UTC). Sonst laden aktuelle Clients einmal unnoetig neu.
11. **Workout-Keys sind POSITIONSBASIERT (..__d[Tag]__e[Slot]).** Wer eine Zeile MITTEN in
    einen Tag einfuegt, entfernt oder verschiebt, verschiebt damit die Daten aller Slots
    dahinter — die Uebung, das Gewicht und die Historie landen in der falschen Kategorie
    (real passiert: Butterfly Maschine tauchte im neuen Adduktoren-Slot auf).
    Also IMMER eine einmalige Migration mitliefern, die die betroffenen Keys um die
    Differenz verschiebt (Muster: MIG_ADD / migAdduktoren() in index.html — absteigend
    laufen, Guard-Key setzen, Sicherheitskopie unter peach_v4_pre_* ablegen).
    Anhaengen am ENDE eines Tages ist der einzige Fall, der ohne Migration auskommt.

---

## Trainingsplan 4-Tage (P4) — Standard-Plan

### Tag A — Beine
| Kategorie | Saetze | Reps |
|---|---|---|
| Glute Max | 3 | 4-8 |
| Glute Max | 2 | 8-12 |
| Glute Med | 3 | 8-12 |
| Glute Med | 2 | 8-12 |
| Glute & Hams | 2 | 8-12 |
| Glute & Hams | 2 | 6-10 |
| Glute & Quad | 2 | 6-10 |
| Adduktoren | 2 | 8-12 |
| Bauch | 2 | 8-12 |

### Tag B — Oberkörper
| Kategorie | Saetze | Reps |
|---|---|---|
| Ruecken | 3 | 4-8 |
| Ruecken | 2 | 8-12 |
| Schultern | 3 | 8-12 |
| Schultern | 2 | 8-12 |
| Brust | 2 | 8-12 |
| Bizeps | 2 | 8-12 |
| Trizeps | 2 | 8-12 |
| Bauch | 2 | 8-12 |
| Bauch | 2 | 8-12 |

### Tag C — Ganzkörper
| Kategorie | Saetze | Reps |
|---|---|---|
| Glute & Hams | 3 | 4-8 |
| Glute & Hams | 2 | 6-10 |
| Glute Max | 3 | 6-10 |
| Glute Med | 2 | 8-12 |
| Glute Med | 2 | 6-10 |
| Glute & Quad | 2 | 6-10 |
| Ruecken | 2 | 8-12 |
| Schultern | 2 | 8-12 |
| Bauch | 2 | 8-12 |
| Bauch | 2 | 8-12 |

### Tag D — Ganzkörper
| Kategorie | Saetze | Reps |
|---|---|---|
| Glute Max | 3 | 4-8 |
| Glute Max | 2 | 8-12 |
| Glute Med | 3 | 8-12 |
| Glute Med | 2 | 8-12 |
| Glute & Hams | 2 | 6-10 |
| Glute & Quad | 2 | 6-10 |
| Adduktoren | 2 | 8-12 |
| Brust | 2 | 8-12 |
| Schultern | 2 | 8-12 |
| Bauch | 2 | 8-12 |

---

## Trainingsplan 3-Tage (P3) — waehlbar ueber "3 Tage"-Pill im Header

Eigene Zyklen 1-3 (Keys p3cycle1-3), gleiche Regeln wie P4 (Steigerung, Auto-Extra-Satz,
Vererbung, Deload Woche 12). Tagesfarben: A Peach, B Pink, C Lime.

### Tag A — Ganzkoerper
| Kategorie | Saetze | Reps |
|---|---|---|
| Glute Max | 3 | 4-8 |
| Glute Max | 2 | 8-12 |
| Glute Med | 2 | 8-12 |
| Glute Med | 2 | 8-12 |
| Glute & Hams | 2 | 4-8 |
| Glute & Quad | 2 | 4-8 |
| Adduktoren | 2 | 8-12 |
| Brust | 2 | 8-12 |
| Schultern | 2 | 8-12 |
| Bauch | 3 | 8-12 |

### Tag B — Ganzkoerper
| Kategorie | Saetze | Reps |
|---|---|---|
| Glute & Hams | 2 | 4-8 |
| Glute & Hams | 2 | 6-10 |
| Glute Max | 3 | 6-10 |
| Glute Med | 2 | 8-12 |
| Glute Med | 2 | 8-12 |
| Glute & Quad | 2 | 6-10 |
| Ruecken | 2 | 8-12 |
| Ruecken | 2 | 8-12 |
| Schultern | 2 | 8-12 |
| Bauch | 3 | 8-12 |

### Tag C — Ganzkoerper
| Kategorie | Saetze | Reps |
|---|---|---|
| Glute Max | 3 | 4-8 |
| Glute Max | 2 | 8-12 |
| Glute Med | 2 | 8-12 |
| Glute Med | 2 | 8-12 |
| Glute & Hams | 3 | 4-8 |
| Adduktoren | 2 | 8-12 |
| Ruecken | 2 | 8-12 |
| Brust | 2 | 8-12 |
| Schultern | 2 | 8-12 |
| Bauch | 3 | 8-12 |

---

## Uebungslisten (vollstaendig, aktueller Stand)

Glute Max (13): Hip Thrusts Langhantel, Hip Thrust Kurzhantel, Hip Thrusts Multipresse, Hip Thrust Maschine, Glute Bridge Langhantel, Glute Bridge Kurzhantel, Glute Bridge Multipresse, Kabel Kickback Stehend, Kabel Kickback Flachbank, Kabel Kickback Schraegbank, Kabel Kickback Liegend, Kickback Multipresse, Kickback Maschine

Glute Med (8): Kabel Abduktion Stehend, Kabel Abduktion Liegend, Kabel Abduktion Schraegbank, Abduktionsmaschine, Pelvic Drop, Abduktionsmaschine stehend, Fire Hydrants Kabel, 3D Abduktor Maschine

Adduktoren (8): Adduktionsmaschine, Adduktion Kabel Stehend, Adduktion Kabel Liegend, Copenhagen Plank, Sumo Squat Kurzhantel, Sumo RDL Langhantel, Cossack Squat, Lateral Lunge

Glute & Quad (11): Low Bar Squat, Beinpresse 45 Grad, Beinpresse, Step Ups, Split Squat Kurzhantel, Split Squat Langhantel, Split Squat Multipresse, Hack Squat, Reverse Lunge, Belt Squat, Super Squat

Glute & Hams (10): RDL Langhantel, RDL Kurzhanteln, RDL Maschine, Belt Squat RDL, Glute Hyperextensions, Reverse Hack RDL, Good Mornings, Single-Leg RDL, Nordic Curls, Leg Curl (Maschine)

Ruecken (21): LH Rudern, KH Rudern, KH Rudern (breit), Rudern Kabel (eng), Rudern Kabel (breit), Rudermaschine (Panatta), Rudermaschine (Precor), High Row Maschine, Latzug (eng), Latzug (breit), Latzug Maschine (Panatta), Latzug Maschine (Precor), Ueberzug am Kabel, T Bar Rudern (neutral), T Bar Rudern (breit), Assistierter Klimmzug (eng), Assistierter Klimmzug (breit), Face Pull Kabel, Straight-Arm Pulldown, Einarmiger Latzug Kabel, Diverging Low Row

Brust (15): LH Bankdruecken, KH Bankdruecken, Bankdruecken Multipresse, Bankdruecken Maschine, LH Schraegbankdruecken, KH Schraegbankdruecken, Schraegbankdruecken Multipresse, Schraegbankdruecken Maschine, Brustpresse (Panatta), Brustpresse (Precor), Butterfly Maschine, Flys von oben Kabel, Flys von unten Kabel, Flachbank KH Flys, Schraegbank KH Flys

Schultern (14): KH Seitheben, Vorgebeugtes KH Seitheben, Seithebemaschine (sitzend), Seithebemaschine (stehend), Seitheben Kabel, Vorgebeugtes Seitheben Kabel, LH Ueberkopfdruecken, KH Ueberkopfdruecken, Ueberkopfmaschine, Butterfly Reverse Maschine, Butterfly Reverse Kabel, Upright Row Kabel, Arnold Press, Einarmiges Ueberkopfdruecken Kabel

Bizeps (12): SZ Curls, LH Curls, KH Curls, Kabel Curls, KH Hammer Curls, SZ Preacher Curls, KH Preacher Curls, Bizeps Maschine, Konzentrations Curls, Spinne Curls, Kabel Curls einarmig, Reverse Curls

Trizeps (10): SZ Skullcrusher, Enges Bankdruecken, Pushdown Kabel, Pushdown Kabel einarmig, SZ Ueberkopf Tri. Druecken, KH Ueberkopf Tri. Druecken, Kabel Ueberkopf Tri. Druecken, Dips Maschine, Trizeps Maschine, KH Kickback Trizeps

Bauch (13): Crunches, Crunches am Kabelzug, Panatta Super Crunch, Panatta Low Crunch, Panatta High Crunch, Bauch Maschine (Precor), Beinheben (Liegend), Beinheben (Haengend), Reverse Crunch, Dead Bug, Ab Rollout, Pallof Press, Hollow Body Hold

---

## Panatta/Precor Maschinen-Varianten

Bauch: Panatta Super Crunch, Panatta Low Crunch, Panatta High Crunch, Bauch Maschine (Precor)
Ruecken: Rudermaschine (Panatta), Rudermaschine (Precor), High Row Maschine, Latzug Maschine (Panatta), Latzug Maschine (Precor)
Brust: Brustpresse (Panatta), Brustpresse (Precor)
Schultern: Seithebemaschine (sitzend), Seithebemaschine (stehend)
Spezial: 3D Abduktor Maschine, Belt Squat, Belt Squat RDL, Beinpresse 45 Grad, RDL Maschine, Diverging Low Row

---

## Progressionssystem

- + Button: Satz hinzufuegen (max. 5 gesamt)
- - Button: Satz entfernen (nur wenn extraSets > 0)
- Auto: 3 stagnierende Wochenvergleiche = +1 Satz automatisch (greift fruehestens Woche 5, nur bei gleicher Uebung)
- Satzanzahl + Uebung werden in Folgewoche vererbt
- Gewichtsbereiche ("25-27kg") und Komma ("27,5") werden korrekt ausgewertet (oberer Wert zaehlt)
- Glatter Einzelwert schlaegt eine gleich hoch endende Spanne (45 > 42-45 = Steigerung)
- Weniger Gewicht = 'Weniger', auch bei mehr Reps (Gewicht wird zuerst verglichen)
- Reps werden als Durchschnitt pro Satz verglichen, nicht satzweise und nicht als Summe
  (Reihenfolge der Saetze egal, zusaetzliche oder noch leere Saetze verfaelschen nichts)
- Vergleich basiert auf letztem Wert dieser Uebung, nicht einfach Vorwoche

---

## Deload-Banner (Woche 12)

Erscheint automatisch in Woche 12. Gelber Block (var(--yellow)), 2,5px Ink-Rahmen, harte
Schatten (--sh-card), Titel in Archivo Black, schwarzer (ink) Text.
Hinweis: 50-60% Gewicht, 2 Saetze, gleiche Uebungen, kein Muskelabbau.

---

## Trainingsziele

1. Ausladender Po, breite Huefte (Glute Max 13 + Glute Med 14 Saetze/Woche, 3x Frequenz)
2. Schlanke Taille (Anti-Rotation, Transversus, V-Taper durch Lats)
3. Schlanke Beine (Glute & Quad max. 8 Saetze/Woche, nur beinschonende Varianten)
4. Breite Schultern, gute Haltung (Schultern 9 Saetze vs. Brust 4 Saetze)

5. Volle Innenseite / runde Huefte von vorne (Adduktoren 4 Saetze/Woche, 2x Frequenz).
   Der Adduktor magnus ist zugleich ein HUEFTSTRECKER — er arbeitet mit dem Po zusammen
   und fuellt die Innenseite, ohne die Oberschenkel-Vorderseite dicker zu machen.
   Deshalb eigene Kategorie und NICHT unter Glute Med (das ist die Gegenbewegung).

Glute & Quad: Weite Fussstellung + erhoehte Ferse = Po. Enge Fussstellung + Tiefe = Quad.

---

## Deployment

Standard (Claude-Session): direkt auf main committen und pushen — GitHub Pages baut
automatisch, nach ~2 Min live unter https://nicolehahn2890.github.io/Trainingsapp/

Fallback (manuell, ohne Session):
1. index.html herunterladen
2. github.com/nicolehahn2890/Trainingsapp > index.html > Stift-Symbol
3. Strg+A > Entf > Strg+V > Commit changes
4. ~2 Min warten > Live-URL pruefen

---

## Aenderungs-Historie (Kurzfassung, neueste zuerst)

NEU. **Nachtrag zur Adduktoren-Aenderung: Daten-Migration war noetig.** Die Adduktoren-
   Zeilen wurden MITTEN in die Tage einsortiert — dadurch rutschte jeder Slot dahinter eine
   Position weiter, und weil die Workout-Keys positionsbasiert sind (..__d0__e6), zeigte der
   neue Adduktoren-Slot die Daten der alten Uebung an dieser Stelle (bei Rexi: "Butterfly
   Maschine" samt Vorwert und Einstellungs-Notiz unter der Kategorie Adduktoren). Behoben
   durch die einmalige Migration migAdduktoren(): verschiebt in P4 Tag A (ab e7), P4 Tag D
   (ab e6), P3 Tag A (ab e6) und P3 Tag C (ab e5) alle Keys ueber alle Zyklen und Wochen um
   +1 — absteigend, damit nichts ueberschrieben wird. Guard peach_mig_add, Sicherheitskopie
   des Standes davor unter peach_v4_pre_add. Uebungsbasierte Keys (tip__ex__, set__ex__)
   bleiben unberuehrt. Verifiziert per Node-Test (1152 Workout-Keys, Idempotenz, kein
   Datenverlust, Backup identisch) und Chromium-Render mit echten Vor-Migrations-Daten.
   Daraus die neue Coding-Regel 11.

NEU. **Adduktoren als eigene Kategorie, 2x pro Woche:** Neues Ueberthema "Adduktoren"
   (Farbe Mint #7FD1C1) mit 8 Uebungen (Adduktionsmaschine, Adduktion Kabel Stehend/Liegend,
   Copenhagen Plank, Sumo Squat Kurzhantel, Sumo RDL Langhantel, Cossack Squat, Lateral Lunge)
   inkl. Tipps und REC-Sternen. Eingeplant mit je 2 Saetzen 8-12 Wdh.: P4 an Tag A + Tag D,
   P3 an Tag A + Tag C — jeweils die Tage mit der besten Verteilung ueber die Woche und
   dem geringsten Volumen. Bewusst KEINE Unterbringung in Glute Med: Adduktion ist die
   Gegenbewegung zur Abduktion, sonst schlaegt das Dropdown die falschen Uebungen vor.
   Rein additiv — bestehende Keys und Daten in peach_v4 bleiben unberuehrt.

NEU. **Assistierte Uebungen rechnen umgekehrt + neue Uebung "High Row Maschine":**
   Beim assistierten Klimmzug ist das eingetragene Gewicht das Gegengewicht der Maschine —
   weniger Hilfe bedeutet MEHR Kraft. Bisher wurde eine Reduktion von 30 auf 24 kg als
   Rueckschritt gewertet. Neu: Set ASSIST + isAssist(); prog() dreht dort die Richtung um,
   parseWeight nimmt aus einer Spanne den kleineren Wert, Badge ("↓ Hilfe"/"↑ Hilfe"),
   Feldbeschriftung ("Hilfe:"), Hinweistext und die Uebersicht (gespiegelte Balkenhoehe,
   Bilanz als "−X kg Hilfe") folgen automatisch. Ausserdem neu im Ruecken: "High Row
   Maschine" (mit Maschinen-Tipp, REC-Stern; 127 Uebungen gesamt). Verifiziert per
   Playwright-Suite (34 UI-Tests) und Einheitstests fuer beide Richtungen.

NEU. **Bug-Suche: 4 weitere Fehler gefunden und behoben.**
   (1) **Badge/Hinweis/Rep-Farben aktualisierten sich nicht** waehrend der Eingabe — updRep rief
   nur refreshDone, updW gar nichts. Waehrend des ganzen Trainings stand dort der Stand von vor
   der letzten Aenderung (z. B. "Gleiche Leistung", obwohl das Gewicht gerade reduziert wurde);
   erst ein Wochenwechsel korrigierte es. Neu: exState() als einzige Zustandsquelle plus
   refreshProg()/refreshWeekBar() fuer gezielte DOM-Updates ohne renderT.
   (2) **Entfernte Zusatzsaetze zaehlten weiter mit** — die geloeschte Zahl blieb in S.data und
   floss in den Vergleich ein. exState schneidet reps jetzt auf die aktuelle Satzanzahl.
   (3) **Uebersicht rechnete ueber einen Uebungswechsel hinweg** — 60 kg Langhantel gefolgt von
   100 kg Maschine ergab "+40 kg Fortschritt". Jetzt zaehlen nur Wochen mit derselben (zuletzt
   trainierten) Uebung, fremde Wochen sind graue Balken mit Hinweiszeile darunter.
   (4) **Pfeiltaste + Enter im Uebungs-Suchfeld LOESCHTE die Uebung**, weil die Zeile
   "– Uebung waehlen –" Teil der Pfeil-Navigation war. Sie ist jetzt ausgenommen; Enter ohne
   Markierung waehlt bei genau einem Treffer diesen aus.
   Verifiziert per Playwright-Suite (23 UI-Tests) + 16 prog()-Einheitstests, beide gruen.

NEU. **Fortschritts-Vergleich korrigiert (2 Bugs):** (1) Ein REDUZIERTES Gewicht wurde gar
   nicht als Abstieg gewertet — 17 kg -> 15 kg bei gleichen Reps meldete "Gleiche Leistung!",
   bei mehr Reps sogar "Mehr Wiederholungen!". prog() prueft jetzt das Gewicht zuerst:
   cu<pu -> immer 'd'. (2) Reps wurden als GESAMTSUMME verglichen, dadurch meldete ein
   zusaetzlicher Satz faelschlich "Mehr Wiederholungen" und eine erst halb ausgefuellte
   Woche faelschlich "Weniger" — jetzt Durchschnitt pro ausgefuelltem Satz. Ausserdem gilt
   ein noch leeres Gewichtsfeld nicht mehr als Abstieg, und der Hinweistext nennt den Grund
   ("Weniger Gewicht - kein Problem!"). Verifiziert per Node-Funktionstest (16 Faelle).

NEU. **Nachtrag: Rep-Bereich gehoert in den Vergleichsschluessel:** Der erste Wurf (siehe
   naechster Eintrag) verglich nur ueber den Uebungsnamen — dadurch bekam der 8-12er Slot
   den Vorwert des 4-8er Slots derselben Uebung (Hip Thrusts: 115 kg-Slot zeigte VW 134 kg
   und meldete dauerhaft "weniger"). Rexi trainiert dieselbe Uebung je nach Rep-Bereich mit
   deutlich unterschiedlichem Gewicht, also gehoert der Bereich zwingend dazu. Der Index
   laeuft jetzt ueber exKey() = "Uebung||4-8"; der Bereich kommt via repRange() aus dem PLAN
   (P3/P4 je nach Key-Praefix), nicht aus den Daten. Eintraege an Plan-Positionen, die es
   nicht mehr gibt, bleiben aussen vor. Gibt es im aktuellen Rep-Bereich noch keinen Wert,
   wird bewusst gar kein Vorwert gezeigt — kein Rueckfall auf einen anderen Bereich, das
   wuerde den Fortschritts-Badge verfaelschen. Der Plan-Rueckfall (3-/4-Tage) gilt weiterhin,
   aber ebenfalls nur bei identischem Rep-Bereich. Verifiziert per Node-Funktionstest
   (27 Faelle) und Chromium-Render der Situation aus Rexis Screenshot.

1. **Vorwerte haengen an der Uebung, nicht am Platz im Plan:** findLastExData() suchte
   bisher nur rueckwaerts durch die Wochen an DERSELBEN Position (gleicher Zyklus, Tag,
   Slot) — wer eine Uebung austauschte, an einen anderen Tag schob oder eine Woche
   ausliess, sah keinen Vorwert mehr und startete den Vergleich bei Null. Jetzt gibt es
   einen Index ueber die gesamte Historie (exIndex(), Cache _exIdx, in save() verworfen):
   gesucht wird der letzte Eintrag dieser Uebung ueber alle Zyklen/Wochen/Tage/Positionen,
   sortiert per exOrd() (Zyklus > Woche > Tag > Position) und begrenzt auf Eintraege VOR
   der aktuellen Position. Ist im aktuellen Plan noch nichts zu der Uebung gespeichert,
   greift ein reiner LESE-Rueckfall auf den anderen Plan (Speichern bleibt getrennt).
   Damit auch Woche 1 und ein neuer Zyklus Vorwerte zeigen, ersetzt `hasPrev` die alten
   `S.week>1`-Guards in renderT (Wochenbalken), im VW-Hinweis, in den Rep-Vorwerten und
   beim Fortschritts-Badge. Neu ist die Herkunftsangabe srcLabel() — "(Z1 W5 · Tag A)"
   hinter dem VW-Hinweis und als Tooltip am (VW: xx) neben dem Gewichtsfeld.
   autoExtraSets() bleibt bewusst wochen- und positionsbasiert. Verifiziert per
   Node-Funktionstest (16 Faelle: anderer Tag, Wochen-Luecke, Zyklus-Wechsel, Zukunft
   ausgeschlossen, Plan-Rueckfall, leere/Tipp-Keys, Cache-Invalidierung) und Chromium-Render.

2. **Design-Feinschliff aus Claude Design (Umsetzungs-Check):** Vier Aenderungen aus der
   Design-Uebergabe uebernommen: (1) Peach-Fokus-Ring auf ALLEN fokussierbaren Elementen —
   `:focus-visible{outline:3px solid var(--focus)!important;outline-offset:2px}` (a11y,
   gewinnt auch gegen outline:none). (2) Picker-Tastatur-Navigation: im Dropdown-Suchfeld
   bewegen Pfeil hoch/runter ein Highlight (.hl, Peach-Fuellung wie Hover), Enter waehlt,
   Esc schliesst — Funktion dsKey(), reines DOM-Update ohne renderT; Hover der Optionen
   jetzt ebenfalls Peach statt grau. (3) Kategorie- (.cat-badge) und Fortschritts-Badges
   (.pbadge) von 10px auf 12px fuer Lesbarkeit. (4) Globaler Disabled-Stil fuer Buttons:
   flach & cream (cream-Hintergrund, text-dim Text+Rahmen, kein Schatten, kein
   Press-Effekt, cursor not-allowed). Verifiziert per Playwright-Funktionstest.
3. **3-Tage-Plan (P3) zurueckgebaut — waehlbar neben dem 4-Tage-Plan:** Neue Header-Pills
   "3 Tage"/"4 Tage" (.plan-btn, aktive Pill Peach) ueber den Zyklus-Buttons. P3 exakt nach
   Rexis Tabelle (Tag A 9 / Tag B 10 / Tag C 9 Uebungen, inkl. 4-8er-Bereiche und Bauch mit
   3 Saetzen). Eigene Zyklen 1-3 mit Key-Praefix p3cycle1-3 in peach_v4 — bestehende
   cycle1-3-Daten des 4-Tage-Plans bleiben zu 100% unangetastet (nur additiv!). Alle Regeln
   laufen identisch, weil prog/findLastExData/autoExtraSets/initKey ueber S.cy arbeiten.
   S.pt ('p4' Default) wird in peach_ui mitgespeichert; setPlan() mappt die Zyklus-Nummer
   (cycle2 <-> p3cycle2). plan() gibt jetzt P3 oder P4 zurueck, cyBase() liefert den
   Zyklus ohne Praefix (Buttons + Deload-Text). Verifiziert per Node-Funktionstest
   (Key-Trennung, Steigerungserkennung im P3) und Playwright-Screenshots.
4. **Neobrutalism-Redesign + Dark Mode entfernt:** Komplettes Re-Skin auf das neue
   Peach-Designsystem — flache Farb-Bloecke, fast-schwarze Ink-Rahmen (2,5px), harte
   Offset-Schatten ohne Blur, runde Pills, Fonts Archivo Black (Display) + Space Grotesk
   (Body). Tagesfarben (A Peach / B Pink / C Lime / D Sky), neue Kategorie- & Fortschritts-
   Farben, vertikale Kapsel-Balken in der Uebersicht, Rep-Felder werden voll performance-
   farbig gefuellt. Dark Mode KOMPLETT raus: Sonne/Mond-Button, applyTheme/toggleTheme,
   theme-State, peach_theme-Key, theme-color-Wechsel und Backup-Theme entfernt; nur noch
   ein helles :root. manifest.json + theme-color auf helle Palette. Funktionen, Daten und
   localStorage-Keys (peach_v4/peach_ui) unveraendert. Auch das Home-Screen-Icon
   (apple-touch-icon.png) neu gestaltet: Pixel-Pfirsich im Cream-Kreis mit Ink-Rahmen auf
   Lilac. WICHTIG fuer die Nutzerin: manifest blieb display:browser -> Icon-Wechsel kostet
   KEINE Daten; auf dem iPhone nur altes Icon entfernen und neu zum Homescreen hinzufuegen.
5. **Position merken:** saveUI() speichert die zuletzt offene Position (view/week/cy/openDays)
   im eigenen Key peach_ui; beim Start validiert zurueckgeladen. Grund: Beim App-Wechsel/
   Schliessen ging alles zu und man startete wieder in Woche 1. peach_v4 bleibt unberuehrt.
6. **Auto-Update:** checkUpdate() laedt die App einmal neu, wenn auf main ein neuerer
   Commit liegt (GitHub-API, Cache-Buster ?v=sha, Guard peach_ver). Grund: iOS-Webapp-
   Cache friert alte Staende ein. ACHTUNG: BUILD_TS bei jedem Deploy aktualisieren (Regel 10)!
7. **Daten-Backup:** Export/Import unten in der Uebersicht (bk-card). expBackup kopiert
   JSON in die Zwischenablage, impBackup spielt es ein (Validierung + confirm).
   Anlass: Trainingsdaten lagen im Container des ALTEN Home-Screen-Icons —
   jede Oeffnungsart (Safari/Chrome/jedes Icon) hat auf iOS einen EIGENEN localStorage!
8. **Home-Screen-Icon (iPhone):** apple-touch-icon.png (180x180, Pixel-Pfirsich auf
   Header-Gradient) + apple-mobile-web-app-title. Nachgebessert mit manifest.json
   ("display": "browser"), weil iOS 16.4+ Home-Screen-Links sonst als Web-App mit
   leerem localStorage oeffnet (siehe Warnung im Design-System).
9. **Tipp-Notizen statt Override:** Standard-Tipp immer sichtbar, eigene Texte als
   "Deine Notiz" zusaetzlich darunter. savTip loescht Key bei leerem Text.
10. **Maschinen-Einstellungen:** 38 Maschinen-Tipps mit Einstell-Checkliste
   (Zahnrad-Emoji + "Einstellung:" / "Ausfuehrung:"), zugeschnitten auf 169 cm / 56 kg /
   Glute-Fokus. Neues Feld "Meine Einstellung" pro Uebung (set__ex__Name).
11. **Heller Modus:** CSS-Variablen :root / :root.light, Sonne/Mond-Button im Header,
   Key peach_theme, theme-color-Meta wechselt mit.
12. **Design-Update:** Karten mit Verlauf/Schatten, Animationen (fadeSlide/dropIn),
   Tages-Pill "x/y Uebungen", Erledigt-Haken pro Uebung (live via refreshDone),
   groessere Touch-Ziele, 16px-Inputs gegen iOS-Zoom, kompakter Header.
13. **Code-Review davor:** uebungsbasierter Vergleich (findLastExData), Reps als
   Gesamtsumme, parseWeight fuer Spannen/Komma, P3/Plan-Umschalter entfernt,
   Dropdown-Such-Fokus-Fix, REC-Stern im Dropdown, veraltete Duplikat-PDF geloescht.

Konsistenz-Audit (zuletzt ausgefuehrt): alle 135 Uebungen haben Tipps, keine verwaisten
Tipps/REC-Eintraege, keine Duplikate, Rep-Bereiche plausibel (4-8/6-10/8-12), jede im Plan
verwendete Kategorie existiert in EXERCISES und hat eine Farbe in CC,
prog()/rcol()/autoExtraSets() per Funktionstest verifiziert.
