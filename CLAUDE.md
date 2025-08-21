# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Architecture

ClickLensAI is an AI-powered recipe generator that analyzes food photos using OpenAI Vision API. The project uses a serverless architecture with Netlify Functions and a single-page frontend.

### Frontend Architecture
- **Single HTML file**: `index.html` contains the complete frontend application (HTML, CSS, JavaScript)
- **Four-screen user flow**: Upload → Loading → Recipe Selection → Interactive Cooking
- **State management**: Global JavaScript variables manage application state
- **Tesla-inspired UI**: Dark theme with cyan neon effects (#00FFFF, gradient backgrounds)

### Backend Architecture
- **Netlify Functions**: Serverless backend at `netlify/functions/recipe.js`
- **OpenAI Vision API**: Single-step photo analysis and recipe generation using gpt-4o-mini model
- **ES Module syntax**: Functions use import/export for compatibility with Netlify's esbuild bundler

### Core Data Flow
1. User uploads image via file input or drag-and-drop
2. Frontend converts image to base64 and sends to `/.netlify/functions/recipe`
3. Serverless function analyzes image with OpenAI Vision API
4. AI generates 3 recipes (Easy/Medium/Hard difficulty) based on visible ingredients
5. Frontend renders interactive recipe cards and cooking mode

## Development Commands

### Local Development
```bash
# Install dependencies
npm install

# Start Netlify development server (includes functions)
netlify dev
# Accessible at http://localhost:8888
```

### Production Deployment
```bash
# Deploy to Netlify (auto-deploys from GitHub)
git push origin main

# Manual deploy via Netlify CLI
netlify deploy --prod
```

## Key Implementation Details

### OpenAI Integration
- **Model**: gpt-4o-mini with Vision capabilities
- **Single API call**: Direct photo analysis to structured JSON recipes
- **Prompt engineering**: Instructs AI to only use visually identifiable ingredients
- **Response format**: Enforced JSON structure with recipes array

### Environment Configuration
- **Required variable**: `OPENAI_API_KEY` must be set in Netlify environment variables
- **Local development**: Uses `.env` file (gitignored)
- **Function debugging**: Console logs API key existence and image receipt

### Frontend JavaScript Functions
- `handleImageUpload()`: Processes file selection and triggers analysis
- `startLoading()`: Manages loading animation and API communication
- `showRecipes()`: Renders recipe selection cards from API response
- `showSingleRecipe()`: Interactive cooking mode with step checkboxes
- `fileToBase64()`: Converts image files for serverless function compatibility

### Netlify Function Structure
- **Handler export**: Uses `export const handler` for ES module compatibility
- **CORS headers**: Configured for cross-origin requests
- **Error handling**: Comprehensive try-catch with structured error responses
- **Request validation**: Checks HTTP method and image data presence

## Architecture Considerations

### Module System Compatibility
The project navigates ES module/CommonJS conflicts by:
- Using ES module syntax in Netlify functions (`import`/`export`)
- Leveraging esbuild bundler configuration in `netlify.toml`
- Maintaining compatibility with parent directory package.json settings

### Image Processing Pipeline
- Frontend: File → Base64 conversion for JSON transmission
- Backend: Base64 → OpenAI Vision API format
- No server-side image storage or preprocessing required

### Recipe Data Structure
```javascript
{
  "recipes": [
    {
      "title": "Recipe name based on visible ingredients",
      "difficulty": "Easy|Medium|Hard",
      "prepTime": "XX minutes",
      "servings": number,
      "ingredients": ["only visible ingredients"],
      "instructions": ["detailed step-by-step"]
    }
  ]
}
```

## Debugging and Troubleshooting

### Common Issues
- **500 errors**: Check Netlify function logs for OpenAI API errors
- **404 function errors**: Verify `netlify.toml` functions directory configuration
- **Module syntax errors**: Ensure consistent ES module usage across files

### Debug Logging
The recipe function includes debug logs for:
- API key presence verification
- Image data receipt confirmation
- OpenAI API response validation

### Local Development Testing
```bash
# Test function endpoint directly
curl -X POST http://localhost:8888/.netlify/functions/recipe \
  -H "Content-Type: application/json" \
  -d '{"image":"base64_image_data"}'
```