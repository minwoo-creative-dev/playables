#!/usr/bin/env node
/**
 * playables 허브의 목록 페이지(index.html)를 자동 생성.
 * index.html 을 가진 하위 폴더를 모두 훑어서 카드 목록으로 만든다.
 * 사용: node gen-index.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const entries = fs.readdirSync(ROOT, { withFileTypes: true })
  .filter(d => d.isDirectory() && !d.name.startsWith('.'))
  .filter(d => fs.existsSync(path.join(ROOT, d.name, 'index.html')))
  .map(d => d.name)
  .sort();

const cards = entries.map(name => `
      <a class="card" href="./${name}/">
        <div class="thumb">▶</div>
        <div class="meta"><span class="name">${name}</span><span class="go">열기 →</span></div>
      </a>`).join('');

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
         background:#0e0f13; color:#e9eaee; padding:48px 20px; }
  .wrap { max-width:760px; margin:0 auto; }
  h1 { font-size:22px; margin:0 0 4px; }
  p.sub { margin:0 0 28px; color:#8a8f9c; font-size:14px; }
  .grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:14px; }
  .card { display:flex; flex-direction:column; text-decoration:none; color:inherit;
          background:#181a20; border:1px solid #262932; border-radius:12px; overflow:hidden; transition:.15s; }
  .card:hover { transform:translateY(-2px); border-color:#5b6bff; }
  .thumb { aspect-ratio:16/10; display:flex; align-items:center; justify-content:center;
           font-size:34px; color:#5b6bff; background:radial-gradient(circle at 50% 40%,#20232d,#14151b); }
  .meta { display:flex; justify-content:space-between; align-items:center; padding:12px 14px; }
  .name { font-size:14px; font-weight:600; word-break:break-all; }
  .go { font-size:12px; color:#7d84ff; white-space:nowrap; margin-left:8px; }
  footer { margin-top:36px; color:#5a5f6b; font-size:12px; text-align:center; }
</style>
</head>
<body>
  <div class="wrap">
    <h1>Creative Playables</h1>
    <p class="sub">리뷰용 플레이어블 소재 모음 · ${entries.length}개</p>
    <div class="grid">${cards || '\n      <p style="color:#8a8f9c">아직 소재가 없습니다.</p>'}
    </div>
    <footer>internal review preview · link-only access</footer>
  </div>
</body>
</html>`;

fs.writeFileSync(path.join(ROOT, 'index.html'), html);
console.log(`index.html 생성됨 (${entries.length}개: ${entries.join(', ') || '없음'})`);
