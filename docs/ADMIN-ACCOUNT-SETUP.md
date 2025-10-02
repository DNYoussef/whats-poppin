# Admin Account Setup Guide

## Current Status
The application requires Supabase configuration to create real accounts. However, you can test the UI in two ways:

## Option 1: Mock Development Mode (Quick Testing)

For immediate testing without Supabase setup, use the development bypass:

### Test Credentials
- **Email**: `admin@whats-poppin.local`
- **Password**: `Admin123!`

**Note**: These credentials will work once I enable development mode bypass.

## Option 2: Full Supabase Setup (Production Ready)

### Step 1: Create Supabase Project
1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Create a new project
4. Wait for database to initialize (~2 minutes)

### Step 2: Get API Keys
1. In your Supabase project dashboard
2. Go to Settings → API
3. Copy the following:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Anon/Public Key**: `eyJhbGc...` (long string)

### Step 3: Configure Environment
Update `.env.local` with your keys:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
OPENAI_API_KEY=sk-...  # Optional for now
```

### Step 4: Run Database Migrations
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-id

# Run migrations
supabase db push
```

Or manually run the SQL files in Supabase SQL Editor:
1. `src/database/migrations/001_initial_schema.sql`
2. `src/database/migrations/002_enable_rls.sql`
3. `src/database/migrations/003_seed_data.sql`

### Step 5: Create Admin Account
Once Supabase is configured, sign up through the app at:
- http://localhost:3000/signup

**Recommended Admin Credentials**:
- **Email**: `admin@whats-poppin.local`
- **Password**: `Admin123!`
- **Username**: `admin`

## Pages Available to Test

Once logged in, you can explore:

1. **Landing Page** (`/`) - ✅ Working now with confetti particles
2. **Events Listing** (`/events`) - Browse all events
3. **Event Detail** (`/events/[id]`) - Individual event view with 3D venue
4. **Signup** (`/signup`) - Create new account
5. **Login** (`/login`) - Authenticate
6. **Profile** (`/profile`) - User settings (requires auth)
7. **Dashboard** (`/dashboard`) - User dashboard (requires auth)

## Troubleshooting

### Can't Sign Up
- Check Supabase project is created
- Verify API keys in `.env.local`
- Check browser console for errors
- Ensure Supabase Auth is enabled in project settings

### Migrations Failed
- Run SQL manually in Supabase SQL Editor
- Check for syntax errors
- Verify PostGIS and pgvector extensions are enabled

### Pages Not Loading
- Restart dev server: `npm run dev`
- Clear Next.js cache: `rm -rf .next`
- Check for TypeScript errors: `npm run typecheck`

## Next Steps

After account creation:
1. Explore event listings with sample data
2. Test event search and filters
3. Try saving events
4. Check AI recommendations (requires OpenAI key)
5. Test RSVP functionality

---

**Version**: 1.0.0
**Last Updated**: 2025-10-02
**Status**: Ready for testing
