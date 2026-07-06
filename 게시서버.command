#!/bin/bash
# 플레이어블 게시 서버 시작 (더블클릭용).
# 이 창을 열어두면 에디터의 '🚀 프리뷰 게시' 버튼이 동작합니다. 닫으면 멈춥니다.
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
cd "$(dirname "$0")"
clear
echo "────────────────────────────────────────────"
echo "  🚀 플레이어블 게시 서버"
echo "  에디터의 '프리뷰 게시' 버튼이 이 서버로 전송합니다."
echo "  종료하려면 이 창을 닫으세요."
echo "────────────────────────────────────────────"
node publish-server.js
