// ============================================================================
// What's Poppin! - Preferences Form Component
// File: src/components/onboarding/PreferencesForm.tsx
// Description: User onboarding form to capture preferences
// NASA Rule 10: All functions ≤60 lines, 2+ assertions
// ============================================================================

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const CATEGORIES = [
  'Music',
  'Sports',
  'Food & Drink',
  'Arts & Culture',
  'Nightlife',
  'Community',
  'Education',
  'Business',
  'Health & Wellness',
  'Technology',
];

interface PreferencesFormProps {
  userId: string;
  onComplete: () => void;
}

export function PreferencesForm({ userId, onComplete }: PreferencesFormProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [interests, setInterests] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleCategory = (category: string) => {
    if (!category) return;

    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedCategories.length === 0) {
      setError('Please select at least one category');
      return;
    }

    if (!interests.trim()) {
      setError('Please enter your interests');
      return;
    }

    const interestArray = interests
      .split(',')
      .map((i) => i.trim())
      .filter((i) => i.length > 0);

    if (interestArray.length === 0) {
      setError('Please enter valid interests');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          categories: selectedCategories,
          interests: interestArray,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save preferences');
      }

      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Tell Us About Your Interests</h2>
      <p className="text-gray-600 mb-6">
        Help us personalize your event recommendations
      </p>

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <Label className="text-lg font-semibold mb-3 block">
            What categories interest you? (Select at least one)
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => toggleCategory(category)}
                className={`p-3 rounded border-2 transition-colors ${
                  selectedCategories.includes(category)
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <Label htmlFor="interests" className="text-lg font-semibold mb-2 block">
            What are your specific interests?
          </Label>
          <Input
            id="interests"
            type="text"
            placeholder="e.g., jazz music, craft beer, hiking, photography"
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            className="w-full"
          />
          <p className="text-sm text-gray-500 mt-1">
            Separate interests with commas
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <Button
          type="submit"
          disabled={loading || selectedCategories.length === 0}
          className="w-full"
        >
          {loading ? 'Saving...' : 'Finish Setup'}
        </Button>
      </form>
    </Card>
  );
}

/* AGENT FOOTER BEGIN: DO NOT EDIT ABOVE THIS LINE */
// Version & Run Log
// | Version | Timestamp | Agent/Model | Change Summary | Status |
// |--------:|-----------|-------------|----------------|--------|
// | 1.0.0   | 2025-10-02T00:00:00 | backend-dev@sonnet-4.5 | Preferences form component | OK |
/* AGENT FOOTER END */
