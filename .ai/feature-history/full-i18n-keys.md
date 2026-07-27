# Full i18n Keys - Feature History Ledger

## Feature Summary
Expand en/vi dictionaries to cover all UI copy, wire pages/components to dictionary keys, strip localized labels from simulator scenario data, and localize live fraud signal reasons via `reasonKey` + `reasonParams`.

- **Source Branch**: `feature/full-i18n-keys`
- **Intended Target Branch**: `develop`
- **Base Commit**: `d52e590` (`Feature/referral confirm i18n (#16)`)

---

## Ordered Commit List (oldest -> newest)

1. **Commit Hash**: `3fff12e`
   - **Summary**: `feat(i18n): expand dictionaries to cover all hardcoded UI text`
   - **Purpose**: replace partial dictionaries with complete en/vi coverage across brand, nav, common, seed, language, referral, simulator, scenarios, store, dashboard, config, decision, and refLanding namespaces.
   - **Files Changed**: `src/i18n/dictionaries/en.ts`, `src/i18n/dictionaries/vi.ts`
   - **Depends-On**: none

2. **Commit Hash**: `ffd2f63`
   - **Summary**: `feat(i18n): wire all UI surfaces to dictionary keys`
   - **Purpose**: move remaining page/component copy onto dictionaries and remove localized labels from simulator scenario data so UI resolves text via `t.*`.
   - **Files Changed**: `src/app/page.tsx`, `src/app/store/page.tsx`, `src/app/admin/dashboard/page.tsx`, `src/app/admin/config/page.tsx`, `src/app/ref/[affiliateId]/page.tsx`, `src/components/TableOverlay.tsx`, `src/i18n/format.ts`, `src/lib/simulator-scenarios.ts`
   - **Depends-On**: `3fff12e`

3. **Commit Hash**: `f1bd428`
   - **Summary**: `feat(i18n): localize live fraud signal reasons via reasonKey`
   - **Purpose**: emit stable `reasonKey`/`reasonParams` from fraud rules with English `reason` fallback; translate live evaluation reasons on simulator/store while leaving persisted dashboard reasons unchanged.
   - **Files Changed**: `src/lib/fraud/types.ts`, `src/lib/fraud/rules/*`, `src/i18n/dictionaries/en.ts`, `src/i18n/dictionaries/vi.ts`, `src/i18n/format.ts`, `src/app/page.tsx`, `src/app/store/page.tsx`
   - **Depends-On**: `ffd2f63`

---

## Verification Performed

- `pnpm test`: Passed (15/15)
- `pnpm run build`: Passed

---

## Cherry-pick Notes

- Apply in order: `3fff12e` → `ffd2f63` → `f1bd428` → this ledger commit.
- No migrations or config changes.
- Admin dashboard continues to show persisted DB `reason` text; only live evaluation results use `reasonKey` translation.

---

## Rollback Notes

- Revert this branch onto `develop` with `git revert` in reverse order if needed.
- No schema changes; safe to roll back without DB cleanup.
