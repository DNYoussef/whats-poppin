// ============================================================================
// What's Poppin! - Event Filters Component
// File: EventFilters.tsx
// Description: Filter panel for categories, dates, and distance
// NASA Rule 10: All functions ≤60 lines
// ============================================================================

'use client';

// useState imported for future filter state management
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import type { DateRange } from '@/lib/date-utils';

export interface FilterState {
  categories: string[];
  dateRange: DateRange | null;
  distance: number | null;
  sortBy: 'date' | 'distance' | 'popularity';
}

interface EventFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  hasLocation: boolean;
}

const CATEGORIES = [
  'Music',
  'Food',
  'Sports',
  'Arts',
  'Nightlife',
  'Community',
  'Education',
  'Business',
  'Outdoor'
];

const DISTANCES = [
  { value: 0.5, label: '0.5 mi' },
  { value: 1, label: '1 mi' },
  { value: 5, label: '5 mi' },
  { value: 10, label: '10 mi' },
  { value: 25, label: '25 mi' }
];

/**
 * Event filter controls
 * @param filters - Current filter state
 * @param onChange - Filter change callback
 * @param hasLocation - Whether user location is available
 * @returns Filter component
 */
export function EventFilters({
  filters,
  onChange,
  hasLocation
}: EventFiltersProps) {
  const toggleCategory = (category: string) => {
    const categories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];
    onChange({ ...filters, categories });
  };

  const setDateRange = (value: string) => {
    const dateRange = value === 'all' ? null : (value as DateRange);
    onChange({ ...filters, dateRange });
  };

  const setDistance = (value: string) => {
    const distance = value === 'all' ? null : parseFloat(value);
    onChange({ ...filters, distance });
  };

  const setSortBy = (value: string) => {
    onChange({ ...filters, sortBy: value as FilterState['sortBy'] });
  };

  const clearFilters = () => {
    onChange({
      categories: [],
      dateRange: null,
      distance: null,
      sortBy: 'date'
    });
  };

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.dateRange !== null ||
    filters.distance !== null;

  return (
    <div className="space-y-4">
      {/* Categories */}
      <div>
        <h3 className="font-semibold mb-2">Categories</h3>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((category) => (
            <Badge
              key={category}
              variant={
                filters.categories.includes(category) ? 'default' : 'outline'
              }
              className="cursor-pointer"
              onClick={() => toggleCategory(category)}
            >
              {category}
            </Badge>
          ))}
        </div>
      </div>

      {/* Date Range */}
      <div>
        <h3 className="font-semibold mb-2">When</h3>
        <Select
          value={filters.dateRange || 'all'}
          onValueChange={setDateRange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Any time" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="weekend">This Weekend</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Distance */}
      {hasLocation && (
        <div>
          <h3 className="font-semibold mb-2">Distance</h3>
          <Select
            value={filters.distance?.toString() || 'all'}
            onValueChange={setDistance}
          >
            <SelectTrigger>
              <SelectValue placeholder="Any distance" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any distance</SelectItem>
              {DISTANCES.map((d) => (
                <SelectItem key={d.value} value={d.value.toString()}>
                  {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Sort */}
      <div>
        <h3 className="font-semibold mb-2">Sort by</h3>
        <Select value={filters.sortBy} onValueChange={setSortBy}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Date</SelectItem>
            {hasLocation && <SelectItem value="distance">Distance</SelectItem>}
            <SelectItem value="popularity">Popularity</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button variant="outline" onClick={clearFilters} className="w-full">
          <X className="h-4 w-4 mr-2" />
          Clear Filters
        </Button>
      )}
    </div>
  );
}

/* AGENT FOOTER BEGIN: DO NOT EDIT ABOVE THIS LINE */
// Version & Run Log
// | Version | Timestamp | Agent/Model | Change Summary | Status |
// |--------:|-----------|-------------|----------------|--------|
// | 1.0.0   | 2025-10-02T14:30:00 | coder@sonnet-4.5 | Event filters component | OK |
/* AGENT FOOTER END */
