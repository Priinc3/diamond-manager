# Changelog

Format: [YYYY-MM-DD] | [vX.X.X] | [Type: Added/Fixed/Changed/Removed]

---

## [1.1.0] — 2026-03-27

### Added
- **Internationalization (i18n)**:
  - Multi-language support for **Gujarati (Default)**, **English**, and **Hindi**.
  - Dynamic language selector in the Settings page.
  - Localization applied to Dashboard, Transactions, Settings, and Login modules.
- **Gujarati Refinement**: Simplified business terminology to **"લેવાના" (Levana)** and **"દેવાના" (Devana)**.

### Fixed
- **Production Login Redirect**: Implemented robust origin detection using forwarded headers and dynamic URL resolution to fix the `redirect_uri_mismatch` and localhost redirect issues on Vercel.

---

## [1.0.0] — 2026-03-27

### Added
- Initial project setup with Next.js 15 + TypeScript + Tailwind CSS
- Supabase integration for database and authentication
- Google OAuth login via Supabase Auth
- **Dashboard page** with:
  - Stat cards (total people, receivable, payable, diamonds)
  - Net balance bar chart (Recharts)
  - Quick summary panel
  - People grid with search + per-person money/diamond breakdown
  - Add/Edit/Delete people with modal forms
- **Transactions page** with:
  - Money tab (receivable "They Owe Me" / payable "I Owe Them")
  - Diamond tab (given "They Have Mine" / received "I Have Theirs")
  - Filter by person + search
  - Add/Delete transactions via modals
- **Settings page** with:
  - Diamond type CRUD (name, shape, size, quality)
  - Shape-colored icons
  - Industry-standard clarity grades (IF, VVS1...I3)
- Responsive sidebar navigation with user profile
- Complete design system (Inter font, indigo accent, white theme)
- Row Level Security (RLS) on all Supabase tables
- Database migration SQL with indexes

### Technical Notes
- All pages use client components with AppShell auth guard
- Supabase RLS ensures data isolation per user
- Animations on all interactive elements (fade, scale, hover lift)

