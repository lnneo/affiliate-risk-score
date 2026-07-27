import { describe, it, expect, beforeEach } from 'vitest';
import { db, initDatabase } from '../db';

describe('db init', () => {
  beforeEach(() => {
    // Ensure deterministic table state for seeding tests
    db.prepare('DELETE FROM blacklisted_attributes').run();
  });

  it('initDatabase is idempotent for default blacklisted values', () => {
    // If seeding is not idempotent, the second call may throw
    expect(() => initDatabase()).not.toThrow();
    expect(() => initDatabase()).not.toThrow();

    const rows = db
      .prepare('SELECT value FROM blacklisted_attributes ORDER BY value')
      .all() as Array<{ value: string }>;

    // Default demo values seeded by initDatabase
    expect(rows.map((r) => r.value)).toEqual(['198.51.100.99', 'spam-ad-network.biz']);
  });
});

