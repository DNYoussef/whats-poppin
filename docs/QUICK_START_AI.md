# Quick Start Guide - AI Recommendations System

## Setup (5 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create `.env.local`:
```env
OPENAI_API_KEY=sk-proj-your-key-here
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
CRON_SECRET=your-secret-token
```

### 3. Run Database Migrations
Execute SQL in Supabase SQL Editor:
```sql
-- Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column
ALTER TABLE events ADD COLUMN embedding vector(1536);

-- Create index
CREATE INDEX events_embedding_idx ON events
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Create tables (see docs/AI_RECOMMENDATIONS_SYSTEM.md)
```

### 4. Start Development Server
```bash
npm run dev
```

## Usage Examples

### Generate Event Embedding
```bash
curl -X POST http://localhost:3000/api/embeddings/generate \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "abc123",
    "title": "Jazz Night",
    "description": "Live jazz performance",
    "category": "Music"
  }'
```

### Get Recommendations
```bash
curl "http://localhost:3000/api/recommendations?userId=user123&limit=10"
```

### Track Interaction
```bash
curl -X POST http://localhost:3000/api/interactions \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "eventId": "event456",
    "type": "saved"
  }'
```

### Save User Preferences
```bash
curl -X POST http://localhost:3000/api/preferences \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "categories": ["Music", "Food & Drink"],
    "interests": ["jazz", "craft beer"]
  }'
```

## React Component Integration

### Display Recommendations
```tsx
import { RecommendedEvents } from '@/components/recommendations/RecommendedEvents';

export default function EventsPage() {
  const userId = 'user123'; // Get from auth

  return (
    <div>
      <RecommendedEvents userId={userId} limit={10} />
    </div>
  );
}
```

### Show Similar Events
```tsx
import { SimilarEvents } from '@/components/recommendations/SimilarEvents';

export default function EventDetailPage({ params }: { params: { id: string } }) {
  return (
    <div>
      {/* Event details */}
      <SimilarEvents eventId={params.id} limit={4} />
    </div>
  );
}
```

### Onboarding Flow
```tsx
import { PreferencesForm } from '@/components/onboarding/PreferencesForm';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const router = useRouter();
  const userId = 'user123'; // Get from auth

  return (
    <PreferencesForm
      userId={userId}
      onComplete={() => router.push('/events')}
    />
  );
}
```

## Testing

### Run Tests
```bash
npm test
```

### Run with Coverage
```bash
npm run test:ci
```

## Deployment

### 1. Deploy to Vercel
```bash
vercel --prod
```

### 2. Configure Environment Variables
Add in Vercel dashboard:
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `CRON_SECRET`

### 3. Verify Cron Jobs
Check Vercel dashboard → Cron Jobs:
- Update Embeddings: Every 6 hours
- Update Recommendations: Daily at 2 AM

## Monitoring

### Check OpenAI Usage
```bash
# OpenAI dashboard: https://platform.openai.com/usage
```

### Monitor Errors
```bash
# Vercel logs
vercel logs --follow
```

### Track Metrics
- Recommendation CTR
- User onboarding completion rate
- API response times
- Cost per user

## Troubleshooting

### Issue: "Missing OPENAI_API_KEY"
**Solution:** Add key to `.env.local`

### Issue: "No recommendations found"
**Solution:** User needs to complete onboarding or interact with events

### Issue: "Embedding generation failed"
**Solution:** Check OpenAI API key and quota

### Issue: "Cron job not running"
**Solution:** Verify `CRON_SECRET` is set and cron configuration in `vercel.json`

## Support

- Documentation: `/docs/AI_RECOMMENDATIONS_SYSTEM.md`
- API Reference: `/docs/API_ENDPOINTS.md`
- Implementation: `/docs/AI_IMPLEMENTATION_SUMMARY.md`

---

**Quick Start Complete!** 🎉

You now have a fully functional AI-powered recommendation system.

/* AGENT FOOTER BEGIN: DO NOT EDIT ABOVE THIS LINE */
// Version & Run Log
// | Version | Timestamp | Agent/Model | Change Summary | Status |
// |--------:|-----------|-------------|----------------|--------|
// | 1.0.0   | 2025-10-02T00:00:00 | backend-dev@sonnet-4.5 | Quick start guide | OK |
/* AGENT FOOTER END */
