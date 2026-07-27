import fs from 'fs';
import path from 'path';

export type TursoConfig = {
  url: string;
  authToken: string;
};

const SUPPORTED_URL_PREFIXES = ['libsql://', 'https://', 'http://', 'wss://', 'ws://', 'file:'];

function normalizeEnvValue(value: string): string {
  const trimmed = value.trim();

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }

  return trimmed;
}

function loadVercelProductionEnvFile(): void {
  const envPath = path.join(process.cwd(), '.vercel', '.env.production.local');

  if (!fs.existsSync(envPath)) {
    return;
  }

  const content = fs.readFileSync(envPath, 'utf8');

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

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function normalizeTursoDatabaseUrl(rawUrl: string): string {
  const normalized = normalizeEnvValue(rawUrl);

  if (SUPPORTED_URL_PREFIXES.some((prefix) => normalized.startsWith(prefix))) {
    return normalized;
  }

  if (normalized.includes('.turso.io')) {
    return `libsql://${normalized.replace(/^\/+/, '')}`;
  }

  throw new Error(
    'TURSO_DATABASE_URL must start with libsql:// or https:// and point to a Turso database host.',
  );
}

function normalizeTursoAuthToken(rawToken: string): string {
  const normalized = normalizeEnvValue(rawToken);

  if (!normalized) {
    throw new Error('TURSO_AUTH_TOKEN is empty after normalization.');
  }

  return normalized;
}

export function getTursoConfig(options?: { loadVercelEnvFile?: boolean }): TursoConfig {
  if (options?.loadVercelEnvFile) {
    loadVercelProductionEnvFile();
  }

  const rawUrl = process.env.TURSO_DATABASE_URL;
  const rawToken = process.env.TURSO_AUTH_TOKEN;

  if (!rawUrl || !rawToken) {
    throw new Error(
      'Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN. Set them in the environment or in .vercel/.env.production.local.',
    );
  }

  return {
    url: normalizeTursoDatabaseUrl(rawUrl),
    authToken: normalizeTursoAuthToken(rawToken),
  };
}
