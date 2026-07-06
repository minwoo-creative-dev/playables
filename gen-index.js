#!/usr/bin/env node
/**
 * playables 허브 목록 페이지(index.html) 자동 생성 — 게임별 갤러리.
 *
 * 각 소재 폴더 규칙: playable_<게임>_<번호>_<컨셉>  (예: playable_cc_01_gacha)
 * 폴더 안:
 *   index.html   (필수) — 빌드된 단일 플레이어블
 *   meta.json    (선택) — { title, game, num, concept, updatedAt, createdAt, note }
 *   thumb.png    (선택) — 썸네일 (png/jpg/jpeg/webp)
 *
 * meta.json 이 없으면 폴더명 파싱 + index.html 의 <title> 로 대체한다.
 * 사용: node gen-index.js
 */
const fs = require('fs');
const path = require('path');
const ROOT = __dirname;

// 게임 코드 → 표시명 (필요 시 여기만 추가)
const GAME_LABEL = {
  cc:   'CookieRun',
  ck:   'CookieRun: Kingdom',
  crob: 'CookieRun: OvenBreak',
  cw:   'CookieRun: Witch’s Castle',
  bs:   'BraveNine',
  other:'기타',
};

function titleFromHtml(p) {
  try {
    const fd = fs.openSync(p, 'r');
    const buf = Buffer.alloc(8192);
    const n = fs.readSync(fd, buf, 0, 8192, 0);
    fs.closeSync(fd);
    const m = buf.toString('utf8', 0, n).match(/<title>([^<]*)</i);
    return m ? m[1].trim() : '';
  } catch { return ''; }
}
function thumbFor(dir) {
  for (const t of ['thumb.png', 'thumb.jpg', 'thumb.jpeg', 'thumb.webp']) {
    if (fs.existsSync(path.join(ROOT, dir, t))) return `./${dir}/${t}`;
  }
  return null;
}
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]));

const dirs = fs.readdirSync(ROOT, { withFileTypes: true })
  .filter(d => d.isDirectory() && !d.name.startsWith('.'))
  .filter(d => fs.existsSync(path.join(ROOT, d.name, 'index.html')))
  .map(d => d.name);

const items = dirs.map(name => {
  let meta = {};
  const mp = path.join(ROOT, name, 'meta.json');
  if (fs.existsSync(mp)) { try { meta = JSON.parse(fs.readFileSync(mp, 'utf8')); } catch {} }
  const fm = name.match(/^playable_([a-z0-9]+)_(\d+)_(.+)$/i);
  return {
    name,
    title:   meta.title   || titleFromHtml(path.join(ROOT, name, 'index.html')) || name,
    game:    (meta.game   || (fm && fm[1]) || 'other').toLowerCase(),
    num:     meta.num     || (fm && fm[2]) || '',
    concept: meta.concept || (fm && fm[3]) || '',
    updatedAt: meta.updatedAt || '',
    note:    meta.note    || '',
    thumb:   thumbFor(name),
  };
}).sort((a, b) =>
  a.game.localeCompare(b.game) || String(a.num).localeCompare(String(b.num)) || a.name.localeCompare(b.name));

const groups = {};
items.forEach(it => { (groups[it.game] = groups[it.game] || []).push(it); });

const card = it => `
        <a class="card" href="./${encodeURIComponent(it.name)}/">
          <div class="thumb">${it.thumb ? `<img src="${esc(it.thumb)}" alt="${esc(it.title)}" loading="lazy">` : '<span>▶</span>'}</div>
          <div class="body">
            <div class="title">${esc(it.title)}</div>
            <div class="tags">
              ${it.num ? `<span class="tag">#${esc(it.num)}</span>` : ''}
              ${it.concept ? `<span class="tag">${esc(it.concept)}</span>` : ''}
            </div>
            ${it.note ? `<div class="note">${esc(it.note)}</div>` : ''}
            <div class="foot">${it.updatedAt ? `updated ${esc(it.updatedAt)}` : ''}<span class="open">열기 →</span></div>
          </div>
        </a>`;

const sections = Object.keys(groups).sort().map(g => `
      <section>
        <h2>${esc(GAME_LABEL[g] || g.toUpperCase())} <span class="count">${groups[g].length}</span></h2>
        <div class="grid">${groups[g].map(card).join('')}
        </div>
      </section>`).join('');

const html = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Creative Playables</title>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin:0; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Apple SD Gothic Neo","Malgun Gothic",sans-serif;
         background:#0e0f13; color:#e9eaee; padding:44px 20px 80px; }
  .wrap { max-width:1040px; margin:0 auto; }
  header h1 { font-size:22px; margin:0 0 4px; }
  header p { margin:0 0 8px; color:#8a8f9c; font-size:13px; }
  section { margin-top:34px; }
  section h2 { font-size:15px; font-weight:700; color:#c7cbd6; margin:0 0 14px;
               padding-bottom:8px; border-bottom:1px solid #22252e; display:flex; align-items:center; gap:8px; }
  .count { font-size:12px; font-weight:600; color:#7d84ff; background:#1b1e29; border-radius:20px; padding:2px 9px; }
  .grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(210px,1fr)); gap:16px; }
  .card { display:flex; flex-direction:column; text-decoration:none; color:inherit;
          background:#171922; border:1px solid #262932; border-radius:14px; overflow:hidden; transition:.15s; }
  .card:hover { transform:translateY(-3px); border-color:#5b6bff; box-shadow:0 8px 24px rgba(0,0,0,.35); }
  .thumb { aspect-ratio:16/10; display:flex; align-items:center; justify-content:center; overflow:hidden;
           font-size:32px; color:#5b6bff; background:radial-gradient(circle at 50% 38%,#20232d,#131419); }
  .thumb img { width:100%; height:100%; object-fit:cover; }
  .body { padding:12px 14px 13px; display:flex; flex-direction:column; gap:7px; flex:1; }
  .title { font-size:14px; font-weight:600; line-height:1.35; word-break:break-word; }
  .tags { display:flex; flex-wrap:wrap; gap:5px; }
  .tag { font-size:11px; color:#aab0c0; background:#1e212b; border-radius:6px; padding:2px 7px; }
  .note { font-size:12px; color:#8a8f9c; line-height:1.4; }
  .foot { margin-top:auto; display:flex; justify-content:space-between; align-items:center;
          font-size:11px; color:#5f6472; padding-top:4px; }
  .open { color:#7d84ff; font-weight:600; }
  footer { margin-top:48px; color:#5a5f6b; font-size:12px; text-align:center; }
</style>
</head>
<body>
  <div class="wrap">
    <header>
      <h1>Creative Playables</h1>
      <p>리뷰용 플레이어블 소재 모음 · 총 ${items.length}개</p>
    </header>
    ${sections || '<p style="color:#8a8f9c;margin-top:30px">아직 소재가 없습니다.</p>'}
    <footer>internal review preview · link-only access (검색 노출 없음)</footer>
  </div>
</body>
</html>`;

fs.writeFileSync(path.join(ROOT, 'index.html'), html);
console.log(`index.html 생성 — ${items.length}개 / 게임 ${Object.keys(groups).length}종: ${items.map(i => i.name).join(', ') || '없음'}`);
