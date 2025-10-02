// ============================================================================
// What's Poppin! - Empty State Component
// File: EmptyState.tsx
// Description: No events message
// NASA Rule 10: All functions ≤60 lines
// ============================================================================

import { CalendarX } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

/**
 * Empty state when no events found
 * @param title - Empty state title
 * @param description - Empty state description
 * @param actionLabel - Action button label
 * @param onAction - Action callback
 * @returns Empty state component
 */
export function EmptyState({
  title = 'No events found',
  description = 'Try adjusting your filters or search query',
  actionLabel,
  onAction
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <CalendarX className="h-16 w-16 text-muted-foreground mb-4" />
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground text-center mb-6 max-w-md">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
}

/* AGENT FOOTER BEGIN: DO NOT EDIT ABOVE THIS LINE */
// Version & Run Log
// | Version | Timestamp | Agent/Model | Change Summary | Status |
// |--------:|-----------|-------------|----------------|--------|
// | 1.0.0   | 2025-10-02T14:30:00 | coder@sonnet-4.5 | Empty state component | OK |
/* AGENT FOOTER END */
