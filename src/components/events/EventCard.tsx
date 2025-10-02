// ============================================================================
// What's Poppin! - Event Card Component
// File: EventCard.tsx
// Description: Event card display with save and distance
// NASA Rule 10: All functions ≤60 lines
// ============================================================================

'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CategoryBadge } from './CategoryBadge';
import { formatEventDateTime, formatPrice } from '@/lib/date-utils';
import { formatDistance } from '@/lib/events';
import { Bookmark, MapPin } from 'lucide-react';
import type { EventWithDetails } from '@/types/database.types';

interface EventCardProps {
  event: EventWithDetails;
  distance?: number | null;
  onSave?: (eventId: string) => void;
  isSaved?: boolean;
}

/**
 * Event card component
 * @param event - Event data
 * @param distance - Distance in miles
 * @param onSave - Save callback
 * @param isSaved - Save state
 * @returns Card component
 */
export function EventCard({
  event,
  distance,
  onSave,
  isSaved = false
}: EventCardProps) {
  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onSave) onSave(event.id);
  };

  const imageUrl = event.image_url || generateGradient(event.id);

  return (
    <Link href={`/events/${event.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <div
          className="h-48 bg-gradient-to-br from-purple-400 to-pink-600"
          style={{ backgroundImage: `url(${imageUrl})`, backgroundSize: 'cover' }}
        />
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start gap-2">
            <div className="flex-1">
              <h3 className="font-semibold text-lg line-clamp-2">
                {event.title}
              </h3>
              <CategoryBadge category={event.category} className="mt-2" />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSave}
              className="flex-shrink-0"
            >
              <Bookmark
                className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`}
              />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-center text-muted-foreground">
              <MapPin className="h-4 w-4 mr-1" />
              <span className="truncate">{event.venue?.name}</span>
              {distance !== undefined && (
                <span className="ml-auto text-xs">
                  {formatDistance(distance)}
                </span>
              )}
            </div>
            <div className="text-muted-foreground">
              {formatEventDateTime(event.start_time)}
            </div>
            <div className="font-semibold text-primary">
              {formatPrice(event.price)}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

/**
 * Generate gradient background based on ID
 * @param id - Event ID
 * @returns Gradient CSS
 */
function generateGradient(id: string): string {
  const colors = [
    'from-purple-400 to-pink-600',
    'from-blue-400 to-cyan-600',
    'from-green-400 to-teal-600',
    'from-orange-400 to-red-600',
    'from-indigo-400 to-purple-600'
  ];
  const index = id.charCodeAt(0) % colors.length;
  return `linear-gradient(135deg, ${colors[index]})`;
}

/* AGENT FOOTER BEGIN: DO NOT EDIT ABOVE THIS LINE */
// Version & Run Log
// | Version | Timestamp | Agent/Model | Change Summary | Status |
// |--------:|-----------|-------------|----------------|--------|
// | 1.0.0   | 2025-10-02T14:30:00 | coder@sonnet-4.5 | Event card component | OK |
/* AGENT FOOTER END */
