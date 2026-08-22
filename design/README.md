# Design notes

Stitch-la design panna "Iron Clan / Kinetic Peak" theme **already code-la apply pannirukku** —
dark background, neon lime accent, condensed italic caps headings.

Tokens: [`src/app/globals.css`](../src/app/globals.css) · fonts: [`src/app/layout.tsx`](../src/app/layout.tsx)

## Innoru Stitch screen port pannanumna

Export panna HTML-a inga save pannunga (`01-landing.html`, `06-dashboard.html`, …), apparam:

| Screen | Port aaga vendiya file |
| --- | --- |
| Landing | `src/app/page.tsx` |
| Top bar / footer | `src/components/site-header.tsx` |
| Form fields (inputs, chips, uploads) | `src/components/form-fields.tsx` |
| Form layout / steps | `src/app/apply/ApplyForm.tsx` |
| Success | `src/app/apply/success/page.tsx` |
| Login | `src/app/login/LoginForm.tsx` |
| Applications list | `src/app/dashboard/page.tsx` |
| Applicant detail | `src/app/dashboard/[id]/page.tsx` |

## Rules

1. **Class names mattum** edunga. `{...register(...)}`, `<Controller>`, `action={...}`,
   `href={...}`, `name="..."` — idhellaam thodave koodaadhu. Adhu thaan form-a work aaga vaikkudhu.
2. Stitch `<script>` tag kuduthaa **use pannaadheenga** — step navigation, chip toggle,
   file list ellaam React state already handle pannudhu.
3. Colour-a hardcode pannaadheenga. `globals.css` tokens-a maathi, markup-la
   `bg-brand` / `text-brand` / `border-line` / `text-muted` use pannunga.
4. Stitch Tailwind v3 syntax kudukkalaam; indha project **Tailwind v4**:
   - `bg-opacity-50` → `bg-black/50`
   - `flex-shrink-0` → `shrink-0`
   - custom colours config-la illa — `@theme inline` tokens vazhiya thaan
5. Fonts `next/font/google` vazhiya `layout.tsx`-la varudhu. Stitch kudukra `<head>` link-a
   direct-a podaadheenga — layout shift varum.

## Test

```bash
npm run dev
```

375px (mobile) and 1280px (desktop) rendulayum check pannunga.
