// ============================================================================
// What's Poppin! - Event Listing Page
// File: events/page.tsx
// Description: Main event discovery page with search and filters
// NASA Rule 10: All functions ≤60 lines
// ============================================================================

'use client';

// Force dynamic rendering to prevent SSG issues with client components
export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { AISearchBar } from '@/components/events/AISearchBar';
import { EventFilters, FilterState } from '@/components/events/EventFilters';
import { EventGrid } from '@/components/events/EventGrid';
import { EventSkeleton } from '@/components/events/EventSkeleton';
import { EmptyState } from '@/components/events/EmptyState';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { listEvents, searchEvents, getNearbyEvents } from '@/lib/events';
import { getDateRangeFilter } from '@/lib/date-utils';
import { getLocationWithCache, isGeolocationAvailable } from '@/lib/geolocation';
import type { EventWithDetails } from '@/types/database.types';

/**
 * Event listing page component
 * @returns Event discovery page
 */
export default function EventsPage() {
  const [events, setEvents] = useState<EventWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    dateRange: null,
    distance: null,
    sortBy: 'date'
  });
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);

  // Load user location on mount
  useEffect(() => {
    if (isGeolocationAvailable()) {
      getLocationWithCache()
        .then((loc) => setUserLocation({ lat: loc.lat, lon: loc.lon }))
        .catch(() => {});
    }
  }, []);

  // Fetch events when filters or search changes
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      let result;

      // Search mode
      if (searchQuery) {
        result = await searchEvents(searchQuery, { limit: 20, offset });
      }
      // Distance-based mode
      else if (userLocation && filters.distance) {
        const nearby = await getNearbyEvents(
          userLocation.lat,
          userLocation.lon,
          filters.distance,
          20
        );
        result = {
          data: nearby as unknown as EventWithDetails[],
          has_more: false
        };
      }
      // Filter mode
      else {
        const eventFilters: any = {};

        if (filters.categories.length > 0) {
          eventFilters.category = filters.categories;
        }

        if (filters.dateRange) {
          const { start, end } = getDateRangeFilter(filters.dateRange);
          eventFilters.start_date = start;
          eventFilters.end_date = end;
        }

        result = await listEvents(eventFilters, { limit: 20, offset });
      }

      setEvents(offset === 0 ? result.data : [...events, ...result.data]);
      setHasMore(result.has_more);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filters, userLocation, offset]);

  useEffect(() => {
    setOffset(0);
  }, [searchQuery, filters]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleLoadMore = () => {
    setOffset(offset + 20);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Discover Events</h1>
        <Link href="/create-event">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        </Link>
      </div>

      {/* AI-Powered Search Bar */}
      <div className="mb-6">
        <AISearchBar onSearch={setSearchQuery} userLocation={userLocation || undefined} />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:col-span-1">
          <EventFilters
            filters={filters}
            onChange={setFilters}
            hasLocation={userLocation !== null}
          />
        </aside>

        {/* Event Grid */}
        <main className="lg:col-span-3">
          {loading && offset === 0 ? (
            <EventSkeleton count={6} />
          ) : events.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <EventGrid events={events} />
              {hasMore && (
                <div className="mt-8 text-center">
                  <Button
                    onClick={handleLoadMore}
                    disabled={loading}
                    variant="outline"
                  >
                    {loading ? 'Loading...' : 'Load More'}
                  </Button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

/* AGENT FOOTER BEGIN: DO NOT EDIT ABOVE THIS LINE */
// Version & Run Log
// | Version | Timestamp | Agent/Model | Change Summary | Status |
// |--------:|-----------|-------------|----------------|--------|
// | 1.0.0   | 2025-10-02T00:00:00 | base-template@sonnet-4.5 | Initial events page placeholder | OK |
// | 2.0.0   | 2025-10-02T14:30:00 | coder@sonnet-4.5 | Event listing page with search and filters | OK |
// | 2.1.0   | 2025-10-02T13:52:00 | coder@sonnet-4.5 | Integrate AI search assistant | OK |
/* AGENT FOOTER END */
