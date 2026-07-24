# AI Context Handoff: affiliate-fraud-prevention

## Task Summary

### Original Task

Design and implement the first version of an Affiliate Fraud Prevention system.

### Goal

Build an extensible fraud detection framework that prevents common Affiliate abuses without blocking legitimate users.

### Scope

- Track affiliate clicks.
- Generate and persist browser/device fingerprints.
- Associate clicks with user registrations and purchases.
- Build a Risk Score engine.
- Do not reject transactions based on a single signal.
- Support future expansion with additional fraud signals.

---

## Business Background

The platform already supports:

- User accounts
- Subscription plans
- Multiple payment gateways
- Orders / Payments

Affiliate tracking will be added on top of the existing platform.

The objective is to detect:

- Self referral
- Multiple accounts
- Fake conversions
- Click fraud
- Velocity attacks

---

## Core Concepts

### Cookie

Represents a browser session.

Can change after:

- Cookie deletion
- Incognito mode
- Different browser

Low confidence identifier.

---

### Fingerprint

Represents a browser/device identity.

Generated using FingerprintJS.

Signals include:

- Browser
- OS
- Canvas
- WebGL
- Audio
- Fonts
- Screen
- Timezone
- Language

Fingerprint is significantly more stable than cookies.

Do not assume Fingerprint is immutable.

---

### IP Address

Represents the network.

Use only for:

- VPN detection
- Proxy detection
- Country lookup
- Velocity rules
- Datacenter detection

Never use IP alone to identify a user.

---

## Required Database Design

Expected entities include:

### affiliate_clicks

Store:

- affiliate_id
- click_time
- ip
- fingerprint_id
- cookie_id
- session_id
- user_agent
- referrer
- landing_url

---

### device_fingerprints

Store:

- fingerprint_hash
- browser
- browser_version
- os
- timezone
- language
- screen
- canvas_hash
- webgl_hash
- audio_hash
- fonts_hash

Do not store only the hash.

Persist useful raw attributes for investigation.

---

### orders / registrations

Store references to:

- fingerprint_id
- cookie_id
- ip

---

## Risk Engine

The system should calculate a Risk Score instead of making binary decisions.

Example signals:

| Signal | Score |
|---------|------:|
| Same email | +100 |
| Same payment account | +100 |
| Same fingerprint | +70 |
| Same cookie | +100 |
| Same IP | +30 |
| VPN | +20 |
| Datacenter IP | +20 |
| Disposable email | +30 |
| Velocity exceeded | +20 |

Suggested thresholds:

- <40 → Approve
- 40–70 → Pending Review
- >70 → Manual Review
- >100 → Reject

Thresholds should be configurable.

---

## Initial Fraud Rules

Implement detection for:

- Self referral
- Same fingerprint
- Same cookie
- Same IP
- Excessive registrations per IP
- Excessive registrations per fingerprint
- Excessive purchases per affiliate
- VPN / Proxy
- Datacenter IP

Do not automatically reject solely because:

- IP changed
- Cookie changed
- Incognito mode
- VPN usage

Always combine multiple signals.

---

## Technical Flow

Affiliate Click

↓

FingerprintJS

↓

Backend Tracking API

↓

Persist Click

↓

Registration

↓

Persist Fingerprint

↓

Purchase

↓

Risk Engine

↓

Risk Score

↓

Approve / Pending / Reject

---

## Recommended Architecture

Separate modules:

- Tracking
- Fingerprint
- Fraud Detection
- Risk Engine
- Commission

Each module should be independently extensible.

Avoid placing fraud logic inside controllers.

---

## Future Enhancements

Potential future integrations:

- IPQualityScore
- MaxMind
- SEON
- FingerprintJS Pro
- Device reputation
- Machine-learning risk scoring

---

## Instructions for Next AI

- Design the database before implementing business logic.
- Make Risk Rules configurable.
- Treat Fingerprint, Cookie and IP as independent signals.
- Never rely on a single signal for fraud detection.
- Ensure all fraud decisions are explainable for manual review.