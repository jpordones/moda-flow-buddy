import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  X, 
  Sparkles, 
  Trash2,
  AlertCircle 
} from "lucide-react";
import { 
  VariantProperty, 
  ProductVariant,
  suggestedColors,
  suggestedSizes,
  generateVariantCombinations,
  createVariantsFromCombinations
} from "@/types/productEditor";
import { VariantsGrid } from "./VariantsGrid";

interface VariationsSectionProps {
  hasVariations: boolean;
  variantProperties: VariantProperty[];
  variants: ProductVariant[];
  basePrice: number;
  baseSku: string;
  onToggleVariations: (enabled: boolean) => void;
  onPropertiesChange: (properties: VariantProperty[]) => void;
  onVariantsChange: (variants: ProductVariant[]) => void;
}

export function VariationsSection({
  hasVariations,
  variantProperties,
  variants,
  basePrice,
  baseSku,
  onToggleVariations,
  onPropertiesChange,
  onVariantsChange,
}: VariationsSectionProps) {
  const [newPropertyName, setNewPropertyName] = useState("");
  const [newValueInputs, setNewValueInputs] = useState<Record<string, string>>({});

  const handleAddProperty = () => {
    if (!newPropertyName.trim()) return;
    
    const newProp: VariantProperty = {
      id: `prop_${Date.now()}`,
      name: newPropertyName.trim(),
      values: [],
    };
    
    onPropertiesChange([...variantProperties, newProp]);
    setNewPropertyName("");
  };

  const handleRemoveProperty = (propId: string) => {
    onPropertiesChange(variantProperties.filter(p => p.id !== propId));
  };

  const handleAddValue = (propId: string) => {
    const value = newValueInputs[propId]?.trim();
    if (!value) return;

    onPropertiesChange(
      variantProperties.map(p => {
        if (p.id === propId && !p.values.includes(value)) {
          return { ...p, values: [...p.values, value] };
        }
        return p;
      })
    );
    
    setNewValueInputs(prev => ({ ...prev, [propId]: '' }));
  };

  const handleRemoveValue = (propId: string, value: string) => {
    onPropertiesChange(
      variantProperties.map(p => {
        if (p.id === propId) {
          return { ...p, values: p.values.filter(v => v !== value) };
        }
        return p;
      })
    );
  };

  const handleAddSuggestedValue = (propId: string, value: string) => {
    const prop = variantProperties.find(p => p.id === propId);
    if (prop && !prop.values.includes(value)) {
      onPropertiesChange(
        variantProperties.map(p => {
          if (p.id === propId) {
            return { ...p, values: [...p.values, value] };
          }
          return p;
        })
      );
    }
  };

  const handleGenerateVariants = () => {
    const combinations = generateVariantCombinations(variantProperties);
    const newVariants = createVariantsFromCombinations(combinations, variants, basePrice);
    onVariantsChange(newVariants);
  };

  const handleUpdateVariant = (variantId: string, field: keyof ProductVariant, value: unknown) => {
    onVariantsChange(
      variants.map(v => {
        if (v.id === variantId) {
          return { ...v, [field]: value };
        }
        return v;
      })
    );
  };

  const handleRemoveVariant = (variantId: string) => {
    onVariantsChange(variants.filter(v => v.id !== variantId));
  };

  const handleBulkUpdate = (field: 'price' | 'quantity', value: number) => {
    onVariantsChange(
      variants.map(v => ({ ...v, [field]: value }))
    );
  };

  const getSuggestionsForProperty = (propName: string): string[] => {
    const name = propName.toLowerCase();
    if (name.includes('cor') || name.includes('color')) {
      return suggestedColors;
    }
    if (name.includes('tamanho') || name.includes('size')) {
      return suggestedSizes;
    }
    return [];
  };

  const hasActiveProperties = variantProperties.some(p => p.values.length > 0);

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Variações</CardTitle>
          <Switch
            checked={hasVariations}
            onCheckedChange={onToggleVariations}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Este produto tem variações como tamanho ou cor?
        </p>
      </CardHeader>
      
      {hasVariations && (
        <CardContent className="space-y-6">
          {/* Property editors */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Propriedades de variação</Label>
            
            {variantProperties.map((prop) => {
              const suggestions = getSuggestionsForProperty(prop.name);
              const unusedSuggestions = suggestions.filter(s => !prop.values.includes(s));
              
              return (
                <div key={prop.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{prop.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveProperty(prop.id)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Current values */}
                  <div className="flex flex-wrap gap-2">
                    {prop.values.map((value) => (
                      <Badge key={value} variant="secondary" className="gap-1 pr-1">
                        {value}
                        <button
                          type="button"
                          onClick={() => handleRemoveValue(prop.id, value)}
                          className="ml-1 rounded-full hover:bg-muted p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  
                  {/* Add value input */}
                  <div className="flex gap-2">
                    <Input
                      placeholder={`Adicionar ${prop.name.toLowerCase()}...`}
                      value={newValueInputs[prop.id] || ''}
                      onChange={(e) => setNewValueInputs(prev => ({ ...prev, [prop.id]: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddValue(prop.id);
                        }
                      }}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleAddValue(prop.id)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Suggestions */}
                  {unusedSuggestions.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Sugestões:</p>
                      <div className="flex flex-wrap gap-1">
                        {unusedSuggestions.slice(0, 8).map((suggestion) => (
                          <Badge
                            key={suggestion}
                            variant="outline"
                            className="cursor-pointer hover:bg-accent"
                            onClick={() => handleAddSuggestedValue(prop.id, suggestion)}
                          >
                            + {suggestion}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            
            {/* Add new property */}
            <div className="flex gap-2">
              <Input
                placeholder="Nova propriedade (ex: Material)"
                value={newPropertyName}
                onChange={(e) => setNewPropertyName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddProperty();
                  }
                }}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddProperty}
                disabled={!newPropertyName.trim()}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </div>
          </div>

          {/* Generate variants button */}
          {hasActiveProperties && (
            <div className="flex flex-col sm:flex-row gap-3 p-4 bg-muted/50 rounded-lg">
              <div className="flex-1">
                <p className="font-medium flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-brand" />
                  Gerar grade de variações
                </p>
                <p className="text-sm text-muted-foreground">
                  {generateVariantCombinations(variantProperties).length} combinações possíveis
                </p>
              </div>
              <Button
                type="button"
                variant="action"
                onClick={handleGenerateVariants}
              >
                Gerar variações
              </Button>
            </div>
          )}

          {/* Variants grid */}
          {variants.length > 0 && (
            <VariantsGrid
              variants={variants}
              basePrice={basePrice}
              baseSku={baseSku}
              onUpdateVariant={handleUpdateVariant}
              onRemoveVariant={handleRemoveVariant}
              onBulkUpdate={handleBulkUpdate}
            />
          )}

          {/* Warning if no variants */}
          {hasActiveProperties && variants.length === 0 && (
            <div className="flex items-start gap-3 p-4 bg-warning/10 border border-warning/20 rounded-lg">
              <AlertCircle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-warning">Nenhuma variação gerada</p>
                <p className="text-sm text-muted-foreground">
                  Clique em "Gerar variações" para criar a grade de produtos.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
