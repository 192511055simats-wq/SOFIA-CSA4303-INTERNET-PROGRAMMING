# VacancyHub — Internet Programming Lab Experiment 21

Open `index.html` in a modern browser. No server or dependencies required (Google Fonts optional).

## Demo accounts
- Admin: `admin@vacancyhub.com` / `Admin@123`
- Approved director: `director@demo.com` / `Director@123`
- Applicant: `user@demo.com` / `User@123`

## Features
Applicant registration/login, search and location/category filters, vacancy details, apply with resume text or uploaded file, save/unsave jobs, privacy settings per company, application tracking, notifications. Director registration and admin approval, posting jobs with optional image, vacancy management, applicant review, shortlisting/rejection, candidate resume review, application reports. Admin approval, user directory, reports. All data persists in browser localStorage. Daily updates are simulated on app visit (not real background push notifications). All roles can log out.

## Important limitations
This is a front-end educational demo, **not a production job portal**. Passwords and resume data are stored in localStorage (not secure); resume files are limited to 350 KB, and images to 450 KB, because browser storage is limited. No real email, SMS, push service, database, or server-side authentication is included. Data is specific to the browser and device. Use a backend and secure authentication for a real deployment.
