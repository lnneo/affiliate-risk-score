import { createClient } from '@libsql/client';

import { defaultRuleStatements, defaultSeedStatements, schemaStatements, type SqlStatement } from '../src/lib/db-schema';
import { getTursoConfig } from '../src/lib/turso-config';

async function executeStatement(
  client: ReturnType<typeof createClient>,
  sql: string,
  args: SqlStatement['args'] = [],
) {
  await client.execute({
    sql,
    args: (args ?? []).map((arg) => arg ?? null),
  });
}

async function main() {
  const { url, authToken, source } = getTursoConfig({ loadVercelEnvFile: true });
  const client = createClient({ url, authToken });

  try {
    console.log(
      `Bootstrapping Turso schema and seed data (url source: ${source.url}, token source: ${source.authToken})...`,
    );

    for (const statement of schemaStatements) {
      await executeStatement(client, statement.sql, statement.args);
    }

    for (const statement of defaultSeedStatements) {
      await executeStatement(client, statement.sql, statement.args);
    }

    for (const statement of defaultRuleStatements) {
      await executeStatement(client, statement.sql, statement.args);
    }

    console.log('Turso bootstrap completed successfully.');
  } finally {
    client.close();
  }
}

main().catch((error) => {
  console.error('Turso bootstrap failed:', error);
  process.exitCode = 1;
});
