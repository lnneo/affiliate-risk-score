import { describe, it, expect, beforeEach } from 'vitest';
import { execute, initDatabase, queryMany } from '../db';

describe('db init', () => {
  beforeEach(async () => {
    // Ensure deterministic table state for seeding tests
    await execute('DELETE FROM blacklisted_attributes');
  });

  it('initDatabase is idempotent for default blacklisted values', async () => {
    // If seeding is not idempotent, the second call may throw
    await expect(initDatabase()).resolves.toBeUndefined();
    await expect(initDatabase()).resolves.toBeUndefined();

    const rows = await queryMany<{ value: string }>('SELECT value FROM blacklisted_attributes ORDER BY value');

    // Default demo values seeded by initDatabase
    expect(rows.map((r) => r.value)).toEqual(['198.51.100.99', 'spam-ad-network.biz']);
  });
});

