const http = require('http');
const path = require('path');
const fs = require('fs');
const { URL } = require('url');
const { getDatasetList, getDatasetDetail, getStrainDetail } = require('./mockData');

const PORT = process.env.PORT || 3000;
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000';
const USE_MOCK = process.env.USE_MOCK === 'true';

function log(message) {
  const timestamp = new Date().toISOString();
  // eslint-disable-next-line no-console
  console.log(`[${timestamp}] ${message}`);
}

async function fetchFromApi(endpoint, method = 'GET') {
  const url = `${API_BASE_URL}${endpoint}`;
  const options = { method, headers: { 'Content-Type': 'application/json' } };

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || `Request failed with status ${response.status}`);
    }
    return data;
  } catch (error) {
    log(`Remote API error for ${url}: ${error.message}`);
    return { success: false, error: error.message };
  }
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(payload));
}

function serveStatic(res, filePath) {
  const ext = path.extname(filePath) || '.html';
  const contentTypeMap = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json'
  };
  const contentType = contentTypeMap[ext] || 'text/plain';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Server Error');
      }
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

async function handleApiRoute(req, res, pathname) {
  if (pathname === '/api/datasets' && req.method === 'GET') {
    if (USE_MOCK) {
      return sendJson(res, 200, getDatasetList());
    }
    const payload = await fetchFromApi('/api/dataset', 'GET');
    return sendJson(res, payload.success === false ? 502 : 200, payload);
  }

  const datasetMatch = pathname.match(/^\/api\/datasets\/([^/]+)$/);
  if (datasetMatch && req.method === 'GET') {
    const datasetId = decodeURIComponent(datasetMatch[1]);
    if (USE_MOCK) {
      return sendJson(res, 200, getDatasetDetail(datasetId));
    }
    const payload = await fetchFromApi(`/api/dataset/${datasetId}`, 'POST');
    return sendJson(res, payload.success === false ? 502 : 200, payload);
  }

  const strainMatch = pathname.match(/^\/api\/strains\/([^/]+)$/);
  if (strainMatch && req.method === 'GET') {
    const strainId = decodeURIComponent(strainMatch[1]);
    if (USE_MOCK) {
      return sendJson(res, 200, getStrainDetail(strainId));
    }
    const payload = await fetchFromApi(`/api/strains/${strainId}`, 'POST');
    return sendJson(res, payload.success === false ? 502 : 200, payload);
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ success: false, error: 'Endpoint not found' }));
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname === '/' ? '/index.html' : url.pathname;

  if (pathname.startsWith('/api/')) {
    return handleApiRoute(req, res, pathname);
  }

  if (pathname === '/environment.json') {
    return sendJson(res, 200, { apiBase: API_BASE_URL, mock: USE_MOCK });
  }

  const filePath = path.join(__dirname, '..', 'public', pathname);
  serveStatic(res, filePath);
});

server.listen(PORT, () => {
  log(`Dashboard server running at http://localhost:${PORT}`);
  log(`API base: ${API_BASE_URL} | Using mock data: ${USE_MOCK}`);
});
