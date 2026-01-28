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

// Cores do tema LAMAR
const COLORS = {
  primary: '#FFC72C',
  primaryDark: '#e6b025',
  text: '#1a1a1a',
  textMuted: '#666666',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  border: '#e5e7eb',
  background: '#f9fafb',
};

// Formatação de data pt-BR
function formatarDataHora(): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date());
}

// Nome do arquivo
function gerarNomeArquivo(): string {
  const data = new Date();
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `relatorio-custos-precificacao-${ano}-${mes}-${dia}.pdf`;
}

// Adicionar logo ou nome da empresa
async function addHeader(
  doc: jsPDF, 
  companyInfo: CompanyInfo, 
  pageWidth: number
): Promise<number> {
  let yPosition = 20;
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

      // Adicionar logo (max 40x40)
      const maxSize = 40;
      const ratio = Math.min(maxSize / img.width, maxSize / img.height);
      const logoWidth = img.width * ratio;
      const logoHeight = img.height * ratio;
      
      doc.addImage(img, 'PNG', margin, yPosition, logoWidth, logoHeight);
      yPosition += logoHeight + 5;
    } catch {
      // Se falhar, usar nome da empresa
      if (companyInfo.companyName) {
        doc.setFontSize(18);
        doc.setTextColor(COLORS.text);
        doc.setFont('helvetica', 'bold');
        doc.text(companyInfo.companyName, margin, yPosition + 10);
        yPosition += 20;
      }
    }
  } else if (companyInfo.companyName) {
    doc.setFontSize(18);
    doc.setTextColor(COLORS.text);
    doc.setFont('helvetica', 'bold');
    doc.text(companyInfo.companyName, margin, yPosition + 10);
    yPosition += 20;
  }

  // Título do relatório
  yPosition += 5;
  doc.setFontSize(24);
  doc.setTextColor(COLORS.text);
  doc.setFont('helvetica', 'bold');
  doc.text('Relatório de Custos & Precificação', margin, yPosition);
  
  // Subtítulo com data
  yPosition += 10;
  doc.setFontSize(11);
  doc.setTextColor(COLORS.textMuted);
  doc.setFont('helvetica', 'normal');
  doc.text(`Gerado em ${formatarDataHora()} • Sistema LAMAR Pro`, margin, yPosition);

  // Linha decorativa
  yPosition += 8;
  doc.setDrawColor(COLORS.primary);
  doc.setLineWidth(2);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);

  return yPosition + 15;
}

// Seção: Resumo Executivo
function addExecutiveSummary(
  doc: jsPDF, 
  result: PricingResult, 
  data: PricingData,
  startY: number, 
  pageWidth: number
): number {
  const margin = 20;
  let yPosition = startY;

  // Título da seção
  doc.setFontSize(14);
  doc.setTextColor(COLORS.text);
  doc.setFont('helvetica', 'bold');
  doc.text('📊 Resumo Executivo', margin, yPosition);
  yPosition += 10;

  // Cards de resumo
  const cards = [
    { label: 'Custo Real Completo', value: formatarMoeda(result.totalCostBeforeSale + result.variableFixedCosts), color: COLORS.textMuted },
    { label: 'Preço Mínimo (Break-even)', value: formatarMoeda(result.minimumPrice), color: COLORS.warning },
    { label: 'Preço Ideal', value: formatarMoeda(result.suggestedPrice), color: COLORS.success },
    { label: 'Preço Premium', value: formatarMoeda(result.premiumPrice), color: COLORS.primary },
    { label: 'Lucro por Peça', value: formatarMoeda(result.netProfit), color: result.netProfit > 0 ? COLORS.success : COLORS.error },
    { label: 'Margem Líquida', value: formatarPorcentagem(result.netMargin), color: result.netMargin >= 15 ? COLORS.success : COLORS.error },
  ];

  const cardWidth = (pageWidth - 2 * margin - 10) / 2;
  const cardHeight = 18;
  
  cards.forEach((card, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const x = margin + col * (cardWidth + 10);
    const y = yPosition + row * (cardHeight + 5);

    // Fundo do card
    doc.setFillColor(COLORS.background);
    doc.setDrawColor(COLORS.border);
    doc.roundedRect(x, y, cardWidth, cardHeight, 2, 2, 'FD');

    // Label
    doc.setFontSize(9);
    doc.setTextColor(COLORS.textMuted);
    doc.setFont('helvetica', 'normal');
    doc.text(card.label, x + 5, y + 7);

    // Valor
    doc.setFontSize(12);
    doc.setTextColor(card.color);
    doc.setFont('helvetica', 'bold');
    doc.text(card.value, x + 5, y + 14);
  });

  yPosition += Math.ceil(cards.length / 2) * (cardHeight + 5) + 10;

  // Impacto mensal estimado
  const monthlyRevenue = result.suggestedPrice * data.config.monthlyVolume;
  const monthlyProfit = result.netProfit * data.config.monthlyVolume;
  
  doc.setFillColor('#f0fdf4');
  doc.setDrawColor(COLORS.success);
  doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 22, 2, 2, 'FD');
  
  doc.setFontSize(10);
  doc.setTextColor(COLORS.textMuted);
  doc.setFont('helvetica', 'normal');
  doc.text('Impacto Mensal Estimado (Volume: ' + formatarNumero(data.config.monthlyVolume, 0) + ' un.)', margin + 5, yPosition + 8);
  
  doc.setFontSize(11);
  doc.setTextColor(COLORS.success);
  doc.setFont('helvetica', 'bold');
  doc.text(`Faturamento: ${formatarMoeda(monthlyRevenue)} • Lucro: ${formatarMoeda(monthlyProfit)}`, margin + 5, yPosition + 17);

  return yPosition + 32;
}

// Tabela: Custos Fixos Mensais
function addFixedCostsTable(
  doc: jsPDF, 
  data: PricingData, 
  startY: number
): number {
  const margin = 20;

  doc.setFontSize(12);
  doc.setTextColor(COLORS.text);
  doc.setFont('helvetica', 'bold');
  doc.text('📋 Custos Fixos Mensais', margin, startY);

  const fixedCostsLabels: Record<string, string> = {
    rent: 'Aluguel',
    utilities: 'Energia, água, gás',
    internet: 'Internet/Telefone',
    salaries: 'Salários',
    benefits: 'Benefícios',
    software: 'Softwares/ERP',
    accounting: 'Contabilidade',
    insurance: 'Seguros',
    maintenance: 'Manutenção',
    other: 'Outros',
  };

  const tableData: (string | number)[][] = [];
  let total = 0;

  Object.entries(data.fixedCosts).forEach(([key, value]) => {
    if (value > 0) {
      tableData.push([fixedCostsLabels[key] || key, formatarMoeda(value)]);
      total += value;
    }
  });

  if (tableData.length === 0) {
    tableData.push(['Nenhum custo fixo cadastrado', '-']);
  }

  autoTable(doc, {
    startY: startY + 5,
    head: [['Descrição', 'Valor (R$)']],
    body: tableData,
    foot: [['TOTAL', formatarMoeda(total)]],
    theme: 'striped',
    headStyles: { 
      fillColor: COLORS.primary, 
      textColor: COLORS.text,
      fontStyle: 'bold',
    },
    footStyles: { 
      fillColor: COLORS.primary, 
      textColor: COLORS.text,
      fontStyle: 'bold',
    },
    styles: { fontSize: 9, cellPadding: 4 },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 50, halign: 'right' },
    },
    margin: { left: margin, right: margin },
  });

  return (doc as any).lastAutoTable.finalY + 10;
}

// Tabela: Custos Variáveis
function addVariableCostsTable(
  doc: jsPDF, 
  data: PricingData, 
  startY: number
): number {
  const margin = 20;

  doc.setFontSize(12);
  doc.setTextColor(COLORS.text);
  doc.setFont('helvetica', 'bold');
  doc.text('📋 Custos Variáveis (por Venda)', margin, startY);

  const variableCostsItems = [
    { 
      name: 'Taxa Marketplace (' + marketplacePresets[data.variableCosts.marketplaceType].name + ')', 
      type: '%', 
      value: data.variableCosts.marketplaceFee 
    },
    { name: 'Taxa Frete Marketplace', type: 'R$', value: data.variableCosts.marketplaceShipping },
    { name: 'Gateway de Pagamento', type: '%', value: data.variableCosts.paymentGateway },
    { name: 'Custo de Frete', type: 'R$', value: data.variableCosts.shippingCost },
    { name: 'Embalagem de Envio', type: 'R$', value: data.variableCosts.shippingPackaging },
    { name: 'Logística Reversa', type: '%', value: data.variableCosts.reverseLogistics },
    { name: 'Custo de Anúncios', type: '%', value: data.variableCosts.adsCost },
    { name: 'Comissão Afiliados', type: '%', value: data.variableCosts.affiliateCommission },
  ];

  const tableData = variableCostsItems
    .filter(item => item.value > 0)
    .map(item => [
      item.name,
      item.type,
      item.type === '%' ? formatarPorcentagem(item.value) : formatarMoeda(item.value),
    ]);

  if (tableData.length === 0) {
    tableData.push(['Nenhum custo variável cadastrado', '-', '-']);
  }

  autoTable(doc, {
    startY: startY + 5,
    head: [['Descrição', 'Tipo', 'Valor']],
    body: tableData,
    theme: 'striped',
    headStyles: { 
      fillColor: COLORS.primary, 
      textColor: COLORS.text,
      fontStyle: 'bold',
    },
    styles: { fontSize: 9, cellPadding: 4 },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 25, halign: 'center' },
      2: { cellWidth: 50, halign: 'right' },
    },
    margin: { left: margin, right: margin },
  });

  return (doc as any).lastAutoTable.finalY + 10;
}

// Tabela: Custos do Produto
function addProductCostsTable(
  doc: jsPDF, 
  data: PricingData, 
  startY: number
): number {
  const margin = 20;

  doc.setFontSize(12);
  doc.setTextColor(COLORS.text);
  doc.setFont('helvetica', 'bold');
  doc.text('📋 Custos do Produto (por Unidade)', margin, startY);

  const productCostsLabels: Record<string, string> = {
    fabric: 'Tecido/Material Principal',
    accessories: 'Aviamentos/Acessórios',
    packaging: 'Embalagem Individual',
    laborCost: 'Mão de Obra',
    qualityControl: 'Controle de Qualidade',
    photography: 'Fotografia (rateio)',
    other: 'Outros',
  };

  const tableData: (string | number)[][] = [];
  let total = 0;

  Object.entries(data.productCosts).forEach(([key, value]) => {
    if (value > 0) {
      tableData.push([productCostsLabels[key] || key, formatarMoeda(value)]);
      total += value;
    }
  });

  if (tableData.length === 0) {
    tableData.push(['Nenhum custo de produto cadastrado', '-']);
  }

  autoTable(doc, {
    startY: startY + 5,
    head: [['Descrição', 'Valor (R$)']],
    body: tableData,
    foot: [['TOTAL CUSTO DIRETO', formatarMoeda(total)]],
    theme: 'striped',
    headStyles: { 
      fillColor: COLORS.primary, 
      textColor: COLORS.text,
      fontStyle: 'bold',
    },
    footStyles: { 
      fillColor: COLORS.primary, 
      textColor: COLORS.text,
      fontStyle: 'bold',
    },
    styles: { fontSize: 9, cellPadding: 4 },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 50, halign: 'right' },
    },
    margin: { left: margin, right: margin },
  });

  return (doc as any).lastAutoTable.finalY + 10;
}

// Tabela: Impostos
function addTaxesTable(
  doc: jsPDF, 
  data: PricingData, 
  startY: number
): number {
  const margin = 20;

  doc.setFontSize(12);
  doc.setTextColor(COLORS.text);
  doc.setFont('helvetica', 'bold');
  doc.text('📋 Configuração de Impostos', margin, startY);

  const regimeLabels: Record<string, string> = {
    simples: 'Simples Nacional',
    presumido: 'Lucro Presumido',
    real: 'Lucro Real',
  };

  let tableData: (string | number)[][] = [];

  if (data.taxes.taxRegime === 'simples') {
    tableData = [
      ['Regime Tributário', regimeLabels[data.taxes.taxRegime], '-'],
      ['Alíquota Simples Nacional', formatarPorcentagem(data.taxes.simplesRate), 'Conforme faixa de faturamento'],
    ];
  } else {
    tableData = [
      ['Regime Tributário', regimeLabels[data.taxes.taxRegime], '-'],
      ['ICMS', formatarPorcentagem(data.taxes.icms), 'Varia por estado'],
      ['PIS', formatarPorcentagem(data.taxes.pis), 'Cumulativo/Não-cumulativo'],
      ['COFINS', formatarPorcentagem(data.taxes.cofins), 'Cumulativo/Não-cumulativo'],
    ];
  }

  autoTable(doc, {
    startY: startY + 5,
    head: [['Imposto', 'Percentual', 'Observação']],
    body: tableData,
    theme: 'striped',
    headStyles: { 
      fillColor: COLORS.primary, 
      textColor: COLORS.text,
      fontStyle: 'bold',
    },
    styles: { fontSize: 9, cellPadding: 4 },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 40, halign: 'center' },
      2: { cellWidth: 70 },
    },
    margin: { left: margin, right: margin },
  });

  return (doc as any).lastAutoTable.finalY + 10;
}

// Tabela: Cenários
function addScenariosTable(
  doc: jsPDF, 
  scenarios: PricingScenario[], 
  startY: number
): number {
  const margin = 20;

  doc.setFontSize(12);
  doc.setTextColor(COLORS.text);
  doc.setFont('helvetica', 'bold');
  doc.text('📊 Análise de Cenários', margin, startY);

  const tableData = scenarios.map(scenario => [
    `${scenario.emoji} ${scenario.name}`,
    formatarNumero(scenario.volume, 0) + ' un.',
    formatarMoeda(scenario.price),
    formatarMoeda(scenario.profit),
    formatarPorcentagem(scenario.margin),
  ]);

  autoTable(doc, {
    startY: startY + 5,
    head: [['Cenário', 'Volume/Mês', 'Preço', 'Lucro/Peça', 'Margem']],
    body: tableData,
    theme: 'striped',
    headStyles: { 
      fillColor: COLORS.primary, 
      textColor: COLORS.text,
      fontStyle: 'bold',
    },
    styles: { fontSize: 9, cellPadding: 4 },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 35, halign: 'center' },
      2: { cellWidth: 35, halign: 'right' },
      3: { cellWidth: 35, halign: 'right' },
      4: { cellWidth: 30, halign: 'center' },
    },
    margin: { left: margin, right: margin },
  });

  return (doc as any).lastAutoTable.finalY + 10;
}

// Seção: Alertas e Recomendações
function addAlertsSection(
  doc: jsPDF, 
  alerts: PricingAlert[], 
  startY: number,
  pageWidth: number
): number {
  const margin = 20;
  let yPosition = startY;

  doc.setFontSize(12);
  doc.setTextColor(COLORS.text);
  doc.setFont('helvetica', 'bold');
  doc.text('⚡ Alertas e Recomendações', margin, yPosition);
  yPosition += 8;

  if (alerts.length === 0) {
    doc.setFontSize(10);
    doc.setTextColor(COLORS.success);
    doc.setFont('helvetica', 'normal');
    doc.text('✓ Nenhum alerta no momento. Sua precificação está saudável!', margin, yPosition);
    return yPosition + 15;
  }

  const alertColors: Record<string, string> = {
    success: '#dcfce7',
    warning: '#fef3c7',
    error: '#fee2e2',
    info: '#dbeafe',
  };

  const alertTextColors: Record<string, string> = {
    success: COLORS.success,
    warning: COLORS.warning,
    error: COLORS.error,
    info: '#3b82f6',
  };

  const alertIcons: Record<string, string> = {
    success: '✓',
    warning: '⚠',
    error: '✕',
    info: 'ℹ',
  };

  alerts.forEach((alert) => {
    const alertHeight = 18;
    
    doc.setFillColor(alertColors[alert.type]);
    doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, alertHeight, 2, 2, 'F');

    doc.setFontSize(10);
    doc.setTextColor(alertTextColors[alert.type]);
    doc.setFont('helvetica', 'bold');
    doc.text(`${alertIcons[alert.type]} ${alert.title}`, margin + 5, yPosition + 7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const messageLines = doc.splitTextToSize(alert.message, pageWidth - 2 * margin - 10);
    doc.text(messageLines[0], margin + 5, yPosition + 14);

    yPosition += alertHeight + 5;
  });

  return yPosition + 5;
}

// Rodapé
function addFooter(doc: jsPDF, pageWidth: number, pageHeight: number): void {
  const margin = 20;
  
  doc.setFontSize(8);
  doc.setTextColor(COLORS.textMuted);
  doc.setFont('helvetica', 'normal');
  
  const footerY = pageHeight - 10;
  doc.text('LAMAR Pro • Sistema de Precificação Profissional', margin, footerY);
  doc.text(`Página ${doc.getCurrentPageInfo().pageNumber}`, pageWidth - margin - 20, footerY);
}

// Função principal de exportação
export async function exportCostsReportPdf(reportData: ReportData): Promise<void> {
  const { data, result, scenarios, alerts, companyInfo } = reportData;
  
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // === PÁGINA 1: Cabeçalho + Resumo Executivo ===
  let yPosition = await addHeader(doc, companyInfo, pageWidth);
  yPosition = addExecutiveSummary(doc, result, data, yPosition, pageWidth);
  
  // Verificar se precisa de nova página
  if (yPosition > pageHeight - 60) {
    addFooter(doc, pageWidth, pageHeight);
    doc.addPage();
    yPosition = 20;
  }

  // Custos do Produto
  yPosition = addProductCostsTable(doc, data, yPosition);

  // Verificar se precisa de nova página
  if (yPosition > pageHeight - 60) {
    addFooter(doc, pageWidth, pageHeight);
    doc.addPage();
    yPosition = 20;
  }

  // === PÁGINA 2: Tabelas Detalhadas ===
  yPosition = addFixedCostsTable(doc, data, yPosition);
  
  if (yPosition > pageHeight - 60) {
    addFooter(doc, pageWidth, pageHeight);
    doc.addPage();
    yPosition = 20;
  }

  yPosition = addVariableCostsTable(doc, data, yPosition);
  
  if (yPosition > pageHeight - 60) {
    addFooter(doc, pageWidth, pageHeight);
    doc.addPage();
    yPosition = 20;
  }

  yPosition = addTaxesTable(doc, data, yPosition);

  if (yPosition > pageHeight - 60) {
    addFooter(doc, pageWidth, pageHeight);
    doc.addPage();
    yPosition = 20;
  }

  // === PÁGINA 3: Cenários + Alertas ===
  yPosition = addScenariosTable(doc, scenarios, yPosition);

  if (yPosition > pageHeight - 60) {
    addFooter(doc, pageWidth, pageHeight);
    doc.addPage();
    yPosition = 20;
  }

  yPosition = addAlertsSection(doc, alerts, yPosition, pageWidth);

  // Rodapé final
  addFooter(doc, pageWidth, pageHeight);

  // Salvar arquivo
  doc.save(gerarNomeArquivo());
}
