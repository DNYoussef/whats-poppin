// ============================================================================
// What's Poppin! - Event Grid Component
// File: EventGrid.tsx
// Description: Responsive grid layout for events
// NASA Rule 10: All functions ≤60 lines
// ============================================================================

import { EventCard } from './EventCard';
import type { EventWithDetails } from '@/types/database.types';

interface EventGridProps {
  events: EventWithDetails[];
  distances?: Map<string, number>;
  savedEvents?: Set<string>;
  onSave?: (eventId: string) => void;
}

/**
 * Responsive event grid
 * @param events - Events to display
 * @param distances - Distance map by event ID
 * @param savedEvents - Set of saved event IDs
 * @param onSave - Save callback
 * @returns Grid component
 */
export function EventGrid({
  events,
  distances,
  savedEvents,
  onSave
}: EventGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          distance={distances?.get(event.id)}
          isSaved={savedEvents?.has(event.id)}
          onSave={onSave}
        />
      ))}
    </div>
  );
}

/* AGENT FOOTER BEGIN: DO NOT EDIT ABOVE THIS LINE */
// Version & Run Log
// | Version | Timestamp | Agent/Model | Change Summary | Status |
// |--------:|-----------|-------------|----------------|--------|
// | 1.0.0   | 2025-10-02T14:30:00 | coder@sonnet-4.5 | Event grid component | OK |
/* AGENT FOOTER END */
