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

    console.log('Generating image for dish:', dish_name);

    const maxRetries = 3;
    let imageUrl: string | undefined;
    let lastError: string = '';

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      console.log(`Attempt ${attempt} of ${maxRetries}`);
      
      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash-image-preview',
          messages: [
            {
              role: 'user',
              content: `Create a photorealistic image of ${dish_name}. Show the dish beautifully plated on a ceramic plate with natural lighting. Food photography style.`
            }
          ],
          modalities: ['image', 'text']
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Attempt ${attempt} - AI Gateway error:`, errorText);
        lastError = 'Failed to generate image';
        continue;
      }

      const data = await response.json();
      console.log(`Attempt ${attempt} - AI response received`);

      imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

      if (imageUrl) {
        console.log(`Image generated successfully on attempt ${attempt}`);
        break;
      } else {
        console.log(`Attempt ${attempt} - No image in response, retrying...`);
        lastError = 'No image generated';
      }
    }

    if (!imageUrl) {
      console.error('All attempts failed to generate image');
      return new Response(
        JSON.stringify({ error: lastError || 'Failed to generate image after multiple attempts' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ image_url: imageUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-dish-image function:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
