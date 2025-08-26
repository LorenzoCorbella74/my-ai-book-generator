

# My AI Book Generator 📚

Welcome to **My AI Book Generator**! This app helps you create short books using AI, with customizable languages, genres, tones, styles, and target audiences.

## Technologies Used

- TypeScript
- Node.js
- Zod (for schema validation)
- Vercel AI SDK (for AI interactions)
- OLLAMA (for local AI model hosting)
- Google Gemini (optional, via Google Generative AI)

## Usage
Just type in your CMD line:
```bash
> npm install
> npm start
```

## AI Provider Selection

This app supports both local and cloud AI providers:

- By default, it uses Ollama (local, open-source models).
- If you set a `GOOGLE_GENERATIVE_AI_API_KEY` in a `.env` file, it will use Google Gemini (model: `gemini-2.5-flash`) for higher quality and speed.

To use Google Gemini:
1. Create a `.env` file in the project root (see below).
2. Add your Google API key:
	```
	GOOGLE_GENERATIVE_AI_API_KEY=your-key-here
	```
3. The app will automatically use Gemini if the key is present.

If no key is set, Ollama will be used as a fallback.

## .env Example

```
# Environment variables for My AI Book Generator
GOOGLE_GENERATIVE_AI_API_KEY=
```

This project generates short books using an AI-driven pipeline. The process is modular and consists of the following steps:

## User Choices

When running the generator, you will be prompted to select:

- **Language**: Choose the language of the book (e.g., English, Italian)
- **Genre**: Choose 1-3 genres from a list (e.g., Fantasy, Science Fiction, Mystery, etc.)
- **Tone**: Choose 1-3 tones (e.g., Epic, Dark, Lighthearted, etc.)
- **Style**: Choose 1-3 writing styles (e.g., Clear and concise, Descriptive and poetic, etc.)
- **Target Audience**: Choose 1-3 audiences (e.g., Children, Young Adult, Adult, Families, etc.)
- **Rating**: Select a rating (PG, 16, or 18)
- **Max Chapters**: Enter the maximum number of chapters

All of these choices are used to guide the AI in generating ideas and shaping the story.

### Pipeline Steps

1. **Idea Generation**: The AI generates several unique story ideas based on your selected genres, tones, styles, target audience, and rating.
2. **Outline Creation**: For a selected idea, the AI creates a chapter-by-chapter outline.
3. **Character & Setting Design**: The AI generates detailed profiles for main characters and descriptions for key settings.
4. **Scene Planning**: Each chapter is broken down into scenes, specifying which characters and settings are involved.
5. **Prose Generation**: The AI writes the full prose for each scene, maintaining consistency in style and tone.


All generated files (story, context, stats) are saved in an `/output/<book title>` folder for each book you create.

The pipeline is designed for flexibility and can be adapted for different genres, tones, audiences, and book lengths. All data is structured using JSON schemas for easy validation and further processing.
