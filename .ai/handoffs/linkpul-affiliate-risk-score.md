# Technical Handoff Context: LinkPul Affiliate Risk Score Engine

## 1. Task & Goal Summary
- **Project Name**: LinkPul (Affiliate Fraud & Risk Score Engine)
- **Goal**: Implement a production-grade, 100% compliant Affiliate Fraud Risk Engine adhering to [Tapfiliate Enterprise Anti-Fraud Specifications](https://support.tapfiliate.com/en/articles/5898063-fraud-prevention-monitoring-in-affiliate-marketing).
- **Repository Remote**: `https://github.com/lnneo/affiliate-risk-score.git`
- **Branches**:
  - `main`: Base initial commit (`a4bb835`)
  - `develop`: Integration branch (`4af8b09`)
  - `feature/linkpul-affiliate-risk-score`: Active feature branch (`4af8b09`)
- **Business Logic Specification (English)**: Reference [.ai/handoffs/business-logic.md](file:///Users/longnd/Projects/AdPulHQ/affiliate-risk-score/.ai/handoffs/business-logic.md)
- **Business Logic Specification (Vietnamese)**: Reference [.ai/handoffs/business-logic-vi.md](file:///Users/longnd/Projects/AdPulHQ/affiliate-risk-score/.ai/handoffs/business-logic-vi.md)
- **Language & Stack**: TypeScript, Next.js App Router, TailwindCSS, `better-sqlite3` (SQLite v3.53.3), FingerprintJS (OSS), Vitest, `pnpm`.
- **Node SDK Constraint**: Node.js `>= 22.0.0` (Enforced in `package.json` engines & `.nvmrc` for Node 22 LTS compatibility with native C++ `better-sqlite3` N-API bindings).
- **Package Manager**: `pnpm@11.13.1`

---

## 2. Technical Architecture & Database Schema (`data/affiliate_fraud.db`)

Key tables in `src/lib/db.ts`:
- **`affiliate_profiles`**: Stores registered affiliate profiles (`affiliate_id`, `email`, `payment_account`, `registered_ip`, `registered_fingerprint_hash`).
- **`device_fingerprints`**: Stores browser specs, canvas/webgl hashes, and FingerprintJS OSS visitor IDs.
- **`affiliate_clicks`**: Stores click logs with `ip`, `country`, `referrer`, `cookie_id`, and `fingerprint_id`.
- **`orders`**: Stores order details including `external_customer_id`, `payment_account`, `country`, and network flags.
- **`affiliate_risk_scores`**: Stores total score, decision, and review status.
- **`affiliate_risk_signals`**: Stores granular audit signals per evaluation.
- **`rule_configs`**: Stores rule weights and toggles for dynamic tuning.
- **`blacklisted_attributes`**: Stores security blacklisted IPs (with wildcard support `192.168.100.*`), domains, and emails.

---

## 3. Key Source Code Map

| File Path | Technical Description |
| :--- | :--- |
| `src/lib/db.ts` | SQLite DB connection (SQLite v3.53.3 via `better-sqlite3`), table schemas, migrations, and initial seed defaults. |
| `src/lib/fraud/types.ts` | Data types (`OrderContext`, `FraudSignal`, `RiskDecision`, `RiskEvaluationResult`). |
| `src/lib/fraud/risk-engine.ts` | Main aggregator evaluating all 15 rules and persisting decisions. |
| `src/lib/fraud/rules/identity.ts` | Evaluates `SELF_REFERRAL`, `SAME_PAYMENT_ACCOUNT`, `SAME_COOKIE`, `SAME_FINGERPRINT`, `SAME_HARDWARE_CLUSTER`, `DISPOSABLE_EMAIL`. |
| `src/lib/fraud/rules/network.ts` | Evaluates `SAME_IP`, `VPN_USAGE`, `DATACENTER_IP`. |
| `src/lib/fraud/rules/behavior.ts` | Evaluates `VELOCITY_EXCEEDED`. |
| `src/lib/fraud/rules/advanced-tapfiliate.ts` | Evaluates `IP_BLACKLISTED` (with wildcard matching), `REFERRER_SPAM_OR_CLOAKED`, `SUSPICIOUS_GEOLOCATION`, `CLICK_INFLATION_NO_CONVERSION`, `DUPLICATE_CONVERSION`. |
| `src/lib/fraud/__tests__/risk-engine.test.ts` | Vitest suite covering all 15 rules & dynamic IP wildcards. |
| `src/app/page.tsx` | Simulator UI with preset cards, form inputs, and side-by-side visualizer. |
| `src/app/referral/page.tsx` | Real Referral Link Generator & Device Sync center for testing local/LAN physical devices. |
| `src/app/ref/[affiliateId]/page.tsx` | Real client landing page running FingerprintJS OSS. |
| `src/app/store/page.tsx` | Real store checkout page executing live risk evaluations. |
| `src/app/admin/dashboard/page.tsx` | Admin Audit Ledger with filtering, inspection modal, and manual overrides (`APPROVED`/`REJECTED`). |
| `src/app/admin/config/page.tsx` | Rule Configuration dashboard & Blacklist Manager. |
| `src/app/api/admin/blacklist/route.ts` | CRUD REST API for IP/Domain/Email blacklist management. |
| `src/components/Navbar.tsx` | LinkPul branded navigation header. |

---

## 4. Verification Performed

- **Automated Unit Tests**:
  - Command: `pnpm test`
  - Result: 5/5 test suites passed cleanly.
- **Production Build**:
  - Command: `pnpm build`
  - Result: Compiled successfully with Next.js Turbopack.
- **Remote Synchronization**:
  - Pushed to `https://github.com/lnneo/affiliate-risk-score.git` (`main`, `develop`, `feature/linkpul-affiliate-risk-score`).

---

## 5. Instructions for Next AI Agent

1. **Business Rules**: Check [.ai/handoffs/business-logic.md](file:///Users/longnd/Projects/AdPulHQ/affiliate-risk-score/.ai/handoffs/business-logic.md) (EN) or [.ai/handoffs/business-logic-vi.md](file:///Users/longnd/Projects/AdPulHQ/affiliate-risk-score/.ai/handoffs/business-logic-vi.md) (VI) for business requirements.
2. **Development Server**: Run `pnpm dev` to start dev server on `http://localhost:3000`.
3. **Node Engine Requirement**: Use Node.js `>= 22.0.0` (as defined in `.nvmrc` and `package.json`).
4. **Database Reset**: Call `POST http://localhost:3000/api/demo/seed` to re-seed initial test data if needed.
5. **Git Workflow**: Push feature commits to `origin/feature/linkpul-affiliate-risk-score` and create PR to `origin/develop`.
