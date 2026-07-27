# Simulator Panel Min Height Fix - Feature History Ledger

## Feature Summary
Fix coupled column heights on the fraud simulator and store checkout layouts.

- **Source Branch**: `fix/simulator-panel-min-height`
- **Intended Target Branch**: `develop`

---

## Ordered Commit List (oldest -> newest)

1. **Commit Hash**: `0091981`
   - **Summary**: `fix: decouple result panel height from order form column`
   - **Purpose**: measure the order form card height and apply it only as `min-height` on the results panel, avoiding `items-stretch` equal-height grid behavior.
   - **Files Changed**: `src/hooks/useSyncedPanelMinHeight.ts`, `src/app/page.tsx`, `src/app/store/page.tsx`

---

## Verification Performed

- `pnpm run build`: Passed
