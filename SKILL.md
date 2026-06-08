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
Deployment immer ueber GitHub Browser-Interface (Stift-Symbol, Strg+A, Inhalt ersetzen, Commit).

---

## Was ist die App?

- Live-URL: https://nicolehahn2890.github.io/Trainingsapp/
- Repository: github.com/nicolehahn2890/Trainingsapp
- Technologie: Standalone HTML-Datei (kein Framework, kein Build-Schritt)
- Dateiname: index.html
- localStorage-Key: peach_v4 — NIEMALS umbenennen!
- Gym: Workshop Fitness Barcelona, Carrer d'Avila 120, El Poblenou. Panatta, Precor, Rogue, Eleiko, TRX.

---

## Design-System

Hintergrund: #1a1418
Header-Gradient: linear-gradient(160deg, #2e1a28, #1a1418)
Primaerfarbe Pink: #C8729A
Sekundaerfarbe Lila: #B88CC0
Font: DM Sans (Google Fonts CDN)
Logo: Pixel-Art-Pfirsich SVG 16x16, shape-rendering crispEdges

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
  pt: 4,            // immer 4 (3-Tage-Plan wurde entfernt)
  view: "training", // "training" | "overview"
  data: {},
  drop: null,
  dropSearch: "",
  tips: {},
  tipEdit: {},
  openDays: {},     // mobile-friendly: standardmaessig zu, Accordion-Stil
}
```

### Key-Formate
```
Workout:  [cycle]__w[week]__d[dayIdx]__e[exIdx]
Tipp:     tip__ex__[Uebungsname]  (gilt ueber alle Wochen/Tage/Zyklen!)
Slot:     tip__[cycle]__w[week]__d[dayIdx]__e[exIdx]  (nur UI-State)
```

### Wichtige Funktionen
```
mk(cy,week,di,ei)       Workout-Key
mkt(cy,week,di,ei)      Slot-Key
initKey(di,ei)          Key mit Vorwoche-Daten init — IMMER statt mk() beim Schreiben!
plan()                  gibt immer P4 zurueck (P3 wurde entfernt)
parseWeight(w)          Parst "25-27" -> 27 (oberer Wert), "27,5" -> 27.5 (Komma -> Punkt)
prog(cr,pr,cw,pw)       'w'|'r'|'s'|'d' Fortschritts-Status (Reps = Gesamtsumme!)
findLastExData(di,ei,ex) Sucht letzten gespeicherten Wert dieser Uebung (uebungsbasierter Vergleich)
rcol(v,r)               Farbe fuer Rep-Eingabefeld
esc(s)                  HTML-escape
autoExtraSets(di,ei)    0 oder 1 (Auto-Satz nach 3 Wo. kein Fortschritt, nur bei gleicher Uebung)
toggleDay(di)           Accordion: andere Tage schliessen sich automatisch
updatePlanBtns()        leer — no-op, Buttons wurden entfernt
```

### Vergleichslogik (wichtig!)
- Fortschrittsvergleich nutzt findLastExData() — vergleicht mit letztem Wert DIESER Uebung
- Wenn Uebung gewechselt wird, startet Vergleich frisch
- Gewicht: parseWeight() unterstuetzt Bereiche wie "25-27" (nimmt oberen Wert 27) und Komma wie "27,5". Auch renderOv (Uebersicht) nutzt parseWeight() — nie parseFloat(), das gibt bei "42-45" nur 42 zurueck.
- Reps: Vergleich ueber GESAMTSUMME aller Saetze, NICHT Satz-fuer-Satz. 12/15 (=27) zaehlt gleich wie 15/12 (=27) -> 's'. Mehr Summe -> 'r', weniger -> 'd'. (Frueher positionsweise -> meldete faelschlich 'd' sobald ein einzelner Satz niedriger war.)
- Fortschritt wird nur berechnet wenn aktuelle Woche tatsaechlich Reps hat
- WeekProgress-Balken nutzt ebenfalls findLastExData()
- autoExtraSets bricht Streak ab wenn Uebung gewechselt wurde

### Mobile-Optimierung
- Tage standardmaessig ZUGEKLAPPT (`S.openDays[di]===true` zum Aufklappen)
- Accordion-Verhalten: aufklappen eines Tages schliesst alle anderen
- Spart Scrollen auf dem iPhone

### Daten-Vererbung zwischen Wochen
Vererbt: exercise, extraSets — NICHT: reps, weight

---

## WICHTIGE CODING-REGELN

1. initKey statt mk() beim Schreiben verwenden
2. peach_v4 nie umbenennen
3. Neue Uebungen in EXERCISES + TIPS eintragen
4. KEIN Grad-Zeichen (°) in Strings im Script — zerstoert den JS-Parser! "Grad" ausschreiben
5. Keine renderT() in updRep/updW
6. updatePlanBtns() ist leer — nicht befuellen
7. plan() gibt immer P4 zurueck — nicht aendern
8. Bei groesseren Aenderungen: Python-Script verwenden, am Ende node --check ausfuehren
9. Sonderzeichen generell meiden in JS-Strings
10. Gewicht IMMER mit parseWeight() parsen, nie parseFloat() — sonst geht der obere Bereichswert verloren ("42-45" -> 42)

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

Glute & Hams (10): RDL Langhantel, RDL Kurzhaenteln, RDL Maschine, Belt Squat RDL, Glute Hyperextensions, Reverse Hack RDL, Good Mornings, Single-Leg RDL, Nordic Curls, Leg Curl (Maschine)

Ruecken (20): LH Rudern, KH Rudern, KH Rudern (breit), Rudern Kabel (eng), Rudern Kabel (breit), Rudermaschine (Panatta), Rudermaschine (Precor), Latzug (eng), Latzug (breit), Latzug Maschine (Panatta), Latzug Maschine (Precor), Ueberzug am Kabel, T Bar Rudern (neutral), T Bar Rudern (breit), Assistierter Klimmzug (eng), Assistierter Klimmzug (breit), Face Pull Kabel, Straight-Arm Pulldown, Einarmiger Latzug Kabel, Diverging Low Row

Brust (15): LH Bankdruecken, KH Bankdruecken, Bankdruecken Multipresse, Bankdruecken Maschine, LH Schraegbankdruecken, KH Schraegbankdruecken, Schraegbankdruecken Multipresse, Schraegbankdruecken Maschine, Brustpresse (Panatta), Brustpresse (Precor), Butterfly Maschine, Flys von oben Kabel, Flys von unten Kabel, Flachbank KH Flys, Schraegbank KH Flys

Schultern (14): KH Seitheben, Vorgebeugtes KH Seitheben, Seithebemaschine (sitzend), Seithebemaschine (stehend), Seitheben Kabel, Vorgebeugtes Seitheben Kabel, LH Ueberkopfdruecken, KH Ueberkopfdruecken, Ueberkopfmaschine, Butterfly Reverse Maschine, Butterfly Reverse Kabel, Upright Row Kabel, Arnold Press, Einarmiges Ueberkopfdruecken Kabel

Bizeps (12): SZ Curls, LH Curls, KH Curls, Kabel Curls, KH Hammer Curls, SZ Preacher Curls, KH Preacher Curls, Bizeps Maschine, Konzentrations Curls, Spinne Curls, Kabel Curls einarmig, Reverse Curls

Trizeps (10): SZ Skullcrusher, Enges Bankdruecken, Pushdown Kabel, Pushdown Kabel einarmig, SZ Ueberkopf Tri. Druecken, KH Ueberkopf Tri. Druecken, Kabel Ueberkopf Tri. Druecken, Dips Maschine, Trizeps Maschine, KH Kickback Trizeps

Bauch (12): Crunches, Crunches am Kabelzug, Panatta Super Crunch, Panatta Low Crunch, Panatta High Crunch, Bauch Maschine (Precor), Beinheben (Liegend), Beinheben (Haengend), Reverse Crunch, Dead Bug, Ab Rollout, Pallof Press, Hollow Body Hold

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
- Auto: 3 Wochen kein Fortschritt = +1 Satz automatisch (ab Woche 4, nur bei gleicher Uebung)
- Satzanzahl + Uebung werden in Folgewoche vererbt
- Gewichtsbereiche ("25-27kg") und Komma ("27,5") werden korrekt ausgewertet (oberer Wert zaehlt)
- Reps werden als Gesamtsumme verglichen, nicht satzweise (Reihenfolge der Saetze egal)
- Vergleich basiert auf letztem Wert dieser Uebung, nicht einfach Vorwoche

---

## Deload-Banner (Woche 12)

Erscheint automatisch in Woche 12. Goldene Umrahmung (#e8b860).
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

1. index.html herunterladen
2. github.com/nicolehahn2890/Trainingsapp > index.html > Stift-Symbol
3. Strg+A > Entf > Strg+V > Commit changes
4. ~2 Min warten > https://nicolehahn2890.github.io/Trainingsapp/
