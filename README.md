# Stallion Contracting — website

Static website for **Stallion Contracting**, a Calgary commercial general contractor (storefront build-outs, tenant improvements, HVAC, plumbing, permits and design).

No build step: plain HTML, CSS and JavaScript.

```
index.html              the page (content, SEO tags, schema)
assets/css/site.css     styles
assets/js/site.js       project showcase, FAQ, quote form
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

## Quote form

The form sends leads to **info@stallioncontracting.ca** through [FormSubmit](https://formsubmit.co) (free, no account).
The **first** submission triggers a one-time activation email to that inbox — click the link in it, or no leads are delivered.
To send leads somewhere else, change the `action` URL on `<form id="quote-form">` in `index.html`.

## Add a project to the showcase

1. Put photos in `assets/img/projects/` as `name.jpg` (max ~1600px) and `name-thumb.jpg` (~480px).
2. In `assets/js/site.js`, copy a block in `PROJECTS` and list the photos in order (first = before, last = after).

## Still to fill in


- Client testimonials (currently placeholders)
