# KC Tattoos — website (Karla Chirinos)

One-page marketing site for a private tattoo studio. Client: KC Tattoos, artist Karla Chirinos.
Built by Arias Technology Labs LLC. UI text is in Spanish; code, comments and docs are in English.

## Scope
Presentation + contact only. No booking system, no shop, no blog, no admin panel.
The contact form sends the visitor's details and up to 3 photos to Karla by email.

## Stack
- Astro (static output). `npm run dev`, `npm run build`, `npm run preview`.
- Netlify hosting. The form uses Netlify Forms (`data-netlify="true"`): submissions are emailed
  and stored in the Netlify dashboard. Enable it in Netlify: Site > Forms > Notifications > add Karla's email.
- `src/scripts/form.js` shrinks phone photos to 1600 px JPEG (Netlify limit is ~8 MB per submission)
  and posts the form with `fetch`. `src/pages/gracias.astro` is the no-JS fallback.
- Decision: Netlify is both the host and the form handler, for the demo and for production
  (it also sells domains). The form backend stays swappable: set `PUBLIC_FORM_ENDPOINT` at build time
  to point `form.js` at another endpoint that accepts the same multipart fields (`nombre`, `contacto`,
  `zona`, `tamano`, `idea`, `foto1..3`). Check Netlify's current free-plan form limits before launch.
- Forms do not work in `astro dev` / `astro preview`; they only work once deployed on Netlify.

## Languages
- Spanish at `/`, English at `/en/`. Both render `src/components/Page.astro`; all copy lives in `src/i18n.js`.
- An inline script in the head picks the language: the saved choice (`localStorage['kc-lang']`, set by
  the ES/EN link) or else the browser language (Spanish only for `es-*`, everything else English).
- Form field names stay the same in both languages; a hidden `idioma` field tells Karla which one was used.

## Files
- `src/components/Page.astro` — the whole page. `src/styles/global.css` — all styles.
- `src/components/Threads.astro` + `src/scripts/threads.js` — braided gold threads drawn on scroll
  with sparkles at the tips (desktop only; static on phones).
- `public/img/karla/` — portrait cutout (transparent WebP). The current one is AI-generated for the demo.
- `public/img/` — optimized WebP images (demo photos generated with AI).
- `originales/` — full-resolution PNGs, git-ignored, never served.
- `mockup/template.html` — approved design mockup. `referencia-diseno/` — older prototype, reference only.

## Visual identity (keep exactly)
Background `#0B0B0C`, text `#EFE7D6`, gold `#C9A46A` / `#E8CF9A` / `#9C7A3E`, lines `#2E2A24`.
Fonts: Cormorant Garamond (titles), Manrope (text). Thin gold strokes, no emojis, inline SVG icons.

## Performance rules (phone lag was a past problem)
- No continuous animations on mobile; only entry animations. Respect `prefers-reduced-motion`.
- Hero uses `<picture>` with `hero-movil.webp` (crop without arms, on purpose) on phones.
- Images are WebP, `loading="lazy"` except the hero (`fetchpriority="high"`).

## Placeholders still needed from the client
[CIUDAD], [DIRECCIÓN], [HORARIO], [MARCA] of inks, [Nº] of health license, [48 h] reply time,
[X] days to move an appointment, [X] weeks for healing check, WhatsApp number, Instagram, email,
Karla's bio text, and real portfolio photos (current ones are demo images).
