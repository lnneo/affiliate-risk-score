import { afterEach, describe, expect, it } from 'vitest';

import { getTursoConfig } from '../turso-config';

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

describe('turso config', () => {
  it('normalizes quoted Turso env values', () => {
    process.env.TURSO_DATABASE_URL = '"libsql://affiliate-risk-score-org.turso.io"';
    process.env.TURSO_AUTH_TOKEN = '"test-token"';

    expect(getTursoConfig()).toEqual({
      url: 'libsql://affiliate-risk-score-org.turso.io',
      authToken: 'test-token',
      source: {
        url: 'environment',
        authToken: 'environment',
      },
    });
  });

  it('accepts https Turso URLs', () => {
    process.env.TURSO_DATABASE_URL = 'https://affiliate-risk-score-org.turso.io';
    process.env.TURSO_AUTH_TOKEN = 'test-token';

    expect(getTursoConfig().url).toBe('https://affiliate-risk-score-org.turso.io');
  });

  it('auto-prefixes bare turso hostnames', () => {
    process.env.TURSO_DATABASE_URL = 'affiliate-risk-score-org.turso.io';
    process.env.TURSO_AUTH_TOKEN = 'test-token';

    expect(getTursoConfig().url).toBe('libsql://affiliate-risk-score-org.turso.io');
  });

  it('extracts auth token from composite libsql URLs', () => {
    process.env.TURSO_DATABASE_URL =
      'libsql://affiliate-risk-score-org.turso.io?authToken=token-from-query';
    delete process.env.TURSO_AUTH_TOKEN;

    expect(getTursoConfig()).toEqual({
      url: 'libsql://affiliate-risk-score-org.turso.io',
      authToken: 'token-from-query',
      source: {
        url: 'composite-url',
        authToken: 'composite-url',
      },
    });
  });

  it('detects auth tokens pasted into the database URL field', () => {
    process.env.TURSO_DATABASE_URL = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoibyJ9.sig';
    process.env.TURSO_AUTH_TOKEN = 'test-token';

    expect(() => getTursoConfig()).toThrow(/looks like an auth token/i);
  });
});
