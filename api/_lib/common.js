const crypto = require('node:crypto');

function json(res, status, data) {
  res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  return res.end(JSON.stringify(data));
}
function method(req, res, allowed) {
  if (req.method !== allowed) { json(res, 405, { error: 'method_not_allowed' }); return false; }
  return true;
}
function safeEqual(a, b) {
  const aa = Buffer.from(String(a)); const bb = Buffer.from(String(b));
  return aa.length === bb.length && crypto.timingSafeEqual(aa, bb);
}
function sign(payload) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error('ADMIN_SESSION_SECRET is not configured');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(body).digest('base64url');
  return body + '.' + sig;
}
function verifyToken(req) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return false;
  const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  const parts = token.split('.'); if (parts.length !== 2) return false;
  const expected = crypto.createHmac('sha256', secret).update(parts[0]).digest('base64url');
  if (!safeEqual(parts[1], expected)) return false;
  try { const payload = JSON.parse(Buffer.from(parts[0], 'base64url').toString()); return payload.role === 'admin' && payload.exp > Date.now(); } catch { return false; }
}
async function kv(command) {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) throw new Error('KV_NOT_CONFIGURED');
  const r = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(command), cache: 'no-store' });
  if (!r.ok) throw new Error('KV_REQUEST_FAILED');
  const data = await r.json(); if (data.error) throw new Error('KV_COMMAND_FAILED');
  return data.result;
}
async function readAnalytics() {
  const value = await kv(['GET', 'hvu:analytics:v1']);
  if (!value) return { total: 0, byImage: {}, daily: {} };
  try { return JSON.parse(value); } catch { return { total: 0, byImage: {}, daily: {} }; }
}
async function writeAnalytics(value) { await kv(['SET', 'hvu:analytics:v1', JSON.stringify(value)]); }
module.exports = { json, method, safeEqual, sign, verifyToken, readAnalytics, writeAnalytics };
