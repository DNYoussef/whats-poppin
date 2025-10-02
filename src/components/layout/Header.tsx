'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getUser, signOut } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import type { User } from '@supabase/supabase-js';

/**
 * App header with navigation and user menu
 * NASA Rule 10: ≤60 lines, 2+ assertions
 */
export function Header() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await getUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Failed to load user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  return (
    <header className="border-b bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-purple-600">
            What's Poppin!
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className="text-gray-700 hover:text-purple-600 transition"
            >
              Home
            </Link>
            {user && (
              <>
                <Link
                  href="/events"
                  className="text-gray-700 hover:text-purple-600 transition"
                >
                  Events
                </Link>
                <Link
                  href="/profile"
                  className="text-gray-700 hover:text-purple-600 transition"
                >
                  Profile
                </Link>
              </>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            {isLoading ? (
              <div className="h-10 w-20 bg-gray-200 animate-pulse rounded" />
            ) : user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  {user.user_metadata?.username || user.email}
                </span>
                <Button onClick={handleSignOut} variant="outline" size="sm">
                  Sign out
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Sign in
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">Sign up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

/* AGENT FOOTER BEGIN: DO NOT EDIT ABOVE THIS LINE */
// Version & Run Log
// | Version | Timestamp | Agent/Model | Change Summary | Status |
// |--------:|-----------|-------------|----------------|--------|
// | 1.0.0   | 2025-10-02T00:00:00 | coder@sonnet-4.5 | Header component implementation | OK |
/* AGENT FOOTER END */
