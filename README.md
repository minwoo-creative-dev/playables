# playables — 리뷰 공유용 허브

플레이어블 소재를 링크로 공유하기 위한 정적 호스팅 repo입니다.
각 소재는 **빌드된 단일 HTML만** 하위 폴더에 담기며, 소스코드는 포함하지 않습니다.

- 목록 페이지: https://minwoo-creative-dev.github.io/playables/
- 개별 소재: https://minwoo-creative-dev.github.io/playables/<폴더명>/

> ⚠️ 링크를 아는 사람은 누구나 열 수 있는 공개 링크입니다(비밀번호 없음, 검색 노출은 안 됨).

## 새 소재 추가 / 갱신

로컬 소재 폴더에서 빌드한 뒤 `publish.sh`로 올립니다.

```bash
# 1) 소재 빌드 (예: gacha)
cd /Volumes/Minwoo_4TB/DEVSISTERS/01_Creative/develop/playable_cc_01_gacha
npm run build

# 2) 허브 repo에서 배포
cd /path/to/playables
./publish.sh playable_cc_01_gacha /Volumes/Minwoo_4TB/DEVSISTERS/01_Creative/develop/playable_cc_01_gacha/dist/playable-gacha.html
```

`publish.sh`가 하위 폴더 복사 → 목록 페이지(index.html) 재생성 → commit → push 까지 한 번에 처리합니다.

## 소재 내리기

```bash
rm -rf <폴더명> && node gen-index.js && git add -A && git commit -m "remove: <폴더명>" && git push
```
