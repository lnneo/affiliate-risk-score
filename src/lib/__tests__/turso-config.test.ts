import { describe, expect, it } from 'vitest';

import { getTursoConfig } from '../turso-config';

describe('turso config', () => {
  it('normalizes quoted Turso env values', () => {
    process.env.TURSO_DATABASE_URL = '"libsql://affiliate-risk-score-org.turso.io"';
    process.env.TURSO_AUTH_TOKEN = '"test-token"';

    expect(getTursoConfig()).toEqual({
      url: 'libsql://affiliate-risk-score-org.turso.io',
      authToken: 'test-token',
    });
  });

  it('accepts https Turso URLs', () => {
    process.env.TURSO_DATABASE_URL = 'https://affiliate-risk-score-org.turso.io';
    process.env.TURSO_AUTH_TOKEN = 'test-token';

    expect(getTursoConfig().url).toBe('https://affiliate-risk-score-org.turso.io');
  });
});
