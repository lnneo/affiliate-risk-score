# Turso Bootstrap URL CI - Feature History Ledger

## Feature Summary
Fix GitHub Actions Turso bootstrap failure (`LibsqlError: URL_INVALID`) when `pnpm db:turso:bootstrap` runs after `vercel pull`.

- **Source Branch**: `fix/turso-bootstrap-url-ci`
- **Intended Target Branch**: `develop`
- **Base Commit**: `cca44f8` (approximate develop tip before fix branch)

---

## Ordered Commit List (oldest -> newest)

1. **Commit Hash**: `e443be3`
   - **Summary**: `fix: normalize Turso env and load Vercel production env in bootstrap`
   - **Purpose**: centralize Turso URL/token normalization (trim quotes, support `libsql://`/`https://`, auto-prefix bare `.turso.io` hosts), load `.vercel/.env.production.local` inside Node instead of shell `source`, and defer `createClient()` until config is validated.
   - **Files Changed**: `src/lib/turso-config.ts`, `scripts/bootstrap-turso.ts`, `src/lib/db.ts`, `.github/workflows/deploy-vercel.yml`, `src/lib/__tests__/turso-config.test.ts`

---

## Verification Performed

- `pnpm test`: Passed
- `pnpm run build`: Passed

---

## Rollback Notes

- Revert the fix commit if Turso bootstrap still fails; verify `TURSO_DATABASE_URL` on Vercel Production uses `libsql://` or `https://` format.
