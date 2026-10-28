# RentRide – Internet Programming Lab

Open `index.html` in a browser. All styles and scripts are separate files; no server is required. Google Fonts are optional (falls back to system font when offline).

## Demo accounts
- Admin: admin@rentride.com / Admin@123
- User: user@rentride.com / User@123

## Features
- Customer registration, login/logout, profile, search by keyword, type and location, rental-duration input
- Vehicle details, rental date/time selection, customer contact and address, booking requests, calculated rental totals
- Customer dashboard with statuses, booking cancellation, check-in forms, past appointments, reviews and support requests
- Admin dashboard: add/edit/delete vehicles, booking approval/rejection/completion, customers, support messages and booking metrics
- CSS animations, responsive layout, interactive hover states, browser LocalStorage data persistence, sessionStorage login session

## Limitations
This is a frontend-only demonstration. Credentials are stored in browser LocalStorage and are **not secure**. Payments are demo choices only (no transaction is processed). Bookings are confirmed after admin approval, not by a live backend. The 24/7 support page stores messages locally but does not provide a staffed service. Different devices do not share data. No actual image uploads are implemented; vehicle emoji illustrations serve as visual placeholders.

## Reset demo
In browser developer tools, delete the `rentride_lab_v2` LocalStorage key and reload the page.
