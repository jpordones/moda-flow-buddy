CREATE POLICY "Users can view invitations sent to their email"
ON public.team_invitations
FOR SELECT
USING (email = auth.email());

CREATE POLICY "Users can accept invitations sent to their email"
ON public.team_invitations
FOR UPDATE
USING (email = auth.email())
WITH CHECK (email = auth.email());

CREATE POLICY "Users can reject invitations sent to their email"
ON public.team_invitations
FOR DELETE
USING (email = auth.email());

CREATE POLICY "Users can join teams via valid invitation"
ON public.user_roles
FOR INSERT
WITH CHECK (
  user_id = auth.uid() AND (
    public.is_team_owner(auth.uid(), team_id) OR
    public.has_role(auth.uid(), team_id, 'admin') OR
    EXISTS (
      SELECT 1 FROM public.team_invitations
      WHERE team_id = user_roles.team_id
        AND email = auth.email()
        AND accepted_at IS NULL
        AND expires_at > now()
    )
  )
);