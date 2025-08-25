// netlify/functions/recipe.js
import OpenAI from 'openai';

export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Parse the request body
    const body = JSON.parse(event.body || '{}');
    const base64Image = body.image;
    const ingredientText = body.ingredients;

    if (!base64Image && !ingredientText) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'No image or ingredients provided' }),
      };
    }

    // Debug logging
    console.log('API Key exists:', !!process.env.OPENAI_API_KEY);
    console.log('API Key value:', process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 20) + '...' : 'MISSING');
    console.log('Image received:', !!base64Image);
    console.log('Ingredients received:', !!ingredientText);
    
    // Initialize OpenAI
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    let recipeResponse;

    if (base64Image) {
      // Image-based recipe generation
      recipeResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a professional chef AI that analyzes food photos and creates detailed, realistic recipes with precise measurements. Look carefully at the actual visible ingredients, dishes, or prepared foods in the image. Create recipes that ONLY use ingredients that are clearly visible in the photo."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this food photo carefully and create 3 detailed recipes based on EXACTLY what you see:

REQUIREMENTS:
1. Only use ingredients clearly visible in the image
2. Include precise measurements (grams, ml, pieces, etc.)
3. Provide detailed, step-by-step instructions
4. Create 3 different difficulty levels: Easy, Medium, Hard
5. Include prep time, cooking time, and servings

Return response as JSON object:
{
  "recipes": [
    {
      "title": "Specific recipe name",
      "difficulty": "Easy|Medium|Hard",
      "prepTime": "XX minutes",
      "cookTime": "XX minutes", 
      "servings": number,
      "ingredients": ["250g chicken breast", "150ml olive oil", "2 large onions"],
      "instructions": ["Detailed step 1 with temperature and timing", "Step 2 with specific technique"]
    }
  ]
}`
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 2500
      });
    } else {
      // Ingredients text-based recipe generation
      recipeResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a professional chef AI that creates detailed, realistic recipes with precise measurements. Create recipes using ONLY the ingredients provided by the user. Be creative but practical with the combinations."
          },
          {
            role: "user",
            content: `Create 3 detailed recipes using these ingredients: "${ingredientText}"

REQUIREMENTS:
1. Use ONLY the ingredients provided (you can suggest basic pantry items like salt, pepper, oil)
2. Include precise measurements (grams, ml, pieces, etc.)
3. Provide detailed, step-by-step cooking instructions
4. Create 3 different difficulty levels: Easy, Medium, Hard
5. Include prep time, cooking time, and servings
6. Make recipes that actually work well together

Return response as JSON object:
{
  "recipes": [
    {
      "title": "Creative recipe name using the ingredients",
      "difficulty": "Easy|Medium|Hard",
      "prepTime": "XX minutes",
      "cookTime": "XX minutes", 
      "servings": number,
      "ingredients": ["250g chicken breast", "150ml olive oil", "2 large onions", "salt to taste"],
      "instructions": ["Detailed step 1 with temperature and timing", "Step 2 with specific technique and tips"]
    }
  ]
}`
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 2500
      });
    }

    const recipesData = JSON.parse(recipeResponse.choices[0].message.content);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(recipesData)
    };

  } catch (err) {
    console.error("Error:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Failed to generate recipes" })
    };
  }
}
