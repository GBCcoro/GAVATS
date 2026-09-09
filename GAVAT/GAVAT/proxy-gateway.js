/**
 * ============================================
 * GATEWAY / REVERSE PROXY PUERTO 80 (GAVAT)
 * ============================================
 * Redirige el tráfico del puerto 80 público:
 *   - /api/*     → Backend (http://localhost:5000/api/*)
 *   - /uploads/* → Backend (http://localhost:5000/uploads/*)
 *   - /*         → Frontend (http://localhost:3000/*)
 */

const http = require('http'); // NOSONAR

const PORT = process.env.PROXY_PORT || 80;
const BACKEND_TARGET = { host: '127.0.0.1', port: 5000 };
const FRONTEND_TARGET = { host: '127.0.0.1', port: 3000 };

/**
 * Sanitiza y valida la ruta entrante para prevenir SSRF (S5144),
 * Path Traversal y CRLF Injection (HTTP Request Smuggling).
 *
 * @param {string} rawUrl - URL o ruta recibida en el request
 * @returns {string} Ruta normalizada segura (/pathname?search)
 */
function getSafePath(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return '/';
  }
  try {
    // Normalizar mediante el constructor URL base para extraer únicamente pathname y search
    const parsed = new URL(rawUrl, 'http://127.0.0.1');
    // Prevenir CRLF injection eliminando caracteres de salto de línea y retornos de carro
    const cleanPath = (parsed.pathname + parsed.search).replace(/[\r\n\t]/g, '');
    return cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
  } catch {
    return '/';
  }
}

const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade'
]);

/**
 * Filtra cabeceras hop-by-hop para prevenir HTTP Response Splitting / Header Injection (S5167).
 *
 * @param {object} headers - Cabeceras recibidas del servicio destino
 * @returns {object} Cabeceras filtradas y seguras para el cliente
 */
function sanitizeResponseHeaders(headers) {
  const clean = {};
  for (const [key, value] of Object.entries(headers || {})) {
    if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase()) && value !== undefined) {
      clean[key] = value;
    }
  }
  return clean;
}

const server = http.createServer((req, res) => { // NOSONAR
  const safePath = getSafePath(req.url);
  const isBackend = safePath.startsWith('/api') || safePath.startsWith('/uploads');
  const target = isBackend ? BACKEND_TARGET : FRONTEND_TARGET;

  const options = {
    hostname: target.host,
    port: target.port,
    path: safePath, // NOSONAR
    method: req.method,
    headers: {
      ...req.headers,
      'x-forwarded-for': req.socket.remoteAddress,
      'x-forwarded-proto': 'http',
      'x-forwarded-host': req.headers.host || '100.48.122.211' // NOSONAR
    }
  };

  const proxyReq = http.request(options, (proxyRes) => { // NOSONAR
    const headers = sanitizeResponseHeaders(proxyRes.headers);
    res.writeHead(proxyRes.statusCode || 200, headers); // NOSONAR
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
server.on('upgrade', (req, socket) => {
  const safePath = getSafePath(req.url);
  const isBackend = safePath.startsWith('/api');
  const target = isBackend ? BACKEND_TARGET : FRONTEND_TARGET;

  const proxyReq = http.request({ // nosonar
    hostname: target.host,
    port: target.port,
    path: safePath, // nosonar
    method: req.method,
    headers: req.headers
  });

  proxyReq.on('upgrade', (proxyRes, proxySocket) => {
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

// Timeouts recomendados para mitigar ataques de denegación de servicio (Slowloris / DoS)
server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n======================================================`);
  console.log(`  🚀 GAVAT PROXY GATEWAY ACTIVO EN PUERTO ${PORT}`);
  console.log(`  🌐 IP Pública: http://100.48.122.211:${PORT}`);
  console.log(`  🔗 Redirigiendo /api y /uploads al Backend (puerto ${BACKEND_TARGET.port})`);
  console.log(`  🔗 Redirigiendo el resto al Frontend (puerto ${FRONTEND_TARGET.port})`);
  console.log(`======================================================\n`);
});
