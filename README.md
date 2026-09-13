# DS Fitness — website

A React + Vite site for a personal training business, built to deploy on
Netlify. It includes:

- A dynamic home page with scroll-triggered testimonial quotes and prompts
- About, Pricing and Testimonials pages
- A free-consultation booking flow (in person / phone / video → calendar → contact details)
- An admin area (Netlify Identity login) to set weekly availability and manage bookings

All the placeholder copy — business name, testimonials, prices, prompts — lives
in one file: [`src/data/siteContent.js`](src/data/siteContent.js). Edit that
file to make the site your own; nothing else needs to change.

## How it fits together

- **Frontend**: React (Vite), React Router, Framer Motion for the scroll/entrance animations.
- **Booking data & availability**: stored in [Netlify Blobs](https://docs.netlify.com/blobs/overview/) (`ds-fitness` store), read/written by serverless functions in `netlify/functions/`.
- **Admin auth**: [Netlify Identity](https://docs.netlify.com/visitor-access/identity/) — any confirmed Identity user can access `/admin`. Since this is a single-trainer site, access is controlled by keeping registration invite-only (see below), not by a roles system.
- **Booking notifications**: bookings are always saved to Netlify Blobs (so nothing is ever lost even if email fails). The booking form also mirrors each submission to a [Netlify Forms](https://docs.netlify.com/forms/setup/) submission named `booking`, so you can turn on an email notification for new bookings from the Netlify UI with no extra code.

## Local development

```bash
npm install
npm run dev
```

This runs the Vite dev server only. The `/api/*` serverless functions and
Netlify Identity need Netlify's own dev server to work locally:

```bash
npm install -g netlify-cli   # if you don't already have it
netlify link                 # connect this folder to your Netlify site
netlify dev
```

`netlify dev` proxies the Vite server, runs the functions in
`netlify/functions/`, and emulates Blobs locally.

## Deploying to Netlify

1. Push this repo to GitHub (or GitLab/Bitbucket) and create a new site on
   [Netlify](https://app.netlify.com) from it. Build settings are already
   defined in `netlify.toml` (`npm run build`, publish `dist`, functions
   folder `netlify/functions`) — Netlify will pick them up automatically.
2. **Enable Identity**: Site configuration → Identity → Enable Identity.
   - Under **Registration**, set it to **Invite only** so the public can't
     create their own admin accounts.
   - Under **Site configuration → Identity → Emails**, you can customise the
     invitation email.
   - Invite yourself: Identity tab → **Invite users** → enter your email.
     You'll get an email to set a password, then you can sign in at
     `/admin` on the live site.
3. **Enable form notifications** (optional but recommended): once the site
   has deployed at least once (so Netlify has scanned `index.html` and found
   the hidden `booking` form), go to **Site configuration → Forms → Form
   notifications** and add an **Email notification** so you get emailed
   whenever someone books a consultation.
4. **Netlify Blobs** requires no setup — it's available automatically to
   functions on any Netlify site.
5. Trigger a deploy. Your site, booking flow and admin area are now live.

### Customising your availability

Sign in at `/admin` (bottom of any page footer, or navigate directly) and:

- Use the **Availability** tab to set the days/times you're free for
  consultations each week, the length of a consultation slot, and any
  specific dates to block out (holidays, etc).
- Use the **Bookings** tab to see everything that's been booked and cancel
  a booking if needed (this frees the slot back up for other clients).

### A note on scale

Blobs are read and updated with a simple read-modify-write per request,
which is more than enough for a single-trainer booking calendar. If booking
volume ever became very high and concurrent double-bookings became a real
risk, that would be the first thing to revisit (e.g. moving to a database
with atomic writes).

## Project structure

```
src/
  components/       Nav, Footer, Reveal (scroll-in-view animation helper)
  data/siteContent.js   All editable copy: business info, testimonials, prompts, pricing
  lib/              Netlify Identity + fetch helpers for the serverless functions
  pages/            Home, About, Pricing, Testimonials, Booking, Admin
netlify/functions/
  availability.js       GET  — public, computes bookable slots
  book.js               POST — public, creates a booking
  admin-schedule.js     GET/PUT — Identity-protected, reads/writes weekly availability
  admin-bookings.js     GET/DELETE — Identity-protected, lists/cancels bookings
  lib/                  Shared schedule math, storage and auth helpers
netlify.toml        Build settings, API redirects, SPA fallback
```
