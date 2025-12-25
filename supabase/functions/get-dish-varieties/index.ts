import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { dish_name } = await req.json();

    if (!dish_name || typeof dish_name !== 'string' || dish_name.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Please provide a dish name' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `You are a food expert.

The user will provide the name of ONE dish.

Your task is to generate ONLY the common and well-known varieties of that dish.

RULES (STRICT):
- Do NOT include unrelated dishes.
- Do NOT include explanations outside JSON.
- Include only real, commonly known varieties.
- Focus on regional and popular variations.
- Keep names simple and recognizable.
- Do NOT invent random fusion dishes.
- Do NOT include emojis.

Return the response ONLY in valid JSON using this exact format:
{
  "dish_name": "",
  "varieties": [
    {
      "variety_name": "",
      "short_description": ""
    }
  ]
}

If the dish has many varieties, return the most popular ones (5–10).
If the dish has very few varieties, return only those that exist.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: dish_name }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to get dish varieties. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      return new Response(
        JSON.stringify({ error: 'No varieties found. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the JSON response from the AI
    let varieties;
    try {
      const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      varieties = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('Failed to parse varieties JSON:', content);
      return new Response(
        JSON.stringify({ error: 'Failed to parse varieties. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify(varieties),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-dish-varieties function:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
