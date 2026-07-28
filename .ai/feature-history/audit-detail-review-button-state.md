# Audit Detail Review Button State - Feature History Ledger

## Feature Summary
Disable the matching override button in Fraud Signal Audit Detail when review status is already APPROVED or REJECTED; enable both when unreviewed.

- **Source Branch**: `fix/audit-detail-review-button-state`
- **Intended Target Branch**: `develop`
- **Base Commit**: `0345a96` (`Fix/dashboard fraud signal i18n (#18)`)

---

## Ordered Commit List (oldest -> newest)

1. **Commit Hash**: d492005
   - **Summary**: `fix(ui): disable matching audit override button by review status`
   - **Purpose**: match dialog button enabled state to current `review_status`.
   - **Files Changed**: `src/app/admin/dashboard/page.tsx`
   - **Depends-On**: none

---

## Verification Performed

- Manual logic review of dialog button `disabled` props

---

## Cherry-pick Notes

- Single UI commit; no migrations.

---

## Rollback Notes

- Revert the commit; no data impact.
