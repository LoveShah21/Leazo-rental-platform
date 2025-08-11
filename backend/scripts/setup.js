#!/usr/bin/env node

/*
 Automated API smoke tester for the backend
 - Discovers routes by parsing src/server.js and src/routes/*.js
 - Starts the server if it's not running
 - Tries to authenticate (registers a temp user; tries admin login if env provided)
 - Hits each discovered endpoint with a best-effort sample request
 - Prints a concise summary of statuses
*/

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const axiosLib = require('axios');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT, 'src');
const ROUTES_DIR = path.join(SRC_DIR, 'routes');
const SERVER_FILE = path.join(SRC_DIR, 'server.js');

// Configuration
const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BACKEND_BASE_URL || `http://localhost:${PORT}`;
const HEALTH_PATH = '/health';
const READY_PATH = '/ready';

// Axios client
const axios = axiosLib.create({
  baseURL: BASE_URL,
  timeout: 15000,
  validateStatus: () => true,
});

function readFileSafely(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return '';
  }
}

function parseRouteMappingsFromServer(serverContent) {
  const varToFile = new Map();
  const baseToVar = [];

  // const someRoutes = require('./routes/some');
  const requireRegex = /const\s+(\w+)\s*=\s*require\(['"]\.\/routes\/([^'"\)]+)['"]\)/g;
  let match;
  while ((match = requireRegex.exec(serverContent)) !== null) {
    const [, varName, fileName] = match;
    varToFile.set(varName, fileName.endsWith('.js') ? fileName : `${fileName}.js`);
  }

  // app.use('/api/something', someRoutes);
  const useRegex = /app\.use\(\s*['"]([^'"\)]+)['"]\s*,\s*(\w+)\s*\)/g;
  while ((match = useRegex.exec(serverContent)) !== null) {
    const [, basePath, varName] = match;
    baseToVar.push({ basePath, varName });
  }

  const baseToFile = [];
  for (const { basePath, varName } of baseToVar) {
    if (varToFile.has(varName)) {
      baseToFile.push({ basePath, filePath: path.join(ROUTES_DIR, varToFile.get(varName)) });
    }
  }
  return baseToFile;
}

function parseEndpointsFromRouteFile(routeContent) {
  const endpoints = [];
  // Find router.METHOD('/path', ...)
  const methodRegex = /router\.(get|post|put|patch|delete)\(\s*(['"])(.*?)\2\s*,/g;
  let match;
  while ((match = methodRegex.exec(routeContent)) !== null) {
    const method = match[1].toUpperCase();
    const subPath = match[3];
    if (!subPath || typeof subPath !== 'string') continue;
    endpoints.push({ method, subPath });
  }
  return endpoints;
}

function replacePathParams(fullPath) {
  // Replace :param with generic placeholders
  return fullPath.replace(/:([A-Za-z_][A-Za-z0-9_]*)/g, (_, name) => {
    const lower = String(name).toLowerCase();
    if (lower.includes('waybill')) return 'WBTEST123';
    if (lower.includes('order')) return 'BK00000001';
    if (lower.includes('booking')) return '000000000000000000000000';
    if (lower.includes('product')) return '000000000000000000000000';
    if (lower.includes('user')) return '000000000000000000000000';
    if (lower.includes('payment')) return 'PAY_0000000000';
    return '000000000000000000000000';
  });
}

function buildSampleBody(method, urlPath) {
  // Provide best-effort bodies for common endpoints; others return 4xx (still a valid smoke test)
  const lower = urlPath.toLowerCase();

  if (method === 'POST' && lower === '/api/auth/register') {
    const ts = Date.now();
    return {
      email: `testuser_${ts}@example.com`,
      password: 'Test@12345',
      firstName: 'Test',
      lastName: 'User',
    };
  }
  if (method === 'POST' && lower === '/api/auth/login') {
    // Will be filled at runtime with created user
    return null;
  }
  if (method === 'POST' && lower.startsWith('/api/provider/register')) {
    return {
      businessName: 'Test Biz',
                businessType: 'individual',
                bankDetails: {
        accountHolderName: 'Test User',
                    accountNumber: '1234567890',
        bankName: 'Test Bank',
        ifscCode: 'TEST0001234',
        accountType: 'savings',
      },
    };
  }
  if (method === 'POST' && lower.startsWith('/api/bookings')) {
    const now = new Date();
    const start = new Date(now.getTime() + 24 * 3600 * 1000).toISOString();
    const end = new Date(now.getTime() + 2 * 24 * 3600 * 1000).toISOString();
    return {
      productId: '000000000000000000000000',
      locationId: '000000000000000000000000',
      quantity: 1,
      startDate: start,
      endDate: end,
      paymentMethod: 'cash',
      delivery: { type: 'pickup' },
    };
  }
  if (method === 'POST' && lower.startsWith('/api/availability/holds')) {
    const now = new Date();
    const start = new Date(now.getTime() + 24 * 3600 * 1000).toISOString();
    const end = new Date(now.getTime() + 2 * 24 * 3600 * 1000).toISOString();
    return {
      productId: '000000000000000000000000',
      locationId: '000000000000000000000000',
      quantity: 1,
      startDate: start,
      endDate: end,
    };
  }
  if (method === 'PATCH' && /\/api\/bookings\/.+\/status/.test(lower)) {
    return { status: 'cancelled' };
  }
  if (method === 'POST' && /\/api\/bookings\/.+\/extend/.test(lower)) {
    return { days: 1 };
  }
  if (method === 'PUT' && /\/api\/availability\/holds\/.+\/extend/.test(lower)) {
    return { minutes: 5 };
  }
  if (method === 'POST' && lower.startsWith('/api/reviews/') && lower.endsWith('/vote')) {
    return { vote: 'up' };
  }
  if (method === 'POST' && lower.startsWith('/api/reviews/') && lower.endsWith('/report')) {
    return { reason: 'spam', comment: 'Test report' };
  }
  if (method === 'POST' && lower === '/api/payments/create-session') {
    return { orderId: 'BK00000001', amount: 1, customerDetails: { email: 'x@example.com' } };
  }
  if (method === 'POST' && lower.startsWith('/api/payments/verify/')) {
    return {};
  }
  if (method === 'POST' && lower === '/api/payments/refund') {
    return { paymentId: 'PAY_0000000000', refundAmount: 1, reason: 'test' };
  }
  if (method === 'POST' && lower === '/api/shipping/create') {
    return { orderId: 'BK00000001' };
  }
  if (method === 'POST' && lower === '/api/shipping/cancel') {
    return { waybill: 'WBTEST123' };
  }
  if (method === 'POST' && lower === '/api/shipping/calculate-cost') {
    return { weight: 1, fromPincode: '110001', toPincode: '400069', serviceType: 'standard' };
  }
  if (method === 'POST' && lower === '/api/webhooks/cashfree') {
    // Sent as JSON; missing signature will yield 400 (expected)
    return {
      type: 'PAYMENT_SUCCESS_WEBHOOK',
      data: { order: { order_id: 'BK00000001' }, payment: { cf_payment_id: 'CFTEST' } },
    };
  }
  if (method === 'POST' && lower === '/api/admin/shipping/create') {
    return { bookingId: '000000000000000000000000' };
  }
  if (method === 'POST' && lower === '/api/admin/shipping/cancel') {
    return { waybill: 'WBTEST123' };
  }

  // Default empty body for other write operations
  if (['POST', 'PUT', 'PATCH'].includes(method)) return {};
  return undefined;
}

async function waitForServerUp(maxMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    try {
      const res = await axios.get(HEALTH_PATH);
      if (res.status >= 200 && res.status < 500) return true;
    } catch {}
    await new Promise(r => setTimeout(r, 500));
  }
  return false;
}

function ensureServerRunning() {
  return new Promise(async (resolve) => {
    const reachable = await waitForServerUp(2000);
    if (reachable) return resolve({ proc: null });

    const proc = spawn(process.execPath, ['src/server.js'], {
      cwd: ROOT,
      stdio: ['ignore', 'inherit', 'inherit'],
      env: process.env,
    });

    // Wait for health
    (async () => {
      const ok = await waitForServerUp(40000);
      resolve({ proc: ok ? proc : null });
    })();
  });
}

function joinPaths(base, sub) {
  if (!sub || sub === '/') return base;
  if (base.endsWith('/') && sub.startsWith('/')) return base + sub.slice(1);
  if (!base.endsWith('/') && !sub.startsWith('/')) return `${base}/${sub}`;
  return base + sub;
}

function normalizeEndpoints(baseToFile) {
  const all = [];
  for (const { basePath, filePath } of baseToFile) {
    const content = readFileSafely(filePath);
    const eps = parseEndpointsFromRouteFile(content);
    for (const { method, subPath } of eps) {
      const full = joinPaths(basePath, subPath);
      all.push({ method, path: full });
    }
  }

  // Add health/ready explicitly
  all.push({ method: 'GET', path: '/health' });
  all.push({ method: 'GET', path: '/ready' });

  // Deduplicate
  const seen = new Set();
  const deduped = [];
  for (const ep of all) {
    const key = `${ep.method} ${ep.path}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(ep);
    }
  }
  return deduped;
}

async function tryAuth() {
  const out = {
    user: null,
    admin: null,
    provider: null,
    createdUser: null,
  };

  // 1) Register a new user
  const regBody = buildSampleBody('POST', '/api/auth/register');
  try {
    const reg = await axios.post('/api/auth/register', regBody);
    if (reg.status === 201 && reg.data?.data?.tokens?.accessToken) {
      out.user = reg.data.data.tokens.accessToken;
      out.createdUser = reg.data.data.user;
    }
  } catch {}

  // If registration failed, try login with env admin creds
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminEmail && adminPassword) {
    try {
      const login = await axios.post('/api/auth/login', { email: adminEmail, password: adminPassword });
      if (login.status === 200 && login.data?.data?.tokens?.accessToken) {
        out.admin = login.data.data.tokens.accessToken;
      }
    } catch {}
  }

  // If we have a user token, also try upgrading to provider
  if (out.user) {
    try {
      const providerBody = buildSampleBody('POST', '/api/provider/register');
      const res = await axios.post('/api/provider/register', providerBody, {
        headers: { Authorization: `Bearer ${out.user}` },
      });
      if (res.status >= 200 && res.status < 300) {
        out.provider = out.user;
      }
    } catch {
      // It's fine if provider registration fails; proceed
    }
  }

  return out;
}

function pickAuthHeaderForPath(tokens, method, urlPath) {
  // Prefer admin for /api/admin, provider for /api/provider, otherwise user
  if (urlPath.startsWith('/api/admin') && tokens.admin) return { Authorization: `Bearer ${tokens.admin}` };
  if (urlPath.startsWith('/api/provider') && tokens.provider) return { Authorization: `Bearer ${tokens.provider}` };
  if (tokens.user) return { Authorization: `Bearer ${tokens.user}` };
  return {};
}

async function executeRequest(method, path, tokens) {
  const urlWithIds = replacePathParams(path);
  const lower = urlWithIds.toLowerCase();
  const headers = { ...pickAuthHeaderForPath(tokens, method, lower) };

  // Special case: Cashfree webhook expects raw body
  if (method === 'POST' && lower === '/api/webhooks/cashfree') {
    const body = buildSampleBody(method, lower);
    try {
      const res = await axios.request({
        url: urlWithIds,
        method,
        headers: { ...headers, 'content-type': 'application/json' },
        data: body,
        transformRequest: [(data) => JSON.stringify(data)],
      });
      return res;
    } catch (err) {
      return err.response || { status: 0, data: { error: String(err.message || err) } };
    }
  }

  let data = buildSampleBody(method, lower);
  // Fill login body late if needed
  if (method === 'POST' && lower === '/api/auth/login') {
    if (tokens.createdUser?.email) {
      data = { email: tokens.createdUser.email, password: 'Test@12345' };
    } else if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
      data = { email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD };
    } else {
      data = { email: 'unknown@example.com', password: 'wrong' };
    }
  }

  try {
    const res = await axios.request({ url: urlWithIds, method, headers, data });
    return res;
  } catch (err) {
    return err.response || { status: 0, data: { error: String(err.message || err) } };
  }
}

function summarizeResponse(method, path, res) {
  const status = res?.status ?? 0;
  let level = 'OK';
  if (status >= 500 || status === 0) level = 'FAIL';
  else if (status >= 400) level = 'WARN';

  let message = '';
  if (typeof res?.data === 'string') message = res.data.slice(0, 200);
  else if (res?.data && typeof res.data === 'object') {
    message = res.data.message || res.data.error || res.data.status || '';
  }
  return { method, path, status, level, message };
}

function printSummary(results) {
  const ok = results.filter(r => r.level === 'OK').length;
  const warn = results.filter(r => r.level === 'WARN').length;
  const fail = results.filter(r => r.level === 'FAIL').length;

  console.log('\n\n===== API Smoke Test Summary =====');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Total: ${results.length} | OK: ${ok} | WARN: ${warn} | FAIL: ${fail}`);
  console.log('----------------------------------');
  for (const r of results) {
    const tag = r.level.padEnd(5);
    console.log(`${tag} ${r.status.toString().padEnd(3)} ${r.method.padEnd(6)} ${r.path} ${r.message ? '- ' + r.message : ''}`);
  }
}

async function main() {
  console.log('🚀 API smoke test starting...');

  const serverContent = readFileSafely(SERVER_FILE);
  if (!serverContent) {
    console.error('❌ Could not read src/server.js');
    process.exit(1);
  }

  // Discover endpoints
  const baseToFile = parseRouteMappingsFromServer(serverContent);
  const endpoints = normalizeEndpoints(baseToFile);
  console.log(`🔎 Discovered ${endpoints.length} endpoints`);

  // Ensure server running
  const { proc } = await ensureServerRunning();
  const health = await axios.get(HEALTH_PATH).catch(() => null);
  console.log(health?.status ? `✅ Server reachable (health: ${health.status})` : '⚠️ Server may not be healthy');

  // Authenticate where possible
  const tokens = await tryAuth();

  // Execute requests sequentially to avoid rate limits
  const results = [];
  for (const ep of endpoints) {
    try {
      const res = await executeRequest(ep.method, ep.path, tokens);
      results.push(summarizeResponse(ep.method, ep.path, res));
    } catch (err) {
      results.push({ method: ep.method, path: ep.path, status: 0, level: 'FAIL', message: String(err?.message || err) });
    }
  }

  printSummary(results);

  // Cleanup spawned server
  if (proc && !proc.killed) {
    proc.kill();
  }

  // Exit with non-zero if there were failures
  const hasFail = results.some(r => r.level === 'FAIL');
  process.exit(hasFail ? 1 : 0);
}

if (require.main === module) {
  main();
}

module.exports = { main };