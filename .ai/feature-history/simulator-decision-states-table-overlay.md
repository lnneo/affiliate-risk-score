# Simulator Decision States & Table Overlay - Feature History Ledger

## Feature Summary
Reorganize fraud simulator presets by decision state with rule filters, and standardize table loading UX with overlay spinners.

- **Source Branch**: `feature/simulator-decision-states-table-overlay`
- **Intended Target Branch**: `develop`

---

## Ordered Commit List (oldest -> newest)

1. **Commit Hash**: `a6a64a8`
   - **Summary**: `feat: add decision-state simulator presets and table loading overlays`
   - **Purpose**: group simulation scenarios by APPROVE/PENDING/MANUAL/REJECT with per-rule filters, and wrap admin tables with a shared loading overlay during API fetches.
   - **Files Changed**: `src/lib/simulator-scenarios.ts`, `src/components/TableOverlay.tsx`, `src/app/page.tsx`, `src/app/admin/dashboard/page.tsx`, `src/app/admin/config/page.tsx`

---

## Verification Performed

- `pnpm test`: Passed
- `pnpm run build`: Passed
