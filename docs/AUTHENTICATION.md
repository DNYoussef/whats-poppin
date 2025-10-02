# Authentication System Documentation

## Overview

Complete authentication system for "What's Poppin!" using Supabase Auth with email/password authentication, session management, and protected routes.

## Architecture

### Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Authentication Flow                        │
└─────────────────────────────────────────────────────────────┘

1. SIGNUP FLOW
   User → /signup → SignupForm → signUp() → Supabase Auth
                                          ↓
                                    Create User
                                          ↓
                                    Create Profile
                                          ↓
                                    Auto-login
                                          ↓
                                    Redirect /events

2. LOGIN FLOW
   User → /login → LoginForm → signIn() → Supabase Auth
                                        ↓
                                   Create Session
                                        ↓
                                   Set Cookie
                                        ↓
                                   Redirect /events

3. PROTECTED ROUTES
   User → /events → Middleware → Check Session
                              ↓
                         Valid? → Allow Access
                              ↓
                        Invalid? → Redirect /login

4. LOGOUT FLOW
   User → Click Logout → signOut() → Supabase Auth
                                   ↓
                              Clear Session
                                   ↓
                              Clear Cookie
                                   ↓
                              Redirect /

5. PROFILE UPDATE
   User → /profile → Edit Form → updateProfile() → Supabase
                                                 ↓
                                            Update DB
                                                 ↓
                                          Show Success
```

## Files Created

### Core Authentication (`src/lib/auth.ts`)

**Functions:**
- `signUp(email, password, username, fullName)` - Register new user
- `signIn(email, password)` - Authenticate existing user
- `signOut()` - End user session
- `getSession()` - Retrieve current session
- `getUser()` - Get current user data
- `updateProfile(userId, updates)` - Update user profile
- `isUsernameAvailable(username)` - Check username uniqueness

**NASA Rule 10 Compliance:**
- All functions ≤60 lines
- 2+ assertions per function
- No recursion
- Proper error handling

### Middleware (`src/middleware.ts`)

**Protected Routes:**
- `/events/*` - Requires authentication
- `/profile/*` - Requires authentication
- `/create-event/*` - Requires authentication

**Auth Routes:**
- `/login` - Redirects to /events if authenticated
- `/signup` - Redirects to /events if authenticated

**Features:**
- Session refresh
- Automatic redirects
- Query parameter preservation (`redirectTo`)

### UI Components

#### Button (`src/components/ui/button.tsx`)
- Variants: default, destructive, outline, secondary, ghost, link
- Sizes: default, sm, lg, icon
- Fully accessible with focus states

#### Input (`src/components/ui/input.tsx`)
- Styled text inputs
- Support for all input types
- Disabled states
- Validation support

#### Label (`src/components/ui/label.tsx`)
- Form labels with proper accessibility
- Radix UI integration

#### Card (`src/components/ui/card.tsx`)
- CardHeader, CardTitle, CardDescription
- CardContent, CardFooter
- Responsive design

### Form Components

#### LoginForm (`src/components/auth/LoginForm.tsx`)

**Features:**
- Email validation
- Password validation
- Loading states
- Error display
- Redirect support

**Props:**
- `redirectTo?: string` - Post-login redirect URL

#### SignupForm (`src/components/auth/SignupForm.tsx`)

**Features:**
- Real-time password strength indicator
- Field validation
- Username availability (placeholder)
- Loading states
- Error display
- Auto-login after signup

**Password Requirements:**
- Minimum 8 characters
- One uppercase letter
- One lowercase letter
- One number

### Pages

#### Login Page (`src/app/login/page.tsx`)

**Features:**
- Centered card layout
- Gradient background
- Link to signup
- Query parameter support

**URL Parameters:**
- `redirectTo` - Where to redirect after login

#### Signup Page (`src/app/signup/page.tsx`)

**Features:**
- Centered card layout
- Gradient background
- Link to login
- Password strength indicator

#### Profile Page (`src/app/profile/page.tsx`)

**Features:**
- View user information
- Edit username and full name
- Email display (read-only)
- Success/error messages
- Loading states

### Layout Components

#### Header (`src/components/layout/Header.tsx`)

**Features:**
- Logo and branding
- Navigation links (Home, Events, Profile)
- User menu with username display
- Sign in/Sign up buttons (unauthenticated)
- Sign out button (authenticated)
- Responsive design

## Utilities (`src/lib/utils.ts`)

**Added Functions:**
- `isValidEmail(email)` - Validate email format using regex
- `validatePassword(password)` - Check password strength with detailed errors

## Usage Examples

### Sign Up a New User

```typescript
import { signUp } from '@/lib/auth';

try {
  const result = await signUp({
    email: 'user@example.com',
    password: 'SecurePass123',
    username: 'johndoe',
    fullName: 'John Doe',
  });
  console.log('User created:', result.user);
} catch (error) {
  console.error('Signup failed:', error.message);
}
```

### Sign In

```typescript
import { signIn } from '@/lib/auth';

try {
  const result = await signIn({
    email: 'user@example.com',
    password: 'SecurePass123',
  });
  console.log('Logged in:', result.user);
} catch (error) {
  console.error('Login failed:', error.message);
}
```

### Check Authentication Status

```typescript
import { getUser } from '@/lib/auth';

const user = await getUser();
if (user) {
  console.log('User is authenticated:', user.email);
} else {
  console.log('User is not authenticated');
}
```

### Update Profile

```typescript
import { updateProfile } from '@/lib/auth';

try {
  await updateProfile(userId, {
    username: 'newusername',
    full_name: 'New Name',
  });
  console.log('Profile updated');
} catch (error) {
  console.error('Update failed:', error.message);
}
```

### Sign Out

```typescript
import { signOut } from '@/lib/auth';

try {
  await signOut();
  console.log('Signed out successfully');
} catch (error) {
  console.error('Signout failed:', error.message);
}
```

## Testing Instructions

### Manual Testing Checklist

#### 1. Signup Flow
- [ ] Navigate to `/signup`
- [ ] Fill in all fields with valid data
- [ ] Verify password strength indicator updates
- [ ] Submit form
- [ ] Verify redirect to `/events`
- [ ] Verify user is logged in (check header)

#### 2. Login Flow
- [ ] Navigate to `/login`
- [ ] Enter valid credentials
- [ ] Submit form
- [ ] Verify redirect to `/events`
- [ ] Verify user is logged in

#### 3. Protected Routes
- [ ] Log out
- [ ] Try to access `/events` (should redirect to `/login`)
- [ ] Try to access `/profile` (should redirect to `/login`)
- [ ] Login and verify access is granted

#### 4. Profile Update
- [ ] Navigate to `/profile`
- [ ] Update username and full name
- [ ] Submit changes
- [ ] Verify success message
- [ ] Verify header shows new username

#### 5. Logout Flow
- [ ] Click "Sign out" in header
- [ ] Verify redirect to home page
- [ ] Verify header shows "Sign in" button
- [ ] Try to access `/events` (should redirect to `/login`)

#### 6. Form Validation
- [ ] Try to submit login form with empty fields
- [ ] Try to submit login form with invalid email
- [ ] Try to submit signup form with weak password
- [ ] Try to submit signup form with missing fields
- [ ] Verify all error messages display correctly

#### 7. Session Persistence
- [ ] Login to the app
- [ ] Refresh the page
- [ ] Verify user stays logged in
- [ ] Close and reopen browser
- [ ] Verify session persists (if cookies enabled)

### Error Scenarios to Test

1. **Invalid Credentials**
   - Try logging in with wrong password
   - Verify error message displays

2. **Duplicate Email**
   - Try signing up with existing email
   - Verify error message displays

3. **Network Errors**
   - Disconnect internet
   - Try to login/signup
   - Verify error handling

4. **Malformed Data**
   - Enter invalid email format
   - Enter password < 8 characters
   - Verify validation prevents submission

## Security Features

### Built-in Protection

1. **CSRF Protection** - Supabase handles CSRF tokens automatically
2. **XSS Prevention** - React escapes all rendered content by default
3. **SQL Injection** - Supabase client uses parameterized queries
4. **Session Security** - httpOnly cookies prevent XSS access

### Password Requirements

- Minimum 8 characters
- Must include uppercase letter
- Must include lowercase letter
- Must include number

### Validation

- Client-side validation for immediate feedback
- Server-side validation via Supabase Auth
- Email format validation
- Password strength validation

## Screenshots Needed for README

1. **Signup Page** - `/signup`
   - Full form with all fields
   - Password strength indicator visible

2. **Login Page** - `/login`
   - Clean, minimal form
   - Link to signup visible

3. **Profile Page** - `/profile`
   - User information displayed
   - Edit form visible

4. **Header (Authenticated)** - Any page when logged in
   - User menu showing username
   - Sign out button

5. **Header (Unauthenticated)** - Any page when logged out
   - Sign in and Sign up buttons

6. **Protected Route Redirect** - When accessing `/events` logged out
   - Shows redirect to login page

7. **Form Validation** - Login or signup with errors
   - Error messages displayed

## Troubleshooting

### Common Issues

**Issue:** "Failed to create user"
- **Solution:** Check Supabase project is set up correctly
- Verify environment variables are set
- Check Supabase Auth is enabled

**Issue:** "Session not persisting"
- **Solution:** Check cookies are enabled in browser
- Verify middleware is configured correctly
- Check NEXT_PUBLIC_SUPABASE_URL is correct

**Issue:** "Redirect loop on login"
- **Solution:** Check middleware matcher configuration
- Verify session is being created properly
- Clear browser cookies and try again

**Issue:** "Cannot update profile"
- **Solution:** Verify profiles table exists in Supabase
- Check RLS policies allow updates
- Verify user ID is correct

## Next Steps

### Recommended Enhancements

1. **Password Reset**
   - Add forgot password link
   - Implement password reset flow
   - Email verification

2. **Email Verification**
   - Send verification email on signup
   - Verify email before full access

3. **Social Auth**
   - Add Google OAuth
   - Add GitHub OAuth
   - Add other providers

4. **Two-Factor Authentication**
   - SMS verification
   - Authenticator app support

5. **Session Management**
   - View active sessions
   - Revoke sessions
   - Session timeout settings

6. **Profile Enhancements**
   - Avatar upload
   - Bio/description
   - Social links
   - Event preferences

7. **Security Enhancements**
   - Rate limiting on login attempts
   - Account lockout after failed attempts
   - Security audit log

## File Structure Summary

```
src/
├── lib/
│   ├── auth.ts                    # Core auth functions
│   └── utils.ts                   # Validation utilities
├── middleware.ts                  # Route protection
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx         # Login form component
│   │   └── SignupForm.tsx        # Signup form component
│   ├── layout/
│   │   └── Header.tsx            # App header with nav
│   └── ui/
│       ├── button.tsx            # Button component
│       ├── input.tsx             # Input component
│       ├── label.tsx             # Label component
│       └── card.tsx              # Card component
└── app/
    ├── login/
    │   └── page.tsx              # Login page
    ├── signup/
    │   └── page.tsx              # Signup page
    └── profile/
        └── page.tsx              # Profile page
```

## Dependencies Required

Ensure these are installed:

```json
{
  "dependencies": {
    "@supabase/auth-helpers-nextjs": "latest",
    "@supabase/supabase-js": "latest",
    "@radix-ui/react-label": "latest",
    "class-variance-authority": "latest",
    "clsx": "latest",
    "tailwind-merge": "latest"
  }
}
```

---

**Version Log:**
- v1.0.0 - Initial authentication implementation
- Complete email/password auth
- Session management
- Protected routes
- User profile management
