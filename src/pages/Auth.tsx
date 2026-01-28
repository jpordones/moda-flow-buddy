import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, Loader2 } from 'lucide-react';
import fedcomLogo from '@/assets/FEDCOM.svg';
import { z } from 'zod';
import { validatePassword, getPasswordStrength } from '@/lib/passwordValidation';
import { PasswordStrengthIndicator } from '@/components/PasswordStrengthIndicator';

const emailSchema = z.string().email('Email inválido');

type AuthMode = 'login' | 'register' | 'forgot-password';

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { signIn, signUp, user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get password validation result for registration
  const passwordValidation = validatePassword(password);

  // Handle redirect after auth (for invite flow)
  const redirectTo = searchParams.get('redirect');
  const initialMode = searchParams.get('mode');

  useEffect(() => {
    if (initialMode === 'login') {
      setMode('login');
    } else if (initialMode === 'signup') {
      setMode('register');
    }
  }, [initialMode]);

  useEffect(() => {
    if (!loading && user) {
      // If there's a redirect URL, go there instead of /app
      if (redirectTo) {
        navigate(redirectTo);
      } else {
        navigate('/app');
      }
    }
  }, [user, loading, navigate, redirectTo]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    try {
      emailSchema.parse(email);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.email = e.errors[0].message;
      }
    }

    if (mode === 'login') {
      // For login, just check if password is provided
      if (!password) {
        newErrors.password = 'Senha é obrigatória';
      }
    }

    if (mode === 'register') {
      // For registration, use strong password validation
      if (!passwordValidation.valid) {
        newErrors.password = passwordValidation.message || 'Senha não atende aos requisitos';
      }
      if (!fullName.trim()) {
        newErrors.fullName = 'Nome é obrigatório';
      }
      if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Senhas não conferem';
      }
      if (!acceptTerms) {
        newErrors.terms = 'Você deve aceitar os termos';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast.error('Falha no login', {
              description: 'Email ou senha incorretos. Verifique suas credenciais.'
            });
          } else {
            toast.error('Erro na autenticação', {
              description: error.message
            });
          }
        } else {
          toast.success(`Bem-vindo de volta!`, {
            description: `Login realizado com sucesso`
          });
          navigate('/app');
        }
      } else if (mode === 'register') {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          if (error.message.includes('already registered')) {
            toast.error('Email já cadastrado', {
              description: 'Este email já possui uma conta. Tente fazer login.'
            });
          } else {
            toast.error('Erro no cadastro', {
              description: error.message
            });
          }
        } else {
          toast.success(`Conta criada com sucesso!`, {
            description: `Bem-vindo, ${fullName}! Complete seu perfil.`
          });
          navigate('/onboarding');
        }
      } else if (mode === 'forgot-password') {
        toast.success('Email enviado', {
          description: `Verifique sua caixa de entrada em ${email}`
        });
        setMode('login');
      }
    } catch (error) {
      toast.error('Erro inesperado', {
        description: 'Ocorreu um problema. Tente novamente.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-light to-background">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-light via-background to-brand-light/50 dark:from-background dark:via-card dark:to-background px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo - Responsiva */}
        <div className="flex justify-center mb-6 md:mb-8">
          <img src={fedcomLogo} alt="FEDCOM" className="h-16 md:h-24 w-auto" />
        </div>

        <Card className="border-0 shadow-elevation-lg dark:shadow-dark-elevation-lg dark:border dark:border-border/50">
          <CardHeader className="space-y-1 text-center pb-4 px-4 md:px-6">
            <CardTitle className="text-xl md:text-2xl font-bold text-foreground">
              {mode === 'login' && 'Entrar'}
              {mode === 'register' && 'Criar conta'}
              {mode === 'forgot-password' && 'Recuperar senha'}
            </CardTitle>
            <CardDescription className="text-sm md:text-base text-muted-foreground">
              {mode === 'login' && 'Entre com suas credenciais para acessar'}
              {mode === 'register' && 'Preencha os dados para criar sua conta'}
              {mode === 'forgot-password' && 'Digite seu email para recuperar a senha'}
            </CardDescription>
          </CardHeader>

          <CardContent className="px-4 md:px-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm md:text-base">Nome completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Seu nome completo"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-10 h-12 text-base"
                    />
                  </div>
                  {errors.fullName && (
                    <p className="text-sm text-danger">{errors.fullName}</p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm md:text-base">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 text-base"
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-danger">{errors.email}</p>
                )}
              </div>

              {mode !== 'forgot-password' && (
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm md:text-base">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 h-12 text-base"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-danger">{errors.password}</p>
                  )}
                  
                  {mode === 'register' && password && (
                    <PasswordStrengthIndicator 
                      password={password} 
                      checks={passwordValidation.checks} 
                    />
                  )}
                </div>
              )}

              {mode === 'register' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm md:text-base">Confirmar senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10 h-12 text-base"
                      />
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-sm text-danger">{errors.confirmPassword}</p>
                    )}
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="terms"
                      checked={acceptTerms}
                      onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                      className="mt-0.5"
                    />
                    <label
                      htmlFor="terms"
                      className="text-sm text-muted-foreground cursor-pointer leading-relaxed"
                    >
                      Aceito os{' '}
                      <a href="#" className="text-primary hover:underline">
                        termos de uso
                      </a>{' '}
                      e{' '}
                      <a href="#" className="text-primary hover:underline">
                        política de privacidade
                      </a>
                    </label>
                  </div>
                  {errors.terms && (
                    <p className="text-sm text-danger">{errors.terms}</p>
                  )}
                </>
              )}

              {mode === 'login' && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    />
                    <label
                      htmlFor="remember"
                      className="text-sm text-muted-foreground cursor-pointer"
                    >
                      Lembrar-me
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMode('forgot-password')}
                    className="text-sm text-primary hover:underline"
                  >
                    Esqueci minha senha
                  </button>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 text-base"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {mode === 'login' && 'Entrar'}
                {mode === 'register' && 'Criar conta grátis'}
                {mode === 'forgot-password' && 'Enviar email de recuperação'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              {mode === 'login' && (
                <p className="text-sm text-muted-foreground">
                  Não tem uma conta?{' '}
                  <button
                    onClick={() => setMode('register')}
                    className="text-primary hover:underline font-medium"
                  >
                    Criar conta
                  </button>
                </p>
              )}
              {mode === 'register' && (
                <p className="text-sm text-muted-foreground">
                  Já tem uma conta?{' '}
                  <button
                    onClick={() => setMode('login')}
                    className="text-primary hover:underline font-medium"
                  >
                    Entrar
                  </button>
                </p>
              )}
              {mode === 'forgot-password' && (
                <button
                  onClick={() => setMode('login')}
                  className="text-sm text-primary hover:underline font-medium flex items-center justify-center gap-1 mx-auto min-h-[44px]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar para login
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}