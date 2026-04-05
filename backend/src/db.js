import process from 'node:process';
import mysql from 'mysql2/promise';
import { config as loadEnv } from 'dotenv';
import { runMigrations } from './migrations.js';
import {
  SAMPLE_INVENTORY,
  SAMPLE_CUSTOMERS,
  SAMPLE_SUPPLIERS,
  SAMPLE_SALES,
  SAMPLE_REPAIRS,
  SAMPLE_ORDERS,
  METAL_RATES,
  STORE_INFO,
} from '../../src/data/seedData.js';

const DB_NAME = process.env.MYSQL_DATABASE || 'jewellery_system';
const TABLES = ['inventory', 'customers', 'suppliers', 'sales', 'repairs', 'orders'];

loadEnv({ path: new URL('../.env', import.meta.url) });

const BASE_DB_CONFIG = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
};

const APP_DB_CONFIG = {
  ...BASE_DB_CONFIG,
  database: DB_NAME,
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function parseMaybeJson(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
}

function buildSeedData() {
  return {
    inventory: clone(SAMPLE_INVENTORY),
    customers: clone(SAMPLE_CUSTOMERS),
    suppliers: clone(SAMPLE_SUPPLIERS),
    sales: clone(SAMPLE_SALES),
    repairs: clone(SAMPLE_REPAIRS),
    orders: clone(SAMPLE_ORDERS),
    settings: {
      metalRates: clone(METAL_RATES),
      storeInfo: clone(STORE_INFO),
    },
  };
}

async function getConnection(withDatabase = true) {
  return mysql.createConnection(withDatabase ? APP_DB_CONFIG : BASE_DB_CONFIG);
}

async function seedIfEmpty() {
  const connection = await getConnection(true);
  const seed = buildSeedData();

  for (const table of TABLES) {
    const [rows] = await connection.query(`SELECT COUNT(*) AS count FROM \`${table}\``);
    if (rows[0].count > 0) continue;

    for (const item of seed[table]) {
      await connection.query(
        `INSERT INTO \`${table}\` (id, payload) VALUES (?, CAST(? AS JSON))`,
        [String(item.id), JSON.stringify(item)],
      );
    }
  }

  const [settingRows] = await connection.query('SELECT COUNT(*) AS count FROM settings');
  if (settingRows[0].count === 0) {
    await connection.query(
      'INSERT INTO settings (setting_key, payload) VALUES (?, CAST(? AS JSON)), (?, CAST(? AS JSON))',
      ['metalRates', JSON.stringify(seed.settings.metalRates), 'storeInfo', JSON.stringify(seed.settings.storeInfo)],
    );
  }

  await connection.end();
}

export async function ensureDatabase() {
  await runMigrations();
  await seedIfEmpty();
}

export async function readDatabase() {
  const connection = await getConnection(true);
  const db = { settings: {} };

  for (const table of TABLES) {
    const [rows] = await connection.query(`SELECT payload FROM \`${table}\``);
    db[table] = rows.map((row) => parseMaybeJson(row.payload));
  }

  const [settingsRows] = await connection.query('SELECT setting_key, payload FROM settings');
  for (const row of settingsRows) {
    db.settings[row.setting_key] = parseMaybeJson(row.payload) ?? {};
  }

  db.settings.metalRates ??= {};
  db.settings.storeInfo ??= {};

  await connection.end();
  return db;
}

export async function writeDatabase(nextState) {
  const connection = await getConnection(true);
  await connection.beginTransaction();

  try {
    for (const table of TABLES) {
      await connection.query(`DELETE FROM \`${table}\``);
      const rows = Array.isArray(nextState[table]) ? nextState[table] : [];

      for (const row of rows) {
        const id = row?.id ? String(row.id) : null;
        if (!id) continue;
        await connection.query(
          `INSERT INTO \`${table}\` (id, payload) VALUES (?, CAST(? AS JSON))`,
          [id, JSON.stringify(row)],
        );
      }
    }

    await connection.query('DELETE FROM settings');
    await connection.query(
      'INSERT INTO settings (setting_key, payload) VALUES (?, CAST(? AS JSON)), (?, CAST(? AS JSON))',
      [
        'metalRates',
        JSON.stringify(nextState.settings?.metalRates ?? {}),
        'storeInfo',
        JSON.stringify(nextState.settings?.storeInfo ?? {}),
      ],
    );

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    await connection.end();
  }
}
