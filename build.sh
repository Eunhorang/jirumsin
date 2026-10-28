#!/bin/bash
# 지름신 퇴치소 — src/ 조각을 합쳐 index.html(아티팩트 게시용)과 preview.html(로컬 미리보기용)을 만든다.
set -euo pipefail
cd "$(dirname "$0")"
{
  cat src/head.html
  echo '<style>'
  cat src/style-1.css src/style-2.css
  echo '</style>'
  cat src/body.html
  echo '<script>'
  echo '(() => {'
  echo '"use strict";'
  cat src/data-items.js src/data-cats.js src/engine.js src/render.js src/ai.js src/app.js
  echo '})();'
  echo '</script>'
} > index.html
{
  echo '<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style></head><body>'
  cat index.html
  echo '</body></html>'
} > preview.html
echo "built index.html: $(wc -c < index.html | tr -d ' ') bytes"
