-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'manager', 'seller', 'viewer');

-- Create teams table for multi-tenant support
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on teams
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Create user_roles table (separate from profiles as per security guidelines)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, team_id)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create team invitations table
CREATE TABLE public.team_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role app_role NOT NULL DEFAULT 'viewer',
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(team_id, email)
);

-- Enable RLS on team_invitations
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;

-- Add team_id to profiles for current team context
ALTER TABLE public.profiles ADD COLUMN current_team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL;

-- Security definer function to check if user has a specific role in a team
CREATE OR REPLACE FUNCTION public.has_role(p_user_id UUID, p_team_id UUID, p_role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = p_user_id
      AND team_id = p_team_id
      AND role = p_role
  )
$$;

-- Function to check if user has minimum role level in a team
CREATE OR REPLACE FUNCTION public.has_min_role(p_user_id UUID, p_team_id UUID, p_min_role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = p_user_id
      AND team_id = p_team_id
      AND (
        CASE p_min_role
          WHEN 'viewer' THEN role IN ('viewer', 'seller', 'manager', 'admin')
          WHEN 'seller' THEN role IN ('seller', 'manager', 'admin')
          WHEN 'manager' THEN role IN ('manager', 'admin')
          WHEN 'admin' THEN role = 'admin'
        END
      )
  )
$$;

-- Function to check if user is team owner
CREATE OR REPLACE FUNCTION public.is_team_owner(p_user_id UUID, p_team_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.teams
    WHERE id = p_team_id
      AND owner_id = p_user_id
  )
$$;

-- Function to get user's role in a team
CREATE OR REPLACE FUNCTION public.get_user_team_role(p_user_id UUID, p_team_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = p_user_id
    AND team_id = p_team_id
  LIMIT 1
$$;

-- RLS Policies for teams
CREATE POLICY "Users can view teams they belong to"
ON public.teams
FOR SELECT
USING (
  owner_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE team_id = teams.id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can create teams"
ON public.teams
FOR INSERT
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Team owners can update their teams"
ON public.teams
FOR UPDATE
USING (owner_id = auth.uid());

CREATE POLICY "Team owners can delete their teams"
ON public.teams
FOR DELETE
USING (owner_id = auth.uid());

-- RLS Policies for user_roles
CREATE POLICY "Users can view roles in their teams"
ON public.user_roles
FOR SELECT
USING (
  user_id = auth.uid() OR
  public.is_team_owner(auth.uid(), team_id) OR
  public.has_min_role(auth.uid(), team_id, 'manager')
);

CREATE POLICY "Team owners and admins can insert roles"
ON public.user_roles
FOR INSERT
WITH CHECK (
  public.is_team_owner(auth.uid(), team_id) OR
  public.has_role(auth.uid(), team_id, 'admin')
);

CREATE POLICY "Team owners and admins can update roles"
ON public.user_roles
FOR UPDATE
USING (
  public.is_team_owner(auth.uid(), team_id) OR
  public.has_role(auth.uid(), team_id, 'admin')
);

CREATE POLICY "Team owners and admins can delete roles"
ON public.user_roles
FOR DELETE
USING (
  public.is_team_owner(auth.uid(), team_id) OR
  public.has_role(auth.uid(), team_id, 'admin')
);

-- RLS Policies for team_invitations
CREATE POLICY "Users can view invitations for their teams"
ON public.team_invitations
FOR SELECT
USING (
  public.is_team_owner(auth.uid(), team_id) OR
  public.has_min_role(auth.uid(), team_id, 'manager')
);

CREATE POLICY "Team managers can create invitations"
ON public.team_invitations
FOR INSERT
WITH CHECK (
  public.is_team_owner(auth.uid(), team_id) OR
  public.has_min_role(auth.uid(), team_id, 'manager')
);

CREATE POLICY "Team managers can update invitations"
ON public.team_invitations
FOR UPDATE
USING (
  public.is_team_owner(auth.uid(), team_id) OR
  public.has_min_role(auth.uid(), team_id, 'manager')
);

CREATE POLICY "Team managers can delete invitations"
ON public.team_invitations
FOR DELETE
USING (
  public.is_team_owner(auth.uid(), team_id) OR
  public.has_min_role(auth.uid(), team_id, 'manager')
);

-- Trigger to update updated_at on teams
CREATE TRIGGER update_teams_updated_at
BEFORE UPDATE ON public.teams
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to update updated_at on user_roles
CREATE TRIGGER update_user_roles_updated_at
BEFORE UPDATE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create default team for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
DECLARE
  free_plan_id UUID;
  new_team_id UUID;
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data ->> 'full_name');
  
  -- Get free plan id
  SELECT id INTO free_plan_id FROM public.plans WHERE type = 'free' LIMIT 1;
  
  -- Assign free plan to new user
  IF free_plan_id IS NOT NULL THEN
    INSERT INTO public.user_subscriptions (user_id, plan_id, status)
    VALUES (new.id, free_plan_id, 'active');
  END IF;
  
  -- Create default team for user
  INSERT INTO public.teams (name, owner_id)
  VALUES (COALESCE(new.raw_user_meta_data ->> 'full_name', 'Minha Empresa'), new.id)
  RETURNING id INTO new_team_id;
  
  -- Add user as admin of their own team
  INSERT INTO public.user_roles (user_id, team_id, role)
  VALUES (new.id, new_team_id, 'admin');
  
  -- Set as current team
  UPDATE public.profiles SET current_team_id = new_team_id WHERE id = new.id;
  
  RETURN new;
END;
$$;