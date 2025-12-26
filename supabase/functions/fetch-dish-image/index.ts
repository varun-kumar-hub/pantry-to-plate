/// <reference lib="deno.ns" />
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Timeout for API calls (10 seconds)
const API_TIMEOUT = 10000;

// Helper function to fetch with timeout
async function fetchWithTimeout(url: string, options: RequestInit, timeout: number): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// Validate and sanitize dish name
function validateDishName(dish_name: any): { value?: string; error?: string } {
  if (!dish_name) {
    return { error: "dish_name is required" };
  }

  if (typeof dish_name !== "string") {
    return { error: "dish_name must be a string" };
  }

  const sanitized = dish_name.trim();

  if (sanitized.length === 0) {
    return { error: "dish_name cannot be empty" };
  }

  if (sanitized.length > 200) {
    return { error: "dish_name is too long (max 200 characters)" };
  }

  return { value: sanitized };
}

// Build optimized search query for food images
function buildSearchQuery(dishName: string): string {
  // Add food-related keywords for better image results
  return `${dishName} food dish meal cuisine`;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Validate dish name
    const validation = validateDishName(body.dish_name);
    if (validation.error) {
      return new Response(
        JSON.stringify({ error: validation.error }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const dishName = validation.value!;

    // Check for API key
    const PEXELS_API_KEY = Deno.env.get("PEXELS_API_KEY");
    if (!PEXELS_API_KEY) {
      console.error("PEXELS_API_KEY environment variable not set");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Build search query
    const searchQuery = buildSearchQuery(dishName);
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(
      searchQuery
    )}&per_page=5&orientation=landscape`;

    console.log(`Searching Pexels for: "${searchQuery}"`);

    // Fetch from Pexels API with timeout
    let response;
    try {
      response = await fetchWithTimeout(
        url,
        {
          headers: {
            Authorization: PEXELS_API_KEY,
          },
        },
        API_TIMEOUT
      );
    } catch (error: any) {
      const errorMsg = error.name === 'AbortError' ? 'Request timeout' : error.message;
      console.error("Pexels API fetch error:", errorMsg);
      return new Response(
        JSON.stringify({ 
          error: "Failed to fetch image from Pexels",
          details: errorMsg 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Check response status
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Pexels API error (${response.status}):`, errorText);
      
      let errorMessage = "Failed to fetch dish image";
      if (response.status === 401) {
        errorMessage = "Invalid Pexels API key";
      } else if (response.status === 429) {
        errorMessage = "Rate limit exceeded. Please try again later.";
      }

      return new Response(
        JSON.stringify({ 
          error: errorMessage,
          status: response.status 
        }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Parse response
    const data = await response.json();

    // Extract image URLs with fallbacks
    const photos = data?.photos || [];
    
    if (photos.length === 0) {
      console.log(`No images found for: "${dishName}"`);
      return new Response(
        JSON.stringify({
          dish_name: dishName,
          image_url: null,
          message: "No images found for this dish"
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Get the best image (first result) with multiple size options
    const primaryPhoto = photos[0];
    const imageUrls = {
      small: primaryPhoto?.src?.small || null,
      medium: primaryPhoto?.src?.medium || null,
      large: primaryPhoto?.src?.large || null,
      original: primaryPhoto?.src?.original || null,
    };

    // Get primary image URL (prefer medium, fallback to others)
    const primaryUrl = imageUrls.medium || imageUrls.large || imageUrls.small || imageUrls.original;

    // Get alternative images (up to 4 more)
    const alternativeUrls = photos.slice(1, 5).map((photo: any) => ({
      small: photo?.src?.small || null,
      medium: photo?.src?.medium || null,
      large: photo?.src?.large || null,
    }));

    console.log(`Found ${photos.length} images for: "${dishName}"`);

    return new Response(
      JSON.stringify({
        dish_name: dishName,
        image_url: primaryUrl,
        image_urls: imageUrls,
        alternatives: alternativeUrls,
        photographer: primaryPhoto?.photographer || null,
        photographer_url: primaryPhoto?.photographer_url || null,
        total_results: data?.total_results || photos.length,
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error: any) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error",
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});