---
name: peach-project
description: >
  Use this skill for EVERY request related to the Peach Project — a glute-focused
  fitness tracking app built in standalone HTML, deployed to GitHub Pages.
  Trigger on any mention of: "Trainingsapp", "Peach Project", "Peach App", "Glute",
  "Übungen", "Exercise", "Deload", "Woche", "Trainingsplan", "fitness app",
  "nicolehahn2890.github.io/Trainingsapp", or any request to add/fix/style features
  in the fitness app. Also trigger when the user uploads an HTML file related to the app.
  Never skip this skill for fitness app work — it contains critical context about the
  app's architecture, design system, exercise lists, and deployment workflow.
---

# Peach Project — Skill

## Wer ist die Nutzerin?

**Rexi** — kein Coding-Hintergrund, kein Terminal. Arbeitet ausschließlich über **Claude.ai** (kein Claude Code für diese App). Alle Antworten auf **Deutsch, Du-Anrede**. Schrittweise Erklärungen mit "Was siehst du dann auf dem Bildschirm"-Hinweisen. Niemals Terminal-Befehle zumuten. Deployment immer über das **Browser-Interface von GitHub** (Pencil/Edit oder Upload), nie über Terminal.

---

## Was ist die App?

**Peach Project** ist eine persönliche Glute-Trainings-Tracking-App.

- **Live-URL:** https://nicolehahn2890.github.io/Trainingsapp/
- **Repository:** github.com/nicolehahn2890/Trainingsapp
- **Technologie:** Eine einzige standalone HTML-Datei (kein Framework, kein Build-Schritt, kein npm)
- **Dateiname auf GitHub:** `index.html`
- **localStorage-Key:** `peach_v4` — NIEMALS umbenennen, sonst gehen alle Nutzerdaten verloren

---

## Design-System

| Element | Wert |
|---|---|
| Hintergrund | `#1a1418` (sehr dunkles Aubergine) |
| Header-Gradient | `linear-gradient(160deg, #2e1a28, #1a1418)` |
| Primärfarbe (Pink) | `#C8729A` — Buttons, aktive Tabs, Akzente |
| Sekundärfarbe (Lila) | `#B88CC0` — Zyklus-Buttons, sekundäre Akzente |
| Font | DM Sans (Google Fonts CDN), Gewichte 400/500/600/700/800 |
| Scrollbar | 4px, `#3a2a35` |
| Stil | Dark Mode, weich und feminin, motivierend |

### Logo
Pixel-Art-Pfirsich als SVG (16×16, `shape-rendering: crispEdges`) — kein Emoji.
Der SVG-Code ist in der App direkt im Header eingebettet.

### Kategorie-Farben (CC-Map)
```
Glute Max:    #C8729A  (Pink)
Glute Med:    #B88CC0  (Lila)
Glute & Quad: #C4A882  (Sand)
Glute & Hams: #A8C4A0  (Salbei)
Rücken:       #8AB4C4  (Hellblau)
Brust:        #C4A8A8  (Altrosa)
Schultern:    #B4C4A0  (Hellgrün)
Bizeps:       #C4B8A0  (Beige)
Trizeps:      #A0B4C4  (Blaugrau)
Bauch:        #C0BEA0  (Olivgrün)
```

### Fortschritts-Farben
```
Grün  #7bc47a  — Gewicht gesteigert
Blau  #7aafdf  — Mehr Reps
Gelb  #e8b860  — Gleiche Leistung / Deload-Akzent
Rot   #d86868  — Weniger als Vorwoche
```

---

## App-Architektur

### State-Objekt `S`
```javascript
S = {
  cy:         "cycle1",   // aktiver Zyklus: cycle1 / cycle2 / cycle3
  week:       1,          // aktive Woche: 1–12
  view:       "training", // "training" | "overview"
  data:       {},         // alle localStorage-Daten
  drop:       null,       // offenes Dropdown: {di, ei} oder null
  dropSearch: "",         // Suchbegriff im Dropdown
  tips:       {},         // welche Tipp-Panels offen sind (slotKey → bool)
  tipEdit:    {},         // welche Tips im Edit-Modus (slotKey → bool)
  openDays:   {},         // welche Day-Cards offen sind (dayIndex → bool)
}
```

### Key-Formate
```
Workout-Daten:  [cycle]__w[week]__d[dayIndex]__e[exIndex]
                z.B. "cycle1__w3__d0__e2"

Tipp-Daten:     tip__ex__[Übungsname]
                z.B. "tip__ex__Hip Thrusts Langhantel"
                → gilt über alle Wochen, Tage und Zyklen!

Slot-Key (nur für UI-State wie open/edit):
                tip__[cycle]__w[week]__d[dayIndex]__e[exIndex]
```

### Render-Flow
```
render()
  ├── renderT()   — Training-Tab
  │     ├── WeekProgress-Balken (ab Woche 2)
  │     ├── Deload-Banner (nur Woche 12)
  │     └── forEach Day → renderEx() pro Übung
  └── renderOv()  — Übersicht-Tab (Gewichts-Charts)
```

### Wichtige Hilfsfunktionen
```javascript
mk(cy, week, di, ei)        // → Workout-Key
mkt(cy, week, di, ei)       // → Slot-Key für Tips
initKey(di, ei)             // Initialisiert Key mit Vorwoche-Daten falls noch leer
                            // → IMMER verwenden statt mk() beim Schreiben!
plan()                      // → gibt P3 zurück (aktuell immer 3-Tage-Plan)
prog(reps, prevReps, w, pw) // → 'w' | 'r' | 's' | 'd' (Fortschritts-Status)
rcol(value, repRange)       // → Farbe für Rep-Eingabefeld
esc(s)                      // → HTML-escaped String
autoExtraSets(di, ei, base) // → 0 oder 1 (Auto-Satz bei 3 Wo. kein Fortschritt)
```

---

## Daten-Vererbung zwischen Wochen

**Kritisch:** Beim ersten Schreiben in eine neue Woche wird `initKey()` verwendet — nicht `mk()` direkt. `initKey` prüft ob der Key noch leer ist und befüllt ihn dann mit den Vorwoche-Daten:

```javascript
function initKey(di, ei) {
  const k = mk(S.cy, S.week, di, ei);
  if (!S.data[k]) {
    const pk = S.week > 1 ? mk(S.cy, S.week-1, di, ei) : null;
    const prv = pk ? (S.data[pk] || {}) : {};
    S.data[k] = { exercise: prv.exercise || '', extraSets: prv.extraSets || 0 };
  }
  return k;
}
```

**Was wird vererbt:** `exercise` (ausgewählte Übung) und `extraSets` (manuell hinzugefügte Sätze)
**Was NICHT vererbt wird:** `reps`, `weight` — die werden jede Woche neu eingetragen

---

## Trainingsplan (3-Tage, P3)

### Tag A
| Kategorie | Sätze | Reps |
|---|---|---|
| Glute Max | 3 | 4–8 |
| Glute Max | 2 | 8–12 |
| Glute Med | 2 | 6–10 |
| Glute & Hams | 2 | 4–8 |
| Glute & Quad | 2 | 4–8 |
| Bauch | 2 | 8–12 |
| Rücken | 2 | 6–10 |
| Brust | 2 | 6–10 |

### Tag B
| Kategorie | Sätze | Reps |
|---|---|---|
| Glute & Hams | 2 | 4–8 |
| Glute & Hams | 2 | 6–10 |
| Glute Max | 3 | 6–10 |
| Glute & Quad | 2 | 6–10 |
| Glute Med | 2 | 8–12 |
| Bauch | 2 | 8–12 |
| Rücken | 2 | 8–12 |
| Rücken | 2 | 6–10 |
| Schultern | 2 | 8–12 |

### Tag C
| Kategorie | Sätze | Reps |
|---|---|---|
| Glute Max | 3 | 4–8 |
| Glute Max | 2 | 8–12 |
| Glute Med | 3 | 8–12 |
| Bauch | 2 | 8–12 |
| Brust | 2 | 8–12 |
| Schultern | 2 | 8–12 |
| Schultern | 2 | 6–10 |
| Bizeps | 2 | 8–12 |
| Trizeps | 2 | 8–12 |

---

## Progressionssystem

### Manuell
- **+ Button:** Satz hinzufügen (bis max. 5 Sätze gesamt)
- **− Button:** Satz entfernen (nur sichtbar wenn `extraSets > 0`)
- Satzanzahl wird in Folgewoche übertragen (via `initKey`)

### Automatisch
- Bei **3 Wochen in Folge** ohne Fortschritt (Status `'s'` oder `'d'`) → `autoExtraSets()` gibt 1 zurück
- Zeigt ⚡-Label: "⚡ +1 Satz (3 Wo. kein Fortschritt)"
- Gilt ab Woche 4

### Fortschritts-Logik (`prog()`)
```
'w'  — Gewicht höher als Vorwoche          → grün
'r'  — Reps höher (mind. eine Stelle)     → blau
's'  — Alles gleich                        → gelb
'd'  — Irgendeine Rep-Stelle schlechter   → rot
null — Keine Vorwoche-Daten               → kein Badge
```

---

## Übungslisten (vollständig, Stand aktuell)

**Glute Max (13):**
Hip Thrusts Langhantel, Hip Thrust Kurzhantel, Hip Thrusts Multipresse, Hip Thrust Maschine, Glute Bridge Langhantel, Glute Bridge Kurzhantel, Glute Bridge Multipresse, Kabel Kickback Stehend, Kabel Kickback Flachbank, Kabel Kickback Schrägbank, Kabel Kickback Liegend, Kickback Multipresse, Kickback Maschine

**Glute Med (7):**
Kabel Abduktion Stehend, Kabel Abduktion Liegend, Kabel Abduktion Schrägbank, Abduktionsmaschine, Pelvic Drop, Abduktionsmaschine stehend, Fire Hydrants Kabel

**Glute & Quad (8):**
Low Bar Squat, Beinpresse, Step Ups, Split Squat Kurzhantel, Split Squat Langhantel, Split Squat Multipresse, Hack Squat, Reverse Lunge

**Glute & Hams (8):**
RDL Langhantel, RDL Kurzhanteln, Glute Hyperextensions, Reverse Hack RDL, Good Mornings, Single-Leg RDL, Nordic Curls, Leg Curl (Maschine)

**Rücken (17):**
LH Rudern, KH Rudern, KH Rudern (breit), Rudern Kabel (eng), Rudern Kabel (breit), Rudermaschine (neutral), Rudermaschine (breit), Latzug (eng), Latzug (breit), Überzug am Kabel, T Bar Rudern (neutral), T Bar Rudern (breit), Assistierter Klimmzug (eng), Assistierter Klimmzug (breit), Face Pull Kabel, Straight-Arm Pulldown, Einarmiger Latzug Kabel

**Brust (12):**
LH Bankdrücken, KH Bankdrücken, Bankdrücken Multipresse, LH Schrägbankdrücken, KH Schrägbankdrücken, Schrägbankdrücken Multipresse, Brustpresse, Butterfly Maschine, Flys von oben Kabel, Flys von unten Kabel, Flachbank KH Flys, Schrägbank KH Flys

**Schultern (13):**
KH Seitheben, Vorgebeugtes KH Seitheben, Seithebemaschine, Seitheben Kabel, Vorgebeugtes Seitheben Kabel, LH Überkopfdrücken, KH Überkopfdrücken, Überkopfmaschine, Butterfly Reverse Maschine, Butterfly Reverse Kabel, Upright Row Kabel, Arnold Press, Einarmiges Überkopfdrücken Kabel

**Bizeps (12):**
SZ Curls, LH Curls, KH Curls, Kabel Curls, KH Hammer Curls, SZ Preacher Curls, KH Preacher Curls, Bizeps Maschine, Konzentrations Curls, Spinne Curls, Kabel Curls einarmig, Reverse Curls

**Trizeps (10):**
SZ Skullcrusher, Enges Bankdrücken, Pushdown Kabel, Pushdown Kabel einarmig, SZ Überkopf Tri. Drücken, KH Überkopf Tri. Drücken, Kabel Überkopf Tri. Drücken, Dips Maschine, Trizeps Maschine, KH Kickback Trizeps

**Bauch (10):**
Crunches, Crunches am Kabelzug, Bauch Maschine, Beinheben (Liegend), Beinheben (Hängend), Reverse Crunch, Dead Bug, Ab Rollout, Pallof Press, Hollow Body Hold

---

## Empfohlene Übungen (REC-Set)

Diese Übungen erscheinen im Dropdown **fett mit ★-Symbol** — sie passen am besten zum Ziel (Po aufbauen, Beine schmal, Taille schmal, Schultern breit):

```javascript
// Glute Max
"Hip Thrusts Langhantel", "Hip Thrusts Multipresse", "Hip Thrust Maschine",
"Glute Bridge Langhantel", "Kabel Kickback Liegend", "Kickback Maschine",
// Glute Med
"Abduktionsmaschine", "Kabel Abduktion Liegend", "Abduktionsmaschine stehend",
// Glute & Quad (wenig Quad, viel Po)
"Reverse Lunge", "Split Squat Kurzhantel", "Split Squat Langhantel", "Split Squat Multipresse",
// Glute & Hams
"RDL Langhantel", "Glute Hyperextensions", "Single-Leg RDL", "Leg Curl (Maschine)",
// Rücken (Lat-Fokus → V-Form → optisch schmalere Taille)
"Latzug (breit)", "Assistierter Klimmzug (breit)", "Straight-Arm Pulldown", "Überzug am Kabel",
// Schultern (Seitenkopf → breite Schultern → optisch schmalere Taille)
"KH Seitheben", "Seitheben Kabel", "Seithebemaschine",
// Bauch (Transversus → echte Taillenverschmälerung)
"Pallof Press", "Hollow Body Hold"
```

---

## Tipp-System

- **Standard-Tipps:** ~80 Übungen mit Ausführungshinweisen, hardkodiert im `TIPS`-Objekt
- **Custom-Tipps:** Nutzer kann eigene Tipps speichern → persistent via localStorage
- **Tipp-Key:** `tip__ex__[Übungsname]` → gilt für **alle** Wochen, Tage und Zyklen
- **Slot-Key:** Nur für Open/Edit-UI-State (pro Slot, nicht geteilt)
- **Indikator:** "● angepasst" erscheint wenn Custom-Tipp vorhanden

### Wichtige Tipp-Inhalte (Trainingsziel-relevant)
- **Low Bar Squat, Beinpresse, Hack Squat:** ⚠️-Warnung über Fußstellung (weit = Po, eng = Quad)
- **Split Squat, Reverse Lunge:** ✅-Empfehlung als beste Wahl für schmale Beine
- **Pallof Press, Hollow Body Hold:** Transversus-Übungen für echte Taillenverschmälerung
- **Latzug (breit), Assistierter Klimmzug (breit):** Lat-Fokus für V-Taper

---

## Deload-Banner (Woche 12)

Erscheint automatisch am Ende der Trainingstage in Woche 12:
- Goldene Umrahmung (`#e8b860`), dunkler Gradient-Hintergrund
- Hinweis auf Deload-Woche mit allen Durchführungshinweisen:
  - 50–60% des normalen Gewichts
  - 2 Sätze pro Übung
  - Gleiche Übungen, kein Experimentieren
  - Kein Muskelabbau in 1 Woche

---

## Dropdown-Verhalten

- Öffnet sich per Klick auf das Übungsfeld
- Suche filtert in Echtzeit (`oninput`)
- Schließt sich beim Klick außerhalb (document click listener)
- Smart-Positioning: öffnet nach oben wenn zu nah am unteren Rand
- Empfohlene Übungen: fett + ★ in Kategoriefarbe
- Bereits ausgewählte Übung: fett + Kategoriefarbe + Hintergrund-Highlight
- `data-val` Attribut für korrekte Wertübergabe (verhindert dass ★ mitgenommen wird)

---

## Rep-Eingabefelder

- Jeder Satz hat eine eigene Eingabe (S1, S2, ...)
- Farbe der Border: grün (im Zielbereich), gelb (unteres Ende), grau (leer), rot (zu wenig)
- Darunter: Vorwoche-Wert — immer sichtbar, `"0"` wenn kein Vorwoche-Eintrag (für gleichmäßige Höhe)
- Grauer „0"-Wert (`#444`) signalisiert: kein echter Vorwoche-Wert vorhanden
- `oninput` UND `onchange` für sofortige Speicherung

---

## Häufige Fehler / Was zu beachten ist

### 1. initKey statt mk beim Schreiben
```javascript
// FALSCH — verliert Vorwoche-Daten:
const k = mk(S.cy, S.week, di, ei);
S.data[k] = { ...( S.data[k] || {}), weight: v };

// RICHTIG:
const k = initKey(di, ei);
S.data[k] = { ...S.data[k], weight: v };
```

### 2. localStorage-Key nie ändern
`peach_v4` ist der einzige Key — jede Änderung löscht alle Nutzerdaten.

### 3. Neue Übungen immer in drei Stellen eintragen
- `EXERCISES`-Objekt (Dropdown-Liste)
- `TIPS`-Objekt (Ausführungshinweis, kann leer bleiben)
- `REC`-Set (nur wenn empfohlen)

### 4. Tipp-Key-Format beachten
```javascript
// Datenspeicherung (übungsbasiert):
const tk = cur.exercise ? 'tip__ex__' + cur.exercise : mkt(S.cy, S.week, di, ei);

// UI-State open/edit (slot-basiert):
const slotKey = mkt(S.cy, S.week, di, ei);
```

### 5. Keine renderT() in Rep/Gewicht-Update-Funktionen
`updRep()` und `updW()` rufen **kein** `renderT()` auf — das würde den Input-Fokus zerstören während man tippt.

---

## Deployment-Workflow (für Rexi, kein Terminal)

1. Neue `index.html` aus dem Chat herunterladen
2. GitHub öffnen: github.com/nicolehahn2890/Trainingsapp
3. Auf `index.html` klicken → Stift-Symbol (✏️) → „Edit this file"
4. **Strg+A** → **Entf** → neuen Inhalt einfügen → **Strg+V**
5. Oben rechts „Commit changes" → nochmal bestätigen
6. ~1–2 Minuten warten → live unter https://nicolehahn2890.github.io/Trainingsapp/

**URL beachten:** Großes „T" in `/Trainingsapp/`

---

## Trainingsziele (für inhaltliche Entscheidungen)

- **Priorität 1:** Maximale Glute-Entwicklung (Volumen, Formgebung)
- **Priorität 2:** Schmale Taille (Anti-Rotation, Transversus, V-Taper durch Lats)
- **Priorität 3:** Schmale Beine (wenig Quad-Hypertrophie — Übungswahl kritisch!)
- **Priorität 4:** Breite Schultern (Seitheben-Varianten > Drücken)

Bei **Glute & Quad**: Immer Fußstellung/Tiefe erwähnen. Enge Fußstellung + Tiefe = Quad. Weite Fußstellung + erhöhte Ferse = Po.
