# LinkPul Affiliate Risk Score Engine - Feature History Ledger

## Feature Summary
Hệ thống tính điểm rủi ro và phát hiện gian lận Tiếp thị liên kết **LinkPul** bao phủ 100% tiêu chuẩn Tapfiliate Enterprise Anti-Fraud Specs với 15 thuật toán phát hiện gian lận đa tín hiệu, hỗ trợ IP đen động wildcard (`192.168.100.*`), đối soát phần cứng đa trình duyệt, trang thử nghiệm thiết bị thật, giao diện Quản trị Admin và chuẩn hóa nút bấm thành Động từ ngắn gọn.

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

4. **Commit Hash**: `LEDGER` (Final Feature History Commit)
   - **Summary**: `docs: update feature history and AI handoff for LinkPul risk score engine`
   - **Modules Changed**: `.ai/handoffs/linkpul-affiliate-risk-score.md`, `.ai/feature-history/linkpul-affiliate-risk-score.md`

---

## Verification Performed
- `npx vitest run`: Passed 5/5 test suites.
- `npm run build`: Production build completed cleanly with Next.js Turbopack.
- Dev server verified at `http://localhost:3000`.

---

## Rollback & Cherry-Pick Notes
- Order of cherry-pick: Apply `ca9de02`, `b51995a`, `d06a3e1` in sequence.
- SQLite WAL database files (`data/affiliate_fraud.db*`) will be initialized automatically upon app startup via `initDatabase()`.
