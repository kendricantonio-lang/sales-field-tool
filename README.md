# Sales Field Tool

A PWA for logging store visit notes (auto-formatted into a checklist) and
managing a contacts/store database. Installable to your phone's home screen
via the browser — no App Store needed.

## Stack

- React + TypeScript + Vite
- Supabase (Postgres + Auth) for storage and sync across devices
- `vite-plugin-pwa` for the installable app manifest + offline service worker

## Editable fields, not hardcoded

The fields on the checklist and on a contact card both live in one file:
[src/config/fields.ts](src/config/fields.ts). Add, remove, rename, or reorder
an entry there and the form, the list view, and (for checklist fields) the
note parser all pick it up automatically — no other code changes needed.
Records are stored in Supabase as flexible JSON, so changing the field list
doesn't require a database migration.

## One-time setup

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free account/project (you'll need to do this yourself — sign-ups aren't something I can do on your behalf).
2. In the project dashboard, open **SQL Editor > New query**, paste the contents of [supabase/schema.sql](supabase/schema.sql), and run it. This creates the `contacts` and `visits` tables with row-level security so each user only sees their own data.
3. In **Project Settings > API**, copy the **Project URL** and the **anon public** key.

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` with the values from step 1.

### 3. Run locally

```bash
npm install
npm run dev
```

Sign up for an account on the login screen (this creates a row in Supabase's
own `auth.users` table — separate from your Supabase account login).

## Deploying

Push this repo to GitHub, then import it into [Vercel](https://vercel.com) or
[Netlify](https://netlify.com) (free Hobby tier). Set the same two env vars
(`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) in the host's project
settings. Build command `npm run build`, output directory `dist`.

## Installing on iOS

Open the deployed URL in Safari, tap the Share icon, then **Add to Home
Screen**. The app manifest and icons are already configured for this.

## Project structure

- `src/config/fields.ts` — field definitions for contacts and checklist (edit this to change fields)
- `src/lib/parseNote.ts` — best-effort text parsing that pre-fills checklist fields from a free-text note; always shown as an editable form before saving so you can correct anything it gets wrong
- `src/lib/db.ts` — Supabase read/write helpers
- `src/pages/NotesPage.tsx` — notes → checklist screen
- `src/pages/ContactsPage.tsx` — contacts CRUD screen
- `supabase/schema.sql` — database schema + row-level security policies
