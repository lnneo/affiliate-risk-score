# LinkPul Affiliate Risk Score Engine - Feature History Ledger

## Feature Summary
Hệ thống tính điểm rủi ro và phát hiện gian lận Tiếp thị liên kết **LinkPul** bao phủ 100% tiêu chuẩn Tapfiliate Enterprise Anti-Fraud Specs với 15 thuật toán phát hiện gian lận đa tín hiệu, hỗ trợ IP đen động wildcard (`192.168.100.*`), đối soát phần cứng đa trình duyệt, trang thử nghiệm thiết bị thật, giao diện Quản trị Admin, chuẩn hóa nút bấm thành Động từ ngắn gọn, cấu hình pnpm & Node 22 SDK, và đã đặt nhánh `develop` về gốc ban đầu để mở Pull Request hoàn chỉnh.

- **Source Branch**: `main` (`a4bb835`)
- **Target Branch**: `develop` (`a4bb835`)
- **Working Branch**: `feature/linkpul-affiliate-risk-score` (`ec48dde`)
- **Remote Origin**: `https://github.com/lnneo/affiliate-risk-score.git`
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

4. **Commit Hash**: `0fe6520`
   - **Summary**: `chore: enforce Node.js 22 LTS engine constraint (>=22.0.0)`
   - **Modules Changed**: `package.json`, `.nvmrc`, `pnpm-lock.yaml`, `.ai/handoffs/linkpul-affiliate-risk-score.md`.

5. **Commit Hash**: `4af8b09`
   - **Summary**: `chore: update gitignore and untrack runtime db/zip files`
   - **Modules Changed**: `.gitignore`, removed runtime DB & archive files from tracking.

6. **Commit Hash**: `LEDGER` (Final Feature History Commit)
   - **Summary**: `docs: update feature history and AI handoff for LinkPul risk score engine`
   - **Modules Changed**: `.ai/handoffs/linkpul-affiliate-risk-score.md`, `.ai/feature-history/linkpul-affiliate-risk-score.md`

---

## Verification Performed
- `pnpm test`: Passed 5/5 test suites.
- `pnpm build`: Production build completed cleanly with Next.js Turbopack.
- Remote push verified: PR ready from `feature/linkpul-affiliate-risk-score` into `develop` (`https://github.com/lnneo/affiliate-risk-score/compare/develop...feature/linkpul-affiliate-risk-score`).

---

## Rollback & Cherry-Pick Notes
- Order of cherry-pick: Apply `ca9de02`, `b51995a`, `d06a3e1`, `0fe6520`, `4af8b09` in sequence.
- SQLite WAL database files (`data/affiliate_fraud.db*`) are ignored via `.gitignore` and auto-created at runtime.
