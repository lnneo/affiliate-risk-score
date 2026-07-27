# SQLite Busy Vitest CI - Feature History Ledger

## Feature Summary
Fix GitHub Actions unit test failures caused by `SQLITE_BUSY: database is locked` when Vitest workers run database initialization in parallel against the same local SQLite file.

- **Source Branch**: `fix/sqlite-busy-vitest-ci`
- **Intended Target Branch**: `develop`
- **Base Commit**: `d4475b31e800db94b0e799169a8cd09f22e1043f` (approximate develop tip before fix branch)

---

## Ordered Commit List (oldest -> newest)

1. **Commit Hash**: `3444f31`
   - **Summary**: `fix: isolate Vitest SQLite files per worker to prevent SQLITE_BUSY`
   - **Purpose**: give each Vitest worker its own SQLite file, serialize `initDatabase()` locally, and apply `PRAGMA busy_timeout` during schema initialization.
   - **Files Changed**: `src/lib/db.ts`

---

## Verification Performed

- `pnpm exec vitest run --pool=threads --maxWorkers=4`: Passed
- `pnpm test`: Passed
- `pnpm run build`: Passed

---

## Rollback Notes

- Revert commit `3444f31` if needed.
