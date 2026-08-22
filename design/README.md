# Stitch exports

Stitch-la design panna screens-a inga HTML file-a save pannunga. Ovvoru screen-um oru file:

| File | Screen | Port aaga vendiya code file |
| --- | --- | --- |
| `01-landing.html` | Landing page | `src/app/page.tsx` |
| `02-form-step.html` | Form step (any one of the 4) | `src/components/form-fields.tsx` + `src/app/apply/ApplyForm.tsx` |
| `03-form-upload.html` | Last step with file uploads | `src/components/form-fields.tsx` (`FileInput`) |
| `04-success.html` | Success screen | `src/app/apply/success/page.tsx` |
| `05-login.html` | Owner login | `src/app/login/LoginForm.tsx` |
| `06-dashboard.html` | Applications list | `src/app/dashboard/page.tsx` |
| `07-detail.html` | Applicant detail | `src/app/dashboard/[id]/page.tsx` |

## Port panradhukku rules

1. **Class names mattum** edunga. Structure romba maarina, JSX-a maathunga — aana
   `{...register(...)}`, `<Controller>`, `action={...}`, `href={...}`, `name="..."`
   attributes-a **thodave koodaadhu**. Adhu thaan form-a work aaga vaikkudhu.
2. Stitch `<script>` tag kuduthaa **use pannaadheenga** — React state already andha velai-ya
   pannudhu (step navigation, chip toggle, file list).
3. Colors-a hardcode pannaadheenga. `globals.css`-la `--brand` token-a maathunga, apparam
   markup-la `bg-brand` / `text-brand` use pannunga.
4. Stitch Tailwind v3 syntax kudukkalaam; indha project **Tailwind v4**. Common differences:
   - `bg-opacity-50` → `bg-black/50`
   - `flex-shrink-0` → `shrink-0`
   - custom colors config-la illa — `--brand` token vazhiya thaan
5. Fonts: Stitch `<link>` kudukkum. Adha `src/app/layout.tsx`-la `next/font/google` use panni
   podunga, `<head>` link-a direct-a podaadheenga.

## Test panna

Ovvoru screen port panna appuram:

```bash
npm run dev
```

Mobile viewport (375px)-la kandippa check pannunga — trainers 90% mobile-la thaan varuvaanga.
