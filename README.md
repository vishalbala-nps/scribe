# Scribe

A simple, fast notes app to capture ideas and stay organized — from any device. Sign in with email/password or Google, write notes that auto-save as you type, and star the ones that matter most.

**Live demo:** [mynotesapp-flax.vercel.app](https://mynotesapp-flax.vercel.app/)

## Tech Stack

- [Next.js 16](https://nextjs.org/) (App Router)
- [Supabase](https://supabase.com/) — Auth + Postgres database
- [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)

## Local Setup

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com/) project

### 1. Clone and install

```bash
git clone https://github.com/your-username/myNotesApp.git
cd myNotesApp
npm install
```

### 2. Set up environment variables

Copy the `.env.local` file to `.env` and fill in the Supabase URL and API Key 

You can find these in your Supabase project under **Settings → API**.

### 3. Apply the database schema

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

### 4. Configure Auth

In your Supabase project → **Authentication → URL Configuration**:

- Set **Site URL** to `http://localhost:3000`
- Add `http://localhost:3000/auth/callback` to **Redirect URLs**

To enable **Google OAuth**:
1. Create OAuth credentials in [Google Cloud Console](https://console.cloud.google.com/)
2. In Supabase → **Authentication → Providers → Google**, enter your Client ID and Secret

### 5. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment (Vercel)

1. Push the repo to GitHub
2. Import the project on [Vercel](https://vercel.com/)
3. Add the environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) under **Settings → Environment Variables**
4. Deploy

After the first deploy, update your Supabase Auth settings:

- **Site URL** → your Vercel URL (e.g. `https://your-app.vercel.app`)
- **Redirect URLs** → add `https://your-app.vercel.app/auth/callback`

## Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run lint       # Run ESLint
npm run typecheck  # Run TypeScript type checking
npm run format     # Format with Prettier
```
