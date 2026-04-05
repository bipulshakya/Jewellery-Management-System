import process from 'node:process';
import mysql from 'mysql2/promise';
import { config as loadEnv } from 'dotenv';

loadEnv({ path: new URL('../.env', import.meta.url) });

const DB_NAME = process.env.MYSQL_DATABASE || 'jewellery_system';
const TABLES = ['inventory', 'customers', 'suppliers', 'sales', 'repairs', 'orders'];

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

const MIGRATIONS = [
  {
    id: '001_initial_schema',
    up: async (connection) => {
      for (const table of TABLES) {
        await connection.query(`
          CREATE TABLE IF NOT EXISTS \`${table}\` (
            id VARCHAR(128) NOT NULL,
            payload JSON NOT NULL,
            created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
            updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
            PRIMARY KEY (id)
          )
        `);
      }

      await connection.query(`
        CREATE TABLE IF NOT EXISTS settings (
          setting_key VARCHAR(64) NOT NULL,
          payload JSON NOT NULL,
          updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
          PRIMARY KEY (setting_key)
        )
      `);

      await connection.query(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(64) NOT NULL,
          username VARCHAR(64) NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          role ENUM('admin', 'staff') NOT NULL DEFAULT 'staff',
          is_active TINYINT(1) NOT NULL DEFAULT 1,
          created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
          updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
          PRIMARY KEY (id),
          UNIQUE KEY uk_users_username (username)
        )
      `);
    },
  },
  {
    id: '002_harden_constraints_and_indexes',
    up: async (connection) => {
      for (const table of TABLES) {
        await connection.query(`
          ALTER TABLE \`${table}\`
          MODIFY id VARCHAR(128) NOT NULL,
          MODIFY payload JSON NOT NULL,
          MODIFY created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
          MODIFY updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
        `);

        await ensureIndex(connection, table, `idx_${table}_created_at`, 'created_at');
        await ensureIndex(connection, table, `idx_${table}_updated_at`, 'updated_at');
        await ensureCheckConstraint(connection, table, `chk_${table}_payload_json`, 'JSON_VALID(payload)');
      }

      await connection.query(`
        ALTER TABLE settings
        MODIFY setting_key VARCHAR(64) NOT NULL,
        MODIFY payload JSON NOT NULL,
        MODIFY updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
      `);
      await ensureIndex(connection, 'settings', 'idx_settings_updated_at', 'updated_at');
      await ensureCheckConstraint(
        connection,
        'settings',
        'chk_settings_key',
        "setting_key IN ('metalRates', 'storeInfo')",
      );

      await ensureColumn(connection, 'users', 'is_active', 'TINYINT(1) NOT NULL DEFAULT 1');
      await connection.query(`
        ALTER TABLE users
        MODIFY id VARCHAR(64) NOT NULL,
        MODIFY username VARCHAR(64) NOT NULL,
        MODIFY password_hash VARCHAR(255) NOT NULL,
        MODIFY role ENUM('admin', 'staff') NOT NULL DEFAULT 'staff',
        MODIFY created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        MODIFY updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
      `);
      await ensureIndex(connection, 'users', 'idx_users_role_active', 'role, is_active');
      await ensureCheckConstraint(connection, 'users', 'chk_users_password_len', 'CHAR_LENGTH(password_hash) >= 60');
    },
  },
];

async function ensureColumn(connection, table, column, definition) {
  const [rows] = await connection.query(
    `SELECT 1 FROM information_schema.columns WHERE table_schema = ? AND table_name = ? AND column_name = ? LIMIT 1`,
    [DB_NAME, table, column],
  );
  if (rows.length === 0) {
    await connection.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
  }
}

async function ensureIndex(connection, table, indexName, columns) {
  const [rows] = await connection.query(
    `SELECT 1 FROM information_schema.statistics WHERE table_schema = ? AND table_name = ? AND index_name = ? LIMIT 1`,
    [DB_NAME, table, indexName],
  );
  if (rows.length === 0) {
    await connection.query(`CREATE INDEX \`${indexName}\` ON \`${table}\` (${columns})`);
  }
}

async function ensureCheckConstraint(connection, table, constraintName, expression) {
  const [rows] = await connection.query(
    `SELECT 1 FROM information_schema.table_constraints WHERE table_schema = ? AND table_name = ? AND constraint_name = ? AND constraint_type = 'CHECK' LIMIT 1`,
    [DB_NAME, table, constraintName],
  );
  if (rows.length === 0) {
    await connection.query(`ALTER TABLE \`${table}\` ADD CONSTRAINT \`${constraintName}\` CHECK (${expression})`);
  }
}

async function ensureDatabaseExists() {
  const bootstrap = await mysql.createConnection(BASE_DB_CONFIG);
  await bootstrap.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``);
  await bootstrap.end();
}

async function ensureMigrationsTable(connection) {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS app_migrations (
      id VARCHAR(128) NOT NULL,
      applied_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      PRIMARY KEY (id)
    )
  `);
}

export async function runMigrations({ log = false } = {}) {
  await ensureDatabaseExists();
  const connection = await mysql.createConnection(APP_DB_CONFIG);

  try {
    await ensureMigrationsTable(connection);
    const [appliedRows] = await connection.query('SELECT id FROM app_migrations');
    const applied = new Set(appliedRows.map((row) => row.id));

    for (const migration of MIGRATIONS) {
      if (applied.has(migration.id)) continue;
      if (log) {
        console.log(`Applying migration ${migration.id}`);
      }
      await connection.beginTransaction();
      try {
        await migration.up(connection);
        await connection.query('INSERT INTO app_migrations (id) VALUES (?)', [migration.id]);
        await connection.commit();
      } catch (error) {
        await connection.rollback();
        throw error;
      }
    }
  } finally {
    await connection.end();
  }
}

export async function getMigrationStatus() {
  await ensureDatabaseExists();
  const connection = await mysql.createConnection(APP_DB_CONFIG);

  try {
    await ensureMigrationsTable(connection);
    const [appliedRows] = await connection.query('SELECT id, applied_at FROM app_migrations ORDER BY applied_at ASC');
    const applied = new Set(appliedRows.map((row) => row.id));
    const pending = MIGRATIONS.filter((migration) => !applied.has(migration.id)).map((migration) => migration.id);

    return {
      database: DB_NAME,
      applied: appliedRows,
      pending,
    };
  } finally {
    await connection.end();
  }
}
