import { Check, X, AlertTriangle, Shield } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { PasswordCheck, comprehensivePasswordCheck, estimateCrackTime } from '@/lib/passwordValidation';

interface PasswordStrengthIndicatorProps {
  password: string;
  checks: PasswordCheck[];
  showDetails?: boolean;
}

export function PasswordStrengthIndicator({ 
  password, 
  checks,
  showDetails = true 
}: PasswordStrengthIndicatorProps) {
  const { result, hasWeakPatterns, hasSequences, recommendations } =
    comprehensivePasswordCheck(password);

  const strengthColors = {
    'weak': 'bg-danger',
    'medium': 'bg-warning',
    'strong': 'bg-success',
    'very-strong': 'bg-success'
  };

  const strengthLabels = {
    'weak': 'Fraca',
    'medium': 'Média',
    'strong': 'Forte',
    'very-strong': 'Muito Forte'
  };

  const strengthTextColors = {
    'weak': 'text-danger',
    'medium': 'text-warning',
    'strong': 'text-success',
    'very-strong': 'text-success'
  };

  const strengthValue = {
    'weak': 25,
    'medium': 50,
    'strong': 75,
    'very-strong': 100
  };

  return (
    <div className="space-y-3 p-3 rounded-lg bg-muted/50 border">
      {/* Barra de Progresso */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Força da senha:</span>
          <span className={cn("font-semibold", strengthTextColors[result.strength])}>
            {strengthLabels[result.strength]}
          </span>
        </div>
        <Progress 
          value={strengthValue[result.strength]} 
          className="h-2"
          indicatorClassName={strengthColors[result.strength]}
        />
      </div>

      {/* Tempo para quebrar */}
      {password.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Shield className="h-3 w-3" />
          <span>Tempo para quebrar: <strong>{estimateCrackTime(password)}</strong></span>
        </div>
      )}

      {/* Detalhes dos Checks */}
      {showDetails && (
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground">Requisitos:</div>
          <div className="grid grid-cols-1 gap-1.5">
            {checks.map((check, idx) => (
              <CheckItem 
                key={idx}
                label={check.label} 
                checked={check.valid} 
              />
            ))}
          </div>

          {/* Avisos */}
          {(hasWeakPatterns || hasSequences) && (
            <div className="mt-2 p-2 rounded bg-warning/10 border border-warning/20">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                <div className="text-xs space-y-1">
                  {hasWeakPatterns && (
                    <p className="text-warning">⚠️ Senha contém palavra comum</p>
                  )}
                  {hasSequences && (
                    <p className="text-warning">⚠️ Evite sequências óbvias</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Recomendações */}
          {recommendations.length > 0 && !result.valid && (
            <div className="mt-2 space-y-1">
              <div className="text-xs font-medium text-muted-foreground">Sugestões:</div>
              <ul className="text-xs space-y-0.5 text-muted-foreground">
                {recommendations.slice(0, 3).map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-1">
                    <span className="text-primary">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface CheckItemProps {
  label: string;
  checked: boolean;
}

function CheckItem({ label, checked }: CheckItemProps) {
  return (
    <div className="flex items-center gap-2 text-xs">
      {checked ? (
        <div className="flex items-center justify-center w-4 h-4 rounded-full bg-success/10">
          <Check className="h-3 w-3 text-success" />
        </div>
      ) : (
        <div className="flex items-center justify-center w-4 h-4 rounded-full bg-muted">
          <X className="h-3 w-3 text-muted-foreground" />
        </div>
      )}
      <span className={checked ? 'text-success' : 'text-muted-foreground'}>
        {label}
      </span>
    </div>
  );
}