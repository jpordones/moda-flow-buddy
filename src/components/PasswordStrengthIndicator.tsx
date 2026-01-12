import { Check, X, Clock, AlertTriangle } from 'lucide-react';
import { 
  PasswordCheck, 
  getPasswordStrength, 
  hasSequentialChars, 
  hasCommonPatterns,
  estimateCrackTime 
} from '@/lib/passwordValidation';

interface PasswordStrengthIndicatorProps {
  password: string;
  checks: PasswordCheck[];
  showCrackTime?: boolean;
}

export function PasswordStrengthIndicator({ 
  password, 
  checks, 
  showCrackTime = true 
}: PasswordStrengthIndicatorProps) {
  const { strength, label, color } = getPasswordStrength(password);
  const hasSequences = hasSequentialChars(password);
  const hasPatterns = hasCommonPatterns(password);
  const crackTime = estimateCrackTime(password);

  return (
    <div className="space-y-3 mt-2">
      {/* Strength bar */}
      <div className="space-y-1">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= strength ? color : 'bg-muted'
              }`}
            />
          ))}
        </div>
        <div className="flex items-center justify-between">
          <p className={`text-xs font-medium ${color.replace('bg-', 'text-')}`}>
            Força: {label}
          </p>
          {showCrackTime && password.length > 0 && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {crackTime}
            </p>
          )}
        </div>
      </div>

      {/* Warnings for patterns */}
      {(hasSequences || hasPatterns) && password.length > 0 && (
        <div className="flex items-start gap-2 text-xs text-warning bg-warning/10 p-2 rounded-md">
          <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>
            {hasPatterns && 'Evite palavras comuns. '}
            {hasSequences && 'Evite sequências óbvias (abc, 123).'}
          </span>
        </div>
      )}

      {/* Checklist */}
      <div className="space-y-1.5 bg-muted/50 rounded-lg p-3">
        {checks.map((check, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            {check.valid ? (
              <Check className="h-4 w-4 text-success flex-shrink-0" />
            ) : (
              <X className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            )}
            <span className={check.valid ? 'text-foreground' : 'text-muted-foreground'}>
              {check.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
