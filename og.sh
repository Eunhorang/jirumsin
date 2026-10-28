#!/bin/bash
# 지름신 퇴치소 — 링크 공유 미리보기 그림 docs/og.png(1200×630)를 src/og.html에서 찍는다.
# Google Chrome과 인터넷 연결(글꼴)이 필요하다. 문구나 디자인을 바꿨을 때만 다시 실행하면 된다.
set -euo pipefail
cd "$(dirname "$0")"
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
PROFILE="$(mktemp -d)"
trap 'rm -rf "$PROFILE"' EXIT
mkdir -p docs
"$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
  --user-data-dir="$PROFILE" --window-size=1200,630 --virtual-time-budget=10000 \
  --screenshot="$PWD/docs/og.png" "file://$PWD/src/og.html" >/dev/null 2>&1
echo "built docs/og.png: $(sips -g pixelWidth -g pixelHeight docs/og.png | awk '/pixel/ {printf "%s ", $2}')px, $(wc -c < docs/og.png | tr -d ' ') bytes"
