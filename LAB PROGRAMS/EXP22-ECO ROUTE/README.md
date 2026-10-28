# EcoRoute – Smart Solid Waste Management System

A complete browser-only Internet Programming lab demonstration using HTML, CSS, JavaScript and localStorage.

## Run
Open `index.html` in a modern browser. No server, installation, API key or internet connection is needed for core functionality. Google Maps links require internet access.

## Demo credentials
- Administrator: admin@ecoroute.com / Admin@123
- Driver: driver@ecoroute.com / Driver@123
- General public: public@ecoroute.com / Public@123

## Modules
- Admin: manage garbage bins and fill levels, create/manage drivers, generate and assign routes, view/update public complaints, analytics and CSV reports.
- General public: register, login, submit complaints and monitor status, view bins and notifications.
- Driver: login, see daily assignments, open Google Maps route, mark route completed, enter garbage loads and view history.

## Routing
A nearest-neighbor geographic heuristic sequences bins above a chosen fill threshold. The route starts with the first selected bin and finishes at the specified dumping site. Distances are approximate straight-line kilometers; Google Maps Directions links show road navigation. This is not Google Maps API integration or live traffic optimization. The dumping site is a configurable demonstration location, not a verified facility.

## Important limitations
LocalStorage is a single-browser database substitute, not a server database. Demo passwords are stored in browser storage and are NOT secure. No real notifications, cloud synchronization, GPS tracking or remote workforce data sharing. For production, use a secure backend, database, password hashing, authentication and a properly configured Maps API. Reset browser localStorage key `ecoroute_lab_v1` to restore demo data.
