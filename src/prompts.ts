import { Chapter, StoryIdea, StoryOutline, Character, Setting, Scene } from './models';

export function getIdeasPrompt(
  genre: string[] | string,
  tone: string[] | string,
  rating: string,
  style: string[] | string,
  targetAudience: string[] | string,
  language: string
): string {
  const genreStr = Array.isArray(genre) ? genre.join(', ') : genre;
  const toneStr = Array.isArray(tone) ? tone.join(', ') : tone;
  const styleStr = Array.isArray(style) ? style.join(', ') : style;
  const audienceStr = Array.isArray(targetAudience) ? targetAudience.join(', ') : targetAudience;
  return `
  Generate 5 unique story ideas for a short story.

  Language: ${language}
  For each idea, provide a compelling logline, a central conflict, and a core moral dilemma.
  For each character, provide their primary motivation and a secret they are hiding.
  
  Genre(s): ${genreStr}
  Tone(s): ${toneStr}
  Rating: ${rating}
  Style(s): ${styleStr}
  Target Audience(s): ${audienceStr}

  Provide the output in JSON format, following this schema: { "id": number, "title": string, "logline": string, "premise": string, "centralConflict": string, "moralDilemma": string, "mainCharacters": { "name": string, "motivation": string, "secret": string }[], "settings": { "name": string, "description": string }[] }`;
}

export function getOutlinePrompt(idea: StoryIdea, maxChapters: number, language: string, narrativeStructure: string = 'Three-Act Structure'): string {
  return `
  Generate a story outline with a maximum of ${maxChapters} chapters for the following story idea, following the ${narrativeStructure}.

  Title: ${idea.title}
  Premise: ${idea.premise}
  Main Characters: ${idea.mainCharacters.map(c => c.name).join(', ')}
  Setting: ${idea.settings.map(s => s.name).join(', ')}
  Language: ${language || 'English'}

  For each chapter, define its key turning point, the main character's emotional shift, and which subplots are advanced.

  Provide the output in JSON format, following this schema: { "title": string, "chapters": { "number": number, "title": string, "summary": string, "turningPoint": string, "emotionalShift": string, "subplotsAdvanced": string[] }[] }`;
}

export function getCharactersPrompt(idea: StoryIdea, language: string): string {
  return `
  Generate deep character profiles for the main characters in the following story idea.

  Title: ${idea.title}
  Premise: ${idea.premise}
  Main Characters: ${idea.mainCharacters.map(c => c.name).join(', ')}
  Language: ${language || 'English'}

  For each character, provide their internal and external conflicts, at least two virtues and two flaws, their potential character arc, and the core "lie" they believe about themselves or the world.

  Provide the output in JSON format, following this schema: { "name": string, "role": string, "description": string, "internalConflict": string, "externalConflict": string, "virtues": string[], "flaws": string[], "arc": string, "lieTheyBelieve": string, "relations": { "type": string, "with": string }[] }`;
}

export function getSettingsPrompt(idea: StoryIdea, language: string): string {
  return `
  Generate evocative descriptions for the main settings in the following story idea.

  Title: ${idea.title}
  Setting: ${idea.settings.map(s => s.name).join(', ')}
  Language: ${language || 'English'}

  For each setting, describe its atmosphere, its significance to the plot, and provide sensory details (sight, sound, smell, etc.).

  Provide the output in JSON format, following this schema: 
  { "name": string, "description": string, "atmosphere": string, "plotSignificance": string, "sensoryDetails": string }`;
}

export function getChapterScenesPrompt(chapter: Chapter, characters: Character[], settings: Setting[] = [], language: string): string {
  // Serialize character and setting details to give the AI full context.
  const characterDetails = characters.map(c => JSON.stringify(c, null, 2)).join('\n');
  const settingDetails = settings.map(s => JSON.stringify(s, null, 2)).join('\n');

  return `
  Generate 3-5 scenes for the following chapter. Ensure a dynamic mix of action, dialogue, and introspection scenes to vary the pacing.
  Base the scenes on the chapter summary and the detailed character profiles and setting descriptions provided. 
  The scenes should be a direct consequence of the characters' motivations, flaws, and conflicts, and should be deeply influenced by the atmosphere and significance of the settings.

  Chapter ${chapter.number}: ${chapter.title}
  Summary: ${chapter.summary}
  Language: ${language || 'English'}

  Full Character Profiles:
  ${characterDetails}

  Full Setting Descriptions:
  ${settingDetails}

  For each scene, define its primary purpose (e.g., reveal a clue, raise the stakes, develop a relationship), and list the characters and settings involved.

  Provide the output in JSON format, following this schema: 
  { "number": number, "title": string, "summary": string, "purpose": string, "characters": string[], "settings": string[] }`;
}

export function getSceneProsePrompt(
  scene: Scene,
  chapter: Chapter,
  previousScenes: Scene[],
  previousChapters: Chapter[],
  allCharacters: Character[],
  allSettings: Setting[],
  language: string,
  totalChapters: number
): string {
  const previousScenesSummary = previousScenes.map(s => `Scene ${s.number}: ${s.title}\n${s.summary}`).join('\n\n');
  const previousChaptersSummary = previousChapters.map(c => `Chapter ${c.number}: ${c.title}\n${c.summary}`).join('\n\n');

  // Filter for characters and settings relevant to the current scene
  const sceneCharacters = allCharacters.filter(c => scene.characters.includes(c.name));
  const sceneSettings = allSettings.filter(s => scene.settings.includes(s.name));
  const characterDetails = sceneCharacters.map(c => JSON.stringify(c, null, 2)).join('\n');
  const settingDetails = sceneSettings.map(s => JSON.stringify(s, null, 2)).join('\n');

  let tensionInstruction = '';
  const chapterPosition = chapter.number / totalChapters;
  if (chapterPosition < 0.33) {
    tensionInstruction = 'This is an early chapter. Focus on setup, character introduction, and building mystery. The emotional tension should be low to medium.';
  } else if (chapterPosition < 0.66) {
    tensionInstruction = 'This is a middle chapter. Raise the stakes, introduce complications, and develop subplots. The emotional tension should be medium to high.';
  } else {
    tensionInstruction = 'This is a late chapter. Build towards the climax, increase the tension dramatically, and push characters towards their final confrontations. The emotional tension should be high to very high.';
  }

  return `
    Write the full prose for the following scene, between 500 and 1000 words, ensuring it is consistent with all the context provided (previous chapters, scenes, character profiles, etc.).

    Language: ${language || 'English'}

    Overall Story Context:
    ${previousChapters.length > 0 ? `Summaries of previous chapters:\n${previousChaptersSummary}\n` : ''}

    Current Chapter Context:
    Chapter ${chapter.number} of ${totalChapters}: ${chapter.title}
    Chapter Summary: ${chapter.summary}
    ${previousScenes.length > 0 ? `Previous scenes in this chapter:\n${previousScenesSummary}\n` : ''}

    Current Scene:
    Scene ${scene.number}: ${scene.title}
    Scene Summary: ${scene.summary}
    Scene Purpose: ${scene.purpose}

    Narrative Pacing and Tension:
    ${tensionInstruction}

    Character & Setting Details for this Scene:
    Reference these full profiles to inform character actions, dialogue, and internal thoughts. Their behavior must be consistent with their defined personalities, motivations, and flaws.
    Characters:
    ${characterDetails}

    Settings:
    ${settingDetails}

    Style Guidelines:
    - Write dialogue that is natural, reveals character, and advances the plot. Use subtext; what is *not* said should be as important as what is said.
    - Incorporate literary devices (metaphors, similes, etc.) to create powerful and original imagery.
    - Actively avoid common tropes and clichés. Strive for originality in every sentence.
    - Maintain a consistent style, tone and rating, using deep point of view and a pace that allows for in-depth character and world development.

    Provide the output in JSON format, following this schema: { "text": string }`;
}

export const systemPrompts = {
  ideas: 'You are a brainstorming genius specializing in high-concept, unexpected twists. Your mission is to generate ideas that break genre conventions, featuring complex characters and moral dilemmas.',
  outline: 'You are a master storyteller and structural editor. Your task is to forge a compelling narrative arc, ensuring each chapter serves a purpose, raises the stakes, and contributes to the overall theme.',
  characters: 'You are a deep character psychologist. You craft multi-faceted individuals with rich inner lives, conflicting motivations, and the potential for profound transformation.',
  settings: 'You are an evocative world-builder. You don\'t just describe places; you create immersive environments that breathe with atmosphere, influence the plot, and reflect the characters\' inner states.',
  scenes: 'You are an expert scene choreographer. You design the building blocks of a chapter, ensuring a dynamic flow between action, dialogue, and introspection, with each scene having a clear purpose.',
  prose: 'You are a bestselling novelist known for your evocative prose and deep psychological insight. Your style is immersive, prioritizing "show, don\'t tell," and every piece of dialogue crackles with subtext. You avoid clichés religiously and strive for originality in every sentence.',
};

