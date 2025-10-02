# 📸 Screenshot Guide - What's Poppin!

## Quick Setup for Screenshots (5 Minutes)

### Step 1: Configure Supabase (2 minutes)

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Name: `whats-poppin`
   - Database Password: (choose secure password)
   - Region: (closest to you)
   - Click "Create new project"
   - Wait ~2 minutes for provisioning

2. **Get API Credentials**
   - Go to Project Settings → API
   - Copy **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - Copy **anon public** key (long string starting with `eyJ...`)

3. **Update `.env.local`**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   OPENAI_API_KEY=sk-xxx  # Optional for now
   ```

### Step 2: Run Database Migrations (2 minutes)

1. **Open Supabase Dashboard** → SQL Editor
2. **Run Migration 1** - Copy/paste and run:
   `src/database/migrations/001_initial_schema.sql`
3. **Run Migration 2** - Copy/paste and run:
   `src/database/migrations/002_enable_rls.sql`
4. **Run Migration 3** - Copy/paste and run:
   `src/database/migrations/003_seed_data.sql`

### Step 3: Restart Server (1 minute)

```bash
# Stop current server (Ctrl+C)
# Start fresh
npm run dev
```

Server will be at: **http://localhost:3003**

---

## 📷 Screenshots to Capture

### 1. Landing Page (`/`)

**What to capture:**
- Full page showing:
  - "What's Poppin! 🎉" hero headline
  - Tagline: "Discover amazing local events..."
  - "Get Started" and "Sign In" buttons
  - Three feature cards (AI-Powered, Real-Time, Local First)

**Screenshot file:** `screenshots/01-landing-page.png`

**How to:**
```bash
# Open browser
http://localhost:3003/

# Take full-page screenshot
# Chrome: Ctrl+Shift+P → "Capture full size screenshot"
# Or use browser extension
```

---

### 2. Signup Page (`/signup`)

**What to capture:**
- Signup form showing:
  - Email input
  - Password input with strength indicator
  - Username input
  - Full Name input
  - "Create Account" button
  - "Already have an account?" link
  - **IMPORTANT**: Show password strength indicator with all checkmarks

**Screenshot file:** `screenshots/02-signup-page.png`

**How to:**
1. Navigate to `http://localhost:3003/signup`
2. Fill in form with sample data:
   - Email: `demo@example.com`
   - Password: `Demo1234!` (shows strong password)
   - Username: `demouser`
   - Full Name: `Demo User`
3. **Don't submit** - just show filled form
4. Take screenshot

---

### 3. Login Page (`/login`)

**What to capture:**
- Login form showing:
  - Email input
  - Password input
  - "Sign In" button
  - "Don't have an account?" link

**Screenshot file:** `screenshots/03-login-page.png`

**How to:**
1. Navigate to `http://localhost:3003/login`
2. Fill with sample data (don't submit)
3. Take screenshot

---

### 4. Events Listing Page (`/events`)

**What to capture:**
- Full events page showing:
  - Search bar at top
  - Category filter buttons (Music, Food, Sports, etc.)
  - Date filter dropdown
  - Distance filter
  - Sort options
  - Grid of event cards (should show 6-10 events from seed data)
  - "Create Event" button (if logged in)

**Screenshot files:**
- `screenshots/04a-events-listing-desktop.png` (desktop view)
- `screenshots/04b-events-listing-mobile.png` (mobile view, resize browser to 375px)

**How to:**
1. **First, create an account:**
   - Go to `/signup`
   - Fill form and submit
   - Should auto-redirect to `/events`

2. **Desktop screenshot:**
   - Full browser width
   - Capture entire page

3. **Mobile screenshot:**
   - Resize browser to 375px width
   - Capture page

---

### 5. Event Detail Page (`/events/[id]`)

**What to capture:**
- Event detail showing:
  - Large hero image/gradient
  - Event title and category badge
  - Date and time
  - Venue information
  - Full description
  - RSVP button
  - Save button
  - "Get Directions" button
  - "Similar Events" section at bottom

**Screenshot file:** `screenshots/05-event-detail.png`

**How to:**
1. From events listing, click any event card
2. Scroll to show full page
3. Take full-page screenshot

---

### 6. Event Creation Page (`/create-event`)

**What to capture:**
- Event creation form showing:
  - Title input
  - Description textarea
  - Venue select dropdown
  - Start date/time pickers
  - Category dropdown
  - Tags input
  - Image URL input
  - Price input (with "Free" option)
  - "Create Event" button

**Screenshot file:** `screenshots/06-create-event.png`

**How to:**
1. Navigate to `http://localhost:3003/create-event`
2. Fill form with sample data (don't submit)
3. Take screenshot

---

### 7. User Profile Page (`/profile`)

**What to capture:**
- Profile page showing:
  - User avatar (placeholder or uploaded)
  - Username display
  - Email display
  - Edit profile form
  - Save button

**Screenshot file:** `screenshots/07-profile-page.png`

**How to:**
1. Navigate to `http://localhost:3003/profile`
2. Take screenshot

---

### 8. Search Results

**What to capture:**
- Events page with active search:
  - Search bar with text "music" entered
  - Filtered results showing only music events
  - Event count (e.g., "Showing 8 events")

**Screenshot file:** `screenshots/08-search-results.png`

**How to:**
1. Go to `/events`
2. Type "music" in search bar
3. Wait 500ms for debounce
4. Take screenshot

---

### 9. Category Filter Active

**What to capture:**
- Events page with category filter:
  - Category badges with one selected (e.g., "Food & Drink")
  - Filtered results showing only food events
  - Selected badge highlighted/different color

**Screenshot file:** `screenshots/09-category-filter.png`

**How to:**
1. Go to `/events`
2. Click "Food & Drink" category badge
3. Wait for filtered results
4. Take screenshot

---

### 10. Mobile Navigation

**What to capture:**
- Header navigation on mobile:
  - Hamburger menu (if implemented)
  - User avatar/menu
  - Navigation links

**Screenshot file:** `screenshots/10-mobile-nav.png`

**How to:**
1. Resize browser to 375px width
2. Scroll to top
3. Take screenshot of header

---

### 11. Recommendations Section (Optional - requires AI setup)

**What to capture:**
- "Recommended for You" section:
  - Personalized event cards
  - "Based on your interests" text
  - Swipeable carousel (mobile)

**Screenshot file:** `screenshots/11-recommendations.png`

**Prerequisites:**
- OpenAI API key configured
- User has completed onboarding

**How to:**
1. Configure OpenAI API key in `.env.local`
2. Complete onboarding at `/onboarding`
3. Go to `/events`
4. Scroll to "Recommended for You" section
5. Take screenshot

---

### 12. Onboarding Flow (Optional)

**What to capture:**
- Onboarding preference selection:
  - Category checkboxes
  - Interests input
  - "Finish Setup" button

**Screenshot file:** `screenshots/12-onboarding.png`

**How to:**
1. Create new account
2. Should auto-redirect to `/onboarding`
3. Select some preferences (don't submit)
4. Take screenshot

---

## 📱 Mobile Screenshots Checklist

Resize browser to **375px width** and capture:
- ✅ Landing page (mobile)
- ✅ Events listing (mobile)
- ✅ Event detail (mobile)
- ✅ Navigation header (mobile)
- ✅ Search bar (mobile)
- ✅ Create event form (mobile)

---

## 🎨 Screenshot Best Practices

### Browser Settings
- **Resolution**: 1920x1080 (desktop), 375x667 (mobile)
- **Zoom**: 100%
- **Extensions**: Disable ad blockers, color changers

### Capture Tools
- **Chrome DevTools**: Ctrl+Shift+P → "Capture screenshot"
- **Firefox**: Right-click → "Take Screenshot"
- **Extension**: Fireshot, Awesome Screenshot

### Image Specs
- **Format**: PNG (best quality)
- **Max Size**: 2MB per image
- **Naming**: Descriptive (e.g., `04a-events-listing-desktop.png`)
- **Location**: `screenshots/` folder in project root

---

## 📝 README Integration

After capturing screenshots, update README.md:

```markdown
## 📸 Screenshots

### Landing Page
![Landing Page](screenshots/01-landing-page.png)

### Event Discovery
<table>
  <tr>
    <td><img src="screenshots/04a-events-listing-desktop.png" alt="Desktop View"/></td>
    <td><img src="screenshots/04b-events-listing-mobile.png" alt="Mobile View"/></td>
  </tr>
  <tr>
    <td align="center">Desktop View</td>
    <td align="center">Mobile View</td>
  </tr>
</table>

### Event Detail
![Event Detail](screenshots/05-event-detail.png)

### Search & Filters
![Search Results](screenshots/08-search-results.png)
![Category Filter](screenshots/09-category-filter.png)

### User Management
![Signup](screenshots/02-signup-page.png)
![Profile](screenshots/07-profile-page.png)
```

---

## ⏱️ Time Estimate

- **Supabase Setup**: 2 minutes
- **Database Migrations**: 2 minutes
- **Capturing 12 screenshots**: 10 minutes
- **README integration**: 2 minutes

**Total**: ~15 minutes

---

## 🆘 Troubleshooting

### Issue: Events page empty
**Solution**: Ensure migration 3 (seed data) was run successfully

### Issue: Auth errors
**Solution**:
1. Check `.env.local` credentials
2. Restart dev server
3. Clear browser cookies

### Issue: Can't create event
**Solution**:
1. Ensure you're logged in
2. Check database has venues (from seed data)
3. Check browser console for errors

### Issue: Recommendations not showing
**Solution**:
1. Add OpenAI API key to `.env.local`
2. Complete onboarding flow
3. Wait 30 seconds for initial recommendations

---

## ✅ Screenshot Checklist

Use this checklist while capturing:

- [ ] 1. Landing page (desktop)
- [ ] 2. Signup page with password strength
- [ ] 3. Login page
- [ ] 4a. Events listing (desktop)
- [ ] 4b. Events listing (mobile)
- [ ] 5. Event detail page
- [ ] 6. Event creation form
- [ ] 7. User profile page
- [ ] 8. Search results (active search)
- [ ] 9. Category filter (active filter)
- [ ] 10. Mobile navigation
- [ ] 11. Recommendations (optional - needs AI)
- [ ] 12. Onboarding flow (optional)

---

**After capturing all screenshots, create a GitHub issue or PR with the images, and I'll help integrate them into the README!**

---

*Need help? Check [OVERNIGHT-BUILD-SUMMARY.md](../OVERNIGHT-BUILD-SUMMARY.md) for full project documentation.*
