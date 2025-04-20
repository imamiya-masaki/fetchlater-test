// server.js
const fs      = require('fs');
const path    = require('path');
const http    = require('http');
const https   = require('https');
const express = require('express');

const app = express();
const HTTP_PORT  = process.env.PORT_HTTP  || 3000;
const HTTPS_PORT = process.env.PORT_HTTPS || 3443;

// JSON ボディをパース（sendBeacon の POST 用）
app.use(express.json());

// static ファイル
app.use(express.static(path.join(__dirname, 'public')));

// テスト用 API （GET/POST 両対応）
app.all('/api/data', (req, res) => {
  const requestType = req.query.request_type || 'unspecified';
  console.log(
    `[api/data] method=${req.method}, request_type=${requestType}`, 
    req.method === 'POST' ? 'body=' + JSON.stringify(req.body) : ''
  );

  res.json({
    message:    'Hello from /api/data',
    timestamp:  Date.now(),
    request_type: requestType,
    method:     req.method,
  });
});

// 1) HTTP → HTTPS リダイレクト
http.createServer((req, res) => {
  const host = req.headers.host.split(':')[0];
  res.writeHead(301, {
    Location: `https://${host}:${HTTPS_PORT}${req.url}`
  });
  res.end();
}).listen(HTTP_PORT, () => {
  console.log(`HTTP ➔ HTTPS redirect on port ${HTTP_PORT}`);
});

// 2) HTTPS サーバー
const sslOptions = {
  key:  fs.readFileSync(path.join(__dirname, 'certs', 'localhost+2-key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'certs', 'localhost+2.pem'))
};

https.createServer(sslOptions, app)
  .listen(HTTPS_PORT, () => {
    console.log(`HTTPS server running at https://localhost:${HTTPS_PORT}`);
  });
