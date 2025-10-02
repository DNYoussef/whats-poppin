# Authentication Setup Guide

## Installation Steps

### 1. Install Required Dependencies

```bash
npm install @supabase/auth-helpers-nextjs @supabase/supabase-js @radix-ui/react-label class-variance-authority clsx tailwind-merge
```

### 2. Configure Environment Variables

Create or update `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Get your Supabase credentials:**
1. Go to [supabase.com](https://supabase.com)
2. Create a new project or select existing
3. Go to Settings > API
4. Copy the Project URL and anon/public key

### 3. Set Up Supabase Database

Run this SQL in your Supabase SQL Editor:

```sql
-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create profiles table (if not exists)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signups
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_profiles_updated ON profiles;
CREATE TRIGGER on_profiles_updated
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
```

### 4. Configure Supabase Auth Settings

In your Supabase Dashboard:

1. Go to **Authentication > Settings**
2. Enable **Email** provider
3. Disable **Email Confirmations** for development (enable in production)
4. Set **Site URL** to `http://localhost:3000` for development
5. Add **Redirect URLs**:
   - `http://localhost:3000/auth/callback`
   - Your production URL when deployed

### 5. Update TypeScript Types

Create `src/types/supabase.ts`:

```typescript
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          full_name: string | null;
          avatar_url: string | null;
          preferences: Record<string, unknown> | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          full_name?: string | null;
          avatar_url?: string | null;
          preferences?: Record<string, unknown> | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          preferences?: Record<string, unknown> | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};
```

### 6. Update Root Layout (Optional)

To add the header globally, update `src/app/layout.tsx`:

```typescript
import { Header } from '@/components/layout/Header';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}
```

### 7. Configure Tailwind CSS

Ensure your `tailwind.config.ts` includes:

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

### 8. Add CSS Variables

Update `src/app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --primary: 262 83% 58%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 262 83% 58%;
  }
}
```

## Quick Start Commands

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# 3. Run development server
npm run dev

# 4. Open browser
# Navigate to http://localhost:3000
```

## Verify Installation

1. Navigate to `http://localhost:3000/signup`
2. Create a test account
3. Verify redirect to `/events`
4. Check that header shows username
5. Navigate to `/profile`
6. Update profile information
7. Sign out
8. Sign back in with same credentials

## Troubleshooting

### Issue: Module not found errors

**Solution:**
```bash
npm install
npm run build
```

### Issue: Supabase client errors

**Solution:**
- Verify `.env.local` has correct values
- Restart dev server after adding env variables
- Check Supabase project is active

### Issue: Database errors

**Solution:**
- Run the SQL setup script in Supabase SQL Editor
- Verify profiles table exists
- Check RLS policies are enabled

### Issue: Type errors

**Solution:**
- Ensure `src/types/supabase.ts` exists
- Run `npm run typecheck`
- Restart TypeScript server in editor

### Issue: Styling issues

**Solution:**
- Verify Tailwind config is correct
- Check CSS variables are defined
- Rebuild with `npm run build`

## Production Checklist

Before deploying to production:

- [ ] Enable email confirmations in Supabase Auth settings
- [ ] Set production Site URL in Supabase
- [ ] Add production redirect URLs
- [ ] Enable RLS policies on all tables
- [ ] Set up password strength requirements
- [ ] Configure rate limiting
- [ ] Add monitoring and error tracking
- [ ] Test all auth flows in production
- [ ] Set up backup/recovery procedures
- [ ] Document admin procedures

## Security Recommendations

1. **Enable Email Verification** - Prevent spam signups
2. **Configure Password Policy** - Enforce strong passwords
3. **Enable Rate Limiting** - Prevent brute force attacks
4. **Set Session Timeout** - Automatic logout after inactivity
5. **Monitor Auth Events** - Track suspicious activity
6. **Regular Security Audits** - Review auth logs
7. **Keep Dependencies Updated** - Apply security patches

## Support

For issues or questions:
- Check [Supabase Documentation](https://supabase.com/docs)
- Review [Next.js Auth Guide](https://nextjs.org/docs/authentication)
- Check project issues on GitHub

---

**Last Updated:** 2025-10-02
**Version:** 1.0.0
