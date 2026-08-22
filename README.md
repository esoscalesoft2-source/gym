# Gym Trainer Hiring — Phase 1

Oru gym owner-ku trainers hire panradhukku oru site: trainers oru multi-step form fill pannuvaanga,
owner login panni applications-a paathu shortlist pannuvaanga.

Stack: Next.js 16 (App Router) · Tailwind v4 · Firebase (Firestore + Auth + Cloud Storage) · react-hook-form + zod

---

## Setup (order-a follow pannunga)

Full step-by-step: [`firebase/seed.md`](firebase/seed.md). Surukkama:

### 1. Firebase project

[console.firebase.google.com](https://console.firebase.google.com) → **Add project**.
Apparam enable pannunga: **Firestore Database** (production mode, `asia-south1`),
**Storage**, **Authentication → Email/Password**.

### 2. Rules deploy pannunga

```bash
firebase deploy --only firestore:rules,firestore:indexes,storage
```

Rules [`firebase/`](firebase/) folder-la irukku. CLI vendaamna Console-la paste pannunga.
**Idha miss pannaadheenga** — Firestore production mode-la default-a ellaam block aagum.

### 3. Gym document + owner account

Firestore-la `gyms` collection → oru document create pannunga:
`{ name, city, owner_uids: [] }`. Document id-a copy pannunga.

Authentication → **Add user** → email + password. Vandha **UID**-a `owner_uids` array-la serunga.

> UID-a serkkaleena login aagum, aana dashboard "Ungalukku access illa" nu kaattum.

### 4. `.env.local` fill pannunga

[`.env.example`](.env.example) copy panni fill pannunga. Service account key-a base64 panna:

```bash
node -e "console.log(require('fs').readFileSync(process.argv[1]).toString('base64'))" key.json
```

### 4b. Storage (optional)

Cloud Storage-ku Blaze plan venum. Skip pannalaam — `NEXT_PUBLIC_UPLOADS_ENABLED=false`
(default) vachaa, apply form-la file upload fields kaattaadhu, matha ellaam work aagum.
Bucket create panna apparam mattum `true` pannunga.

### 5. Run

```bash
npm run dev
```

| Route | Enna |
| --- | --- |
| `/` | Landing page |
| `/apply` | Trainer application form (4 steps) |
| `/dashboard` | Owner-oda applications list (login venum) |
| `/dashboard/[id]` | Oru application detail + status + notes |
| `/login` | Owner login |

---

## Security model

Supabase-la idhellaam **RLS** (database-level) pannichu. Firebase-la rendu idathula pirinjirukku —
rendum thevai:

| Layer | File | Enna pannudhu |
| --- | --- | --- |
| Client SDK | [`firebase/firestore.rules`](firebase/firestore.rules) | Browser-la irundhu neraa Firestore-a padikkaradha thadukkum |
| Client SDK | [`firebase/storage.rules`](firebase/storage.rules) | Upload mattum allow, read block (`create`-only, 5 MB, PDF/image) |
| Server | [`src/lib/firebase/owner.ts`](src/lib/firebase/owner.ts) | Admin SDK **rules-a bypass pannum**, so ownership check inga |

> ⚠️ Admin SDK (`src/lib/firebase/admin.ts`) ellaa rule-yum bypass pannum. Adhanaala
> ovvoru dashboard read-um `ownsGym()` vazhiya thaan poganum — `gyms/{id}.owner_uids`-la
> uid irukkaanu paakkum. Idha thavara vittaa, entha Firebase user-um data paakka mudiyum.

- Applications-a browser neraa ezhudha mudiyaadhu — **server action** vazhiya thaan.
- `trainer-docs/` Storage path: anonymous applicant **upload mattum** panna mudiyum, padikka mudiyaadhu.
  Dashboard 1-hour **signed URL** generate panni thaan file kaatudhu.
- `phone_locks/{gymId}_{phone}` — Firestore-la unique index kidayaadhu, so oru lock document +
  transaction adha pannudhu. Oru number-la oru application mattum.
  Marubadiyum apply panna vendumna, owner andha lock document-a delete pannanum.

## Theme

"Iron Clan" — dark surfaces + neon lime accent, Barlow Condensed italic caps for headings,
Inter for body text. Ellaa colour-um [`src/app/globals.css`](src/app/globals.css)-la
tokens-a irundhu varudhu:

| Token | Value | Enge |
| --- | --- | --- |
| `--background` | `#0d0d0d` | page background |
| `--surface` | `#161616` | cards, inputs |
| `--surface-2` | `#1e1e1e` | table header, nested fields |
| `--line` | `#2b2b2b` | ellaa border-um |
| `--brand` | `#cfff00` | CTA, active chips, accents |
| `--brand-ink` | `#0d0d0d` | brand background mela varra text |

Re-skin panna andha 6 values-a mattum maathunaa podhum — components-la hardcoded colour illa.
`.display` (headings) and `.eyebrow` (small caps labels) — rendu utility class-um same file-la.

Ellaa page-um mobile + desktop rendukum responsive: trainer pages `max-w-2xl` centered,
dashboard `lg:` la table-a maarudhu, mobile-la cards-a irukkum.

## Enna innum baaki (Phase 1 finish panna)

- [ ] Hero-la **real gym photo** podanum — ippo `src/app/page.tsx`-la CSS gradient placeholder irukku.
- [ ] **Captcha** (Cloudflare Turnstile) `/apply`-la — unique index podhaadhu, bot-ku.
- [ ] **Email / WhatsApp notification** owner-ku, puthu application vandhaa
      (Cloud Function on `applications` create → Resend / WhatsApp API).
- [ ] Real phone-la test — 3G-la file upload, iOS Safari date picker.
- [ ] Vercel deploy + env vars.

## Phase 2 (feedback vandha appuram)

Data model already ready: owner signup flow + job post CRUD add pannaa podhum.
`gyms`, `job_posts`, `gym_id`, `job_post_id` ellaam already irukku — **rewrite thevaila**.

Dashboard-la name / phone / city search **in-memory**-a newest 500 rows mela thaan nadakudhu
(Firestore-la `ILIKE %x%` illa). Adhukku mela pona, Algolia / Typesense maadhiri search
index venum, illa `firestore.indexes.json`-la composite index serkkanum.
