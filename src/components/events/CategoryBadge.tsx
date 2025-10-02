// ============================================================================
// What's Poppin! - Category Badge Component
// File: CategoryBadge.tsx
// Description: Styled category display badge
// NASA Rule 10: All functions ≤60 lines
// ============================================================================

import { Badge } from '@/components/ui/badge';

const CATEGORY_COLORS: Record<string, string> = {
  music: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
  food: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
  sports: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  arts: 'bg-pink-100 text-pink-800 hover:bg-pink-200',
  nightlife: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200',
  community: 'bg-green-100 text-green-800 hover:bg-green-200',
  education: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
  business: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
  outdoor: 'bg-teal-100 text-teal-800 hover:bg-teal-200',
  other: 'bg-slate-100 text-slate-800 hover:bg-slate-200'
};

interface CategoryBadgeProps {
  category: string;
  className?: string;
}

/**
 * Display category badge with color coding
 * @param category - Category name
 * @param className - Additional CSS classes
 * @returns Styled badge component
 */
export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const normalized = category.toLowerCase();
  const colorClass = CATEGORY_COLORS[normalized] || CATEGORY_COLORS.other;

  return (
    <Badge className={`${colorClass} ${className || ''}`} variant="secondary">
      {category}
    </Badge>
  );
}

/* AGENT FOOTER BEGIN: DO NOT EDIT ABOVE THIS LINE */
// Version & Run Log
// | Version | Timestamp | Agent/Model | Change Summary | Status |
// |--------:|-----------|-------------|----------------|--------|
// | 1.0.0   | 2025-10-02T14:30:00 | coder@sonnet-4.5 | Category badge component | OK |
/* AGENT FOOTER END */
