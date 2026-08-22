# Firebase setup — step by step

Supabase-la `schema.sql` oru thadava run panna ellaam ready aayidum. Firestore-la
schema kidayaadhu — collections thaana urvaagum. Aana **rendu vishayam** kai-la
pannanum: gym document, apparam owner account.

---

## 1 · Project create pannunga

1. [console.firebase.google.com](https://console.firebase.google.com) → **Add project**
2. Google Analytics vendaam — skip pannunga
3. Left menu → **Build → Firestore Database** → **Create database** → *Production mode*
   → region `asia-south1` (Mumbai)
4. Left menu → **Build → Storage** → **Get started** → same region
5. Left menu → **Build → Authentication** → **Get started** → **Email/Password** enable

---

## 2 · Web app keys edunga

Project settings (⚙️) → **General** → scroll down → **Your apps** → `</>` (Web) icon →
app nickname kudunga → register.

`firebaseConfig` object kaattum. Adhula irundhu `.env.local`-ku:

| firebaseConfig field | .env.local key |
| --- | --- |
| `apiKey` | `NEXT_PUBLIC_FIREBASE_API_KEY` |
| `authDomain` | `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` |
| `projectId` | `NEXT_PUBLIC_FIREBASE_PROJECT_ID` |
| `storageBucket` | `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` |
| `messagingSenderId` | `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` |
| `appId` | `NEXT_PUBLIC_FIREBASE_APP_ID` |

---

## 3 · Service account key edunga

Project settings → **Service accounts** → **Generate new private key** → JSON download aagum.

Andha JSON-a ottha line-a `.env.local`-la podanum. Raw JSON-la `\n` escape Windows-la
kalanjidum, so **base64 pannunga** — code rendaiyum accept pannum:

```bash
node -e "console.log(require('fs').readFileSync(process.argv[1]).toString('base64'))" path/to/key.json
```

Output-a `FIREBASE_SERVICE_ACCOUNT_KEY=` kku aparam paste pannunga.

> ⚠️ Indha key ellaa rule-yum bypass pannum. `NEXT_PUBLIC_` prefix **podave koodaadhu**,
> git-la commit pannave koodaadhu. `.gitignore`-la `.env*` already irukku.

---

## 3b · Storage (optional)

Cloud Storage-ku **Blaze plan** (card) venum. Free tier 5 GB irukku, so realistic-a
paisa aagaadhu — aana billing account add pannanum.

**Venum na:** Build → Storage → Get started → Blaze upgrade → apparam `.env.local`-la:

```
NEXT_PUBLIC_UPLOADS_ENABLED=true
```

**Vendaam na:** `NEXT_PUBLIC_UPLOADS_ENABLED=false` (default) vidunga. Apply form-la
Photo / Resume / Certificates fields kaattaadhu, "send them over WhatsApp" nu oru note
mattum varum. Matha ellaam normal-a work aagum.

> ⚠️ **Bucket illama flag-a `true` pannaadheenga.** Firebase SDK illaadha bucket-ku
> upload panna fail-fast pannaadhu — retry panni panni submit button "Sending..."-la
> thongidum. `src/lib/upload.ts`-la 45 second timeout podirukken, aana adhu kadaisi
> pathukaappu thaan.

---

## 4 · Rules deploy pannunga

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules,firestore:indexes,storage
```

`firebase.json`-la indha folder-a point pannunga:

```json
{
  "firestore": {
    "rules": "firebase/firestore.rules",
    "indexes": "firebase/firestore.indexes.json"
  },
  "storage": { "rules": "firebase/storage.rules" }
}
```

CLI vendaamna — Console-la **Firestore → Rules** tab-la `firestore.rules`-oda content-a
paste panni Publish pannunga. Storage-kum adhe.

---

## 5 · Gym document create pannunga

Firestore Console → **Start collection** → collection id `gyms` → **Auto-ID** document:

| Field | Type | Value |
| --- | --- | --- |
| `name` | string | Unga gym peru |
| `city` | string | Chennai |
| `owner_uids` | array | *ippodhaikku kaaliya vidunga* |

Document ID-a copy panni `.env.local`-la `NEXT_PUBLIC_GYM_ID=` kku podunga.

---

## 6 · Owner account create pannunga

Authentication → **Users** → **Add user** → email + password kudunga.

Create aana apparam andha row-la **UID** kaattum. Adha copy panni, `gyms/{id}` document-oda
`owner_uids` array-la **serunga**.

> Indha step-a miss panneenga na, login aagum aana dashboard-la
> **"Ungalukku access illa"** nu kaattum. `owner_uids`-la UID illaadhadhu thaan
> karanam — `src/lib/firebase/owner.ts` andha check-a pannudhu.

---

## 7 · Restart

```bash
npm run dev
```

`.env.local` maathina apparam dev server-a **kandippa restart pannunga** — Next.js
env-a boot time-la thaan padikkum.

---

## Data model

```
gyms/{gymId}
  name, city, owner_uids: [uid]

job_posts/{postId}                      (optional — illaatiyum work aagum)
  gym_id, is_active, created_at

applications/{appId}
  gym_id, job_post_id, full_name, phone, email, city, city_lower,
  gender, dob, address, languages[], photo_path,
  experience_years, specializations[], certifications[], certificate_paths[],
  resume_path, previous_gyms[], job_type, preferred_shift,
  expected_salary_min, expected_salary_max, available_from, willing_to_relocate,
  bio, instagram_url, youtube_url, reference_contact,
  status, owner_notes, created_at, updated_at

  applications/{appId}/status_history/{id}
    from_status, to_status, changed_by, changed_at

phone_locks/{gymId}_{phone}             (unique index-ku badhilaa)
  gym_id, phone, application_id, created_at
```

### Postgres-la irundhu maarina vishayangal

| Postgres | Firestore-la |
| --- | --- |
| `UNIQUE (gym_id, phone)` | `phone_locks` document + transaction |
| Status change trigger | `dashboard/actions.ts`-la explicit write |
| Row level security | `firestore.rules` + `src/lib/firebase/owner.ts` |
| `CHECK` constraints | `lib/validation.ts` (zod) — DB level-la illa |
| `ILIKE '%x%'` search | Dashboard-la in-memory filter (newest 500 rows) |
