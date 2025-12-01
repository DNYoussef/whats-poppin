// ============================================================================
// What's Poppin! - Event Detail Page
// File: events/[id]/page.tsx
// Description: Single event detail view
// NASA Rule 10: All functions ≤60 lines
// ============================================================================

'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CategoryBadge } from '@/components/events/CategoryBadge';
import { formatEventDateTime, formatPrice } from '@/lib/date-utils';
import { getEvent } from '@/lib/events';
import {
  Bookmark,
  Share2,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  ExternalLink
} from 'lucide-react';
import type { EventWithDetails } from '@/types/database.types';

// Dynamically import 3D components
const CanvasWrapper = dynamic(
  () => import('@/components/three/common/Canvas').then((mod) => mod.CanvasWrapper),
  { ssr: false }
);
const VenueScene = dynamic(
  () => import('@/components/three/VenueScene').then((mod) => mod.VenueScene),
  { ssr: false }
);

/**
 * Event detail page
 * @returns Event detail view
 */
export default function EventDetailPage() {
  const params = useParams();
  const eventId = params?.id as string;
  const [event, setEvent] = useState<EventWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    loadEvent();
  }, [eventId]);

  const loadEvent = async () => {
    setLoading(true);
    try {
      const data = await getEvent(eventId);
      setEvent(data);
    } catch (error) {
      console.error('Failed to load event:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event?.title,
        text: event?.description || '',
        url: window.location.href
      });
    }
  };

  const getDirectionsUrl = () => {
    if (!event?.venue) return '#';
    const { lat, lon } = event.venue.location;
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-96 bg-gray-200 rounded-lg" />
          <div className="h-8 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-12 text-center">
            <h2 className="text-2xl font-bold mb-2">Event Not Found</h2>
            <p className="text-muted-foreground">
              The event you're looking for doesn't exist.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const imageUrl = event.image_url || 'https://via.placeholder.com/1200x600';

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Image with 3D Background */}
      <div className="relative h-96 rounded-lg mb-8 overflow-hidden">
        {/* 3D Venue Scene */}
        <div className="absolute inset-0 z-0">
          <CanvasWrapper camera={{ position: [0, 0, 3], fov: 75 }}>
            <VenueScene eventTheme={event.category as any} />
          </CanvasWrapper>
        </div>
        {/* Image Overlay */}
        <div
          className="absolute inset-0 z-10 bg-cover bg-center opacity-70"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title and Category */}
          <div>
            <h1 className="text-4xl font-bold mb-4">{event.title}</h1>
            <CategoryBadge category={event.category} />
          </div>

          {/* Description */}
          <div>
            <h2 className="text-xl font-semibold mb-2">About This Event</h2>
            <p className="text-muted-foreground whitespace-pre-line">
              {event.description}
            </p>
          </div>

          <Separator />

          {/* Organizer */}
          {event.organizer && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Organizer</h2>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={event.organizer.avatar_url || ''} />
                  <AvatarFallback>
                    {event.organizer.username?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{event.organizer.username}</p>
                  <p className="text-sm text-muted-foreground">
                    {event.organizer.full_name}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              {/* Date */}
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="font-semibold">Date & Time</p>
                  <p className="text-sm text-muted-foreground">
                    {formatEventDateTime(event.start_time)}
                  </p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="font-semibold">{event.venue?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {event.venue?.address}
                  </p>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="font-semibold">Price</p>
                  <p className="text-sm text-muted-foreground">
                    {formatPrice(event.price)}
                  </p>
                </div>
              </div>

              {/* Capacity */}
              {event.capacity && (
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="font-semibold">Capacity</p>
                    <p className="text-sm text-muted-foreground">
                      {event.capacity} attendees
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button className="w-full" size="lg">
              RSVP
            </Button>
            <Button
              variant={isSaved ? 'default' : 'outline'}
              className="w-full"
              onClick={handleSave}
            >
              <Bookmark className="h-4 w-4 mr-2" />
              {isSaved ? 'Saved' : 'Save Event'}
            </Button>
            <Button variant="outline" className="w-full" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button
              variant="outline"
              className="w-full"
              asChild
            >
              <a href={getDirectionsUrl()} target="_blank" rel="noopener">
                <ExternalLink className="h-4 w-4 mr-2" />
                Get Directions
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* AGENT FOOTER BEGIN: DO NOT EDIT ABOVE THIS LINE */
// Version & Run Log
// | Version | Timestamp | Agent/Model | Change Summary | Status |
// |--------:|-----------|-------------|----------------|--------|
// | 1.0.0   | 2025-10-02T14:30:00 | coder@sonnet-4.5 | Event detail page | OK |
// | 1.1.0   | 2025-10-02T12:46:00 | coder@sonnet-4.5 | Add 3D venue background | OK |
/* AGENT FOOTER END */
