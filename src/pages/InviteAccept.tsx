import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, XCircle, Users, LogIn, UserPlus, AlertTriangle, Loader2 } from 'lucide-react';
import { roleLabels, roleColors, AppRole } from '@/types/team';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import FedcomLogo from '@/assets/FEDCOM.svg';

interface InvitationDetails {
  id: string;
  email: string;
  role: AppRole;
  expires_at: string;
  team_id: string;
  team_name: string;
  inviter_name: string | null;
  accepted_at: string | null;
}

export default function InviteAccept() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const token = searchParams.get('token');

  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Fetch invitation details
  useEffect(() => {
    async function fetchInvitation() {
      if (!token) {
        setError('Token de convite não encontrado');
        setLoading(false);
        return;
      }

      try {
        // Get invitation with team info
        const { data: inviteData, error: inviteError } = await supabase
          .from('team_invitations')
          .select(`
            id,
            email,
            role,
            expires_at,
            team_id,
            accepted_at,
            invited_by,
            teams (
              id,
              name
            )
          `)
          .eq('token', token)
          .maybeSingle();

        if (inviteError) {
          console.error('Error fetching invitation:', inviteError);
          setError('Erro ao buscar convite');
          setLoading(false);
          return;
        }

        if (!inviteData) {
          setError('Convite não encontrado ou inválido');
          setLoading(false);
          return;
        }

        // Check if expired
        if (new Date(inviteData.expires_at) < new Date()) {
          setError('Este convite expirou. Solicite um novo convite ao administrador da equipe.');
          setLoading(false);
          return;
        }

        // Check if already accepted
        if (inviteData.accepted_at) {
          setError('Este convite já foi aceito anteriormente.');
          setLoading(false);
          return;
        }

        // Get inviter name
        let inviterName = null;
        if (inviteData.invited_by) {
          const { data: inviterProfile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', inviteData.invited_by)
            .maybeSingle();
          
          inviterName = inviterProfile?.full_name || null;
        }

        const teamData = inviteData.teams as { id: string; name: string } | null;

        setInvitation({
          id: inviteData.id,
          email: inviteData.email,
          role: inviteData.role as AppRole,
          expires_at: inviteData.expires_at,
          team_id: inviteData.team_id,
          team_name: teamData?.name || 'Equipe',
          inviter_name: inviterName,
          accepted_at: inviteData.accepted_at,
        });
      } catch (err) {
        console.error('Error:', err);
        setError('Erro ao processar convite');
      } finally {
        setLoading(false);
      }
    }

    fetchInvitation();
  }, [token]);

  // Accept invitation
  const handleAccept = async () => {
    if (!invitation || !user) return;

    setAccepting(true);
    try {
      // Check if user is already a member
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', user.id)
        .eq('team_id', invitation.team_id)
        .maybeSingle();

      if (existingRole) {
        toast.error('Você já é membro desta equipe');
        navigate('/app');
        return;
      }

      // Create user_role entry
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          team_id: invitation.team_id,
          role: invitation.role,
        });

      if (roleError) {
        console.error('Error creating role:', roleError);
        throw new Error('Erro ao adicionar você à equipe');
      }

      // Mark invitation as accepted
      const { error: updateError } = await supabase
        .from('team_invitations')
        .update({ accepted_at: new Date().toISOString() })
        .eq('id', invitation.id);

      if (updateError) {
        console.error('Error updating invitation:', updateError);
        // Non-critical, continue
      }

      // Update user's current team
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ current_team_id: invitation.team_id })
        .eq('id', user.id);

      if (profileError) {
        console.error('Error updating profile:', profileError);
        // Non-critical, continue
      }

      setSuccess(true);
      toast.success('Convite aceito com sucesso!', {
        description: `Você agora faz parte da equipe ${invitation.team_name}`,
      });

      // Redirect after a short delay
      setTimeout(() => {
        navigate('/app');
        window.location.reload(); // Force reload to refresh team context
      }, 2000);
    } catch (err: any) {
      console.error('Accept error:', err);
      toast.error(err.message || 'Erro ao aceitar convite');
    } finally {
      setAccepting(false);
    }
  };

  // Loading state
  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Skeleton className="h-16 w-16 rounded-full mx-auto mb-4" />
            <Skeleton className="h-8 w-48 mx-auto mb-2" />
            <Skeleton className="h-4 w-64 mx-auto" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-20" />
            <Skeleton className="h-12" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-danger/10 flex items-center justify-center">
              <XCircle className="h-8 w-8 text-danger" />
            </div>
            <CardTitle className="text-xl">Convite Inválido</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild className="w-full">
              <Link to="/">Voltar ao início</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
            <CardTitle className="text-xl">Convite Aceito!</CardTitle>
            <CardDescription>
              Você agora faz parte da equipe {invitation?.team_name}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">Redirecionando para o dashboard...</p>
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Not logged in - show login/signup options
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <img src={FedcomLogo} alt="FEDCOM" className="h-12 mx-auto mb-4" />
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-xl">Convite para Equipe</CardTitle>
            <CardDescription>
              Você foi convidado para fazer parte da equipe
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {invitation && (
              <div className="p-4 rounded-lg bg-muted/50 border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Equipe:</span>
                  <span className="font-semibold">{invitation.team_name}</span>
                </div>
                {invitation.inviter_name && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Convidado por:</span>
                    <span>{invitation.inviter_name}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Cargo:</span>
                  <Badge className={cn(roleColors[invitation.role])}>
                    {roleLabels[invitation.role]}
                  </Badge>
                </div>
              </div>
            )}

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Faça login para continuar</AlertTitle>
              <AlertDescription>
                Você precisa estar logado para aceitar este convite.
              </AlertDescription>
            </Alert>

            <div className="grid gap-3">
              <Button asChild size="lg" className="w-full">
                <Link to={`/auth?redirect=/convite?token=${token}&mode=login`}>
                  <LogIn className="h-4 w-4 mr-2" />
                  Entrar com minha conta
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full">
                <Link to={`/auth?redirect=/convite?token=${token}&mode=signup`}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Criar uma conta
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Logged in - show accept button
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <img src={FedcomLogo} alt="FEDCOM" className="h-12 mx-auto mb-4" />
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-xl">Aceitar Convite</CardTitle>
          <CardDescription>
            Confirme sua participação na equipe
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {invitation && (
            <div className="p-4 rounded-lg bg-muted/50 border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Equipe:</span>
                <span className="font-semibold">{invitation.team_name}</span>
              </div>
              {invitation.inviter_name && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Convidado por:</span>
                  <span>{invitation.inviter_name}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Cargo:</span>
                <Badge className={cn(roleColors[invitation.role])}>
                  {roleLabels[invitation.role]}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Seu email:</span>
                <span className="text-sm">{user.email}</span>
              </div>
            </div>
          )}

          {invitation?.email.toLowerCase() !== user.email?.toLowerCase() && (
            <Alert variant="default" className="border-warning bg-warning/10">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <AlertTitle className="text-warning">Atenção</AlertTitle>
              <AlertDescription>
                O convite foi enviado para <strong>{invitation?.email}</strong>, 
                mas você está logado com <strong>{user.email}</strong>. 
                Você ainda pode aceitar o convite.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-3 pt-2">
            <Button 
              size="lg" 
              className="w-full" 
              onClick={handleAccept}
              disabled={accepting}
            >
              {accepting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Aceitar Convite
                </>
              )}
            </Button>
            <Button variant="outline" size="lg" className="w-full" asChild>
              <Link to="/app">Voltar ao Dashboard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
