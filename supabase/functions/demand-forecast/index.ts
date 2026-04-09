import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { productName, historicalData, period } = await req.json();

    // Input validation
    if (!productName || typeof productName !== 'string' || productName.length > 200) {
      return new Response(JSON.stringify({ error: 'Invalid product name' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const validatedPeriod = typeof period === 'number' && period >= 1 && period <= 24 ? period : 6;

    if (!Array.isArray(historicalData)) {
      return new Response(JSON.stringify({ error: 'Invalid historical data' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Generating demand forecast for:', productName, 'by user:', user.id);

    const systemPrompt = `Você é um especialista em análise de demanda e previsão de vendas para pequenas e médias empresas. 
    
Sua tarefa é analisar dados históricos de vendas e fornecer:
1. Previsão de demanda para o próximo período
2. Tendência (crescimento, estável, queda)
3. Sazonalidade identificada
4. Recomendações de estoque
5. Confiança da previsão (baixa, média, alta)

Responda SEMPRE em português brasileiro e em formato JSON estruturado.`;

    const userPrompt = `Analise os seguintes dados de vendas e faça uma previsão de demanda:

Produto: ${productName}
Período de análise: ${validatedPeriod} meses
Dados históricos de vendas: ${JSON.stringify(historicalData)}

Forneça a resposta no seguinte formato JSON:
{
  "previsao_proximos_30_dias": número,
  "tendencia": "crescimento" | "estável" | "queda",
  "variacao_percentual": número,
  "sazonalidade": "descrição da sazonalidade identificada",
  "estoque_recomendado": número,
  "confianca": "baixa" | "média" | "alta",
  "insights": ["insight 1", "insight 2", "insight 3"],
  "recomendacoes": ["recomendação 1", "recomendação 2"]
}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Limite de requisições excedido. Tente novamente em alguns minutos.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Créditos insuficientes. Adicione créditos ao workspace.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    // Parse JSON from response
    let forecast;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        forecast = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      forecast = {
        previsao_proximos_30_dias: 0,
        tendencia: 'estável',
        variacao_percentual: 0,
        sazonalidade: 'Não foi possível identificar padrões sazonais',
        estoque_recomendado: 0,
        confianca: 'baixa',
        insights: ['Dados insuficientes para análise detalhada'],
        recomendacoes: ['Adicione mais dados históricos para melhorar a precisão']
      };
    }

    return new Response(JSON.stringify({ forecast, rawResponse: content }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in demand-forecast:', error);
    return new Response(JSON.stringify({ error: 'Erro interno ao processar previsão' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
