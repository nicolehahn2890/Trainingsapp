# Tests der Peach-App

Browser-Tests mit Playwright (Chromium, iPhone-Breite 390 px). Sie laufen gegen die echte
`index.html` mit simulierten Trainingsdaten in `localStorage` — deine echten Daten auf dem
iPhone werden dabei nie beruehrt.

**Vor jedem Deploy ausfuehren:** `sh tests/run.sh` (am Ende muss `ALLE TESTS GRUEN` stehen).

| Datei | Prueft |
|---|---|
| `badge-zeile.test.js` | Badge und ✓ stehen immer in der 2. Zeile unter der Uebungsauswahl (390 und 430 px), keine Leerzeile ohne Badge |
| `funktion.test.js` | Rendering aller 288 Ansichten, Layout, Eingaben, Saetze, Badges, Vergleichslogik, Auto-Zusatzsatz, Navigation, Tipps, Uebersicht, Backup, Robustheit |
| `hersteller.test.js` | Leg Curls liegend / Beinstrecker mit Panatta und Precor, Leg Curls sitzend nur Precor; alte Namen bleiben erhalten, werden in neuen Zyklen nicht vorgeschlagen |
| `planwechsel.test.js` | Alte Zyklen behalten ihren Plan, neue Zyklen den neuen, Uebernahme der Uebungen, Reihenfolge, Leg Curls nur unter Beinbeuger |
| `verlauf-planwechsel.test.js` | Echter Verlauf: 4 Tage Z1 W1-3 -> 3 Tage Z1 W1-12 -> 4 Tage Z2 |
| `verlauf-woche1-2.test.js` | Woche 1 und 2 zeigen denselben Vorwert (gleicher Rep-Bereich zuerst) |
| `steigerung.test.js` | Hinweis "Gewicht steigern" nach der Peach-Regel, nicht beim Vorblaettern mit leerer Vorwoche, weg sobald die Uebung fertig ist |
| `tag-a-erweiterung.test.js` | Neue Zeile in 4-Tage Tag A: vorhandene Wochen werden per Kategorie richtig einsortiert, nichts geht verloren |
| `tag-b-erweiterung.test.js` | 4-Tage Tag B (2. Ruecken, 2. Schulter, ohne Arme): Einsortierung aller frueheren Aufteilungen, Arm-Werte bleiben gespeichert, Vorbelegung ohne Dopplung |

Voraussetzung: Node.js mit `playwright` (in Claude-Cloud-Sessions vorinstalliert).
Blockierte Google Fonts (Sandbox-Netz) sind kein Fehler — gezaehlt werden nur echte JS-Exceptions.
