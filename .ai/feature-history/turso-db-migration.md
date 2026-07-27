# Turso DB Migration - Feature History Ledger

## Feature Summary
Migrate production database access to Turso-compatible libSQL while preserving local SQLite development. The runtime now uses an async libSQL adapter instead of `better-sqlite3`, API routes and fraud-engine queries await shared DB helpers, and Turso schema/seed setup is handled by a dedicated bootstrap script rather than runtime import side effects.

- **Source Branch**: `feature/turso-db-migration`
- **Intended Target Branch**: `develop`
- **Base Commit**: `d4475b31e800db94b0e799169a8cd09f22e1043f`

---

## Ordered Commit List (oldest -> newest)

1. **Commit Hash**: `e35d281`
   - **Summary**: `feat: migrate production database access to Turso-compatible libSQL`
   - **Purpose**: replace sync `better-sqlite3` runtime access with a shared async libSQL adapter that supports local SQLite and Turso production, migrate server-side query callers, add a Turso bootstrap script, and document required environment variables.
   - **Files Changed**:
     - `package.json`, `pnpm-lock.yaml`, `next.config.ts`
     - `src/lib/db.ts`, `src/lib/db-schema.ts`
     - `src/lib/fraud/risk-engine.ts`
     - `src/lib/fraud/rules/identity.ts`
     - `src/lib/fraud/rules/network.ts`
     - `src/lib/fraud/rules/behavior.ts`
     - `src/lib/fraud/rules/advanced-tapfiliate.ts`
     - `src/app/api/admin/blacklist/route.ts`
     - `src/app/api/admin/config/route.ts`
     - `src/app/api/admin/register-affiliate-device/route.ts`
     - `src/app/api/admin/risk-scores/route.ts`
     - `src/app/api/demo/seed/route.ts`
     - `src/app/api/tracking/click/route.ts`
     - `src/lib/__tests__/db-init.test.ts`
     - `src/lib/fraud/__tests__/risk-engine.test.ts`
     - `scripts/bootstrap-turso.ts`
     - `README.md`

---

## Verification Performed

- `pnpm test`: Passed
- `pnpm run build`: Passed
- `pnpm exec eslint ...`: attempted on changed backend files, but repo still has existing `no-explicit-any` lint debt in API route files outside the migration-specific behavior changes.

---

## Dependencies Between Commits

- `e35d281` has no dependency on additional local commits in this branch.

---

## Cherry-Pick Notes

- Cherry-pick order: `e35d281`
- Required production environment variables: `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`
- Optional override: `LOCAL_DB=1` forces the app to stay on local SQLite
- Run `pnpm db:turso:bootstrap` before first production use against a new Turso database

---

## Rollback Notes

- Revert commit `e35d281` to restore the previous `better-sqlite3` runtime implementation.
- If rolling back after bootstrapping Turso, application code will no longer use Turso but remote data will remain unchanged.
