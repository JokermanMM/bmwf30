# BMW F30 Project Website

A beautiful, interactive portfolio and roadmap for the BMW F30 project. Built with React, Vite, Framer Motion, and Supabase.

## Features
- 🏎️ **Premium Design**: Dark mode and M-Sport accents.
- 📸 **Gallery**: Interactive image lightbox.
- ✅ **Dynamic Roadmap**: Add goals, check them off, track completion dates.
- 🗄️ **Persistent Data**: Connected to Supabase to save your goals globally.

## Setup Instructions

### 1. Database Setup (Supabase)
To make your goals save permanently across all devices:
1. Go to [Supabase](https://supabase.com) and create a free account/project.
2. Go to the **SQL Editor** in your Supabase dashboard and run this command:
   ```sql
   create table goals (
     id uuid default gen_random_uuid() primary key,
     title text not null,
     completed boolean default false,
     completed_at timestamp with time zone,
     created_at timestamp with time zone default now()
   );
   ```
3. Go to **Project Settings -> API** to get your `URL` and `anon public` key.

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
