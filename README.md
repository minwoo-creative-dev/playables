# playables — 플레이어블 리뷰 공유 허브

플레이어블 소재를 **링크로 공유**하기 위한 정적 호스팅 repo (GitHub Pages).
각 소재는 **빌드된 단일 HTML만** 폴더별로 담기며, 소스코드는 포함하지 않습니다.

- 갤러리(목록): https://minwoo-creative-dev.github.io/playables/
- 개별 소재: `https://minwoo-creative-dev.github.io/playables/<폴더명>/`

> ⚠️ 링크를 아는 사람은 누구나 열 수 있는 공개 링크입니다(비밀번호 없음). 검색 노출은 안 됩니다(`noindex`).

## 폴더 구조

```
playables/
├─ index.html          # 갤러리 (gen-index.js 가 자동 생성 — 직접 수정 X)
├─ gen-index.js        # 목록 생성기 (폴더 + meta.json 스캔)
├─ publish.sh          # 소재 추가/갱신 원클릭
├─ .nojekyll           # Pages Jekyll 처리 비활성 (언더스코어 폴더 안전)
└─ playable_<게임>_<번호>_<컨셉>/
     ├─ index.html     # 빌드된 플레이어블 (필수)
     ├─ meta.json      # 제목/게임/번호/컨셉/날짜/메모 (publish.sh 가 자동 작성)
     └─ thumb.png      # 썸네일 (선택 — 있으면 갤러리에 표시)
```

폴더명은 `playable_<게임>_<번호>_<컨셉>` 규칙을 따릅니다 (예: `playable_cc_01_gacha`).
게임 코드→표시명 매핑은 `gen-index.js` 상단 `GAME_LABEL` 에서 관리합니다.

## 새 소재 추가 / 갱신

소스 프로젝트(`../playable_*`)에서 빌드한 뒤 `publish.sh` 로 올립니다.

```bash
# 1) 소스에서 데이터(JSON) 포함 빌드
cd ../playable_cc_01_gacha
node build.js --config /path/to/CC_Gacha_2026-07-06.json

# 2) 허브에서 배포 (복사 → meta.json → 목록 재생성 → push)
cd ../playables
./publish.sh playable_cc_01_gacha ../playable_cc_01_gacha/dist/playable-gacha.html "1차 리뷰본"
```

`publish.sh <폴더명> <빌드HTML> ["메모"]` — 메모는 선택. 같은 폴더명으로 다시 실행하면 갱신됩니다.

### 썸네일 넣기 (선택)
소재 에디터의 캡처 기능으로 PNG를 뽑아 `<폴더명>/thumb.png` 로 저장 후 `node gen-index.js && git add -A && git commit -m thumb && git push`.

## 소재 내리기

```bash
rm -rf <폴더명> && node gen-index.js && git add -A && git commit -m "remove: <폴더명>" && git push
```

## 메모
- 데이터는 에디터에서 **📤 내보내기**로 뽑은 `.json` 을 `build.js --config` 에 물려야 소재가 채워집니다. (기본 빌드는 빈 화면)
- 이 repo 는 공개(public). 무료 GitHub Pages 는 public repo 에서만 동작합니다.
