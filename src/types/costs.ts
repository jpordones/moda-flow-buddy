export interface CustoFixo {
  id: string;
  nome: string;
  valor: number;
  categoria: string;
}

export interface CustoVariavel {
  id: string;
  nome: string;
  valor: number;
  tipo: 'monetario' | 'percentual';
  categoria: string;
}

export interface ParametrosCalculo {
  mediaVendasMes: number;
  margemLucro: number;
  margemPremium: number;
}

export interface ResultadosCalculo {
  custoVariavelTotal: number;
  custoFixoPorPeca: number;
  custoRealCompleto: number;
  precoIdeal: number;
  precoMinimo: number;
  precoPremium: number;
  lucroPorPeca: number;
  margemPercentual: number;
  totalCustosFixos: number;
}
