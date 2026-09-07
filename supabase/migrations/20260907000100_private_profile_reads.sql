-- P00 containment: private preferences and location must not be public.
-- Restrict existing permissive SELECT policies without rewriting history.
-- Public organizer presentation needs a separate explicit projection later.
CREATE POLICY "Private profiles are owner readable"
    ON public.profiles AS RESTRICTIVE
    FOR SELECT TO anon, authenticated
    USING ((SELECT auth.uid()) = id);
