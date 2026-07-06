#!/usr/bin/env bash
# 플레이어블 소재를 허브에 추가/갱신하고 GitHub Pages로 배포한다.
#
# 사용법:
#   ./publish.sh <폴더명> <빌드된-HTML경로> ["메모(선택)"]
#
# 예) gacha 갱신 (먼저 소스에서 빌드해두고):
#   cd ../playable_cc_01_gacha
#   node build.js --config /path/to/CC_Gacha_YYYY-MM-DD.json
#   cd ../playables
#   ./publish.sh playable_cc_01_gacha ../playable_cc_01_gacha/dist/playable-gacha.html "1차 리뷰본"
#
# 동작: HTML 복사 → meta.json 갱신(제목/게임/번호/컨셉/날짜/메모) → 목록 재생성 → commit → push
set -euo pipefail
# .command 더블클릭 등 비대화형 실행에서도 git/gh/node 를 찾도록 PATH 보강
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
cd "$(dirname "$0")"

NAME="${1:?폴더명을 입력하세요 (규칙: playable_<게임>_<번호>_<컨셉>, 예: playable_cc_02_puzzle)}"
SRC="${2:?빌드된 HTML 경로를 입력하세요}"
NOTE="${3:-}"

[ -f "$SRC" ] || { echo "❌ 파일 없음: $SRC"; exit 1; }

mkdir -p "$NAME"
cp "$SRC" "$NAME/index.html"

# meta.json 작성 (폴더명 파싱 + HTML title). createdAt 은 최초 1회만 기록, updatedAt 은 매번 갱신.
TITLE="$(grep -o '<title>[^<]*' "$NAME/index.html" | head -1 | sed 's/<title>//')"
FOLDER="$NAME" TITLE="$TITLE" NOTE="$NOTE" DATE="$(date +%Y-%m-%d)" node -e '
  const fs = require("fs");
  const f = process.env.FOLDER;
  const m = f.match(/^playable_([a-z0-9]+)_(\d+)_(.+)$/i) || [];
  const p = f + "/meta.json";
  let createdAt = process.env.DATE;
  if (fs.existsSync(p)) { try { const o = JSON.parse(fs.readFileSync(p)); if (o.createdAt) createdAt = o.createdAt; } catch {} }
  const meta = {
    title:   process.env.TITLE || f,
    game:    (m[1] || "").toLowerCase(),
    num:     m[2] || "",
    concept: m[3] || "",
    note:    process.env.NOTE || "",
    createdAt,
    updatedAt: process.env.DATE,
  };
  fs.writeFileSync(p, JSON.stringify(meta, null, 2) + "\n");
  console.log("meta:", JSON.stringify(meta));
'

node gen-index.js
git add -A
if git diff --cached --quiet; then
  echo "ℹ️ 변경 없음(동일 내용) — 커밋/푸시 생략"
else
  git commit -m "publish: $NAME" -q
  git push -q
  # Pages(legacy) 빌드 끼임 예방: 최신 커밋으로 강제 재빌드 요청
  gh api -X POST /repos/minwoo-creative-dev/playables/pages/builds >/dev/null 2>&1 || true
fi
echo "✅ 배포 완료 → https://minwoo-creative-dev.github.io/playables/$NAME/"
echo "   목록: https://minwoo-creative-dev.github.io/playables/  (반영 30초~1분)"
