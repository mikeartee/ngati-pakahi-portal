# Ngāti Pakahi O Manga Iti — Whānau Portal

A private, browser-based portal for the Ngāti Pakahi O Manga Iti whānau. It provides a shared space for family announcements, venue bookings, and whakapapa (family tree) exploration.

---

## Features

- **Gate / Login** — Whānau members enter their name, their connection to the matriarch, and a shared access code to gain entry.
- **Kāinga (Home)** — Announcements board with the ability to post new notices. Shows a preview of upcoming bookings.
- **Bookings** — Visual monthly calendar for reserving the hall or meeting house. Conflict detection prevents double-bookings.
- **Whakapapa** — Interactive SVG family tree rooted at the matriarch. Members can search by name and add new people.

---

## How to Use

This is currently a fully static site — no build step, no server, no dependencies.

1. Open `index.html` in any modern web browser.
2. Enter your name, your connection to the whānau, and the access code.
3. Navigate between pages using the header menu.

To share with whānau, host the files on any static file host (e.g. GitHub Pages, Netlify).

---

## Access Code

The access code is set in `index.html`:

```js
const ACCESS_CODE = 'WHANAU_2025';
```

Change this to a code of your choosing before sharing the site. Note that because this is a static site, the code is visible in the page source to anyone who looks — it is a courtesy gate, not a security barrier. Do not store sensitive personal information in this portal until a proper backend is in place.

---

## Current Data Storage — Important Limitation

All data (bookings, announcements, family tree additions) is currently stored in the browser's `localStorage`. This means:

- Data is **local to each device and browser** — changes made on one device will not appear on another.
- Clearing browser data will reset everything to the built-in defaults.
- **Bookings made on one device are invisible to everyone else.** This makes the current booking system unsuitable for real shared use.

This is a known limitation that needs to be addressed before the site is used by the wider whānau.

---

## Planned: Shared Database Backend

To make bookings and whakapapa data genuinely shared across all devices, the site needs a backend database. The data functions in `app.js` (`getBookings`, `saveBookings`, `getFamilyData`, `saveFamilyData`, etc.) are already isolated and designed to be swapped out for API calls.

Recommended options, in order of preference:

**Supabase** (recommended)
A hosted Postgres database with a JavaScript SDK. Free tier is generous, no server to manage. Supports row-level security so read/write access can be controlled per table. Well suited to the relational nature of whakapapa data (parent/child relationships).

**Firebase Firestore**
Google's hosted NoSQL database. Free tier available, with real-time sync built in — the calendar would update live across devices without a page refresh.

**Airtable**
A spreadsheet-style database with a REST API. Very easy for a non-technical maintainer to manage data directly through the Airtable interface. Less powerful than a relational database but very approachable.

When a backend is added, the access code gate should also be replaced with proper user authentication (e.g. Supabase Auth or Firebase Auth).

---

## File Structure

```
index.html        — Gate / login page
home.html         — Kāinga: announcements and booking preview
bookings.html     — Venue booking calendar
whakapapa.html    — Interactive family tree
style.css         — All styles
app.js            — Shared utilities: auth guard, header renderer, data helpers
```

---

## Customising the Family Tree

The default tree is seeded in `whakapapa.html` inside the `getFamilyData()` function. Edit those entries to match your actual whānau, or use the **+ Add Member** button in the browser to add people interactively (changes are saved to `localStorage` until a backend is connected).

---

## Known Limitations

- The access code is visible in the page source — this is a family convenience gate, not a security system.
- Data is stored per-device in `localStorage` and is not shared across browsers or devices. **This must be resolved before real bookings or whakapapa records are managed here.**
- The whakapapa layout works best for trees up to around 4–5 generations. Very wide generations may cause node overlap.
- The site requires JavaScript to function — there is no fallback for browsers with JS disabled.

---

## Acknowledgements

Built with aroha for the Ngāti Pakahi O Manga Iti whānau.  
*He kāhui, he whānau, he iwi.*
