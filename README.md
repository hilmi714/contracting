# Stallion Contracting — website

Static website for **Stallion Contracting**, a Calgary commercial general contractor (storefront build-outs, tenant improvements, HVAC, plumbing, permits and design).

No build step: plain HTML, CSS and JavaScript.

```
index.html              home page (content, SEO tags, schema, first-visit logo intro)
*-calgary/index.html    service pages: storefront build-outs, tenant improvements,
                        commercial HVAC, commercial plumbing, building permits,
                        architectural design (each with its own FAQ + schema)
assets/css/site.css     styles
assets/js/site.js       project showcase, quote quiz, header, stats count-up, intro
assets/img/             logo, icons, social share image
assets/img/projects/    project photos (+ -thumb versions)
assets/video/           progress video
robots.txt, sitemap.xml search engines
```

## Publish with GitHub Pages

1. Repo **Settings → Pages**.
2. **Source:** Deploy from a branch → `main` / `(root)` → Save.
3. The site appears at `https://<user>.github.io/contracting/` within a minute or two.

### Use stallioncontracting.ca

1. In **Settings → Pages → Custom domain**, enter `stallioncontracting.ca` and save (GitHub adds a `CNAME` file).
2. At your domain registrar, point DNS to GitHub Pages:
   - `A` records for `@`: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `CNAME` for `www`: `<user>.github.io`
3. Tick **Enforce HTTPS** once the certificate is issued.

Only switch DNS when you're ready to replace the current site.

## Quote quiz

The quote box is a 5-step quiz (project type → size → timeline → drawings/permits → contact).
On service pages the first answer is pre-filled, so visitors start at step 2.

Requests are handled by `send-quote.php` on the Hostinger server:
- emails each request to **info@stallioncontracting.ca** (from no-reply@stallioncontracting.ca, Reply-To = the client)
- saves a private backup of every lead to `stallion-leads/leads.csv` **one folder above public_html** (not reachable from the web)
- if the script can't be reached, the site falls back to FormSubmit automatically

To change the destination email, edit `TO_EMAIL` at the top of `send-quote.php`.

## Add a project to the showcase

1. Put photos in `assets/img/projects/` as `name.jpg` (max ~1600px) and `name-thumb.jpg` (~480px).
2. In `assets/js/site.js`, copy a block in `PROJECTS` and list the photos in order (first = before, last = after).

## Still to fill in


- Client testimonials: hidden for now; add real reviews later
