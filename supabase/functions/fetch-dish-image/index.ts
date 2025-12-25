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
    const PEXELS_API_KEY = Deno.env.get('PEXELS_API_KEY');
    if (!PEXELS_API_KEY) {
      throw new Error('PEXELS_API_KEY is not set');
    }

    const { dish_name } = await req.json();
    
    if (!dish_name) {
      return new Response(
        JSON.stringify({ error: 'dish_name is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Fetching image for: ${dish_name}`);

    // Search for the dish image on Pexels
    const searchQuery = encodeURIComponent(`${dish_name} food dish`);
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${searchQuery}&per_page=1&orientation=landscape`,
      {
        headers: {
          'Authorization': PEXELS_API_KEY,
        },
      }
    );

    if (!response.ok) {
      console.error('Pexels API error:', response.status, await response.text());
      throw new Error(`Pexels API returned ${response.status}`);
    }

    const data = await response.json();
    
    let imageUrl = null;
    if (data.photos && data.photos.length > 0) {
      // Use medium size for good quality without being too large
      imageUrl = data.photos[0].src.medium;
    }

    console.log(`Found image: ${imageUrl}`);

    return new Response(
      JSON.stringify({ image_url: imageUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching dish image:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
