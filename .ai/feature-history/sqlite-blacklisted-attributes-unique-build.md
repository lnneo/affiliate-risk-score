# Sqlite Unique Constraint During Build - Feature History Ledger

## Feature Summary
Fix a GitHub build failure caused by `SqliteError: UNIQUE constraint failed: blacklisted_attributes.value` during Next.js “collect page data” for API routes. The root cause was non-idempotent database seeding in `src/lib/db.ts` when `initDatabase()` runs multiple times (including potentially in parallel import scenarios).

This change makes default DB seeding **idempotent and concurrency-safe** by switching demo inserts to `INSERT OR IGNORE` for:
- `affiliate_profiles` (default `aff_john_doe`)
- `blacklisted_attributes` (default `bl_1`, `bl_2`)

## Ordered Commit List (oldest -> newest)

1. **Commit Hash**: `0e0b8e9`
   - **Summary**: `fix: make db init seed idempotent for sqlite unique constraints`
   - **Purpose**: prevent repeated `initDatabase()` seeding from failing with UNIQUE constraint errors on `blacklisted_attributes.value`.
   - **Files Changed**: `src/lib/db.ts`, `src/lib/__tests__/db-init.test.ts`

---

## Verification Performed

- `pnpm test`: Passed
- `pnpm run build`: Succeeded (no UNIQUE constraint error during page-data collection)

---

## Rollback Notes

- Revert commit `0e0b8e9` if needed.
- If reverting, ensure your build environment does not run duplicate DB seeding (otherwise the UNIQUE constraint failure may return).

