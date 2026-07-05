# Security Policy

## Supported Versions

| Version | Supported          |
|---------|--------------------|
| 0.1.x   | ✅ Active development |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability in SubDNS, please:

**DO NOT** create a public GitHub issue. Instead, report it privately.

### How to Report

1. **Email:** [m2hgamerz.prince@gmail.com](mailto:m2hgamerz.prince@gmail.com)
2. **Subject:** "SubDNS Security Vulnerability"
3. **Include:**
   - Type of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### What to Expect

- **Acknowledgment** within 48 hours
- **Status update** within 5 business days
- **Fix timeline** communicated based on severity

## Security Measures

SubDNS implements the following security practices:

### Authentication
- Passwords hashed with bcrypt
- JWT-based sessions
- API key authentication for programmatic access

### Data Protection
- HTTPS enforced everywhere
- Cloudflare proxy hides origin IPs
- No plaintext secrets in code

### Access Control
- Users can only manage their own subdomains
- Admin roles for platform management
- Rate limiting on API endpoints

### Infrastructure
- Regular dependency updates via Dependabot
- Environment variables for all secrets
- Database connection string never exposed to clients

## Responsible Disclosure

We kindly ask that:

- You give us reasonable time to fix the issue before disclosure
- You make a good faith effort to avoid privacy violations
- You do not access or modify user data without permission

We will publicly acknowledge your responsible disclosure once the fix is deployed.
