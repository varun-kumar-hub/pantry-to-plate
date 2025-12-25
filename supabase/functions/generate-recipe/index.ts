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
    const { input } = await req.json();

    if (!input || typeof input !== 'string' || input.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Please provide ingredients or a dish name' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `You are a professional cooking assistant.

Generate ONE complete cooking recipe based on the user's input.

The input may be:
- A list of available ingredients, OR
- A single dish name.

RULES (STRICT):
- Respond ONLY in valid JSON.
- Do NOT include explanations, markdown, or extra text.
- Do NOT include emojis.
- Use simple, beginner-friendly language.
- Quantities must be realistic and commonly used.
- Cooking steps must be clear and numbered.
- Assume basic kitchen equipment.
- Avoid rare or expensive ingredients unless required by the dish.

JSON FORMAT (EXACT):
{
  "recipe_name": "",
  "cooking_time_minutes": 0,
  "difficulty": "Easy | Medium | Hard",
  "servings": 4,
  "ingredients": [
    {
      "name": "",
      "quantity": ""
    }
  ],
  "instructions": [
    ""
  ]
}

If the input ingredients are insufficient, generate a simple recipe using the closest possible ingredients.
If the input is a dish name, generate a standard version of that dish.`;

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
          { role: 'user', content: input }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to generate recipe. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      return new Response(
        JSON.stringify({ error: 'No recipe generated. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the JSON response from the AI
    let recipe;
    try {
      // Clean up the response in case it has markdown code blocks
      const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      recipe = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('Failed to parse recipe JSON:', content);
      return new Response(
        JSON.stringify({ error: 'Failed to parse recipe. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ recipe }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-recipe function:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
