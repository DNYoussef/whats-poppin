// ============================================================================
// What's Poppin! - Recommended Events Component
// File: src/components/recommendations/RecommendedEvents.tsx
// Description: Display personalized event recommendations
// NASA Rule 10: All functions ≤60 lines, 2+ assertions
// ============================================================================

'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Event {
  id: string;
  title: string;
  description: string;
  start_time: string;
  location: string;
  category: string;
  similarity_score?: number;
}

interface RecommendedEventsProps {
  userId: string;
  limit?: number;
}

export function RecommendedEvents({ userId, limit = 10 }: RecommendedEventsProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRecommendations = async (fresh = false) => {
    if (!userId) {
      setError('User ID is required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const url = `/api/recommendations?userId=${userId}&limit=${limit}&fresh=${fresh}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }

      const data = await response.json();

      if (!data.recommendations) {
        throw new Error('Invalid response format');
      }

      setEvents(data.recommendations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, [userId, limit]);

  if (loading) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Recommended for You</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
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

  if (error) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Recommended for You</h2>
        <div className="bg-red-50 border border-red-200 p-4 rounded">
          <p className="text-red-700">{error}</p>
          <Button onClick={() => loadRecommendations()} className="mt-2">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Recommended for You</h2>
        <p className="text-gray-600">No recommendations available yet.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Recommended for You</h2>
        <Button variant="outline" onClick={() => loadRecommendations(true)}>
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((event) => (
          <Card key={event.id} className="p-4 hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold mb-2">{event.title}</h3>
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
              {event.description}
            </p>
            <div className="text-sm text-gray-500">
              <p>{new Date(event.start_time).toLocaleDateString()}</p>
              <p>{event.location}</p>
              <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs mt-2">
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
// | 1.0.0   | 2025-10-02T00:00:00 | backend-dev@sonnet-4.5 | Recommended events component | OK |
/* AGENT FOOTER END */
