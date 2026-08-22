# Stitch prompts — screen by screen

[stitch.withgoogle.com](https://stitch.withgoogle.com) · Google account-la login pannunga · **Web** mode.

Ovvoru screen-kum inga irukkardhu:

1. **Prompt** — theme block + screen prompt ottha paste pannunga (first message)
2. **Comments** — generate aana apparam, **onnu onnaa** anuppunga (order-la)
3. **Save as** — `Copy code` → andha file name-la `design/` folder-la save

> **Rule:** oru comment-la oru maatram mattum. Moonu vishayam ottha kettaa Stitch
> onna mattum pannitu meedhi marandhurum.

| # | Screen | Save as | Port aagum file |
| --- | --- | --- | --- |
| 1 | Landing | `01-landing.html` | `src/app/page.tsx` + `src/components/site-header.tsx` |
| 2 | Apply · Step 1 Unga vivaram | `02-apply-step1.html` | `src/app/apply/ApplyForm.tsx` + `src/components/form-fields.tsx` |
| 3 | Apply · Step 2 Experience | `03-apply-step2.html` | `src/app/apply/ApplyForm.tsx` |
| 4 | Apply · Step 3 Job preference | `04-apply-step3.html` | `src/app/apply/ApplyForm.tsx` |
| 5 | Apply · Step 4 Kadaisi step | `05-apply-step4.html` | `src/app/apply/ApplyForm.tsx` |
| 6 | Success | `06-success.html` | `src/app/apply/success/page.tsx` |
| 7 | Login | `07-login.html` | `src/app/login/LoginForm.tsx` |
| 8 | Dashboard list | `08-dashboard.html` | `src/app/dashboard/page.tsx` |
| 9 | Applicant detail | `09-applicant.html` | `src/app/dashboard/[id]/page.tsx` |

---

## THEME BLOCK

Ovvoru screen prompt-oda **munnadi** idha paste pannunga. Ovvoru thadavayum. Miss pannaadheenga.

```text
Design system (follow strictly, do not substitute):
- Background #0D0D0D. Card/panel surface #161616. Raised surface #1E1E1E.
- Borders and dividers: 1px solid #2B2B2B.
- Body text #FFFFFF. Secondary/helper text #9B9B9B.
- Single accent colour: neon lime #CFFF00. Text on lime is #0D0D0D.
- NO other colours. No purple, no blue, no gradients on buttons.
- Corners are SHARP — 0px border radius on every button, input, card and chip.
- No drop shadows. Depth comes from the 1px #2B2B2B borders only.
- Headings: Barlow Condensed, 700 weight, ITALIC, ALL CAPS, 0.92 line-height.
- Small section labels ("eyebrow"): Barlow Condensed 700 italic caps, lime #CFFF00,
  0.08em letter-spacing, about 13px.
- Body text and all form inputs: Inter, regular weight, sentence case.
- Dark, industrial, gym-poster feel. Dense and utilitarian, not airy or friendly.
- Responsive: must work at 375px mobile and 1280px desktop.
- Output Tailwind CSS classes in the HTML.
```

---

# 1 · Landing — `01-landing.html`

> `src/app/page.tsx` + `src/components/site-header.tsx`
> Idhu **already code-la apply pannirukku**. Fresh design venumna mattum ithu use pannunga.

### Prompt

```text
[paste theme block here]

Screen: the public landing page of a gym that is hiring trainers.

Header: a slim sticky top bar, 1px #2B2B2B bottom border, gym name "IRON WORKS GYM"
on the left in italic caps, and a small bordered ghost "APPLY" button on the right.

Hero section, full width, two columns on desktop and one column on mobile:
Left column has a lime eyebrow "CHENNAI · NOW RECRUITING", then a huge italic caps
headline "WE ARE HIRING" on one line and "GYM TRAINERS" on the next line in lime
#CFFF00, then a #9B9B9B paragraph of about three lines, then a large solid lime
"APPLY AS A TRAINER" button with a right arrow.
Right column is a tall 4:5 portrait image slab with a 1px #2B2B2B border and a dark
frosted caption bar pinned to its bottom edge containing the gym name as a lime
eyebrow, "BUILT FOR COACHES" as an italic caps heading, and a #9B9B9B line reading
"Full time · Part time · Freelance roles open."
Behind the whole hero, a diagonal lime stripe pattern at 12% opacity.

Specialties section: a lime eyebrow "SPECIALTIES NEEDED", then a wrapping row of
bordered chips with #9B9B9B uppercase text: Personal Training, Weight Training,
Strength & Conditioning, CrossFit, Cardio / HIIT, Yoga, Zumba / Aerobics,
Nutrition & Diet, Physiotherapy / Rehab, Sports Specific.
On mobile this row scrolls horizontally instead of wrapping.

How it works section: an italic caps heading "HOW IT WORKS", then three cards in a
row on desktop and stacked on mobile. Each card is #161616 with a 1px #2B2B2B border
and a 2px lime left border. Inside each card, a square 40px bordered box holding a thin
lime line icon, then a heading with a lime step number, then a #9B9B9B two-line body:
1. SUBMIT APPLICATION — document icon
2. PRACTICAL ASSESSMENT — dumbbell icon
3. JOIN THE CLAN — shield icon

Closing CTA: a wide #161616 panel with a 1px #2B2B2B border, centered content — an
italic caps heading "READY TO COACH WITH US?", a #9B9B9B line under it, and a solid
lime "START APPLICATION" button.

Footer: 1px #2B2B2B top border, gym name on the left, a small "GYM OWNER LOGIN" ghost
link on the right, both muted.
```

### Comments — order-la anuppunga

```text
Remove every border-radius. All buttons, chips, cards and the image slab must have sharp 0px corners.
```
```text
Make the "GYM TRAINERS" line lime #CFFF00 and keep "WE ARE HIRING" white. Both must be Barlow Condensed 700 italic uppercase with 0.92 line-height.
```
```text
The hero headline is too small. Make it about 72px on desktop and 48px on mobile.
```
```text
On mobile at 375px the specialties chip row must scroll horizontally in a single line, not wrap onto multiple lines.
```
```text
Give each "how it works" card a 2px lime #CFFF00 left border and keep the other three borders 1px #2B2B2B.
```
```text
Remove all box-shadows from the cards. Separation must come only from the 1px #2B2B2B borders.
```

---

# 2 · Apply · Step 1 "Unga vivaram" — `02-apply-step1.html`

> `src/app/apply/ApplyForm.tsx` (step 0) + `src/components/form-fields.tsx`
> **Muhkiyam:** step 1-la thaan ellaa input style-um decide aagum. Inga time
> pottu correct pannunga — meedhi steps easy.

### Prompt

```text
[paste theme block here]

Screen: step 1 of a 4-step gym trainer job application form. Single column,
max width 640px, centered.

Sticky top header: the gym name in italic caps on the left. Underneath it a row with
"STEP 1 / 4" in white on the left and "Unga vivaram" in #9B9B9B on the right, and
below that a 3px full-width track in #2B2B2B with the first 25% filled in lime #CFFF00.

Form fields, stacked vertically with about 20px gaps. Every field has a small
uppercase #9B9B9B label above the input, and optional #9B9B9B hint text under the label:
- Full name — text input, required
- Phone number — text input, hint "10 digit mobile number", required
- Email — text input, hint "Optional"
- Gender — a 3-option segmented control: Male, Female, Other
- Date of birth — date input
- City — text input, required
- Address — textarea, 3 rows
- Languages — a wrapping row of multi-select toggle chips:
  Tamil, English, Hindi, Telugu, Malayalam, Kannada

Input style: background #161616, 1px #2B2B2B border, 0px radius, white text at 16px,
#9B9B9B placeholder, about 12px vertical padding. On focus the border becomes lime
#CFFF00 with no glow and no outline.

Unselected chip: transparent background, 1px #2B2B2B border, #9B9B9B text, uppercase,
small. Selected chip: solid lime #CFFF00 background, #0D0D0D text, no border.

Segmented control: three equal-width bordered cells joined side by side sharing 1px
#2B2B2B borders. The active cell is solid lime with #0D0D0D text.

Show the "Phone number" field in its error state: 1px #F87171 border with a small
#F87171 message "10 digit mobile number podunga" under the input.

Bottom: a fixed full-width footer bar with a 1px #2B2B2B top border and a dark
frosted background, holding a single full-width solid lime "CONTINUE" button in
italic caps. There is no back button on step 1.
```

### Comments — order-la anuppunga

```text
Remove every border-radius. Inputs, chips, the segmented control and the button must all have sharp 0px corners.
```
```text
On focus, the input border must simply change to lime #CFFF00. Remove the focus glow, ring and outline completely.
```
```text
Make the field labels uppercase #9B9B9B at about 12px with 0.05em letter-spacing, sitting 8px above each input.
```
```text
The selected chip must be a solid lime #CFFF00 background with #0D0D0D text. The unselected chip must be transparent with a 1px #2B2B2B border and #9B9B9B text.
```
```text
The segmented control cells must share their borders so there is a single 1px #2B2B2B line between them, not a gap.
```
```text
Set every input font-size to 16px so mobile browsers do not zoom on focus.
```
```text
Make the bottom button bar fixed to the viewport bottom with a 1px #2B2B2B top border and a blurred #0D0D0D background at 95% opacity.
```

---

# 3 · Apply · Step 2 "Experience" — `03-apply-step2.html`

> `src/app/apply/ApplyForm.tsx` (step 1)

### Prompt

```text
[paste theme block here]

Screen: step 2 of the same 4-step gym trainer application form. Reuse the exact same
header, input, chip and footer styling from the previous screen.

Header progress: "STEP 2 / 4" on the left, "Experience" in #9B9B9B on the right,
progress track 50% filled in lime.

Fields:
- Years of experience — a number input, required, hint "0 to 60"
- Specializations — a required wrapping grid of multi-select toggle chips, and a small
  #9B9B9B counter on the right of the label reading "2 selected". Chips:
  Personal Training, Weight Training, Strength & Conditioning, CrossFit, Cardio / HIIT,
  Yoga, Zumba / Aerobics, Nutrition & Diet, Physiotherapy / Rehab, Sports Specific.
  Show "Weight Training" and "CrossFit" in the selected lime state.
- Certifications — another wrapping grid of multi-select toggle chips:
  ACE, ISSA, NASM, K11, ACSM, Diploma in Fitness, B.P.Ed / M.P.Ed, Other,
  No certification
- Previous gyms — a repeatable block. Each entry is a #161616 panel with a 1px #2B2B2B
  border containing a small "GYM 1" lime eyebrow with an X remove button on the far
  right, then four small inputs: Gym name and Role on one row, From and To on the next
  row. Show two such entries. Under them, a full-width bordered ghost button
  "+ ADD ANOTHER GYM" in italic caps, with a #9B9B9B note "Max 5" beside it.

Bottom footer bar: a bordered ghost "BACK" button on the left taking one third of the
width, and a solid lime "CONTINUE" button on the right taking two thirds.
```

### Comments — order-la anuppunga

```text
Remove every border-radius from the chips, inputs, panels and buttons.
```
```text
The specializations chip grid is too cramped. Use 8px gaps between chips and 10px vertical padding inside each chip.
```
```text
Put the "2 selected" counter on the same line as the SPECIALIZATIONS label, aligned to the right edge, in #9B9B9B at 12px.
```
```text
Each previous-gym entry must sit on a #161616 panel with a 1px #2B2B2B border and 16px padding, separated from the next by a 12px gap.
```
```text
The X remove button on a gym entry must be a plain #9B9B9B icon that turns #F87171 on hover. No background and no border.
```
```text
The "+ ADD ANOTHER GYM" button must be a full-width ghost button with a dashed 1px #2B2B2B border and #9B9B9B italic caps text.
```
```text
In the bottom bar, BACK must be a bordered ghost button at one third width and CONTINUE a solid lime button at two thirds width, with a 12px gap between them.
```

---

# 4 · Apply · Step 3 "Job preference" — `04-apply-step3.html`

> `src/app/apply/ApplyForm.tsx` (step 2)

### Prompt

```text
[paste theme block here]

Screen: step 3 of the same 4-step gym trainer application form. Reuse the exact same
header, input, chip, segmented control and footer styling from the previous screens.

Header progress: "STEP 3 / 4" on the left, "Job preference" in #9B9B9B on the right,
progress track 75% filled in lime.

Fields:
- Job type — a 3-option segmented control: Full time, Part time, Freelance
- Preferred shift — a 3-option segmented control: Morning, Evening, Both
- Expected salary — two number inputs side by side on one row, labelled "Minimum" and
  "Maximum", each with a #9B9B9B rupee prefix inside the left edge of the input, and a
  single #9B9B9B hint under the row reading "Per month · optional"
- Available from — a date input
- Willing to relocate — a full-width #161616 row with a 1px #2B2B2B border containing
  the label "Willing to relocate" in white on the left with a #9B9B9B sub-line
  "Vera city-la work panna thayaara?" under it, and a toggle switch on the right.
  The switch track is #2B2B2B when off and lime #CFFF00 when on, with a square
  #0D0D0D knob. Show it in the ON state.

Bottom footer bar: bordered ghost "BACK" on the left at one third width, solid lime
"CONTINUE" on the right at two thirds width.
```

### Comments — order-la anuppunga

```text
Remove every border-radius, including on the toggle switch — its track and knob must both be sharp rectangles.
```
```text
The two salary inputs must sit side by side on one row with a 12px gap, and must stack vertically at 375px.
```
```text
Put the rupee symbol inside the left edge of each salary input in #9B9B9B, with the typed number starting after it.
```
```text
The relocate row must be a full-width #161616 panel with a 1px #2B2B2B border and 16px padding, with the label block on the left and the toggle on the right.
```
```text
The toggle track must be lime #CFFF00 when on and #2B2B2B when off, and the knob must be a solid #0D0D0D square.
```
```text
Both segmented controls must look identical to the gender control from step 1 — three equal cells sharing 1px #2B2B2B borders, active cell solid lime with #0D0D0D text.
```

---

# 5 · Apply · Step 4 "Kadaisi step" — `05-apply-step4.html`

> `src/app/apply/ApplyForm.tsx` (step 3)
> Idhu thaan konjam complex screen — upload zones + consent + error banner.

### Prompt

```text
[paste theme block here]

Screen: step 4, the final step of the same 4-step gym trainer application form.
Reuse the exact same header, input, chip and footer styling from the previous screens.

Header progress: "STEP 4 / 4" on the left, "Kadaisi step" in #9B9B9B on the right,
progress track 100% filled in lime.

Fields:
- Short bio — a 4 row textarea with a #9B9B9B hint "Ungala patthi 2 line" under the
  label and a live "128 / 300" character counter in the bottom right corner of the
  textarea
- Photo — a file upload drop zone: a #161616 box with a 1px DASHED #2B2B2B border and
  about 32px padding, containing a lime upload icon, an italic caps "CHOOSE FILE" line
  and a #9B9B9B sub-line "Optional · max 5 MB"
- Resume (PDF) — the same drop zone style, sub-line "Optional · resume illaatiyum
  apply pannalaam". Show this one in the filled state instead: a #161616 row with a
  solid 1px #2B2B2B border containing a small file icon, the filename
  "ravi-resume.pdf" in white, "820 KB" in #9B9B9B, and an X remove button on the right
- Certificates — the same drop zone, sub-line "Optional · max 5 files", with two
  uploaded file rows listed underneath it
- Instagram link — text input, placeholder "https://instagram.com/..."
- YouTube link — text input, placeholder "https://youtube.com/..."
- Reference — text input, hint "Yaaravadhu reference irundha peru + number"

Then a consent block: a full-width #161616 card with a 1px #2B2B2B border and 16px
padding, containing a square 20px checkbox on the left and the consent sentence in
white beside it. The checkbox is unchecked and shows a 1px #2B2B2B border; when
checked it is a solid lime #CFFF00 square with a #0D0D0D tick. Show the checked state.

Under the consent block, an error banner: a full-width panel with a 1px #F87171 border
at 30% opacity, a #F87171 background at 10% opacity, and #FDA4AF text reading
"File romba periyasu — max 5 MB".

Bottom footer bar: bordered ghost "BACK" on the left at one third width, and a solid
lime "SUBMIT APPLICATION" button on the right at two thirds width in italic caps.
```

### Comments — order-la anuppunga

```text
Remove every border-radius, including on the checkbox, the upload zones and the file rows.
```
```text
The upload drop zone must have a 1px DASHED #2B2B2B border. The uploaded file rows below it must have a 1px SOLID #2B2B2B border.
```
```text
Put the character counter inside the bottom right corner of the bio textarea in #9B9B9B at 12px, overlapping the textarea rather than sitting below it.
```
```text
Each uploaded file row must show a file icon, the filename in white, the file size in #9B9B9B, and an X button on the far right that turns #F87171 on hover.
```
```text
The checked checkbox must be a solid lime #CFFF00 square with a #0D0D0D tick and no border. Unchecked is transparent with a 1px #2B2B2B border.
```
```text
The error banner must use a #F87171 border at 30% opacity, a #F87171 background at 10% opacity and #FDA4AF text. Do not use a solid red fill.
```
```text
The final button must read "SUBMIT APPLICATION" in italic caps on solid lime with #0D0D0D text.
```

---

# 6 · Success — `06-success.html`

> `src/app/apply/success/page.tsx`

### Prompt

```text
[paste theme block here]

Screen: an application-submitted confirmation page. Content centered both horizontally
and vertically, max width 560px, with generous vertical breathing room.

From top to bottom:
- A square 72px box with a 1px #2B2B2B border containing a large lime #CFFF00 outlined
  checkmark drawn with a thin stroke
- A large italic caps heading "APPLICATION SENT"
- A #9B9B9B paragraph of two lines saying the team reviews every application within
  2 to 3 working days and will call the applicant if shortlisted
- A #161616 panel with a 1px #2B2B2B border and a lime "REFERENCE" eyebrow label
  above a monospace application id "APP-2K5F9X" in white at about 20px
- A bordered ghost "BACK TO HOME" button in italic caps

Behind everything, a diagonal lime stripe pattern at 8% opacity.
Nothing else on the page. No header, no footer, no navigation.
```

### Comments — order-la anuppunga

```text
Remove every border-radius from the icon box, the reference panel and the button.
```
```text
The checkmark must be an outlined lime #CFFF00 stroke, not a filled lime circle.
```
```text
Increase the vertical spacing — about 24px between the icon and the heading, and about 40px above the reference panel.
```
```text
Show the reference id in a monospace font at about 20px in white, with the lime REFERENCE eyebrow label above it at 12px.
```
```text
Remove the header and footer. This page must have nothing except the centered block.
```

---

# 7 · Login — `07-login.html`

> `src/app/login/LoginForm.tsx`

### Prompt

```text
[paste theme block here]

Screen: a gym owner sign-in page. A single card, max width 400px, centered both
horizontally and vertically in the viewport.

The card sits on #161616 with a 1px #2B2B2B border and about 32px padding.
Inside, from top to bottom:
- A lime eyebrow "GYM OWNER"
- A large italic caps heading "SIGN IN"
- A #9B9B9B one-line subtitle "Applications-a paakka login pannunga"
- An email input with an uppercase #9B9B9B "EMAIL" label above it
- A password input with an uppercase #9B9B9B "PASSWORD" label above it and a small
  #9B9B9B eye icon inside the right edge to toggle visibility
- A full-width solid lime "SIGN IN" button in italic caps
- A small #9B9B9B helper line under the button

Also show the error state: a panel above the email input with a 1px #F87171 border at
30% opacity, a #F87171 background at 10% opacity and #FDA4AF text reading
"Email or password thappu".

Behind the card, a diagonal lime stripe pattern at 8% opacity on the #0D0D0D page
background.
```

### Comments — order-la anuppunga

```text
Remove every border-radius from the card, the inputs and the button.
```
```text
The card must be exactly 400px wide on desktop and full width minus 20px padding at 375px.
```
```text
Put the eye toggle icon inside the right edge of the password input in #9B9B9B, not outside the field.
```
```text
The error panel must use a #F87171 border at 30% opacity, a #F87171 background at 10% opacity and #FDA4AF text, sitting directly above the email field.
```
```text
Remove any "forgot password" and "create account" links — this form has neither.
```

---

# 8 · Dashboard list — `08-dashboard.html`

> `src/app/dashboard/page.tsx`

### Prompt

```text
[paste theme block here]

Screen: an admin dashboard listing trainer applications.

Top bar: the gym name in italic caps on the left, a bordered ghost "SIGN OUT" button
on the right, and a 1px #2B2B2B bottom border.

Stats row: five tiles in a grid, each a #161616 panel with a 1px #2B2B2B border
containing a big italic caps number at about 32px and a small uppercase #9B9B9B label
under it — Total 47, New 12, Shortlisted 8, Interview 3, Hired 5. The "New" tile has
an extra 2px lime #CFFF00 left border. At 375px these become a 2 column grid.

Filter bar: a search input on the left with a #9B9B9B magnifier icon inside its left
edge and the placeholder "Name or phone search pannunga", a specialization dropdown on
the right, and below them a horizontal row of status filter toggle chips: All, New,
Shortlisted, Interview, Hired, Rejected. The active chip is solid lime with #0D0D0D
text.

Desktop table with columns Name, Phone, City, Experience, Specializations, Applied on,
Status. The header row has uppercase #9B9B9B labels at 12px and a 1px #2B2B2B bottom
border. Each body row has a 1px #2B2B2B bottom border and turns #1E1E1E on hover.
The Name cell shows the full name in white with the email under it at 12px in #9B9B9B.
The Specializations cell shows two small bordered chips plus a "+3" overflow chip.
The Status cell shows a status pill. Show six sample rows with Indian names.

Status pill colours — these are the ONLY exceptions to the lime-only rule. Each pill is
a sharp cornered box with uppercase text at 11px and a 1px ring in its own colour at
30% opacity:
- New: #FFFFFF text on a white 5% background
- Shortlisted: #7DD3FC text on a sky blue 10% background
- Interview: #FCD34D text on an amber 10% background
- Hired: #CFFF00 text on a lime 15% background
- Rejected: #FDA4AF text on a rose 10% background

At 375px the table becomes a stack of #161616 cards, each with a 1px #2B2B2B border
showing the name and status pill on the top row, then phone, city and applied date as
#9B9B9B lines.

At the bottom, a pagination row with bordered ghost "PREV" and "NEXT" buttons and a
#9B9B9B label reading "SHOWING 1-20 OF 47".

Also show the empty state as a separate frame: a centered box with a 1px DASHED #2B2B2B
border containing an italic caps "NO APPLICATIONS YET" heading and a #9B9B9B line
under it.
```

### Comments — order-la anuppunga

```text
Remove every border-radius from the stat tiles, chips, status pills, inputs and buttons.
```
```text
Give the "New" stat tile a 2px lime #CFFF00 left border and keep its other three borders 1px #2B2B2B.
```
```text
The status pills must use these exact colours: New white on white 5%, Shortlisted #7DD3FC on sky 10%, Interview #FCD34D on amber 10%, Hired #CFFF00 on lime 15%, Rejected #FDA4AF on rose 10%. Each with a 1px ring of its own colour at 30% opacity.
```
```text
The table rows must be separated only by a 1px #2B2B2B bottom border. Remove any zebra striping and any row background fill.
```
```text
On row hover the background must become #1E1E1E with no border colour change.
```
```text
In the Name cell, put the full name in white on the first line and the email under it at 12px in #9B9B9B.
```
```text
At 375px the table must become stacked #161616 cards, one per applicant, not a horizontally scrolling table.
```
```text
The stats row must become a 2 column grid at 375px.
```

---

# 9 · Applicant detail — `09-applicant.html`

> `src/app/dashboard/[id]/page.tsx`

### Prompt

```text
[paste theme block here]

Screen: the detail page for one trainer applicant. Two column layout on desktop where
the left column is two thirds wide and the right column one third, stacking to a single
column at 375px with the right column moving to the top.

Above both columns: a bordered ghost "BACK TO APPLICATIONS" link with a left arrow,
then a header row containing a square 96px profile photo with a 1px #2B2B2B border,
the applicant name "RAVI KUMAR" as a large italic caps heading beside it, a #9B9B9B
line under the name reading "Chennai · 6 years experience", and a status pill pushed
to the far right.

Right column, sticky on desktop: a #161616 actions panel with a 1px #2B2B2B border
containing a lime "CHANGE STATUS" eyebrow, then five full-width status buttons stacked
vertically with 8px gaps — New, Shortlisted, Interview, Hired, Rejected — where
"Shortlisted" is the active one shown as solid lime with #0D0D0D text and the other
four are bordered ghosts with #9B9B9B text. Below that a solid lime
"CALL 98765 43210" button with a phone icon, then a bordered ghost "WHATSAPP" button.
Below the panel, a second #161616 panel with a lime "INTERNAL NOTES" eyebrow, a 4 row
textarea, and a bordered ghost "SAVE NOTE" button.

Left column: a vertical stack of #161616 detail sections, each with a 1px #2B2B2B
border, 20px padding and a lime eyebrow heading. Inside each section a two column
label and value grid where labels are uppercase #9B9B9B at 12px and values are white:
- PERSONAL: phone, email, gender, date of birth, address, and languages shown as
  bordered chips
- PROFESSIONAL: years of experience, then specializations as bordered chips, then
  certifications as bordered chips
- WORK HISTORY: a list of previous gyms, each row showing the gym name in white with
  the role and date range in #9B9B9B on the line below, rows separated by 1px #2B2B2B
  dividers
- PREFERENCES: job type, preferred shift, expected salary range, available from, and
  willing to relocate shown as Yes or No
- ABOUT: the bio paragraph in #9B9B9B, then Instagram and YouTube as lime links, then
  the reference contact
- DOCUMENTS: a 3 column grid of file tiles, each a square #1E1E1E box with a 1px
  #2B2B2B border containing a #9B9B9B file icon, the filename in white at 12px and a
  lime "VIEW" link
```

### Comments — order-la anuppunga

```text
Remove every border-radius from the photo, the panels, the chips, the status pills and all buttons.
```
```text
The right column must be sticky on desktop so the action panel stays visible while the left column scrolls.
```
```text
In the status button stack, only the active status is solid lime with #0D0D0D text. The other four must be bordered ghosts with a 1px #2B2B2B border and #9B9B9B text.
```
```text
Each detail section must be a #161616 panel with a 1px #2B2B2B border and 20px padding, separated from the next by a 16px gap.
```
```text
Inside the detail sections, labels must be uppercase #9B9B9B at 12px in the left column and values white in the right column, aligned to a two column grid.
```
```text
The work history rows must be separated by 1px #2B2B2B dividers with no card border around each individual row.
```
```text
At 375px the two columns must stack and the action panel must move above the detail sections.
```
```text
Make the profile photo a sharp 96px square with a 1px #2B2B2B border, not a circle.
```

---

## Comment ezhudhum bodhu — general rules

- **Oru message-la oru maatram.** Stitch multi-part request-a paadhiya thaan pannum.
- **Positive-a sollunga.** "don't use rounded corners" vida "all corners must be sharp
  0px" nalla work aagum.
- **Hex code kudunga**, colour peru vendaam. "dark grey" → `#161616`.
- **Element select panni comment pannunga** — canvas-la click panni select panneenga na
  andha element mattum maarum, matha design safe-a irukkum.
- Design romba thappa poidicha undo pannradhu vida, **puthu chat-la** theme block-oda
  fresh-a start pannunga. Adhu fast.

---

## Export panni enna panradhu

1. Stitch-la **Copy code** → HTML kidaikkum
2. Mela table-la kuduthirukra peru-la `design/` folder-la save pannunga
3. Enakku sollunga — naan `design/README.md` rules padi port panren:
   class names mattum eduppom, `{...register(...)}` / `action={...}` / `name="..."`
   thodamaatom, Tailwind v3 → v4 convert panni, colour-a `bg-brand` / `text-muted` /
   `border-line` tokens-a maathuvom

Ellaa screen-um ottha thadava mudikka vendaam. **Oru screen export panni enakku
kudunga, naan port panren, localhost-la paapom** — apparam next screen. Adhu safe.

> **Paste to Figma** option-um irukku — Figma-la further edit pannanumna adha use
> pannunga. Aana code port panna **Copy code** thaan venum.
