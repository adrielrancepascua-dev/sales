Cindy's Bakery Frontend V1

What this includes
- Sales Entry screen with preset item cards.
- Cashier shift mode so cashier name is set once per shift.
- Cashier transaction fields locked to selected preset by default.
- Manager-approved price override flow for cashier mode.
- One-tap payment buttons and quick quantity buttons (+1, +2, +5, reset).
- Today Summary screen with simple totals and top items.
- Preset Manager screen for owner-managed menu items.
- Preset editing (not only add/delete/toggle).
- Settings screen for business ID, webhook URL, and API key.
- Cashier mode and owner mode separation.

How to run
1. Open frontend/index.html in a browser.
2. Switch to Owner Mode.
3. Go to Settings.
4. Fill Business ID as BIZ-001.
5. Paste your n8n webhook URL and API key.
6. Choose whether to remember API key on this device.
7. Optional: set an owner access code.
8. Save Settings.
9. Return to Sales Entry.
10. Start cashier shift and submit transactions.

Backend compatibility
- payment_method values used by this UI: cash, gcash, card, other
- This matches your current backend validation list.

Notes
- Presets are editable and stored in browser localStorage.
- Recent transactions and summary are based on successful submissions recorded in localStorage.
- Summary is intentionally labeled as device-local and not backend source of truth.
- This is a V1 cashier-first frontend and is intentionally simple.
- Sensitive actions (price override, preset delete) require owner access code.
