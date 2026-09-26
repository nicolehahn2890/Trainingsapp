# Tests der Peach-App

Browser-Tests mit Playwright (Chromium, iPhone-Breite 390 px). Sie laufen gegen die echte
`index.html` mit simulierten Trainingsdaten in `localStorage` — deine echten Daten auf dem
iPhone werden dabei nie beruehrt.

**Vor jedem Deploy ausfuehren:** `sh tests/run.sh` (am Ende muss `ALLE TESTS GRUEN` stehen).

| Datei | Prueft |
|---|---|
| `funktion.test.js` | Rendering aller 288 Ansichten, Layout, Eingaben, Saetze, Badges, Vergleichslogik, Auto-Zusatzsatz, Navigation, Tipps, Uebersicht, Backup, Robustheit |
| `planwechsel.test.js` | Alte Zyklen behalten ihren Plan, neue Zyklen den neuen, Uebernahme der Uebungen, Reihenfolge, Leg Curls nur unter Beinbeuger |
| `verlauf-planwechsel.test.js` | Echter Verlauf: 4 Tage Z1 W1-3 -> 3 Tage Z1 W1-12 -> 4 Tage Z2 |
| `verlauf-woche1-2.test.js` | Woche 1 und 2 zeigen denselben Vorwert (gleicher Rep-Bereich zuerst) |
| `steigerung.test.js` | Hinweis "Gewicht steigern" nach der Peach-Regel |

Voraussetzung: Node.js mit `playwright` (in Claude-Cloud-Sessions vorinstalliert).
Blockierte Google Fonts (Sandbox-Netz) sind kein Fehler — gezaehlt werden nur echte JS-Exceptions.
