# Technical Design Handoff: Affiliate Fraud Prevention

## Objective

Implement the first version of an extensible Affiliate Fraud Prevention system.

The system must detect suspicious affiliate behavior while minimizing false positives.

Fraud detection must be based on multiple signals instead of any single identifier.

---

# Design Principles

1. Never trust IP alone.
2. Never trust Cookie alone.
3. Fingerprint is a strong signal, not absolute truth.
4. Every fraud decision should be explainable.
5. Risk Score should be configurable.
6. Every detection rule should be independently extendable.

---

# Business Goals

Prevent:

- Self referrals
- Multi-account abuse
- Fake purchases
- Fake signups
- Click farms
- VPN abuse
- Datacenter abuse

Support:

- Manual review
- Future ML scoring
- Third-party fraud providers

---

# High Level Architecture

                    Browser

                       │

                       ▼

              Affiliate Click

                       │

                       ▼

             Tracking API Endpoint

                       │

         ┌─────────────┴──────────────┐

         ▼                            ▼

 Fingerprint Service             Click Storage

         │                            │

         └─────────────┬──────────────┘

                       ▼

                 Registration

                       ▼

                   Purchase

                       ▼

                 Risk Engine

                       ▼

             Commission Decision

---

# Modules

## Tracking Module

Responsibilities

- record affiliate click
- store click metadata
- generate cookie id
- associate session id

Outputs

- AffiliateClick

---

## Fingerprint Module

Responsibilities

Generate browser fingerprint.

Use:

- FingerprintJS OSS

Persist

- visitor id
- raw fingerprint attributes

Outputs

DeviceFingerprint

---

## Fraud Detection Module

Responsibilities

Evaluate fraud signals.

Rules should be independent.

Each rule returns:

```ts
interface FraudSignal {
    type: string;
    score: number;
    reason: string;
}
```

Example

```text
Same Fingerprint

Score +70
```

---

## Risk Engine

Input

Fraud Signals

↓

Calculate

↓

Risk Score

↓

Decision

Decision

Approve

Pending Review

Reject

No rule should directly reject.

Everything goes through Risk Engine.

---

## Commission Module

Responsibilities

Approve commission

Hold commission

Reject commission

Manual override

---

# Database Design

## affiliate_clicks

```sql
id

affiliate_id

cookie_id

session_id

fingerprint_id

ip

country

referrer

landing_url

clicked_at
```

---

## device_fingerprints

```sql
id

fingerprint_hash

browser

browser_version

os

timezone

language

screen

canvas_hash

webgl_hash

audio_hash

fonts_hash

created_at
```

---

## affiliate_risk_scores

```sql
id

order_id

total_score

decision

review_status

created_at
```

---

## affiliate_risk_signals

```sql
id

risk_score_id

signal

score

metadata

created_at
```

Example

```text
Same Fingerprint

70

{
    previous_order:123
}
```

---

# Fraud Signals

## Identity

- Same Email
- Same Payment Method
- Same Fingerprint
- Same Cookie
- Same Billing Address

---

## Network

- Same IP
- VPN
- Proxy
- Datacenter
- ASN reputation

---

## Behavior

- Velocity
- Click Rate
- Signup Rate
- Purchase Rate
- Conversion Rate

---

## Device

- Browser
- Canvas
- WebGL
- Audio
- Fonts
- Timezone

---

# Suggested Risk Scores

| Signal | Score |
|---------|------:|
| Same Email | 100 |
| Same Payment Method | 100 |
| Same Cookie | 100 |
| Same Fingerprint | 70 |
| Same IP | 30 |
| VPN | 20 |
| Proxy | 20 |
| Datacenter | 20 |
| Disposable Email | 30 |
| Velocity | 20 |

---

# Decision

0-39

Approve

40-69

Pending Review

70-99

Manual Review

100+

Reject

Thresholds should be configurable.

---

# Extension Points

Future integrations

- FingerprintJS Pro
- IPQualityScore
- MaxMind
- SEON
- Sift
- Custom ML Model

No business logic should depend directly on any provider.

Create provider interfaces.

Example

```ts
FingerprintProvider

RiskProvider

IPReputationProvider
```

---

# Logging

Log every fraud evaluation.

Never lose the explanation.

Store:

- evaluated signals
- final score
- decision
- execution time

---

# Performance

Avoid recalculating historical fingerprints.

Cache:

- IP reputation
- Fingerprint lookups
- VPN detection

---

# Security

Never expose:

- Fingerprint hash
- Risk score
- Internal signals

through public APIs.

Only Admin APIs may access fraud details.

---

# Future Work

Phase 1

Tracking

Fingerprint

Risk Engine

Manual Review

---

Phase 2

Proxy Detection

VPN Detection

Velocity Rules

---

Phase 3

ML Risk Model

Behavior Analytics

Fraud Dashboard

---

# Implementation Order

1. Database
2. Tracking API
3. Fingerprint Service
4. Click Storage
5. Registration Hook
6. Purchase Hook
7. Fraud Rules
8. Risk Engine
9. Commission Decision
10. Admin Dashboard

---

# Success Criteria

The implementation should:

✓ detect common affiliate fraud

✓ minimize false positives

✓ explain every fraud decision

✓ support future fraud providers

✓ remain modular and testable

✓ avoid coupling fraud logic with controllers