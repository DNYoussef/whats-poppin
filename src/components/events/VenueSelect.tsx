// ============================================================================
// What's Poppin! - Venue Select Component
// File: VenueSelect.tsx
// Description: Venue dropdown with inline creation
// NASA Rule 10: All functions ≤60 lines
// ============================================================================

'use client';

import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';

interface Venue {
  id: string;
  name: string;
  address: string;
}

interface VenueSelectProps {
  value: string;
  onChange: (venueId: string) => void;
  venues: Venue[];
  onCreateVenue?: (venue: Omit<Venue, 'id'>) => Promise<string>;
}

/**
 * Venue selector with inline creation
 * @param value - Selected venue ID
 * @param onChange - Change callback
 * @param venues - Available venues
 * @param onCreateVenue - Create venue callback
 * @returns Select component
 */
export function VenueSelect({
  value,
  onChange,
  venues,
  onCreateVenue
}: VenueSelectProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [newVenue, setNewVenue] = useState({ name: '', address: '' });
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!onCreateVenue) return;
    if (!newVenue.name || !newVenue.address) return;

    setIsCreating(true);
    try {
      const newId = await onCreateVenue(newVenue);
      onChange(newId);
      setShowDialog(false);
      setNewVenue({ name: '', address: '' });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select venue" />
        </SelectTrigger>
        <SelectContent>
          {venues.map((venue) => (
            <SelectItem key={venue.id} value={venue.id}>
              {venue.name}
            </SelectItem>
          ))}
          {onCreateVenue && (
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => setShowDialog(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create new venue
            </Button>
          )}
        </SelectContent>
      </Select>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Venue</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="venue-name">Venue Name</Label>
              <Input
                id="venue-name"
                value={newVenue.name}
                onChange={(e) =>
                  setNewVenue({ ...newVenue, name: e.target.value })
                }
                placeholder="Enter venue name"
              />
            </div>
            <div>
              <Label htmlFor="venue-address">Address</Label>
              <Input
                id="venue-address"
                value={newVenue.address}
                onChange={(e) =>
                  setNewVenue({ ...newVenue, address: e.target.value })
                }
                placeholder="Enter address"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create Venue'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* AGENT FOOTER BEGIN: DO NOT EDIT ABOVE THIS LINE */
// Version & Run Log
// | Version | Timestamp | Agent/Model | Change Summary | Status |
// |--------:|-----------|-------------|----------------|--------|
// | 1.0.0   | 2025-10-02T14:30:00 | coder@sonnet-4.5 | Venue select component | OK |
/* AGENT FOOTER END */
