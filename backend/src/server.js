import express from 'express';
import cors from 'cors';
import { randomUUID } from 'node:crypto';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { Buffer } from 'node:buffer';
import process from 'node:process';
import { ensureDatabase, readDatabase, writeDatabase } from './db.js';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import 'dotenv/config';

const app = express();
const PORT = Number(process.env.PORT || 4000);
const AUTH_SECRET = process.env.AUTH_SECRET || 'change-me-in-production';
const TOKEN_TTL_MS = Number(process.env.AUTH_TOKEN_TTL_MS || 12 * 60 * 60 * 1000);
const DB_NAME = process.env.MYSQL_DATABASE || 'jewellery_system';

const MYSQL_CONFIG = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: DB_NAME,
};

const ENTITY_KEYS = new Set([
  'inventory',
  'customers',
  'suppliers',
  'sales',
  'repairs',
  'orders',
]);

const ROLE_PERMISSIONS = {
  admin: {
    read: Array.from(ENTITY_KEYS),
    create: Array.from(ENTITY_KEYS),
    update: Array.from(ENTITY_KEYS),
    delete: Array.from(ENTITY_KEYS),
    settings: true,
  },
  staff: {
    read: Array.from(ENTITY_KEYS),
    create: ['sales', 'repairs', 'orders', 'customers'],
    update: ['sales', 'repairs', 'orders', 'customers'],
    delete: [],
    settings: false,
  },
};

const RESOURCE_SCHEMAS = {
  inventory: ['name', 'category', 'metalType', 'quantity'],
  customers: ['name', 'phone'],
  suppliers: ['name', 'type'],
  sales: ['invoiceNo', 'date', 'items', 'total'],
  repairs: ['customer', 'itemDescription', 'status'],
  orders: ['customer', 'description', 'status'],
};

function notFound(res, message) {
  return res.status(404).json({ error: message });
}

function badRequest(res, message) {
  return res.status(400).json({ error: message });
}

function unauthorized(res, message = 'Unauthorized') {
  return res.status(401).json({ error: message });
}

function forbidden(res, message = 'Forbidden') {
  return res.status(403).json({ error: message });
}

function base64url(input) {
  return Buffer.from(input).toString('base64url');
}

function signToken(payload) {
  const encodedPayload = base64url(JSON.stringify(payload));
  const signature = createHmac('sha256', AUTH_SECRET).update(encodedPayload).digest('base64url');
  return `${encodedPayload}.${signature}`;
}

function verifyToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;

  const [encodedPayload, signature] = token.split('.');
  const expected = createHmac('sha256', AUTH_SECRET).update(encodedPayload).digest('base64url');
  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (sigBuffer.length !== expectedBuffer.length) return null;
  if (!timingSafeEqual(sigBuffer, expectedBuffer)) return null;

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
    if (!payload.exp || Date.now() > Number(payload.exp)) return null;
    return payload;
  } catch {
    return null;
  }
}

function getBearerToken(headerValue) {
  if (!headerValue || typeof headerValue !== 'string') return null;
  const [type, token] = headerValue.split(' ');
  if (type !== 'Bearer' || !token) return null;
  return token;
}

function hasPermission(role, action, resource) {
  const perms = ROLE_PERMISSIONS[role];
  if (!perms) return false;
  return perms[action]?.includes(resource) ?? false;
}

function validateResourcePayload(resource, payload, mode) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return 'Payload must be a JSON object';
  }

  if (mode === 'patch' && Object.keys(payload).length === 0) {
    return 'At least one field is required for update';
  }

  const required = RESOURCE_SCHEMAS[resource] ?? [];
  if (mode === 'create') {
    for (const key of required) {
      if (payload[key] === undefined || payload[key] === null || payload[key] === '') {
        return `Missing required field: ${key}`;
      }
    }
  }

  if (payload.id !== undefined && typeof payload.id !== 'string') {
    return 'Field id must be a string when provided';
  }

  if (payload.quantity !== undefined && Number(payload.quantity) < 0) {
    return 'Field quantity cannot be negative';
  }

  if (payload.total !== undefined && Number(payload.total) < 0) {
    return 'Field total cannot be negative';
  }

  return null;
}

function validateSettingsPayload(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return 'Payload must be a JSON object';
  }
  if (Object.keys(payload).length === 0) {
    return 'At least one field is required';
  }
  return null;
}

async function ensureUsers() {
  const connection = await mysql.createConnection(MYSQL_CONFIG);
  const adminHash = await bcrypt.hash('admin123', 12);
  const staffHash = await bcrypt.hash('staff123', 12);

  await connection.query(
    `INSERT IGNORE INTO users (id, username, password_hash, role) VALUES
    ('u_admin', 'admin', ?, 'admin'),
    ('u_staff', 'staff', ?, 'staff')`,
    [adminHash, staffHash],
  );

  await connection.query(
    'UPDATE users SET password_hash = ?, role = ?, is_active = 1 WHERE id = ?',
    [adminHash, 'admin', 'u_admin'],
  );
  await connection.query(
    'UPDATE users SET password_hash = ?, role = ?, is_active = 1 WHERE id = ?',
    [staffHash, 'staff', 'u_staff'],
  );

  await connection.end();
}

function sanitizeUser(user) {
  return {
    id: user.id,
    username: user.username,
    role: user.role,
    isActive: Boolean(user.isActive),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function validateNewUserPayload(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return 'Payload must be a JSON object';
  }
  if (!payload.username || typeof payload.username !== 'string' || payload.username.length < 3) {
    return 'username must be at least 3 characters';
  }
  if (!payload.password || typeof payload.password !== 'string' || payload.password.length < 8) {
    return 'password must be at least 8 characters';
  }
  if (!['admin', 'staff'].includes(payload.role)) {
    return 'role must be admin or staff';
  }
  return null;
}

function validateUserUpdatePayload(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return 'Payload must be a JSON object';
  }
  if (Object.keys(payload).length === 0) {
    return 'At least one field is required';
  }
  if (payload.username !== undefined) {
    if (typeof payload.username !== 'string' || payload.username.length < 3) {
      return 'username must be at least 3 characters';
    }
  }
  if (payload.role !== undefined && !['admin', 'staff'].includes(payload.role)) {
    return 'role must be admin or staff';
  }
  if (payload.isActive !== undefined && typeof payload.isActive !== 'boolean') {
    return 'isActive must be a boolean';
  }
  return null;
}

function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

function authenticate(req, res, next) {
  const token = getBearerToken(req.headers.authorization);
  const payload = verifyToken(token);
  if (!payload) return unauthorized(res, 'Invalid or expired token');
  req.user = payload;
  return next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user?.role) return unauthorized(res);
    if (!roles.includes(req.user.role)) return forbidden(res, 'Insufficient role');
    return next();
  };
}

function withId(payload, resource) {
  if (payload.id) return payload;
  const prefix = resource.slice(0, 3).toLowerCase();
  return { ...payload, id: `${prefix}_${randomUUID()}` };
}

app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  }),
);
app.use(express.json({ limit: '2mb' }));

app.post('/auth/login', asyncHandler(async (req, res) => {
  const { username, password } = req.body ?? {};
  if (!username || !password) return badRequest(res, 'username and password are required');

  const connection = await mysql.createConnection(MYSQL_CONFIG);
  const [rows] = await connection.query(
    'SELECT id, username, password_hash AS passwordHash, role, is_active AS isActive FROM users WHERE username = ? LIMIT 1',
    [username],
  );
  await connection.end();

  const user = rows[0];
  if (!user || !user.isActive) {
    return unauthorized(res, 'Invalid username or password');
  }

  const isPasswordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordMatch) {
    return unauthorized(res, 'Invalid username or password');
  }

  const tokenPayload = {
    sub: user.id,
    username: user.username,
    role: user.role,
    exp: Date.now() + TOKEN_TTL_MS,
  };

  return res.json({ token: signToken(tokenPayload), user: tokenPayload });
}));

app.get('/auth/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'jewellery-system-backend' });
});

app.get('/api', (_req, res) => {
  res.json({
    message: 'Jewellery ERP Backend API',
    resources: Array.from(ENTITY_KEYS),
    settings: ['metal-rates', 'store-info'],
  });
});

app.use('/api', authenticate, requireRole('admin', 'staff'));

app.get('/api/users', requireRole('admin'), asyncHandler(async (_req, res) => {
  const connection = await mysql.createConnection(MYSQL_CONFIG);
  const [rows] = await connection.query(
    'SELECT id, username, role, is_active AS isActive, created_at AS createdAt, updated_at AS updatedAt FROM users ORDER BY created_at ASC',
  );
  await connection.end();

  return res.json(rows.map(sanitizeUser));
}));

app.get('/api/users/:id', requireRole('admin'), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const connection = await mysql.createConnection(MYSQL_CONFIG);
  const [rows] = await connection.query(
    'SELECT id, username, role, is_active AS isActive, created_at AS createdAt, updated_at AS updatedAt FROM users WHERE id = ? LIMIT 1',
    [id],
  );
  await connection.end();

  const user = rows[0];
  if (!user) return notFound(res, `No user found for id ${id}`);
  return res.json(sanitizeUser(user));
}));

app.post('/api/users', requireRole('admin'), asyncHandler(async (req, res) => {
  const validationError = validateNewUserPayload(req.body);
  if (validationError) return badRequest(res, validationError);

  const { username, password, role } = req.body;
  const id = `usr_${randomUUID()}`;
  const passwordHash = await bcrypt.hash(password, 12);
  const connection = await mysql.createConnection(MYSQL_CONFIG);

  try {
    await connection.query(
      'INSERT INTO users (id, username, password_hash, role, is_active) VALUES (?, ?, ?, ?, 1)',
      [id, username, passwordHash, role],
    );
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      await connection.end();
      return badRequest(res, 'username already exists');
    }
    await connection.end();
    throw error;
  }

  const [rows] = await connection.query(
    'SELECT id, username, role, is_active AS isActive, created_at AS createdAt, updated_at AS updatedAt FROM users WHERE id = ? LIMIT 1',
    [id],
  );
  await connection.end();

  return res.status(201).json(sanitizeUser(rows[0]));
}));

app.patch('/api/users/:id', requireRole('admin'), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const validationError = validateUserUpdatePayload(req.body);
  if (validationError) return badRequest(res, validationError);

  const fields = [];
  const values = [];
  if (req.body.username !== undefined) {
    fields.push('username = ?');
    values.push(req.body.username);
  }
  if (req.body.role !== undefined) {
    fields.push('role = ?');
    values.push(req.body.role);
  }
  if (req.body.isActive !== undefined) {
    fields.push('is_active = ?');
    values.push(req.body.isActive ? 1 : 0);
  }

  const connection = await mysql.createConnection(MYSQL_CONFIG);
  try {
    const [result] = await connection.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      [...values, id],
    );
    if (result.affectedRows === 0) {
      await connection.end();
      return notFound(res, `No user found for id ${id}`);
    }
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      await connection.end();
      return badRequest(res, 'username already exists');
    }
    await connection.end();
    throw error;
  }

  const [rows] = await connection.query(
    'SELECT id, username, role, is_active AS isActive, created_at AS createdAt, updated_at AS updatedAt FROM users WHERE id = ? LIMIT 1',
    [id],
  );
  await connection.end();

  return res.json(sanitizeUser(rows[0]));
}));

app.patch('/api/users/:id/password', requireRole('admin'), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { password } = req.body ?? {};
  if (!password || typeof password !== 'string' || password.length < 8) {
    return badRequest(res, 'password must be at least 8 characters');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const connection = await mysql.createConnection(MYSQL_CONFIG);
  const [result] = await connection.query('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, id]);
  await connection.end();

  if (result.affectedRows === 0) {
    return notFound(res, `No user found for id ${id}`);
  }
  return res.json({ message: 'Password updated successfully' });
}));

app.delete('/api/users/:id', requireRole('admin'), asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (req.user.sub === id) {
    return badRequest(res, 'You cannot delete your own account');
  }

  const connection = await mysql.createConnection(MYSQL_CONFIG);
  const [result] = await connection.query('UPDATE users SET is_active = 0 WHERE id = ?', [id]);
  await connection.end();

  if (result.affectedRows === 0) {
    return notFound(res, `No user found for id ${id}`);
  }
  return res.status(204).send();
}));

app.get('/api/settings/metal-rates', asyncHandler(async (_req, res) => {
  const db = await readDatabase();
  return res.json(db.settings?.metalRates ?? {});
}));

app.patch('/api/settings/metal-rates', requireRole('admin'), asyncHandler(async (req, res) => {
  const error = validateSettingsPayload(req.body);
  if (error) return badRequest(res, error);

  const db = await readDatabase();
  const current = db.settings?.metalRates ?? {};
  db.settings = {
    ...(db.settings ?? {}),
    metalRates: { ...current, ...req.body },
  };
  await writeDatabase(db);
  return res.json(db.settings.metalRates);
}));

app.get('/api/settings/store-info', asyncHandler(async (_req, res) => {
  const db = await readDatabase();
  return res.json(db.settings?.storeInfo ?? {});
}));

app.patch('/api/settings/store-info', requireRole('admin'), asyncHandler(async (req, res) => {
  const error = validateSettingsPayload(req.body);
  if (error) return badRequest(res, error);

  const db = await readDatabase();
  const current = db.settings?.storeInfo ?? {};
  db.settings = {
    ...(db.settings ?? {}),
    storeInfo: { ...current, ...req.body },
  };
  await writeDatabase(db);
  return res.json(db.settings.storeInfo);
}));

app.get('/api/:resource', asyncHandler(async (req, res) => {
  const { resource } = req.params;
  if (!ENTITY_KEYS.has(resource)) return notFound(res, 'Resource not found');
  if (!hasPermission(req.user.role, 'read', resource)) {
    return forbidden(res, 'You do not have permission to read this resource');
  }

  const db = await readDatabase();
  return res.json(db[resource] ?? []);
}));

app.get('/api/:resource/:id', asyncHandler(async (req, res) => {
  const { resource, id } = req.params;
  if (!id) return badRequest(res, 'id is required');
  if (!ENTITY_KEYS.has(resource)) return notFound(res, 'Resource not found');
  if (!hasPermission(req.user.role, 'read', resource)) {
    return forbidden(res, 'You do not have permission to read this resource');
  }

  const db = await readDatabase();
  const row = (db[resource] ?? []).find((item) => String(item.id) === String(id));
  if (!row) return notFound(res, `No ${resource} record found for id ${id}`);
  return res.json(row);
}));

app.post('/api/:resource', asyncHandler(async (req, res) => {
  const { resource } = req.params;
  if (!ENTITY_KEYS.has(resource)) return notFound(res, 'Resource not found');
  if (!hasPermission(req.user.role, 'create', resource)) {
    return forbidden(res, 'You do not have permission to create this resource');
  }

  const payloadError = validateResourcePayload(resource, req.body, 'create');
  if (payloadError) return badRequest(res, payloadError);

  const db = await readDatabase();
  const nextItem = withId(req.body, resource);
  db[resource] = [...(db[resource] ?? []), nextItem];
  await writeDatabase(db);

  return res.status(201).json(nextItem);
}));

app.patch('/api/:resource/:id', asyncHandler(async (req, res) => {
  const { resource, id } = req.params;
  if (!id) return badRequest(res, 'id is required');
  if (!ENTITY_KEYS.has(resource)) return notFound(res, 'Resource not found');
  if (!hasPermission(req.user.role, 'update', resource)) {
    return forbidden(res, 'You do not have permission to update this resource');
  }

  const payloadError = validateResourcePayload(resource, req.body, 'patch');
  if (payloadError) return badRequest(res, payloadError);

  const db = await readDatabase();
  const rows = db[resource] ?? [];
  const idx = rows.findIndex((item) => String(item.id) === String(id));
  if (idx === -1) return notFound(res, `No ${resource} record found for id ${id}`);

  const updated = { ...rows[idx], ...req.body, id: rows[idx].id };
  rows[idx] = updated;
  db[resource] = rows;
  await writeDatabase(db);

  return res.json(updated);
}));

app.delete('/api/:resource/:id', requireRole('admin'), asyncHandler(async (req, res) => {
  const { resource, id } = req.params;
  if (!id) return badRequest(res, 'id is required');
  if (!ENTITY_KEYS.has(resource)) return notFound(res, 'Resource not found');
  if (!hasPermission(req.user.role, 'delete', resource)) {
    return forbidden(res, 'You do not have permission to delete this resource');
  }

  const db = await readDatabase();
  const rows = db[resource] ?? [];
  const next = rows.filter((item) => String(item.id) !== String(id));
  if (next.length === rows.length) return notFound(res, `No ${resource} record found for id ${id}`);

  db[resource] = next;
  await writeDatabase(db);
  return res.status(204).send();
}));

app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
});

app.use((err, _req, res) => {
  const status = Number(err.status || err.statusCode || 500);
  const message = status >= 500 ? 'Internal server error' : err.message;
  if (status >= 500) {
    console.error(err);
  }
  res.status(status).json({ error: message });
});

async function start() {
  await ensureDatabase();
  await ensureUsers();
  app.listen(PORT, () => {
    console.log(`Jewellery backend running at http://localhost:${PORT}`);
    console.log('Demo users: admin/admin123 and staff/staff123');
  });
}

start();
