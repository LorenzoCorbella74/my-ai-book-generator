import { generate } from './ai';
import { z } from 'zod';
import {
  getIdeasPrompt,
  getOutlinePrompt,
  getCharactersPrompt,
  getSettingsPrompt,
  getChapterScenesPrompt,
  getSceneProsePrompt,
  getEditChapterPrompt,
  systemPrompts,
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
} from './models';
import { exportStoryMd, exportStoryDocx, exportContext, exportStatsMd } from './export';

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
  const ideas = await generate(ideasPrompt, StoryIdeaSchema.array(), systemPrompts.ideas);
  context.stats.push({ step: 'ideas', time: Date.now() - ideasStart });
  return ideas;
}

export async function runPipeline(context: Context) {
  if (!context.idea) {
    throw new Error('No idea selected');
  }

  console.log('📝 Generating outline...');
  const outlineStart = Date.now();
  const outlinePrompt = getOutlinePrompt(context.idea, context.maxChapters, context.language, context.narrativeStructure);
  context.outline = await generate(outlinePrompt, StoryOutlineSchema, systemPrompts.outline);
  context.stats.push({ step: 'outline', time: Date.now() - outlineStart });

  console.log('👥 Generating characters...');
  const charactersStart = Date.now();
  const charactersPrompt = getCharactersPrompt(context.idea, context.language);
  context.characters = await generate(charactersPrompt, CharacterSchema.array(), systemPrompts.characters);
  context.stats.push({ step: 'characters', time: Date.now() - charactersStart });

  console.log('🏞️ Generating settings...');
  const settingsStart = Date.now();
  const settingsPrompt = getSettingsPrompt(context.idea, context.language);
  context.settings = await generate(settingsPrompt, SettingSchema.array(), systemPrompts.settings);
  context.stats.push({ step: 'settings', time: Date.now() - settingsStart });

  console.log('🎬 Generating scenes and prose...');
  context.scenes = [];
  if (context.outline && context.characters && context.settings) {
    let previousChapters: Chapter[] = [];
    for (const chapter of context.outline.chapters) {
      console.log(`  📖 Generating scenes for chapter ${chapter.number}...`);
      const chapterScenesStart = Date.now();
      const chapterScenesPrompt = getChapterScenesPrompt(chapter, context.characters, context.settings, context.language);
      const rawScenes = await generate(chapterScenesPrompt, RawSceneSchema.array(), systemPrompts.scenes);
      context.stats.push({ step: `chapter-${chapter.number}-scenes`, time: Date.now() - chapterScenesStart });

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
        const prose = await generate(sceneProsePrompt, z.object({ text: z.string() }), systemPrompts.prose);
        scene.text = prose.text;
        chapterScenes.push(scene);
        previousScenes.push(scene);
        context.stats.push({ step: `chapter-${chapter.number}-scene-${rawScene.number}-prose`, time: Date.now() - sceneProseStart });
      }

      // Edit the entire chapter
      console.log(`  ✍️ Editing chapter ${chapter.number}...`);
      const editStart = Date.now();
      const editPrompt = getEditChapterPrompt(chapter, chapterScenes, context.characters, context.settings, previousChapters, context);
      const editedChapter = await generate(editPrompt, EditedChapterSchema, systemPrompts.editor);
      context.stats.push({ step: `chapter-${chapter.number}-edit`, time: Date.now() - editStart });

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

  await exportStoryMd(context);
  await exportStoryDocx(context);
  await exportContext(context);
  await exportStatsMd(context);
}

