import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2 } from 'lucide-react';
import { FixedMonthlyCosts } from '@/types/pricing';
import { formatarMoeda } from '@/lib/formatters';

interface FixedMonthlyCostsSectionProps {
  costs: FixedMonthlyCosts;
  onUpdate: (updates: Partial<FixedMonthlyCosts>) => void;
}

export function FixedMonthlyCostsSection({ costs, onUpdate }: FixedMonthlyCostsSectionProps) {
  const totalFixed = Object.values(costs).reduce((a, b) => a + b, 0);
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-warning/20">
            <Building2 className="h-5 w-5 text-warning" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-foreground text-lg">Custos Fixos Mensais</CardTitle>
            <CardDescription>
              Serão diluídos pelo volume de produção
            </CardDescription>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Total/mês</p>
            <p className="text-lg font-bold text-warning">{formatarMoeda(totalFixed)}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="rent">Aluguel (R$)</Label>
            <Input
              id="rent"
              type="number"
              min={0}
              step={0.01}
              value={costs.rent || ''}
              onChange={(e) => onUpdate({ rent: Number(e.target.value) })}
              placeholder="Ex: 1500.00"
              className="h-11 text-base mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="utilities">Energia/Água/Gás (R$)</Label>
            <Input
              id="utilities"
              type="number"
              min={0}
              step={0.01}
              value={costs.utilities || ''}
              onChange={(e) => onUpdate({ utilities: Number(e.target.value) })}
              placeholder="Ex: 300.00"
              className="h-11 text-base mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="internet">Internet/Telefone (R$)</Label>
            <Input
              id="internet"
              type="number"
              min={0}
              step={0.01}
              value={costs.internet || ''}
              onChange={(e) => onUpdate({ internet: Number(e.target.value) })}
              placeholder="Ex: 150.00"
              className="h-11 text-base mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="salaries">Salários (R$)</Label>
            <Input
              id="salaries"
              type="number"
              min={0}
              step={0.01}
              value={costs.salaries || ''}
              onChange={(e) => onUpdate({ salaries: Number(e.target.value) })}
              placeholder="Total da folha"
              className="h-11 text-base mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="benefits">Benefícios (R$)</Label>
            <Input
              id="benefits"
              type="number"
              min={0}
              step={0.01}
              value={costs.benefits || ''}
              onChange={(e) => onUpdate({ benefits: Number(e.target.value) })}
              placeholder="VT, VR, etc"
              className="h-11 text-base mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="software">Softwares (R$)</Label>
            <Input
              id="software"
              type="number"
              min={0}
              step={0.01}
              value={costs.software || ''}
              onChange={(e) => onUpdate({ software: Number(e.target.value) })}
              placeholder="FEDCOM, ERP, etc"
              className="h-11 text-base mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="accounting">Contador (R$)</Label>
            <Input
              id="accounting"
              type="number"
              min={0}
              step={0.01}
              value={costs.accounting || ''}
              onChange={(e) => onUpdate({ accounting: Number(e.target.value) })}
              placeholder="Ex: 300.00"
              className="h-11 text-base mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="insurance">Seguros (R$)</Label>
            <Input
              id="insurance"
              type="number"
              min={0}
              step={0.01}
              value={costs.insurance || ''}
              onChange={(e) => onUpdate({ insurance: Number(e.target.value) })}
              placeholder="Opcional"
              className="h-11 text-base mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="maintenance">Manutenção (R$)</Label>
            <Input
              id="maintenance"
              type="number"
              min={0}
              step={0.01}
              value={costs.maintenance || ''}
              onChange={(e) => onUpdate({ maintenance: Number(e.target.value) })}
              placeholder="Equipamentos"
              className="h-11 text-base mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="otherFixed">Outros (R$)</Label>
            <Input
              id="otherFixed"
              type="number"
              min={0}
              step={0.01}
              value={costs.other || ''}
              onChange={(e) => onUpdate({ other: Number(e.target.value) })}
              placeholder="Outros custos"
              className="h-11 text-base mt-1"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
