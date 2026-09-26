#!/bin/sh
# Fuehrt alle Browser-Tests der Peach-App aus (Playwright/Chromium, iPhone-Breite 390 px).
# Startet dafuer einen lokalen Server im Repo-Root. Aufruf: sh tests/run.sh
cd "$(dirname "$0")/.." || exit 1
PORT=${PORT:-8799}
python3 -m http.server "$PORT" >/dev/null 2>&1 &
SRV=$!
sleep 1
export PEACH_URL="http://127.0.0.1:$PORT/index.html"
FAIL=0
for t in tests/*.test.js; do
  echo "=== $t"
  node "$t" | grep -E "^(FAIL|ERGEBNIS|ALL PASS|FAILS|ABBRUCH)" || true
  node "$t" >/dev/null 2>&1 || FAIL=1
done
kill "$SRV" 2>/dev/null
[ "$FAIL" = 0 ] && echo "ALLE TESTS GRUEN" || echo "MINDESTENS EIN TEST ROT"
exit "$FAIL"
