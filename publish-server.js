#!/usr/bin/env node
/**
 * 로컬 게시 서버 — 에디터의 '🚀 프리뷰 게시' 버튼이 보낸 단일 HTML을 받아
 * 이 폴더(허브)의 publish.sh 로 저장·메타·갤러리·push 한다.
 *
 * 무설치(Node 내장 http/fs/child_process). 실행:
 *   node publish-server.js       (또는 "게시서버.command" 더블클릭)
 *
 * 에디터(어떤 origin 이든: localhost, file:// 등)에서 POST http://localhost:8099/publish
 *   body: { folder: "playable_cc_01_gacha", html: "<!doctype ...>", note: "1차본" }
 */
const http = require('http');
const fs   = require('fs');
const os   = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const HUB  = __dirname;              // 이 파일은 playables 허브 안에 있음
const PORT = 8099;
const FOLDER_RE = /^playable_[a-z0-9]+_\d+_[a-z0-9_-]+$/i;
const MAX_BODY  = 25 * 1024 * 1024;  // 25MB

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}
function json(res, code, obj) {
  cors(res);
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(obj));
}

const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') { cors(res); res.writeHead(204); res.end(); return; }

  if (req.method === 'GET' && (req.url === '/' || req.url === '/health')) {
    cors(res);
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('publish-server OK\nPOST /publish { folder, html, note }');
    return;
  }

  if (req.method === 'POST' && req.url === '/publish') {
    const chunks = []; let size = 0; let aborted = false;
    req.on('data', c => {
      size += c.length;
      if (size > MAX_BODY) { aborted = true; req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => {
      if (aborted) return json(res, 413, { ok: false, error: '파일이 너무 큽니다(25MB 초과)' });
      let data;
      try { data = JSON.parse(Buffer.concat(chunks).toString('utf8')); }
      catch { return json(res, 400, { ok: false, error: 'JSON 파싱 실패' }); }

      const folder = (data && data.folder || '').trim();
      const html   = data && data.html;
      const note   = (data && data.note || '').trim();

      if (!FOLDER_RE.test(folder))
        return json(res, 400, { ok: false, error: '폴더명 규칙 위반 — playable_<게임>_<번호>_<컨셉> (예: playable_cc_01_gacha)' });
      if (typeof html !== 'string' || html.length < 100)
        return json(res, 400, { ok: false, error: 'html 누락/비정상' });

      const tmp = path.join(os.tmpdir(), `playable_${folder}_${Date.now()}.html`);
      try {
        fs.writeFileSync(tmp, html);
        const out = execFileSync('bash', [path.join(HUB, 'publish.sh'), folder, tmp, note],
          { cwd: HUB, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
        const url = `https://minwoo-creative-dev.github.io/playables/${folder}/`;
        console.log(`[${new Date().toLocaleTimeString()}] publish ✓ ${folder}`);
        json(res, 200, { ok: true, url, log: String(out).trim() });
      } catch (e) {
        const detail = (e.stderr || e.stdout || e.message || String(e)).toString().slice(-1000);
        console.error(`[${new Date().toLocaleTimeString()}] publish ✗ ${folder}\n${detail}`);
        json(res, 500, { ok: false, error: detail });
      } finally {
        try { fs.unlinkSync(tmp); } catch {}
      }
    });
    return;
  }

  json(res, 404, { ok: false, error: 'not found' });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`\n  ✅ 게시 서버 실행 중 → http://localhost:${PORT}`);
  console.log(`     허브: ${HUB}`);
  console.log(`     에디터에서 '🚀 프리뷰 게시'를 누르면 여기로 전송됩니다.`);
  console.log(`     ⚠️  이 창을 닫으면 게시 버튼이 동작하지 않습니다.\n`);
});
