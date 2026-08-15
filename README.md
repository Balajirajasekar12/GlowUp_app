# GlowUp — AI Style & Skin Analysis App

Next.js 16 + Tailwind + Supabase. Runs fully offline with mocked AI
responses out of the box, so you can build/test for free before wiring up
real AI models and paying for inference.

## 1. Run it locally

```bash
npm install
cp .env.example .env.local   # leave AI keys blank to stay in mock mode
npm run dev
```

Open http://localhost:3000 — visible only on your machine at this point.

## 2. Make it public (deploy)

`npm run dev` never becomes public on its own. Deploy to Vercel (free tier
for hobby projects) or your host of choice, setting the same env vars from
`.env.local` in the deployment dashboard. Once deployed, you get a public
URL — that's what makes it usable by real users.

## 3. Set up Supabase (free tier)

1. Create a free project at https://supabase.com
2. In the SQL Editor, run `supabase/schema.sql`
3. Copy your project URL/keys from Project Settings > API into `.env.local`
4. In Storage, create a `photos` bucket (private) and a `previews` bucket

## 4. Real AI models (analysis, style preview, outfit try-on)

`lib/ai.ts` runs in **mock mode** by default — free, no key, but returns
placeholder data. To use real models, sign up at https://replicate.com
(pay-per-call, no fixed cost) and set in `.env.local`:

```
REPLICATE_API_TOKEN=...
REPLICATE_VLM_VERSION=...          # a Qwen2.5-VL model, for photo analysis
REPLICATE_IMAGE_EDIT_VERSION=...   # a Qwen-Image-Edit model, for style preview
REPLICATE_TRYON_VERSION=...        # an IDM-VTON / OOTDiffusion model, for outfit try-on
```

Find the "version" hash for each on the model's page under
https://replicate.com/explore — click the model, then the "API" tab.

**Honesty note on realism**: outfit try-on and hairstyle/color changes
tend to look convincing with current open models. Fine-grained skin
texture editing is more hit-or-miss — don't oversell this in your UI copy.
Keep the "AI-simulated preview, not guaranteed" label visible; it's
already wired into every preview response.

### Outfit try-on needs real garment photos
Each outfit product in `lib/products.ts` has a `garmentImageUrl` field,
currently empty. Try-on models need a clean, front-facing photo of the
garment on a plain background (not a lifestyle/model photo). Add your own
product photography URLs there — the "Try it on" button will show a
reminder message until you do.

## 4b. Accounts, publishing, and rating (new)

The public gallery now actually works, not just a stub:

- `/login` — email+password sign up/sign in (Supabase Auth)
- Upload page — once signed in, a "Publish to public gallery" button
  uploads the photo to a public Supabase Storage bucket (`gallery`) and
  inserts a row in `photos` with `is_public = true`
- `/gallery` — queries real published photos, shows average rating, and
  lets other signed-in users rate 1–5 (blocked for your own photos, both
  in the UI and server-side in `app/api/ratings/route.ts`)
- Click any photo (upload preview, "after" preview, or gallery photo) to
  view it full-size in a lightbox — fixes the earlier cropped-thumbnail
  issue

This still only enforces **login**, not **age verification** — see
section 7 before treating this as production-ready.

## 5. Budget tiers

Products are grouped into three tiers via the `budget` field in
`lib/products.ts` (`"high" | "medium" | "low"`, labeled Splurge / Balanced
/ Smart Save in the UI). Add more products by giving each one a `budget`
and matching `tags` against the analysis output tags.

## 6. Product links

Seed links point to real, working Amazon search-results pages (not
guessed individual product pages, since I can't verify exact ASINs are
correct). Replace `affiliateUrl` in `lib/products.ts` with your own picked
products — ideally real Amazon Associates affiliate links once you've
signed up at https://affiliate-program.amazon.com.

## 7. Before enabling the public gallery

The gallery and "after" preview generation are meant to be gated behind
an 18+ / age-verification check — stubbed with a TODO in
`app/gallery/page.tsx`. Wire this to a real identity-verification
provider (Stripe Identity, Persona, Veriff) before allowing public photo
sharing and cross-user ratings.

## Design system

Built around a "vanity mirror" concept: ink (`#1B1B22`) and porcelain
(`#FBF7F2`) sections, brass (`#C9A227`) as the primary accent, rose
(`#E8927C`) and sage (`#8A9A8E`) marking budget tiers. Fraunces for
display type, Work Sans for body, IBM Plex Mono for prices/labels. The
row-of-dots "vanity lights" divider (`.vanity-lights` in
`app/globals.css`) is the signature recurring element — reuse it as
section breaks rather than introducing new decorative motifs.

## Project structure

```
app/
  page.tsx                 Home
  upload/page.tsx           Upload + analysis + budget-tiered recommendations + try-on
  gallery/page.tsx           Public gallery (18+ gated, TODO: query real data)
  feedback/page.tsx          Feedback form
  api/analyze/                Runs photo analysis + matches products
  api/generate-preview/       Runs style preview or outfit try-on generation
  api/feedback/                Stores feedback submissions
  api/ratings/                 Stores 1-5 ratings
lib/
  ai.ts                     AI integration layer (mock + Replicate real mode)
  products.ts                Seed product/affiliate data with budget tiers
  supabaseClient.ts            Supabase client + admin client
components/
  Navbar.tsx, ProductCard.tsx, RatingStars.tsx
supabase/
  schema.sql                 Database schema + Row Level Security policies
```
