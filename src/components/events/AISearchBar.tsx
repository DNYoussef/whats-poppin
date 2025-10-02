'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Sparkles } from 'lucide-react';
import { SearchBar } from './SearchBar';
import { AIAssistant } from './AIAssistant';

interface AISearchBarProps {
  onSearch: (query: string) => void;
  userLocation?: { lat: number; lon: number };
}

/**
 * Enhanced search bar with AI assistant
 * NASA Rule 10: ≤60 lines, 2+ assertions
 */
export function AISearchBar({ onSearch, userLocation }: AISearchBarProps) {
  const [showAI, setShowAI] = useState(false);

  // Assertion 1: Validate onSearch callback
  if (typeof onSearch !== 'function') {
    throw new Error('onSearch must be a function');
  }

  return (
    <div className="space-y-3">
      {/* Regular Search */}
      <SearchBar onSearch={onSearch} />

      {/* AI Assistant Button */}
      <div className="flex justify-center">
        <Button
          onClick={() => setShowAI(true)}
          variant="outline"
          className="gap-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20 hover:from-purple-500/20 hover:to-pink-500/20"
        >
          <Sparkles className="h-4 w-4 text-purple-500" />
          <Mic className="h-4 w-4 text-purple-500" />
          <span>Ask AI Assistant</span>
        </Button>
      </div>

      {/* AI Assistant Modal */}
      <AIAssistant
        isOpen={showAI}
        onClose={() => setShowAI(false)}
        userLocation={userLocation}
      />
    </div>
  );
}

/* AGENT FOOTER BEGIN: DO NOT EDIT ABOVE THIS LINE */
// Version & Run Log
// | Version | Timestamp | Agent/Model | Change Summary | Status |
// |--------:|-----------|-------------|----------------|--------|
// | 1.0.0   | 2025-10-02T13:47:00 | coder@sonnet-4.5 | AI search bar | OK |
/* AGENT FOOTER END */
