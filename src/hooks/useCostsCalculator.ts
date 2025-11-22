import { useState, useEffect, useMemo } from 'react';
import { CustoFixo, CustoVariavel, ParametrosCalculo, ResultadosCalculo } from '@/types/costs';

const STORAGE_KEY = 'lamar-costs-data';

interface CostsData {
  custosFixos: CustoFixo[];
  custosVariaveis: CustoVariavel[];
  parametros: ParametrosCalculo;
}

const defaultParametros: ParametrosCalculo = {
  mediaVendasMes: 100,
  margemLucro: 50,
  margemPremium: 70,
};

const custosFixosIniciais: CustoFixo[] = [
  { id: '1', nome: 'Domínio', valor: 50, categoria: 'infraestrutura' },
  { id: '2', nome: 'Hospedagem do site', valor: 100, categoria: 'infraestrutura' },
  { id: '3', nome: 'Contabilidade', valor: 300, categoria: 'administrativo' },
  { id: '4', nome: 'Manutenção CNPJ', valor: 80, categoria: 'administrativo' },
  { id: '5', nome: 'Jurídico', valor: 200, categoria: 'administrativo' },
  { id: '6', nome: 'Custos operacionais administrativos', valor: 500, categoria: 'administrativo' },
  { id: '7', nome: 'Assinaturas de ferramentas e softwares', valor: 250, categoria: 'tecnologia' },
];

const custosVariaveisIniciais: CustoVariavel[] = [
  { id: '1', nome: 'Fornecedor/Matéria-prima', valor: 20, tipo: 'monetario', categoria: 'producao' },
  { id: '2', nome: 'Etiquetas', valor: 2, tipo: 'monetario', categoria: 'producao' },
  { id: '3', nome: 'Embalagens/Sacolas', valor: 3, tipo: 'monetario', categoria: 'producao' },
  { id: '4', nome: 'Taxa de meios de pagamento', valor: 3.5, tipo: 'percentual', categoria: 'financeiro' },
  { id: '5', nome: 'Envio e logística', valor: 15, tipo: 'monetario', categoria: 'logistica' },
  { id: '6', nome: 'Impostos sobre vendas', valor: 8, tipo: 'percentual', categoria: 'financeiro' },
  { id: '7', nome: 'Custos de criação (design/moodboard)', valor: 5, tipo: 'monetario', categoria: 'criacao' },
  { id: '8', nome: 'Fotos/vídeos dos produtos', valor: 10, tipo: 'monetario', categoria: 'marketing' },
  { id: '9', nome: 'Marketing e tráfego pago (diário)', valor: 100, tipo: 'monetario', categoria: 'marketing' },
  { id: '10', nome: 'Reserva para trocas e devoluções', valor: 5, tipo: 'monetario', categoria: 'operacional' },
  { id: '11', nome: 'Entregas locais/nacionais', valor: 8, tipo: 'monetario', categoria: 'logistica' },
];

export function useCostsCalculator() {
  const [custosFixos, setCustosFixos] = useState<CustoFixo[]>(custosFixosIniciais);
  const [custosVariaveis, setCustosVariaveis] = useState<CustoVariavel[]>(custosVariaveisIniciais);
  const [parametros, setParametros] = useState<ParametrosCalculo>(defaultParametros);
  const [isLoaded, setIsLoaded] = useState(false);

  // Carregar dados do localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data: CostsData = JSON.parse(stored);
        setCustosFixos(data.custosFixos);
        setCustosVariaveis(data.custosVariaveis);
        setParametros(data.parametros);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    }
    setIsLoaded(true);
  }, []);

  // Salvar dados no localStorage
  useEffect(() => {
    if (isLoaded) {
      const data: CostsData = {
        custosFixos,
        custosVariaveis,
        parametros,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [custosFixos, custosVariaveis, parametros, isLoaded]);

  // Cálculos automáticos
  const resultados = useMemo((): ResultadosCalculo => {
    // 1. Total de custos fixos mensais
    const totalCustosFixos = custosFixos.reduce((acc, custo) => acc + custo.valor, 0);

    // 2. Custo fixo por peça
    const custoFixoPorPeca = parametros.mediaVendasMes > 0 
      ? totalCustosFixos / parametros.mediaVendasMes 
      : 0;

    // 3. Custo variável total (sem percentuais)
    const custoVariavelMonetario = custosVariaveis
      .filter(c => c.tipo === 'monetario')
      .reduce((acc, custo) => acc + custo.valor, 0);

    // 4. Custo real completo base (sem impostos/taxas percentuais)
    const custoBase = custoVariavelMonetario + custoFixoPorPeca;

    // 5. Calcular taxas percentuais sobre o preço de venda
    const percentuaisTotais = custosVariaveis
      .filter(c => c.tipo === 'percentual')
      .reduce((acc, custo) => acc + custo.valor, 0);

    // 6. Preços calculados
    // Para custos percentuais, precisamos ajustar a fórmula:
    // Preço = CustoBase / (1 - %Taxas/100 - %Margem/100)
    const fatorPercentual = (percentuaisTotais + parametros.margemLucro) / 100;
    const precoIdeal = fatorPercentual < 1 ? custoBase / (1 - fatorPercentual) : custoBase * 2;

    // Calcular custos percentuais em valor absoluto baseado no preço
    const custoVariavelPercentual = (percentuaisTotais / 100) * precoIdeal;
    const custoVariavelTotal = custoVariavelMonetario + custoVariavelPercentual;
    const custoRealCompleto = custoVariavelTotal + custoFixoPorPeca;

    // Preço mínimo (break-even)
    const fatorPercentualMinimo = percentuaisTotais / 100;
    const precoMinimo = fatorPercentualMinimo < 1 
      ? custoBase / (1 - fatorPercentualMinimo) 
      : custoBase;

    // Preço premium
    const fatorPremium = (percentuaisTotais + parametros.margemPremium) / 100;
    const precoPremium = fatorPremium < 1 ? custoBase / (1 - fatorPremium) : custoBase * 3;

    // Lucro por peça
    const lucroPorPeca = precoIdeal - custoRealCompleto;

    // Margem percentual efetiva
    const margemPercentual = precoIdeal > 0 
      ? ((precoIdeal - custoRealCompleto) / precoIdeal) * 100 
      : 0;

    return {
      custoVariavelTotal,
      custoFixoPorPeca,
      custoRealCompleto,
      precoIdeal,
      precoMinimo,
      precoPremium,
      lucroPorPeca,
      margemPercentual,
      totalCustosFixos,
    };
  }, [custosFixos, custosVariaveis, parametros]);

  // CRUD Custos Fixos
  const adicionarCustoFixo = (custo: Omit<CustoFixo, 'id'>) => {
    const novoCusto: CustoFixo = {
      ...custo,
      id: Date.now().toString(),
    };
    setCustosFixos([...custosFixos, novoCusto]);
  };

  const atualizarCustoFixo = (id: string, custo: Partial<CustoFixo>) => {
    setCustosFixos(custosFixos.map(c => c.id === id ? { ...c, ...custo } : c));
  };

  const removerCustoFixo = (id: string) => {
    setCustosFixos(custosFixos.filter(c => c.id !== id));
  };

  // CRUD Custos Variáveis
  const adicionarCustoVariavel = (custo: Omit<CustoVariavel, 'id'>) => {
    const novoCusto: CustoVariavel = {
      ...custo,
      id: Date.now().toString(),
    };
    setCustosVariaveis([...custosVariaveis, novoCusto]);
  };

  const atualizarCustoVariavel = (id: string, custo: Partial<CustoVariavel>) => {
    setCustosVariaveis(custosVariaveis.map(c => c.id === id ? { ...c, ...custo } : c));
  };

  const removerCustoVariavel = (id: string) => {
    setCustosVariaveis(custosVariaveis.filter(c => c.id !== id));
  };

  // Atualizar parâmetros
  const atualizarParametros = (novosParametros: Partial<ParametrosCalculo>) => {
    setParametros({ ...parametros, ...novosParametros });
  };

  return {
    custosFixos,
    custosVariaveis,
    parametros,
    resultados,
    adicionarCustoFixo,
    atualizarCustoFixo,
    removerCustoFixo,
    adicionarCustoVariavel,
    atualizarCustoVariavel,
    removerCustoVariavel,
    atualizarParametros,
  };
}
