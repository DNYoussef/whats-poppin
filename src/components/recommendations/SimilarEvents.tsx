// ============================================================================
// What's Poppin! - Similar Events Component
// File: src/components/recommendations/SimilarEvents.tsx
// Description: Display events similar to current event
// NASA Rule 10: All functions ≤60 lines, 2+ assertions
// ============================================================================

'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';

interface Event {
  id: string;
  title: string;
  description: string;
  start_time: string;
  location: string;
  category: string;
  similarity_score?: number;
}

interface SimilarEventsProps {
  eventId: string;
  limit?: number;
}

export function SimilarEvents({ eventId, limit = 4 }: SimilarEventsProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSimilarEvents() {
      if (!eventId) {
        setError('Event ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const url = `/api/events/${eventId}/similar?limit=${limit}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error('Failed to fetch similar events');
        }

        const data = await response.json();

        if (!data.similarEvents) {
          throw new Error('Invalid response format');
        }

        setEvents(data.similarEvents);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    loadSimilarEvents();
  }, [eventId, limit]);

  if (loading) {
    return (
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">You Might Also Like</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || events.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold mb-4">You Might Also Like</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {events.map((event) => (
          <Card key={event.id} className="p-4 hover:shadow-lg transition-shadow">
            <h4 className="text-lg font-semibold mb-2">{event.title}</h4>
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
              {event.description}
            </p>
            <div className="text-sm text-gray-500">
              <p>{new Date(event.start_time).toLocaleDateString()}</p>
              <p>{event.location}</p>
              <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-xs mt-2">
                {event.category}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* AGENT FOOTER BEGIN: DO NOT EDIT ABOVE THIS LINE */
// Version & Run Log
// | Version | Timestamp | Agent/Model | Change Summary | Status |
// |--------:|-----------|-------------|----------------|--------|
// | 1.0.0   | 2025-10-02T00:00:00 | backend-dev@sonnet-4.5 | Similar events component | OK |
/* AGENT FOOTER END */
