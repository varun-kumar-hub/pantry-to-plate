/// <reference lib="deno.ns" />
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Timeout for API calls (30 seconds)
const API_TIMEOUT = 30000;

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

// Validate and sanitize input
function validateInput(body: any): { ingredients?: string[], dish_name?: string, error?: string } {
    const ingredients = body.ingredients;
    const dish_name = body.dish_name || body.input;

    if (ingredients && Array.isArray(ingredients)) {
        if (ingredients.length === 0) {
            return { error: "Ingredients array cannot be empty" };
        }
        if (ingredients.length > 20) {
            return { error: "Too many ingredients (max 20)" };
        }
        // Sanitize ingredients
        const sanitized = ingredients
            .filter(item => typeof item === 'string' && item.trim().length > 0)
            .map(item => item.trim().substring(0, 100)); // Limit length

        if (sanitized.length === 0) {
            return { error: "No valid ingredients provided" };
        }
        return { ingredients: sanitized };
    }

    if (dish_name && typeof dish_name === 'string') {
        const sanitized = dish_name.trim().substring(0, 200);
        if (sanitized.length === 0) {
            return { error: "Dish name cannot be empty" };
        }
        return { dish_name: sanitized };
    }

    return { error: "Missing ingredients or dish_name" };
}

// Build prompt based on input
function buildPrompt(ingredients?: string[], dish_name?: string): string {
    let prompt = "";

    if (ingredients && ingredients.length > 0) {
        prompt = `You are a professional cooking assistant.

Available Ingredients: ${ingredients.join(", ")}

Create EXACTLY ONE (1) distinct recipe using these ingredients (plus common pantry staples like salt, pepper, oil, etc.).

Requirements:
Create a single, perfect recipe that best utilizes the provided ingredients. It should be practical, delicious, and easy to follow.

The recipe must be complete.`;
    } else if (dish_name) {
        prompt = `You are a professional cooking assistant.

Dish: "${dish_name}"

Create EXACTLY FIVE (5) distinct variations of this dish.

Requirements:
1. Classic/Authentic - Traditional preparation method
2. Modern/Gourmet - Upscale restaurant-quality version
3. Quick & Easy - Simplified version under 30 minutes
4. Healthy/Light - Lighter, more nutritious alternative
5. Fusion/Unique - Creative fusion with another cuisine

Each variation must be complete and practical.`;
    }

    prompt += `

CRITICAL: Return ONLY valid JSON with NO markdown, NO code blocks, NO preamble text.

Required JSON structure:
{
  "recipes": [
    {
      "recipe_name": "Descriptive name",
      "description": "Brief appetizing description (1-2 sentences)",
      "cooking_time_minutes": 30,
      "difficulty": "Easy",
      "servings": 4,
      "calories": "250 kcal per serving",
      "cuisine": "Italian",
      "ingredients": [
        { "name": "Ingredient Name", "quantity": "2 cups" },
        { "name": "Spice Name", "quantity": "1 tsp" }
      ],
      "macronutrients": {
        "protein": "30g",
        "carbs": "45g",
        "fat": "12g"
      },
      "instructions": [
        "Step 1 with clear action",
        "Step 2 with clear action"
      ]
    }
  ]
}

Generate exactly ${ingredients && ingredients.length > 0 ? "1 recipe" : "5 recipes"}. Start response with { and end with }`;

    return prompt;
}

// Extract and clean JSON from response
function extractJSON(text: string): any {
    // Remove markdown code blocks
    let cleaned = text.replace(/```json\n?|\n?```|```\n?/g, "").trim();

    // Find first { and last }
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');

    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }

    return JSON.parse(cleaned);
}

serve(async (req: Request) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        // Parse and validate request body
        let body;
        try {
            body = await req.json();
        } catch (e) {
            return new Response(
                JSON.stringify({ error: "Invalid JSON in request body" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const validation = validateInput(body);
        if (validation.error) {
            return new Response(
                JSON.stringify({ error: validation.error }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Build prompt
        const prompt = buildPrompt(validation.ingredients, validation.dish_name);

        // Check for API key
        const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
        if (!GEMINI_API_KEY) {
            console.error("GEMINI_API_KEY environment variable not set");
            return new Response(
                JSON.stringify({ error: "Server configuration error" }),
                { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Use Gemini 2.5 Flash with fallback to 1.5 Flash
        const models = [
            "gemini-2.5-flash",
            "gemini-1.5-flash-latest",
            "gemini-1.5-flash"
        ];

        let successResponse: Response | null = null;
        let lastError = "";

        for (const model of models) {
            try {
                console.log(`Attempting generation with model: ${model}`);

                const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

                const response = await fetchWithTimeout(
                    apiUrl,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            contents: [{
                                parts: [{ text: prompt }]
                            }],
                            generationConfig: {
                                temperature: 0.7,
                                maxOutputTokens: 8192,
                                response_mime_type: "application/json" // Re-adding JSON mode for stability
                            }
                        }),
                    },
                    API_TIMEOUT
                );

                if (response.ok) {
                    successResponse = response;
                    console.log(`Success with model: ${model}`);
                    break;
                } else {
                    const errorText = await response.text();
                    console.warn(`Model ${model} failed with status ${response.status}:`, errorText);
                    lastError = `${model}: HTTP ${response.status} - ${errorText.substring(0, 100)}`;
                }
            } catch (e: any) {
                const errorMsg = e.name === 'AbortError' ? 'Request timeout' : e.message;
                console.warn(`Model ${model} error:`, errorMsg);
                lastError = `${model}: ${errorMsg}`;
            }
        }

        // Check if any model succeeded
        if (!successResponse) {
            console.error("All models failed. Last error:", lastError);
            return new Response(
                JSON.stringify({
                    error: "Failed to generate recipes. Please try again.",
                    details: lastError
                }),
                { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Parse Gemini response
        const data = await successResponse.json();
        const recipeText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!recipeText) {
            console.error("No text in Gemini response:", JSON.stringify(data));
            return new Response(
                JSON.stringify({ error: "AI returned no content" }),
                { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Extract and parse JSON
        try {
            const recipeData = extractJSON(recipeText);

            // Validate response structure
            if (!recipeData.recipes || !Array.isArray(recipeData.recipes)) {
                throw new Error("Invalid recipe structure");
            }

            if (recipeData.recipes.length === 0) {
                throw new Error("No recipes generated");
            }

            console.log(`Successfully generated ${recipeData.recipes.length} recipes`);

            return new Response(
                JSON.stringify({ recipe: recipeData }),
                {
                    status: 200,
                    headers: { ...corsHeaders, "Content-Type": "application/json" }
                }
            );
        } catch (parseError: any) {
            console.error("JSON parse error:", parseError.message);
            console.error("Raw text:", recipeText.substring(0, 500));

            return new Response(
                JSON.stringify({
                    error: "Failed to parse recipe data",
                    details: parseError.message
                }),
                { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

    } catch (error: any) {
        console.error("Unexpected error:", error);
        return new Response(
            JSON.stringify({
                error: "Internal server error",
                details: error.message
            }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});