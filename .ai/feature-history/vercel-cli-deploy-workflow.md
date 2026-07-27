# Vercel CLI Deploy Workflow - Feature History Ledger

## Feature Summary
Replace deprecated `amondnet/vercel-action@v25` with the official Vercel CLI deployment flow to fix GitHub Actions deploy failures caused by an outdated CLI version.

- **Source Branch**: `fix/vercel-cli-deploy-workflow`
- **Intended Target Branch**: `develop`
- **Base Commit**: `685b95bea9607a2e373e7efff5fb8df6e0b13aa9`

---

## Ordered Commit List (oldest -> newest)

1. **Commit Hash**: `c8e8aa3`
   - **Summary**: `fix: replace deprecated Vercel action with supported CLI deployment flow`
   - **Purpose**: remove unsupported action-driven deploy path that pins `vercel@25.x`, then deploy with `vercel@latest` using `pull`, `build --prod`, and `deploy --prebuilt --prod`.
   - **Files Changed**: `.github/workflows/deploy-vercel.yml`

---

## Verification Performed

- Verified workflow diff only updates deploy mechanism and preserves checkout, pnpm setup, Node 22 setup, dependency install, and test execution.
- Confirmed commit range with: `git log --reverse --oneline 685b95bea9607a2e373e7efff5fb8df6e0b13aa9..HEAD`.
- Tests were not run locally because this is a CI workflow-only change.

---

## Dependencies Between Commits

- `c8e8aa3` has no dependency on additional local commits in this branch.

---

## Cherry-Pick Notes

- Cherry-pick order: `c8e8aa3`.
- Required repository secrets in target branch: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.
- No migration or data backfill needed.
- No additional follow-up commands required after cherry-picking.

---

## Rollback Notes

- Revert commit `c8e8aa3` to return to previous action-based deploy behavior if needed.
- If rollback is required because of production deploy policy changes, keep the test steps and replace only the deploy steps with the new approved mechanism.
