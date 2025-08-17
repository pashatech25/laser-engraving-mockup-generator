# Product Context — Real Estate Media SaaS (Multi-tenant)

## Vision
Deliver a multi-tenant SaaS for real estate media companies to sell services, schedule staff, manage bookings, deliver media, and publish branded/unbranded property pages.

## Tenancy Model
- Multi-tenant: every organization (tenant) manages its own services, pricing, packages, calendars, staff, customers, and websites.
- Platform-level configuration (env/secrets) enables core services (e.g., Stripe, S3, Google OAuth). Per-tenant business data lives in the database and is set via Admin UI.

## Scope (MVP)
- Authentication (login/registration), organization onboarding
- Services and categories; pricing modes (flat fee or sqft-based tiers)
- Pricing groups, customer groups, coupons
- Packages with flat/percent discounts and per-item display price overrides (showcase-only)
- Booking + team calendar + appointment intervals + buffers + rescheduling
- Per-staff Google Calendar sync; organization-level Google integration
- Staff auto-assign (toggleable) or customer staff pick (toggle)
- Territories/service areas; travel/buffer rules
- Stripe payments (deposits, balances) and invoicing (PDF)
- S3 media upload; one-link download center; Google Drive/Dropbox export
- Property websites (2+ templates), builder blocks, branded/unbranded publish

## Non-goals (MVP)
- Native mobile app, payroll/HRIS integration, advanced analytics, marketplace, template marketplace.

## Personas
- Owner/Admin, Scheduler, Staff/Photographer, Accounting, Customer (Agent/Team)

## Feature Map (aligned to your list)
1) Login and Registration: email/password + optional SSO. Multi-tenant org onboarding.
2) Booking Calendar: availability, creation, edit, reschedule, cancel.
3) Calendar with Google integration: per-staff OAuth, 2-way sync, conflict detection.
4) Admin Panel: org settings, branding, services, pricing, packages, coupons, taxes, integrations, notifications.
5) Services and Service Categories: CRUD with duration, skills, pricing modes, tiered sqft ranges.
6) Customer Management Area: CRM, groups, terms, history.
7) Booking Management Area: pipeline, assignments, status changes, reschedule.
8) Employee Management Area: roles, skills, territories, availability, payouts.
9) Service Area Management: territories/polygons; routing rules; buffers.
10) Payment Processor Integration: Stripe (cards, wallets); deposits/balances/refunds.
11) Invoicing Management: auto-invoices, taxes, PDF, numbering.
12) Customer Group Management: pricing defaults, payment terms, deposits, NET.
13) Coupon and Discount Management: flat/percent; scope and stacking policy.
14) Pricing Tier Management: non-overlapping tier ranges per service; validators.
15) Web page builder: block-based editor; themes; tokens.
16) Interactive real estate property page: galleries, video, 3D, floor plans, map, facts, lead forms.
17) Multiple templates for web pages: at least 2 property templates at MVP.
18) Branded & unbranded webpages: MLS-safe unbranded mode.
19) Amazon S3 for media upload: multipart, presigned URLs, variants, CDN.
20) Google Drive and Dropbox for media download: export/share links.
21) Cubical integration: assumed CubiCasa floor plans; webhook ingestion.
22) Individual staff Google calendar sync: OAuth per staff.
24) Appointment intervals: org-configurable (e.g., 15/30 mins).
25) Staff payout option per service/day work: policy-based payouts.
26) Customer staff pick option at booking time: org toggle.
27) Service price based on flat fee / total sq.ft option: pricing modes.
28) Customer staff pick at booking disable (system auto choose): auto-assign.

## Defaults (platform-wide, editable in Admin UI per tenant)
- Appointment interval: 30 minutes
- Buffer before/after: 15m / 15m
- Booking window: 30 days ahead
- Reschedule policy: allow up to 24h before start
- Auto-assign algorithm priority: distance, utilization, skill match
- Customer staff pick: disabled by default (org can enable)
- Pricing display mode: show detailed line items with package display overrides
- Invoicing: deposit 25% at booking, balance due prior to delivery
- Taxes: exclusive; default rate 0% (tenants configure)
- Property sites: 2 base templates; branded and unbranded outputs

## Pricing & Packages Rules
- Service pricing_mode:
  - flat: base_price
  - sqft: price chosen from matching tier [sqft_min, sqft_max]; no gaps/overlaps
- Pricing groups: per-customer group modifiers or per-service overrides
- Packages:
  - Items: service + quantity
  - Discounts: flat or percent applied to base item totals
  - Display-only item price overrides inside package for showcase (does not change global service price)
- Coupons: flat/percent; scope (all/service/package/category); stacking policy configurable

## Booking & Calendar
- Slot generation: appointment interval + service duration + buffers + travel time padding by territory
- Reschedule flow: preserve invoice; recompute assignment; notify parties
- Auto-assign: skills + territory + availability + Google conflicts + scoring (distance/utilization)
- Client rescheduling requests allowed within policy

## Media & Delivery
- Uploads: S3 multipart with presigned URLs; antivirus scan; image variants; video transcode; EXIF
- Delivery: one-link download center; branded/unbranded toggles; watermark previews; MLS-compliant video
- Exports: Google Drive/Dropbox folder creation + upload; share link capture

## Property Websites
- Block builder: hero, gallery, video, 3D, floor plan, map, facts, amenities, lead form, open-house
- Templates: at least 2; theme tokens for color/typography/spacing; per-tenant branding
- Domains: tenant custom subdomains; unbranded subdomain; SSL via ACME

## Integrations
- Stripe for payments; Google (OAuth/Calendar/Drive); Dropbox; CubiCasa (floor plans)
- Email/SMS: SES/SendGrid and Twilio (optional)

## Security & Compliance
- Row-level isolation by org_id; encrypted secrets; signed URLs; audit logs
- GDPR exports/deletes; least-privilege keys; password hashing (Argon2)

## API (MVP)
- Reference: full OpenAPI spec lives at `openapi/openapi.yaml`
- Auth
  - Supabase Auth for sessions/JWT. Optionally keep `/auth/register` and `/auth/login` for server-managed flows.
- Organizations
  - GET `/organizations/me`
- Services & Pricing
  - GET/POST `/services`, PATCH/DELETE `/services/{id}`
  - GET/POST `/services/{id}/tiers`
  - GET/POST `/pricing-groups`, POST `/pricing-groups/{id}/rules`
- Packages & Coupons
  - GET/POST `/packages`, POST `/packages/{id}/items`
  - GET/POST `/coupons`
- Customers & Groups
  - GET/POST `/customers`
  - GET/POST `/customer-groups`
- Quote & Availability
  - POST `/quote` (compute totals with tiers/groups/coupons)
  - GET `/availability` (slots by date/services)
- Bookings & Calendar
  - POST `/bookings`, GET/PATCH `/bookings/{id}`
  - GET `/calendar/staff/{id}`
  - POST `/calendar/google/connect` (per-staff OAuth)
- Media & Properties
  - POST `/media/presign`, POST `/media/complete`
  - GET/POST `/properties`, POST `/properties/{id}/website/publish`
  - GET `/download-center/{propertyId}`
- Billing & Integrations
  - GET/POST `/invoices`, POST `/payments/intent`
  - POST `/integrations/webhooks/stripe`, GET `/integrations/google/callback`

## Database (Supabase)
- Supabase Postgres with RLS by `org_id`, aligned to `docs/ERD.mmd`.
- Use Supabase client on the frontend and server-side service role for privileged ops.
- Migrations and policies maintained in SQL (`safe-migration.sql` and related files).

## UI/UX baseline
- Booking flow screens (you will provide images) are the design source of truth.
- We will extract tokens (color, type scale, spacing, radii, shadows) and core components (buttons, inputs, selects, cards, tabs, modals, calendar/time-picker, stepper, toast) and apply consistently across Admin, Customer, and Delivery areas.

## Phasing
- Phase 1 (MVP): Auth, services/tiers/groups, bookings/calendar, Stripe deposits, invoices, S3 uploads, download center, property sites (2 templates), Google Calendar, basic payouts
- Phase 2: Packages (display overrides), coupons, territories, auto-assign, Drive/Dropbox export, branded/unbranded toggles, builder blocks expansion, CubiCasa
- Phase 3: Reporting, payroll integrations, template marketplace, advanced analytics