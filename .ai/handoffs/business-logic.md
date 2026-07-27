# Business Logic Specification: LinkPul Affiliate Risk Score Engine

## 1. Overview & Business Objectives
- **System**: LinkPul Affiliate Risk Scoring Engine
- **Purpose**: Detect, prevent, and score fraudulent affiliate transactions (Self-referral, Bot click farming, Account duplication, IP/Domain abuse) in compliance with 100% [Tapfiliate Enterprise Anti-Fraud Specifications](https://support.tapfiliate.com/en/articles/5898063-fraud-prevention-monitoring-in-affiliate-marketing).
- **Target Audience**: Affiliate Program Managers, Fraud Security Auditors, E-commerce Merchants.

---

## 2. Risk Scoring & Decision Classification Matrix

The engine aggregates fraud signal weights into a total Risk Score and maps it to 4 business decisions:

| Total Risk Score Range | Business Decision | System Action | Payout Status |
| :--- | :--- | :--- | :--- |
| **0 – 39 Points** | **`APPROVE`** | Auto-approve commission payout. | `APPROVED` |
| **40 – 69 Points** | **`PENDING_REVIEW`** | Hold commission for standard review period. | `PENDING` |
| **70 – 99 Points** | **`MANUAL_REVIEW`** | Flag order for manual investigation in Admin Audit Ledger. | `FLAGGED` |
| **100+ Points** | **`REJECT`** | Auto-reject commission due to direct fraud rule breach. | `REJECTED` |

---

## 3. Complete 15 Anti-Fraud Business Rules

### A. Identity & Self-Referral Rules
1. **`SELF_REFERRAL` (+100 pts)**:
   - **Business Logic**: Affiliate tries to earn commission by buying through their own referral link.
   - **Condition**: Buyer email matches registered affiliate email OR buyer user ID equals affiliate ID.
2. **`SAME_PAYMENT_ACCOUNT` (+100 pts)**:
   - **Business Logic**: Buyer uses the exact payout account (PayPal email or Credit Card fingerprint) registered by the affiliate.
   - **Condition**: Buyer payment account equals affiliate payment account.
3. **`SAME_COOKIE` (+100 pts)**:
   - **Business Logic**: Buyer session cookie matches affiliate link generation session or is shared across multiple buyer accounts.
4. **`SAME_FINGERPRINT` (+70 pts)**:
   - **Business Logic**: Browser rendering/device fingerprint (FingerprintJS) of buyer matches affiliate's registered device.
5. **`SAME_HARDWARE_CLUSTER` (+40 pts)**:
   - **Business Logic**: Detects cross-browser self-referral on the same physical computer (e.g., Chrome vs Firefox).
   - **Condition**: `Same IP` + `Same OS` + `Same Screen Resolution`.
6. **`DISPOSABLE_EMAIL` (+30 pts)**:
   - **Business Logic**: Buyer uses temporary or disposable email provider (tempmail, guerrillamail).

---

### B. Network & IP Rules
7. **`SAME_IP` (+35 pts)**:
   - **Business Logic**: Order IP matches affiliate's registered IP or original click IP.
8. **`IP_BLACKLISTED` (+100 pts)**:
   - **Business Logic**: Order IP matches security blacklist. Supports exact IP matches and dynamic subnet wildcards (e.g., `198.51.100.*`, `10.200.*.*`).
9. **`VPN_USAGE` (+20 pts)**:
   - **Business Logic**: Traffic originates from commercial VPN services.
10. **`DATACENTER_IP` (+20 pts)**:
    - **Business Logic**: Traffic originates from cloud server hosts (AWS, Google Cloud, DigitalOcean).

---

### C. Behavior & Velocity Rules
11. **`VELOCITY_EXCEEDED` (+20 pts)**:
    - **Business Logic**: Abnormally high volume of clicks/orders from the same buyer or IP within 5 minutes.
12. **`CLICK_INFLATION_NO_CONVERSION` (+30 pts)**:
    - **Business Logic**: Affiliate generates >50 clicks in 24 hours with a 0% conversion rate (Click farm CTR manipulation).

---

### D. Referrer, Conversion & Geolocation Rules
13. **`REFERRER_SPAM_OR_CLOAKED` (+30 pts)**:
    - **Business Logic**: Traffic originates from blacklisted spam domains or uses cloaking techniques (`noreferrer`, `anonymous`).
14. **`DUPLICATE_CONVERSION` (+100 pts)**:
    - **Business Logic**: External customer ID or transaction ID has already been credited for a commission previously.
15. **`SUSPICIOUS_GEOLOCATION` (+30 pts)**:
    - **Business Logic**: Order originates from high-risk or non-target countries (e.g., KP, RU, IR).
