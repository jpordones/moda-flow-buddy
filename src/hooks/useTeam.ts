import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Team, UserRole, TeamInvitation, TeamMember, AppRole } from '@/types/team';
import { toast } from 'sonner';

export function useTeam() {
  const { user, profile } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [userRole, setUserRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTeams = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching teams:', error);
      return;
    }

    setTeams(data as Team[]);
    
    // Set current team from profile or first team
    if (profile?.current_team_id) {
      const current = data.find(t => t.id === profile.current_team_id);
      if (current) setCurrentTeam(current as Team);
    } else if (data.length > 0) {
      setCurrentTeam(data[0] as Team);
    }
  }, [user, profile?.current_team_id]);

  const fetchMembers = useCallback(async () => {
    if (!currentTeam) return;

    const { data: rolesData, error: rolesError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('team_id', currentTeam.id);

    if (rolesError) {
      console.error('Error fetching roles:', rolesError);
      return;
    }

    // Fetch profiles for each member
    const memberPromises = (rolesData as UserRole[]).map(async (role) => {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', role.user_id)
        .single();

      const { data: userData } = await supabase.auth.admin?.getUserById?.(role.user_id) || { data: null };

      return {
        id: role.id,
        user_id: role.user_id,
        email: userData?.user?.email || 'Email não disponível',
        full_name: profileData?.full_name || null,
        role: role.role as AppRole,
        is_owner: currentTeam.owner_id === role.user_id,
        joined_at: role.created_at
      } as TeamMember;
    });

    const membersResult = await Promise.all(memberPromises);
    setMembers(membersResult);

    // Set current user's role
    const currentUserRole = rolesData.find(r => r.user_id === user?.id);
    if (currentUserRole) {
      setUserRole(currentUserRole.role as AppRole);
    }
  }, [currentTeam, user]);

  const fetchInvitations = useCallback(async () => {
    if (!currentTeam) return;

    const { data, error } = await supabase
      .from('team_invitations')
      .select('*')
      .eq('team_id', currentTeam.id)
      .is('accepted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching invitations:', error);
      return;
    }

    setInvitations(data as TeamInvitation[]);
  }, [currentTeam]);

  const createTeam = useCallback(async (name: string) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('teams')
      .insert({ name, owner_id: user.id })
      .select()
      .single();

    if (error) {
      console.error('Error creating team:', error);
      toast.error('Erro ao criar equipe');
      return null;
    }

    // Add creator as admin
    await supabase
      .from('user_roles')
      .insert({
        user_id: user.id,
        team_id: data.id,
        role: 'admin'
      });

    toast.success('Equipe criada com sucesso!');
    await fetchTeams();
    return data as Team;
  }, [user, fetchTeams]);

  const updateTeam = useCallback(async (teamId: string, name: string) => {
    const { error } = await supabase
      .from('teams')
      .update({ name })
      .eq('id', teamId);

    if (error) {
      console.error('Error updating team:', error);
      toast.error('Erro ao atualizar equipe');
      return false;
    }

    toast.success('Equipe atualizada!');
    await fetchTeams();
    return true;
  }, [fetchTeams]);

  const switchTeam = useCallback(async (teamId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({ current_team_id: teamId })
      .eq('id', user.id);

    if (error) {
      console.error('Error switching team:', error);
      toast.error('Erro ao trocar de equipe');
      return;
    }

    const team = teams.find(t => t.id === teamId);
    if (team) {
      setCurrentTeam(team);
      toast.success(`Você está agora em: ${team.name}`);
    }
  }, [user, teams]);

  const inviteMember = useCallback(async (email: string, role: AppRole) => {
    if (!user || !currentTeam) return false;

    const { error } = await supabase
      .from('team_invitations')
      .insert({
        team_id: currentTeam.id,
        email,
        role,
        invited_by: user.id
      });

    if (error) {
      if (error.code === '23505') {
        toast.error('Este email já foi convidado');
      } else {
        console.error('Error inviting member:', error);
        toast.error('Erro ao enviar convite');
      }
      return false;
    }

    toast.success(`Convite enviado para ${email}`);
    await fetchInvitations();
    return true;
  }, [user, currentTeam, fetchInvitations]);

  const cancelInvitation = useCallback(async (invitationId: string) => {
    const { error } = await supabase
      .from('team_invitations')
      .delete()
      .eq('id', invitationId);

    if (error) {
      console.error('Error canceling invitation:', error);
      toast.error('Erro ao cancelar convite');
      return false;
    }

    toast.success('Convite cancelado');
    await fetchInvitations();
    return true;
  }, [fetchInvitations]);

  const updateMemberRole = useCallback(async (memberId: string, newRole: AppRole) => {
    const { error } = await supabase
      .from('user_roles')
      .update({ role: newRole })
      .eq('id', memberId);

    if (error) {
      console.error('Error updating member role:', error);
      toast.error('Erro ao atualizar cargo');
      return false;
    }

    toast.success('Cargo atualizado!');
    await fetchMembers();
    return true;
  }, [fetchMembers]);

  const removeMember = useCallback(async (memberId: string) => {
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('id', memberId);

    if (error) {
      console.error('Error removing member:', error);
      toast.error('Erro ao remover membro');
      return false;
    }

    toast.success('Membro removido da equipe');
    await fetchMembers();
    return true;
  }, [fetchMembers]);

  const canManageMembers = useCallback(() => {
    if (!currentTeam || !user) return false;
    return currentTeam.owner_id === user.id || userRole === 'admin' || userRole === 'manager';
  }, [currentTeam, user, userRole]);

  const canManageRoles = useCallback(() => {
    if (!currentTeam || !user) return false;
    return currentTeam.owner_id === user.id || userRole === 'admin';
  }, [currentTeam, user, userRole]);

  useEffect(() => {
    if (user) {
      fetchTeams().finally(() => setLoading(false));
    }
  }, [user, fetchTeams]);

  useEffect(() => {
    if (currentTeam) {
      fetchMembers();
      fetchInvitations();
    }
  }, [currentTeam, fetchMembers, fetchInvitations]);

  return {
    teams,
    currentTeam,
    members,
    invitations,
    userRole,
    loading,
    createTeam,
    updateTeam,
    switchTeam,
    inviteMember,
    cancelInvitation,
    updateMemberRole,
    removeMember,
    canManageMembers,
    canManageRoles,
    refreshMembers: fetchMembers,
    refreshInvitations: fetchInvitations
  };
}
