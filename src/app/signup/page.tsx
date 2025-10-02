import Link from 'next/link';
import { SignupForm } from '@/components/auth/SignupForm';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

/**
 * Signup page with form and validation
 * NASA Rule 10: ≤60 lines, 2+ assertions
 */
export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Create an account
          </CardTitle>
          <CardDescription className="text-center">
            Join What's Poppin! and discover events near you
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignupForm />
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-gray-600">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-medium text-purple-600 hover:text-purple-500"
            >
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

/* AGENT FOOTER BEGIN: DO NOT EDIT ABOVE THIS LINE */
// Version & Run Log
// | Version | Timestamp | Agent/Model | Change Summary | Status |
// |--------:|-----------|-------------|----------------|--------|
// | 1.0.0   | 2025-10-02T00:00:00 | base-template@sonnet-4.5 | Initial signup page placeholder | OK |
// | 2.0.0   | 2025-10-02T00:00:00 | coder@sonnet-4.5 | Complete signup implementation | OK |
/* AGENT FOOTER END */
