import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatarMoeda, formatarPorcentagem, formatarNumero } from './formatters';
import { PricingData, PricingResult, PricingScenario, PricingAlert, marketplacePresets } from '@/types/pricing';

interface CompanyInfo {
  companyName: string | null;
  logoUrl: string | null;
  document: string | null;
}

interface ReportData {
  data: PricingData;
  result: PricingResult;
  scenarios: PricingScenario[];
  alerts: PricingAlert[];
  companyInfo: CompanyInfo;
}

// Cores do tema profissional
const COLORS = {
  primary: '#1a365d',      // Azul escuro profissional
  primaryLight: '#2b4c7e',
  accent: '#FFC72C',       // Dourado destaque
  text: '#1a1a1a',
  textMuted: '#4a5568',
  success: '#047857',
  warning: '#b45309',
  error: '#b91c1c',
  border: '#cbd5e0',
  background: '#f7fafc',
  lightBg: '#edf2f7',
};

// Formatacao de data pt-BR
function formatarDataCompleta(): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  return new Intl.DateTimeFormat('pt-BR', options).format(new Date());
}

// Nome do arquivo
function gerarNomeArquivo(): string {
  const data = new Date();
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `relatorio-precificacao-${ano}-${mes}-${dia}.pdf`;
}

// Adicionar cabecalho profissional
async function addHeader(
  doc: jsPDF, 
  companyInfo: CompanyInfo, 
  pageWidth: number
): Promise<number> {
  let yPosition = 15;
  const margin = 20;

  // Tentar carregar logo
  if (companyInfo.logoUrl) {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject();
        img.src = companyInfo.logoUrl!;
      });

      const maxSize = 35;
      const ratio = Math.min(maxSize / img.width, maxSize / img.height);
      const logoWidth = img.width * ratio;
      const logoHeight = img.height * ratio;
      
      doc.addImage(img, 'PNG', margin, yPosition, logoWidth, logoHeight);
      yPosition += logoHeight + 3;
    } catch {
      if (companyInfo.companyName) {
        doc.setFontSize(16);
        doc.setTextColor(COLORS.primary);
        doc.setFont('helvetica', 'bold');
        doc.text(companyInfo.companyName.toUpperCase(), margin, yPosition + 8);
        yPosition += 15;
      }
    }
  } else if (companyInfo.companyName) {
    doc.setFontSize(16);
    doc.setTextColor(COLORS.primary);
    doc.setFont('helvetica', 'bold');
    doc.text(companyInfo.companyName.toUpperCase(), margin, yPosition + 8);
    yPosition += 15;
  }

  // Linha divisoria superior
  yPosition += 3;
  doc.setDrawColor(COLORS.primary);
  doc.setLineWidth(0.8);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 8;

  // Titulo do relatorio
  doc.setFontSize(20);
  doc.setTextColor(COLORS.primary);
  doc.setFont('helvetica', 'bold');
  doc.text('RELATORIO DE PRECIFICACAO', margin, yPosition);
  
  // Subtitulo
  yPosition += 7;
  doc.setFontSize(11);
  doc.setTextColor(COLORS.textMuted);
  doc.setFont('helvetica', 'normal');
  doc.text('Analise completa de custos, margens e cenarios de venda', margin, yPosition);

  // Data de geracao
  yPosition += 6;
  doc.setFontSize(9);
  doc.text(`Gerado em: ${formatarDataCompleta()}`, margin, yPosition);

  // Linha divisoria inferior
  yPosition += 5;
  doc.setDrawColor(COLORS.accent);
  doc.setLineWidth(1.5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);

  return yPosition + 12;
}

// Secao: Resumo do Resultado
function addResultSummary(
  doc: jsPDF, 
  result: PricingResult, 
  data: PricingData,
  startY: number, 
  pageWidth: number
): number {
  const margin = 20;
  let yPosition = startY;

  // Titulo da secao
  doc.setFontSize(13);
  doc.setTextColor(COLORS.primary);
  doc.setFont('helvetica', 'bold');
  doc.text('1. RESUMO DO RESULTADO DA PRECIFICACAO', margin, yPosition);
  
  yPosition += 5;
  doc.setFontSize(9);
  doc.setTextColor(COLORS.textMuted);
  doc.setFont('helvetica', 'normal');
  doc.text('Os valores abaixo representam o resultado final do calculo de precificacao baseado nos custos informados.', margin, yPosition);
  yPosition += 8;

  // Cards principais em grid 2x2
  const cardWidth = (pageWidth - 2 * margin - 10) / 2;
  const cardHeight = 22;
  
  const mainCards = [
    { 
      label: 'PRECO SUGERIDO DE VENDA', 
      value: formatarMoeda(result.suggestedPrice), 
      sublabel: 'Valor recomendado para comercializacao',
      highlight: true 
    },
    { 
      label: 'CUSTO TOTAL POR UNIDADE', 
      value: formatarMoeda(result.totalCostBeforeSale + result.variableFixedCosts), 
      sublabel: 'Soma de todos os custos por peca',
      highlight: false 
    },
    { 
      label: 'LUCRO LIQUIDO POR PECA', 
      value: formatarMoeda(result.netProfit), 
      sublabel: result.netProfit > 0 ? 'Ganho apos todos os descontos' : 'Atencao: margem negativa',
      highlight: false,
      isNegative: result.netProfit < 0
    },
    { 
      label: 'MARGEM LIQUIDA', 
      value: formatarPorcentagem(result.netMargin), 
      sublabel: result.netMargin >= 15 ? 'Margem saudavel' : 'Margem abaixo do ideal (15%)',
      highlight: false,
      isWarning: result.netMargin < 15
    },
  ];

  mainCards.forEach((card, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const x = margin + col * (cardWidth + 10);
    const y = yPosition + row * (cardHeight + 6);

    // Fundo do card
    if (card.highlight) {
      doc.setFillColor(COLORS.primary);
      doc.setDrawColor(COLORS.primary);
    } else {
      doc.setFillColor(COLORS.background);
      doc.setDrawColor(COLORS.border);
    }
    doc.roundedRect(x, y, cardWidth, cardHeight, 2, 2, 'FD');

    // Label
    doc.setFontSize(8);
    doc.setTextColor(card.highlight ? '#ffffff' : COLORS.textMuted);
    doc.setFont('helvetica', 'bold');
    doc.text(card.label, x + 5, y + 6);

    // Valor
    doc.setFontSize(14);
    if (card.isNegative) {
      doc.setTextColor(COLORS.error);
    } else if (card.isWarning) {
      doc.setTextColor(COLORS.warning);
    } else {
      doc.setTextColor(card.highlight ? '#ffffff' : COLORS.text);
    }
    doc.setFont('helvetica', 'bold');
    doc.text(card.value, x + 5, y + 15);

    // Sublabel
    doc.setFontSize(7);
    doc.setTextColor(card.highlight ? '#d1d5db' : COLORS.textMuted);
    doc.setFont('helvetica', 'normal');
    doc.text(card.sublabel, x + 5, y + 20);
  });

  yPosition += Math.ceil(mainCards.length / 2) * (cardHeight + 6) + 8;

  // Cards secundarios
  const secondaryCards = [
    { label: 'Preco Minimo (ponto de equilibrio)', value: formatarMoeda(result.minimumPrice) },
    { label: 'Preco Premium (margem superior)', value: formatarMoeda(result.premiumPrice) },
  ];

  doc.setFillColor(COLORS.lightBg);
  doc.setDrawColor(COLORS.border);
  doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 14, 2, 2, 'FD');

  secondaryCards.forEach((card, index) => {
    const x = margin + 5 + index * ((pageWidth - 2 * margin) / 2);
    doc.setFontSize(8);
    doc.setTextColor(COLORS.textMuted);
    doc.setFont('helvetica', 'normal');
    doc.text(card.label + ':', x, yPosition + 5);
    
    doc.setFontSize(10);
    doc.setTextColor(COLORS.text);
    doc.setFont('helvetica', 'bold');
    doc.text(card.value, x, yPosition + 11);
  });

  return yPosition + 22;
}

// Secao: Impacto Mensal Estimado
function addMonthlyImpact(
  doc: jsPDF, 
  result: PricingResult, 
  data: PricingData,
  startY: number, 
  pageWidth: number
): number {
  const margin = 20;
  let yPosition = startY;

  doc.setFontSize(13);
  doc.setTextColor(COLORS.primary);
  doc.setFont('helvetica', 'bold');
  doc.text('2. ESTIMATIVA DE RESULTADO MENSAL', margin, yPosition);
  
  yPosition += 5;
  doc.setFontSize(9);
  doc.setTextColor(COLORS.textMuted);
  doc.setFont('helvetica', 'normal');
  doc.text('Projecao baseada no volume de vendas informado. Estes valores sao estimativas e podem variar conforme a demanda real.', margin, yPosition);
  yPosition += 8;

  const volume = data.config.monthlyVolume;
  const monthlyRevenue = result.suggestedPrice * volume;
  const monthlyCost = (result.totalCostBeforeSale + result.variableFixedCosts) * volume;
  const monthlyProfit = result.netProfit * volume;

  // Tabela de impacto mensal
  autoTable(doc, {
    startY: yPosition,
    head: [['Indicador', 'Valor Mensal', 'Observacao']],
    body: [
      ['Volume de vendas previsto', formatarNumero(volume, 0) + ' unidades', 'Base para os calculos'],
      ['Faturamento bruto estimado', formatarMoeda(monthlyRevenue), 'Preco x Volume'],
      ['Custo total estimado', formatarMoeda(monthlyCost), 'Todos os custos somados'],
      ['Lucro liquido estimado', formatarMoeda(monthlyProfit), monthlyProfit > 0 ? 'Resultado positivo' : 'Atencao: resultado negativo'],
    ],
    theme: 'plain',
    headStyles: { 
      fillColor: COLORS.primary, 
      textColor: '#ffffff',
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: { 
      fontSize: 9,
      cellPadding: 4,
    },
    alternateRowStyles: {
      fillColor: COLORS.background,
    },
    columnStyles: {
      0: { cellWidth: 'auto', fontStyle: 'bold' },
      1: { cellWidth: 50, halign: 'right' },
      2: { cellWidth: 60, textColor: COLORS.textMuted, fontSize: 8 },
    },
    margin: { left: margin, right: margin },
  });

  return (doc as any).lastAutoTable.finalY + 12;
}

// Secao: Detalhamento de Custos do Produto
function addProductCostsSection(
  doc: jsPDF, 
  data: PricingData, 
  startY: number,
  pageWidth: number
): number {
  const margin = 20;

  doc.setFontSize(13);
  doc.setTextColor(COLORS.primary);
  doc.setFont('helvetica', 'bold');
  doc.text('3. DETALHAMENTO DOS CUSTOS', margin, startY);
  
  let yPosition = startY + 5;
  doc.setFontSize(9);
  doc.setTextColor(COLORS.textMuted);
  doc.setFont('helvetica', 'normal');
  doc.text('Esta secao apresenta todos os custos que compoem o preco final do produto.', margin, yPosition);
  yPosition += 10;

  // 3.1 Custos Diretos do Produto
  doc.setFontSize(11);
  doc.setTextColor(COLORS.primaryLight);
  doc.setFont('helvetica', 'bold');
  doc.text('3.1 Custos Diretos do Produto (por unidade)', margin, yPosition);
  yPosition += 3;

  const productCostsLabels: Record<string, string> = {
    fabric: 'Tecido ou material principal',
    accessories: 'Aviamentos e acessorios',
    packaging: 'Embalagem individual',
    laborCost: 'Mao de obra de producao',
    qualityControl: 'Controle de qualidade',
    photography: 'Fotografia (rateio)',
    other: 'Outros custos diretos',
  };

  const productTableData: (string | number)[][] = [];
  let productTotal = 0;

  Object.entries(data.productCosts).forEach(([key, value]) => {
    if (value > 0) {
      productTableData.push([productCostsLabels[key] || key, formatarMoeda(value)]);
      productTotal += value;
    }
  });

  if (productTableData.length === 0) {
    productTableData.push(['Nenhum custo direto informado', '-']);
  }

  autoTable(doc, {
    startY: yPosition,
    head: [['Descricao do Custo', 'Valor por Unidade']],
    body: productTableData,
    foot: [['SUBTOTAL - Custos Diretos', formatarMoeda(productTotal)]],
    theme: 'striped',
    headStyles: { 
      fillColor: COLORS.primaryLight, 
      textColor: '#ffffff',
      fontStyle: 'bold',
      fontSize: 9,
    },
    footStyles: { 
      fillColor: COLORS.accent, 
      textColor: COLORS.text,
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: { fontSize: 9, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 45, halign: 'right' },
    },
    margin: { left: margin, right: margin },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 10;

  // 3.2 Custos Fixos Mensais
  doc.setFontSize(11);
  doc.setTextColor(COLORS.primaryLight);
  doc.setFont('helvetica', 'bold');
  doc.text('3.2 Custos Fixos Mensais', margin, yPosition);
  
  yPosition += 4;
  doc.setFontSize(8);
  doc.setTextColor(COLORS.textMuted);
  doc.setFont('helvetica', 'normal');
  doc.text(`Estes custos sao diluidos pelo volume mensal de ${formatarNumero(data.config.monthlyVolume, 0)} unidades.`, margin, yPosition);
  yPosition += 3;

  const fixedCostsLabels: Record<string, string> = {
    rent: 'Aluguel do espaco',
    utilities: 'Energia, agua e gas',
    internet: 'Internet e telefone',
    salaries: 'Salarios e encargos',
    benefits: 'Beneficios trabalhistas',
    software: 'Softwares e sistemas',
    accounting: 'Servicos contabeis',
    insurance: 'Seguros',
    maintenance: 'Manutencao',
    other: 'Outros custos fixos',
  };

  const fixedTableData: (string | number)[][] = [];
  let fixedTotal = 0;

  Object.entries(data.fixedCosts).forEach(([key, value]) => {
    if (value > 0) {
      fixedTableData.push([fixedCostsLabels[key] || key, formatarMoeda(value)]);
      fixedTotal += value;
    }
  });

  if (fixedTableData.length === 0) {
    fixedTableData.push(['Nenhum custo fixo informado', '-']);
  }

  const fixedPerUnit = data.config.monthlyVolume > 0 ? fixedTotal / data.config.monthlyVolume : 0;

  autoTable(doc, {
    startY: yPosition,
    head: [['Descricao do Custo', 'Valor Mensal']],
    body: fixedTableData,
    foot: [
      ['TOTAL MENSAL', formatarMoeda(fixedTotal)],
      ['CUSTO POR UNIDADE (diluido)', formatarMoeda(fixedPerUnit)],
    ],
    theme: 'striped',
    headStyles: { 
      fillColor: COLORS.primaryLight, 
      textColor: '#ffffff',
      fontStyle: 'bold',
      fontSize: 9,
    },
    footStyles: { 
      fillColor: COLORS.accent, 
      textColor: COLORS.text,
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: { fontSize: 9, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 45, halign: 'right' },
    },
    margin: { left: margin, right: margin },
  });

  return (doc as any).lastAutoTable.finalY + 10;
}

// Secao: Custos Variaveis de Venda
function addVariableCostsSection(
  doc: jsPDF, 
  data: PricingData, 
  startY: number
): number {
  const margin = 20;

  doc.setFontSize(11);
  doc.setTextColor(COLORS.primaryLight);
  doc.setFont('helvetica', 'bold');
  doc.text('3.3 Custos Variaveis de Venda', margin, startY);
  
  let yPosition = startY + 4;
  doc.setFontSize(8);
  doc.setTextColor(COLORS.textMuted);
  doc.setFont('helvetica', 'normal');
  doc.text('Custos que incidem sobre cada venda realizada, como taxas de marketplace e frete.', margin, yPosition);
  yPosition += 3;

  const variableCostsItems = [
    { 
      name: 'Taxa de marketplace (' + marketplacePresets[data.variableCosts.marketplaceType].name + ')', 
      type: 'Percentual', 
      value: data.variableCosts.marketplaceFee,
      formatted: formatarPorcentagem(data.variableCosts.marketplaceFee)
    },
    { name: 'Taxa de frete do marketplace', type: 'Fixo', value: data.variableCosts.marketplaceShipping, formatted: formatarMoeda(data.variableCosts.marketplaceShipping) },
    { name: 'Taxa do gateway de pagamento', type: 'Percentual', value: data.variableCosts.paymentGateway, formatted: formatarPorcentagem(data.variableCosts.paymentGateway) },
    { name: 'Custo de frete para o cliente', type: 'Fixo', value: data.variableCosts.shippingCost, formatted: formatarMoeda(data.variableCosts.shippingCost) },
    { name: 'Embalagem de envio', type: 'Fixo', value: data.variableCosts.shippingPackaging, formatted: formatarMoeda(data.variableCosts.shippingPackaging) },
    { name: 'Logistica reversa (devolucoes)', type: 'Percentual', value: data.variableCosts.reverseLogistics, formatted: formatarPorcentagem(data.variableCosts.reverseLogistics) },
    { name: 'Investimento em anuncios', type: 'Percentual', value: data.variableCosts.adsCost, formatted: formatarPorcentagem(data.variableCosts.adsCost) },
    { name: 'Comissao de afiliados', type: 'Percentual', value: data.variableCosts.affiliateCommission, formatted: formatarPorcentagem(data.variableCosts.affiliateCommission) },
  ];

  const tableData = variableCostsItems
    .filter(item => item.value > 0)
    .map(item => [item.name, item.type, item.formatted]);

  if (tableData.length === 0) {
    tableData.push(['Nenhum custo variavel informado', '-', '-']);
  }

  autoTable(doc, {
    startY: yPosition,
    head: [['Descricao', 'Tipo', 'Valor']],
    body: tableData,
    theme: 'striped',
    headStyles: { 
      fillColor: COLORS.primaryLight, 
      textColor: '#ffffff',
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: { fontSize: 9, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 30, halign: 'center' },
      2: { cellWidth: 35, halign: 'right' },
    },
    margin: { left: margin, right: margin },
  });

  return (doc as any).lastAutoTable.finalY + 12;
}

// Secao: Configuracao de Impostos
function addTaxesSection(
  doc: jsPDF, 
  data: PricingData, 
  startY: number,
  pageWidth: number
): number {
  const margin = 20;

  doc.setFontSize(13);
  doc.setTextColor(COLORS.primary);
  doc.setFont('helvetica', 'bold');
  doc.text('4. CONFIGURACAO DE IMPOSTOS', margin, startY);
  
  let yPosition = startY + 5;
  doc.setFontSize(9);
  doc.setTextColor(COLORS.textMuted);
  doc.setFont('helvetica', 'normal');
  doc.text('Regime tributario e aliquotas utilizadas nos calculos. Consulte seu contador para validar estes valores.', margin, yPosition);
  yPosition += 8;

  const regimeLabels: Record<string, string> = {
    simples: 'Simples Nacional',
    presumido: 'Lucro Presumido',
    real: 'Lucro Real',
  };

  let tableData: (string | number)[][] = [];

  if (data.taxes.taxRegime === 'simples') {
    tableData = [
      ['Regime tributario', regimeLabels[data.taxes.taxRegime], 'Regime simplificado para pequenas empresas'],
      ['Aliquota do Simples Nacional', formatarPorcentagem(data.taxes.simplesRate), 'Varia conforme faixa de faturamento anual'],
    ];
  } else {
    tableData = [
      ['Regime tributario', regimeLabels[data.taxes.taxRegime], 'Tributacao sobre lucro presumido ou real'],
      ['ICMS', formatarPorcentagem(data.taxes.icms), 'Aliquota varia conforme o estado'],
      ['PIS', formatarPorcentagem(data.taxes.pis), 'Contribuicao social'],
      ['COFINS', formatarPorcentagem(data.taxes.cofins), 'Contribuicao para seguridade social'],
    ];
  }

  autoTable(doc, {
    startY: yPosition,
    head: [['Imposto', 'Valor', 'Observacao']],
    body: tableData,
    theme: 'striped',
    headStyles: { 
      fillColor: COLORS.primaryLight, 
      textColor: '#ffffff',
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: { fontSize: 9, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 'auto', fontStyle: 'bold' },
      1: { cellWidth: 35, halign: 'center' },
      2: { cellWidth: 70, textColor: COLORS.textMuted, fontSize: 8 },
    },
    margin: { left: margin, right: margin },
  });

  return (doc as any).lastAutoTable.finalY + 12;
}

// Secao: Cenarios de Venda
function addScenariosSection(
  doc: jsPDF, 
  scenarios: PricingScenario[], 
  startY: number,
  pageWidth: number
): number {
  const margin = 20;

  doc.setFontSize(13);
  doc.setTextColor(COLORS.primary);
  doc.setFont('helvetica', 'bold');
  doc.text('5. CENARIOS DE VENDA', margin, startY);
  
  let yPosition = startY + 5;
  doc.setFontSize(9);
  doc.setTextColor(COLORS.textMuted);
  doc.setFont('helvetica', 'normal');
  doc.text('Simulacao de diferentes volumes de venda e seus impactos na margem de lucro.', margin, yPosition);
  yPosition += 8;

  // Remover emojis dos nomes dos cenarios
  const scenarioNames: Record<string, string> = {
    'Conservador': 'Cenario Conservador',
    'Realista': 'Cenario Realista',
    'Otimista': 'Cenario Otimista',
  };

  const tableData = scenarios.map(scenario => {
    // Remove emoji do nome
    const cleanName = scenario.name.replace(/[^\w\sáéíóúâêîôûàèìòùãõç-]/gi, '').trim();
    return [
      scenarioNames[cleanName] || cleanName,
      formatarNumero(scenario.volume, 0) + ' un./mes',
      formatarMoeda(scenario.price),
      formatarMoeda(scenario.profit),
      formatarPorcentagem(scenario.margin),
    ];
  });

  autoTable(doc, {
    startY: yPosition,
    head: [['Cenario', 'Volume Mensal', 'Preco Unitario', 'Lucro por Peca', 'Margem']],
    body: tableData,
    theme: 'striped',
    headStyles: { 
      fillColor: COLORS.primary, 
      textColor: '#ffffff',
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: { fontSize: 9, cellPadding: 4 },
    columnStyles: {
      0: { cellWidth: 'auto', fontStyle: 'bold' },
      1: { cellWidth: 35, halign: 'center' },
      2: { cellWidth: 35, halign: 'right' },
      3: { cellWidth: 35, halign: 'right' },
      4: { cellWidth: 25, halign: 'center' },
    },
    margin: { left: margin, right: margin },
  });

  return (doc as any).lastAutoTable.finalY + 12;
}

// Secao: Conclusao e Recomendacoes
function addConclusionSection(
  doc: jsPDF, 
  result: PricingResult,
  alerts: PricingAlert[], 
  startY: number,
  pageWidth: number
): number {
  const margin = 20;
  let yPosition = startY;

  doc.setFontSize(13);
  doc.setTextColor(COLORS.primary);
  doc.setFont('helvetica', 'bold');
  doc.text('6. CONCLUSAO E RECOMENDACOES', margin, yPosition);
  
  yPosition += 5;
  doc.setFontSize(9);
  doc.setTextColor(COLORS.textMuted);
  doc.setFont('helvetica', 'normal');
  doc.text('Analise geral da precificacao e pontos de atencao identificados.', margin, yPosition);
  yPosition += 10;

  // Resumo da analise
  const isHealthy = result.netMargin >= 15 && result.netProfit > 0;
  
  doc.setFillColor(isHealthy ? '#dcfce7' : '#fef3c7');
  doc.setDrawColor(isHealthy ? COLORS.success : COLORS.warning);
  doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 20, 2, 2, 'FD');

  doc.setFontSize(10);
  doc.setTextColor(isHealthy ? COLORS.success : COLORS.warning);
  doc.setFont('helvetica', 'bold');
  
  const statusText = isHealthy 
    ? 'Precificacao Saudavel' 
    : 'Atencao: Margem Abaixo do Ideal';
  doc.text(statusText, margin + 5, yPosition + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(COLORS.text);
  
  const descText = isHealthy
    ? `Com margem de ${formatarPorcentagem(result.netMargin)} e lucro de ${formatarMoeda(result.netProfit)} por unidade, sua precificacao esta equilibrada.`
    : `A margem de ${formatarPorcentagem(result.netMargin)} esta abaixo dos 15% recomendados. Considere revisar custos ou ajustar o preco de venda.`;
  doc.text(descText, margin + 5, yPosition + 15);
  
  yPosition += 28;

  // Alertas e recomendacoes
  if (alerts.length > 0) {
    doc.setFontSize(10);
    doc.setTextColor(COLORS.primary);
    doc.setFont('helvetica', 'bold');
    doc.text('Pontos de Atencao:', margin, yPosition);
    yPosition += 6;

    alerts.forEach((alert, index) => {
      const alertColors = {
        success: COLORS.success,
        warning: COLORS.warning,
        error: COLORS.error,
        info: COLORS.primaryLight,
      };

      const bulletText = `${index + 1}. ${alert.title}: ${alert.message}`;
      const lines = doc.splitTextToSize(bulletText, pageWidth - 2 * margin - 10);
      
      doc.setFontSize(9);
      doc.setTextColor(alertColors[alert.type]);
      doc.setFont('helvetica', 'normal');
      doc.text(lines, margin + 5, yPosition);
      
      yPosition += lines.length * 4 + 3;
    });
  } else {
    doc.setFontSize(9);
    doc.setTextColor(COLORS.success);
    doc.setFont('helvetica', 'normal');
    doc.text('Nenhum alerta identificado. Sua precificacao esta adequada.', margin, yPosition);
    yPosition += 8;
  }

  return yPosition + 5;
}

// Rodape
function addFooter(doc: jsPDF, pageWidth: number, pageHeight: number): void {
  const margin = 20;
  const footerY = pageHeight - 12;
  
  // Linha
  doc.setDrawColor(COLORS.border);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY - 3, pageWidth - margin, footerY - 3);
  
  doc.setFontSize(8);
  doc.setTextColor(COLORS.textMuted);
  doc.setFont('helvetica', 'normal');
  
  doc.text('Sistema de Precificacao Profissional', margin, footerY);
  doc.text(`Pagina ${doc.getCurrentPageInfo().pageNumber}`, pageWidth - margin - 15, footerY);
}

// Funcao principal de exportacao
export async function exportCostsReportPdf(reportData: ReportData): Promise<void> {
  const { data, result, scenarios, alerts, companyInfo } = reportData;
  
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // PAGINA 1: Cabecalho + Resumo + Impacto Mensal
  let yPosition = await addHeader(doc, companyInfo, pageWidth);
  yPosition = addResultSummary(doc, result, data, yPosition, pageWidth);
  
  if (yPosition > pageHeight - 70) {
    addFooter(doc, pageWidth, pageHeight);
    doc.addPage();
    yPosition = 20;
  }

  yPosition = addMonthlyImpact(doc, result, data, yPosition, pageWidth);

  // Verificar paginacao
  if (yPosition > pageHeight - 80) {
    addFooter(doc, pageWidth, pageHeight);
    doc.addPage();
    yPosition = 20;
  }

  // PAGINA 2: Detalhamento de Custos
  yPosition = addProductCostsSection(doc, data, yPosition, pageWidth);

  if (yPosition > pageHeight - 60) {
    addFooter(doc, pageWidth, pageHeight);
    doc.addPage();
    yPosition = 20;
  }

  yPosition = addVariableCostsSection(doc, data, yPosition);

  if (yPosition > pageHeight - 60) {
    addFooter(doc, pageWidth, pageHeight);
    doc.addPage();
    yPosition = 20;
  }

  // PAGINA 3: Impostos + Cenarios
  yPosition = addTaxesSection(doc, data, yPosition, pageWidth);

  if (yPosition > pageHeight - 60) {
    addFooter(doc, pageWidth, pageHeight);
    doc.addPage();
    yPosition = 20;
  }

  yPosition = addScenariosSection(doc, scenarios, yPosition, pageWidth);

  if (yPosition > pageHeight - 60) {
    addFooter(doc, pageWidth, pageHeight);
    doc.addPage();
    yPosition = 20;
  }

  // PAGINA 4: Conclusao
  yPosition = addConclusionSection(doc, result, alerts, yPosition, pageWidth);

  // Rodape final
  addFooter(doc, pageWidth, pageHeight);

  // Salvar arquivo
  doc.save(gerarNomeArquivo());
}
