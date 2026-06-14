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
  peach_ui (zuletzt offene Position: view/week/cy/openDays — getrennt von peach_v4).
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
  Glute Max #EE8FB4, Glute Med #B49DF2, Glute & Quad #E8B86A, Glute & Hams #A7D98C
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
  cy: "cycle1",     // cycle1 / cycle2 / cycle3
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
plan()                  gibt immer P4 zurueck (P3, S.pt, setPlan, updatePlanBtns wurden komplett entfernt)
parseWeight(w)          Parst "25-27" -> 27 (oberer Wert), "27,5" -> 27.5 (Komma -> Punkt)
isWeightRange(w)        true bei echter Spanne ("42-45"), false bei Einzelwert oder "45-45"
prog(cr,pr,cw,pw)       'w'|'r'|'s'|'d' Fortschritts-Status (Reps = Gesamtsumme!)
findLastExData(di,ei,ex) Sucht letzten gespeicherten Wert dieser Uebung (uebungsbasierter Vergleich)
rcol(v,r)               Performance-Farbe, mit der das ganze Rep-Feld gefuellt wird (leer -> weiss)
esc(s)                  HTML-escape
autoExtraSets(di,ei)    0 oder 1. Braucht 3 stagnierende WOCHENVERGLEICHE ('s'/'d') in Folge bei
                        gleicher Uebung -> greift fruehestens in WOCHE 5 (W2vsW1 + W3vsW2 + W4vsW3).
                        Der Guard "if(S.week<4)return 0" ist nur ein Early-Out. Verifiziert per Test.
toggleDay(di)           Accordion: andere Tage schliessen sich automatisch (setzt S.animDay fuer Animation)
onDS(di,ei,v)           Dropdown-Suche — stellt nach renderT() Fokus + Cursor im Suchfeld wieder her
updSetting(di,ei,v)     Speichert Maschinen-Einstellung unter set__ex__[Name] — KEIN renderT!
                        Leerer Wert loescht den Key. Feld (.set-input, Zahnrad-Symbol) erscheint
                        nur wenn eine Uebung gewaehlt ist, zwischen ex-meta und reps-row.
exDone(di,ei)           true wenn Uebung gewaehlt UND alle Saetze der aktuellen Woche Reps haben
refreshDone(di,ei)      Aktualisiert Erledigt-Haken (#done-di-ei) + Tages-Pill (#dc-di) GEZIELT im DOM
                        — wird von updRep aufgerufen, KEIN renderT (Fokus bleibt erhalten)!
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
- Wenn Uebung gewechselt wird, startet Vergleich frisch
- Gewicht: parseWeight() unterstuetzt Bereiche wie "25-27" (nimmt oberen Wert 27) und Komma wie "27,5". Auch renderOv (Uebersicht) nutzt parseWeight() — nie parseFloat(), das gibt bei "42-45" nur 42 zurueck.
- Spanne vs. Einzelwert: cu>pu -> 'w'. Zusaetzlich: glatter Einzelwert auf gleichem Top schlaegt eine Spanne (45 > 42-45 -> 'w'), via Helper isWeightRange(). Zwei gleiche Spannen oder Einzelwerte -> kein 'w'. Gelockerte Spanne (42-45 nach glattem 45) -> kein 'w'.
- Reps: Vergleich ueber GESAMTSUMME aller Saetze, NICHT Satz-fuer-Satz. 12/15 (=27) zaehlt gleich wie 15/12 (=27) -> 's'. Mehr Summe -> 'r', weniger -> 'd'. (Frueher positionsweise -> meldete faelschlich 'd' sobald ein einzelner Satz niedriger war.)
- Fortschritt wird nur berechnet wenn aktuelle Woche tatsaechlich Reps hat
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
  aktuelle Woche (S.week) Peach, andere Wochen Lilac (kein Ring mehr)
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
3. Neue Uebungen in EXERCISES + TIPS eintragen (TIPS-Key muss EXAKT dem EXERCISES-Namen entsprechen!), optional in REC
   Maschinen-Tipps folgen dem Format: "Zahnrad-Emoji Einstellung: ...\nAusfuehrung: ..." —
   Einstell-Checkliste (Gelenk auf Drehachse, Polster-Positionen, Startposition fuer 169 cm)
   plus Ausfuehrungs-Cues, zugeschnitten auf Glute-Fokus / schmale Beine
4. KEIN Grad-Zeichen (°) in Strings im Script — zerstoert den JS-Parser! "Grad" ausschreiben
5. Keine renderT() in updRep/updW
6. plan() gibt immer P4 zurueck — nicht aendern
7. Bei groesseren Aenderungen: Python-Script verwenden, am Ende node --check ausfuehren
8. Sonderzeichen generell meiden in JS-Strings
9. Gewicht IMMER mit parseWeight() parsen, nie parseFloat() — sonst geht der obere Bereichswert verloren ("42-45" -> 42)
10. Bei JEDEM Deploy die Konstante BUILD_TS in index.html aktualisieren: auf Commit-Zeit
    plus ca. 5 Minuten setzen (ISO-UTC). Sonst laden aktuelle Clients einmal unnoetig neu.

---

## Trainingsplan 4-Tage (P4) — einziger aktiver Plan

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
| Brust | 2 | 8-12 |
| Schultern | 2 | 8-12 |
| Bauch | 2 | 8-12 |

---

## Uebungslisten (vollstaendig, aktueller Stand)

Glute Max (13): Hip Thrusts Langhantel, Hip Thrust Kurzhantel, Hip Thrusts Multipresse, Hip Thrust Maschine, Glute Bridge Langhantel, Glute Bridge Kurzhantel, Glute Bridge Multipresse, Kabel Kickback Stehend, Kabel Kickback Flachbank, Kabel Kickback Schraegbank, Kabel Kickback Liegend, Kickback Multipresse, Kickback Maschine

Glute Med (8): Kabel Abduktion Stehend, Kabel Abduktion Liegend, Kabel Abduktion Schraegbank, Abduktionsmaschine, Pelvic Drop, Abduktionsmaschine stehend, Fire Hydrants Kabel, 3D Abduktor Maschine

Glute & Quad (11): Low Bar Squat, Beinpresse 45 Grad, Beinpresse, Step Ups, Split Squat Kurzhantel, Split Squat Langhantel, Split Squat Multipresse, Hack Squat, Reverse Lunge, Belt Squat, Super Squat

Glute & Hams (10): RDL Langhantel, RDL Kurzhanteln, RDL Maschine, Belt Squat RDL, Glute Hyperextensions, Reverse Hack RDL, Good Mornings, Single-Leg RDL, Nordic Curls, Leg Curl (Maschine)

Ruecken (20): LH Rudern, KH Rudern, KH Rudern (breit), Rudern Kabel (eng), Rudern Kabel (breit), Rudermaschine (Panatta), Rudermaschine (Precor), Latzug (eng), Latzug (breit), Latzug Maschine (Panatta), Latzug Maschine (Precor), Ueberzug am Kabel, T Bar Rudern (neutral), T Bar Rudern (breit), Assistierter Klimmzug (eng), Assistierter Klimmzug (breit), Face Pull Kabel, Straight-Arm Pulldown, Einarmiger Latzug Kabel, Diverging Low Row

Brust (15): LH Bankdruecken, KH Bankdruecken, Bankdruecken Multipresse, Bankdruecken Maschine, LH Schraegbankdruecken, KH Schraegbankdruecken, Schraegbankdruecken Multipresse, Schraegbankdruecken Maschine, Brustpresse (Panatta), Brustpresse (Precor), Butterfly Maschine, Flys von oben Kabel, Flys von unten Kabel, Flachbank KH Flys, Schraegbank KH Flys

Schultern (14): KH Seitheben, Vorgebeugtes KH Seitheben, Seithebemaschine (sitzend), Seithebemaschine (stehend), Seitheben Kabel, Vorgebeugtes Seitheben Kabel, LH Ueberkopfdruecken, KH Ueberkopfdruecken, Ueberkopfmaschine, Butterfly Reverse Maschine, Butterfly Reverse Kabel, Upright Row Kabel, Arnold Press, Einarmiges Ueberkopfdruecken Kabel

Bizeps (12): SZ Curls, LH Curls, KH Curls, Kabel Curls, KH Hammer Curls, SZ Preacher Curls, KH Preacher Curls, Bizeps Maschine, Konzentrations Curls, Spinne Curls, Kabel Curls einarmig, Reverse Curls

Trizeps (10): SZ Skullcrusher, Enges Bankdruecken, Pushdown Kabel, Pushdown Kabel einarmig, SZ Ueberkopf Tri. Druecken, KH Ueberkopf Tri. Druecken, Kabel Ueberkopf Tri. Druecken, Dips Maschine, Trizeps Maschine, KH Kickback Trizeps

Bauch (13): Crunches, Crunches am Kabelzug, Panatta Super Crunch, Panatta Low Crunch, Panatta High Crunch, Bauch Maschine (Precor), Beinheben (Liegend), Beinheben (Haengend), Reverse Crunch, Dead Bug, Ab Rollout, Pallof Press, Hollow Body Hold

---

## Panatta/Precor Maschinen-Varianten

Bauch: Panatta Super Crunch, Panatta Low Crunch, Panatta High Crunch, Bauch Maschine (Precor)
Ruecken: Rudermaschine (Panatta), Rudermaschine (Precor), Latzug Maschine (Panatta), Latzug Maschine (Precor)
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
- Reps werden als Gesamtsumme verglichen, nicht satzweise (Reihenfolge der Saetze egal)
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

NEU. **Neobrutalism-Redesign + Dark Mode entfernt:** Komplettes Re-Skin auf das neue
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
0. **Position merken:** saveUI() speichert die zuletzt offene Position (view/week/cy/openDays)
   im eigenen Key peach_ui; beim Start validiert zurueckgeladen. Grund: Beim App-Wechsel/
   Schliessen ging alles zu und man startete wieder in Woche 1. peach_v4 bleibt unberuehrt.
1. **Auto-Update:** checkUpdate() laedt die App einmal neu, wenn auf main ein neuerer
   Commit liegt (GitHub-API, Cache-Buster ?v=sha, Guard peach_ver). Grund: iOS-Webapp-
   Cache friert alte Staende ein. ACHTUNG: BUILD_TS bei jedem Deploy aktualisieren (Regel 10)!
2. **Daten-Backup:** Export/Import unten in der Uebersicht (bk-card). expBackup kopiert
   JSON in die Zwischenablage, impBackup spielt es ein (Validierung + confirm).
   Anlass: Trainingsdaten lagen im Container des ALTEN Home-Screen-Icons —
   jede Oeffnungsart (Safari/Chrome/jedes Icon) hat auf iOS einen EIGENEN localStorage!
3. **Home-Screen-Icon (iPhone):** apple-touch-icon.png (180x180, Pixel-Pfirsich auf
   Header-Gradient) + apple-mobile-web-app-title. Nachgebessert mit manifest.json
   ("display": "browser"), weil iOS 16.4+ Home-Screen-Links sonst als Web-App mit
   leerem localStorage oeffnet (siehe Warnung im Design-System).
4. **Tipp-Notizen statt Override:** Standard-Tipp immer sichtbar, eigene Texte als
   "Deine Notiz" zusaetzlich darunter. savTip loescht Key bei leerem Text.
5. **Maschinen-Einstellungen:** 38 Maschinen-Tipps mit Einstell-Checkliste
   (Zahnrad-Emoji + "Einstellung:" / "Ausfuehrung:"), zugeschnitten auf 169 cm / 56 kg /
   Glute-Fokus. Neues Feld "Meine Einstellung" pro Uebung (set__ex__Name).
6. **Heller Modus:** CSS-Variablen :root / :root.light, Sonne/Mond-Button im Header,
   Key peach_theme, theme-color-Meta wechselt mit.
7. **Design-Update:** Karten mit Verlauf/Schatten, Animationen (fadeSlide/dropIn),
   Tages-Pill "x/y Uebungen", Erledigt-Haken pro Uebung (live via refreshDone),
   groessere Touch-Ziele, 16px-Inputs gegen iOS-Zoom, kompakter Header.
8. **Code-Review davor:** uebungsbasierter Vergleich (findLastExData), Reps als
   Gesamtsumme, parseWeight fuer Spannen/Komma, P3/Plan-Umschalter entfernt,
   Dropdown-Such-Fokus-Fix, REC-Stern im Dropdown, veraltete Duplikat-PDF geloescht.

Konsistenz-Audit (zuletzt ausgefuehrt): alle 126 Uebungen haben Tipps, keine verwaisten
Tipps/REC-Eintraege, keine Duplikate, Rep-Bereiche plausibel (4-8/6-10/8-12),
prog()/rcol()/autoExtraSets() per Funktionstest verifiziert.
