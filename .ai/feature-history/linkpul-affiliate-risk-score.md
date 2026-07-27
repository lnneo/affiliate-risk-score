# LinkPul Affiliate Risk Score Engine - Feature History Ledger

## Feature Summary
Hệ thống tính điểm rủi ro và phát hiện gian lận Tiếp thị liên kết **LinkPul** bao phủ 100% tiêu chuẩn Tapfiliate Enterprise Anti-Fraud Specs với 15 thuật toán phát hiện gian lận đa tín hiệu, hỗ trợ IP đen động wildcard (`192.168.100.*`), đối soát phần cứng đa trình duyệt, trang thử nghiệm thiết bị thật và giao diện Quản trị Admin.

- **Source Branch**: `main`
- **Target Branch**: `main`
- **Working Branch**: `feature/linkpul-affiliate-risk-score`
- **Base Commit**: `a4bb835`

---

## Ordered Commit List

1. **Commit Hash**: `ca9de02`
   - **Summary**: `feat: implement LinkPul 100% Tapfiliate Enterprise affiliate risk score engine`
   - **Modules Changed**: DB Schema (`src/lib/db.ts`), Risk Engine Core (`src/lib/fraud/`), 15 Fraud Rules, Vitest Suite, Admin Dashboard & Config, Blacklist Manager API, Simulator UI.
   - **Trailers**:
     ```text
     Feature: linkpul-affiliate-risk-score
     AI-Change: Implement 100% Tapfiliate Enterprise Anti-Fraud rules and LinkPul branding
     AI-Pick-Notes: Main implementation commit containing DB migrations and fraud engine
     Depends-On: none
     Tests: npx vitest run (passed 5/5)
     ```

2. **Commit Hash**: `LEDGER` (Final Feature History Commit)
   - **Summary**: `docs: update feature history and AI handoff for LinkPul risk score engine`
   - **Modules Changed**: `.ai/handoffs/linkpul-affiliate-risk-score.md`, `.ai/feature-history/linkpul-affiliate-risk-score.md`

---

## Verification Performed
- `npx vitest run`: Passed 5/5 test suites.
- `npm run build`: Production build completed cleanly with Next.js Turbopack.
- Dev server verified at `http://localhost:3000`.

---

## Rollback & Cherry-Pick Notes
- Order of cherry-pick: Apply `ca9de02` first, followed by ledger commit.
- SQLite WAL database files (`data/affiliate_fraud.db*`) will be initialized automatically upon app startup via `initDatabase()`.
