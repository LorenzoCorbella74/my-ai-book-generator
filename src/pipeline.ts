import { generate } from './ai';
import { z } from 'zod';
import {
  getArtPrompts,
  getBlurbPrompt,
  getChapterScenesPrompt,
  getCharactersPrompt,
  getEditChapterPrompt,
  getIdeasPrompt,
  getOutlinePrompt,
  getSceneProsePrompt,
  getSettingsPrompt,
  getWorldBiblePrompt,
  systemPrompts
} from './prompts';

import {
  StoryIdeaSchema,
  StoryOutlineSchema,
  CharacterSchema,
  SettingSchema,
  RawSceneSchema,
  EditedChapterSchema,
  StoryIdea,
  Scene,
  Chapter,
  Context,
  BlurbSchema,
  ArtPromptsSchema,
  WorldBibleSchema,
} from './models';
import { exportContext, exportStatsMd, exportStoryDocx, exportStoryMd, exportArtPromptsMd, exportBlurbMd, exportWorldBibleMd } from './export';

export async function generateIdeas(context: Context): Promise<StoryIdea[]> {
  const ideasStart = Date.now();
  const ideasPrompt = getIdeasPrompt(
    context.genre,
    context.tone,
    context.rating,
    context.style,
    context.targetAudience,
    context.language
  );
  const { object: ideas, usage } = await generate(ideasPrompt, StoryIdeaSchema.array(), systemPrompts.ideas);
  console.log(`  💡 Token usage for ideas: ${usage.totalTokens} tokens`);
  context.stats.push({
    step: 'ideas',
    time: Date.now() - ideasStart,
    inputTokens: usage.inputTokens ?? 0,
    outputTokens: usage.outputTokens ?? 0,
    totalTokens: usage.totalTokens ?? 0,
    ...(usage.reasoningTokens !== undefined ? { reasoningTokens: usage.reasoningTokens } : {}),
  });
  return ideas;
}

export async function runPipeline(context: Context) {
  if (!context.idea) {
    throw new Error('No idea selected');
  }

  console.log('📝 Generating outline...');
  const outlineStart = Date.now();
  const outlinePrompt = getOutlinePrompt(context.idea, context.maxChapters, context.language, context.narrativeStructure);
  const { object: outline, usage: outlineUsage } = await generate(outlinePrompt, StoryOutlineSchema, systemPrompts.outline);
  context.outline = outline;
  console.log(`  💡 Token usage for outline: ${outlineUsage.totalTokens} tokens`);
  context.stats.push({
    step: 'outline',
    time: Date.now() - outlineStart,
    inputTokens: outlineUsage.inputTokens ?? 0,
    outputTokens: outlineUsage.outputTokens ?? 0,
    totalTokens: outlineUsage.totalTokens ?? 0,
    ...(outlineUsage.reasoningTokens !== undefined ? { reasoningTokens: outlineUsage.reasoningTokens } : {}),
  });

  console.log('👥 Generating characters...');
  const charactersStart = Date.now();
  const charactersPrompt = getCharactersPrompt(context.idea, context.language);
  const { object: characters, usage: charactersUsage } = await generate(charactersPrompt, CharacterSchema.array(), systemPrompts.characters);
  context.characters = characters;
  console.log(`  💡 Token usage for characters: ${charactersUsage.totalTokens} tokens`);
  context.stats.push({
    step: 'characters',
    time: Date.now() - charactersStart,
    inputTokens: charactersUsage.inputTokens ?? 0,
    outputTokens: charactersUsage.outputTokens ?? 0,
    totalTokens: charactersUsage.totalTokens ?? 0,
    ...(charactersUsage.reasoningTokens !== undefined ? { reasoningTokens: charactersUsage.reasoningTokens } : {}),
  });

  console.log('🏞️ Generating settings...');
  const settingsStart = Date.now();
  const settingsPrompt = getSettingsPrompt(context.idea, context.language);
  const { object: settings, usage: settingsUsage } = await generate(settingsPrompt, SettingSchema.array(), systemPrompts.settings);
  context.settings = settings;
  console.log(`  💡 Token usage for settings: ${settingsUsage.totalTokens} tokens`);
  context.stats.push({
    step: 'settings',
    time: Date.now() - settingsStart,
    inputTokens: settingsUsage.inputTokens ?? 0,
    outputTokens: settingsUsage.outputTokens ?? 0,
    totalTokens: settingsUsage.totalTokens ?? 0,
    ...(settingsUsage.reasoningTokens !== undefined ? { reasoningTokens: settingsUsage.reasoningTokens } : {}),
  });

  console.log('🎬 Generating scenes and prose...');
  context.scenes = [];
  if (context.outline && context.characters && context.settings) {
    let previousChapters: Chapter[] = [];
    for (const chapter of context.outline.chapters) {
      console.log(`  📖 Generating scenes for chapter ${chapter.number}...`);
      const chapterScenesStart = Date.now();
      const chapterScenesPrompt = getChapterScenesPrompt(chapter, context.characters, context.settings, context.language);
      const { object: rawScenes, usage: scenesUsage } = await generate(chapterScenesPrompt, RawSceneSchema.array(), systemPrompts.scenes);
      console.log(`    💡 Token usage for chapter ${chapter.number} scenes: ${scenesUsage.totalTokens} tokens`);
      context.stats.push({
        step: `chapter-${chapter.number}-scenes`,
        time: Date.now() - chapterScenesStart,
        inputTokens: scenesUsage.inputTokens ?? 0,
        outputTokens: scenesUsage.outputTokens ?? 0,
        totalTokens: scenesUsage.totalTokens ?? 0,
        ...(scenesUsage.reasoningTokens !== undefined ? { reasoningTokens: scenesUsage.reasoningTokens } : {}),
      });

      let chapterScenes: Scene[] = [];
      let previousScenes: Scene[] = [];
      for (const rawScene of rawScenes) {
        console.log(`    ✍️ Generating prose for scene ${rawScene.number}...`);
        const sceneProseStart = Date.now();
        const scene: Scene = { ...rawScene, chapterNumber: chapter.number };
        const sceneProsePrompt = getSceneProsePrompt(
          scene,
          chapter,
          previousScenes,
          previousChapters,
          context.characters,
          context.settings,
          context.language,
          context.outline.chapters.length
        );
        const { object: prose, usage: proseUsage } = await generate(sceneProsePrompt, z.object({ text: z.string() }), systemPrompts.prose);
        scene.text = prose.text;
        console.log(`      💡 Token usage for scene ${rawScene.number} prose: ${proseUsage.totalTokens} tokens`);
        chapterScenes.push(scene);
        previousScenes.push(scene);
        context.stats.push({
          step: `chapter-${chapter.number}-scene-${rawScene.number}-prose`,
          time: Date.now() - sceneProseStart,
          inputTokens: proseUsage.inputTokens ?? 0,
          outputTokens: proseUsage.outputTokens ?? 0,
          totalTokens: proseUsage.totalTokens ?? 0,
          ...(proseUsage.reasoningTokens !== undefined ? { reasoningTokens: proseUsage.reasoningTokens } : {}),
        });
      }

      // Edit the entire chapter
      console.log(`  ✍️ Editing chapter ${chapter.number}...`);
      const editStart = Date.now();
      const editPrompt = getEditChapterPrompt(chapter, chapterScenes, context.characters, context.settings, previousChapters, context);
      const { object: editedChapter, usage: editUsage } = await generate(editPrompt, EditedChapterSchema, systemPrompts.editor);
      console.log(`    💡 Token usage for chapter ${chapter.number} edit: ${editUsage.totalTokens} tokens`);
      context.stats.push({
        step: `chapter-${chapter.number}-edit`,
        time: Date.now() - editStart,
        inputTokens: editUsage.inputTokens ?? 0,
        outputTokens: editUsage.outputTokens ?? 0,
        totalTokens: editUsage.totalTokens ?? 0,
        ...(editUsage.reasoningTokens !== undefined ? { reasoningTokens: editUsage.reasoningTokens } : {}),
      });

      // Update the scenes in the context with the edited versions
      for (const editedScene of editedChapter.scenes) {
        const sceneToUpdate = chapterScenes.find(s => s.number === editedScene.number);
        if (sceneToUpdate) {
          sceneToUpdate.summary = editedScene.summary;
          sceneToUpdate.text = editedScene.text;
        }
      }

      context.scenes.push(...chapterScenes);
      previousChapters.push(chapter);
    }
  }

  console.log('🚀 Exporting story...');

  if (context.outputFormats.includes('md')) {
    await exportStoryMd(context);
  }
  if (context.outputFormats.includes('docx')) {
    await exportStoryDocx(context);
  }
  if (context.outputFormats.includes('json')) {
    await exportContext(context);
  }
  if (context.outputFormats.includes('stats')) {
    await exportStatsMd(context);
  }

  if (context.outputFormats.includes('art_prompts')) {
    console.log('🎨 Generating art prompts...');
    const artPromptsStart = Date.now();
    const artPromptText = getArtPrompts(context);
    const { object: artPrompts, usage: artUsage } = await generate(artPromptText, ArtPromptsSchema, systemPrompts.artDirector);
    console.log(`  💡 Token usage for art prompts: ${artUsage.totalTokens} tokens`);
    context.stats.push({
      step: 'art_prompts',
      time: Date.now() - artPromptsStart,
      inputTokens: artUsage.inputTokens ?? 0,
      outputTokens: artUsage.outputTokens ?? 0,
      totalTokens: artUsage.totalTokens ?? 0,
      ...(artUsage.reasoningTokens !== undefined ? { reasoningTokens: artUsage.reasoningTokens } : {}),
    });
    await exportArtPromptsMd(context, artPrompts);
  }
  if (context.outputFormats.includes('blurb')) {
    console.log('📝 Generating blurb...');
    const blurbStart = Date.now();
    const blurbPrompt = getBlurbPrompt(context);
    const { object: blurb, usage: blurbUsage } = await generate(blurbPrompt, BlurbSchema, systemPrompts.marketingCopywriter);
    console.log(`  💡 Token usage for blurb: ${blurbUsage.totalTokens} tokens`);
    context.stats.push({
      step: 'blurb',
      time: Date.now() - blurbStart,
      inputTokens: blurbUsage.inputTokens ?? 0,
      outputTokens: blurbUsage.outputTokens ?? 0,
      totalTokens: blurbUsage.totalTokens ?? 0,
      ...(blurbUsage.reasoningTokens !== undefined ? { reasoningTokens: blurbUsage.reasoningTokens } : {}),
    });
    await exportBlurbMd(context, blurb);
  }

  if (context.outputFormats.includes('world_bible')) {
    console.log('📖 Generating World Bible...');
    const worldBibleStart = Date.now();
    const worldBiblePrompt = getWorldBiblePrompt(context);
    const { object: worldBible, usage: worldBibleUsage } = await generate(worldBiblePrompt, WorldBibleSchema, systemPrompts.loreKeeper);
    console.log(`  💡 Token usage for World Bible: ${worldBibleUsage.totalTokens} tokens`);
    context.stats.push({
      step: 'world_bible',
      time: Date.now() - worldBibleStart,
      inputTokens: worldBibleUsage.inputTokens ?? 0,
      outputTokens: worldBibleUsage.outputTokens ?? 0,
      totalTokens: worldBibleUsage.totalTokens ?? 0,
      ...(worldBibleUsage.reasoningTokens !== undefined ? { reasoningTokens: worldBibleUsage.reasoningTokens } : {}),
    });
    await exportWorldBibleMd(context, worldBible);
  }
}

