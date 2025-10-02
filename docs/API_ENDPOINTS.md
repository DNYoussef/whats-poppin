# What's Poppin! - API Endpoint Documentation

## AI Recommendations Endpoints

### Get Personalized Recommendations

**Endpoint:** `GET /api/recommendations`

**Description:** Retrieve personalized event recommendations for a user based on their preferences and interaction history.

**Query Parameters:**
| Parameter | Type    | Required | Default | Description                           |
|-----------|---------|----------|---------|---------------------------------------|
| userId    | string  | Yes      | -       | User's UUID                           |
| limit     | number  | No       | 10      | Number of recommendations (1-50)      |
| fresh     | boolean | No       | false   | Generate fresh recommendations        |

**Response:**
```json
{
  "recommendations": [
    {
      "id": "event-uuid",
      "title": "Summer Music Festival",
      "description": "Outdoor concert with live bands",
      "start_time": "2025-10-15T19:00:00Z",
      "location": "Central Park",
      "category": "Music",
      "similarity_score": 0.89
    }
  ],
  "count": 10,
  "cached": false
}
```

**Example:**
```bash
curl "https://whats-poppin.vercel.app/api/recommendations?userId=123&limit=5&fresh=true"
```

---

### Get Similar Events

**Endpoint:** `GET /api/events/[id]/similar`

**Description:** Find events similar to a specific event.

**Path Parameters:**
| Parameter | Type   | Required | Description     |
|-----------|--------|----------|-----------------|
| id        | string | Yes      | Event UUID      |

**Query Parameters:**
| Parameter | Type   | Required | Default | Description                      |
|-----------|--------|----------|---------|----------------------------------|
| limit     | number | No       | 5       | Number of similar events (1-20)  |

**Response:**
```json
{
  "eventId": "event-uuid",
  "similarEvents": [
    {
      "id": "similar-event-uuid",
      "title": "Jazz Night",
      "description": "Live jazz performance",
      "start_time": "2025-10-20T20:00:00Z",
      "location": "Blue Note",
      "category": "Music",
      "similarity_score": 0.92
    }
  ],
  "count": 5
}
```

**Example:**
```bash
curl "https://whats-poppin.vercel.app/api/events/abc123/similar?limit=5"
```

---

### Save User Preferences

**Endpoint:** `POST /api/preferences`

**Description:** Save user's explicit preferences (used during onboarding).

**Request Body:**
```json
{
  "userId": "user-uuid",
  "categories": ["Music", "Food & Drink", "Arts & Culture"],
  "interests": ["jazz", "craft beer", "photography"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Preferences saved successfully"
}
```

**Example:**
```bash
curl -X POST https://whats-poppin.vercel.app/api/preferences \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "123",
    "categories": ["Music", "Food & Drink"],
    "interests": ["live music", "wine tasting"]
  }'
```

---

### Get User Preferences

**Endpoint:** `GET /api/preferences`

**Description:** Retrieve user preferences and interaction statistics.

**Query Parameters:**
| Parameter | Type   | Required | Description |
|-----------|--------|----------|-------------|
| userId    | string | Yes      | User UUID   |

**Response:**
```json
{
  "preferences": {
    "user_id": "user-uuid",
    "categories": ["Music", "Food & Drink"],
    "interests": ["jazz", "craft beer"],
    "created_at": "2025-10-02T00:00:00Z",
    "updated_at": "2025-10-02T00:00:00Z"
  },
  "stats": {
    "viewed": 45,
    "saved": 12,
    "rsvp": 8,
    "attended": 3
  },
  "onboardingComplete": true
}
```

**Example:**
```bash
curl "https://whats-poppin.vercel.app/api/preferences?userId=123"
```

---

### Track Event Interaction

**Endpoint:** `POST /api/interactions`

**Description:** Track user interactions with events (view, save, RSVP, attend).

**Request Body:**
```json
{
  "userId": "user-uuid",
  "eventId": "event-uuid",
  "type": "saved"
}
```

**Interaction Types:**
- `viewed` - User viewed event details
- `saved` - User bookmarked the event
- `rsvp` - User confirmed attendance
- `attended` - User attended the event (marked post-event)

**Response:**
```json
{
  "success": true,
  "interaction": {
    "id": "interaction-uuid",
    "user_id": "user-uuid",
    "event_id": "event-uuid",
    "interaction_type": "saved",
    "created_at": "2025-10-02T00:00:00Z"
  }
}
```

**Example:**
```bash
curl -X POST https://whats-poppin.vercel.app/api/interactions \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "123",
    "eventId": "abc456",
    "type": "rsvp"
  }'
```

---

### Generate Event Embedding

**Endpoint:** `POST /api/embeddings/generate`

**Description:** Generate OpenAI embedding for an event.

**Request Body:**
```json
{
  "eventId": "event-uuid",
  "title": "Summer Concert",
  "description": "Outdoor music festival",
  "category": "Music",
  "tags": ["outdoor", "live music"]
}
```

**Response:**
```json
{
  "embedding": [0.123, 0.456, ...], // 1536 dimensions
  "dimensions": 1536,
  "saved": true
}
```

**Example:**
```bash
curl -X POST https://whats-poppin.vercel.app/api/embeddings/generate \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Jazz Night",
    "description": "Live jazz performance",
    "category": "Music"
  }'
```

---

### Batch Generate Embeddings

**Endpoint:** `POST /api/embeddings/batch`

**Description:** Generate embeddings for multiple events (max 100).

**Request Body:**
```json
{
  "events": [
    {
      "id": "event-1",
      "title": "Concert A",
      "description": "Rock concert",
      "category": "Music"
    },
    {
      "id": "event-2",
      "title": "Food Festival",
      "description": "Street food vendors",
      "category": "Food & Drink"
    }
  ]
}
```

**Response:**
```json
{
  "generated": 2,
  "saved": 2,
  "embeddings": [[...], [...]]
}
```

**Example:**
```bash
curl -X POST https://whats-poppin.vercel.app/api/embeddings/batch \
  -H "Content-Type: application/json" \
  -d '{"events": [...]}'
```

---

## Background Jobs (Cron Endpoints)

### Update Embeddings

**Endpoint:** `GET /api/cron/update-embeddings`

**Description:** Generate embeddings for events that don't have them.

**Schedule:** Every 6 hours (`0 */6 * * *`)

**Authentication:** Bearer token in `Authorization` header
```
Authorization: Bearer {CRON_SECRET}
```

**Response:**
```json
{
  "success": true,
  "processed": 50,
  "total": 50
}
```

---

### Update Recommendations

**Endpoint:** `GET /api/cron/update-recommendations`

**Description:** Refresh recommendations for active users.

**Schedule:** Daily at 2 AM (`0 2 * * *`)

**Authentication:** Bearer token in `Authorization` header
```
Authorization: Bearer {CRON_SECRET}
```

**Response:**
```json
{
  "success": true,
  "processed": 1000,
  "total": 1000,
  "deleted": 500,
  "errors": []
}
```

---

## Error Responses

All endpoints return standard error responses:

**400 Bad Request:**
```json
{
  "error": "userId parameter is required"
}
```

**401 Unauthorized:**
```json
{
  "error": "Unauthorized"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Failed to fetch recommendations",
  "message": "OpenAI API timeout"
}
```

---

## Rate Limiting

- Recommendation endpoints: 100 requests/minute per user
- Embedding generation: 10 requests/minute per user
- Cron jobs: Protected by secret token

---

## Best Practices

1. **Cache Recommendations:** Use `fresh=false` for cached results
2. **Batch Operations:** Use batch endpoint for multiple embeddings
3. **Track Interactions:** Track all user interactions for better recommendations
4. **Error Handling:** Always handle API errors gracefully
5. **Pagination:** Use limit parameter to control response size

---

**Last Updated:** 2025-10-02
**Version:** 1.0.0

/* AGENT FOOTER BEGIN: DO NOT EDIT ABOVE THIS LINE */
// Version & Run Log
// | Version | Timestamp | Agent/Model | Change Summary | Status |
// |--------:|-----------|-------------|----------------|--------|
// | 1.0.0   | 2025-10-02T00:00:00 | backend-dev@sonnet-4.5 | API endpoint documentation | OK |
/* AGENT FOOTER END */
