import { createClient, type Client, type InValue, type ResultSet } from '@libsql/client';
import fs from 'fs';
import path from 'path';

import { defaultRuleStatements, defaultSeedStatements, schemaStatements, type SqlStatement } from './db-schema';

type SqlPrimitive = string | number | bigint | ArrayBuffer | Uint8Array | null;
type QueryArgs = ReadonlyArray<SqlPrimitive | boolean | undefined>;

const useTurso = process.env.NODE_ENV === 'production' && Boolean(process.env.TURSO_DATABASE_URL) && !process.env.LOCAL_DB;
const isTestEnv = process.env.NODE_ENV === 'test' || Boolean(process.env.VITEST);
const localDataDir = path.join(process.cwd(), 'data');
const localDbPath = path.join(localDataDir, 'affiliate_fraud.db');
const localDbUrl = `file:${localDbPath}`;

if (!useTurso && !fs.existsSync(localDataDir)) {
  fs.mkdirSync(localDataDir, { recursive: true });
}

function createDbClient(): Client {
  if (useTurso) {
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!url || !authToken) {
      throw new Error('Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN for production Turso database access');
    }

    return createClient({ url, authToken });
  }

  return createClient({ url: localDbUrl });
}

const client = createDbClient();
let localSchemaInitPromise: Promise<void> | null = null;
let startupInitPromise: Promise<void> | null = null;

function normalizeArgs(args: QueryArgs = []): InValue[] {
  return args.map((arg) => {
    if (typeof arg === 'boolean') {
      return arg ? 1 : 0;
    }

    if (typeof arg === 'undefined') {
      return null;
    }

    return arg;
  }) as InValue[];
}

function mapRows<T>(result: ResultSet): T[] {
  return result.rows.map((row) => {
    const entry = Object.fromEntries(
      result.columns.map((column, index) => {
        const value = (row as Record<string, unknown>)[column] ?? (row as unknown as Record<number, unknown>)[index];
        return [column, value];
      }),
    );

    return entry as T;
  });
}

async function executeStatement(statement: SqlStatement): Promise<void> {
  await executeRaw(statement.sql, statement.args);
}

async function executeRaw(sql: string, args: QueryArgs = []): Promise<ResultSet> {
  return client.execute({ sql, args: normalizeArgs(args) });
}

async function queryManyRaw<T>(sql: string, args: QueryArgs = []): Promise<T[]> {
  const result = await executeRaw(sql, args);
  return mapRows<T>(result);
}

async function ensureLocalSchemaInitialized(): Promise<void> {
  if (useTurso) {
    return;
  }

  if (!localSchemaInitPromise) {
    localSchemaInitPromise = (async () => {
      for (const statement of schemaStatements) {
        await executeStatement(statement);
      }

      const orderColumns = await queryManyRaw<{ name: string }>("PRAGMA table_info('orders')");
      const hasCountry = orderColumns.some((column) => column.name === 'country');
      const hasExternalCustomerId = orderColumns.some((column) => column.name === 'external_customer_id');

      if (!hasCountry) {
        await executeRaw("ALTER TABLE orders ADD COLUMN country TEXT DEFAULT 'US'");
      }

      if (!hasExternalCustomerId) {
        await executeRaw('ALTER TABLE orders ADD COLUMN external_customer_id TEXT');
      }
    })();
  }

  await localSchemaInitPromise;
}

async function ensureDefaultData(): Promise<void> {
  for (const statement of defaultSeedStatements) {
    await executeStatement(statement);
  }

  for (const statement of defaultRuleStatements) {
    await executeStatement(statement);
  }
}

async function ensureDatabaseReady(): Promise<void> {
  if (!useTurso) {
    await (startupInitPromise ?? ensureLocalSchemaInitialized());
  }
}

export async function execute(sql: string, args: QueryArgs = []): Promise<ResultSet> {
  await ensureDatabaseReady();
  return executeRaw(sql, args);
}

export async function queryMany<T>(sql: string, args: QueryArgs = []): Promise<T[]> {
  const result = await execute(sql, args);
  return mapRows<T>(result);
}

export async function queryOne<T>(sql: string, args: QueryArgs = []): Promise<T | null> {
  const rows = await queryMany<T>(sql, args);
  return rows[0] ?? null;
}

export async function initDatabase(): Promise<void> {
  if (useTurso) {
    return;
  }

  await ensureLocalSchemaInitialized();
  await ensureDefaultData();
}

export function isUsingTurso(): boolean {
  return useTurso;
}

export function getLocalDbUrl(): string {
  return localDbUrl;
}

export function getTursoConnectionConfig(): { url: string; authToken: string } {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    throw new Error('Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN');
  }

  return { url, authToken };
}

export const db = {
  execute,
  queryMany,
  queryOne,
};

if (!useTurso && !isTestEnv) {
  startupInitPromise = initDatabase();
}
