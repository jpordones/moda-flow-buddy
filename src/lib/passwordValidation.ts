// Lista de senhas comuns que devem ser bloqueadas
const COMMON_PASSWORDS = [
  "123456", "password", "12345678", "qwerty", "abc123",
  "password123", "admin", "letmein", "welcome", "monkey",
  "1234567890", "senha123", "fedcom123", "123456789",
  "12345", "iloveyou", "111111", "123123", "admin123",
  "root", "toor", "pass", "test", "guest", "master",
  "changeme", "qwerty123", "password1", "1234", "dragon",
  "sunshine"
];

export interface PasswordChecks {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

export interface PasswordCheck {
  label: string;
  valid: boolean;
}

export interface PasswordValidationResult {
  valid: boolean;
  strength: 'weak' | 'medium' | 'strong' | 'very-strong';
  checks: PasswordCheck[];
  message?: string;
}

/**
 * Valida a força de uma senha com base em múltiplos critérios
 * @param password - Senha a ser validada
 * @returns Resultado da validação com checks individuais
 */
export function validatePassword(password: string): PasswordValidationResult {
  const rawChecks: PasswordChecks = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/`~]/.test(password),
  };

  // Convert to array format for UI compatibility
  const checks: PasswordCheck[] = [
    { label: "8+ caracteres", valid: rawChecks.minLength },
    { label: "Letra maiúscula", valid: rawChecks.hasUppercase },
    { label: "Letra minúscula", valid: rawChecks.hasLowercase },
    { label: "Número", valid: rawChecks.hasNumber },
    { label: "Caractere especial (!@#$%^&*)", valid: rawChecks.hasSpecial }
  ];

  const passedChecks = Object.values(rawChecks).filter(Boolean).length;
  const allValid = passedChecks === 5;

  // Check common passwords
  const isCommon = COMMON_PASSWORDS.includes(password.toLowerCase());

  // Determina a força da senha
  let strength: 'weak' | 'medium' | 'strong' | 'very-strong';
  if (isCommon || passedChecks <= 2) {
    strength = 'weak';
  } else if (passedChecks === 3) {
    strength = 'medium';
  } else if (passedChecks === 4) {
    strength = 'strong';
  } else {
    strength = 'very-strong';
  }

  // Mensagem de validação
  let message: string | undefined;
  if (isCommon) {
    message = "Senha muito comum. Escolha uma mais única.";
  } else if (!allValid) {
    const missing: string[] = [];
    if (!rawChecks.minLength) missing.push('mínimo 8 caracteres');
    if (!rawChecks.hasUppercase) missing.push('letra maiúscula');
    if (!rawChecks.hasLowercase) missing.push('letra minúscula');
    if (!rawChecks.hasNumber) missing.push('número');
    if (!rawChecks.hasSpecial) missing.push('caractere especial');
    
    message = `Senha requer: ${missing.join(', ')}`;
  }

  return {
    valid: allValid && !isCommon,
    strength,
    checks,
    message,
  };
}

/**
 * Retorna informações de força da senha para o indicador visual
 */
export function getPasswordStrength(password: string): { 
  strength: number; 
  label: string; 
  color: string 
} {
  const result = validatePassword(password);
  const passedChecks = result.checks.filter(c => c.valid).length;
  
  // Extra point for length >= 12
  const bonusPoints = password.length >= 12 ? 1 : 0;
  const totalScore = Math.min(passedChecks + bonusPoints, 5);

  switch (result.strength) {
    case 'weak':
      return { strength: Math.min(totalScore, 2), label: 'Muito fraca', color: 'bg-destructive' };
    case 'medium':
      return { strength: Math.min(totalScore, 3), label: 'Média', color: 'bg-warning' };
    case 'strong':
      return { strength: Math.min(totalScore, 4), label: 'Forte', color: 'bg-success' };
    case 'very-strong':
      return { strength: 5, label: 'Muito forte', color: 'bg-success' };
    default:
      return { strength: totalScore, label: 'Fraca', color: 'bg-orange-500' };
  }
}

/**
 * Verifica se a senha contém padrões comuns fracos
 */
export function hasCommonPatterns(password: string): boolean {
  const commonPatterns = [
    /^password/i,
    /^123456/,
    /^qwerty/i,
    /^abc123/i,
    /^letmein/i,
    /^welcome/i,
    /^monkey/i,
    /^dragon/i,
    /^master/i,
    /^sunshine/i,
  ];

  return commonPatterns.some(pattern => pattern.test(password));
}

/**
 * Verifica se a senha contém sequências óbvias
 */
export function hasSequentialChars(password: string): boolean {
  // Verifica sequências numéricas
  if (/012|123|234|345|456|567|678|789|890/.test(password)) {
    return true;
  }
  
  // Verifica sequências alfabéticas
  if (/abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz/i.test(password)) {
    return true;
  }

  // Verifica caracteres repetidos (3+)
  if (/(.)\1{2,}/.test(password)) {
    return true;
  }

  return false;
}

/**
 * Avaliação completa da senha incluindo padrões fracos
 */
export function comprehensivePasswordCheck(password: string): {
  result: PasswordValidationResult;
  hasWeakPatterns: boolean;
  hasSequences: boolean;
  recommendations: string[];
} {
  const result = validatePassword(password);
  const hasWeakPatterns = hasCommonPatterns(password);
  const hasSequences = hasSequentialChars(password);

  const recommendations: string[] = [];

  if (!result.valid) {
    const rawChecks: PasswordChecks = {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/`~]/.test(password),
    };

    if (!rawChecks.minLength) {
      recommendations.push('Use pelo menos 8 caracteres');
    }
    if (!rawChecks.hasUppercase) {
      recommendations.push('Adicione letras maiúsculas (A-Z)');
    }
    if (!rawChecks.hasLowercase) {
      recommendations.push('Adicione letras minúsculas (a-z)');
    }
    if (!rawChecks.hasNumber) {
      recommendations.push('Adicione números (0-9)');
    }
    if (!rawChecks.hasSpecial) {
      recommendations.push('Adicione caracteres especiais (!@#$%^&*)');
    }
  }

  if (hasWeakPatterns) {
    recommendations.push('Evite palavras comuns como "password" ou "123456"');
  }

  if (hasSequences) {
    recommendations.push('Evite sequências óbvias como "abc" ou "123"');
  }

  if (password.length < 12 && result.valid) {
    recommendations.push('Considere usar 12+ caracteres para maior segurança');
  }

  return {
    result,
    hasWeakPatterns,
    hasSequences,
    recommendations,
  };
}

/**
 * Gera uma senha forte aleatória
 */
export function generateStrongPassword(length: number = 16): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  const allChars = uppercase + lowercase + numbers + special;
  
  let password = '';
  
  // Garante pelo menos um de cada tipo
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  // Preenche o resto aleatoriamente
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Embaralha a senha
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Calcula o tempo estimado para quebrar a senha por força bruta
 */
export function estimateCrackTime(password: string): string {
  let charsetSize = 0;
  
  if (/[a-z]/.test(password)) charsetSize += 26;
  if (/[A-Z]/.test(password)) charsetSize += 26;
  if (/[0-9]/.test(password)) charsetSize += 10;
  if (/[^A-Za-z0-9]/.test(password)) charsetSize += 32;

  const combinations = Math.pow(charsetSize, password.length);
  
  // Assumindo 1 bilhão de tentativas por segundo
  const secondsToBreak = combinations / 1_000_000_000;

  if (secondsToBreak < 1) return 'Instantâneo';
  if (secondsToBreak < 60) return `${Math.round(secondsToBreak)} segundos`;
  if (secondsToBreak < 3600) return `${Math.round(secondsToBreak / 60)} minutos`;
  if (secondsToBreak < 86400) return `${Math.round(secondsToBreak / 3600)} horas`;
  if (secondsToBreak < 2592000) return `${Math.round(secondsToBreak / 86400)} dias`;
  if (secondsToBreak < 31536000) return `${Math.round(secondsToBreak / 2592000)} meses`;
  
  const years = Math.round(secondsToBreak / 31536000);
  if (years > 1_000_000) return 'Milhões de anos';
  if (years > 1_000) return `${Math.round(years / 1000)}mil anos`;
  
  return `${years} anos`;
}
