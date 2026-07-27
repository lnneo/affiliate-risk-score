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

---

## APPENDIX A: FINGERPRINT IDENTIFICATION LIBRARY

### 1. FingerprintJS OSS Overview
The **LinkPul Engine** integrates **FingerprintJS (Open-Source Edition)** running directly on the client-side browser.

- **Purpose**: Generates a unique browser visitor ID based on hardware and browser environment characteristics without relying on cookies (Cookie-less Tracking). Even if a user clears cookies, switches accounts, or uses Incognito Mode, the visitor ID persists to flag fraud attempts.

---

### 2. Core Features & Captured Signals

The library aggregates over 30 hardware and browser environment signals to construct a unique visitor hash:

| Signal / Feature | Capture Mechanism & Principle | Anti-Fraud Application |
| :--- | :--- | :--- |
| **1. Canvas Fingerprinting** | Renders hidden text/graphics on HTML5 Canvas and extracts Base64 Data URL hashes. | Captures minute rendering differences across GPUs, graphics drivers, and font engines. |
| **2. WebGL & GPU Fingerprinting** | Queries WebGL `Unmasked Vendor` & `Unmasked Renderer` (e.g., Apple M2, NVIDIA RTX 4070). | Identifies exact GPU graphics hardware and detects headless bot emulators (e.g., Puppeteer). |
| **3. AudioContext Fingerprinting** | Creates audio oscillators to measure signal frequency processing by physical soundcards. | Exploits subtle hardware audio processing variances across physical devices. |
| **4. Font Detection** | Measures rendered bounding boxes of standard fonts on Canvas to detect installed system fonts. | Traces user-installed system fonts on the OS. |
| **5. Screen & Display Metrics** | Captures resolution (`width` x `height`), color depth, Device Pixel Ratio (DPR), and orientation. | Differentiates display types (e.g., Retina 2560x1600 vs Full HD 1920x1080). |
| **6. CPU & Memory Environment** | Queries `navigator.hardwareConcurrency` (CPU cores) and `navigator.deviceMemory` (RAM GB). | Identifies core physical hardware specifications. |
| **7. Browser & Timezone Environment** | Collects User-Agent, system timezone, browser languages, and touch screen support. | Distinguishes OS builds (macOS, Windows, iOS, Android) and physical timezone locations. |

---

### 3. Cross-Browser Hardware Clustering Mechanism
- **Challenge**: FingerprintJS OSS hashes differ across Chrome, Firefox, and Safari on the same computer due to rendering engines (Blink vs Gecko vs WebKit).
- **LinkPul Solution**: 
  The engine implements **Cross-Browser Hardware Clustering (`SAME_HARDWARE_CLUSTER`)**:
  Combines `Same IP` + `Same OS` + `Same Screen Resolution`.
  $\rightarrow$ Even if an affiliate switches from Chrome to Firefox/Safari to buy through their own link, the system flags the attempt for **`MANUAL_REVIEW` (+75 pts)** to prevent cross-browser self-referral.
