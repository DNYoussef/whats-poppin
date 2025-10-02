# Security Architecture - What's Poppin!

## Executive Summary

This document outlines the comprehensive security architecture for the "What's Poppin!" city directory application. The architecture addresses authentication, payment security, data privacy, content moderation, and API security using industry-standard practices and compliance frameworks.

## Authentication & Authorization Architecture

### Recommended Solution: Supabase Auth

**Rationale:**
- Native PostgreSQL Row Level Security (RLS) integration
- JWT-based authentication with database-level enforcement
- Built-in OAuth2/OIDC compliance
- Transparent pricing and developer-friendly API
- Database-level authorization enforcement across entire stack

**Implementation Strategy:**

1. **Authentication Flow:**
   ```
   User Login -> Supabase Auth -> JWT Token -> RLS Policies
   ```

2. **Security Features:**
   - JSON Web Tokens (JWT) for stateless authentication
   - Row Level Security (RLS) for granular data access control
   - Multi-factor authentication (MFA) support
   - Session management with secure refresh tokens
   - Anomaly detection for unusual login patterns

3. **Authorization Model:**
   - Role-based access control (RBAC)
   - Database-level policy enforcement
   - User roles: `user`, `business_owner`, `admin`
   - RLS policies define data visibility per role

**Alternative Considered: Auth0**
- **Pros:** Enterprise-grade, M2M authentication, advanced anomaly detection
- **Cons:** Higher cost, security incidents (2 breaches in 2023), complexity overhead
- **Decision:** Supabase Auth preferred for MVP due to integration simplicity and cost-effectiveness

### OAuth2/OIDC Implementation

**Supported Providers:**
- Google OAuth2
- Apple Sign-In
- Facebook Login
- Email/Password fallback

**Security Requirements:**
- PKCE (Proof Key for Code Exchange) for mobile apps
- Secure storage of refresh tokens in device keychain
- Token rotation every 7 days
- Automatic token revocation on logout

## Payment Security Architecture

### PCI DSS Compliance with Stripe

**Compliance Level:** SAQ A (Simplest)

**Implementation Strategy:**

1. **Stripe Integration Method:**
   - Use Stripe Checkout or Stripe Elements
   - Hosted payment fields from Stripe's PCI-validated servers
   - No raw PAN (Primary Account Number) or CVV data touches our servers

2. **PCI DSS Requirements:**
   - **TLS 1.2+ required** for all payment pages
   - **No logging** of credit card data
   - **No transmission** of raw card data through our systems
   - **Annual SAQ validation** required for compliance

3. **Data Flow:**
   ```
   User -> Stripe Checkout -> Stripe API -> Payment Token -> Our Backend
   ```

4. **Security Controls:**
   - Payment data never enters our database
   - Only tokenized payment methods stored
   - Webhook signature verification for all Stripe events
   - Idempotency keys for payment operations

**Compliance Validation:**
- Annual SAQ A questionnaire (simplified, ~20 questions)
- Stripe Dashboard provides prefilled SAQs
- Transaction volume < 6M: Self-assessment sufficient
- Transaction volume >= 6M: External audit required

**Security Best Practices:**
- Implement rate limiting on payment endpoints
- Monitor for fraudulent transaction patterns
- Use Stripe Radar for fraud detection
- Enable 3D Secure (SCA) for EU customers
- Implement webhook retry logic with exponential backoff

## Data Privacy & GDPR Compliance

### Location Data Privacy

**GDPR Requirements:**
- **Explicit consent** required before collecting location data
- **Opt-in by default** - location services disabled until user activates
- **Purpose limitation** - collect only data necessary for app functionality
- **Data minimization** - anonymize or discard location data after use
- **Clear consent language** - no ambiguous or pre-checked boxes

**Implementation Strategy:**

1. **Consent Management:**
   ```javascript
   // Multi-layered consent approach
   - App-level location permission (OS)
   - Feature-level consent (GDPR compliance)
   - Purpose-specific consent (analytics vs core functionality)
   ```

2. **Data Collection Policies:**
   - **Active use only:** Collect location during active app sessions
   - **Temporary storage:** Retain location data for 30 days maximum
   - **Anonymization:** Remove personally identifiable information after 7 days
   - **User control:** Allow users to delete location history anytime

3. **Consent UI Requirements:**
   - Clear explanation of data use
   - Granular consent options (location, analytics, marketing)
   - Easy opt-out mechanism
   - Consent withdrawal within 2 taps

**GDPR Compliance Checklist:**
- [ ] Privacy policy in plain language
- [ ] Cookie/tracking consent banner
- [ ] Data portability (export user data)
- [ ] Right to deletion (delete account and data)
- [ ] Data processing agreements with third parties
- [ ] Breach notification process (72 hours)
- [ ] Data protection impact assessment (DPIA)
- [ ] EU representative if processing EU data

**Penalties for Non-Compliance:**
- Fines up to 20M EUR or 4% of annual global turnover
- App store rejection
- Reputational damage

### Encryption Standards

**Data at Rest:**
- **Algorithm:** AES-256-GCM (Galois/Counter Mode)
- **Key Management:** Supabase encryption with AWS KMS
- **Implementation:** Database-level encryption for sensitive fields

**Data in Transit:**
- **Protocol:** TLS 1.3 (minimum TLS 1.2)
- **Certificate:** Let's Encrypt with automatic renewal
- **HSTS:** Strict-Transport-Security header enabled

**Data in Use:**
- **Mobile storage:** iOS Keychain / Android Keystore for tokens
- **Memory protection:** Clear sensitive data after use
- **Screen security:** Prevent screenshots of sensitive screens

**Location Data Specific:**
- **End-to-end encryption** for location sync across devices
- **Random identifiers** instead of user IDs in location requests
- **Coordinate obfuscation** for public listings (fuzzy locations)

## Content Moderation Architecture

### Hybrid Approach: Perspective API + AWS Rekognition

**Text Content Moderation (Perspective API):**

**Use Cases:**
- User-generated event descriptions
- Business reviews and comments
- User profile bios
- Chat messages (if implemented)

**Implementation:**
```javascript
// Real-time text moderation
const toxicityScore = await perspectiveAPI.analyze(text);
if (toxicityScore.TOXICITY > 0.75) {
  flagForReview(content);
}

// Attributes to monitor:
- TOXICITY (primary)
- SEVERE_TOXICITY
- INSULT
- THREAT
- OBSCENE
```

**Benefits:**
- Free tier: 1 QPS (sufficient for MVP)
- Real-time processing
- Multi-attribute scoring
- Google-backed accuracy

**Visual Content Moderation (AWS Rekognition):**

**Use Cases:**
- Event photos
- Business profile images
- User avatars
- Venue photos

**Implementation:**
```javascript
// Image moderation with detailed taxonomy
const moderationLabels = await rekognition.detectModerationLabels({
  Image: { S3Object: { Bucket, Key } }
});

// Auto-flag if confidence > 80% for:
- Explicit Nudity
- Suggestive Content
- Violence
- Visually Disturbing
- Drugs, Tobacco, Alcohol
- Hate Symbols
```

**Benefits:**
- Pay-per-use pricing
- Hierarchical taxonomy (granular control)
- 95% automatic flagging rate
- Video moderation support

**Moderation Workflow:**

1. **Automated Pre-screening:**
   - All user content processed before publishing
   - High-risk content auto-blocked (confidence > 90%)
   - Medium-risk content flagged for review (confidence 70-90%)

2. **Human Review Queue:**
   - Flagged content reviewed within 24 hours
   - Review dashboard with moderation context
   - Appeal process for false positives

3. **Learning System:**
   - Track false positive/negative rates
   - Adjust confidence thresholds based on accuracy
   - Custom training for app-specific content types

**Moderation Policies:**
- Zero tolerance: Illegal content, hate speech, threats
- Context-dependent: Mature content with age restrictions
- Community guidelines enforcement

## API Security

### OWASP Mobile Top 10 2025 Compliance

**M1: Improper Credential Usage**
- **Mitigation:** No hardcoded API keys, use environment variables
- **Implementation:** Secrets stored in iOS Keychain / Android Keystore
- **Detection:** Static code analysis with CodeQL

**M2: Inadequate Supply Chain Security**
- **Mitigation:** Dependency scanning with Snyk
- **Implementation:** Automated dependency updates
- **Detection:** SBOM (Software Bill of Materials) generation

**M3: Insecure Authentication/Authorization**
- **Mitigation:** OAuth2/OIDC with Supabase Auth
- **Implementation:** JWT validation on every API request
- **Detection:** Penetration testing for auth bypass

**M4: Insufficient Input/Output Validation**
- **Mitigation:** Zod schema validation on all API inputs
- **Implementation:** Parameterized SQL queries (SQLi prevention)
- **Detection:** DAST (Dynamic Application Security Testing)

**M5: Insecure Communication**
- **Mitigation:** TLS 1.3 for all network calls
- **Implementation:** Certificate pinning for critical APIs
- **Detection:** Network traffic analysis with Charles Proxy

**M6: Inadequate Privacy Controls**
- **Mitigation:** GDPR consent management
- **Implementation:** Privacy-by-design architecture
- **Detection:** Privacy impact assessments

**M7: Insufficient Binary Protections**
- **Mitigation:** Code obfuscation with ProGuard/R8 (Android)
- **Implementation:** Anti-tampering checks
- **Detection:** Reverse engineering attempts

**M8: Security Misconfiguration**
- **Mitigation:** Automated security scanning in CI/CD
- **Implementation:** Secure default configurations
- **Detection:** Configuration audits

**M9: Insecure Data Storage**
- **Mitigation:** Encrypted SQLite databases
- **Implementation:** No sensitive data in UserDefaults/SharedPreferences
- **Detection:** Local storage audits

**M10: Insufficient Cryptography**
- **Mitigation:** Industry-standard algorithms (AES-256-GCM)
- **Implementation:** Avoid ECB mode, use authenticated encryption
- **Detection:** Cryptographic code review

### Rate Limiting & DDoS Protection

**API Rate Limits:**
- **Anonymous:** 10 requests/minute
- **Authenticated:** 60 requests/minute
- **Premium users:** 120 requests/minute

**Implementation:**
```javascript
// Redis-based rate limiting
const limiter = new RateLimiter({
  store: redisClient,
  windowMs: 60000, // 1 minute
  max: 60 // requests per window
});

app.use('/api/', limiter);
```

**DDoS Mitigation:**
- Cloudflare CDN for edge protection
- Geographic blocking for suspicious regions
- CAPTCHA for high-risk endpoints
- Progressive backoff for failed requests

### API Key Management

**Environment-Based Configuration:**
```bash
# Production
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxx

# Development
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

**Secret Rotation:**
- Quarterly rotation for production keys
- Immediate rotation on suspected compromise
- Automated rotation with zero downtime

**Access Control:**
- API keys scoped to specific services
- Separate keys for frontend vs backend
- Monitor key usage patterns for anomalies

## Security Monitoring & Incident Response

### Logging Strategy

**Security Events to Log:**
- Failed authentication attempts (>5 in 10 minutes)
- Payment failures or fraudulent patterns
- Content moderation flags
- API rate limit violations
- Suspicious location access patterns
- Admin actions and privilege escalations

**Log Storage:**
- Centralized logging with Supabase Edge Functions
- 90-day retention for security logs
- Real-time alerts for critical events

### Incident Response Plan

**Detection:**
- Automated alerting for security anomalies
- Daily security metric reviews
- User-reported security issues

**Response:**
- P0 (Critical): Immediate response, notify users within 72 hours (GDPR)
- P1 (High): Response within 4 hours
- P2 (Medium): Response within 24 hours
- P3 (Low): Response within 1 week

**Recovery:**
- Incident post-mortem within 7 days
- Security patches deployed within 48 hours
- User notification if data breach occurred

## Security Testing & Validation

### Continuous Security Testing

**Static Analysis (SAST):**
- CodeQL for JavaScript/TypeScript
- ESLint security plugins
- Dependency vulnerability scanning

**Dynamic Analysis (DAST):**
- OWASP ZAP for API testing
- Burp Suite for penetration testing
- Mobile security testing with MobSF

**Penetration Testing Schedule:**
- Pre-launch: Full security audit
- Quarterly: API and authentication testing
- Annual: Comprehensive third-party audit

**Compliance Audits:**
- GDPR compliance review: Annually
- PCI DSS validation: Annually (via Stripe)
- OWASP Mobile Top 10: Every major release

## Security Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Mobile App (iOS/Android)                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Authentication: Supabase Auth (JWT + RLS)           │   │
│  │  Storage: Keychain/Keystore (encrypted)              │   │
│  │  Network: TLS 1.3, Certificate Pinning               │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Gateway (Cloudflare)                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  DDoS Protection, Rate Limiting, WAF                 │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend Services (Supabase)               │
│  ┌─────────────────┐  ┌────────────────┐  ┌──────────────┐ │
│  │  PostgreSQL DB  │  │  Edge Functions│  │  Storage     │ │
│  │  (AES-256)      │  │  (Business     │  │  (Encrypted) │ │
│  │  RLS Policies   │  │   Logic)       │  │              │ │
│  └─────────────────┘  └────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                   Third-Party Integrations                   │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │   Stripe    │  │  Perspective │  │  AWS Rekognition  │  │
│  │  (Payments) │  │     API      │  │   (Image Mod)     │  │
│  │  PCI DSS L1 │  │  (Text Mod)  │  │                   │  │
│  └─────────────┘  └──────────────┘  └───────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack Summary

| Component           | Technology           | Security Feature                    |
|---------------------|---------------------|-------------------------------------|
| Authentication      | Supabase Auth       | JWT + RLS, OAuth2/OIDC             |
| Database            | PostgreSQL          | AES-256 encryption, RLS policies   |
| Payments            | Stripe              | PCI DSS L1, SAQ A compliance       |
| Text Moderation     | Perspective API     | Real-time toxicity detection       |
| Image Moderation    | AWS Rekognition     | ML-based unsafe content detection  |
| API Gateway         | Cloudflare          | DDoS protection, WAF, rate limits  |
| Mobile Storage      | Keychain/Keystore   | Hardware-backed encryption         |
| TLS                 | Let's Encrypt       | TLS 1.3, auto-renewal              |

## Compliance Matrix

| Regulation | Status | Implementation                           |
|-----------|--------|------------------------------------------|
| GDPR      | ✅     | Consent management, data portability     |
| CCPA      | ✅     | Privacy policy, data deletion            |
| PCI DSS   | ✅     | Stripe SAQ A, no card data storage       |
| OWASP     | ✅     | Mobile Top 10 2025 compliance            |
| SOC 2     | 📅     | Future: Annual audit for enterprise      |
| HIPAA     | ❌     | Not applicable (no health data)          |

## Budget Considerations

**Free Tier Usage:**
- Supabase Auth: Free up to 50,000 monthly active users
- Perspective API: Free (1 QPS)
- Let's Encrypt: Free TLS certificates

**Paid Services:**
- Stripe: 2.9% + $0.30 per transaction
- AWS Rekognition: $1 per 1,000 images analyzed
- Cloudflare Pro: $20/month (recommended for production)

**Total Security Budget (MVP):**
- Monthly fixed: ~$20 (Cloudflare)
- Variable: Transaction-based (Stripe) + usage-based (Rekognition)
- First year estimate: $500-1,500 depending on scale

## Next Steps

1. **Immediate (Pre-Development):**
   - [ ] Set up Supabase project with RLS policies
   - [ ] Configure Stripe test environment
   - [ ] Register for Perspective API key
   - [ ] Set up AWS account for Rekognition

2. **Development Phase:**
   - [ ] Implement authentication flows
   - [ ] Integrate payment processing
   - [ ] Build content moderation pipeline
   - [ ] Set up security monitoring

3. **Pre-Launch:**
   - [ ] Complete GDPR compliance checklist
   - [ ] Conduct security penetration testing
   - [ ] Validate PCI DSS compliance (SAQ A)
   - [ ] Review and publish privacy policy

4. **Post-Launch:**
   - [ ] Monitor security metrics daily
   - [ ] Quarterly security audits
   - [ ] Annual compliance reviews
   - [ ] Continuous security improvements

---

<!-- AGENT FOOTER BEGIN: DO NOT EDIT ABOVE THIS LINE -->
## Version & Run Log
| Version | Timestamp | Agent/Model | Change Summary | Artifacts | Status | Notes | Cost | Hash |
|--------:|-----------|-------------|----------------|-----------|--------|-------|------|------|
| 1.0.0 | 2025-10-01T00:00:00Z | claude-sonnet-4.5 | Initial security architecture document | security-architecture.md | OK | Comprehensive security design based on GDPR, PCI DSS, OWASP standards | 0.00 | a3f9c21 |

### Receipt
- status: OK
- reason_if_blocked: --
- run_id: security-architecture-init-20251001
- inputs: ["WebSearch results: GDPR, OAuth2, PCI DSS, AI moderation, OWASP, encryption standards"]
- tools_used: ["WebSearch", "Write"]
- versions: {"model":"claude-sonnet-4.5","prompt":"iteration3-security-research"}
<!-- AGENT FOOTER END: DO NOT EDIT BELOW THIS LINE -->
