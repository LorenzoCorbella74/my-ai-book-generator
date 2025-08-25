import { Chapter, StoryIdea, StoryOutline, Character, Setting, Scene } from './models';

export function getIdeasPrompt(
  genre: string,
  tone: string,
  rating: string,
  style: string): string {
  return `
  Generate 5 unique story ideas for a short story.
  Genre: ${genre}
  Tone: ${tone}
  Rating: ${rating}
  Style: ${style}

  Provide the output in JSON format, following this schema: { "id": number, "title": string, "premise": string, "mainCharacters": string[], "setting": string }`;
}

export function getOutlinePrompt(idea: StoryIdea, maxChapters: number): string {
  return `
  Generate a story outline with a maximum of ${maxChapters} chapters for the following story idea:

  Title: ${idea.title}
  Premise: ${idea.premise}
  Main Characters: ${idea.mainCharacters.join(', ')}
  Setting: ${idea.setting}

  Provide the output in JSON format, following this schema: { "title": string, "chapters": { "number": number, "title": string, "summary": string }[] }`;
}

export function getCharactersPrompt(idea: StoryIdea): string {
  return `
  Generate character profiles for the main characters in the following story idea:

  Title: ${idea.title}
  Premise: ${idea.premise}
  Main Characters: ${idea.mainCharacters.join(', ')}

  Provide the output in JSON format, following this schema: { "name": string, "role": string, "description": string, "relations": { "type": string, "with": string }[] }`;
}

export function getSettingsPrompt(idea: StoryIdea): string {
  return `
  Generate descriptions for the main settings in the following story idea:

  Title: ${idea.title}
  Setting: ${idea.setting}

  Provide the output in JSON format, following this schema: { "name": string, "description": string }`;
}

export function getChapterScenesPrompt(chapter: Chapter, characters: Character[], settings?: string[]): string {
  const characterNames = characters.map(c => c.name).join(', ');
  const settingsList = settings && settings.length > 0 ? `\nAvailable settings: ${settings.join(', ')}` : '';
  return `
  Generate 3-5 scenes for the following chapter:

  Chapter ${chapter.number}: ${chapter.title}
  Summary: ${chapter.summary}

  Available characters: ${characterNames}
  ${settingsList}
  
  Provide the output in JSON format, following this schema: { "number": number, "title": string, "summary": string, "characters": string[], "settings": string[] }`;
}

export function getSceneProsePrompt(scene: Scene, chapter: Chapter, previousScenes: Scene[]): string {
  const previousScenesSummary = previousScenes.map(s => `Scene ${s.number}: ${s.title}\n${s.summary}`).join('\n\n');
  return `
  
    Write the full prose for the following scene, between 500 and 900 words.

    Chapter ${chapter.number}: ${chapter.title}
    Chapter Summary: ${chapter.summary}

    ${previousScenes.length > 0 ? `Previous scenes in this chapter:\n${previousScenesSummary}\n` : ''}
    Scene ${scene.number}: ${scene.title}
    Scene Summary: ${scene.summary}

    Style Guidelines: Maintain a consistent style, tone and rating.

    Provide the output in JSON format, following this schema: { "text": string }`;
}

export const systemPrompts = {
  ideas: 'You are an expert creative assistant that generates story ideas, intriguing characters, and gripping emotional stakes',
  outline: 'You are an expert story outliner that creates a chapter structure for a story.',
  characters: 'You are an expert character designer that creates character profiles.',
  settings: 'You are an expert world builder that creates setting descriptions.',
  scenes: 'You are an expert scene generator that creates a list of scenes for a chapter.',
  prose: 'You are an expert story writer that expands a scene summary into full prose.',
};

