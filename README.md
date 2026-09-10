# Tilebook

Match history and Elo ratings for Taiwanese (16-tile) and Cantonese (13-tile) mahjong players.
Think of it as a poker-style player profile: every table you log feeds a rating, a record of the
stakes and venues you play, and head-to-head numbers against everyone you have sat with.

Proof of concept built with Next.js 16 (App Router), Supabase (Postgres + magic-link auth), Tailwind 4
and [anime.js v4](https://animejs.com) for every chart and counter.

## What it does

- **Magic-link sign in.** Players enter their email and get a one-time link. No passwords.
- **One player logs the whole table.** Enter all four seats by email. Anyone who has not signed up
  yet gets a placeholder profile and inherits their history when they join with that email.
- **Elo rating per player.** Each game is scored as six pairwise contests between the four seats
  (K = 32 spread over three opponents), computed atomically inside Postgres. Rating before and
  after is stored on every seat so the trend line is exact.
- **Dashboard.** Animated stat tiles (rating, games, table wins, net result per currency), rating
  trend line, finishing-position bars, stakes donut, venue bars, per-variant split and recent games.
- **Players.** Leaderboard, head-to-head records, and a "who to play with" list ranked by rating fit,
  shared stakes, shared venues and your record against them.
- **Public sample profile** at `/demo` so visitors can see the dashboard before signing up.

## Stakes model

Both variants are money games, so a game records `stake_base` (底) and `stake_unit`
(台 per tai for Taiwanese, 番 per faan for Cantonese) plus a currency. The dashboard groups games by
that `base/unit currency` label, e.g. `100/20 TWD` or `5/10 HKD`. Results are entered as each
player's net money for the session and must sum to zero.

## Local setup

1. **Create a Supabase project** at https://supabase.com (free tier is fine).
2. **Run the schema.** In the Supabase dashboard open *SQL Editor*, paste the contents of
   [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) and run it.
3. **Optional demo data.** Open [`supabase/seed.sql`](supabase/seed.sql), change `v_me` at the top to
   the email you will sign in with, and run it the same way. Eleven games across three venues land on
   your profile.
4. **Auth settings.** In *Authentication → URL Configuration* set *Site URL* to
   `http://localhost:3000` and add `http://localhost:3000/auth/callback` to *Redirect URLs*.
   Later add your Vercel URL and `https://<your-app>.vercel.app/auth/callback` too.
5. **Env vars.** Copy `.env.example` to `.env.local` and fill in the project URL and anon key from
   *Project Settings → API*. The server also accepts the names Vercel's Supabase integration sets
   (`SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`, and so on). If you gave the
   integration a prefix, set `SUPABASE_ENV_PREFIX` to that prefix. When nothing usable is found the
   landing page lists which variable names it saw, so you can tell what is missing.
6. Install and run:

   ```bash
   npm install
   npm run dev
   ```

   Open http://localhost:3000, enter your email, click the link in the message from Supabase.

### Magic-link notes

- Supabase's built-in mailer is rate limited on the free tier (a handful of emails per hour). For a
  real launch configure custom SMTP under *Authentication → SMTP Settings*.
- The default email template uses a PKCE code, which means the link must be opened in the same
  browser that requested it. To make links work from any device, edit the *Magic Link* template
  under *Authentication → Email Templates* to point at
  `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=magiclink`. The callback route
  supports both formats.

## Deploy to Vercel

1. Import the GitHub repo in Vercel.
2. Add the three environment variables from `.env.example`, with `NEXT_PUBLIC_SITE_URL` set to the
   production URL (for example `https://mahjong-rating.vercel.app`).
3. Add the production URL and its `/auth/callback` to Supabase's redirect allow-list (step 4 above).
4. Deploy.

## Project layout

```
supabase/migrations/0001_init.sql   schema, RLS policies, sign-up trigger, Elo function
supabase/seed.sql                   demo games
src/proxy.ts                        session refresh + route protection
src/app/auth/callback               magic-link landing route
src/app/(app)/                      signed-in pages: dashboard, history, log game, players, profile
src/app/actions/                    server actions (send magic link, log game, rename)
src/lib/data.ts                     queries and stat aggregation
src/components/charts/              anime.js visualisations
```

## Roadmap ideas

- Confirm-by-both-parties before a game counts toward ratings.
- Per-stake ratings (a 300/100 table is not a 50/10 table).
- Hand-level logging (self-draw vs discard, fan/tai counts) for richer stats.
- Groups / clubs with private leaderboards.
