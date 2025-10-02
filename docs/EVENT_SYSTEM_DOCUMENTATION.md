# What's Poppin! - Event Discovery System Documentation

## Overview

Complete event discovery system with listing, search, filtering, creation, and detail views. Built with Next.js 14, React, TypeScript, and shadcn/ui components.

---

## Features Implemented

### 1. Event Listing Page (`/events`)
- **Grid view** of event cards (responsive: 1 col mobile, 2 cols tablet, 3 cols desktop)
- **Real-time search** with 500ms debouncing
- **Category filters** (Music, Food, Sports, Arts, Nightlife, Community, Education, Business, Outdoor)
- **Date filters** (Today, This Weekend, This Week, This Month)
- **Distance filters** (0.5mi, 1mi, 5mi, 10mi, 25mi) - requires user location
- **Sort options** (Date, Distance, Popularity)
- **Pagination** - Load more button (20 events per page)
- **Loading skeletons** during data fetch
- **Empty state** when no events found
- **Create Event button** for authenticated users

### 2. Event Card Component
- Event image or gradient placeholder
- Event title with category badge
- Venue name with distance indicator
- Formatted date/time (e.g., "Fri, Oct 4 at 7:00 PM")
- Price display (or "FREE")
- Save/bookmark button
- Clickable to navigate to detail page
- Hover effects and transitions

### 3. Event Detail Page (`/events/[id]`)
- Large hero image
- Full event information:
  - Title and category
  - Complete description
  - Date and time
  - Venue information
  - Price
  - Capacity (if specified)
  - Organizer details with avatar
- Action buttons:
  - RSVP
  - Save/Bookmark
  - Share (native share API)
  - Get Directions (Google Maps integration)

### 4. Event Creation Page (`/create-event`)
- Comprehensive form with validation:
  - **Required fields**: Title, Description, Venue, Start Time, Category
  - **Optional fields**: End Time, Tags, Image URL, Capacity, Price
- Category dropdown with all available categories
- Venue selector with inline creation capability
- Date/time pickers for start and end times
- Tags input (comma-separated)
- Image URL input
- Capacity and price inputs with validation
- Real-time form validation
- Error messages for invalid inputs
- Cancel and submit buttons
- Redirects to event detail after creation

### 5. Search Functionality
- **Debounced search** (500ms delay)
- **Full-text search** across event titles and descriptions
- **Search as you type** with loading states
- **Clear search** button
- Maintains scroll position

### 6. Filter System
- **Multiple category selection** (AND logic)
- **Date range filtering**
- **Distance-based filtering** (uses geolocation)
- **Combined filters** work together
- **Clear all filters** button
- Active filter indication

### 7. Geolocation Support
- Request browser geolocation permission
- Calculate distances to events
- Sort by proximity
- Cache location (30-minute expiry)
- Graceful fallback if permission denied
- Distance display in cards and filters

### 8. UI Components (shadcn/ui)
- Badge - Category badges
- Button - All interactive buttons
- Card - Event cards and containers
- Input - Text inputs
- Label - Form labels
- Select - Dropdown selects
- Textarea - Multi-line text input
- Skeleton - Loading placeholders
- Dialog - Modal dialogs
- Separator - Visual dividers
- Avatar - User/organizer avatars

---

## File Structure

```
src/
├── app/
│   ├── events/
│   │   ├── page.tsx                    # Event listing page
│   │   └── [id]/
│   │       └── page.tsx                # Event detail page
│   └── create-event/
│       └── page.tsx                    # Event creation page
├── components/
│   ├── events/
│   │   ├── CategoryBadge.tsx          # Category display badge
│   │   ├── EmptyState.tsx             # No events message
│   │   ├── EventCard.tsx              # Event card component
│   │   ├── EventFilters.tsx           # Filter panel
│   │   ├── EventGrid.tsx              # Grid layout
│   │   ├── EventSkeleton.tsx          # Loading skeleton
│   │   ├── SearchBar.tsx              # Search input
│   │   ├── VenueSelect.tsx            # Venue selector
│   │   └── index.ts                   # Barrel export
│   └── ui/                             # shadcn/ui components
│       ├── avatar.tsx
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── select.tsx
│       ├── separator.tsx
│       ├── skeleton.tsx
│       └── textarea.tsx
├── lib/
│   ├── database.ts                     # Database functions (existing)
│   ├── events.ts                       # Event service functions
│   ├── date-utils.ts                   # Date formatting utilities
│   └── geolocation.ts                  # Browser geolocation
└── types/
    └── database.types.ts               # TypeScript type definitions
```

---

## API Functions

### Event Service (`src/lib/events.ts`)

```typescript
// Get single event with full details
getEvent(id: string): Promise<EventWithDetails | null>

// List events with filters and pagination
listEvents(
  filters?: EventFilters,
  pagination?: PaginationParams
): Promise<PaginatedResponse<EventWithDetails>>

// Search events by query string
searchEvents(
  query: string,
  pagination?: PaginationParams
): Promise<PaginatedResponse<EventWithDetails>>

// Get nearby events based on user location
getNearbyEvents(
  lat: number,
  lon: number,
  radiusMiles?: number,
  limit?: number
): Promise<NearbyEvent[]>

// Create new event
createEvent(data: EventInsert): Promise<Event>

// Update existing event
updateEvent(id: string, data: EventUpdate): Promise<Event>

// Delete event
deleteEvent(id: string): Promise<void>

// Save/bookmark event for user
saveEvent(userId: string, eventId: string): Promise<void>

// RSVP to event
rsvpEvent(userId: string, eventId: string): Promise<void>

// Track event view
viewEvent(userId: string, eventId: string): Promise<void>

// Calculate distance to event
getEventDistance(
  userLat: number,
  userLon: number,
  event: EventWithDetails
): number | null

// Format distance for display
formatDistance(miles: number | null): string
```

### Date Utilities (`src/lib/date-utils.ts`)

```typescript
// Format event date to readable string
formatEventDate(date: string | Date): string
// Returns: "Fri, Oct 4"

// Format event time to readable string
formatEventTime(date: string | Date): string
// Returns: "7:00 PM"

// Format event date and time combined
formatEventDateTime(date: string | Date): string
// Returns: "Fri, Oct 4 at 7:00 PM"

// Get date range filter boundaries
getDateRangeFilter(range: 'today' | 'week' | 'weekend' | 'month'): {
  start: Date;
  end: Date;
}

// Check if event is upcoming
isEventUpcoming(event: { start_time: string }): boolean

// Check if event is today
isEventToday(event: { start_time: string }): boolean

// Get relative time description
getRelativeTime(date: string | Date): string
// Returns: "Today", "Tomorrow", "In 3 days", etc.

// Format price for display
formatPrice(price: number | null): string
// Returns: "FREE" or "$10.00"
```

### Geolocation Utilities (`src/lib/geolocation.ts`)

```typescript
// Get user's current location
getUserLocation(): Promise<UserLocation>

// Check if geolocation is available
isGeolocationAvailable(): boolean

// Get cached location from localStorage
getCachedLocation(): UserLocation | null

// Cache user location in localStorage
cacheLocation(location: UserLocation): void

// Get user location with caching (30 min expiry)
getLocationWithCache(forceRefresh?: boolean): Promise<UserLocation>
```

---

## Type Definitions

### Core Types

```typescript
interface Event {
  id: string;
  title: string;
  description: string | null;
  venue_id: string;
  organizer_id: string;
  start_time: string;
  end_time: string | null;
  category: string;
  tags: string[];
  image_url: string | null;
  capacity: number | null;
  price: number | null; // Price in cents
  status: 'draft' | 'published' | 'cancelled';
  view_count: number;
  created_at: string;
  updated_at: string;
}

interface EventWithDetails extends Event {
  venue: Venue | null;
  organizer: Profile | null;
}

interface Venue {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  location: GeographyPoint;
  created_at: string;
  updated_at: string;
}

interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  preferences: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

interface EventFilters {
  category?: string | string[];
  tags?: string[];
  min_price?: number;
  max_price?: number;
  start_date?: Date;
  end_date?: Date;
  status?: 'draft' | 'published' | 'cancelled';
}

interface PaginatedResponse<T> {
  data: T[];
  count: number;
  limit: number;
  offset: number;
  has_more: boolean;
}
```

---

## Usage Examples

### Listing Events with Filters

```typescript
import { listEvents } from '@/lib/events';
import { getDateRangeFilter } from '@/lib/date-utils';

// Get music events this week
const { start, end } = getDateRangeFilter('week');
const result = await listEvents(
  {
    category: 'music',
    start_date: start,
    end_date: end
  },
  { limit: 20, offset: 0 }
);
```

### Searching Events

```typescript
import { searchEvents } from '@/lib/events';

const result = await searchEvents('jazz concert', { limit: 20, offset: 0 });
```

### Getting Nearby Events

```typescript
import { getNearbyEvents } from '@/lib/events';
import { getLocationWithCache } from '@/lib/geolocation';

const location = await getLocationWithCache();
const events = await getNearbyEvents(
  location.lat,
  location.lon,
  5, // 5 mile radius
  20 // 20 results
);
```

### Creating an Event

```typescript
import { createEvent } from '@/lib/events';

const newEvent = await createEvent({
  title: 'Summer Music Festival',
  description: 'Annual outdoor music festival',
  venue_id: 'venue-uuid',
  organizer_id: 'user-uuid',
  start_time: '2025-07-15T18:00:00Z',
  end_time: '2025-07-15T23:00:00Z',
  category: 'music',
  tags: ['festival', 'outdoor', 'live-music'],
  image_url: 'https://example.com/festival.jpg',
  capacity: 5000,
  price: 2500, // $25.00 in cents
  status: 'published'
});
```

---

## Component Usage

### EventCard

```typescript
import { EventCard } from '@/components/events';

<EventCard
  event={event}
  distance={2.5}
  isSaved={false}
  onSave={(eventId) => console.log('Saved:', eventId)}
/>
```

### SearchBar

```typescript
import { SearchBar } from '@/components/events';

<SearchBar
  onSearch={(query) => console.log('Search:', query)}
  placeholder="Search events..."
  debounceMs={500}
/>
```

### EventFilters

```typescript
import { EventFilters } from '@/components/events';

const [filters, setFilters] = useState({
  categories: [],
  dateRange: null,
  distance: null,
  sortBy: 'date'
});

<EventFilters
  filters={filters}
  onChange={setFilters}
  hasLocation={true}
/>
```

### EventGrid

```typescript
import { EventGrid } from '@/components/events';

<EventGrid
  events={events}
  distances={distanceMap}
  savedEvents={savedSet}
  onSave={handleSave}
/>
```

---

## Testing Checklist

### Event Listing Page
- [ ] Page loads without errors
- [ ] Events display in grid layout
- [ ] Search input is visible and functional
- [ ] Filters sidebar appears on desktop
- [ ] Category badges are clickable
- [ ] Date range selector works
- [ ] Distance filter appears when location available
- [ ] Sort options change event order
- [ ] Load More button loads additional events
- [ ] Loading skeletons appear during fetch
- [ ] Empty state shows when no events
- [ ] Create Event button navigates to form

### Event Card
- [ ] Event image displays (or gradient fallback)
- [ ] Title truncates at 2 lines
- [ ] Category badge shows correct color
- [ ] Venue name displays
- [ ] Distance shows when available
- [ ] Date/time formatted correctly
- [ ] Price displays (or "FREE")
- [ ] Save button toggles state
- [ ] Card navigates to detail on click
- [ ] Hover effect works

### Event Detail Page
- [ ] Hero image displays
- [ ] All event information visible
- [ ] Description preserves line breaks
- [ ] Organizer info displays with avatar
- [ ] RSVP button works
- [ ] Save button toggles
- [ ] Share button triggers native share
- [ ] Get Directions opens Google Maps
- [ ] 404 state for invalid event ID

### Event Creation
- [ ] Form displays all fields
- [ ] Required field validation works
- [ ] Category dropdown populated
- [ ] Venue selector works
- [ ] Date/time pickers functional
- [ ] Tags input accepts comma-separated values
- [ ] Capacity validates positive numbers
- [ ] Price validates non-negative numbers
- [ ] Cancel button goes back
- [ ] Submit creates event
- [ ] Redirects to detail after creation
- [ ] Error messages display for invalid input

### Search & Filters
- [ ] Search debounces (500ms)
- [ ] Search results update
- [ ] Clear search button works
- [ ] Multiple categories can be selected
- [ ] Date range filters events
- [ ] Distance filter requires location
- [ ] Clear filters button resets all
- [ ] Combined filters work together

### Geolocation
- [ ] Browser prompts for location permission
- [ ] Distance displays in event cards
- [ ] Distance sort option appears
- [ ] Location cached for 30 minutes
- [ ] Graceful degradation if denied
- [ ] Distance formats correctly (ft/mi)

### Responsive Design
- [ ] Mobile: 1 column grid
- [ ] Tablet: 2 column grid
- [ ] Desktop: 3 column grid
- [ ] Filters collapse on mobile
- [ ] Cards stack properly
- [ ] Touch targets are adequate
- [ ] Text is readable on all devices

### Accessibility
- [ ] All buttons have labels
- [ ] Form inputs have labels
- [ ] ARIA attributes present
- [ ] Keyboard navigation works
- [ ] Focus visible on interactive elements
- [ ] Color contrast meets WCAG AA
- [ ] Screen reader friendly

---

## NASA Rule 10 Compliance

All functions in this system comply with NASA Rule 10:
- ✅ All functions ≤60 lines
- ✅ 2+ assertions per function
- ✅ No recursion
- ✅ Fixed loop bounds
- ✅ All non-void returns checked

---

## Environment Variables

Required environment variables:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

---

## Future Enhancements

Potential improvements for future versions:
- Map view for events
- Calendar view
- Social sharing analytics
- Event recommendations
- Waitlist for sold-out events
- Recurring events
- Multi-day events
- Event series/collections
- Advanced search filters
- Event check-in QR codes
- Live event updates
- Event comments/discussions
- Photo galleries
- Video previews

---

## Version Information

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-10-02 | coder@sonnet-4.5 | Initial event discovery system |

---

## Support

For issues or questions about the event system:
1. Check this documentation
2. Review component source code
3. Check TypeScript types in `src/types/database.types.ts`
4. Verify database functions in `src/lib/database.ts`
5. Test API endpoints manually

---

**End of Documentation**
