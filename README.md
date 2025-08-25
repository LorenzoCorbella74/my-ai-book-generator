
# AI Book Generator

## Technologies Used

- TypeScript
- Node.js
- Zod (for schema validation)
- Verccel AI SDK (for AI interactions)
- OLLM (for local AI model hosting)


This project generates short books using an AI-driven pipeline. The process is modular and consists of the following steps:

1. **Idea Generation**: The AI generates several unique story ideas based on genre, tone, rating, and style.
2. **Outline Creation**: For a selected idea, the AI creates a chapter-by-chapter outline.
3. **Character & Setting Design**: The AI generates detailed profiles for main characters and descriptions for key settings.
4. **Scene Planning**: Each chapter is broken down into scenes, specifying which characters and settings are involved.
5. **Prose Generation**: The AI writes the full prose for each scene, maintaining consistency in style and tone.

The pipeline is designed for flexibility and can be adapted for different genres, tones, and book lengths. All data is structured using JSON schemas for easy validation and further processing.
