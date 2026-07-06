#!/usr/bin/env bash
# 새 플레이어블을 추가하거나 기존 것을 갱신하고 GitHub Pages에 배포한다.
#
# 사용법:
#   ./publish.sh <프로젝트폴더명> <빌드된-HTML-경로>
#
# 예 (gacha 갱신):
#   cd ../../playable_cc_01_gacha && npm run build && cd -
#   ./publish.sh playable_cc_01_gacha ../../playable_cc_01_gacha/dist/playable-gacha.html
#
set -euo pipefail
cd "$(dirname "$0")"

NAME="${1:?프로젝트 폴더명을 입력하세요 (예: playable_cc_02_puzzle)}"
SRC="${2:?빌드된 HTML 경로를 입력하세요}"

[ -f "$SRC" ] || { echo "❌ 파일 없음: $SRC"; exit 1; }

mkdir -p "$NAME"
cp "$SRC" "$NAME/index.html"
node gen-index.js
git add -A
git commit -m "publish: $NAME" -q
git push -q
echo "✅ 배포 완료 → https://minwoo-creative-dev.github.io/playables/$NAME/"
echo "   (반영까지 30초~1분 정도 걸릴 수 있습니다)"
