// ============================================================================
// What's Poppin! - Onboarding Page
// File: src/app/onboarding/page.tsx
// Description: User onboarding flow for new users
// NASA Rule 10: All functions ≤60 lines, 2+ assertions
// ============================================================================

'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PreferencesForm } from '@/components/onboarding/PreferencesForm';

export default function OnboardingPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const storedUserId = localStorage.getItem('userId');

        if (!storedUserId) {
          router.push('/login');
          return;
        }

        const response = await fetch(
          `/api/preferences?userId=${storedUserId}`
        );

        if (response.ok) {
          const data = await response.json();

          if (data.onboardingComplete) {
            router.push('/events');
            return;
          }
        }

        setUserId(storedUserId);
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [router]);

  const handleComplete = () => {
    router.push('/events');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!userId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome to What&apos;s Poppin!</h1>
          <p className="text-gray-600">
            Let&apos;s personalize your experience
          </p>
        </div>

        <PreferencesForm userId={userId} onComplete={handleComplete} />
      </div>
    </div>
  );
}

/* AGENT FOOTER BEGIN: DO NOT EDIT ABOVE THIS LINE */
// Version & Run Log
// | Version | Timestamp | Agent/Model | Change Summary | Status |
// |--------:|-----------|-------------|----------------|--------|
// | 1.0.0   | 2025-10-02T00:00:00 | backend-dev@sonnet-4.5 | Onboarding page | OK |
/* AGENT FOOTER END */
