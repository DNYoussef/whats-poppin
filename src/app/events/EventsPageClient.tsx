// ============================================================================
// What's Poppin! - Event Listing Page Client Component
// File: events/EventsPageClient.tsx
// Description: Client component for event discovery with search and filters
// NASA Rule 10: All functions ≤60 lines
// ============================================================================

'use client';

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
 * Event listing page client component
 * @returns Event discovery page
 */
export function EventsPageClient() {
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
        const eventFilters: Record<string, unknown> = {};

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
  }, [searchQuery, filters, userLocation, offset, events]);

  useEffect(() => {
    setOffset(0);
  }, [searchQuery, filters]);

  useEffect(() => {
    fetchEvents();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, filters, userLocation, offset]);

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
