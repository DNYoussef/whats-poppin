-- Keep owner access to historical interactions after an event is cancelled.
-- New interactions and changes must refer to a currently published event.
CREATE POLICY "Interactions require published events"
    ON public.user_event_interactions AS RESTRICTIVE
    FOR ALL TO authenticated
    USING (user_id = (SELECT auth.uid()))
    WITH CHECK (
        user_id = (SELECT auth.uid())
        AND EXISTS (
            SELECT 1 FROM public.events
            WHERE events.id = user_event_interactions.event_id AND events.status = 'published'
        )
    );
