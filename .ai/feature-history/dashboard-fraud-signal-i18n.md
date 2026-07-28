# Dashboard Fraud Signal i18n - Feature History Ledger

## Feature Summary
Localize Fraud Signal Audit Detail tree items (and rule config descriptions) so EN/VI switching no longer shows fixed Vietnamese/English DB text for signal reasons.

- **Source Branch**: `fix/dashboard-fraud-signal-i18n`
- **Intended Target Branch**: `develop`
- **Base Commit**: `5585bd7` (`Feature/full i18n keys (#17)`)

---

## Ordered Commit List (oldest -> newest)

1. **Commit Hash**: `8dcc7a1`
   - **Summary**: `fix(i18n): localize dashboard fraud signal audit reasons`
   - **Purpose**: persist `reasonKey`/`reasonParams` in signal metadata; resolve reasons via dictionary at display time (with legacy `signal_type` inference); localize rule descriptions on config page.
   - **Files Changed**: `src/i18n/format.ts`, `src/i18n/dictionaries/*`, `src/i18n/__tests__/format.test.ts`, `src/lib/fraud/risk-engine.ts`, `src/lib/fraud/rules/behavior.ts`, `src/app/admin/dashboard/page.tsx`, `src/app/admin/config/page.tsx`, `src/app/api/admin/risk-scores/route.ts`
   - **Depends-On**: none

---

## Verification Performed

- `pnpm test`: Passed (20/20)
- `pnpm run build`: Passed

---

## Cherry-pick Notes

- Single implementation commit; apply `8dcc7a1` then this ledger commit.
- No DB schema migration; metadata_json gains optional `reasonKey`/`reasonParams`.
- Existing rows without keys still translate via `signal_type` + metadata inference.

---

## Rollback Notes

- Revert commits in reverse order.
- No schema cleanup required.
