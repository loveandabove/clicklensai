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

### Critical Deployment Issues
- **Function not deploying**: Ensure ES module syntax consistency across all files
- **Build failures**: Check parent directory package.json doesn't conflict with function modules
- **Environment variables not loading**: Delete and recreate variables if they appear corrupted

### OpenAI API Authentication Troubleshooting
- **401 Authentication errors**: Most common issue is environment variable misconfiguration
- **API key debugging**: Function includes detailed logging of key presence and format
- **Environment variable validation**: Check Netlify dashboard shows correct key in all contexts

### Function Logs Access
Navigate to: **Netlify Dashboard** → **Logs** → **Functions** → **recipe**
- Real-time debugging output appears here during function execution
- Debug logs show API key status and image processing status
- Authentication errors provide specific OpenAI error codes

### Common Error Patterns
- **"Build your first function" display**: Functions directory not properly configured or ES modules failing to compile
- **500 errors with authentication**: Environment variables not propagating to function runtime
- **Missing function logs**: Check deploy succeeded and functions were built successfully

### Debug Logging
The recipe function includes comprehensive debug logs:
```javascript
console.log('API Key exists:', !!process.env.OPENAI_API_KEY);
console.log('API Key value:', process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 20) + '...' : 'MISSING');
console.log('Image received:', !!base64Image);
```

### Production Environment Setup
1. **Netlify Environment Variables**: Set `OPENAI_API_KEY` with "Same value" for all contexts
2. **GitHub Integration**: Auto-deploy triggers on push to main branch
3. **Function Detection**: Verify "1 Lambda function actively running in production" appears in Functions dashboard

### Local Development Testing
```bash
# Test function endpoint directly
curl -X POST http://localhost:8888/.netlify/functions/recipe \
  -H "Content-Type: application/json" \
  -d '{"image":"base64_image_data"}'

# Monitor function reloads during development
# Functions automatically reload when files change in netlify/functions/
```

### Deployment Validation Checklist
- [ ] GitHub repository connected to Netlify
- [ ] Functions directory detected in deploy logs
- [ ] Environment variable `OPENAI_API_KEY` properly set
- [ ] Function appears in Netlify Functions dashboard
- [ ] Deploy status shows "Published" not "Building"
- [ ] Function logs show debug output when triggered