import { Chapter, StoryIdea, StoryOutline, Character, Setting, Scene, Context } from './models';

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
  Generate 5 unique story ideas for a short story each with 6 to 12 characters and 5 to 8 unique settings.

  Language: ${language}
  Genre(s): ${genreStr}
  Tone(s): ${toneStr}
  Rating: ${rating}
  Style(s): ${styleStr}
  Target Audience(s): ${audienceStr}

  For each idea, provide a compelling logline, a central conflict, and a core moral dilemma.
  For each character, provide their primary motivation and a secret they are hiding.
  For each setting, provide a brief description that evokes its atmosphere and significance to the plot.

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
  const characterDetails = characters.map(c => `
- Character: ${c.name}
  - Role: ${c.role}
  - Description: ${c.description}
  - Internal Conflict: ${c.internalConflict}
  - External Conflict: ${c.externalConflict}
  - Virtues: ${c.virtues.join(', ')}
  - Flaws: ${c.flaws.join(', ')}
  - Arc: ${c.arc}
  - The Lie They Believe: ${c.lieTheyBelieve}
`).join('');

  const settingDetails = settings.map(s => `
- Setting: ${s.name}
  - Description: ${s.description}
  - Atmosphere: ${s.atmosphere}
  - Plot Significance: ${s.plotSignificance}
  - Sensory Details: ${s.sensoryDetails}
`).join('');

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

  Provide the output in JSON format, following this schema: { "number": number, "title": string, "summary": string, "purpose": string, "characters": string[], "settings": string[] }`;
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
  
  const characterDetails = sceneCharacters.map(c => `
- Character: ${c.name}
  - Role: ${c.role}
  - Description: ${c.description}
  - Internal Conflict: ${c.internalConflict}
  - External Conflict: ${c.externalConflict}
  - Virtues: ${c.virtues.join(', ')}
  - Flaws: ${c.flaws.join(', ')}
  - Arc: ${c.arc}
  - The Lie They Believe: ${c.lieTheyBelieve}
`).join('');

  const settingDetails = sceneSettings.map(s => `
- Setting: ${s.name}
  - Description: ${s.description}
  - Atmosphere: ${s.atmosphere}
  - Plot Significance: ${s.plotSignificance}
  - Sensory Details: ${s.sensoryDetails}
`).join('');

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

export function getEditChapterPrompt(
    chapter: Chapter,
    scenes: Scene[],
    allCharacters: Character[],
  allSettings: Setting[],
    previousChapters: Chapter[],
    context: Context
  ): string {
    const genreStr = Array.isArray(context.genre) ? context.genre.join(', ') : context.genre;
    const toneStr = Array.isArray(context.tone) ? context.tone.join(', ') : context.tone;
    const styleStr = Array.isArray(context.style) ? context.style.join(', ') : context.style;
  
    const fullChapterText = scenes.map(s => `### Scene ${s.number}: ${s.title}\n${s.summary}\n\n${s.text}`).join('\n\n---\n\n');
    const previousChaptersSummary = previousChapters.map(c => `Chapter ${c.number}: ${c.title}\n${c.summary}`).join('\n\n');
    const characterDetails = allCharacters.map(c => `
    - Character: ${c.name}
      - Role: ${c.role}
      - Description: ${c.description}
      - Internal Conflict: ${c.internalConflict}
      - External Conflict: ${c.externalConflict}
      - Virtues: ${c.virtues.join(', ')}
      - Flaws: ${c.flaws.join(', ')}
      - Arc: ${c.arc}
      - The Lie They Believe: ${c.lieTheyBelieve}
    `).join('');
        const settingDetails = allSettings.map(s => `
    - Setting: ${s.name}
      - Description: ${s.description}
      - Atmosphere: ${s.atmosphere}
      - Plot Significance: ${s.plotSignificance}
      - Sensory Details: ${s.sensoryDetails}
    `).join('');

    return `
    You are an editor. Your task is to review and refine the following chapter based on the provided context and guidelines. 
    Apply your edits directly to the text and provide a new version of the chapter.

    **Author's Guidelines:**
    - **Genre(s):** ${genreStr}
    - **Tone(s):** ${toneStr}
    - **Style(s):** ${styleStr}
    - **Rating:** ${context.rating}
    - **Target Audience:** ${Array.isArray(context.targetAudience) ? context.targetAudience.join(', ') : context.targetAudience}

    **Story Context:**
    - **Previous Chapters Summary:**
    ${previousChaptersSummary || 'N/A'}
    - **Character Profiles:**
    ${characterDetails}
    - **Setting Descriptions:**
    ${settingDetails}

    **Chapter to Edit:**
    ## Chapter ${chapter.number}: ${chapter.title}
    ${fullChapterText}

    **Your Tasks:**
    1.  **Ensure Consistency:** The chapter must align with the author's guidelines (genre, tone, style, rating).
    2.  **Fix Inconsistencies:** Correct any contradictions with character profiles, setting details, or previous plot points.
    3.  **Eliminate Repetition:** Rephrase repetitive words, sentence structures, and descriptions.
    4.  **Improve Prose:** Enhance weak passages, strengthen descriptions, tighten dialogue, and improve pacing. Show, don't tell.
    5.  **Return the Full, Edited Chapter:** Provide the complete, edited text for each scene in the chapter.

    Provide the output in JSON format, following this schema: { "scenes": [{ "number": number, "title": string, "summary": string, "text": string }] }`;
  }

export function getArtPrompts(context: Context): string {
    const genreStr = Array.isArray(context.genre) ? context.genre.join(', ') : context.genre;
    const toneStr = Array.isArray(context.tone) ? context.tone.join(', ') : context.tone;
    const styleStr = Array.isArray(context.style) ? context.style.join(', ') : context.style;

    const characterSummary = context.characters?.map(c => `${c.name}: ${c.description}`).join('\n');
    const settingSummary = context.settings?.map(s => `${s.name}: ${s.description}`).join('\n');
    const plotSummary = context.outline?.chapters.map(c => c.summary).join(' ');

    return `
    Based on the following story details, generate a detailed, evocative, and powerful text-to-image prompt for the book cover art. Then, generate 3 separate prompts for key scenes in the story.

    **Story Details:**
    - **Title:** ${context.idea?.title}
    - **Genre:** ${genreStr}
    - **Tone:** ${toneStr}
    - **Style:** ${styleStr}
    - **Plot Summary:** ${plotSummary}
    - **Main Characters:**\n${characterSummary}
    - **Key Settings:**\n${settingSummary}

    **Instructions:**
    1.  **Cover Art Prompt:** Create a single, detailed prompt for the book cover. It should capture the main character, the primary setting, and the overall mood of the story. Include details about art style, color palette, lighting, and composition.
    2.  **Key Scene Prompts:** Identify 3 pivotal or visually interesting scenes from the plot summary. For each, create a detailed prompt that describes the action, characters involved, setting, and emotional tone of the scene.

    Provide the output in JSON format, following this schema: { "cover_prompt": string, "scene_prompts": [{ "scene_title": string, "prompt": string }] }`;
}

export function getBlurbPrompt(context: Context): string {
    const genreStr = Array.isArray(context.genre) ? context.genre.join(', ') : context.genre;
    const toneStr = Array.isArray(context.tone) ? context.tone.join(', ') : context.tone;

    const characterSummary = context.characters?.map(c => `${c.name}: ${c.description}`).join('\n');
    const plotSummary = context.outline?.chapters.map(c => c.summary).join(' ');

    return `
    Based on the following story details, write the back cover copy for the book.

    **Story Details:**
    - **Title:** ${context.idea?.title}
    - **Genre:** ${genreStr}
    - **Tone:** ${toneStr}
    - **Plot Summary:** ${plotSummary}
    - **Main Characters:**\n${characterSummary}

    **Instructions:**
    1.  **Tagline:** Write a single, catchy tagline for the book.
    2.  **Blurb:** Write a compelling blurb of 150-200 words. It should introduce the main character, the central conflict, and the stakes, but it must not reveal the ending.

    Provide the output in JSON format, following this schema: { "tagline": string, "blurb": string }`;
}

export function getWorldBiblePrompt(context: Context): string {
    const characterProfiles = context.characters?.map(c => `
- Character: ${c.name}
  - Role: ${c.role}
  - Description: ${c.description}
  - Internal Conflict: ${c.internalConflict}
  - External Conflict: ${c.externalConflict}
  - Virtues: ${c.virtues.join(', ')}
  - Flaws: ${c.flaws.join(', ')}
  - Arc: ${c.arc}
  - The Lie They Believe: ${c.lieTheyBelieve}
`).join('');

    const settingDetails = context.settings?.map(s => `
- Setting: ${s.name}
  - Description: ${s.description}
  - Atmosphere: ${s.atmosphere}
  - Plot Significance: ${s.plotSignificance}
  - Sensory Details: ${s.sensoryDetails}
`).join('');

    const plotSummary = context.outline?.chapters.map(c => `Chapter ${c.number}: ${c.title} - ${c.summary}`).join('\n');

    return `
    Based on the complete story context, create a comprehensive "World-Building Bible" for the author. This document should be a structured and detailed reference.

    **Full Story Context:**
    - **Title:** ${context.idea?.title}
    - **Premise:** ${context.idea?.premise}
    - **Character Profiles:**\n${characterProfiles}
    - **Setting Descriptions:**\n${settingDetails}
    - **Full Plot Outline:**\n${plotSummary}

    **Your Tasks:**
    1.  **Timeline of Major Events:** Create a chronological list of key events in the story's backstory and plot.
    2.  **Character Dossiers:** Write expanded details on the main characters' backstories, relationships, and motivations that might not be immediately obvious in the text.
    3.  **Location Guides:** Provide deeper dives into the history, culture, and significance of each major setting.
    4.  **World Rules (if applicable):** If there are any magic systems, unique technologies, or physical laws, explain their rules and limitations clearly.

    Provide the output in JSON format, following this schema: { "timeline": [{ "event": string, "description": string }], "character_dossiers": [{ "name": string, "dossier": string }], "location_guides": [{ "name": string, "guide": string }], "world_rules": string }`;
}

export const systemPrompts = {
  ideas: `
  You are a brainstorming genius specializing in high-concept, unexpected twists. 
  Your mission is to generate ideas that break genre conventions, featuring complex characters and moral dilemmas.`,
  outline: `
  You are a master storyteller and structural editor. 
  Your task is to forge a compelling narrative arc, ensuring each chapter serves a purpose, raises the stakes, and contributes to the overall theme.`,
  characters: `
  You are a deep character psychologist. 
  You craft multi-faceted individuals with rich inner lives, conflicting motivations, and the potential for profound transformation.`,
  settings: `
  You are an evocative world-builder. 
  You don\'t just describe places; you create immersive environments that breathe with atmosphere, influence the plot, and reflect the characters\' inner states.`,
  scenes: `
  You are an expert scene choreographer. 
  You design the building blocks of a chapter, ensuring a dynamic flow between action, dialogue, and introspection, with each scene having a clear purpose.`,
  prose: `
  You are a bestselling novelist known for your evocative prose and deep psychological insight. 
  Your style is immersive, prioritizing "show, don't tell," and every piece of dialogue crackles with subtext. 
  You avoid clichés religiously and strive for originality in every sentence.`,
  editor: `
  You are a meticulous and brilliant developmental editor for a major publishing house. 
  Your job is to refine and perfect a manuscript, ensuring it is compelling, coherent, and aligns with the author's original vision. 
  You make direct edits to the text to improve it.`,
  artDirector: `
  You are a world-class art director and concept artist. 
  Your task is to create detailed, evocative, and powerful text-to-image prompts that capture the essence of a story for its cover art and key scenes.`,
  marketingCopywriter: `
  You are an expert marketing copywriter for a major publishing house. 
  Your specialty is writing compelling,hook-driven back cover blurbs and taglines that make people want to buy the book.`,
  loreKeeper: `
  You are a meticulous lore-keeper and world-builder. 
  Your task is to create a comprehensive World-Building Bible for an author, based on the story they have written. 
  You synthesize all the provided information into a structured and detailed reference document.`

};

