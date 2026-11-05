# Homepage — "The drawing set" (draft, not live)

Built from the A-01…A-09 brief. Not linked from the live site; `main` is unchanged.

- `index.html` — the page (all copy verbatim from the brief), inline CSS + one small first-party script
- `assets/fonts/` — Inter Display 600 (headings) and Carlito 400/700 (body), self-hosted WOFF, OFL licences included
- `assets/stallion-logo.png`

Links to pages that don't exist yet (`/contact`, `/services/*`, `/who-we-work-with`, `/about`, `/process`)
ship with `rel="nofollow"` and `data-pending`, per the brief.

To go live later: replace the root `index.html` with this file and move `assets/fonts` + the logo alongside,
then build the pending pages and remove `rel="nofollow" data-pending` from their links.
