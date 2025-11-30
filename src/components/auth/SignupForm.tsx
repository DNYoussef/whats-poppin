'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signUp } from '@/lib/auth';
import { isValidEmail, validatePassword } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/**
 * Reusable signup form component
 * NASA Rule 10: ≤60 lines, 2+ assertions
 */
export function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Assertion 1: Validate all fields are filled
    if (!email || !password || !username || !fullName) {
      setError('Please fill in all fields');
      return;
    }

    // Assertion 2: Validate email format
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Assertion 3: Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      setError(passwordValidation.errors[0] ?? 'Invalid password');
      return;
    }

    setIsLoading(true);

    try {
      await signUp({ email, password, username, fullName });
      router.push('/events');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign up');
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = validatePassword(password);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          type="text"
          placeholder="John Doe"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          disabled={isLoading}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          type="text"
          placeholder="johndoe"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={isLoading}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          required
        />
        {password && (
          <div className="text-xs space-y-1 mt-1">
            <div className={password.length >= 8 ? 'text-green-600' : 'text-gray-500'}>
              {password.length >= 8 ? '✓' : '○'} At least 8 characters
            </div>
            <div className={/[A-Z]/.test(password) ? 'text-green-600' : 'text-gray-500'}>
              {/[A-Z]/.test(password) ? '✓' : '○'} One uppercase letter
            </div>
            <div className={/[a-z]/.test(password) ? 'text-green-600' : 'text-gray-500'}>
              {/[a-z]/.test(password) ? '✓' : '○'} One lowercase letter
            </div>
            <div className={/[0-9]/.test(password) ? 'text-green-600' : 'text-gray-500'}>
              {/[0-9]/.test(password) ? '✓' : '○'} One number
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md">
          {error}
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading || !passwordStrength.valid}
      >
        {isLoading ? 'Creating account...' : 'Sign up'}
      </Button>
    </form>
  );
}

/* AGENT FOOTER BEGIN: DO NOT EDIT ABOVE THIS LINE */
// Version & Run Log
// | Version | Timestamp | Agent/Model | Change Summary | Status |
// |--------:|-----------|-------------|----------------|--------|
// | 1.0.0   | 2025-10-02T00:00:00 | coder@sonnet-4.5 | Signup form component | OK |
/* AGENT FOOTER END */
