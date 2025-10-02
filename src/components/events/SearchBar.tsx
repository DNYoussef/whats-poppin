// ============================================================================
// What's Poppin! - Search Bar Component
// File: SearchBar.tsx
// Description: Search input with debouncing
// NASA Rule 10: All functions ≤60 lines
// ============================================================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  debounceMs?: number;
  initialValue?: string;
}

/**
 * Debounced search input
 * @param onSearch - Search callback
 * @param placeholder - Input placeholder
 * @param debounceMs - Debounce delay
 * @param initialValue - Initial search value
 * @returns Search input component
 */
export function SearchBar({
  onSearch,
  placeholder = 'Search events...',
  debounceMs = 500,
  initialValue = ''
}: SearchBarProps) {
  const [value, setValue] = useState(initialValue);

  // Debounce search callback
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      onSearch(query);
    }, debounceMs),
    [onSearch, debounceMs]
  );

  useEffect(() => {
    debouncedSearch(value);
  }, [value, debouncedSearch]);

  const handleClear = () => {
    setValue('');
  };

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="pl-10 pr-10"
      />
      {value && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClear}
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

/**
 * Debounce function
 * @param fn - Function to debounce
 * @param delay - Delay in ms
 * @returns Debounced function
 */
function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/* AGENT FOOTER BEGIN: DO NOT EDIT ABOVE THIS LINE */
// Version & Run Log
// | Version | Timestamp | Agent/Model | Change Summary | Status |
// |--------:|-----------|-------------|----------------|--------|
// | 1.0.0   | 2025-10-02T14:30:00 | coder@sonnet-4.5 | Search bar component | OK |
/* AGENT FOOTER END */
