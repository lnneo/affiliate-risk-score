# Turso Bootstrap CI Secrets - Feature History Ledger

## Feature Summary
Fix CI Turso bootstrap failing after Vercel env normalization because sensitive Turso credentials are not exported by `vercel pull`.

- **Source Branch**: `fix/turso-bootstrap-ci-secrets`
- **Intended Target Branch**: `develop`

---

## Ordered Commit List (oldest -> newest)

1. **Commit Hash**: `2cadc0c`
   - **Summary**: `fix: load Turso credentials from GitHub secrets for CI bootstrap`
   - **Purpose**: improve Turso env resolution/error messages and document that Vercel Sensitive vars cannot be pulled into CI; bootstrap reads credentials from `.vercel/.env.production.local` after `vercel pull`.
   - **Files Changed**: `src/lib/turso-config.ts`, `scripts/bootstrap-turso.ts`, `.github/workflows/deploy-vercel.yml`, `src/lib/__tests__/turso-config.test.ts`, `README.md`

---

## Verification Performed

- `pnpm test`: Passed
- `pnpm run build`: Passed

---

## Rollback Notes

- Revert the fix commit if needed. CI bootstrap requires GitHub repository secrets `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`.
