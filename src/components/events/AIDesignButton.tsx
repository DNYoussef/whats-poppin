// ============================================================================
// What's Poppin! - AI Design Button Component
// File: AIDesignButton.tsx
// Description: Trigger AI page design generation
// NASA Rule 10: All functions ≤60 lines
// ============================================================================

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

interface AIDesignButtonProps {
  eventId: string;
  variant?: 'default' | 'outline';
  className?: string;
}

/**
 * AI design generation trigger button
 * @param eventId - Event UUID
 * @param variant - Button variant
 * @param className - Additional CSS classes
 * @returns AI design button component
 */
export function AIDesignButton({
  eventId,
  variant = 'default',
  className = ''
}: AIDesignButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      router.push(`/events/${eventId}/design`);
    } catch (error) {
      console.error('Navigation error:', error);
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={loading}
      variant={variant}
      className={`gap-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 ${className}`}
    >
      <Sparkles className="h-4 w-4 text-purple-500" />
      {loading ? 'Launching AI Designer...' : 'Jazz It Up with AI'}
    </Button>
  );
}

/* AGENT FOOTER BEGIN: DO NOT EDIT ABOVE THIS LINE */
// Version & Run Log
// | Version | Timestamp | Agent/Model | Change Summary | Status |
// |--------:|-----------|-------------|----------------|--------|
// | 1.0.0   | 2025-10-02T16:20:00 | coder@sonnet-4.5 | AI design button | OK |
/* AGENT FOOTER END */
