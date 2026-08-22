# Gym Trainer Hiring — Phase 1

Oru gym owner-ku trainers hire panradhukku oru site: trainers oru multi-step form fill pannuvaanga,
owner login panni applications-a paathu shortlist pannuvaanga.

Stack: Next.js 16 (App Router) · Tailwind v4 · Supabase (Postgres + Auth + Storage) · react-hook-form + zod

---

## Setup (order-a follow pannunga)

### 1. Supabase project

1. [supabase.com](https://supabase.com) → **New project**. Region: **Mumbai / Singapore**.
2. **SQL Editor** → [`supabase/schema.sql`](supabase/schema.sql) full-a paste panni **Run**.
   Idhu tables, indexes, triggers, RLS policies, `trainer-docs` storage bucket ellathaiyum create pannum.

### 2. Owner login create pannunga

**Authentication → Users → Add user** → email + password kudunga
(*Auto Confirm User* tick pannunga, illaana login aagadhu).

### 3. Gym row create pannunga

`supabase/schema.sql`-oda kadaisila irukra seed block-a uncomment panni, email + gym name-a
maathi **SQL Editor**-la run pannunga. Adhu oru `id` return pannum — adha copy pannunga.

Optional-a, oru job post-um serunga:

```sql
insert into public.job_posts (gym_id, title, job_type, shift, salary_min, salary_max)
values ('<gym-id>', 'Gym Trainer', 'full_time', 'both', 18000, 30000);
```

### 4. `.env.local` fill pannunga

Supabase → **Project Settings → API**-la irundhu:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
NEXT_PUBLIC_GYM_ID=<step 3-la vandha id>
NEXT_PUBLIC_GYM_NAME=Your Gym Name
NEXT_PUBLIC_GYM_CITY=Coimbatore
```

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

- `trainer_applications`-la **anon insert mattum** allowed, adhuvum `status = 'new'`-a irundha thaan.
  Anon-ku **select** kedaiyaadhu — apply panna aal innoruthar data-va paakave mudiyaadhu.
- Owner-ku thanoda gym-oda rows mattum theriyum (`my_gym_ids()` helper vazhiya RLS).
- `trainer-docs` bucket **private**. Dashboard 1-hour **signed URL** generate panni thaan file kaatudhu.
- `(gym_id, phone)` unique index — oru number-la oru application mattum. Double-submit / spam-a idhu thadukkum.
  Marubadiyum apply panna vendumna, owner andha row-a delete pannanum.

---

## Enna innum baaki (Phase 1 finish panna)

- [ ] **Stitch design** apply pannanum — `src/app/globals.css`-la `--brand` token + components-oda
      Tailwind classes-a maathunaa podhum. Logic ellaam thaniya irukku.
- [ ] **Captcha** (Cloudflare Turnstile) `/apply`-la — unique index podhaadhu, bot-ku.
- [ ] **Email / WhatsApp notification** owner-ku, puthu application vandhaa
      (Supabase Database Webhook → Resend / WhatsApp API).
- [ ] Real phone-la test — 3G-la file upload, iOS Safari date picker.
- [ ] Vercel deploy + env vars.

## Phase 2 (feedback vandha appuram)

Schema already ready: owner signup flow + job post CRUD add pannaa podhum.
`gyms`, `job_posts`, `gym_id`, `job_post_id` ellaam already irukku — **DB rewrite thevaila**.
