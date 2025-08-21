// netlify/functions/recipe.js
const { OpenAI } = require('openai');

exports.handler = async (event, context) => {
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

    if (!base64Image) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'No image provided' }),
      };
    }

    // Initialize OpenAI
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Single step: Analyze photo and generate recipes directly
    const recipeResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a professional chef AI that analyzes food photos and creates realistic recipes. Look carefully at the actual visible ingredients, dishes, or prepared foods in the image. Create recipes that ONLY use ingredients that are clearly visible in the photo. If you see cooked food, create variations or similar dishes. Be specific about what you actually see."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this food photo carefully and create 3 recipes based on EXACTLY what you see:
1. Look at the actual visible ingredients, prepared foods, or dishes
2. Only use ingredients that are clearly visible in the image
3. If you see a cooked dish, create recipes for similar dishes
4. Create 3 different difficulty levels: Easy, Medium, Hard

Return response as JSON object with "recipes" array:
{
  "recipes": [
    {
      "title": "Specific recipe name based on what you see",
      "difficulty": "Easy|Medium|Hard",
      "prepTime": "XX minutes", 
      "servings": number,
      "ingredients": ["only ingredients visible in photo"],
      "instructions": ["detailed cooking steps"]
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
      max_tokens: 2000
    });

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
