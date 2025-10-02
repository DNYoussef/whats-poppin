// ============================================================================
// What's Poppin! - Event Skeleton Component
// File: EventSkeleton.tsx
// Description: Loading placeholder for events
// NASA Rule 10: All functions ≤60 lines
// ============================================================================

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface EventSkeletonProps {
  count?: number;
}

/**
 * Loading skeleton for event cards
 * @param count - Number of skeletons to show
 * @returns Skeleton components
 */
export function EventSkeleton({ count = 6 }: EventSkeletonProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <Skeleton className="h-48 w-full" />
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start gap-2">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-5 w-20" />
              </div>
              <Skeleton className="h-9 w-9 rounded-full" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/* AGENT FOOTER BEGIN: DO NOT EDIT ABOVE THIS LINE */
// Version & Run Log
// | Version | Timestamp | Agent/Model | Change Summary | Status |
// |--------:|-----------|-------------|----------------|--------|
// | 1.0.0   | 2025-10-02T14:30:00 | coder@sonnet-4.5 | Event skeleton component | OK |
/* AGENT FOOTER END */
