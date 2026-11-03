# K-Explore: Campus Event Management Website

A responsive website where students can explore upcoming campus events, search and filter them, read the details and register. Built with plain **HTML5, CSS3 and JavaScript** (no frameworks, no build step) for the K-Explore Web Designing task.

- **Live site:** `https://k-explore-web-design-project.vercel.app`
- **Repository:** `https://github.com/PuskarDas/K-EXPLORE-Web-Design-Project`

## Screenshots

Add screenshots to a `screenshots/` folder and link them here:

Desktop  
 <img width="944" height="499" alt="Screenshot 2026-11-03 223142" src="https://github.com/user-attachments/assets/a73ad8de-4194-4d3e-9541-c83d48f05033" />
 
Mobile
 <img width="845" height="1600" alt="WhatsApp Image 2026-11-03 at 10 34 57 PM" src="https://github.com/user-attachments/assets/4f5dca62-b2c5-4852-91d8-db212e8ee7ef" />
 

## Features

**Required**
- Hero section with the next event and a live countdown
- Event cards showing image, name, date, venue and short description
- Search by name, venue or keyword, plus category filters (Tech, Cultural, Sports, Workshop, Career)
- Event details dialog with full information and a register button
- Registration form (name, email, phone, event) with JavaScript validation and inline error messages
- Confirmation message with a ticket ID after a successful registration
- Responsive layout for mobile, tablet and desktop

**Bonus**
- Dark and light mode (remembers your choice, respects system setting by default)
- Event countdown timers (hero and details dialog)
- Local Storage registration management: view, cancel and clear your tickets, duplicate registrations blocked, seats left update
- Subtle animations that respect `prefers-reduced-motion`

## Tech stack

HTML5 · CSS3 (custom properties, Grid, Flexbox) · Vanilla JavaScript (ES6+) · Local Storage · Git and GitHub

## Project structure

```
k-explore/
├── index.html          # Page structure and semantic markup
├── css/style.css       # Design tokens, layout, components, dark mode, responsive rules
├── js/
│   ├── events.js       # Event data (edit this file to add or change events)
│   └── app.js          # Rendering, filters, dialog, validation, countdown, Local Storage
├── assets/favicon.svg
├── README.md
├── LICENSE
└── .gitignore
```

## Run locally

No installation needed.

```bash
git clone https://github.com/YOUR-USERNAME/k-explore.git
cd k-explore
# Option 1: open index.html in your browser
# Option 2: use a local server (recommended)
npx serve .
# or: python -m http.server 8000
```

## How it works

- **Data:** `js/events.js` holds an `EVENTS` array. Cards, the filter chips, the registration dropdown and the hero are all generated from it, and past events are hidden automatically.
- **Validation:** runs on blur, on typing after the first error, and on submit.
  - Name: letters, spaces, `.`, `'` and `-`, at least 2 characters
  - Email: standard `name@domain.tld` format
  - Phone: 10-digit Indian mobile number starting with 6 to 9 (optional `+91` or `0` prefix accepted)
  - Event: must be selected
  - The same email cannot register twice for the same event
- **Storage:** registrations are saved in `localStorage` under `kexplore.registrations`, the theme under `kexplore.theme`. Data stays in the visitor's own browser.
- **Security:** all user-entered text is HTML-escaped before it is rendered.
- **Accessibility:** semantic HTML, labelled fields, `aria-live` for results and errors, visible keyboard focus, skip link, native `<dialog>` with focus handling.

## Deployment

The site is static, so any static host works. Push the repo to GitHub first.

### GitHub Pages
1. Open the repo on GitHub, then **Settings → Pages**.
2. Under **Build and deployment**, set Source to **Deploy from a branch**.
3. Choose branch `main` and folder `/ (root)`, then **Save**.
4. After a minute the site is live at `https://YOUR-USERNAME.github.io/k-explore/`.

### Netlify
1. Sign in at netlify.com with GitHub and click **Add new site → Import an existing project**.
2. Pick the `k-explore` repo.
3. Leave the build command empty and set the publish directory to `.` (root), then **Deploy**.

### Vercel
1. Sign in at vercel.com with GitHub and click **Add New → Project**.
2. Import the `k-explore` repo.
3. Framework Preset: **Other**. Leave build and output settings empty, then **Deploy**.

Every push to `main` redeploys automatically on all three platforms.

## Git workflow used

```bash
git init
git add .
git commit -m "feat: initial project structure"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/k-explore.git
git push -u origin main
```

Commits follow a simple `type: message` style (`feat`, `fix`, `style`, `docs`, `refactor`).

## Future improvements

- Backend and database so registrations are shared across devices
- Email confirmation after registering
- Calendar export (.ics) and map links for venues
- Admin page to add and manage events

## License

Released under the [MIT License](LICENSE).

## Author

Puskar, B.Tech Computer Science, KIIT University.
