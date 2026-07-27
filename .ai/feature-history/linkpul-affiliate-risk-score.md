# LinkPul Affiliate Risk Score Engine - Feature History Ledger

## Feature Summary
Hệ thống tính điểm rủi ro và phát hiện gian lận Tiếp thị liên kết **LinkPul** bao phủ 100% tiêu chuẩn Tapfiliate Enterprise Anti-Fraud Specs với 15 thuật toán phát hiện gian lận đa tín hiệu, hỗ trợ IP đen động wildcard (`192.168.100.*`), đối soát phần cứng đa trình duyệt, trang thử nghiệm thiết bị thật, giao diện Quản trị Admin, chuẩn hóa nút bấm thành Động từ ngắn gọn, và thiết lập cấu hình pnpm & ràng buộc phiên bản Node 22 SDK (`>=22.0.0`) tương thích SQLite 3.53.3 (`better-sqlite3` ^13.0.1).

- **Source Branch**: `main`
- **Target Branch**: `main`
- **Working Branch**: `feature/linkpul-affiliate-risk-score`
- **Base Commit**: `a4bb835`

---

## Ordered Commit List

1. **Commit Hash**: `ca9de02`
   - **Summary**: `feat: implement LinkPul 100% Tapfiliate Enterprise affiliate risk score engine`
   - **Modules Changed**: DB Schema (`src/lib/db.ts`), Risk Engine Core (`src/lib/fraud/`), 15 Fraud Rules, Vitest Suite, Admin Dashboard & Config, Blacklist Manager API, Simulator UI.

2. **Commit Hash**: `b51995a`
   - **Summary**: `fix: prevent text overflow across all pages and modals using responsive flex/grid wrap and break-all text wrapping`
   - **Modules Changed**: `src/app/page.tsx`, `src/app/admin/dashboard/page.tsx`, `src/app/admin/config/page.tsx`, `src/app/referral/page.tsx`, `src/app/ref/[affiliateId]/page.tsx`, `src/app/store/page.tsx`.

3. **Commit Hash**: `d06a3e1`
   - **Summary**: `style: update button labels across all pages to concise action verbs`
   - **Modules Changed**: Navbar logo & button, Simulator, Admin Audit Ledger, Admin Config, Real Referral, Landing Page, Store Checkout.

4. **Commit Hash**: `de4a9c5`
   - **Summary**: `chore: switch commands to pnpm and set Node.js engine constraint (>=22.0.0) for SQLite 3.53.3 compatibility`
   - **Modules Changed**: `package.json`, `.nvmrc`, `.ai/handoffs/linkpul-affiliate-risk-score.md`.

5. **Commit Hash**: `LEDGER` (Final Feature History Commit)
   - **Summary**: `docs: update feature history and AI handoff for LinkPul risk score engine`
   - **Modules Changed**: `.ai/handoffs/linkpul-affiliate-risk-score.md`, `.ai/feature-history/linkpul-affiliate-risk-score.md`

---

## Verification Performed
- `pnpm test`: Passed 5/5 test suites.
- `pnpm build`: Production build completed cleanly with Next.js Turbopack.
- SQLite version verified: `3.53.3` via `better-sqlite3` ^13.0.1.
- Node.js SDK constraint: `>=22.0.0` (active Node version `v24.13.0`).

---

## Rollback & Cherry-Pick Notes
- Order of cherry-pick: Apply `ca9de02`, `b51995a`, `d06a3e1`, `de4a9c5` in sequence.
- SQLite WAL database files (`data/affiliate_fraud.db*`) will be initialized automatically upon app startup via `initDatabase()`.
