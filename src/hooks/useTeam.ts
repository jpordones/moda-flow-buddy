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

  const teamId = profile?.current_team_id;

  // Fetch user's teams via user_roles
  const fetchTeams = useCallback(async () => {
    if (!user) return;

    // Buscar equipes através dos roles do usuário
    const { data: rolesData, error: rolesError } = await supabase
      .from('user_roles')
      .select(`
        team_id,
        role,
        teams (
          id,
          name,
          owner_id,
          created_at,
          updated_at
        )
      `)
      .eq('user_id', user.id);

    if (rolesError) {
      console.error('Error fetching teams:', rolesError);
      return;
    }

    const teamsData = rolesData?.map(r => ({
      ...(r.teams as Team),
      userRole: r.role
    })) || [];

    setTeams(teamsData as Team[]);

    if (teamId) {
      const current = teamsData.find(t => t.id === teamId);
      if (current) {
        setCurrentTeam(current as Team);
        setUserRole(current.userRole as AppRole);
      }
    } else if (teamsData.length > 0) {
      setCurrentTeam(teamsData[0] as Team);
      const role = rolesData?.find(r => r.team_id === teamsData[0].id)?.role;
      setUserRole(role as AppRole || null);
    }
  }, [user, teamId]);

  // Fetch team members - CORRIGIDO: não usar auth.admin no cliente
  const fetchMembers = useCallback(async () => {
    if (!currentTeam) {
      setMembers([]);
      return;
    }

    const { data: rolesData, error: rolesError } = await supabase
      .from('user_roles')
      .select('id, user_id, role, created_at')
      .eq('team_id', currentTeam.id);

    if (rolesError) {
      console.error('Error fetching roles:', rolesError);
      return;
    }

    if (!rolesData || rolesData.length === 0) {
      setMembers([]);
      return;
    }

    // Buscar dados públicos através da tabela profiles (sem auth.admin)
    const memberIds = rolesData.map(r => r.user_id);
    
    const { data: profilesData, error: profilesError } = await supabase
      .from('team_member_profiles' as any)
      .select('id, full_name')
      .in('id', memberIds);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
    }

    // Mapear membros com dados de perfil
    const enrichedMembers: TeamMember[] = rolesData.map(role => {
      const userProfile = profilesData?.find(p => p.id === role.user_id);
      return {
        id: role.id,
        user_id: role.user_id,
        email: 'Email via perfil', // Email não disponível via RLS, usar dados do auth context quando possível
        full_name: userProfile?.full_name || null,
        role: role.role as AppRole,
        is_owner: currentTeam.owner_id === role.user_id,
        joined_at: role.created_at
      };
    });

    setMembers(enrichedMembers);

    // Atualizar role do usuário atual
    const currentUserRole = rolesData.find(r => r.user_id === user?.id);
    if (currentUserRole) {
      setUserRole(currentUserRole.role as AppRole);
    }
  }, [currentTeam, user]);

  // Fetch invitations - com RLS policies
  const fetchInvitations = useCallback(async () => {
    if (!currentTeam) {
      setInvitations([]);
      return;
    }

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

  // Permission checks
  const canManageMembers = useCallback(() => {
    if (!currentTeam || !user) return false;
    return currentTeam.owner_id === user.id || userRole === 'admin' || userRole === 'manager';
  }, [currentTeam, user, userRole]);

  const canManageRoles = useCallback(() => {
    if (!currentTeam || !user) return false;
    return currentTeam.owner_id === user.id || userRole === 'admin';
  }, [currentTeam, user, userRole]);

  // Create team
  const createTeam = useCallback(async (name: string) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('teams')
      .insert({ name, owner_id: user.id })
      .select()
      .single();

    if (error) {
      console.error('Error creating team:', error);
      toast.error('Erro ao criar equipe', {
        description: error.message
      });
      return null;
    }

    // Add creator as admin
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: user.id,
        team_id: data.id,
        role: 'admin'
      });

    if (roleError) {
      console.error('Error adding role:', roleError);
    }

    toast.success('Equipe criada com sucesso!', {
      description: `${name} foi criada`
    });
    await fetchTeams();
    return data as Team;
  }, [user, fetchTeams]);

  // Update team
  const updateTeam = useCallback(async (teamId: string, name: string) => {
    const { error } = await supabase
      .from('teams')
      .update({ name })
      .eq('id', teamId);

    if (error) {
      console.error('Error updating team:', error);
      toast.error('Erro ao atualizar equipe', {
        description: error.message
      });
      return false;
    }

    toast.success('Equipe atualizada!');
    await fetchTeams();
    return true;
  }, [fetchTeams]);

  // Switch team
  const switchTeam = useCallback(async (newTeamId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({ current_team_id: newTeamId })
      .eq('id', user.id);

    if (error) {
      console.error('Error switching team:', error);
      toast.error('Erro ao trocar de equipe', {
        description: error.message
      });
      return;
    }

    const team = teams.find(t => t.id === newTeamId);
    if (team) {
      setCurrentTeam(team);
      toast.success(`Você está agora em: ${team.name}`);
    }
    
    // Reload to refresh all data with new team context
    window.location.reload();
  }, [user, teams]);

  // Invite member
  const inviteMember = useCallback(async (email: string, role: AppRole) => {
    if (!user || !currentTeam) return false;
    if (!canManageMembers()) {
      toast.error('Sem permissão para convidar membros');
      return false;
    }

    try {
      // Insert invitation in database
      const { data: invitation, error } = await supabase
        .from('team_invitations')
        .insert({
          team_id: currentTeam.id,
          email: email.toLowerCase().trim(),
          role,
          invited_by: user.id,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        })
        .select('*')
        .single();

      if (error) {
        if (error.code === '23505') {
          toast.error('Este email já foi convidado');
        } else {
          console.error('Error inviting member:', error);
          toast.error('Erro ao enviar convite', {
            description: error.message
          });
        }
        return false;
      }

      // Get inviter's name for the email
      const { data: inviterProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      // Send real email via edge function
      const { data: emailResponse, error: emailError } = await supabase.functions.invoke('send-team-invite', {
        body: {
          invitationId: invitation.id,
          email: email.toLowerCase().trim(),
          teamName: currentTeam.name,
          inviterName: inviterProfile?.full_name || 'Um administrador',
          role,
          token: invitation.token,
        }
      });

      if (emailError) {
        console.error('Error sending invite email:', emailError);
        toast.warning('Convite criado, mas email não enviado', {
          description: 'O convite está disponível, mas o email pode não ter sido entregue.'
        });
      } else {
        toast.success('Convite enviado!', {
          description: `Um email foi enviado para ${email}`
        });
      }

      await fetchInvitations();
      return true;
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error('Erro inesperado ao enviar convite');
      return false;
    }
  }, [user, currentTeam, canManageMembers, fetchInvitations]);

  // Resend invitation
  const resendInvitation = useCallback(async (invitationId: string) => {
    if (!user || !currentTeam) return false;
    if (!canManageMembers()) {
      toast.error('Sem permissão para reenviar convites');
      return false;
    }

    try {
      // Get invitation details
      const { data: invitation, error: fetchError } = await supabase
        .from('team_invitations')
        .select('*')
        .eq('id', invitationId)
        .single();

      if (fetchError || !invitation) {
        toast.error('Convite não encontrado');
        return false;
      }

      // Update expiration
      const { error: updateError } = await supabase
        .from('team_invitations')
        .update({
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        })
        .eq('id', invitationId);

      if (updateError) {
        console.error('Error updating invitation:', updateError);
      }

      // Get inviter's name
      const { data: inviterProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      // Resend email
      const { error: emailError } = await supabase.functions.invoke('send-team-invite', {
        body: {
          invitationId: invitation.id,
          email: invitation.email,
          teamName: currentTeam.name,
          inviterName: inviterProfile?.full_name || 'Um administrador',
          role: invitation.role,
          token: invitation.token,
        }
      });

      if (emailError) {
        console.error('Error resending email:', emailError);
        toast.error('Erro ao reenviar email');
        return false;
      }

      toast.success('Convite reenviado!', {
        description: `Email enviado para ${invitation.email}`
      });
      
      await fetchInvitations();
      return true;
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error('Erro ao reenviar convite');
      return false;
    }
  }, [user, currentTeam, canManageMembers, fetchInvitations]);

  // Cancel invitation
  const cancelInvitation = useCallback(async (invitationId: string) => {
    if (!canManageMembers()) {
      toast.error('Sem permissão para cancelar convites');
      return false;
    }

    const { error } = await supabase
      .from('team_invitations')
      .delete()
      .eq('id', invitationId);

    if (error) {
      console.error('Error canceling invitation:', error);
      toast.error('Erro ao cancelar convite', {
        description: error.message
      });
      return false;
    }

    toast.success('Convite cancelado');
    await fetchInvitations();
    return true;
  }, [canManageMembers, fetchInvitations]);

  // Update member role
  const updateMemberRole = useCallback(async (memberId: string, newRole: AppRole) => {
    if (!canManageRoles()) {
      toast.error('Sem permissão para alterar cargos');
      return false;
    }

    const { error } = await supabase
      .from('user_roles')
      .update({ role: newRole })
      .eq('id', memberId);

    if (error) {
      console.error('Error updating member role:', error);
      toast.error('Erro ao atualizar cargo', {
        description: error.message
      });
      return false;
    }

    toast.success('Cargo atualizado!');
    await fetchMembers();
    return true;
  }, [canManageRoles, fetchMembers]);

  // Remove member
  const removeMember = useCallback(async (memberId: string) => {
    if (!canManageMembers()) {
      toast.error('Sem permissão para remover membros');
      return false;
    }

    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('id', memberId);

    if (error) {
      console.error('Error removing member:', error);
      toast.error('Erro ao remover membro', {
        description: error.message
      });
      return false;
    }

    toast.success('Membro removido da equipe');
    await fetchMembers();
    return true;
  }, [canManageMembers, fetchMembers]);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchTeams();
      setLoading(false);
    };

    if (user) {
      loadData();
    }
  }, [user, fetchTeams]);

  // Load members and invitations when team changes
  useEffect(() => {
    if (currentTeam) {
      Promise.all([fetchMembers(), fetchInvitations()]);
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
    resendInvitation,
    cancelInvitation,
    updateMemberRole,
    removeMember,
    canManageMembers,
    canManageRoles,
    refreshMembers: fetchMembers,
    refreshInvitations: fetchInvitations
  };
}
