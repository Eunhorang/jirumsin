#!/bin/bash
# 지름신 퇴치소 — src/ 조각을 합쳐 두 파일을 만든다.
#   index.html      claude.ai 아티팩트 게시용(문서 머리는 아티팩트가 씌운다)
#   docs/index.html GitHub Pages로 공개하는 완전한 페이지(로컬 미리보기에도 쓴다)
set -euo pipefail
cd "$(dirname "$0")"
styles() {
  echo '<style>'
  cat src/style-1.css src/style-2.css
  echo '</style>'
}
script() {
  echo '<script>'
  echo '(() => {'
  echo '"use strict";'
  cat src/data-items.js src/data-cats.js src/engine.js src/render.js src/ai.js src/card.js src/app.js
  echo '})();'
  echo '</script>'
}
{
  cat src/head.html
  styles
  cat src/body.html
  script
} > index.html
mkdir -p docs
{
  echo '<!doctype html>'
  echo '<html lang="ko">'
  echo '<head>'
  echo '<meta charset="utf-8">'
  echo '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
  cat src/head.html src/web-head.html
  styles
  echo '</head>'
  echo '<body>'
  cat src/body.html
  script
  echo '</body>'
  echo '</html>'
} > docs/index.html
touch docs/.nojekyll
echo "built index.html: $(wc -c < index.html | tr -d ' ') bytes, docs/index.html: $(wc -c < docs/index.html | tr -d ' ') bytes"
