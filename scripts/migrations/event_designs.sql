-- ============================================================================
-- What's Poppin! - Event Designs Table Migration
-- File: 20251002_event_designs.sql
-- Description: Store AI-generated event page designs
-- ============================================================================

-- Create event_designs table
CREATE TABLE event_designs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  theme TEXT NOT NULL,
  description TEXT NOT NULL,
  features TEXT[] NOT NULL DEFAULT '{}',
  spec JSONB NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- The table constraint syntax in the historical source is invalid.
CREATE UNIQUE INDEX unique_active_design ON event_designs(event_id) WHERE is_active;

-- Create indexes
CREATE INDEX idx_event_designs_event_id ON event_designs(event_id);
CREATE INDEX idx_event_designs_created ON event_designs(created_at DESC);

-- Add RLS policies
ALTER TABLE event_designs ENABLE ROW LEVEL SECURITY;

-- Anyone can view active designs for published events
CREATE POLICY "Public can view active designs"
  ON event_designs
  FOR SELECT
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_designs.event_id
      AND events.status = 'published'
    )
  );

-- Event organizers can manage their event designs
CREATE POLICY "Organizers can manage their designs"
  ON event_designs
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_designs.event_id
      AND events.organizer_id = auth.uid()
    )
  );

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_event_designs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER event_designs_updated_at
  BEFORE UPDATE ON event_designs
  FOR EACH ROW
  EXECUTE FUNCTION update_event_designs_updated_at();

-- Add comment
COMMENT ON TABLE event_designs IS 'AI-generated 3D event page designs with version tracking';


-- Explicit grants also work on self-hosted installations without hosted defaults.
REVOKE ALL ON event_designs FROM PUBLIC, anon, authenticated;
GRANT SELECT ON event_designs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON event_designs TO authenticated;
