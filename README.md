# WarrantyVault

A modern web application rewritten from the Android WarrantyVault app. Keep track of all your product purchases, warranty durations, expiry alerts, and invoice receipts in one secure, accessible place.

## Features
- **Dashboard Overview**: Summary metric counters (Total Products, Active Warranties, Expiring Soon), automated warranty expiry alerts (0–7 days), and recent products list.
- **Product Management**: Full list of all registered products sorted by recent purchase date, with live search and status filters (All, Active, Expiring Soon, Expired).
- **Add Product Form**: Register products with Name, Brand, Price (₹), Purchase Date picker, Warranty Duration in months, and optional Invoice image attachment.
- **Product Details**: Comprehensive breakdown of warranty status (`ACTIVE`, `EXPIRES TODAY`, or `EXPIRED`), remaining days counter, purchase details, and invoice access.
- **Invoice & Receipt Viewer**: Full view of attached invoice receipts with image preview and download support.
- **Authentication**: Email/password sign-in and user registration matching the original flow.
- **Automated Expiry Reminders**: Logic ported from Android `WarrantyWorker` alerting users about upcoming expiries.

## Technology Stack
- React 19
- TypeScript
- Vite
- Tailwind CSS
- Google Cloud Firestore (real-time subscriptions & persistence)
- Firebase Authentication (Google 1-click & email sign-in)
- Lucide React Icons
