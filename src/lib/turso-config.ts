import fs from 'fs';
import path from 'path';

export type TursoConfig = {
  url: string;
  authToken: string;
};

export type TursoEnvSource = {
  url: 'environment' | 'vercel-env-file' | 'composite-url';
  authToken: 'environment' | 'vercel-env-file' | 'composite-url';
};

const SUPPORTED_URL_PREFIXES = ['libsql://', 'https://', 'http://', 'wss://', 'ws://', 'file:'];
const URL_ENV_KEYS = ['TURSO_DATABASE_URL', 'LIBSQL_URL', 'TURSO_URL'] as const;
const TOKEN_ENV_KEYS = ['TURSO_AUTH_TOKEN', 'LIBSQL_AUTH_TOKEN', 'TURSO_TOKEN'] as const;

function normalizeEnvValue(value: string): string {
  const trimmed = value.trim().replace(/^\uFEFF/, '');

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }

  return trimmed;
}

function parseEnvFile(content: string): Record<string, string> {
  const values: Record<string, string> = {};

  for (const line of content.split('\n')) {
    const trimmedLine = line.trim().replace(/\r$/, '');

    if (!trimmedLine || trimmedLine.startsWith('#')) {
      continue;
    }

    const withoutExport = trimmedLine.startsWith('export ')
      ? trimmedLine.slice('export '.length).trim()
      : trimmedLine;

    const separatorIndex = withoutExport.indexOf('=');
    if (separatorIndex === -1) {
      continue;
    }

    const key = withoutExport.slice(0, separatorIndex).trim();
    const value = normalizeEnvValue(withoutExport.slice(separatorIndex + 1));

    if (value) {
      values[key] = value;
    }
  }

  return values;
}

function loadVercelProductionEnvFile(): Record<string, string> {
  const envPath = path.join(process.cwd(), '.vercel', '.env.production.local');

  if (!fs.existsSync(envPath)) {
    return {};
  }

  return parseEnvFile(fs.readFileSync(envPath, 'utf8'));
}

function readEnvValue(keys: readonly string[]): { key: string; value: string } | null {
  for (const key of keys) {
    const value = process.env[key];
    if (value?.trim()) {
      return { key, value };
    }
  }

  return null;
}

function resolveEnvValue(
  keys: readonly string[],
  vercelEnv: Record<string, string>,
): { key: string; value: string; source: TursoEnvSource['url'] } | null {
  const fromProcess = readEnvValue(keys);
  if (fromProcess) {
    return { ...fromProcess, source: 'environment' };
  }

  for (const key of keys) {
    const value = vercelEnv[key];
    if (value?.trim()) {
      return { key, value, source: 'vercel-env-file' };
    }
  }

  return null;
}

function looksLikeAuthToken(value: string): boolean {
  return /^eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\./.test(value);
}

function stripWrappingCharacters(value: string): string {
  let normalized = normalizeEnvValue(value).replace(/^@+/, '');

  if (normalized.startsWith('[') && normalized.endsWith(']')) {
    normalized = normalized.slice(1, -1).trim();
  }

  return normalized;
}

function splitCompositeTursoUrl(value: string): { url: string; authToken?: string } {
  const normalized = stripWrappingCharacters(value);
  const queryIndex = normalized.indexOf('?');

  if (queryIndex === -1) {
    return { url: normalized };
  }

  const baseUrl = normalized.slice(0, queryIndex);
  const query = new URLSearchParams(normalized.slice(queryIndex + 1));
  const authToken = query.get('authToken') ?? query.get('auth_token') ?? undefined;

  return { url: baseUrl, authToken: authToken ?? undefined };
}

function normalizeTursoDatabaseUrl(rawUrl: string): string {
  const { url } = splitCompositeTursoUrl(rawUrl);
  const normalized = stripWrappingCharacters(url);

  if (looksLikeAuthToken(normalized)) {
    throw new Error(
      'TURSO_DATABASE_URL looks like an auth token. Put the Turso Database URL (libsql://... or https://...) in TURSO_DATABASE_URL and the token in TURSO_AUTH_TOKEN.',
    );
  }

  if (SUPPORTED_URL_PREFIXES.some((prefix) => normalized.startsWith(prefix))) {
    return normalized;
  }

  if (normalized.startsWith('libsql:') && !normalized.startsWith('libsql://')) {
    return normalized.replace(/^libsql:/, 'libsql://');
  }

  if (normalized.includes('.turso.io')) {
    return `libsql://${normalized.replace(/^\/+/, '')}`;
  }

  throw new Error(
    [
      'TURSO_DATABASE_URL is not a valid Turso database URL.',
      `Received a ${normalized.length}-character value without libsql://, https://, or a .turso.io host.`,
      'From Turso, copy the Database URL from `turso db show <database-name>` (example: libsql://my-db-myorg.turso.io).',
      'If the variable is marked Sensitive on Vercel, `vercel pull` cannot read it in GitHub Actions. Add TURSO_DATABASE_URL and TURSO_AUTH_TOKEN as GitHub repository secrets for CI bootstrap.',
    ].join(' '),
  );
}

function normalizeTursoAuthToken(rawToken: string): string {
  const normalized = stripWrappingCharacters(rawToken);

  if (!normalized) {
    throw new Error('TURSO_AUTH_TOKEN is empty after normalization.');
  }

  return normalized;
}

export function getTursoConfig(options?: {
  loadVercelEnvFile?: boolean;
}): TursoConfig & { source: TursoEnvSource } {
  const vercelEnv = options?.loadVercelEnvFile ? loadVercelProductionEnvFile() : {};

  const resolvedUrl = resolveEnvValue(URL_ENV_KEYS, vercelEnv);
  if (!resolvedUrl) {
    throw new Error(
      [
        'Missing TURSO_DATABASE_URL.',
        'Set it in GitHub Actions secrets for CI bootstrap, or in .vercel/.env.production.local after `vercel pull` for local bootstrap.',
        'Vercel Sensitive environment variables cannot be exported by `vercel pull`, so CI must use GitHub secrets even if the values are already configured on Vercel.',
      ].join(' '),
    );
  }

  const composite = splitCompositeTursoUrl(resolvedUrl.value);
  const resolvedToken = composite.authToken
    ? { key: 'authToken', value: composite.authToken, source: 'composite-url' as const }
    : resolveEnvValue(TOKEN_ENV_KEYS, vercelEnv);

  if (!resolvedToken) {
    throw new Error(
      [
        'Missing TURSO_AUTH_TOKEN.',
        'Set it in GitHub Actions secrets for CI bootstrap, or in .vercel/.env.production.local after `vercel pull` for local bootstrap.',
        'Vercel Sensitive environment variables cannot be exported by `vercel pull`, so CI must use GitHub secrets even if the values are already configured on Vercel.',
      ].join(' '),
    );
  }

  return {
    url: normalizeTursoDatabaseUrl(composite.url),
    authToken: normalizeTursoAuthToken(resolvedToken.value),
    source: {
      url: composite.authToken ? 'composite-url' : resolvedUrl.source,
      authToken: composite.authToken ? 'composite-url' : resolvedToken.source,
    },
  };
}
