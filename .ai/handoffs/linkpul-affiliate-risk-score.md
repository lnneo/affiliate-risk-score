# Handoff Context: LinkPul Affiliate Risk Score Engine

## 1. Task & Goal Summary
- **Project Name**: LinkPul (Affiliate Fraud & Risk Score Engine)
- **Goal**: Implement a production-grade, 100% compliant Affiliate Fraud Risk Engine adhering to [Tapfiliate Enterprise Anti-Fraud Specifications](https://support.tapfiliate.com/en/articles/5898063-fraud-prevention-monitoring-in-affiliate-marketing).
- **Language & Stack**: TypeScript, Next.js App Router, TailwindCSS, `better-sqlite3`, FingerprintJS (OSS), Vitest.
- **Current Branch**: `feature/linkpul-affiliate-risk-score`
- **Latest Implementation Commit**: `ca9de02` (`feat: implement LinkPul 100% Tapfiliate Enterprise affiliate risk score engine`)

---

## 2. Implemented Business Logic & Architecture

### A. Risk Decision Classification Thresholds
- **APPROVE**: Total Risk Score `< 40` (Legitimate transaction)
- **PENDING_REVIEW**: Total Risk Score `40 - 69` (Medium risk, hold commission)
- **MANUAL_REVIEW**: Total Risk Score `70 - 99` (High risk, flags for manual audit)
- **REJECT**: Total Risk Score `≥ 100` (Direct fraud block, reject commission)

---

### B. Complete 15 Anti-Fraud Rules (100% Tapfiliate Enterprise Specs)

1. **`SELF_REFERRAL` (+100 pts)**:
   - Triggered when buyer email matches the registered affiliate's email or user ID.
2. **`SAME_PAYMENT_ACCOUNT` (+100 pts)**:
   - Triggered when buyer payment account (PayPal, Credit Card token) matches affiliate's payout profile.
3. **`SAME_COOKIE` (+100 pts)**:
   - Triggered when buyer cookie session matches affiliate's link creation session or is shared across multiple buyer accounts.
4. **`SAME_FINGERPRINT` (+70 pts)**:
   - Triggered when buyer browser device fingerprint (FingerprintJS hash) matches affiliate's registered device.
5. **`SAME_HARDWARE_CLUSTER` (+40 pts)**:
   - Cross-browser hardware detection on the same physical machine: `Same IP` + `Same OS` + `Same Screen Resolution`.
6. **`SAME_IP` (+35 pts)**:
   - Triggered when order IP matches affiliate's registered IP or click IP.
7. **`IP_BLACKLISTED` (+100 pts)**:
   - Triggered when IP matches exact IP or dynamic wildcard subnets (`198.51.100.*`, `10.200.*.*`) in the security blacklist database.
8. **`VPN_USAGE` (+20 pts)**:
   - Triggered when order or click IP belongs to a commercial VPN network.
9. **`DATACENTER_IP` (+20 pts)**:
   - Triggered when traffic originates from Cloud Datacenter hosting providers (AWS, GCP, DigitalOcean).
10. **`VELOCITY_EXCEEDED` (+20 pts)**:
    - Triggered when click or order frequency exceeds normal user thresholds within a 5-minute window.
11. **`CLICK_INFLATION_NO_CONVERSION` (+30 pts)**:
    - Triggered when an affiliate generates >50 clicks in 24 hours with a 0% conversion rate (bot CTR inflation).
12. **`REFERRER_SPAM_OR_CLOAKED` (+30 pts)**:
    - Triggered when referrer domain is blacklisted, cloaked (`noreferrer`, `anonymous`), or suspicious.
13. **`DISPOSABLE_EMAIL` (+30 pts)**:
    - Triggered when buyer uses temporary or disposable email services (tempmail, guerrillamail).
14. **`DUPLICATE_CONVERSION` (+100 pts)**:
    - Triggered when `external_customer_id` or transaction ID has already claimed a commission previously.
15. **`SUSPICIOUS_GEOLOCATION` (+30 pts)**:
    - Triggered when order originates from high-risk or un-targeted geographical countries (e.g., KP, RU, IR).

---

## 3. Database Schema (`data/affiliate_fraud.db`)

Key tables in `src/lib/db.ts`:
- **`affiliate_profiles`**: Stores registered affiliate profiles (`affiliate_id`, `email`, `payment_account`, `registered_ip`, `registered_fingerprint_hash`).
- **`device_fingerprints`**: Stores browser specs, canvas/webgl hashes, and FingerprintJS OSS visitor IDs.
- **`affiliate_clicks`**: Stores click logs with `ip`, `country`, `referrer`, `cookie_id`, and `fingerprint_id`.
- **`orders`**: Stores order details including `external_customer_id`, `payment_account`, `country`, and network flags.
- **`affiliate_risk_scores`**: Stores total score, decision, and review status.
- **`affiliate_risk_signals`**: Stores granular audit signals per evaluation.
- **`rule_configs`**: Stores rule weights and toggles for dynamic tuning.
- **`blacklisted_attributes`**: Stores security blacklisted IPs (with wildcard support), domains, and emails.

---

## 4. Key Source Code Map

| File Path | Description |
| :--- | :--- |
| `src/lib/db.ts` | SQLite DB connection, table schemas, migrations, and initial seed defaults. |
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

## 5. Verification Performed

- **Automated Unit Tests**:
  - Command: `npx vitest run`
  - Result: 5/5 test suites passed cleanly.
- **Production Build**:
  - Command: `npm run build`
  - Result: Compiled successfully with Next.js Turbopack.
- **Dev Server & Database Seeding**:
  - Endpoints verified: `POST /api/demo/seed`, `POST /api/checkout/evaluate`, `GET/POST /api/admin/blacklist`.

---

## 6. Instructions for Next AI Agent

1. **Development Server**: Run `npm run dev` to start dev server on `http://localhost:3000`.
2. **Database Reset**: Call `POST http://localhost:3000/api/demo/seed` to re-seed initial test data if needed.
3. **Adding Rules**: Extend rules under `src/lib/fraud/rules/` and register rule configs in `initDatabase()` in `src/lib/db.ts`.
4. **Git Workflow**: Always inspect `.ai/handoffs/linkpul-affiliate-risk-score.md` and keep commits incremental in `feature/linkpul-affiliate-risk-score`.
