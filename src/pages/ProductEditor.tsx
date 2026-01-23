import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { 
  ProductEditorHeader,
  NameDescriptionSection,
  PricingSection,
  InventorySection,
  CodesSection,
  VariationsSection 
} from "@/components/products/editor";
import { 
  ProductEditorData, 
  defaultProductEditorData,
  defaultVariantProperties,
  ProductVariant 
} from "@/types/productEditor";
import { useProducts } from "@/hooks/useProducts";
import { useInventory } from "@/hooks/useInventory";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export default function ProductEditor() {
  const navigate = useNavigate();
  const { productId } = useParams();
  const isEditing = Boolean(productId);
  
  const { profile, user } = useAuth();
  const { products, addProduct, updateProduct, refetch: refetchProducts } = useProducts();
  const { fetchInventory } = useInventory();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState<ProductEditorData>({
    ...defaultProductEditorData,
    variantProperties: [...defaultVariantProperties],
  });

  // Load existing product data
  useEffect(() => {
    if (!isEditing || !productId || products.length === 0) return;
    
    const product = products.find(p => p.id === productId);
    if (!product) {
      toast.error("Produto não encontrado");
      navigate('/produtos');
      return;
    }
    
    // Load product data
    setData(prev => ({
      ...prev,
      name: product.name,
      description: product.description || '',
      costPrice: product.costPrice,
      salePrice: product.salePrice,
      quantity: product.quantity,
      sku: product.sku,
      barcode: '',
      category: product.category,
      status: product.status,
      minStock: product.minStock,
      maxStock: product.maxStock,
      unit: product.unit,
      location: product.location || '',
    }));
    
    // Load inventory items as variants
    loadInventoryItems(productId);
  }, [isEditing, productId, products, navigate]);

  const loadInventoryItems = async (prodId: string) => {
    const { data: items, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('product_id', prodId);
    
    if (error || !items || items.length === 0) return;
    
    // Check if product has meaningful variations
    const hasSize = items.some(i => i.size && i.size !== 'Único');
    const hasColor = items.some(i => i.color && i.color !== 'Padrão');
    
    if (hasSize || hasColor) {
      // Build variant properties from existing items
      const sizes = [...new Set(items.map(i => i.size).filter(Boolean))] as string[];
      const colors = [...new Set(items.map(i => i.color).filter(Boolean))] as string[];
      
      const props = [];
      if (colors.length > 0 && !(colors.length === 1 && colors[0] === 'Padrão')) {
        props.push({ id: 'color', name: 'Cor', values: colors.filter(c => c !== 'Padrão') });
      }
      if (sizes.length > 0 && !(sizes.length === 1 && sizes[0] === 'Único')) {
        props.push({ id: 'size', name: 'Tamanho', values: sizes.filter(s => s !== 'Único') });
      }
      
      // Build variants from items
      const variants: ProductVariant[] = items
        .filter(item => {
          const hasValidSize = item.size && item.size !== 'Único';
          const hasValidColor = item.color && item.color !== 'Padrão';
          return hasValidSize || hasValidColor;
        })
        .map(item => ({
          id: item.id,
          inventoryItemId: item.id,
          properties: {
            ...(item.color && item.color !== 'Padrão' ? { 'Cor': item.color } : {}),
            ...(item.size && item.size !== 'Único' ? { 'Tamanho': item.size } : {}),
          },
          sku: (item as any).variant_sku || '',
          barcode: (item as any).barcode || '',
          price: (item as any).variant_price || null,
          quantity: item.quantity,
        }));
      
      if (variants.length > 0) {
        setData(prev => ({
          ...prev,
          hasVariations: true,
          variantProperties: props.length > 0 ? props : defaultVariantProperties,
          variants,
        }));
      }
    }
  };

  const handleFieldChange = (field: string, value: unknown) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleToggleVariations = (enabled: boolean) => {
    setData(prev => ({
      ...prev,
      hasVariations: enabled,
      variantProperties: enabled ? defaultVariantProperties : [],
      variants: enabled ? prev.variants : [],
    }));
  };

  const handleSave = async () => {
    // Validation
    if (!data.name.trim()) {
      toast.error("Nome obrigatório", { description: "Informe o nome do produto" });
      return;
    }
    if (!data.category) {
      toast.error("Categoria obrigatória", { description: "Selecione uma categoria" });
      return;
    }
    if (data.salePrice <= 0) {
      toast.error("Preço obrigatório", { description: "Informe o preço de venda" });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const teamId = profile?.current_team_id;
      if (!teamId || !user) throw new Error("Usuário não autenticado");
      
      // Calculate total stock from variants or use base quantity
      const totalStock = data.hasVariations
        ? data.variants.reduce((sum, v) => sum + v.quantity, 0)
        : data.isInfiniteStock ? 0 : data.quantity;
      
      // Product data for Supabase
      const productData = {
        name: data.name.trim(),
        description: data.description.trim() || null,
        cost_price: data.costPrice,
        sale_price: data.salePrice,
        category: data.category,
        status: data.status,
        sku: data.sku.trim() || generateSKU(data.category),
        quantity: totalStock,
        min_stock: data.minStock,
        has_variations: data.hasVariations,
        is_infinite_stock: data.isInfiniteStock,
        team_id: teamId,
      };
      
      let savedProductId: string;
      
      if (isEditing && productId) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', productId);
        
        if (error) throw error;
        savedProductId = productId;
      } else {
        // Create new product
        const { data: newProduct, error } = await supabase
          .from('products')
          .insert(productData)
          .select('id')
          .single();
        
        if (error) throw error;
        savedProductId = newProduct.id;
      }
      
      // Handle inventory items
      if (data.hasVariations && data.variants.length > 0) {
        await saveVariants(savedProductId, teamId);
      } else if (!data.hasVariations && !data.isInfiniteStock) {
        // Create single inventory item for non-variant product
        await saveSingleInventoryItem(savedProductId, teamId, data.quantity);
      }
      
      await refetchProducts();
      await fetchInventory();
      
      toast.success(isEditing ? "Produto atualizado" : "Produto cadastrado", {
        description: `"${data.name}" foi salvo com sucesso`,
      });
      
      navigate('/produtos');
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast.error("Erro ao salvar", {
        description: error.message || "Não foi possível salvar o produto",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveVariants = async (productId: string, teamId: string) => {
    // Get existing inventory items for this product
    const { data: existingItems } = await supabase
      .from('inventory_items')
      .select('id')
      .eq('product_id', productId);
    
    const existingIds = new Set(existingItems?.map(i => i.id) || []);
    const currentVariantIds = new Set(
      data.variants
        .filter(v => v.inventoryItemId)
        .map(v => v.inventoryItemId)
    );
    
    // Delete removed variants
    const idsToDelete = [...existingIds].filter(id => !currentVariantIds.has(id));
    if (idsToDelete.length > 0) {
      await supabase
        .from('inventory_items')
        .delete()
        .in('id', idsToDelete);
    }
    
    // Upsert variants
    for (const variant of data.variants) {
      const size = variant.properties['Tamanho'] || 'Único';
      const color = variant.properties['Cor'] || 'Padrão';
      
      const itemData = {
        product_id: productId,
        team_id: teamId,
        size,
        color,
        quantity: variant.quantity,
        min_stock: data.minStock,
        critical_stock: Math.floor(data.minStock / 2),
        variant_sku: variant.sku || null,
        barcode: variant.barcode || null,
        variant_price: variant.price,
      };
      
      if (variant.inventoryItemId && existingIds.has(variant.inventoryItemId)) {
        // Update existing
        await supabase
          .from('inventory_items')
          .update(itemData)
          .eq('id', variant.inventoryItemId);
      } else {
        // Insert new
        await supabase
          .from('inventory_items')
          .insert(itemData);
      }
    }
  };

  const saveSingleInventoryItem = async (productId: string, teamId: string, quantity: number) => {
    // Check if item exists
    const { data: existing } = await supabase
      .from('inventory_items')
      .select('id')
      .eq('product_id', productId)
      .eq('size', 'Único')
      .eq('color', 'Padrão')
      .single();
    
    const itemData = {
      product_id: productId,
      team_id: teamId,
      size: 'Único',
      color: 'Padrão',
      quantity,
      min_stock: data.minStock,
      critical_stock: Math.floor(data.minStock / 2),
    };
    
    if (existing) {
      await supabase
        .from('inventory_items')
        .update(itemData)
        .eq('id', existing.id);
    } else {
      await supabase
        .from('inventory_items')
        .insert(itemData);
    }
  };

  const generateSKU = (category: string): string => {
    const prefix = category.substring(0, 3).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${random}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <ProductEditorHeader
        title={isEditing ? "Editar produto" : "Novo produto"}
        isSubmitting={isSubmitting}
        onCancel={() => navigate('/produtos')}
        onSave={handleSave}
      />
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <NameDescriptionSection
          name={data.name}
          description={data.description}
          category={data.category}
          status={data.status}
          onChange={handleFieldChange}
        />
        
        <PricingSection
          costPrice={data.costPrice}
          salePrice={data.salePrice}
          onChange={handleFieldChange}
        />
        
        <VariationsSection
          hasVariations={data.hasVariations}
          variantProperties={data.variantProperties}
          variants={data.variants}
          basePrice={data.salePrice}
          baseSku={data.sku}
          onToggleVariations={handleToggleVariations}
          onPropertiesChange={(props) => handleFieldChange('variantProperties', props)}
          onVariantsChange={(variants) => handleFieldChange('variants', variants)}
        />
        
        <InventorySection
          hasVariations={data.hasVariations}
          isInfiniteStock={data.isInfiniteStock}
          quantity={data.quantity}
          minStock={data.minStock}
          onChange={handleFieldChange}
        />
        
        <CodesSection
          hasVariations={data.hasVariations}
          sku={data.sku}
          barcode={data.barcode}
          onChange={handleFieldChange}
        />
      </div>
    </div>
  );
}
