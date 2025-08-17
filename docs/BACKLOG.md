# Backlog (Epics → Stories)

E1 Auth & Organizations
- Implement email/password auth; JWT sessions
- Organization onboarding (multi-tenant); org settings
- Roles: Owner, Admin, Scheduler, Staff, Accounting, Customer

E2 Services & Pricing
- CRUD service categories and services
- Pricing modes: flat and sqft-based tiers; non-overlapping validation
- Pricing groups and customer assignment
- Quote engine combines tiers + pricing group + coupons + package rules

E3 Packages & Discounts
- CRUD packages and items
- Package-level discounts (flat/percent)
- Display-only per-item price overrides (showcase)
- Coupons: CRUD, validation, scope, stacking rules

E4 Customers & Groups
- Customer CRM CRUD
- Customer groups with default pricing group and payment terms (deposits/NET)

E5 Booking & Availability
- Define appointment intervals and buffers
- Staff availability and blackout dates
- Territories/service areas and routing rules
- Booking flow: quote → slot selection → deposit → confirmation
- Rescheduling flow and notifications
- Toggle: customer staff pick vs auto-assign

E6 Calendar & Google Sync
- Team calendar views: day/week/month, filters by staff/territory
- Per-staff Google OAuth connection
- Two-way sync; conflict detection; ICS read-only

E7 Payments & Invoicing
- Stripe payment intents (deposit, balance, refunds)
- Invoicing with taxes, numbering, PDF generation
- Webhooks for payment updates

E8 Media & Delivery
- S3 multipart uploads; processing pipeline
- Download center (one-link) with branded/unbranded assets
- Export to Google Drive/Dropbox (folder create + upload + share link)

E9 Property Websites
- Templates (2 min) with theme tokens
- Builder blocks: hero, gallery, video, 3D, floor plan, map, facts, lead form
- Publish branded/unbranded modes; password protection optional

E10 Staff & Payouts
- Staff portal: jobs, uploads, status
- Payout policies: per-service/per-day/% revenue
- Payout ledger and CSV export (Stripe Connect later)

E11 Admin & Settings
- Branding, domains/subdomains, SSL
- Pricing simulator; tax configuration; notifications
- Integration settings: Stripe, Google, Dropbox, CubiCasa

E12 Reporting (basic)
- Revenue, orders, payouts, utilization dashboards

Acceptance Criteria (highlights)
- Pricing tiers validated with no gaps/overlaps; package displays honor item overrides
- Calendar slots honor intervals/buffers and avoid Google conflicts
- Download center provides one link with optional MLS-safe assets
- Property sites publish in branded and unbranded modes