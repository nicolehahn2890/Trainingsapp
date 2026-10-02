# Tests der Peach-App

Browser-Tests mit Playwright (Chromium, iPhone-Breite 390 px). Sie laufen gegen die echte
`index.html` mit simulierten Trainingsdaten in `localStorage` — deine echten Daten auf dem
iPhone werden dabei nie beruehrt.

**Vor jedem Deploy ausfuehren:** `sh tests/run.sh` (am Ende muss `ALLE TESTS GRUEN` stehen).

| Datei | Prueft |
|---|---|
| `badge-zeile.test.js` | Badge und ✓ stehen immer in der 2. Zeile unter der Uebungsauswahl (390 und 430 px), keine Leerzeile ohne Badge |
| `flex-woche.test.js` | 3 oder 4 Tage pro Woche: 3-Tage-Plan V3 (60 Saetze, Partnerzeilen, Tag B nur 2x Glute Max), Uebernahme in beide Richtungen, Vorwerte/Steigerung/Auto-Satz/Uebersicht ueber beide Wochenarten, Rueckfrage beim Umstellen, alter 3-Tage-Plan (Marker 2) und alte Zyklen unveraendert, Tempo |
| `gesamtcheck.test.js` | Grosser Durchlauf: Konsistenz-Audit (Uebungen, Tipps, Plaene, Partnerzeilen, max. 2x Glute Max pro Tag, Beinbeuger 1x/Woche), Update eines realistischen Altstands ohne Datenverlust, alle 288 Ansichten, kompletter Zyklus mit gemischten 3/4-Tage-Wochen bis Woche 12 und Uebergang, Layout 390/430 px, Backup-Rundreise |
| `funktion.test.js` | Rendering aller 288 Ansichten, Layout, Eingaben, Saetze, Badges, Vergleichslogik, Auto-Zusatzsatz, Navigation, Tipps, Uebersicht, Backup, Robustheit |
| `hersteller.test.js` | Leg Curls liegend / Beinstrecker mit Panatta und Precor, Leg Curls sitzend nur Precor; alte Namen bleiben erhalten, werden in neuen Zyklen nicht vorgeschlagen |
| `planwechsel.test.js` | Alte Zyklen behalten ihren Plan, neue Zyklen den neuen, Uebernahme der Uebungen, Reihenfolge, Leg Curls nur unter Beinbeuger |
| `uebungswechsel.test.js` | Uebungswechsel ab Woche 2: "Nur diese Woche" / "Ab jetzt im Zyklus", Label, Abbrechen, keine Frage in Woche 1 / bei leerer Vorwoche / gleicher Uebung, naechster Zyklus nimmt die Standard-Uebung |
| `verlauf-planwechsel.test.js` | Echter Verlauf: 4 Tage Z1 W1-3 -> 3 Tage Z1 W1-12 -> 4 Tage Z2 |
| `verlauf-woche1-2.test.js` | Woche 1 und 2 zeigen denselben Vorwert (gleicher Rep-Bereich zuerst) |
| `randfaelle.test.js` | Fixes aus der Code-Pruefung 02.10.2026: Vorwert gleicher Bereich ueber 3/4-Tage-Wochen, Uebernahme bei altem 3-Tage-Plan, Backup-Import ohne Neustart richtig, Beinbeuger-Umstellung 2 -> 3 Saetze (s0), unlesbare Daten beim Umschalten |
| `steigerung.test.js` | Hinweis "Gewicht steigern" nach der Peach-Regel, nicht beim Vorblaettern mit leerer Vorwoche, weg sobald die Uebung fertig ist |
| `tag-a-erweiterung.test.js` | 4-Tage Tag A ohne Beinbeuger (seit 02.10.2026): Wochen aus der alten 7er- und 8er-Fassung werden per Kategorie einsortiert, Beinbeuger-Werte geparkt (kein Verlust), Tag C Beinbeuger 3 Saetze |
| `tag-b-erweiterung.test.js` | 4-Tage Tag B (2. Ruecken, 2. Schulter, ohne Arme): Einsortierung aller frueheren Aufteilungen, Arm-Werte bleiben gespeichert, Vorbelegung ohne Dopplung |

Voraussetzung: Node.js mit `playwright` (in Claude-Cloud-Sessions vorinstalliert).
Blockierte Google Fonts (Sandbox-Netz) sind kein Fehler — gezaehlt werden nur echte JS-Exceptions.
