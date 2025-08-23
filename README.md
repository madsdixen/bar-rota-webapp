# Barvagt Planlægger (gratis hosting + gratis database)

En enkel webapp til håndtering af barvagter i teams (2 personer pr. team, 1 time pr. team).
Hostes gratis på **GitHub Pages**. Data gemmes på **Supabase Free Tier** (gratis plan uden auto-billing).

> **Hvorfor Supabase?** Free Tier er gratis uden automatisk opgradering/udgifter. Ved høj belastning bliver du throttlet i stedet for at få en regning. Dermed ingen skjulte omkostninger.

## Funktioner
- Tilføj/Slet team
- Redigér navne (2 personer pr. team)
- Drag-and-drop for at ændre rækkefølgen
- Data gemmes i Supabase

## Hurtig start (lokalt)
1. Installer Node 18+
2. `npm install`
3. Opret en gratis Supabase-projekt på https://supabase.com/ (Free Tier)
4. Kør SQL fra `supabase/schema.sql` og `supabase/policies.sql` i Supabase SQL editor.
5. Kopiér projektets **API URL** og **anon public key** fra Project Settings → API.
6. Opret en fil `.env.local` i projektroden med:
   ```env
   VITE_SUPABASE_URL=... 
   VITE_SUPABASE_ANON_KEY=...
   ```
7. `npm run dev` og åbn http://localhost:5173

## Deploy til GitHub Pages (gratis)
1. Opret et nyt **public** GitHub repo og commit/push hele projektmappen.
2. I repoet: **Settings → Pages**: vælg "Deploy from a branch" (vi bruger Actions).
3. Gå til **Settings → Secrets and variables → Actions → New repository secret** og tilføj:
   - `VITE_SUPABASE_URL` = din Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = din anon key
4. Ret evt. `vite.config.ts` hvis dit repo deployer på en underside. Tilføj fx:
   ```ts
   export default defineConfig({
     plugins: [react()],
     base: '/DIT_REPO_NAVN/'
   })
   ```
5. GitHub Action workflow (allerede inkluderet) bygger og deployer automatisk til Pages.
6. Find linket i **Actions** eller under **Settings → Pages** når workflow er grønt.

## Datamodel
```sql
create table public.teams (
  id uuid primary key default gen_random_uuid(),
  member1 text not null default '',
  member2 text not null default '',
  sort_order integer not null,
  updated_at timestamptz not null default now()
);
-- RLS: alle kan læse/indsætte/opdatere/slette
```

> Hvis du hellere vil køre uden Supabase, kan du i stedet bruge GitHub JSON API,
> men så kræver skrivning GitHub-login og et repo – se tidligere diskussion.

## Tilpasninger
- Tilføj evt. felt for dato/tids-slot hvis du vil koble rækkefølge til klokkeslæt.
- Tilføj simpel PIN-kode eller Supabase-Auth hvis du vil begrænse hvem der kan skrive.
- Skift UI-styling i `src/App.tsx` og `src/components/TeamCard.tsx`.

## Licens
MIT
