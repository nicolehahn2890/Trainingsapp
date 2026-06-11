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
mehrfach klargestellt.

---

## Was ist die App?

- Live-URL: https://nicolehahn2890.github.io/Trainingsapp/
- Repository: github.com/nicolehahn2890/Trainingsapp
- Technologie: Standalone HTML-Datei (kein Framework, kein Build-Schritt)
- Repo-Dateien: index.html (App), apple-touch-icon.png (Home-Screen-Icon),
  Peach_Project.pdf (Plan-Doku, 41 Seiten), SKILL.md (diese Datei)
- localStorage-Keys: peach_v4 (Trainingsdaten — NIEMALS umbenennen!), peach_theme (Theme-Wahl)
- Gym: Workshop Fitness Barcelona, Carrer d'Avila 120, El Poblenou. Panatta, Precor, Rogue, Eleiko, TRX.

---

## Design-System

### Themes (Dark + Hell)
- Dark Mode ist Standard, heller Modus umschaltbar ueber den runden Sonne/Mond-Button im Header
- ALLE Farben liegen als CSS-Variablen in `:root` (dark) und `:root.light` (hell)
- **NIEMALS Hex-Farben hart in CSS-Klassen oder JS-HTML-Strings schreiben — immer `var(--...)`!**
  Ausnahmen (in beiden Themes identisch): Kategorie-Farben (CC), pbadge/rcol/wp-bar-Balkenfarben,
  tab-btn.active und tip-save (pink mit weissem Text), Fokus-Rahmen #C8729A
- Theme-Speicherung: localStorage-Key `peach_theme` ('light'|'dark') — separat von peach_v4!
- applyTheme() setzt die light-Klasse auf documentElement, das Button-Icon und die theme-color-Meta
- Light Mode: cat-badge und pbadge werden per CSS-filter (brightness/saturate) abgedunkelt fuer Kontrast
- Eingabe-/Akzentfarben (--gold, --green, --blue, --red, --pink, --lilac) sind im hellen Modus dunkler definiert

### Dark-Mode-Basisfarben
Hintergrund: #1a1418
Header-Gradient: linear-gradient(160deg, #2e1a28, #1a1418)
Primaerfarbe Pink: #C8729A
Sekundaerfarbe Lila: #B88CC0
Font: DM Sans (Google Fonts CDN)
Logo: Pixel-Art-Pfirsich SVG 16x16, shape-rendering crispEdges
Favicon: Pfirsich-Emoji als SVG-Data-URI im <head>
Home-Screen-Icon: apple-touch-icon.png (180x180, Pixel-Pfirsich auf Header-Gradient),
verlinkt im <head> zusammen mit apple-mobile-web-app-title "Peach Project"
WICHTIG: NIEMALS apple-mobile-web-app-capable / Web-App-Manifest mit display:standalone
hinzufuegen — Standalone-Modus bekommt auf iOS einen EIGENEN localStorage-Container,
die Trainingsdaten waeren in der Home-Screen-Version scheinbar weg!
Empfohlene Uebungen (REC-Set) erhalten im Dropdown einen goldenen Stern (★)

Kategorie-Farben:
  Glute Max: #C8729A, Glute Med: #B88CC0, Glute & Quad: #C4A882, Glute & Hams: #A8C4A0
  Ruecken: #8AB4C4, Brust: #C4A8A8, Schultern: #B4C4A0, Bizeps: #C4B8A0
  Trizeps: #A0B4C4, Bauch: #C0BEA0

Fortschritts-Farben:
  Gruen #7bc47a = Gewicht gesteigert
  Blau  #7aafdf = Mehr Reps
  Gelb  #e8b860 = Gleiche Leistung / Deload
  Rot   #d86868 = Weniger als Vorwoche

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
  theme: "dark",    // "dark" | "light" — wird beim Start aus peach_theme geladen
}
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
rcol(v,r)               Farbe fuer Rep-Eingabefeld
esc(s)                  HTML-escape
autoExtraSets(di,ei)    0 oder 1. Braucht 3 stagnierende WOCHENVERGLEICHE ('s'/'d') in Folge bei
                        gleicher Uebung -> greift fruehestens in WOCHE 5 (W2vsW1 + W3vsW2 + W4vsW3).
                        Der Guard "if(S.week<4)return 0" ist nur ein Early-Out. Verifiziert per Test.
applyTheme()            Setzt light-Klasse auf documentElement, Button-Icon (Sonne/Mond), theme-color-Meta
toggleTheme()           Wechselt S.theme, speichert unter peach_theme, ruft applyTheme()
toggleDay(di)           Accordion: andere Tage schliessen sich automatisch (setzt S.animDay fuer Animation)
onDS(di,ei,v)           Dropdown-Suche — stellt nach renderT() Fokus + Cursor im Suchfeld wieder her
updSetting(di,ei,v)     Speichert Maschinen-Einstellung unter set__ex__[Name] — KEIN renderT!
                        Leerer Wert loescht den Key. Feld (.set-input, Zahnrad-Symbol) erscheint
                        nur wenn eine Uebung gewaehlt ist, zwischen ex-meta und reps-row.
exDone(di,ei)           true wenn Uebung gewaehlt UND alle Saetze der aktuellen Woche Reps haben
refreshDone(di,ei)      Aktualisiert Erledigt-Haken (#done-di-ei) + Tages-Pill (#dc-di) GEZIELT im DOM
                        — wird von updRep aufgerufen, KEIN renderT (Fokus bleibt erhalten)!
flashView()             Sanfter Einblend-Effekt der aktiven Ansicht (Tab-/Zyklus-/Wochen-Wechsel)
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
- Touch-Ziele vergroessert: week-arrow 34px, add-set-btn 36px, pick-btn min-height 40px, rep-inp 46px breit

### UI-Status-Elemente (Design-Update)
- Tages-Pill im day-header (`#dc-[di]`, Klasse day-count): "x/y Uebungen" — grau (0), pink (teilweise), gruen mit Haken (alle)
- Erledigt-Haken pro Uebung (`#done-[di]-[ei]`, Klasse done-chip): sichtbar wenn exDone() — Toggle via hidden-Klasse
- Beide werden bei Rep-Eingabe LIVE per refreshDone() aktualisiert (gezieltes DOM-Update, kein renderT)
- Uebersicht: Balken mit Farbverlauf, aktuelle Woche (S.week) bekommt Ring (box-shadow, var(--ring))
- Animationen: fadeSlide (Ansicht/Tag aufklappen), dropIn (Dropdown nur beim Oeffnen, nicht bei Suche)
- Einstellungs-Feld (Zahnrad + .set-input): erscheint sobald eine Uebung gewaehlt ist, zwischen
  ex-meta und reps-row. Speichert uebungsbasiert (set__ex__Name) via updSetting() — ohne renderT
- Theme-Button (.theme-btn, #theme-btn): rund, 34px, im header-right neben den Tabs
- Tipp-Panel: Standard-Tipp (TIPS) immer sichtbar; eigene Notiz (tip__ex__) darunter mit
  lila Label "Deine Notiz" (.tip-note, .tip-note-lbl); Editor bearbeitet NUR die Notiz

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

Erscheint automatisch in Woche 12. Goldene Umrahmung (var(--gold)), Hintergrund var(--deload-bg).
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

1. **Home-Screen-Icon (iPhone):** apple-touch-icon.png (180x180, Pixel-Pfirsich auf
   Header-Gradient) + apple-mobile-web-app-title. BEWUSST kein Standalone-Modus,
   damit der localStorage erhalten bleibt (siehe Warnung im Design-System).
2. **Tipp-Notizen statt Override:** Standard-Tipp immer sichtbar, eigene Texte als
   "Deine Notiz" zusaetzlich darunter. savTip loescht Key bei leerem Text.
3. **Maschinen-Einstellungen:** 38 Maschinen-Tipps mit Einstell-Checkliste
   (Zahnrad-Emoji + "Einstellung:" / "Ausfuehrung:"), zugeschnitten auf 169 cm / 56 kg /
   Glute-Fokus. Neues Feld "Meine Einstellung" pro Uebung (set__ex__Name).
4. **Heller Modus:** CSS-Variablen :root / :root.light, Sonne/Mond-Button im Header,
   Key peach_theme, theme-color-Meta wechselt mit.
5. **Design-Update:** Karten mit Verlauf/Schatten, Animationen (fadeSlide/dropIn),
   Tages-Pill "x/y Uebungen", Erledigt-Haken pro Uebung (live via refreshDone),
   groessere Touch-Ziele, 16px-Inputs gegen iOS-Zoom, kompakter Header.
6. **Code-Review davor:** uebungsbasierter Vergleich (findLastExData), Reps als
   Gesamtsumme, parseWeight fuer Spannen/Komma, P3/Plan-Umschalter entfernt,
   Dropdown-Such-Fokus-Fix, REC-Stern im Dropdown, veraltete Duplikat-PDF geloescht.

Konsistenz-Audit (zuletzt ausgefuehrt): alle 126 Uebungen haben Tipps, keine verwaisten
Tipps/REC-Eintraege, keine Duplikate, Rep-Bereiche plausibel (4-8/6-10/8-12),
prog()/rcol()/autoExtraSets() per Funktionstest verifiziert.
