import { Check, X } from 'lucide-react';
import { PasswordCheck, getPasswordStrength } from '@/lib/passwordValidation';

interface PasswordStrengthIndicatorProps {
  password: string;
  checks: PasswordCheck[];
}

export function PasswordStrengthIndicator({ password, checks }: PasswordStrengthIndicatorProps) {
  const { strength, label, color } = getPasswordStrength(password);

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
        <p className={`text-xs font-medium ${color.replace('bg-', 'text-')}`}>
          Força: {label}
        </p>
      </div>

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
