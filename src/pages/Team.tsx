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
    <div className="container mx-auto py-4 sm:py-8 px-2 sm:px-4">
      <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2 sm:gap-3">
              <Users className="h-6 w-6 sm:h-8 sm:w-8" />
              Equipe
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Gerencie os membros e permissões
            </p>
          </div>

          {teams.length > 1 && (
            <Select value={currentTeam?.id} onValueChange={switchTeam}>
              <SelectTrigger className="w-full sm:w-[200px] h-11">
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
      </div>

      <Tabs defaultValue="members" className="space-y-4 sm:space-y-6">
        <TabsList className="w-full grid grid-cols-3 h-auto p-1">
          <TabsTrigger value="members" className="flex items-center gap-1 sm:gap-2 py-2 sm:py-2.5 text-xs sm:text-sm">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Membros</span>
            <span className="sm:hidden">({members.length})</span>
            <span className="hidden sm:inline">({members.length})</span>
          </TabsTrigger>
          <TabsTrigger value="invitations" className="flex items-center gap-1 sm:gap-2 py-2 sm:py-2.5 text-xs sm:text-sm">
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">Convites</span>
            <span className="sm:hidden">({invitations.length})</span>
            <span className="hidden sm:inline">({invitations.length})</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-1 sm:gap-2 py-2 sm:py-2.5 text-xs sm:text-sm">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Configurações</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-4 sm:space-y-6">
          {/* Invite Member Card */}
          {canManageMembers() && (
            <Card>
              <CardHeader className="pb-2 sm:pb-4">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <UserPlus className="h-4 w-4 sm:h-5 sm:w-5" />
                  Convidar Membro
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Envie um convite por email para adicionar novos membros
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3 sm:gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-sm">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="email@exemplo.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="h-11 text-base"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm">Cargo</Label>
                      <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as AppRole)}>
                        <SelectTrigger className="h-11">
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
                  </div>
                  <Button 
                    onClick={handleInvite} 
                    disabled={isInviting || !inviteEmail.trim()}
                    className="h-11 w-full sm:w-auto"
                  >
                    {isInviting ? 'Enviando...' : 'Enviar Convite'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="text-base sm:text-lg">Membros da Equipe</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                {currentTeam?.name} • {members.length} membro{members.length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                {members.map(member => (
                  <div 
                    key={member.id} 
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarFallback>
                          {member.full_name?.charAt(0) || member.email.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          <span className="font-medium truncate">
                            {member.full_name || 'Sem nome'}
                          </span>
                          {member.is_owner && (
                            <Crown className="h-4 w-4 text-amber-500 flex-shrink-0" />
                          )}
                          {member.user_id === user?.id && (
                            <Badge variant="outline" className="text-xs">Você</Badge>
                          )}
                        </div>
                        <span className="text-xs sm:text-sm text-muted-foreground truncate block">{member.email}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 ml-13 sm:ml-0">
                      <Badge className={cn(roleColors[member.role], "text-xs")}>
                        {roleLabels[member.role]}
                      </Badge>
                      
                      {canManageRoles() && !member.is_owner && member.user_id !== user?.id && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-10 w-10">
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
                                  Remover
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="max-w-[95vw] sm:max-w-lg">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remover membro?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta ação irá remover {member.full_name || member.email} da equipe.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                                  <AlertDialogCancel className="w-full sm:w-auto">Cancelar</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => removeMember(member.id)}
                                    className="w-full sm:w-auto bg-destructive text-destructive-foreground"
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
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="text-base sm:text-lg">Níveis de Acesso</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Entenda as permissões de cada cargo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {(['admin', 'manager', 'seller', 'viewer'] as AppRole[]).map(role => (
                  <div key={role} className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border">
                    <Badge className={cn(roleColors[role], "mt-0.5 text-xs flex-shrink-0")}>
                      {roleLabels[role]}
                    </Badge>
                    <p className="text-xs sm:text-sm text-muted-foreground">
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
