// Lista de senhas comuns que devem ser bloqueadas
const COMMON_PASSWORDS = [
  "123456", "password", "12345678", "qwerty", "abc123",
  "password123", "admin", "letmein", "welcome", "monkey",
  "1234567890", "senha123", "fedcom123", "123456789",
  "12345", "iloveyou", "111111", "123123", "admin123",
  "root", "toor", "pass", "test", "guest", "master",
  "changeme", "qwerty123", "password1", "1234"
];

export interface PasswordValidationResult {
  valid: boolean;
  message?: string;
  checks: PasswordCheck[];
}

export interface PasswordCheck {
  label: string;
  valid: boolean;
}

export function validatePassword(password: string): PasswordValidationResult {
  const checks: PasswordCheck[] = [
    { label: "8+ caracteres", valid: password.length >= 8 },
    { label: "Letra maiúscula", valid: /[A-Z]/.test(password) },
    { label: "Letra minúscula", valid: /[a-z]/.test(password) },
    { label: "Número", valid: /[0-9]/.test(password) },
    { label: "Caractere especial (!@#$%^&*)", valid: /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/`~]/.test(password) }
  ];

  // Check minimum length
  if (password.length < 8) {
    return { 
      valid: false, 
      message: "Senha muito curta (mínimo 8 caracteres)", 
      checks 
    };
  }

  // Check for uppercase
  if (!/[A-Z]/.test(password)) {
    return { 
      valid: false, 
      message: "Adicione ao menos 1 letra maiúscula", 
      checks 
    };
  }

  // Check for lowercase
  if (!/[a-z]/.test(password)) {
    return { 
      valid: false, 
      message: "Adicione ao menos 1 letra minúscula", 
      checks 
    };
  }

  // Check for number
  if (!/[0-9]/.test(password)) {
    return { 
      valid: false, 
      message: "Adicione ao menos 1 número", 
      checks 
    };
  }

  // Check for special character
  if (!/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/`~]/.test(password)) {
    return { 
      valid: false, 
      message: "Adicione ao menos 1 caractere especial", 
      checks 
    };
  }

  // Check against common passwords
  if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
    return { 
      valid: false, 
      message: "Senha muito comum. Escolha uma mais única.", 
      checks 
    };
  }

  return { valid: true, checks };
}

export function getPasswordStrength(password: string): { 
  strength: number; 
  label: string; 
  color: string 
} {
  let strength = 0;
  
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/`~]/.test(password)) strength++;

  if (strength <= 2) return { strength: Math.min(strength, 5), label: 'Muito fraca', color: 'bg-destructive' };
  if (strength <= 3) return { strength: Math.min(strength, 5), label: 'Fraca', color: 'bg-orange-500' };
  if (strength <= 4) return { strength: Math.min(strength, 5), label: 'Média', color: 'bg-warning' };
  if (strength <= 5) return { strength: Math.min(strength, 5), label: 'Forte', color: 'bg-success' };
  return { strength: 5, label: 'Muito forte', color: 'bg-success' };
}
