#!/bin/bash
# 지름신 퇴치소 — 휴대폰 홈 화면 아이콘을 src/icon.html에서 찍는다.
#   docs/apple-touch-icon.png(180, 아이폰) · docs/icon-192.png · docs/icon-512.png(안드로이드, docs/manifest.webmanifest)
# Google Chrome과 인터넷 연결(글꼴)이 필요하다. 디자인을 바꿨을 때만 다시 실행하면 된다.
set -euo pipefail
cd "$(dirname "$0")"
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
PROFILE="$(mktemp -d)"
trap 'rm -rf "$PROFILE"' EXIT
mkdir -p docs
"$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
  --user-data-dir="$PROFILE" --window-size=1024,1024 --virtual-time-budget=10000 \
  --screenshot="$PROFILE/icon-1024.png" "file://$PWD/src/icon.html" >/dev/null 2>&1
for s in 512 192 180; do
  out="docs/icon-$s.png"; [ "$s" = 180 ] && out=docs/apple-touch-icon.png
  sips -s format png -z "$s" "$s" "$PROFILE/icon-1024.png" --out "$out" >/dev/null
  echo "built $out: $(sips -g pixelWidth -g pixelHeight "$out" | awk '/pixel/ {printf "%s ", $2}')px, $(wc -c < "$out" | tr -d ' ') bytes"
done
