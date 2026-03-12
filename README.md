# BMW F30 Project Website

A beautiful, interactive portfolio and roadmap for the BMW F30 project. Built with React, Vite, Framer Motion, and Supabase.

## Features
- 🏎️ **Premium Design**: Dark mode and M-Sport accents.
- 📸 **Gallery**: Interactive image lightbox.
- ✅ **Dynamic Roadmap**: Add goals, check them off, track completion dates.
- 🗄️ **Persistent Data**: Connected to Supabase to save your goals globally.

## Setup Instructions

### 1. Database Setup (Supabase)
To enable multi-user accounts and the global gallery:
1. Go to [Supabase](https://supabase.com) and create a free project.
2. In **Authentication -> Providers**, ensure Email is enabled. Turn OFF "Confirm email" if you just want instant logins for you and friends.
3. In **Storage**, create a new bucket named exactly `car-images` and set it to **Public**.
4. Go to the **SQL Editor** and run this command exactly as written:

   ```sql
   -- Create goals table with user ID
   create table goals (
     id uuid default gen_random_uuid() primary key,
     title text not null,
     completed boolean default false,
     completed_at timestamp with time zone,
     user_id uuid references auth.users not null,
     position integer default 0,
     created_at timestamp with time zone default now()
   );

   -- Create gallery table
   create table gallery (
     id uuid default gen_random_uuid() primary key,
     url text not null,
     user_id uuid references auth.users not null,
     created_at timestamp with time zone default now()
   );

   -- STORAGE FIX: Run this to instantly fix the upload permissions!
   insert into storage.buckets (id, name, public) 
   values ('car-images', 'car-images', true)
   on conflict (id) do update set public = true;

   drop policy if exists "Public Access" on storage.objects;
   create policy "Public Access" on storage.objects for select using ( bucket_id = 'car-images' );

   drop policy if exists "Auth Upload" on storage.objects;
   create policy "Auth Upload" on storage.objects for insert with check ( bucket_id = 'car-images' and auth.role() = 'authenticated' );

   drop policy if exists "Auth Delete" on storage.objects;
   create policy "Auth Delete" on storage.objects for delete using ( bucket_id = 'car-images' and auth.role() = 'authenticated' );
   ```

5. Go to **Project Settings -> API** to get your `URL` and `anon public` key.

### 2. Push to GitHub
If you haven't initialized Git yet:
```bash
git init
git add .
git commit -m "Initial commit from AI"
git branch -M main
git remote add origin https://github.com/JokermanMM/bmwf30.git
git push -u origin main
```
*(If the folder is already a git repo, just `git add .`, commit, and push)*.

### 3. Deploy on Render
1. Create a new **Static Site** on Render.
2. Connect your GitHub repository (`JokermanMM/bmwf30`).
3. Set the following settings:
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. **IMPORTANT**: Under **Environment Variables** in Render, add the ones from Supabase:
   - `VITE_SUPABASE_URL` = (Your Supabase Project URL)
   - `VITE_SUPABASE_ANON_KEY` = (Your Supabase Anon Key)
5. Click **Create Static Site**.
