/**
 * Formata um valor numérico para moeda brasileira (R$ 1.234,56)
 */
export function formatarMoeda(valor: number | string | null | undefined): string {
  if (valor === null || valor === undefined) return 'R$ 0,00';
  
  const numero = typeof valor === 'string' ? parseFloat(valor) : valor;
  
  if (isNaN(numero)) return 'R$ 0,00';
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numero);
}

/**
 * Formata um número com separadores brasileiros (1.234,56)
 */
export function formatarNumero(valor: number | string | null | undefined, casasDecimais: number = 2): string {
  if (valor === null || valor === undefined) return '0,00';
  
  const numero = typeof valor === 'string' ? parseFloat(valor) : valor;
  
  if (isNaN(numero)) return '0,00';
  
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: casasDecimais,
    maximumFractionDigits: casasDecimais
  }).format(numero);
}

/**
 * Converte string formatada em BRL para número
 * "R$ 1.234,56" -> 1234.56
 */
export function parseMoeda(valorFormatado: string | null | undefined): number {
  if (!valorFormatado) return 0;
  
  const numero = valorFormatado
    .replace('R$', '')
    .replace(/\s/g, '')
    .replace(/\./g, '')
    .replace(',', '.')
    .trim();
  
  return parseFloat(numero) || 0;
}

/**
 * Formata porcentagem (12,5%)
 */
export function formatarPorcentagem(valor: number | string | null | undefined, casasDecimais: number = 1): string {
  if (valor === null || valor === undefined) return '0%';
  
  const numero = typeof valor === 'string' ? parseFloat(valor) : valor;
  
  if (isNaN(numero)) return '0%';
  
  return `${formatarNumero(numero, casasDecimais)}%`;
}
