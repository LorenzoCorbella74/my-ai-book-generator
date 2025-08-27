

# My AI Book Generator 📚

Welcome to **My AI Book Generator**! This app helps you create short books using AI, with customizable languages, genres, tones, styles, and target audiences.

## Technologies Used

- TypeScript
- Node.js
- Zod (for schema validation)
- Vercel AI SDK (for AI interactions) with the following providers:
  - Ollama (for local AI model hosting)
  - Google Gemini (via `@ai-sdk/google`)
  - OpenAI (via `@ai-sdk/openai`)
  - Mistral (via `@ai-sdk/mistral`)
  - Anthropic (via `@ai-sdk/anthropic`)

## AI Provider Selection

Create a `.env` file in the project root and add the variables for the provider you want to use. Leave the others blank.

 **Open AI**
  - `OPENAI_API_KEY`: Your OpenAI API key.
  - `OPENAI_MODEL`: The model to use (e.g., `gpt-4-turbo`).

 **Anthropic**
  - `ANTHROPIC_API_KEY`: Your Anthropic API key.
  - `ANTHROPIC_MODEL`: The model to use (e.g., `claude-3-opus-20240229`).

 **Mistral**
  - `MISTRAL_API_KEY`: Your Mistral API key.
  - `MISTRAL_MODEL`: The model to use (e.g., `mistral-large-latest`).

 **Google Generative AI**
  - `GOOGLE_GENERATIVE_AI_API_KEY`: Your Google Generative AI API key.
  - `GOOGLE_MODEL`: The model to use (e.g., `gemini-1.5-flash`).

 **Ollama (local)**
  - If none of the above cloud providers are configured, the app will fall back to using a local Ollama model.
  - `OLLAMA_MODEL`: The model to use (e.g., `llama3.1`, `mistral`). Defaults to `llama3.1` if not set.


## Usage
Just type in your CMD line:
```bash
> npm install
> npm start
```




## User Choices
This project generates short books using an AI-driven pipeline. The process is modular and the user will be prompted to select:

- **Language**: Choose the language of the book (e.g., English, Italian, Spanish, French).
- **Genre**: Choose 1-3 genres from an expanded list (e.g., Fantasy, Dystopian, Noir, Slice of Life).
- **Tone**: Choose 1-3 tones from an expanded list (e.g., Epic, Dark, Humorous, Ominous, Hopeful).
- **Style**: Choose 1-3 writing styles from an expanded list (e.g., Descriptive and poetic, First-person narrative, Third-person omniscient, Hardboiled).
- **Target Audience**: Choose 1-3 audiences (e.g., Children, Young Adult, Adult, Families, etc.).
- **Rating**: Select a rating (PG, 16, or 18).
- **Max Chapters**: Enter the maximum number of chapters.
- **Narrative Structure**: Select a narrative framework for the story (e.g., Three-Act Structure, The Hero's Journey, Save the Cat!, Freytag's Pyramid).

All of these choices are used to guide the AI in generating ideas and shaping the story.

## Pipeline Steps

The generation process is modular and consists of the following enhanced steps:

1.  **Idea Generation**: The AI generates several unique story ideas. Each idea now includes a compelling **logline**, a **central conflict**, a **moral dilemma**, and initial character concepts including their core **motivations** and a **hidden secret**.
2.  **Outline Creation**: For a selected idea, the AI creates a chapter-by-chapter outline that follows your chosen **narrative structure**. Each chapter is defined with a **summary**, a key **turning point**, the main character's **emotional shift**, and which **subplots** are advanced.
3.  **Character & Setting Design**: The AI generates deep profiles for main characters, including their **internal and external conflicts**, **virtues and flaws**, their potential **character arc**, and the core **"lie" they believe**. Settings are fleshed out with a specific **atmosphere**, **plot significance**, and rich **sensory details**.
4.  **Scene Planning**: Each chapter is broken down into scenes. This process now uses the full character and setting profiles to create more meaningful events. Each scene is assigned a clear **purpose** (e.g., reveal a clue, raise the stakes).
5.  **Prose Generation**: The AI writes the full prose for each scene. This is the most context-aware step:
    - It receives the full profiles for all characters and settings involved in the scene.
    - It gets a summary of all previous chapters and scenes to maintain **coherence**.
    - It adjusts the **emotional tension** based on the chapter's position in the story, building towards a climax.
6.  **AI Editing**: After each chapter is written, a specialized "AI Editor" reviews the entire chapter. It checks for consistency against the user's original choices, fixes plot holes or character inconsistencies, removes repetition, and improves the overall prose, acting as a final quality control step.


## Output
All generated files (story, context, stats) are saved in an `/output/<book title>` folder for each book you create.

The pipeline is designed for flexibility and can be adapted for different **genres**, **tones**, **audiences**, and **book lengths**. All data is structured using JSON schemas for easy validation and further processing.
