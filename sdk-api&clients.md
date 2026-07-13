Build a complete **Developer Platform** for SubDNS around the existing REST API and CLI. The CLI is already implemented, so do not modify or rebuild it. Instead, create everything else that developers need to integrate with SubDNS.

## Requirements

### 1. Developer Dashboard
Create a dedicated "Developers" section with:
- Overview
- API Keys
- API Documentation
- SDKs
- Webhooks
- Rate Limits
- Changelog
- API Status
- Examples

---

### 2. API Keys
Implement Personal Access Tokens (PATs):
- Create API Key
- Name/Description
- Expiration (Never, 30 days, 90 days, 1 year)
- Permissions/Scopes
  - Read DNS
  - Write DNS
  - Delete DNS
  - Manage Subdomains
  - Read Activity
  - Full Access
- Copy once after creation
- Revoke/Delete
- Last Used
- Created Date

---

### 3. REST API Documentation
Provide complete API reference including:
- Authentication
- Base URL
- Versioning (/v1)
- Request examples
- Response examples
- Error codes
- Pagination
- Rate limits
- Interactive endpoint explorer

Cover endpoints for:
- Subdomains
- DNS Records
- API Keys
- User Account
- Activity Logs
- Webhooks

---

### 4. JavaScript / TypeScript SDK
Create an official SDK with documentation and installation instructions.

Include examples for:
- Authentication
- List records
- Create record
- Update record
- Delete record
- List subdomains

Package name:
@subdns/sdk

---

### 5. Python SDK

Package:

subdns

Provide documentation and examples for:
- Authentication
- CRUD DNS records
- List subdomains

---

### 6. Go SDK

Official Go client with examples.

---

### 7. PHP SDK

Official PHP client with examples.

---

### 8. Java SDK

Official Java client with examples.

---

### 9. .NET SDK

Official C#/.NET SDK with examples.

---

### 10. Webhooks

Allow users to create webhook endpoints.

Events:
- dns.record.created
- dns.record.updated
- dns.record.deleted
- subdomain.created
- subdomain.deleted
- ssl.updated
- verification.completed

Include:
- Secret signing
- Retry policy
- Delivery logs
- Test webhook
- Enable/Disable
- Delete

---

### 11. OpenAPI Specification

Generate:
- OpenAPI 3.1
- Swagger UI
- Download JSON
- Download YAML

---

### 12. Postman Collection

Provide:
- Ready-to-import collection
- Environment variables
- Authentication examples

---

### 13. Code Examples

Generate copyable examples for:
- JavaScript
- TypeScript
- Python
- Go
- PHP
- Java
- C#
- cURL

---

### 14. Rate Limits Page

Display:
- Current usage
- Remaining requests
- Reset time
- Plan limits

---

### 15. API Status

Show:
- API uptime
- Incidents
- Maintenance
- Response time

---

### 16. Changelog

Display API and SDK release history with version numbers and release dates.

---

## UI Requirements

- Modern developer-focused interface similar to Stripe, Cloudflare, Supabase, or Vercel.
- Responsive design.
- Searchable documentation.
- Syntax-highlighted code blocks.
- Copy-to-clipboard buttons.
- Dark mode support.
- Consistent branding with the existing SubDNS dashboard.

**Important:** The existing CLI is already built. Do not modify or recreate it. Focus on building the remaining developer ecosystem, documentation, SDKs, API management, and developer experience.