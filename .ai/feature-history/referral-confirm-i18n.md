# Referral Confirm i18n - Feature History Ledger

## Feature Summary
Fix production referral link mapping, add seed-data confirmation, and introduce en/vi language support with browser fallback.

- **Source Branch**: `feature/referral-confirm-i18n`
- **Intended Target Branch**: `develop`

---

## Ordered Commit List (oldest -> newest)

1. **Commit Hash**: `f6d8547`
   - **Summary**: `feat: fix referral domain links, seed confirm, and en/vi i18n`
   - **Purpose**: use current origin for share links on deployed domains, require confirmation before demo seeding, and add dictionary-based i18n with browser/localStorage locale selection.
   - **Files Changed**: `src/app/referral/page.tsx`, `src/components/Navbar.tsx`, `src/components/ConfirmDialog.tsx`, `src/components/LanguageSwitcher.tsx`, `src/i18n/*`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/store/page.tsx`, `src/app/admin/dashboard/page.tsx`, `src/app/admin/config/page.tsx`

---

## Verification Performed

- `pnpm test`: Passed
- `pnpm run build`: Passed
