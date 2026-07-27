# Simulator Scenario Score Accuracy - Feature History Ledger

## Feature Summary
Fix simulator presets producing wrong decision bands due to shared cookies/IPs and missing evaluate fields.

- **Source Branch**: `fix/simulator-scenario-score-accuracy`

---

## Ordered Commit List

1. **Commit Hash**: `f4ce76b`
   - **Summary**: `fix: align simulator scenarios with target decision score bands`

---

## Verification Performed

- `pnpm test`: Passed (includes simulator scenario regression tests)
- `pnpm run build`: Passed
