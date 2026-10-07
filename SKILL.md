---
name: peach-project
description: >
  Use this skill for EVERY request related to the Peach Project — a glute-focused
  fitness tracking app built in standalone HTML, deployed to GitHub Pages.
  Trigger on any mention of: "Trainingsapp", "Peach Project", "Peach App", "Glute",
  "Uebungen", "Exercise", "Woche", "Trainingsplan", "fitness app",
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
Trainingsziel (seit Sept. 2026): grosser, runder, abstehender Po (Hauptfokus), deutliche
Huefte/Sanduhr, DEFINIERTE (nicht massige) Beine, trainierter schlanker Oberkoerper,
schmale Taille. Kann viel trainieren — Umfang soll aber sinnvoll und effektiv bleiben.

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
  Peach_Project.pdf (Original-Handbuch des Trainers, 41 Seiten — nicht aendern), SKILL.md
  (diese Datei), tests/ (Browser-Tests, siehe Abschnitt Tests)
- localStorage-Keys: peach_v4 (Trainingsdaten — NIEMALS umbenennen!),
  (peach_ver wird nicht mehr genutzt — Auto-Update zaehlt Versuche in sessionStorage
  peach_try_[BUILD_ID], siehe checkUpdate),
  peach_ui (zuletzt offene Position: view/week/cy/pt/openDays — getrennt von peach_v4).
  Sicherheitskopien vor Daten-Eingriffen: peach_v4_pre_add, peach_v4_pre_fix, peach_v4_pre_v2,
  peach_v4_pre_v3, peach_v4_pre_order. Unlesbares peach_v4 (kaputtes JSON) wird beim Start als Rohtext nach
  peach_v4_corrupt kopiert und NICHT ueberschrieben (load/loadFailed).
  Plan-Version pro Zyklus steht als pv__-Marker IN peach_v4 (siehe Key-Formate).
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
  Trizeps #93B6E0, Bauch #D6D080, Beinbeuger #D7A0E8 (Orchidee), Beinstrecker #F9B98A (Apricot)

### Fortschritts-Farben (pbadge = solide Pill; rcol = ganzes Rep-Feld gefuellt)
  Gruen #6FC36A = Gewicht gesteigert (--prog-up)
  Blau  #5EA8E0 = Mehr Reps (--prog-reps)
  Gelb  #F5CB44 = Gleiche Leistung (--prog-same)
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
  cy: "cycle1",     // cycle1-6 (4-Tage-Woche) bzw. p3cycle1-6 (3-Tage-Woche) — Praefix folgt S.pt
  pt: "p4",         // Art der ANGEZEIGTEN WOCHE: "p4" (4 Tage) | "p3" (3 Tage), via syncPt/weekPt
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
              [cycle] = cycle1-6 (4-Tage-Woche) ODER p3cycle1-6 (3-Tage-Woche).
              (Bis Sept. 2026 nur 1-3 — nach Zyklus 3 ging es auf den befuellten Zyklus 1 zurueck.)
              Gespeichert bleibt strikt getrennt — NIEMALS Keys mischen/migrieren! Seit 02.10.2026
              enthaelt eine Zyklus-Nummer Wochen BEIDER Arten (flexible Woche, siehe weekPt).
              Optionales Feld base: einmaliger Uebungswechsel ("nur diese Woche") — exercise wird
              gezeigt, base vererbt (exBase). Ohne base wird exercise vererbt.
              Optionales Feld s0: Basis-Saetze, mit denen diese Woche trainiert wurde, wenn sie
              vom heutigen Plan abweichen (exState/exDone nehmen s0||Plan-Saetze). Wird NICHT vererbt.
              Optionales Feld r0: Wdh.-Bereich ("8-12"), mit dem diese Woche trainiert wurde, wenn er vom
              heutigen Plan abweicht (migGXRange). exIndex, findLastExData und exState (Anzeige "x–y Reps",
              Rep-Farben, Steigerungs-Hinweis) nehmen r0||Plan-Bereich. Wird NICHT vererbt.
Tipp-Notiz:   tip__ex__[Uebungsname]  (gilt ueber alle Wochen/Tage/Zyklen!)
              WICHTIG: Seit dem Notiz-Update ist das eine ZUSAETZLICHE eigene Notiz,
              KEIN Override mehr! Der Standard-Tipp aus TIPS wird IMMER angezeigt,
              die Notiz erscheint darunter ("Deine Notiz"). savTip loescht den Key
              bei leerem Text. Vorteil: TIPS-Updates erreichen die Nutzerin immer.
Einstellung:  set__ex__[Uebungsname]  (Maschinen-Einstellung, uebungsbasiert wie Tipps)
Slot:         tip__[cycle]__w[week]__d[dayIdx]__e[exIdx]  (nur UI-State)
Plan-Marker:  pv__[cycle] = 1  -> dieser Zyklus zeigt den ALTEN Plan (P4_V1/P3_V1)
              pv__p3cycleN = 2 -> 3-Tage-Zyklus mit dem Plan V2 (P3_V2, 56 Saetze, bis 02.10.2026)
              pv__done  = 1  -> Markierung V1 ist gelaufen (Backups ohne pv__done werden
                                beim Einspielen markiert). pv__v3 = 1 -> Markierung V2 gelaufen.
                                pv__bb3 = 1 -> Beinbeuger-Umrechnung gelaufen (migBBSets).
                                pv__gm3 = 1 -> Glute-Med-Umrechnung 3 Tage gelaufen (migGMSets).
                                Alle pv__ zaehlen NICHT als Eintraege.
Wochen-Art:   wt__cycleN__wW = 'p3'|'p4'  -> 3 oder 4 Tage fuer diese Woche (setPlan). Zaehlt
              NICHT als Eintrag. Nur in flexiblen Zyklen (flexCy) gesetzt.
```

### Wichtige Funktionen
```
mk(cy,week,di,ei)       Workout-Key
mkt(cy,week,di,ei)      Slot-Key
initKey(di,ei)          Legt den Key der aktuellen Woche an (Uebung via inhEx, extraSets der Vorwoche) —
                        IMMER statt mk() beim Schreiben!
plan()                  = planOf(S.cy) — der Plan DES AKTUELLEN ZYKLUS
planOf(cy)              p3-Praefix -> 3 Tage, sonst 4 Tage; Marker 1 -> P3_V1/P4_V1, Marker 2 (nur
                        3 Tage) -> P3_V2, sonst der aktuelle Plan (P3/P4). JEDE Stelle, die einen
                        Plan-Platz braucht (repairSlots, repRange, srcLabel, carryMap), nimmt planOf(cy).
isLegacy(cy)            true wenn S.data['pv__'+cy]===1;  pvOf(cy) = Marker-Wert (0 = aktueller Plan)
migBBSets(data)         Einmalig 02.10.2026 (4 Tage Tag C Beinbeuger 2 -> 3 Saetze): Eintraege an
/migBBStart             cycleN__wW__d2__e4 (ohne Plan-Marker, nur Beinbeuger) behalten ihre Satzzahl:
                        Wochen MIT Werten bekommen s0 (falls != 3), extraSets wird umgerechnet (2+1 -> 3+0).
                        Laeuft nach migOrderV2 und VOR repairSlots (sonst einmalige Key-Umsortierung) und
                        in impBackup. Merker pv__bb3.
migGMSets(data)         Einmalig 04.10.2026 (3 Tage Tag A + Tag B Glute Med 2 -> 3 Saetze), gleiches
/migGMStart             Vorgehen wie migBBSets: p3cycleN ohne Plan-Marker, Tag A/B, erkannt ueber die
                        KATEGORIE (Glute Med, Eintraege ohne Uebung nur an e2) — so zaehlt auch ein
                        Eintrag, den repairSlots erst danach einsortiert. Wochen MIT Werten bekommen s0
                        (falls != 3), extraSets umgerechnet (2+1 -> 3+0). Laeuft nach migBBStart, VOR
                        repairSlots, und in impBackup. Merker pv__gm3.
migGXRange(data)        Einmalig 07.10.2026 (Glute Max 8-12 -> 4-8: 4 Tage Tag D, 3 Tage Tag C). Zyklen ohne
/migGXStart             Plan-Marker, erkannt ueber die KATEGORIE (Glute Max, ohne Uebung nur e0). Eintraege MIT
                        Werten bekommen r0='8-12' (Verlauf bleibt im richtigen Bereich), leere laufen mit 4-8.
                        Laeuft nach migGMStart, VOR repairSlots, und in impBackup. Merker pv__gx48.
markV3(data)/migPlanV3  Einmal-Markierung 02.10.2026: jeder 3-Tage-Zyklus OHNE Marker mit Werten bekommt
                        pv__=2 (behaelt P3_V2), danach pv__v3=1. Laeuft beim Start VOR migOrderV2/
                        repairSlots (Kopie peach_v4_pre_v3) und in impBackup.
FLEXIBLE WOCHE (02.10.2026) — 3 oder 4 Tage pro Woche:
cyNum(cy)/isP3(cy)      Zyklus-Nummer / 3-Tage-Praefix
flexCy(n)               true, wenn WEDER cycleN NOCH p3cycleN einen pv__-Marker hat. Nur dann gilt die
                        Wochen-Art; in alten Zyklen schalten die Buttons global wie frueher (sonst
                        laege eine 3-Tage-Woche in einem alten 3-Tage-Zyklus gleicher Nummer).
weekPt(n,w)             Art der Woche: Marker wt__ > Plan mit Eintraegen (wkData, Cache _wk) >
                        Vorwoche (rueckwaerts) > S.pt. Beide Plaene mit Eintraegen ohne Marker -> S.pt.
syncPt()                Setzt S.pt + S.cy-Praefix fuer die angezeigte Woche. Aufruf in setWeek,
                        changeWeek, setCycle, impBackup und beim Start (vor render).
twinOf(cy,di,ei)        Partnerzeile im anderen Plan: P3-Zeilen tragen t:[Tag,Zeile] im P4, TWIN4 ist
                        die Rueckrichtung. Nur aktuelle Plaene in flexiblen Zyklen, sonst null.
slotEntry(w,di,ei)      Eintrag der Zeile in Woche w — lief w im anderen Plan, der der Partnerzeile.
                        Basis fuer inhEx, extraSets-Vererbung (exState/exDone/initKey), autoExtraSets
                        und die Uebersicht. In alten Zyklen identisch mit S.data[mk(S.cy,w,di,ei)].
canon(cy,di,ei)         Gemeinsame Kennung von Partnerzeilen ("4-Tage-Tag|Zeile") fuer carryMap.
weekHasVals(cy,w)       Woche hat Werte in diesem (praefixierten) Zyklus; weekHasData(w) prueft in
                        flexiblen Zyklen beide Plaene (Wochen-Auswahl).
UEBUNGSWECHSEL (02.10.2026):
selEx(di,ei,v)          Ab Woche 2 und wenn v != vererbte Uebung (inhEx, nicht leer): Abfrage
                        "Nur diese Woche" (speichert base = bisherige Uebung) / "Ab jetzt im Zyklus"
                        (ohne base) / "Abbrechen" (nichts gespeichert). Keine Frage in Woche 1, bei
                        leerer Vorbelegung, gleicher Uebung oder Leeren. Dieselbe Uebung erneut waehlen
                        fragt nur, wenn sie einmalig ist (so wird "nur diese Woche" zu "ab jetzt").
exBase(v)               base falls vorhanden, sonst exercise — das, was vererbt wird.
showSheet(t,html,btns)  Abfrage-Fenster unten (#sheet, .sheet-bg/.sheet/.sheet-btn/.sheet-cancel);
closeSheet/sheetAct(i)  Tipp auf den Hintergrund oder Esc schliesst ohne Aktion.
save()                  Schreibt peach_v4; schlaegt das fehl (Speicher voll/gesperrt), erscheint unten
                        die rote Warnung #save-warn (saveWarn) — frueher ging das still verloren.
load()                  Bei kaputtem JSON: Rohtext -> peach_v4_corrupt, loadFailed=true, Warnung
                        "Gespeicherte Daten konnten nicht gelesen werden – bitte ein Backup einspielen."
markLegacy(data)        Einmal-Markierung: jeder Zyklus mit echten Werten (hasVals) bekommt
                        pv__[cycle]=1, danach pv__done=1. Laeuft beim Start (migPlanV2, vorher
                        Kopie nach peach_v4_pre_v2) und in impBackup (fuer alte Backups).
                        migPlanV2 speichert NUR, wenn es Trainingsdaten gibt — sonst haette der
                        Start leere/unlesbare Daten mit {pv__done:1} ueberschrieben.
ALIAS / rowFits(r,e,leg) Zeile der Kategorie r akzeptiert Uebung der Kategorie e (gleich ODER — nur in
                        ALTEN Zyklen, leg=isLegacy — per Alias). ALIAS {"Glute & Hams":["Beinbeuger"]}:
                        Leg Curls/Nordic Curls standen bis Sept. 2026 in Glute & Hams — ohne Alias
                        schoebe repairSlots sie aus den alten Zeilen ans Tagesende. In V2 gilt der
                        Alias NICHT: sonst blieb nach der neuen Glute-&-Hams-Zeile in Tag A ein
                        Beinbeuger-Eintrag darin liegen. Nie im Dropdown.
carryMap(cy)            Uebungs-Uebernahme in einen neuen Zyklus (nur Nicht-Alt-Zyklen). ZUERST (seit
                        02.10.2026, nur wenn die Quell-Nummer flexibel ist — flexCy) ueber Partnerzeilen
                        (canon) aus BEIDEN Plaenen der Quell-Nummer, die
                        juengste Woche gewinnt; einmalige Wechsel zaehlen mit ihrer base. Dann pro Zeile
                        die Uebung aus dem ZULETZT TRAINIERTEN Zyklus mit kleinerer Nummer — egal ob
                        3 oder 4 Tage (juengster Eintrag nach exOrd; notfalls anderer Plan gleiche
                        Nummer), gleiche KATEGORIE laut CATOF; erst Zeilen mit gleichem Rep-Bereich,
                        dann beliebig, gleicher Tag bevorzugt, pro Tag keine Dopplung. Zeilen, die im
                        Zyklus schon eine gespeicherte Uebung haben, bekommen nichts, ihre Uebungen
                        gelten aber als vergeben (neue 2. Ruecken-Zeile != 1. Ruecken-Zeile). Cache _carry
                        (vor save() deklariert, in save() geleert).
                        Folge: aendert sich der Wdh.-Bereich einer Zeile, kann sich ihre VORAUSWAHL im
                        noch nicht trainierten Zyklus aendern (07.10.2026: Tag D 4-8 schlaegt die 4-8-
                        Uebung des Vorzyklus vor, z. B. Hip Thrust LH statt eines 8-12-Kickbacks) — der
                        Nutzerin immer dazusagen. carryMap liest den Bereich der Quellzeile aus dem Plan,
                        nicht aus r0 (nur bei nicht-flexiblen Quellzyklen mit r0-Wochen relevant).
migOrderV2()            Einmal-Korrektur fuer die Reihenfolge-Umstellung innerhalb von V2 (26.09.):
                        Tag-Gruppen in Nicht-Alt-Zyklen, die komplett zur ERSTEN V2-Reihenfolge
                        passen und nicht zur aktuellen, werden per Tabelle V2_REORDER umsortiert.
                        Inhaltsbasiert (Kategorie), idempotent, laeuft vor repairSlots. Seit 27.09.
                        fuer P4 Tag A abgeschaltet (null) — der Tag hat jetzt 8 Zeilen.
inhEx(di,ei)            Vorbelegte Uebung einer leeren Zeile: die der letzten GESPEICHERTEN Woche davor
                        (auch ueber ausgelassene Wochen; Woche im anderen Plan -> Partnerzeile via
                        slotEntry; einmaliger Wechsel -> dessen base), sonst carryMap. Geleertes Feld
                        ('') bleibt leer. Genutzt von exState, exDone, initKey, updSetting, selEx.
cyBase()                Zyklus ohne Plan-Praefix ('p3cycle2' -> 'cycle2') — fuer Buttons + Zyklus-Ende-Text
setPlan(pt)             Header-Pills "3 Tage"/"4 Tage" (.plan-btn) — gelten fuer die ANGEZEIGTE WOCHE:
                        setzt wt__cycleN__wW (flexible Zyklen). Hat die Woche Werte im aktuellen Plan
                        und keine im anderen -> Abfrage "Woche N auf X Tage?" (Werte bleiben gespeichert).
                        Behaellt die Zyklus-Nummer, schliesst offene Tage/Dropdown, saveUI(). In alten
                        Zyklen (flexCy false) wie frueher: globaler Umschalter ohne Marker. Bei loadFailed
                        (unlesbares peach_v4) nur im Speicher — nie speichern.
parseWeight(w,inv)      Parst "25-27" -> 27 (oberer Wert), "27,5" -> 27.5 (Komma -> Punkt).
                        inv=true (assistierte Uebung): aus einer Spanne zaehlt der KLEINERE
                        Wert ("20-25" -> 20), weil weniger Hilfe die bessere Leistung ist.
isAssist(ex)            true fuer Uebungen aus ASSIST (Gegengewichts-Maschinen)
weightBounds(w)         Untere/obere Grenze einer Gewichtsangabe: "40-45" -> {lo:40,hi:45},
                        "45" -> {lo:45,hi:45}, "27,5" -> {lo:27.5,hi:27.5}; leer -> null
cmpWeight(cw,pw,inv)    Gewichtsvergleich: 1 = mehr Leistung, -1 = weniger, 0 = gleich/unbekannt.
                        Erst der BESTWERT (obere Grenze; bei assistierten Uebungen die untere),
                        bei Gleichstand die ZWEITE Grenze. Damit ist ein heruntergesetzter
                        Rahmen (45 -> "40-45") weniger und ein angezogener ("40-45" -> 45) mehr.
                        Leeres Gewichtsfeld liefert 0 und gilt nie als Abstieg.
prog(cr,pr,cw,pw,ex)    'w'|'r'|'s'|'d' Fortschritts-Status. ex nur noetig um assistierte
                        Uebungen zu erkennen (dort dreht sich die Gewichtsrichtung um).
                        Gewicht schlaegt Reps (weniger
                        Gewicht -> immer 'd'); Reps als DURCHSCHNITT pro ausgefuelltem Satz.
findLastExData(di,ei,ex) Vorwert aus einer FRUEHEREN WOCHE (die aktuelle Woche zaehlt nie — Wunsch
                        07.10.2026), ueber BEIDE Plaene (exOrd: Zyklus >
                        Woche > Tag > Position; Gleichstand -> aktueller Plan). EINE Regel fuer
                        alle Wochen: (1) juengster Wert im GLEICHEN Rep-Bereich aus dem AKTUELLEN
                        Zyklus; (2) sonst gleicher Bereich aus dem zuletzt trainierten Zyklus DAVOR —
                        bestimmt NUR ueber Eintraege vor dem aktuellen Zyklus (ref); (3) sonst der
                        juengste Wert egal welcher Bereich (_orient: nur Orientierung, kein
                        Badge, Bereich im Hinweis). Bei (1)/(2) gewinnt die EIGENE Zeile (gleicher Plan +
                        Platz oder Partnerzeile via canon) aus demselben Zyklus wie der Fund, auch wenn ein
                        anderer Tag juenger ist: Tag B vergleicht mit Tag B, Tag C mit Tag C (auch wenn
                        Tag C letzte Woche ausfiel). "Gleicher Zyklus" heisst in flexiblen Zyklen gleiche
                        Zyklus-NUMMER (3- und 4-Tage-Wochen sind ein Zyklus). Pflicht-Tests: Woche 1 und 2 eines neuen
                        Zyklus zeigen bei leerer Woche 1 fuer JEDE Zeile denselben Vorwert; und Eintraege in
                        Woche 1 in ANDEREN Bereichen aendern keinen Vorwert im gleichen Bereich
                        (tests/vorwert-zyklusstart). Liefert _src {pt,cy,w,di,rr} und _orient.
                        Index: exIndex() fuehrt jede Uebung zusaetzlich unter "Uebung||*".
exOrd(cy,w,di,ei)       Reihenfolge-Wert eines Eintrags: Zyklus > Woche > Tag > Position
repRange(cy,di,ei)      Rep-Bereich eines Plan-Platzes als String ("4-8"); '' wenn es den Platz
                        im Plan nicht (mehr) gibt — solche Eintraege bleiben aus dem Index raus.
exKey(ex,rr)            Index-Schluessel "Uebung||4-8"
exIndex()               Baut/cached den Index exKey -> Eintraege (aufsteigend nach exOrd). Cache
                        _exIdx wird in save() verworfen — jede Datenaenderung geht durch save().
                        Bereich je Eintrag = r0 || Plan. Vorberechnet je Eintrag: n (Zyklus-Nummer),
                        pl (planOf) und cn (canon) — findLastExData sucht damit von hinten mit
                        Abbruch (last()); ohne das renderte die App ~3x langsamer (07.10.2026).
srcLabel(src)           "Z1 W5 · Tag A" (stammt der Wert aus dem anderen Plan, zusaetzlich "3-Tage"/"4-Tage")
rcol(v,r)               Performance-Farbe, mit der das ganze Rep-Feld gefuellt wird (leer -> weiss)
esc(s)                  HTML-escape
autoExtraSets(di,ei)    0 oder 1. Braucht 3 stagnierende WOCHENVERGLEICHE ('s'/'d') in Folge bei
                        gleicher Uebung -> greift fruehestens in WOCHE 5 (W2vsW1 + W3vsW2 + W4vsW3).
                        Der Guard "if(S.week<4)return 0" ist nur ein Early-Out. Verifiziert per Test.
togWeekPick(ev)         Tipp auf "W x / 12" (#week-label, jetzt ein Button) oeffnet #week-pick: Raster
                        1-12, Ink = aktuelle Woche, Lila (.has) = Woche hat im Zyklus schon Werte
                        (weekHasData). setWeek(w) springt direkt, closeWeekPick() schliesst (auch bei
                        Tipp daneben, Esc und den Pfeilen). Die Pfeile bleiben zusaetzlich.
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
                        hasPrev,noCmp,inv,p,srcL}. noCmp = Woche 1 ODER Vorwert aus anderem
                        Rep-Bereich (_orient) — dann kein Vergleich, p ist ''. Genutzt von renderEx, refreshProg und weekStats — dadurch
                        koennen Badge, Hinweis und Fortschrittsbalken nicht auseinanderlaufen.
                        reps ist auf ms GESCHNITTEN (entfernte Zusatzsaetze zaehlen nicht mehr mit).
hintHTML(st)            Nur noch die Herkunft: "zuletzt: Z2 W11 · Tag C" (+ " · 4–8 Wdh." wenn der
                        Wert aus einem anderen Rep-Bereich stammt). Gewicht steht als "(zuletzt 42)"
                        am Gewichtsfeld, Reps unter den Rep-Feldern, das Ergebnis im Badge — die
                        frueheren Texte ("VW: …", "→ Gleiche Leistung!") waren doppelt.
incCand(st)/incDue(st)  Steigerungsregel (Peach): Vorwert im gleichen Rep-Bereich, 1. Satz >= Obergrenze
                        -> Hinweis "▲ Gewicht steigern" (#ih-di-ei, .inc-hint) in der Zeile "3 Saetze ·
                        4–8 Reps"; ab Woche 2, verschwindet live, sobald mehr Gewicht eingetragen ist
                        ODER die Uebung fertig ist (st.done = alle Saetze eingetragen, wie der ✓).
                        Vorwert MUSS aus derselben oder der Vorwoche desselben Zyklus stammen
                        (gleiche Zyklus-Nummer — in flexiblen Zyklen auch aus der 3/4-Tage-Woche
                        davor —, _src.w>=S.week-1) — beim Vorblaettern in Wochen mit leerer
                        Vorwoche kein Hinweis ("zuletzt" zeigt den aelteren Wert weiter an).
                        Assistierte Uebungen: "▼ Hilfe senken".
refreshProg(di,ei)      Zieht Badge (#pb-di-ei), Herkunftszeile (#ph-di-ei), Steigerungs-Hinweis (#ih-di-ei), Rep-Feld-Farben
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
                        Keys (__w_d_e / tip__ / set__), confirm() vor Ueberschreiben. Danach dieselben
                        Korrekturen wie beim Start: markLegacy, markV3, migLegCurl, migOrderV2, migBBSets,
                        repairSlots (seit 02.10.2026 — vorher zeigte ein aelteres Backup bis zum Neustart
                        verschobene Zeilen). pv__/wt__-Keys zaehlen nicht als Eintraege.
checkUpdate()           Auto-Update gegen iOS-Webapp-Cache: holt die AUSGELIEFERTE index.html von
                        der eigenen Domain (kein API-Limit) und vergleicht deren BUILD_ID mit der
                        eigenen — GLEICH/UNGLEICH, NIE groesser/kleiner. Bei Abweichung
                        location.replace mit ?v=BUILD_ID. Entscheidend: verglichen wird, was
                        TATSAECHLICH geladen wurde — liefert Pages weiter die alte Datei aus,
                        versucht es der naechste Start erneut. Zaehler in sessionStorage
                        (max. 2 Versuche pro Version) verhindert eine Endlosschleife bei
                        hartnaeckigem Cache. Start + visibilitychange, gedrosselt 1x/Minute.
repairSlots()           Selbstheilung der Slot-Zuordnung, laeuft BEI JEDEM START (bewusst ohne
                        Guard). Ordnet jeden Eintrag ueber CATOF der Zeile zu, in die seine
                        Uebung KATEGORISCH gehoert — unabhaengig vom Versatz. 1. Durchgang:
                        was schon passend sitzt, bleibt liegen; 2. Durchgang: der Rest der
                        Reihe nach in die naechste freie Zeile seiner Kategorie. Leere
                        Platzhalter fallen weg, Eintraege MIT Werten werden nie verworfen — auch
                        nicht ohne Uebungsname (bis 27.09.2026 fielen die im 2. Durchgang weg).
                        Eintraege ohne passende Zeile (z. B. gestrichene Uebung) werden HINTER dem
                        Plan geparkt (park(): Index >= Anzahl Zeilen) — unsichtbar, aber gespeichert.
                        Vorher landeten sie per taken.push ggf. auf einer sichtbaren fremden Zeile.
                        Idempotent (korrekte Daten bleiben unveraendert). Stand vor jeder Aenderung:
                        peach_v4_pre_fix (erste) und peach_v4_pre_fix_last (juengste).
```

### Vergleichslogik (wichtig!)
- Fortschrittsvergleich nutzt findLastExData() — vergleicht mit dem letzten Wert DIESER Uebung
  im gleichen Wdh.-Bereich aus einer FRUEHEREN WOCHE, die eigene Zeile zuerst (siehe VORWOCHE).
- Der Vorwert haengt an UEBUNG + REP-BEREICH: gesucht wird ueber alle Zyklen, Wochen, Tage und
  Positionen. Eine Uebung, die von Tag A nach Tag D wandert, vier Wochen pausiert oder erst im
  neuen Zyklus wiederkommt, behaelt ihren Vorwert. Beruecksichtigt werden nur Eintraege aus
  Wochen VOR der aktuellen (exOrd < Beginn der aktuellen Woche; exOrd: Zyklus > Woche > Tag >
  Position) — die laufende Woche und spaetere Wochen sind nie "Vorwert".
- WICHTIG: Der Rep-Bereich gehoert ZWINGEND zum Vergleichsschluessel (exKey "Uebung||4-8").
  Dieselbe Uebung laeuft im 4-8er Slot mit deutlich mehr Gewicht als im 8-12er Slot (z. B.
  Hip Thrusts 134 kg vs. 115 kg) — ohne diese Trennung zieht der 8-12er Slot den viel zu
  hohen 4-8er Vorwert und meldet dauerhaft "weniger". VERGLICHEN wird deshalb nur im gleichen
  Bereich — und nur, wenn dieser Wert aus dem aktuellen Zyklus oder dem zuletzt trainierten
  Zyklus DAVOR stammt. Sonst (z. B. im neuen Plan mit geaenderten Bereichen) zeigt die App den
  juengsten Wert aus einem anderen Bereich NUR zur Orientierung (Bereich im Hinweis, kein Badge).
  Die Regel gilt fuer ALLE Wochen gleich (siehe findLastExData). FEHLER bis 26.09.2026: stattdessen
  griff der Rueckfall auf den anderen Plan und zeigte im neuen Zyklus Werte aus Z2 W3 (4-Tage, Juli)
  statt aus W11. FEHLER bis 07.10.2026: "zuletzt trainierter Zyklus" wurde ueber den juengsten
  Eintrag INSGESAMT bestimmt — sobald in Woche 1 Tag A eingetragen war, galt der Zyklus davor als
  veraltet und Tag C Hip Thrust 6-10 zeigte den 4-8-Wert von Tag A derselben Woche, die 8-12-Zeile
  sogar das eben getippte Gewicht der Zeile darueber. Jetzt: Bezugszyklus nur aus Eintraegen VOR dem
  aktuellen Zyklus, die laufende Woche zaehlt nie.
  Der Bereich kommt aus dem Plan via repRange() — ausser der Eintrag traegt r0 (mit einem anderen
  Bereich trainiert, migGXRange). Eintraege an Plan-Positionen, die es nicht mehr gibt, fallen raus.
- VORWOCHE STATT GLEICHE WOCHE (Wunsch 07.10.2026): Rexi macht dieselbe Uebung im gleichen Bereich
  an zwei Tagen einer Woche (z. B. Glute Med 8-12 Tag B + Tag C). Innerhalb einer Woche muss NICHT
  gesteigert werden — deshalb zaehlt die aktuelle Woche nie als Vorwert, und die eigene Zeile hat
  Vorrang: Tag B vergleicht mit Tag B, Tag C mit Tag C der Vorwoche (bei 3/4-Tage-Wechsel mit der
  Partnerzeile). Fiel die eigene Zeile letzte Woche aus, zaehlt ihr letzter Wert im selben Zyklus.
  Nur wenn die Zeile die Uebung im Zyklus noch nie hatte, kommt der juengste Wert eines anderen
  Tages (aus frueheren Wochen). Bis 07.10.2026 verglich Tag C mit Tag B derselben Woche.
  Folge fuer den Steigerungs-Hinweis: er braucht einen Vorwert aus der Vorwoche — kommt der eigene
  Wert aus der vorletzten Woche (z. B. Zeile ohne Partner nach einer 3-Tage-Woche), erscheint keiner.
- Deshalb kann es auch in Woche 1 (und im neuen Zyklus) Vorwerte geben. Die frueheren Guards
  `if(S.week>1)` in renderT/renderEx sind durch `hasPrev` ersetzt.
- **WOCHE 1 = KEIN VERGLEICH (Zyklus-Start).** In Woche 1 jedes Zyklus steigt Rexi bewusst mit
  weniger Gewicht ein. exState setzt dort noCmp=true: KEIN Fortschritts-Badge (p=''), weekStats
  zaehlt nichts (Wochenbalken bleibt versteckt). KEIN Woche-1-Hinweistext (weder pro Zeile
  noch als Kasten oben — ausdruecklich nicht gewuenscht). Sichtbar bleiben als Orientierung "(zuletzt xx)" am Gewichtsfeld, die kleinen Vorwerte unter
  den Rep-Feldern und die Herkunftszeile. Die Rep-Feld-Farben (rcol) bleiben — sie bewerten nur den Rep-Bereich,
  nicht den Vergleich. Ab Woche 2 laeuft alles normal, INKLUSIVE Woche 12.
- Herkunft wird transparent angezeigt: "zuletzt: Z1 W5 · Tag A". NICHT "VW" schreiben — der
  Wert stammt oft nicht aus der Vorwoche (anderer Tag/Zyklus), "VW" hat verwirrt.
- Plan-Trennung bleibt beim SPEICHERN strikt (p3-Praefix). Beim LESEN zaehlt der juengste
  Wert aus BEIDEN Plaenen (seit 26.09.2026 — vorher hatte der gleiche Plan Vorrang, dann kam im
  4-Tage-Zyklus 2 der Wert aus 4-Tage Z1 W3 vom Juni statt aus 3-Tage Z1 W12). Kommt der Wert
  aus dem anderen Plan, nennt das Label "3-Tage"/"4-Tage". Grenze: Wechselt man den Plan
  MITTEN in einer Zyklus-Nummer und startet dort wieder bei Woche 1, ist die Reihenfolge der
  beiden Plaene innerhalb dieser Nummer nicht eindeutig (betrifft nur alte Wochen). Konkret bei
  Rexi: Zyklus 1 (4-Tage W1-3 Juni, 3-Tage W1-12 Juli-Sept., beide mit Marker) — beim
  Zurueckblaettern kann "zuletzt" dort aus der jeweils anderen Wochenart kommen, und die eigene
  Zeile hat keinen Vorrang (nicht flexibel). Bewusst NICHT korrigiert (nur Altdaten; Pruefung
  07.10.2026: in flexiblen Zyklen 0 Abweichungen auf 15.000 Zufallspositionen).
- Wenn Uebung gewechselt wird, startet Vergleich frisch
- Gewicht: parseWeight() unterstuetzt Bereiche wie "25-27" (nimmt oberen Wert 27) und Komma wie "27,5". Auch renderOv (Uebersicht) nutzt parseWeight() — nie parseFloat(), das gibt bei "42-45" nur 42 zurueck.
- ASSISTIERTE UEBUNGEN (Set ASSIST, aktuell die beiden "Assistierter Klimmzug"-Varianten):
  Das eingetragene Gewicht ist das GEGENGEWICHT der Maschine — WENIGER ist mehr Leistung.
  Fuer diese Uebungen dreht sich alles um: prog() ('w' bei cu<pu), parseWeight nimmt aus einer
  Spanne den kleineren Wert, das Badge heisst "↓ Hilfe"/"↑ Hilfe", das Eingabefeld heisst
  "Hilfe:" statt "Gewicht:", der Steigerungs-Hinweis heisst "▼ Hilfe senken",
  und in der Uebersicht wird die Balkenhoehe gespiegelt (weniger Hilfe = hoeherer Balken)
  plus Bilanz als "−X kg Hilfe". Neue Maschinen dieser Art NUR in ASSIST eintragen — der
  Rest folgt automatisch.
- GEWICHT SCHLAEGT REPS: das Gewicht wird IMMER zuerst geprueft. cu>pu -> 'w', cu<pu -> 'd'
  (auch wenn dabei mehr Reps geschafft wurden — weniger Gewicht ist weniger Leistung).
  Erst bei gleichem Gewicht (oder fehlendem Vorgewicht) entscheiden die Reps.
  Ein noch LEERES Gewichtsfeld (cu=0) zaehlt NICHT als Abstieg — sonst waere jede Uebung
  waehrend der Eingabe rot.
- GEWICHTSRAHMEN werden ueber BEIDE Grenzen verglichen (cmpWeight): zuerst der Bestwert
  (oben, bei assistierten Uebungen unten), bei Gleichstand die zweite Grenze. Ein glatter
  Einzelwert schlaegt deshalb eine gleich hoch endende Spanne (45 > 42-45 -> 'w'), ein
  angezogener Rahmen ebenfalls (42-45 > 40-45 -> 'w') — und ein HERUNTERGESETZTER Rahmen
  ist 'd' (45 -> 40-45, weil ein Teil der Saetze mit 40 lief). Frueher fiel genau dieser Fall
  auf den Rep-Vergleich durch und meldete faelschlich 'Mehr Wiederholungen ✓'. Identische
  Angaben (zwei gleiche Spannen oder Einzelwerte) -> Reps entscheiden.
- Reps: Vergleich ueber den DURCHSCHNITT pro ausgefuelltem Satz, NICHT Satz-fuer-Satz und
  NICHT als Gesamtsumme. 12/15 zaehlt gleich wie 15/12 -> 's'. Hoeherer Schnitt -> 'r',
  niedriger -> 'd'. (Positionsweise meldete faelschlich 'd' sobald ein einzelner Satz
  niedriger war; die Gesamtsumme meldete faelschlich 'r' bei einem zusaetzlichen Satz und
  faelschlich 'd' solange die Woche erst halb ausgefuellt war.)
- Fortschritt wird nur berechnet wenn aktuelle Woche tatsaechlich Reps hat
- LIVE-AKTUALISIERUNG: Badge, Herkunftszeile, Steigerungs-Hinweis, Rep-Feld-Farben und Wochenbalken werden bei jeder
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
  Wochen MIT DIESER Uebung UND diesem Wdh.-Bereich (r0), darunter die Zeile "Davor: … (grau, nicht eingerechnet)"
- Animationen: fadeSlide (Ansicht/Tag aufklappen), dropIn (Dropdown nur beim Oeffnen, nicht bei Suche)
- Einstellungs-Feld (gelbes Zahnrad-Chip + .set-input): erscheint sobald eine Uebung gewaehlt ist,
  zwischen ex-meta und reps-row. Speichert uebungsbasiert (set__ex__Name) via updSetting() — ohne renderT
- KEIN Theme-Button mehr (Dark Mode entfernt) — der header-right enthaelt nur die beiden Tab-Pills
- Badge (#pb-di-ei) + Erledigt-Haken (#done-di-ei) stehen IMMER in eigener 2. Zeile (.ex-status,
  flex-basis 100%) unter Kategorie + Uebungsauswahl. Leer (kein Badge, kein ✓) -> per :has()
  ausgeblendet, keine Leerzeile. Vorher rutschte nur ein breites Badge runter, "= Gleich" blieb
  auf breiten iPhones (430 px) neben der Auswahl (Wunsch 30.09.2026: einheitlich 2. Zeile).
- Steigerungs-Hinweis (.inc-hint, #ih-di-ei): kleine weisse Pill "▲ Gewicht steigern" hinter
  "3 Saetze · 4–8 Reps" — keine eigene Zeile (Wunsch: nichts vollgeschrieben/gequetscht).
- Kleine Vorwerte unter den Rep-Feldern (.rep-prev) nur, wenn der Vorwert ueberhaupt Reps hat
  (hasPrevReps) — sonst stand dort "0 0 0".
- Label "nur diese Woche" (.once-chip, gestrichelter weisser Pill) in der Status-Zeile (.ex-status),
  wenn der Eintrag ein einmaliger Wechsel ist (Feld base). Die Status-Zeile zeigt sich auch nur mit Label.
- Abfrage-Fenster (#sheet): Cream-Block unten mit Ink-Rahmen und hartem Schatten auf dunklem
  Schleier (--scrim); Hauptaktion Peach (.sheet-btn.pri), Abbrechen als unterstrichener Text.
  Genutzt fuer den Uebungswechsel und das Umstellen einer Woche mit Werten auf 3/4 Tage.
- Plan-Pills "3 Tage"/"4 Tage" gelten fuer die angezeigte Woche (title "Gilt für diese Woche").
- Tipp-Panel: Standard-Tipp (TIPS) immer sichtbar; eigene Notiz (tip__ex__) darunter mit
  Label "Deine Notiz" (.tip-note, .tip-note-lbl); Editor bearbeitet NUR die Notiz

### Daten-Vererbung zwischen Wochen
Vererbt: exercise (aus der letzten gespeicherten Woche, auch ueber Luecken), extraSets (nur aus
der direkten Vorwoche) — NICHT: reps, weight
Woche 1 eines neuen Zyklus: exercise aus dem vorherigen Zyklus (carryMap, erst Partnerzeile, dann
Kategorie), extraSets starten bei 0. Nur Vorbelegung — gespeichert wird erst beim Eintragen (initKey).
3/4-Tage-Wechsel: lief die Vorwoche im anderen Plan, kommen Uebung und extraSets von der
Partnerzeile (slotEntry). 4-Tage-Zeilen ohne Partner (Tag A zweite Glute-Med-Zeile, Tag B Glute
Max, Ruecken 2x8-12, Schultern 2x8-12, Bauch) erben aus der letzten 4-Tage-Woche. Zusatzsaetze
gelten RELATIV zum Plan: Glute Med Tag A/B hat in 3 Tagen 3, in 4 Tagen 2 Saetze — ein "+" kommt in
der anderen Wochenart als "+1" an (2+1 -> 3+1), nicht als gleiche Gesamtzahl.
Einmaliger Wechsel ("nur diese Woche", Feld base): die Folgewoche erbt base, nicht exercise.
Label "nur diese Woche" (.once-chip) in der Status-Zeile der Uebung.

---

## WICHTIGE CODING-REGELN

1. initKey statt mk() beim Schreiben verwenden
2. peach_v4 nie umbenennen
3. Neue Uebungen in EXERCISES + TIPS eintragen (TIPS-Key muss EXAKT dem EXERCISES-Namen entsprechen!), optional in REC.
   Gegengewichts-Maschinen (assistierte Klimmzuege o. ae.) ZUSAETZLICH in ASSIST eintragen —
   sonst wird ihr Fortschritt falsch herum gerechnet.
   Maschinen-Tipps folgen dem Format: "Zahnrad-Emoji Einstellung: ...\nAusfuehrung: ..." —
   Einstell-Checkliste (Gelenk auf Drehachse, Polster-Positionen, Startposition fuer 169 cm)
   plus Ausfuehrungs-Cues, zugeschnitten auf Glute-Fokus / definierte, nicht massige Beine
4. KEIN Grad-Zeichen (°) in Strings im Script — zerstoert den JS-Parser! "Grad" ausschreiben
5. Keine renderT() in updRep/updW
6. plan() = planOf(S.cy): 3 oder 4 Tage je nach Praefix, alte oder neue Version je nach
   pv__-Marker — alle Plaene folgen denselben Regeln
   (Steigerung, autoExtraSets, Vererbung, Woche-1-Regel); 3-Tage-Daten IMMER unter p3cycle-Keys
7. Bei groesseren Aenderungen: Python-Script verwenden, am Ende node --check ausfuehren
8. Sonderzeichen generell meiden in JS-Strings
9. Gewicht IMMER mit parseWeight() parsen, nie parseFloat() — sonst geht der obere Bereichswert verloren ("42-45" -> 42)
10. **Bei JEDEM Deploy die Konstante BUILD_ID in index.html hochzaehlen** (Format
    JJJJ-MM-TT-NN). Sie wird NUR auf GLEICH/UNGLEICH geprueft — niemals groesser/kleiner,
    und niemals gegen ein Datum: ein Stempel, der versehentlich in der Zukunft lag, liess
    eine fehlerhafte Version sich fuer aktueller halten als ihre eigene Reparatur, und sie
    aktualisierte sich NIE mehr (15.08.2026). Ebenso wenig darf der Merker gesetzt werden,
    BEVOR der neue Inhalt bestaetigt ist — genau daran scheiterte der SHA-Ansatz ueber die
    GitHub-API (16.08.2026): waehrend des Pages-Deploys kam die alte Datei, sie galt
    trotzdem als geholt, und die App blieb dauerhaft haengen. checkUpdate() vergleicht
    darum die BUILD_ID der TATSAECHLICH ausgelieferten Datei mit der eigenen.
    Wird BUILD_ID vergessen, kommt das Update nicht an — die Version steht unten in der
    Uebersicht ("Version …"), damit sich das in Sekunden pruefen laesst.
11. **Workout-Keys sind POSITIONSBASIERT (..__d[Tag]__e[Slot]).** Wer eine Zeile MITTEN in
    einen Tag einfuegt, entfernt oder verschiebt, verschiebt damit die Daten aller Slots
    dahinter — Uebung, Gewicht und Historie landen in der falschen Kategorie (real passiert
    am 15.08.2026: Butterfly Maschine stand unter "Adduktoren"). Anhaengen am ENDE eines
    Tages ist der einzige Fall, der ohne Datenkorrektur auskommt.
11a. **Zum Zurechtruecken NIEMALS einen festen Versatz verwenden — immer die KATEGORIE.**
    Der Weg ueber "alle Keys ab Position X um +1 schieben" ist dreimal gescheitert:
    (1) Er verschiebt auch Wochen, die schon in der neuen Aufteilung eingetragen wurden
    (wer trainiert, waehrend die neue Zeile im Plan steht), also ein zweites Mal.
    (2) Passiert das mehrfach, liegen Eintraege irgendwann 4-5 Positionen daneben und
    teilweise ausserhalb des Plans — unsichtbar in der App.
    (3) Eine Korrektur, die nur genau eine Position zurueckschiebt, greift dann nicht mehr.
    Robust ist ausschliesslich die kategorische Zuordnung ueber CATOF (Uebung -> Kategorie):
    eine Brust-Uebung gehoert in die Brust-Zeile, egal wo sie vorher stand. Genau das macht
    repairSlots() — versatzunabhaengig, idempotent, laeuft bei jedem Start und heilt
    Altschaeden mit. Neue Plaenderungen brauchen daher gar keine eigene Migration mehr,
    solange jede Uebung in EXERCISES einer Kategorie zugeordnet ist.
    Pflicht bei jedem Eingriff in Daten: Sicherheitskopie unter peach_v4_pre_* ablegen und
    Eintraege MIT Werten niemals verwerfen.

12. **Was save() benutzt, muss VOR save() deklariert sein — und leere `catch{}` in den
    Start-Migrationen verstecken genau solche Fehler.** `_exIdx` stand mit `let` erst weit
    unter save(). Jeder save()-Aufruf beim Start (migAdduktoren, migLegCurl, repairSlots)
    lief damit in einen TDZ-Fehler, den die umgebenden try/catch schluckten: die Reparatur
    rechnete korrekt, wirkte aber NUR im Speicher und wurde nie nach peach_v4 geschrieben —
    sie musste bei jedem Start von vorn anfangen, und ein Backup-Export haette den
    unreparierten Stand enthalten. Nach Aenderungen an den Start-Migrationen deshalb IMMER
    im Browser pruefen, ob localStorage danach wirklich den neuen Stand hat — nicht nur, ob
    die Oberflaeche richtig aussieht.

13. **Einen Plan NIE ueber bereits trainierte Zyklen legen — neue Aufteilung = neue
    Plan-Version.** Die Workout-Keys sind positionsbasiert: aendert man P3/P4 selbst, zeigen
    alle alten Wochen ihre Daten in fremden Zeilen, und repairSlots() sortiert sie beim
    naechsten Start dauerhaft um. Vorgehen (so gemacht im Sept. 2026): alten Plan als
    P3_V1/P4_V1 behalten, neuen als P3/P4 anlegen, alte Zyklen per pv__-Marker auf die alte
    Version festnageln (markLegacy), alles Plan-Abhaengige ueber planOf(cy) lesen. Bei einer
    weiteren Plan-Aenderung: V1 bleibt, aktueller Plan wird V2, Marker um die Version
    erweitern (z. B. pv__cycle3=2) — NIE einen Marker loeschen. Verschiebt sich eine Uebung in
    eine neue Kategorie, braucht die alte Kategorie einen ALIAS-Eintrag. Die Tabelle
    V2_REORDER (migOrderV2) gilt nur fuer die jetzige V2 — bei V3 entfernen bzw. anpassen.
    (02.10.2026 so gemacht fuer den 3-Tage-Plan: P3_V2 + Marker 2, neuer P3 = V3; V2_REORDER.p3
    greift nur noch bei Marker 2.)

14. **Partnerzeilen pflegen (flexible Woche).** Jede Zeile im P3 traegt t:[Tag,Zeile] im P4 —
    gleiche Kategorie UND gleicher Wdh.-Bereich (Test prueft das). Aendert sich P3 oder P4,
    muessen die t-Angaben mitgezogen werden, sonst bekommt eine 3-Tage-Woche falsche Uebungen.
    Partnerzeilen gelten nur zwischen den AKTUELLEN Plaenen (canon/twinOf liefern bei pv__-Marker
    null). Eine neue Plan-Version braucht deshalb eigene Partnerzeilen oder keine.

15. **Satzzahl einer Zeile aendern (z. B. 2 -> 3) braucht eine Umrechnung wie migBBSets.**
    Die Satzzahl steht im Plan, nicht im Eintrag: sonst fehlt bereits trainierten Wochen ploetzlich
    ein Satz (kein ✓), und mit "+" erhoehte Saetze zaehlen doppelt. Wochen mit Werten bekommen s0,
    extraSets wird umgerechnet, einmalig mit pv__-Merker, VOR repairSlots, auch in impBackup.
    Gleiches gilt fuer den Wdh.-BEREICH einer Zeile (z. B. 8-12 -> 4-8): der Bereich kommt aus dem Plan,
    ohne Umrechnung stuenden alte 8-12-Werte im Verlauf als 4-8 (falsche Vorwerte, Farben, Hinweise).
    Wochen mit Werten bekommen r0 (migGXRange). Partnerzeilen P3/P4 immer gemeinsam aendern.

16. **Neue Start-Migrationen VOR repairSlots einhaengen.** repairSlots baut alle Workout-Keys neu
    auf; wird danach noch ein Key ergaenzt, sortiert der naechste Start einmal um und speichert.
    Vergleiche auf "unveraendert" in Tests inhaltlich (sortierte Keys), nicht ueber rohes JSON.

---

## ARBEITSWEISE (Feedback 07.10.2026)

Rexi will keine Bugs mehr und keine unnoetige Komplexitaet ("Was ist daran so schwer, ich wollte doch
einfach fuer 2 Uebungen die Wiederholungsbereiche aendern").
- KLEINE WUENSCHE KLEIN UMSETZEN. Ein anderer Wdh.-Bereich ist eine Zahl im Plan (P3 + P4 als
  Partnerzeilen gemeinsam). Absicherungen/Migrationen (s0, r0 …) NUR, wenn betroffene Daten wirklich
  existieren — vorher kurz fragen, ob die Zeile im LAUFENDEN Zyklus schon trainiert wurde
  (07.10.2026: sie war erst in Woche 1, Tag D noch nicht trainiert — migGXRange war unnoetig, ist
  aber geprueft und wirkungslos auf ihre Daten).
- Nebeneffekte (z. B. andere Vorauswahl durch carryMap) aktiv und kurz nennen.
- Vor jedem Deploy: Testsuite gruen; bei Logik-Aenderungen den Vorher/Nachher-Vergleich (Abschnitt
  Tests). Erst melden, wenn das geprueft ist — nicht in mehreren Runden nachbessern.

## TEXT-STIL (ausdruecklicher Wunsch, 26.09.2026)

Alle Beschriftungen kurz, sachlich, ohne KI-Ton: keine ausschweifenden Saetze, keine
Ausrufe-Floskeln ("kein Problem!", "stärker geworden! ✓"), nichts doppelt anzeigen (was am Feld
oder im Badge steht, nicht noch einmal als Text). Hinweise einmal pro Ansicht statt in jeder
Zeile. Tipps im Format "⚙ Einstellung: … / Ausführung: …" mit 2-3 knappen Saetzen.

---

## Trainingsplaene — 4 Tage Version 2 (ab Sept. 2026), 3 Tage Version 3 (ab 02.10.2026)

Peach-Aufbau mit vollem Po-Fokus, trainingswissenschaftlich gegengeprueft (Pelland 2024:
abnehmender Grenznutzen, ~25-30 anteilige Saetze/Woche; Remmert 2025: ab ~11 Saetzen pro
Muskel und Einheit kein Zusatznutzen; Plotkin 2023/Kubo 2019: Hip Thrust + tiefe
kniedominante Uebung; Maeo 2021: sitzender Beinbeuger > liegend). Grundsaetze:
- REIHENFOLGE pro Tag (ausdruecklicher Wunsch): erst Glute Max, dann Glute Med, dann die
  restlichen Po-/Bein-Uebungen (Grunduebungen vor Isolation), dann Oberkoerper, Bauch zuletzt.
- Pro Einheit hoechstens ~9 harte Po-Saetze; Glute Med 4x pro Woche (Wunsch: deutliche Huefte),
  seit 04.10.2026 10 Saetze/Woche in beiden Wochenarten (Wunsch: mehr Glute Med, Fokus Huefte).
- Adduktoren bleiben (2x2 Saetze). Neu: Beinbeuger + Beinstrecker fuer definierte Beine.
- JEDER Tag endet mit Bauch, 2 Saetze (ausdruecklicher Wunsch).
- KEINE Supersaetze (ausdruecklicher Wunsch) — alles normale Saetze.
- Oberkoerper schlank: Latzug/Rudern + Seitheben, wenig Brust/Arme.
- Athena (FPS) wurde geprueft und bewusst NICHT uebernommen (Aufbau gefiel nicht).
Saetze sind Startwerte — Auto-Zusatzsatz und +-Button steigern gezielt.
Tagesnamen = Schwerpunkt, dazu Feld f (Fokus-Zeile) im Plan-Objekt: {l:"Tag A – Po Kraft",
f:"Beinvorderseite · Innenschenkel",e:[...]}. Die Fokus-Zeile nennt NUR Schwerpunkte, KEINE
Wdh.-Bereiche (Wunsch 07.10.2026: "brauche ich nicht" — die Bereiche stehen an jeder Uebung). renderT zeigt f als .day-focus in einer
eigenen Zeile unter Titel + Uebungs-Pill (volle Breite). Alte Plaene haben kein f.

### 4 Tage (P4) — 70 Saetze/Woche
| Tag A – Po Kraft | Tag B – Oberkörper & Po | Tag C – Po & Beinrückseite | Tag D – Po-Volumen & Beine |
|---|---|---|---|
| Glute Max 3x4-8 | Glute Max 2x8-12 | Glute Max 3x6-10 | Glute Max 3x4-8 |
| Glute Max 2x8-12 | Glute Med 2x8-12 | Glute Max 2x8-12 | Glute Med 2x8-12 |
| Glute Med 2x8-12 | Rücken 3x6-10 | Glute Med 2x8-12 | Glute & Quad 2x8-12 |
| Glute Med 2x8-12 | Rücken 2x8-12 | Glute & Hams 3x6-10 | Glute & Hams 2x8-12 |
| Glute & Quad 3x6-10 | Schultern 3x8-12 | Beinbeuger 3x8-12 | Beinstrecker 2x8-12 |
| Glute & Hams 2x4-8 | Schultern 2x8-12 | Rücken 2x8-12 | Adduktoren 2x8-12 |
| Adduktoren 2x8-12 | Brust 2x6-10 | Schultern 2x8-12 | Bauch 2x8-12 |
| Bauch 2x8-12 | Bauch 2x8-12 | Bauch 2x8-12 | |

Woche: Glute Max 15, Glute & Quad 5, Glute & Hams 7, Glute Med 10, Beinbeuger 3,
Beinstrecker 2, Adduktoren 4, Ruecken 7, Schultern 7, Brust 2, Bauch 8 (keine Arme im 4-Tage-Plan).
Pro Tag 18/18/19/15 Saetze (8/8/8/7 Uebungen). Tag D: Glute Max 3x4-8 statt 3x8-12 (Wunsch 07.10.2026,
schwerer Hueftstoss auch an Tag D), Fokus-Zeile "Beinstrecker · Innenschenkel".
Glute Max pro Woche nach Bereich: 4-8 6, 6-10 3, 8-12 6. Tag A: ZWEITE Glute-Med-Zeile 2x8-12 direkt nach der
ersten (Wunsch 04.10.2026) — gedacht fuer eine andere Uebung/einen anderen Winkel als die erste
(z. B. Abduktionsmaschine vorgeneigt + Kabel Abduktion stehend). Keine 3-Tage-Partnerzeile. BEINBEUGER NUR EINMAL PRO WOCHE mit 3 Saetzen
(ausdruecklicher Wunsch 02.10.2026, gilt auch fuer 3 Tage): 4 Tage an Tag C, 3 Tage an Tag B.
Die fruehere Beinbeuger-Zeile 2x8-12 in Tag A ist raus — Werte daraus parkt repairSlots. Tag B (Fokus "Rücken · Schultern"): zweite
Ruecken-Zeile 2x8-12 (z. B. Rudern nach dem schweren Zug von oben) und zweite Schulter-Zeile
2x8-12 (z. B. hintere Schulter / Kabel-Seitheben) am 27.09.2026 auf Wunsch ergaenzt, dafuer
Bizeps/Trizeps gestrichen (sonst zu viel). Arme werden ueber Rudern/Latzug/Brust indirekt mit
trainiert. Tag A: Glute & Hams 2x4-8 am 27.09.2026 auf
Wunsch ergaenzt — Tag A ist der SCHWERE Tag, deshalb 4-8 (z. B. RDL schwer). Tag A liegt damit
bei ~11 anteiligen Po-Saetzen — obere Grenze pro Einheit. Mit der zweiten Glute-Med-Zeile (04.10.)
12,5 — bewusst so, weil die Grenze pro MUSKEL gilt (Glute Max 8,5, Glute Med 4 in Tag A).

### 3 Tage (P3, Version 3 ab 02.10.2026) — 62 Saetze/Woche
Wunsch 02.10.2026: 3-Tage-Woche flexibel statt fester 3-Tage-Zyklus, Volumen naeher an der
4-Tage-Woche. Po/Beine fast wie in 4 Tagen (Glute Max 13 statt 15, Beinbeuger wie dort 3),
Ruecken/Schultern je 5, Bauch weiter 2 pro Tag. Pro Einheit ~11 anteilige Po-Saetze
(A 11,5 / B 9,5 / C 10). Glute Med seit 04.10.2026 in Tag A und Tag B mit 3 statt 2 Saetzen (Wunsch:
mehr Glute Med, wie in 4 Tagen 10/Woche) — bewusst KEINE zusaetzliche Zeile, Tag A ist mit 9 Uebungen
schon der laengste Tag. Umrechnung bereits trainierter Wochen: migGMSets. Tag B mit nur ZWEI Glute-Max-Zeilen — ausdruecklicher Wunsch
02.10.2026: nie 3x Glute Max an einem Tag (die dritte Zeile 2x8-12 war nur in Version -01).
Volle 69 Saetze in 3 Tagen bewusst NICHT (~23 Saetze/Einheit, ueber der Po-Grenze pro Einheit).
In Klammern die Partnerzeile im 4-Tage-Plan (t).
| Tag A – Po Kraft (23) | Tag B – Po & Beinrückseite (20) | Tag C – Hüfte & Sanduhr (19) |
|---|---|---|
| Glute Max 3x4-8 (A1) | Glute Max 3x6-10 (C1) | Glute Max 3x4-8 (D1) |
| Glute Max 2x8-12 (A2) | Glute Max 2x8-12 (C2) | Glute Med 2x8-12 (D2) |
| Glute Med 3x8-12 (A3) | Glute Med 3x8-12 (C3) | Glute Med 2x8-12 (B2) |
| Glute & Quad 3x6-10 (A5) | Glute & Hams 3x6-10 (C4) | Glute & Quad 2x8-12 (D3) |
| Glute & Hams 2x4-8 (A6) | Beinbeuger 3x8-12 (C5) | Glute & Hams 2x8-12 (D4) |
| Adduktoren 2x8-12 (A7) | Rücken 2x8-12 (C6) | Beinstrecker 2x8-12 (D5) |
| Rücken 3x6-10 (B3) | Brust 2x6-10 (B7) | Adduktoren 2x8-12 (D6) |
| Schultern 3x8-12 (B5) | Bauch 2x8-12 (C8) | Schultern 2x8-12 (C7) |
| Bauch 2x8-12 (A8) | | Bauch 2x8-12 (D7) |

Woche: Glute Max 13, Glute & Quad 5, Glute & Hams 7, Glute Med 10, Beinbeuger 3,
Beinstrecker 2, Adduktoren 4, Ruecken 5, Schultern 5, Brust 2, Bauch 6.
Pro Tag 23/20/19 Saetze (9/8/9 Uebungen). Tag C: Glute Max 3x4-8 statt 3x8-12 (Wunsch 07.10.2026, wie
4-Tage Tag D), Fokus-Zeile "Glute Med doppelt · Beinstrecker". Glute Max pro Woche nach
Bereich: 4-8 6, 6-10 3, 8-12 4. Partnerzeilen duerfen sich in der Satzzahl unterscheiden
(Glute Med A3/C3: 3 Saetze hier, 2 im 4-Tage-Plan) — Kategorie und Wdh.-Bereich muessen gleich sein. Keys p3cycle1-6, gleiche Regeln wie P4.
Tagesfarben: A Peach, B Pink, C Lime (D Sky nur im 4-Tage-Plan).
Aenderung zu V2: Tag A + Glute & Hams 2x4-8, Ruecken und Schultern je 3 statt 2 Saetze;
Tag B und Tag C unveraendert. P4-Zeilen OHNE Partner: Tag A zweite Glute-Med-Zeile, Tag B Glute Max,
Ruecken 2x8-12, Schultern 2x8-12, Bauch (erben in 4-Tage-Wochen aus der letzten 4-Tage-Woche).

### 3 Tage Version 2 (P3_V2, 26.09.-02.10.2026) — nur fuer 3-Tage-Zyklen mit Marker 2
56 Saetze: A 18 (GMax 3x4-8, GMax 2x8-12, GMed, G&Q 3x6-10, Adduktoren, Ruecken 2x6-10,
Schultern, Bauch), B 19 (GMax 3x6-10, GMax 2x8-12, GMed, G&H 3x6-10, Beinbeuger 3x8-12,
Ruecken 2x8-12, Brust 2x6-10, Bauch), C 19 (wie V3).

### Flexible Woche (02.10.2026)
3 oder 4 Tage werden pro Woche ueber die Header-Pills gewaehlt (Vorauswahl = Vorwoche). Eine
Zyklus-Nummer enthaelt Wochen beider Arten; gespeichert wird weiter getrennt (p3-Praefix).
Uebungen, Zusatzsaetze, Vorwerte, Steigerungs-Hinweis, Auto-Satz und Uebersicht laufen ueber
die Partnerzeilen durch. Wochen mit Werten umstellen -> Rueckfrage, Werte bleiben gespeichert.
Moegliche Dopplung (nur 3-Tage-Tag C): die beiden Glute-Med-Zeilen holen ihre Uebung aus
4-Tage-Tag D bzw. Tag B. Ist das dort dieselbe Uebung, steht sie in Tag C zweimal.

### Alte Plaene (P4_V1 / P3_V1, bis Sept. 2026) — nur fuer Zyklen mit pv__-Marker
Stehen unveraendert in index.html (P4_V1: A Beine 9 / B Oberkoerper 9 / C 10 / D 10
Uebungen, 84 Saetze; P3_V1: 10/10/10 Uebungen, 67 Saetze). Bei Rexi: der beim Umstieg
laufende 3-Tage-Zyklus (Woche 12) und die 4-Tage-Zyklen davor. Leg Curls stehen dort in
Glute-&-Hams-Zeilen (ALIAS).

---

## Uebungslisten (vollstaendig, aktueller Stand)

Glute Max (13): Hip Thrusts Langhantel, Hip Thrust Kurzhantel, Hip Thrusts Multipresse, Hip Thrust Maschine, Glute Bridge Langhantel, Glute Bridge Kurzhantel, Glute Bridge Multipresse, Kabel Kickback Stehend, Kabel Kickback Flachbank, Kabel Kickback Schraegbank, Kabel Kickback Liegend, Kickback Multipresse, Kickback Maschine

Glute Med (8): Kabel Abduktion Stehend, Kabel Abduktion Liegend, Kabel Abduktion Schraegbank, Abduktionsmaschine, Pelvic Drop, Abduktionsmaschine stehend, Fire Hydrants Kabel, 3D Abduktor Maschine

Adduktoren (8): Adduktionsmaschine, Adduktion Kabel Stehend, Adduktion Kabel Liegend, Copenhagen Plank, Sumo Squat Kurzhantel, Sumo RDL Langhantel, Cossack Squat, Lateral Lunge

Glute & Quad (11): Low Bar Squat, Beinpresse 45 Grad, Beinpresse, Step Ups, Split Squat Kurzhantel, Split Squat Langhantel, Split Squat Multipresse, Hack Squat, Reverse Lunge, Belt Squat, Super Squat

Glute & Hams (8): RDL Langhantel, RDL Kurzhanteln, RDL Maschine, Belt Squat RDL, Glute Hyperextensions, Reverse Hack RDL, Good Mornings, Single-Leg RDL

Beinbeuger (5, NEU Sept. 2026): Leg Curls sitzend (Precor), Leg Curls liegend (Panatta), Leg Curls liegend (Precor), Leg Curls stehend, Nordic Curls
(Leg Curls + Nordic Curls NUR hier — keine Dopplung in Glute & Hams, ausdruecklicher Wunsch)

Beinstrecker (3, NEU Sept. 2026): Beinstrecker Maschine (Panatta), Beinstrecker Maschine (Precor), Beinstrecker einbeinig

HERSTELLER-VARIANTEN (30.09.2026, Wunsch): Maschinen mit unterschiedlichen Gewichten je Geraet als
"Name (Panatta)" / "Name (Precor)" — wie Rudermaschine/Latzug Maschine. Leg Curls sitzend gibt es
NUR bei Precor (keine Panatta-Variante, 30.09.2026 korrigiert). Alte Eintraege NICHT umbenennen
(ausdruecklicher Wunsch 30.09.2026: im alten Zyklus allgemein lassen). Bis dahin nur Leg Curls
stehend trainiert (Name unveraendert) — die Umstellung betrifft ihre Historie praktisch nicht. Die alten Namen "Leg Curls
sitzend", "Leg Curls liegend", "Beinstrecker Maschine" stehen in RETIRED: nicht mehr in der Auswahl,
aber in CATOF bekannt (alte Eintraege bleiben unveraendert an ihrer Zeile, repairSlots findet sie),
carryMap schlaegt sie in neuen Zyklen NICHT vor. Nicht umbenannt, weil das Geraet unbekannt ist —
auf Wunsch per Migration (wie migLegCurl) auf die richtige Variante umbenennen, inkl. set__ex__/tip__ex__.
TIPS der Varianten = TIPS des alten Namens (Schleife nach CATOF, nur fuer Namen in EXERCISES).

Ruecken (21): LH Rudern, KH Rudern, KH Rudern (breit), Rudern Kabel (eng), Rudern Kabel (breit), Rudermaschine (Panatta), Rudermaschine (Precor), High Row Maschine, Latzug (eng), Latzug (breit), Latzug Maschine (Panatta), Latzug Maschine (Precor), Ueberzug am Kabel, T Bar Rudern (neutral), T Bar Rudern (breit), Assistierter Klimmzug (eng), Assistierter Klimmzug (breit), Face Pull Kabel, Straight-Arm Pulldown, Einarmiger Latzug Kabel, Diverging Low Row

Brust (15): LH Bankdruecken, KH Bankdruecken, Bankdruecken Multipresse, Bankdruecken Maschine, LH Schraegbankdruecken, KH Schraegbankdruecken, Schraegbankdruecken Multipresse, Schraegbankdruecken Maschine, Brustpresse (Panatta), Brustpresse (Precor), Butterfly Maschine, Flys von oben Kabel, Flys von unten Kabel, Flachbank KH Flys, Schraegbank KH Flys

Schultern (14): KH Seitheben, Vorgebeugtes KH Seitheben, Seithebemaschine (sitzend), Seithebemaschine (stehend), Seitheben Kabel, Vorgebeugtes Seitheben Kabel, LH Ueberkopfdruecken, KH Ueberkopfdruecken, Ueberkopfmaschine, Butterfly Reverse Maschine, Butterfly Reverse Kabel, Upright Row Kabel, Arnold Press, Einarmiges Ueberkopfdruecken Kabel

Bizeps (12): SZ Curls, LH Curls, KH Curls, Kabel Curls, KH Hammer Curls, SZ Preacher Curls, KH Preacher Curls, Bizeps Maschine, Konzentrations Curls, Spinne Curls, Kabel Curls einarmig, Reverse Curls

Trizeps (10): SZ Skullcrusher, Enges Bankdruecken, Pushdown Kabel, Pushdown Kabel einarmig, SZ Ueberkopf Tri. Druecken, KH Ueberkopf Tri. Druecken, Kabel Ueberkopf Tri. Druecken, Dips Maschine, Trizeps Maschine, KH Kickback Trizeps

Bauch (14): Crunches, Crunches am Kabelzug, Panatta Super Crunch, Panatta Low Crunch, Panatta High Crunch, Panatta Side Crunch, Bauch Maschine (Precor), Beinheben (Liegend), Beinheben (Haengend), Reverse Crunch, Dead Bug, Ab Rollout, Pallof Press, Hollow Body Hold

---

## Panatta/Precor Maschinen-Varianten

Bauch: Panatta Super Crunch, Panatta Low Crunch, Panatta High Crunch, Panatta Side Crunch, Bauch Maschine (Precor)
Ruecken: Rudermaschine (Panatta), Rudermaschine (Precor), High Row Maschine, Latzug Maschine (Panatta), Latzug Maschine (Precor)
Brust: Brustpresse (Panatta), Brustpresse (Precor)
Schultern: Seithebemaschine (sitzend), Seithebemaschine (stehend)
Spezial: 3D Abduktor Maschine, Belt Squat, Belt Squat RDL, Beinpresse 45 Grad, RDL Maschine, Diverging Low Row

---

## Progressionssystem

- + Button: Satz hinzufuegen (max. 5 gesamt)
- - Button: Satz entfernen (nur wenn extraSets > 0)
- Auto: 3 stagnierende Wochenvergleiche = +1 Satz automatisch (greift fruehestens Woche 5, nur bei gleicher Uebung)
- Satzanzahl + Uebung werden in Folgewoche vererbt (auch zwischen 3- und 4-Tage-Wochen)
- Uebungswechsel ab Woche 2: Abfrage "Nur diese Woche" / "Ab jetzt im Zyklus" (selEx)
- Gewichtsbereiche ("25-27kg") und Komma ("27,5") werden korrekt ausgewertet (oberer Wert zaehlt)
- Glatter Einzelwert schlaegt eine gleich hoch endende Spanne (45 > 42-45 = Steigerung),
  umgekehrt ist ein heruntergesetzter Rahmen (45 -> 40-45) weniger Gewicht
- Weniger Gewicht = 'Weniger', auch bei mehr Reps (Gewicht wird zuerst verglichen)
- Reps werden als Durchschnitt pro Satz verglichen, nicht satzweise und nicht als Summe
  (Reihenfolge der Saetze egal, zusaetzliche oder noch leere Saetze verfaelschen nichts)
- Vergleich mit dem letzten Wert dieser Uebung im gleichen Wdh.-Bereich aus einer FRUEHEREN Woche:
  eigene Zeile zuerst (Tag B mit Tag B der Vorwoche), die laufende Woche zaehlt nie (Wunsch 07.10.2026)
- STEIGERUNGSREGEL (Peach-Handbuch): Obergrenze im 1. Satz erreicht/ueberschritten -> naechstes
  Mal mehr Gewicht (App zeigt "▲ Gewicht steigern"); sonst Gewicht halten und mehr Reps schaffen.

---

## Zyklus-Ende-Banner (Woche 12) — KEINE Deload-Woche!

Rexi macht KEINE Deload-Woche. Woche 12 ist eine ganz normale Trainingswoche und wird
genauso verglichen wie Woche 2-11 (Badge, Hinweis, Wochenbalken). NIEMALS wieder eine
Deload-Empfehlung (50-60 % Gewicht, 2 Saetze o. ae.) einbauen und Woche 12 nicht als
Orientierungs-Quelle ueberspringen — sie ist der echte letzte Wert vor dem neuen Zyklus.
Banner in Woche 12: gelber Block (var(--yellow)), 2,5px Ink-Rahmen, harte Schatten
(--sh-card), Titel "🏁 Letzte Woche von Zyklus N" in Archivo Black. Text EIN Satz: "Danach geht
es mit Zyklus X weiter." bzw. (alter Zyklus -> naechster neu) "Danach startet Zyklus X mit dem
neuen Plan – deine Übungen werden übernommen."  Nach Zyklus 6
geht es auf "1 (neu)" — dort steht aber der alte Plan (Marker): spaetestens dann braucht es
eine Loesung (z. B. mehr Zyklen oder Zyklus-Archiv).

---

## Trainingsziele (Stand Sept. 2026)

1. Grosser, runder, abstehender Po — Hauptfokus: Glute Max 15 (4 Tage) / 13 (3 Tage) Saetze direkt
   + Glute & Quad 5 / Glute & Hams 7 fuer die gedehnte Position.
2. Deutliche Huefte / Sanduhr: Glute Med 4x pro Woche (10 Saetze seit 04.10.2026), Abduktion mit
   vorgeneigtem Oberkoerper fuer den oberen Po; dazu Lats + Seitheben (V-Form).
3. Definierte, nicht massige Beine: Beinbeuger (sitzend bevorzugt) 3 Saetze, 1x pro Woche,
   Beinstrecker 2 Saetze, kniedominante Uebungen po-betont (langer Schritt, Oberkoerper vor).
4. Trainierter, schlanker Oberkoerper: Ruecken + Schultern moderat, Brust/Arme minimal.
5. Schmale Taille: Bauch als Abschluss (2 Saetze pro Tag), keine schweren Seitbeugen.
6. Volle Innenseite: Adduktoren 2x2 Saetze. Der Adduktor magnus ist zugleich ein
   HUEFTSTRECKER — eigene Kategorie, NICHT unter Glute Med (Gegenbewegung).

Glute & Quad: Weite Fussstellung + erhoehte Ferse = Po. Enge Fussstellung + Tiefe = Quad.

### Volumen-Check gegen die Ziele (02.10.2026, aktualisiert 04.10.2026 nach Glute Med +2)
Anteilig gezaehlt (Hauptmuskel 1, Mitarbeit 0,5; Po = Glute Max + Glute Med + halbe Saetze aus
Glute & Quad, Glute & Hams, Adduktoren). Saetze pro Woche:
| Muskel | 4 Tage | 3 Tage | Einordnung |
|---|---|---|---|
| Po gesamt | 33 | 31 | Hauptziel: oberes sinnvolles Ende (~25-30); das Plus ist bewusst Glute Med |
| Po pro Einheit | 12,5 / 4 / 8,5 / 8 | 11,5 / 9,5 / 10 | ~11 pro Einheit; 4-Tage-Tag A darueber, aber pro Muskel (Glute Max 8,5 / Glute Med 4) klar darunter |
| Glute Med (direkt) | 10 (4/2/2/2) | 10 (3/3/4) | Huefte/Sanduhr: 4x pro Woche (4 Tage) bzw. 3 Einheiten; mehr als ~10-12 bringt kaum noch etwas |
| Beinrueckseite | 10 (3 Beinbeuger + 7 Hueftbeuge) | 10 | definiert, nicht massig |
| Beinvorderseite | 7 (5 Glute & Quad + 2 Beinstrecker) | 7 | bewusst moderat (nicht massig) |
| Adduktoren | 4 | 4 | volle Innenseite, zusaetzlich aus Squats/Lunges |
| Ruecken / Schultern | 7 / 7 | 5 / 5 | schlanker, trainierter Oberkoerper + V-Form |
| Brust / Arme | 2 / indirekt | 2 / indirekt | minimal (Wunsch) |
| Bauch | 8 | 6 | 2 pro Trainingstag (Wunsch) |
Ergebnis: passt zu den Zielen. Glute Med ist mit 10 jetzt am sinnvollen oberen Ende — weiter ueber
Gewicht/Reps steigern statt ueber Saetze. Einziger Hinweis: werden UEBER LAENGERE
ZEIT nur 3-Tage-Wochen trainiert, liegen Ruecken/Schultern mit 5 am unteren Ende — dann je 1 Satz
mehr erwaegen. Ab jetzt entscheiden Steigerung (Gewicht/Reps), Ernaehrung (Protein, leichter
Ueberschuss fuer Po-Aufbau) und Schlaf mehr als weitere Saetze.

---

## Tests (seit 26.09.2026)

`sh tests/run.sh` startet einen lokalen Server und fuehrt alle Playwright-Tests aus (iPhone-
Breite, simulierte Daten, echte Nutzerdaten werden nie beruehrt). **Vor JEDEM Deploy laufen
lassen — am Ende muss "ALLE TESTS GRUEN" stehen.** Neue Funktionen/Bugfixes bekommen einen
eigenen Test (Datei tests/<thema>.test.js, Exit-Code 1 bei Fehler). Details: tests/README.md.
Blockierte Google Fonts im Sandbox-Netz sind kein Fehler; gezaehlt werden nur JS-Exceptions.
run.sh startet jeden Test zweimal (Ausgabe + Exit-Code) — ein sporadischer "ABBRUCH" in der Ausgabe
bei trotzdem "ALLE TESTS GRUEN" ist NICHT egal: Ursache suchen (07.10.2026: Rennen in funktion.test.js,
Tasten im Dropdown vor dem Fokus — togDrop setzt den Fokus erst nach 20 ms; Tests muessen nach dem
Oeffnen per waitForFunction auf den Fokus im .drop-search-Feld warten).
Bei Aenderungen an Vorwert-/Vergleichslogik zusaetzlich ein VORHER/NACHHER-VERGLEICH: alte
(git show <commit>:index.html) und neue index.html mit realistischen Daten nebeneinander laden
(Zyklus 1 alt mit Markern, Zyklus 2 in Woche 1/2, 3/4-Tage-Wechsel, gleiche Uebung an mehreren
Tagen), fuer jede Zeile Uebung/Vorwert/Quelle/Badge/Hinweis vergleichen — JEDER Unterschied muss
durch die gewollte Aenderung erklaert sein, gespeicherte Daten muessen gleich bleiben.
Achtung beim Aufraeumen von Testservern: NICHT `pkill -f "http.server …"` — das trifft die eigene
Shell (Exit 144). Server mit `&` starten, PID merken (`P=$!`), `kill $P`.

---

## Deployment

Standard (Claude-Session): `sh tests/run.sh` gruen -> BUILD_ID hochzaehlen -> direkt auf main
committen und pushen (NIE einen claude/...-Branch auf GitHub anlegen) — GitHub Pages baut
automatisch, nach ~2 Min live unter https://nicolehahn2890.github.io/Trainingsapp/

Fallback (manuell, ohne Session):
1. index.html herunterladen
2. github.com/nicolehahn2890/Trainingsapp > index.html > Stift-Symbol
3. Strg+A > Entf > Strg+V > Commit changes
4. ~2 Min warten > Live-URL pruefen

---

## Aenderungs-Historie (Kurzfassung, neueste zuerst)

NEU. **Pruefung aller Aenderungen vom 07.10.2026 + SKILL-Abgleich (ohne App-Aenderung).** (1) Vorher/
   Nachher-Vergleich (3275d42 vs. a4de686) mit Rexi-aehnlichen Daten (Z1 alt, Z2 W1 mit Tag A/B fertig,
   Tag C angefangen; Variante W2 als 3-Tage-Woche): 0 JS-Fehler, alle Unterschiede durch die gewollten
   Regeln erklaert, gespeicherte Daten gleich (einzige Ausnahme: andere Tag-D-Vorauswahl durch 4-8,
   siehe carryMap). (2) Unabhaengige Code-Pruefung: last()-Neufassung gegen naive Referenz auf 15.000
   Zufallspositionen 0 Abweichungen; migGXRange auf 12 Zufallsdatensaetzen korrekt und idempotent;
   ~1.500 Ansichten ohne Fehler/undefined/NaN; Tempo wie vorher. Keine Bugs. Bekannt und bewusst
   gelassen: Vorwert-Reihenfolge in alten Zyklen mit gleicher Nummer (siehe Vergleichslogik, Grenze).
   (3) SKILL.md auf den Stand gebracht: Vergleichslogik/Progressionssystem (fruehere Wochen, eigene
   Zeile), exIndex, carryMap-Folge, Tests (Vorher/Nachher, Fokus-Rennen), neuer Abschnitt ARBEITSWEISE.

NEU. **Fokus-Zeilen ohne Wdh.-Bereiche (07.10.2026, Version 2026-10-07-04).** Wunsch: die Bereiche unter
   den Tagesnamen ("4–8 Wdh. · …") braucht es nicht — sie stehen an jeder Uebung. Entfernt in P4, P3 und
   P3_V2 (z. B. "Beinvorderseite · Innenschenkel"). Test in glute-max-48 (Plan + Anzeige).

NEU. **Glute Max 4-8 statt 8-12: 4 Tage Tag D, 3 Tage Tag C (07.10.2026, Version 2026-10-07-03).**
   Wunsch: auch an Tag D (bzw. 3-Tage Tag C, Partnerzeile) schwer. Saetze und Volumen unveraendert, nur der
   Bereich. Bereits trainierte 8-12-Wochen behalten ihren Bereich ueber das neue Feld r0 (migGXRange, Merker
   pv__gx48, auch beim Backup-Import) — Anzeige, Vorwerte, Farben und Steigerungs-Hinweis dieser Wochen bleiben
   bei 8-12; neue Wochen vergleichen im 4-8-Bereich (ohne eigenen 4-8-Wert mit dem 4-8-Satz von Tag A der
   Vorwoche). Uebersicht: Wochen mit anderem Bereich wie eine andere Uebung (grau, nicht im kg-Zugewinn,
   "Davor: 8–12 Wdh."). findLastExData beschleunigt (Suche von hinten, Plan/Partner-Kennung im Index vorberechnet;
   vorher ~3x langsameres Rendern). Test funktion: Tasten erst nach Fokus im Dropdown-Suchfeld (Rennen mit
   dem 20-ms-Fokus in togDrop, trat mit langsamerem Rendern ~1 von 6 Laeufen auf). Neuer Test
   tests/glute-max-48.test.js; randfaelle Fall 1 auf Tag A 8-12 umgestellt. Alle 17 Testreihen gruen.

NEU. **Vergleich mit der Vorwoche statt mit einem anderen Tag derselben Woche (07.10.2026, Version
   2026-10-07-02).** Wunsch: dieselbe Uebung im gleichen Bereich an zwei Tagen einer Woche soll mit der
   Vorwoche verglichen werden, weil innerhalb einer Woche nicht gesteigert werden muss. findLastExData:
   die aktuelle Woche zaehlt nie als Vorwert; die eigene Zeile (gleicher Platz oder Partnerzeile) hat
   Vorrang vor juengeren Werten anderer Tage im selben Zyklus. Neuer Test tests/vorwert-vorwoche.test.js
   (gegen den alten Stand 9 Fehler); vorwert-zyklusstart verschaerft (Tag C/D aendern sich durch Tag A/B
   derselben Woche gar nicht mehr). Alle 16 Testreihen gruen.

NEU. **Vorwert in Woche 1 nach anderen Tagen derselben Woche (07.10.2026, Version 2026-10-07-01).**
   Screenshot Z2 W1 Tag C: Hip Thrust 6-10 zeigte "(zuletzt 145) · Z2 W1 · Tag A · 4–8 Wdh.", die
   8-12-Zeile "(zuletzt 142) · Z2 W1 · Tag C · 6–10 Wdh." — das eben getippte Gewicht der Zeile
   darueber (ohne Reps). Ursache: findLastExData bestimmte den "zuletzt trainierten Zyklus" ueber den
   juengsten Eintrag insgesamt; nach Tag A in Woche 1 war das der neue Zyklus, der gleiche Bereich aus
   dem Zyklus davor fiel als "veraltet" raus. Fix: (1) gleicher Bereich aus dem aktuellen Zyklus, sonst
   aus dem zuletzt trainierten Zyklus davor (Bezug nur ueber Eintraege vor dem aktuellen Zyklus),
   (2) die eigene Einheit (gleiche Woche + Tag) zaehlt nie als Vorwert. Plan-Wechsel-Regel (gleicher
   Bereich aus aelterem Zyklus -> Orientierung) unveraendert. Neuer Test tests/vorwert-zyklusstart.test.js;
   alle 15 Testreihen gruen.

NEU. **Tipp Panatta Super Crunch: Atmung + Bauchnabel (04.10.2026, Version 2026-10-04-01).**
   Ausfuehrung ergaenzt: "In der Hebephase kraeftig ausatmen und dabei den Bauchnabel einziehen."
   (forcierte Ausatmung aktiviert den Transversus, kein Gewicht reduzieren). Plan unveraendert —
   Vacuum/Hollowing macht Rexi an Pausentagen zu Hause, NICHT in der App/im Gym-Plan.

NEU. **Mehr Glute Med: 10 Saetze pro Woche (04.10.2026, Version 2026-10-04-02).** Wunsch: Fokus Huefte.
   4 Tage: zweite Glute-Med-Zeile 2x8-12 in Tag A direkt nach der ersten (70 Saetze, 18/18/19/15),
   ohne 3-Tage-Partner — P3-Tag-A-Partnerzeilen ab Glute & Quad um eins verschoben. 3 Tage: Glute Med
   Tag A und Tag B 3 statt 2 Saetze (62 Saetze, 23/20/19); Umrechnung bereits trainierter Wochen per
   migGMSets (s0, Zusatzsaetze 2+1 -> 3+0, Merker pv__gm3), auch beim Backup-Import. Eingetragene
   4-Tage-Wochen sortiert repairSlots per Kategorie ein, die neue Zeile bleibt dort leer; im neuen Zyklus
   wird sie ohne Dopplung vorbelegt. Neuer Test tests/glute-med.test.js; tag-a-erweiterung (jetzt alle
   drei frueheren Tag-A-Fassungen), flex-woche, gesamtcheck, planwechsel, randfaelle angepasst.

NEU. **Fixes aus der unabhaengigen Code-Pruefung (02.10.2026, Version -04).** (1) Vorwert im
   gleichen Rep-Bereich aus der anderen Wochenart desselben flexiblen Zyklus wurde ignoriert
   (findLastExData verglich praefixierte Zyklen) -> nur Orientierung, kein Badge. (2) carryMap:
   Partnerzeilen-Uebernahme nur bei flexibler Quell-Nummer (sonst gewann eine aeltere Wahl).
   (3) impBackup laeuft durch alle Start-Korrekturen. (4) Beinbeuger Tag C 2 -> 3 Saetze:
   migBBSets/s0 (trainierte Wochen behalten Satzzahl, "+"-Satz umgerechnet). (5) setPlan speichert
   bei unlesbaren Daten nicht. Neuer Test tests/randfaelle.test.js; 13 Testreihen gruen.
   BEWUSST NICHT GEAENDERT (bekannt, klein): alte Zyklen merken sich die 3/4-Tage-Ansicht nicht
   mehr ueber einen Abstecher in einen flexiblen Zyklus; doppelte Uebung in einem Tag (Partner-
   zeilen ohne Abgleich) wird von Hand getauscht; Abfrage-Fenster ohne Fokus-Falle (nur Tastatur);
   repairSlots verwirft beim Start geleerte Zeilen ohne Werte (exercise '', aelteres Verhalten) —
   die Zeile erbt danach wieder die Uebung der Vorwoche.

NEU. **Abschluss-Check (02.10.2026).** Neuer Dauertest tests/gesamtcheck.test.js (49 Pruefungen:
   Konsistenz-Audit, Update eines realistischen Altstands ohne Datenverlust, alle 288 Ansichten
   ohne undefined/NaN, kompletter Zyklus mit gemischten 3/4-Tage-Wochen bis W12 und Uebergang,
   Layout 390/430 px, Backup-Rundreise). Volumen-Check gegen die Ziele (Abschnitt Trainingsziele).
   Hinweis: repairSlots sortiert Keys beim Start nach Woche/Tag — Vergleiche auf "unveraendert"
   deshalb inhaltlich (sortierte Keys), nicht ueber die rohe JSON-Reihenfolge. 12 Testreihen gruen.

NEU. **Beinbeuger nur 1x pro Woche mit 3 Saetzen (02.10.2026, Version -03).** 4 Tage: Zeile in
   Tag A gestrichen, Tag C 3x8-12 (68 Saetze, 16/18/19/15); 3 Tage hatte es schon (Tag B).
   Partnerzeilen der 3-Tage-Woche (Adduktoren/Bauch Tag A) nachgezogen. Eingetragene Wochen der
   alten 7er- und 8er-Fassung von Tag A sortiert repairSlots ein, Beinbeuger-Werte daraus werden
   geparkt (bleiben gespeichert). tag-a-erweiterung neu, hersteller/planwechsel/flex-woche angepasst;
   alle 11 Testreihen gruen.

NEU. **3-Tage Tag B: nur zwei Glute-Max-Zeilen (02.10.2026, Version -02).** Wunsch: nicht 3x
   Glute Max an einem Tag. Dritte Zeile (2x8-12, Partner 4-Tage Tag B) gestrichen -> 60 Saetze
   (22/19/19), Glute Max 13/Woche. Kurz eingetragene Werte dieser Zeile parkt repairSlots
   (bleiben gespeichert), der Rest rutscht per Kategorie. Test in flex-woche; alle Reihen gruen.

NEU. **Flexible 3/4-Tage-Woche, 3-Tage-Plan V3, Uebungswechsel-Abfrage (02.10.2026, Version
   2026-10-02-01).** (1) "3 Tage"/"4 Tage" gelten pro Woche (wt__-Marker, weekPt/syncPt),
   Vorauswahl = Vorwoche; Partnerzeilen P3 <-> P4 (t, TWIN4, slotEntry) teilen Uebung,
   Zusatzsaetze, Verlauf, Steigerungs-Hinweis, Auto-Satz und Uebersicht. Alte Zyklen (pv__-Marker)
   unveraendert mit globalem Umschalter. (2) 3-Tage-Plan V3 mit 62 Saetzen (vorher 56); bisheriger
   Plan als P3_V2, 3-Tage-Zyklen mit V2-Werten bekommen Marker 2 (markV3, auch beim Backup-Import).
   (3) Uebungswechsel ab Woche 2 fragt "Nur diese Woche" (Feld base) / "Ab jetzt im Zyklus";
   Label "nur diese Woche". Neues Abfrage-Fenster (showSheet). Neue Tests flex-woche +
   uebungswechsel; planwechsel/hersteller angepasst; alle 11 Testreihen gruen.

NEU. **Hersteller-Varianten Leg Curls + Beinstrecker (30.09.2026, Version -02, Korrektur -03).**
   Beinbeuger: Leg Curls sitzend (Precor), Leg Curls liegend (Panatta) + (Precor); Beinstrecker
   Maschine (Panatta) + (Precor). Leg Curls sitzend (Panatta) in -03 wieder raus (gibt es nicht).
   Alte Namen bleiben bekannt (RETIRED), alte Eintraege unveraendert, neue Zyklen schlagen sie nicht
   vor. 142 Uebungen gesamt. Neuer Test tests/hersteller.test.js; planwechsel angepasst;
   alle 9 Testreihen gruen.

NEU. **Badge immer in der 2. Zeile (30.09.2026, Version 2026-09-30-01).** "= Gleich" stand auf
   breiten iPhones neben der Uebungsauswahl, "↑ Gewicht"/"↓ Weniger" darunter. Badge + ✓ jetzt in
   .ex-status (eigene Zeile, leer unsichtbar). Neuer Test tests/badge-zeile.test.js (390 + 430 px,
   alter Code rot bei 430 px); alle 8 Testreihen gruen.
   Hinweis 28.09.: Die Textauswertung ("→ Weniger Gewicht") NICHT wieder einbauen — Badge reicht
   (ausdruecklich so bestaetigt).

NEU. **Steigerungs-Hinweis verschwindet bei fertiger Uebung (28.09.2026, Version 2026-09-28-01).**
   Bug: bei gleichem oder weniger Gewicht blieb "▲ Gewicht steigern" nach dem letzten Satz
   stehen (verschwand nur bei mehr Gewicht). exState liefert jetzt done (gleiche Regel wie der
   Erledigt-Haken), incDue blendet bei done aus; Satz wieder leeren -> Hinweis kommt zurueck.
   Badge/Auswertung unveraendert. Test in steigerung.test.js; alle 7 Testreihen gruen.

NEU. **4 Tage, Tag B ohne Arme + Steigerungs-Hinweis-Fix (27.09.2026, Version -05).**
   (1) Bizeps und Trizeps aus Tag B gestrichen (Wunsch: sonst zu viel) — Tag B 8 Uebungen /
   18 Saetze, Fokuszeile "Rücken · Schultern". Eingetragene Arm-Werte bleiben gespeichert
   (geparkt hinter dem Plan), Bauch rutscht per Kategorie an Platz 8. (2) Bug: beim Vorblaettern
   (z. B. W5 bei leerer W4) zeigte "▲ Gewicht steigern" den Wert aus W3 — jetzt nur mit Vorwert
   aus derselben oder der Vorwoche. (3) repairSlots parkt Eintraege ohne passende Zeile hinter
   dem Plan statt ggf. auf einer sichtbaren fremden Zeile. Tests: tag-b-erweiterung (8er/9er/
   10er-Aufteilung, Arme geparkt), steigerung (leere Vorwoche); alle 7 Testreihen gruen.

NEU. **4 Tage, Tag B: zweite Schulteruebung 2x8-12 (27.09.2026, Version -04).** Neue Zeile nach
   Schultern 3x8-12; eingetragene Wochen (8er- und 9er-Aufteilung) rutschen per Kategorie an die
   richtige Stelle. tests/tag-b-erweiterung.test.js deckt beide Aufteilungen ab; alle gruen.

NEU. **4 Tage, Tag B: zweite Rueckenuebung 2x8-12 (27.09.2026, Version -03).** Neue Zeile nach
   Ruecken 3x6-10; eingetragene Wochen rutschen per Kategorie (repairSlots) an die richtige
   Stelle. carryMap verbessert: bereits gespeicherte Uebungen des Tages gelten als vergeben,
   gleicher Rep-Bereich zuerst — sonst blieb die neue Zeile leer bzw. doppelte sich. Neuer Test
   tests/tag-b-erweiterung.test.js; alle 7 Testreihen gruen.

NEU. **4 Tage, Tag A: Glute & Hams 2x4-8 ergaenzt (27.09.2026, Versionen -01/-02; zuerst 8-12,
   auf Wunsch 4-8 — schwerer Tag).**
   Neue Zeile nach Glute & Quad (Reihenfolge-Regel, Bauch bleibt letzte). Bereits eingetragene
   Wochen in der alten 7er-Aufteilung sortiert repairSlots per Kategorie um — dafuer gilt der
   Leg-Curl-Alias nur noch in alten Zyklen (sonst blieb Beinbeuger in der neuen G&H-Zeile).
   Dazu: Eintraege mit Werten ohne Uebungsname werden nie mehr verworfen, peach_v4_pre_fix_last
   sichert den Stand vor jeder Reparatur, V2_REORDER fuer P4 Tag A aus. Neuer Test
   tests/tag-a-erweiterung.test.js; alle 6 Testreihen gruen.

NEU. **Steigerungsregel + Tests im Repo + Doku-Abgleich (26.09.2026, Version -10).**
   (1) Hinweis "▲ Gewicht steigern" nach der Peach-Regel (incCand/incDue), dezent in der
   Zeile "3 Saetze · 4–8 Reps". (2) Ordner tests/ mit 5 Testreihen + run.sh (alle gruen).
   (3) SKILL.md komplett gegen den Code abgeglichen (veraltete Stellen zu VW-Hinweis, Hinweis-
   texten, initKey, exState, Uebersicht, Backup korrigiert).

NEU. **Vorwert: eine Regel fuer alle Wochen (26.09.2026, Version -09).** Woche 1 zeigte bei
   Hip Thrust 4-8 den Wert aus dem 8-12-Satz desselben Tages (135 kg), Woche 2 den richtigen
   4-8-Wert (148 kg). Jetzt: gleicher Bereich zuerst (wenn aus dem zuletzt trainierten
   Zyklus), sonst juengster Wert anderer Bereich zur Orientierung. Test: W1 = W2 fuer alle 30
   Uebungen des 4-Tage-Plans mit Rexis Verlauf.

NEU. **Kompletter Bugcheck (26.09.2026, Version -08).** 3 Playwright-Reihen, 89 Pruefungen:
   Start/Rendering aller 288 Ansichten, Layout 390 px, Eingaben (Uebung, Gewicht, Reps, Fokus,
   Haken, Tages-Zaehler), Saetze +/- (max. 5), Vererbung, Badges live, prog()/parseWeight-
   Logik inkl. Spannen/Komma/assistiert, Auto-Zusatzsatz, Navigation + Position merken,
   Wochen-Auswahl, Dropdown (Suche, Tastatur, Esc), Tipps/Notiz/Einstellung, Uebersicht,
   Backup Export/Import, Plan-Versionen, Uebernahme, Rexis echter Verlauf, Robustheit.
   Gefunden + behoben: (1) unlesbares peach_v4 wurde beim Start ueberschrieben (durch
   migPlanV2 vom selben Tag) — jetzt Kopie + keine Start-Speicherung ohne Daten;
   (2) fehlgeschlagenes Speichern blieb unbemerkt — jetzt rote Warnung unten.

NEU. **Vorwert + Uebernahme planuebergreifend nach Aktualitaet (26.09.2026, Version -07).**
   Im neuen 4-Tage-Zyklus 2 kam der Vorwert aus 4-Tage Z1 W3 (Juni), weil der gleiche Plan
   Vorrang hatte — Rexi hatte danach aber den ganzen 3-Tage-Zyklus 1 trainiert. Jetzt zaehlt
   in findLastExData und carryMap immer der juengste Eintrag aus beiden Plaenen. Test mit
   genau diesem Verlauf (4 Tage Z1 W1-3, 3 Tage Z1 W1-12, dann 4 Tage Z2) gruen.

NEU. **Vorwert-Fehler behoben + Texte entschlackt (26.09.2026, Versionen -04 bis -06).**
   (1) Im neuen Zyklus kamen Vorwerte bei geaendertem Rep-Bereich aus dem anderen Plan
   (Z2 W3, 4-Tage, Juli) statt aus W11 — findLastExData neu (siehe Vergleichslogik).
   (2) Alte Wochen zeigten ueber den Plan-Rueckfall Werte, die erst spaeter kamen
   (P4 Z1 W1 "zuletzt 148 · Z1 W12 · 3-Tage") — Rueckfall jetzt nur auf fruehere Eintraege.
   (3) "0 0 0" unter den Rep-Feldern, wenn der Vorwert keine Reps hatte — entfernt.
   (4) Uebungs-Vorbelegung auch ueber ausgelassene Wochen (inhEx).
   (5) Texte gekuerzt, Dopplungen raus ("VW:"-Zeile -> "zuletzt: Z2 W11 · Tag C",
   "(zuletzt 42)" am Gewicht, Woche-12-Hinweis ein Satz, Fokus-Zeilen, Tipps). Woche-1-
   Hinweis komplett entfernt (Wunsch). Neue Regel: Abschnitt TEXT-STIL.

NEU. **Aussagekraeftige Tagesnamen + Woche direkt waehlen (26.09.2026, Version -03).**
   (1) Neue Plaene: Titel nennt den Schwerpunkt (3 Tage: Po Kraft / Po & Beinrueckseite /
   Hüfte & Sanduhr; 4 Tage: Po Kraft / Oberkoerper & Po / Po & Beinrueckseite / Po-Volumen
   & Beine), darunter eine Fokus-Zeile (Feld f). (2) Wochen-Auswahl: Tipp auf "W x / 12"
   oeffnet ein 1-12-Raster statt durch alle Wochen zu klicken. Verifiziert: 34 Playwright-
   Pruefungen + Screenshots 390 px.

NEU. **V2-Tage umsortiert: Fokus-Uebungen zuerst (26.09.2026, Version -02).** Wunsch: pro Tag
   erst Glute Max, dann Glute Med, dann restliche Po-/Bein-Uebungen, dann Oberkoerper, Bauch
   zuletzt. Saetze/Rep-Bereiche unveraendert. Weil die erste V2-Fassung schon ~1 Std. live
   war, sortiert migOrderV2() evtl. bereits eingetragene Tage inhaltsbasiert um (sonst
   landete z. B. Hip Thrust 6-10 in der 8-12-Zeile). Verifiziert: 30 Playwright-Pruefungen
   inkl. Umsortierung, Idempotenz und unberuehrten Eintraegen in neuer Reihenfolge.
   AUSSERDEM: Die Session hatte zusaetzlich auf ihren Arbeitsbranch gepusht — Rexi will
   das NICHT. Nur main pushen, keine claude/...-Branches auf GitHub anlegen.

NEU. **Neue Trainingsplaene (Version 2), Beinbeuger/Beinstrecker, Zyklen 1-6 (26.09.2026).**
   Ausloeser: Stagnation, Einheiten ueber 2 h, neue Ziele (definierte Beine, Sanduhr).
   Recherche: Original-Peach-Tabellen im PDF (3 Tage 7 Uebungen/15 Saetze, 4 Tage 6/13) waren
   deutlich schlanker als der App-Plan (67/84 Saetze); Glute Med war mit 12-14 Saetzen fast
   verdreifacht. Athena (FPS) wurde ueber die Launch-Mails recherchiert und auf Wunsch NICHT
   uebernommen. Neue Plaene siehe oben (56/67 Saetze, Po-Volumen am oberen sinnvollen Ende,
   Bauch als letzte Uebung jeden Tag, keine Supersaetze). Technik:
   (1) Plan-Versionen: alte Plaene als P3_V1/P4_V1, Marker pv__[Zyklus] fuer alle Zyklen mit
   Werten (markLegacy/migPlanV2, auch beim Backup-Import), planOf(cy) ueberall — alte
   Zyklen sehen exakt aus wie vorher, neue nutzen die neue Aufteilung (Regel 13).
   (2) Neue Kategorien Beinbeuger (Leg Curls sitzend NEU + stehend/liegend + Nordic Curls,
   aus Glute & Hams verschoben — keine Dopplung) und Beinstrecker (Maschine, einbeinig),
   Tipps + REC-Sterne; ALIAS haelt alte Leg-Curl-Eintraege in ihren Glute-&-Hams-Zeilen.
   (3) Uebungsauswahl wird in den neuen Zyklus uebernommen (carryMap/inhEx, nach Kategorie).
   (4) Zyklen 1-6 statt 1-3 (kompakte Nummern-Pills mit Label "Zyklus"), Woche-12-Hinweis
   nennt den neuen Plan. Verifiziert per Playwright mit simulierten Altdaten (26 Pruefungen:
   Marker, Altdaten byte-gleich, alter/neuer Plan je Zyklus, Uebernahme inkl. Leg Curls ->
   Beinbeuger, keine Dopplung, Idempotenz, Backup-Import, Zyklus 5 gemerkt) + Konsistenz-Audit.

NEU. **Woche 1 ohne Vergleich + keine Deload-Woche mehr (23.09.2026).** (1) In Woche 1
   jedes Zyklus steigt Rexi bewusst leichter ein — exState setzt noCmp=true: kein
   Fortschritts-Badge, kein Wochenbalken, der VW-Hinweis wird zur Klammer-Zeile "(Zur
   Orientierung – zuletzt: …) Woche 1: leichter einsteigen, kein Vergleich". Vorwerte neben
   dem Gewichtsfeld und unter den Rep-Feldern bleiben als Orientierung. (2) Rexi macht keine
   Deload-Woche: Woche 12 wurde rechnerisch schon wie Woche 2-11 behandelt, nur der Banner
   empfahl noch 50-60 % Gewicht / 2 Saetze. Er weist jetzt nur auf das Zyklus-Ende und den
   leichten Einstieg in Woche 1 hin. Die Orientierungs-Werte in Woche 1 kommen damit aus
   Woche 12 (echter letzter Wert). BUILD_ID 2026-09-23-02. Verifiziert per node --check und
   Chromium-Test (Z2 W1 ohne Badge/Balken mit Klammer-Zeile aus Z1 W12, Z2 W2 und Z1 W12
   mit normalem "↑ Gewicht").

NEU. **Bauch: "Panatta Side Crunch" als 14. Bauch-Uebung.** Seitliche Crunch-Maschine
   (Obliques) mit Maschinen-Tipp im Standard-Format (Drehachse auf Beckenkamm, Hueftpolster
   fixiert das Becken, oberes Polster seitlich an die Rippen; rein seitlich einrollen, nicht
   nach vorne drehen). Bewusst KEIN REC-Stern und im Tipp der Hinweis auf leichtes bis
   mittleres Gewicht: schwere Obliques-Arbeit arbeitet gegen das Ziel "schmale Taille".
   Rein additiv (nur EXERCISES + TIPS, 137 Uebungen gesamt), keine Plan- oder Datenaenderung,
   BUILD_ID 2026-09-16-01. Verifiziert per node --check, Konsistenz-Check (Tipps/REC/
   Duplikate) und Chromium-Render mit gesetzter Uebung an Tag B.

NEU. **Glute & Hams: zwei Leg-Curl-Varianten statt einer Sammel-Option.** "Leg Curl
   (Maschine)" ist ersetzt durch "Leg Curls stehend" und "Leg Curls liegend" — beide mit
   eigenem Maschinen-Tipp (Einstell-Checkliste fuer 169 cm + Ausfuehrungs-Cues) und
   REC-Stern; die uebrigen neun Glute-&-Hams-Uebungen bleiben unveraendert (136 Uebungen
   gesamt). Bestehende Daten benennt migLegCurl() auf "Leg Curls liegend" um
   (Workout-Eintraege, tip__ex__, set__ex__): ohne das kennt CATOF den alten Namen nicht
   mehr, repairSlots() faende keine passende Zeile und haenge den Eintrag ans Ende des
   Tages, und Notiz + Einstellung waeren verwaist. Kein Guard noetig — nach dem Lauf gibt
   es den alten Namen nicht mehr.
   Dabei aufgefallen und mitbehoben: **`_exIdx` wurde erst NACH save() mit `let`
   deklariert**, weshalb jedes Speichern beim Start in einen TDZ-Fehler lief, den die
   try/catch verschluckten — repairSlots() heilte nur im Speicher und schrieb nie zurueck.
   Deklaration nach vorne gezogen; daraus die neue Regel 12. Verifiziert im Browser mit
   simulierten Altdaten (Umbenennung persistiert, Slot bleibt an Ort und Stelle, Vorwert
   und Badge stimmen, zweiter Start aendert nichts) plus Konsistenz-Check ueber alle 136
   Uebungen.

NEU. **Heruntergesetzter Gewichtsrahmen zaehlte nicht als weniger Gewicht.** Rexi setzte
   den Rahmen von 45 auf "40-45" (bzw. 19 auf "17-19") herunter — die App verglich aber nur
   den OBEREN Wert, sah 45 gegen 45 und meldete ueber die Reps "Mehr Wiederholungen ✓",
   obwohl ein Teil der Saetze leichter lief. Neu vergleicht cmpWeight() beide Grenzen:
   zuerst den Bestwert (oben; bei assistierten Uebungen unten), bei Gleichstand die zweite
   Grenze. Damit ist "40-45" nach 45 ein 'd' ("Weniger Gewicht - kein Problem!"), "42-45"
   nach "40-45" ein 'w', und die alte Regel "glatter Einzelwert schlaegt Spanne" faellt als
   Sonderfall automatisch mit heraus (isWeightRange() wird nicht mehr gebraucht und ist
   entfernt). hintHTML() begruendet 'd' jetzt ebenfalls ueber cmpWeight, sonst stand dort
   nur "Kein Problem!" ohne Grund. Verifiziert per Node-Funktionstest (24 Faelle inkl.
   assistierter Richtung, Komma-Werten und leerem Feld) und Chromium-Render beider
   Screenshot-Situationen.

NEU. **Nachtrag 4: Reparatur ueber die Kategorie statt ueber den Versatz.** Rexis echter
   Datenexport zeigte, dass die Verschiebung MEHRFACH angewendet worden war: Brust-,
   Schulter- und Bauch-Eintraege lagen 4-5 Positionen zu weit hinten, teilweise ausserhalb
   des Plans und damit unsichtbar. Der bisherige repairSlots() korrigierte nur genau eine
   Position und griff deshalb nicht, obwohl die richtige Version auf dem Geraet war.
   Neu ordnet repairSlots() jeden Eintrag ueber CATOF der Zeile zu, in die seine Uebung
   kategorisch gehoert — versatzunabhaengig, in zwei Durchgaengen (passend sitzende bleiben
   liegen, der Rest wandert in die naechste freie Zeile seiner Kategorie). Leere
   Platzhalter fallen weg, Eintraege mit Werten werden nie verworfen. Verifiziert gegen
   Rexis echten Export: die App erzeugt exakt das offline gepruefte Ergebnis (48 Eintraege
   gerueckt, alle 250 Werte und 26 Notizen erhalten), ist idempotent und laesst korrekte
   Daten unangetastet. Daraus die neue Regel 11b.

NEU. **Nachtrag 3: Die Reparatur kam gar nicht erst an — Auto-Update jetzt inhaltsbasiert.**
   Nachtrag 2 war live, auf dem iPhone aber weiter der alte Stand. Ursache: checkUpdate()
   setzte peach_ver auf den neuen Commit-SHA, BEVOR feststand, dass der neue Inhalt auch
   ankommt. Lieferte GitHub Pages waehrend des Deploys noch die alte Datei aus, galt die
   Version als geholt und es wurde nie wieder versucht — dauerhaft alter Stand, ohne dass
   man es merkt. Neu: checkUpdate() holt die ausgelieferte index.html von der eigenen
   Domain (kein API-Limit) und vergleicht deren BUILD_ID mit der eigenen; damit zaehlt, was
   tatsaechlich geladen wurde, und ein Fehlversuch heilt beim naechsten Start. Zaehler in
   sessionStorage (max. 2 Versuche/Version) gegen Endlosschleifen. Zusaetzlich:
   repairSlots() laeuft jetzt OHNE Guard bei jedem Start (idempotent), damit die Heilung
   nicht daran haengt, wann die Version ankommt; und es ruehrt eine Woche nur an, wenn der
   eingefuegte Slot LEER ist — sonst waere das Zurueckschieben in die Zeile davor gelaufen
   und haette sie ueberschrieben. Die Version steht jetzt unten in der Uebersicht.
   Verifiziert per Playwright (4 Update-Faelle inkl. hartnaeckigem Cache und Rueckschritt)
   und 7 Reparatur-Faellen inkl. Rexis echtem Datenstand.

NEU. **Nachtrag 2: Wochen, die waehrend des Fehlers trainiert wurden, doppelt verschoben.**
   Die Migration schob STUR jede Woche um +1. Rexi hatte Woche 6 aber schon eingetragen,
   waehrend die Adduktoren-Zeile im Plan stand (die Version aktualisierte sich wegen des
   BUILD_TS-Fehlers nicht) — diese Woche lag also bereits in der neuen Aufteilung und wurde
   ein zweites Mal verschoben. Folge: Adduktionsmaschine stand unter "Brust", der
   Adduktoren-Slot war leer, und Woche 7 erbte genau diesen Murks (Symptom aus Rexis Sicht:
   "die Uebungen werden nicht in die Folgewoche uebernommen"). Neu ist repairSlots():
   bewertet ueber CATOF (Uebung -> Kategorie) mit alignScore(), ob die gespeicherten
   Uebungen besser zum Plan passen, wenn man sie um eins zurueckschiebt, und schiebt NUR
   dann zurueck. Korrekte Wochen bleiben unangetastet, ein zweiter Lauf aendert nichts.
   Guard peach_fix_slots, Sicherheitskopie peach_v4_pre_fix. Verifiziert per Node-Test
   (falsch geschobene Woche, korrekte Wochen, Idempotenz, nicht betroffener Tag, leerer
   Datensatz, Geraet ohne gelaufene Erst-Migration) und Chromium-Render von Woche 6 + 7
   inkl. Vorbelegung. Daraus die neue Regel 11a.

NEU. **Auto-Update haengt nicht mehr an einem Datum — BUILD_TS ersatzlos entfernt.**
   Die Migration aus dem naechsten Eintrag war live, kam auf dem iPhone aber nicht an: die
   fehlerhafte Version trug BUILD_TS 07:15Z bei Commit-Zeit 06:55Z (20 Minuten zu weit in
   der Zukunft), der Fix-Commit lag auf 07:05Z. Die Bedingung `remoteDate>BUILD_TS` war
   damit dauerhaft falsch — die kaputte Version hielt sich fuer aktueller als ihre eigene
   Reparatur und haette sich NIE aktualisiert (erst manuelles Neuladen half). checkUpdate()
   vergleicht jetzt nur noch, ob der Commit-SHA von main von peach_ver abweicht: jede
   Abweichung aktualisiert, in beide Richtungen (auch ein Rollback), und es gibt am Deploy
   nichts mehr zu pflegen. Zusaetzlich: verReloading-Flag gegen Mehrfach-Reloads und kein
   Reload, wenn sich peach_ver nicht speichern laesst (Privatmodus -> sonst Endlosschleife).
   Verifiziert per Playwright-Test (5 Faelle: Erstladung, gleicher Commit, neuer Commit,
   blockierter localStorage, Rollback). Daraus die neu gefasste Regel 10.

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
   Zyklus ohne Praefix (Buttons + Zyklus-Ende-Text, frueher Deload-Text). Verifiziert per Node-Funktionstest
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
6. **Auto-Update:** checkUpdate() laedt die App einmal neu, wenn der Commit-SHA von main
   von peach_ver abweicht (GitHub-API, Cache-Buster ?v=sha). Grund: iOS-Webapp-Cache
   friert alte Staende ein. (Urspruenglich datumsbasiert ueber BUILD_TS — siehe Regel 10.)
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

Konsistenz-Audit (zuletzt ausgefuehrt 02.10.2026, laeuft jetzt automatisch in tests/gesamtcheck.test.js): alle 142 Uebungen haben Tipps, keine verwaisten
Tipps/REC-Eintraege, keine Duplikate, Rep-Bereiche plausibel (4-8/6-10/8-12), jede im Plan
verwendete Kategorie (P3/P4 UND P3_V1/P4_V1) existiert in EXERCISES und hat eine Farbe in CC,
prog()/rcol()/autoExtraSets() per Funktionstest verifiziert.
