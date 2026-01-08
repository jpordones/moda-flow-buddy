import { Button } from '@/components/ui/button';
import { Download, FileText, Lock } from 'lucide-react';
import { CustoFixo, CustoVariavel, ParametrosCalculo, ResultadosCalculo } from '@/types/costs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/hooks/useSubscription';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface ExportButtonsProps {
  custosFixos: CustoFixo[];
  custosVariaveis: CustoVariavel[];
  parametros: ParametrosCalculo;
  resultados: ResultadosCalculo;
}

export function ExportButtons({ custosFixos, custosVariaveis, parametros, resultados }: ExportButtonsProps) {
  const { toast } = useToast();
  const { canUseFeature, currentPlan } = useSubscription();

  const canExportExcel = canUseFeature('has_export_excel');
  const canExportPdf = canUseFeature('has_export_pdf');

  const getRequiredPlan = () => {
    return currentPlan?.plan_type === 'free' ? 'Starter' : 'Profissional';
  };

  const exportToCSV = () => {
    if (!canExportExcel) {
      toast({
        title: 'Funcionalidade Premium',
        description: `Exportação Excel disponível a partir do plano ${getRequiredPlan()}`,
        variant: 'destructive'
      });
      return;
    }

    const data = [];
    
    // Cabeçalho
    data.push(['LAMAR - Relatório de Precificação']);
    data.push([`Data: ${new Date().toLocaleDateString('pt-BR')}`]);
    data.push(['']);

    // Parâmetros
    data.push(['PARÂMETROS']);
    data.push(['Média de Vendas/Mês', parametros.mediaVendasMes]);
    data.push(['Margem de Lucro Desejada', `${parametros.margemLucro}%`]);
    data.push(['Margem Premium', `${parametros.margemPremium}%`]);
    data.push(['']);

    // Custos Fixos
    data.push(['CUSTOS FIXOS MENSAIS']);
    data.push(['Nome', 'Valor (R$)', 'Categoria']);
    custosFixos.forEach(custo => {
      data.push([custo.nome, custo.valor.toFixed(2), custo.categoria]);
    });
    data.push(['TOTAL CUSTOS FIXOS', resultados.totalCustosFixos.toFixed(2), '']);
    data.push(['']);

    // Custos Variáveis
    data.push(['CUSTOS VARIÁVEIS POR PRODUTO']);
    data.push(['Nome', 'Valor', 'Tipo', 'Categoria']);
    custosVariaveis.forEach(custo => {
      const valorStr = custo.tipo === 'percentual' ? `${custo.valor}%` : `R$ ${custo.valor.toFixed(2)}`;
      data.push([custo.nome, valorStr, custo.tipo, custo.categoria]);
    });
    data.push(['']);

    // Resultados
    data.push(['RESULTADOS']);
    data.push(['Custo Variável Total/Peça', `R$ ${resultados.custoVariavelTotal.toFixed(2)}`]);
    data.push(['Custo Fixo/Peça', `R$ ${resultados.custoFixoPorPeca.toFixed(2)}`]);
    data.push(['Custo Real Completo/Peça', `R$ ${resultados.custoRealCompleto.toFixed(2)}`]);
    data.push(['']);
    data.push(['CENÁRIOS DE PREÇO']);
    data.push(['Cenário', 'Preço', 'Lucro/Peça', 'Margem %']);
    data.push([
      'Break-Even (Mínimo)',
      `R$ ${resultados.precoMinimo.toFixed(2)}`,
      'R$ 0.00',
      '0%'
    ]);
    data.push([
      'Ideal (Margem Padrão)',
      `R$ ${resultados.precoIdeal.toFixed(2)}`,
      `R$ ${resultados.lucroPorPeca.toFixed(2)}`,
      `${resultados.margemPercentual.toFixed(1)}%`
    ]);
    const lucroPremium = resultados.precoPremium - resultados.custoRealCompleto;
    const margemPremium = (lucroPremium / resultados.precoPremium) * 100;
    data.push([
      'Premium',
      `R$ ${resultados.precoPremium.toFixed(2)}`,
      `R$ ${lucroPremium.toFixed(2)}`,
      `${margemPremium.toFixed(1)}%`
    ]);

    // Converter para CSV
    const csvContent = data.map(row => row.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `lamar-precificacao-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast({
      title: 'Exportação CSV',
      description: 'Relatório exportado com sucesso!',
    });
  };

  const exportToPDF = () => {
    if (!canExportPdf) {
      toast({
        title: 'Funcionalidade Premium',
        description: `Exportação PDF disponível a partir do plano ${getRequiredPlan()}`,
        variant: 'destructive'
      });
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    // Cabeçalho
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('LAMAR', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('Relatório de Precificação', pageWidth / 2, 28, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth / 2, 35, { align: 'center' });

    let yPos = 45;

    // Parâmetros
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Parâmetros', 14, yPos);
    yPos += 7;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Média de Vendas/Mês: ${parametros.mediaVendasMes}`, 14, yPos);
    yPos += 5;
    doc.text(`Margem de Lucro: ${parametros.margemLucro}%`, 14, yPos);
    yPos += 5;
    doc.text(`Margem Premium: ${parametros.margemPremium}%`, 14, yPos);
    yPos += 10;

    // Custos Fixos
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Custos Fixos Mensais', 14, yPos);
    yPos += 5;

    autoTable(doc, {
      startY: yPos,
      head: [['Nome', 'Valor (R$)', 'Categoria']],
      body: custosFixos.map(c => [c.nome, `R$ ${c.valor.toFixed(2)}`, c.categoria]),
      foot: [['TOTAL', `R$ ${resultados.totalCustosFixos.toFixed(2)}`, '']],
      theme: 'grid',
      headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
      footStyles: { fillColor: [240, 240, 240], fontStyle: 'bold' },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;

    // Custos Variáveis
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Custos Variáveis por Produto', 14, yPos);
    yPos += 5;

    autoTable(doc, {
      startY: yPos,
      head: [['Nome', 'Valor', 'Tipo']],
      body: custosVariaveis.map(c => [
        c.nome,
        c.tipo === 'percentual' ? `${c.valor}%` : `R$ ${c.valor.toFixed(2)}`,
        c.tipo === 'percentual' ? 'Percentual' : 'Monetário'
      ]),
      theme: 'grid',
      headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;

    // Resultados
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Comparação de Cenários', 14, yPos);
    yPos += 5;

    const lucroPremium = resultados.precoPremium - resultados.custoRealCompleto;
    const margemPremium = (lucroPremium / resultados.precoPremium) * 100;

    autoTable(doc, {
      startY: yPos,
      head: [['Cenário', 'Preço', 'Lucro/Peça', 'Margem %']],
      body: [
        ['Break-Even', `R$ ${resultados.precoMinimo.toFixed(2)}`, 'R$ 0.00', '0%'],
        ['Ideal', `R$ ${resultados.precoIdeal.toFixed(2)}`, `R$ ${resultados.lucroPorPeca.toFixed(2)}`, `${resultados.margemPercentual.toFixed(1)}%`],
        ['Premium', `R$ ${resultados.precoPremium.toFixed(2)}`, `R$ ${lucroPremium.toFixed(2)}`, `${margemPremium.toFixed(1)}%`],
      ],
      theme: 'grid',
      headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
      bodyStyles: { fontSize: 11 },
    });

    doc.save(`lamar-precificacao-${new Date().toISOString().split('T')[0]}.pdf`);

    toast({
      title: 'Exportação PDF',
      description: 'Relatório exportado com sucesso!',
    });
  };

  return (
    <div className="flex gap-3">
      <Tooltip>
        <TooltipTrigger asChild>
          <span>
            <Button 
              onClick={exportToCSV} 
              variant="outline" 
              className="gap-2"
              disabled={!canExportExcel}
            >
              {!canExportExcel && <Lock className="h-3 w-3" />}
              <Download className="h-4 w-4" />
              Exportar CSV
            </Button>
          </span>
        </TooltipTrigger>
        {!canExportExcel && (
          <TooltipContent>
            <p>Disponível a partir do plano {getRequiredPlan()}</p>
          </TooltipContent>
        )}
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <span>
            <Button 
              onClick={exportToPDF} 
              className="gap-2"
              disabled={!canExportPdf}
            >
              {!canExportPdf && <Lock className="h-3 w-3" />}
              <FileText className="h-4 w-4" />
              Exportar PDF
            </Button>
          </span>
        </TooltipTrigger>
        {!canExportPdf && (
          <TooltipContent>
            <p>Disponível a partir do plano {getRequiredPlan()}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </div>
  );
}
