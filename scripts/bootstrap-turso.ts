import { createClient } from '@libsql/client';

import { defaultRuleStatements, defaultSeedStatements, schemaStatements, type SqlStatement } from '../src/lib/db-schema';

function requireEnv(name: 'TURSO_DATABASE_URL' | 'TURSO_AUTH_TOKEN'): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

const client = createClient({
  url: requireEnv('TURSO_DATABASE_URL'),
  authToken: requireEnv('TURSO_AUTH_TOKEN'),
});

async function executeStatement(
  sql: string,
  args: SqlStatement['args'] = [],
) {
  await client.execute({
    sql,
    args: (args ?? []).map((arg) => arg ?? null),
  });
}

async function main() {
  console.log('Bootstrapping Turso schema and seed data...');

  for (const statement of schemaStatements) {
    await executeStatement(statement.sql, statement.args);
  }

  for (const statement of defaultSeedStatements) {
    await executeStatement(statement.sql, statement.args);
  }

  for (const statement of defaultRuleStatements) {
    await executeStatement(statement.sql, statement.args);
  }

  console.log('Turso bootstrap completed successfully.');
  client.close();
}

main().catch((error) => {
  client.close();
  console.error('Turso bootstrap failed:', error);
  process.exitCode = 1;
});
