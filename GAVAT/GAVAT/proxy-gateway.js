/**
 * ============================================
 * GATEWAY / REVERSE PROXY PUERTO 80 (GAVAT)
 * ============================================
 * Redirige el tráfico del puerto 80 público:
 *   - /api/*     → Backend (http://localhost:5000/api/*)
 *   - /uploads/* → Backend (http://localhost:5000/uploads/*)
 *   - /*         → Frontend (http://localhost:3000/*)
 */

const http = require('http');

const PORT = process.env.PROXY_PORT || 80;
const BACKEND_TARGET = { host: '127.0.0.1', port: 5000 };
const FRONTEND_TARGET = { host: '127.0.0.1', port: 3000 };

const server = http.createServer((req, res) => {
  const isBackend = req.url.startsWith('/api') || req.url.startsWith('/uploads');
  const target = isBackend ? BACKEND_TARGET : FRONTEND_TARGET;

  const options = {
    hostname: target.host,
    port: target.port,
    path: req.url,
    method: req.method,
    headers: {
      ...req.headers,
      'x-forwarded-for': req.socket.remoteAddress,
      'x-forwarded-proto': 'http',
      'x-forwarded-host': req.headers.host || '100.48.122.211'
    }
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', (err) => {
    console.error(`❌ Error conectando a ${target.host}:${target.port}`, err.message);
    if (!res.headersSent) {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        message: `El servicio de ${isBackend ? 'Backend (5000)' : 'Frontend (3000)'} no está disponible. Verifica que esté iniciado.`
      }));
    }
  });

  req.pipe(proxyReq, { end: true });
});

// Soporte para WebSockets (Hot-Reload de React, etc.)
server.on('upgrade', (req, socket, head) => {
  const isBackend = req.url.startsWith('/api');
  const target = isBackend ? BACKEND_TARGET : FRONTEND_TARGET;

  const proxyReq = http.request({
    hostname: target.host,
    port: target.port,
    path: req.url,
    method: req.method,
    headers: req.headers
  });

  proxyReq.on('upgrade', (proxyRes, proxySocket, proxyHead) => {
    socket.write('HTTP/1.1 101 Switching Protocols\r\n' +
      'Upgrade: websocket\r\n' +
      'Connection: Upgrade\r\n\r\n');
    proxySocket.pipe(socket).pipe(proxySocket);
  });

  proxyReq.on('error', (err) => {
    console.error('Error WebSocket proxy:', err.message);
    socket.destroy();
  });

  proxyReq.end();
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n======================================================`);
  console.log(`  🚀 GAVAT PROXY GATEWAY ACTIVO EN PUERTO ${PORT}`);
  console.log(`  🌐 IP Pública: http://100.48.122.211:${PORT}`);
  console.log(`  🔗 Redirigiendo /api y /uploads al Backend (puerto ${BACKEND_TARGET.port})`);
  console.log(`  🔗 Redirigiendo el resto al Frontend (puerto ${FRONTEND_TARGET.port})`);
  console.log(`======================================================\n`);
});
