# Button Loading States - Feature History Ledger

## Feature Summary
Add loading feedback to async action buttons and fix the fraud simulator results panel empty state during evaluation.

- **Source Branch**: `feature/button-loading-states`
- **Intended Target Branch**: `develop`

---

## Ordered Commit List (oldest -> newest)

1. **Commit Hash**: `40c17e4`
   - **Summary**: `feat: add loading states for async buttons and simulator results panel`
   - **Purpose**: introduce shared `LoadingButton`/`PanelLoadingState` components, show loading in simulator/store result panels with matched column height, and wire loading states across admin/referral/nav actions.
   - **Files Changed**: `src/components/LoadingButton.tsx`, `src/components/PanelLoadingState.tsx`, `src/app/page.tsx`, `src/app/store/page.tsx`, `src/app/admin/dashboard/page.tsx`, `src/app/admin/config/page.tsx`, `src/app/referral/page.tsx`, `src/app/ref/[affiliateId]/page.tsx`, `src/components/Navbar.tsx`

---

## Verification Performed

- `pnpm test`: Passed
- `pnpm run build`: Passed

---

## Rollback Notes

- Revert the feature commit to remove shared loading components and restore prior button behavior.
