import { useState } from 'react';
import { Users, UserPlus, Mail, Shield, Crown, Trash2, MoreVertical, Building2 } from 'lucide-react';
import { useTeam } from '@/hooks/useTeam';
import { AppRole, roleLabels, roleDescriptions, roleColors } from '@/types/team';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Team() {
  const { user } = useAuth();
  const { 
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
    canManageRoles
  } = useTeam();

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<AppRole>('viewer');
  const [isInviting, setIsInviting] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [editTeamName, setEditTeamName] = useState('');
  const [isEditingTeam, setIsEditingTeam] = useState(false);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    
    setIsInviting(true);
    const success = await inviteMember(inviteEmail.trim(), inviteRole);
    if (success) {
      setInviteEmail('');
      setInviteRole('viewer');
    }
    setIsInviting(false);
  };

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) return;
    
    setIsCreatingTeam(true);
    const team = await createTeam(newTeamName.trim());
    if (team) {
      setNewTeamName('');
      await switchTeam(team.id);
    }
    setIsCreatingTeam(false);
  };

  const handleUpdateTeam = async () => {
    if (!editTeamName.trim() || !currentTeam) return;
    
    setIsEditingTeam(true);
    await updateTeam(currentTeam.id, editTeamName.trim());
    setIsEditingTeam(false);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Skeleton className="h-10 w-48 mb-6" />
        <div className="grid gap-6">
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="h-8 w-8" />
            Equipe
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os membros e permissões da sua equipe
          </p>
        </div>

        {teams.length > 1 && (
          <Select value={currentTeam?.id} onValueChange={switchTeam}>
            <SelectTrigger className="w-[200px]">
              <Building2 className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Selecione a equipe" />
            </SelectTrigger>
            <SelectContent>
              {teams.map(team => (
                <SelectItem key={team.id} value={team.id}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <Tabs defaultValue="members" className="space-y-6">
        <TabsList>
          <TabsTrigger value="members">
            <Users className="h-4 w-4 mr-2" />
            Membros ({members.length})
          </TabsTrigger>
          <TabsTrigger value="invitations">
            <Mail className="h-4 w-4 mr-2" />
            Convites ({invitations.length})
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Shield className="h-4 w-4 mr-2" />
            Configurações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-6">
          {/* Invite Member Card */}
          {canManageMembers() && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Convidar Membro
                </CardTitle>
                <CardDescription>
                  Envie um convite por email para adicionar novos membros à equipe
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@exemplo.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>
                  <div className="w-full md:w-48">
                    <Label>Cargo</Label>
                    <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as AppRole)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(['viewer', 'seller', 'manager', 'admin'] as AppRole[]).map(role => (
                          <SelectItem key={role} value={role}>
                            {roleLabels[role]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleInvite} disabled={isInviting || !inviteEmail.trim()}>
                      {isInviting ? 'Enviando...' : 'Enviar Convite'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Members List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Membros da Equipe</CardTitle>
              <CardDescription>
                {currentTeam?.name} • {members.length} membro{members.length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {members.map(member => (
                  <div 
                    key={member.id} 
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {member.full_name?.charAt(0) || member.email.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {member.full_name || 'Sem nome'}
                          </span>
                          {member.is_owner && (
                            <Crown className="h-4 w-4 text-amber-500" />
                          )}
                          {member.user_id === user?.id && (
                            <Badge variant="outline" className="text-xs">Você</Badge>
                          )}
                        </div>
                        <span className="text-sm text-muted-foreground">{member.email}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Badge className={cn(roleColors[member.role])}>
                        {roleLabels[member.role]}
                      </Badge>
                      
                      {canManageRoles() && !member.is_owner && member.user_id !== user?.id && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => updateMemberRole(member.id, 'admin')}
                              disabled={member.role === 'admin'}
                            >
                              Promover a Admin
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => updateMemberRole(member.id, 'manager')}
                              disabled={member.role === 'manager'}
                            >
                              Definir como Gerente
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => updateMemberRole(member.id, 'seller')}
                              disabled={member.role === 'seller'}
                            >
                              Definir como Vendedor
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => updateMemberRole(member.id, 'viewer')}
                              disabled={member.role === 'viewer'}
                            >
                              Definir como Visualizador
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem 
                                  onSelect={(e) => e.preventDefault()}
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Remover da equipe
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remover membro?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta ação irá remover {member.full_name || member.email} da equipe. 
                                    O membro perderá acesso a todos os dados.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => removeMember(member.id)}
                                    className="bg-destructive text-destructive-foreground"
                                  >
                                    Remover
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                ))}

                {members.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum membro na equipe ainda</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Roles Legend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Níveis de Acesso</CardTitle>
              <CardDescription>
                Entenda as permissões de cada cargo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(['admin', 'manager', 'seller', 'viewer'] as AppRole[]).map(role => (
                  <div key={role} className="flex items-start gap-3 p-3 rounded-lg border">
                    <Badge className={cn(roleColors[role], "mt-0.5")}>
                      {roleLabels[role]}
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      {roleDescriptions[role]}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invitations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Convites Pendentes</CardTitle>
              <CardDescription>
                Convites aguardando aceitação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invitations.map(invitation => (
                  <div 
                    key={invitation.id} 
                    className="flex items-center justify-between p-4 rounded-lg border bg-card"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <span className="font-medium">{invitation.email}</span>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>
                            Expira em {format(new Date(invitation.expires_at), "dd 'de' MMM", { locale: ptBR })}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Badge className={cn(roleColors[invitation.role])}>
                        {roleLabels[invitation.role]}
                      </Badge>
                      
                      {canManageMembers() && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Cancelar convite?</AlertDialogTitle>
                              <AlertDialogDescription>
                                O convite para {invitation.email} será cancelado e o link não funcionará mais.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Manter</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => cancelInvitation(invitation.id)}
                                className="bg-destructive text-destructive-foreground"
                              >
                                Cancelar Convite
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                ))}

                {invitations.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum convite pendente</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          {/* Team Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Configurações da Equipe</CardTitle>
              <CardDescription>
                Gerencie as informações da equipe atual
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Nome da Equipe</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={editTeamName || currentTeam?.name || ''}
                    onChange={(e) => setEditTeamName(e.target.value)}
                    placeholder="Nome da equipe"
                  />
                  <Button 
                    onClick={handleUpdateTeam} 
                    disabled={isEditingTeam || !editTeamName.trim() || editTeamName === currentTeam?.name}
                  >
                    Salvar
                  </Button>
                </div>
              </div>

              <div>
                <Label>Seu Cargo</Label>
                <div className="mt-1">
                  <Badge className={cn(roleColors[userRole || 'viewer'], "text-sm")}>
                    {roleLabels[userRole || 'viewer']}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Create New Team */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Criar Nova Equipe</CardTitle>
              <CardDescription>
                Crie uma nova equipe para organizar diferentes negócios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="Nome da nova equipe"
                />
                <Button 
                  onClick={handleCreateTeam} 
                  disabled={isCreatingTeam || !newTeamName.trim()}
                >
                  {isCreatingTeam ? 'Criando...' : 'Criar Equipe'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
