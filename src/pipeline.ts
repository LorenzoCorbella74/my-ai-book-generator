import { generate } from './ai';
import { z } from 'zod';
import {
  getIdeasPrompt,
  getOutlinePrompt,
  getCharactersPrompt,
  getSettingsPrompt,
  getChapterScenesPrompt,
  getSceneProsePrompt,
  systemPrompts,
} from './prompts';
import {
  StoryIdeaSchema,
  StoryOutlineSchema,
  CharacterSchema,
  SettingSchema,
  RawSceneSchema,
  SceneSchema,
  StoryIdea,
  StoryOutline,
  Character,
  Setting,
  RawScene,
  Scene,
  Chapter,
  Context,
} from './models';
import * as fs from 'fs/promises';

// Helper to write files in output/<book title> folder
async function writeOutputFile(context: Context, filename: string, data: string) {
  const title = context.outline ? context.outline.title : 'unknown_book';
  const outputDir = `output/${title.replace(/[^a-zA-Z0-9-_ ]/g, '').replace(/ /g, '_')}`;
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(`${outputDir}/${filename}`, data);
}

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
  const ideas = await generate(ideasPrompt, StoryIdeaSchema.array(), undefined, systemPrompts.ideas);
  console.log(ideas);
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
  context.outline = await generate(outlinePrompt, StoryOutlineSchema, undefined, systemPrompts.outline);
  console.log('OUTLINE: ', context.outline);
  context.stats.push({ step: 'outline', time: Date.now() - outlineStart });

  console.log('👥 Generating characters...');
  const charactersStart = Date.now();
  const charactersPrompt = getCharactersPrompt(context.idea, context.language);
  context.characters = await generate(charactersPrompt, CharacterSchema.array(), undefined, systemPrompts.characters);
  console.log('CHARACTERS: ', context.characters);
  context.stats.push({ step: 'characters', time: Date.now() - charactersStart });

  console.log('🏞️ Generating settings...');
  const settingsStart = Date.now();
  const settingsPrompt = getSettingsPrompt(context.idea, context.language);
  context.settings = await generate(settingsPrompt, SettingSchema.array(), undefined, systemPrompts.settings);
  console.log('SETTINGS:', context.settings);
  context.stats.push({ step: 'settings', time: Date.now() - settingsStart });

  console.log('🎬 Generating scenes and prose...');
  context.scenes = [];
  if (context.outline && context.characters && context.settings) {
    let previousChapters: Chapter[] = [];
    for (const chapter of context.outline.chapters) {
      console.log(`  📖 Generating scenes for chapter ${chapter.number}...`);
      const chapterScenesStart = Date.now();
      const chapterScenesPrompt = getChapterScenesPrompt(chapter, context.characters, context.settings, context.language);
      const rawScenes = await generate(chapterScenesPrompt, RawSceneSchema.array(), undefined, systemPrompts.scenes);
      context.stats.push({ step: `chapter-${chapter.number}-scenes`, time: Date.now() - chapterScenesStart });

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
        const prose = await generate(sceneProsePrompt, z.object({ text: z.string() }), undefined, systemPrompts.prose);
        scene.text = prose.text;
        context.scenes.push(scene);
        previousScenes.push(scene);
        context.stats.push({ step: `chapter-${chapter.number}-scene-${rawScene.number}-prose`, time: Date.now() - sceneProseStart });
      }
      previousChapters.push(chapter);
    }
  }

  console.log('🚀 Exporting story...');

  await exportStory(context);
  await exportStats(context);
}

async function exportStory(context: Context) {
  if (!context.outline || !context.scenes) {
    return;
  }

  // Slugify function to create valid markdown anchor links from header text
  const slugify = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // remove non-word characters
      .replace(/\s+/g, '-'); // replace spaces with hyphens

  let markdown = `# ${context.outline.title}\n\n`;

  markdown += '## Index\n\n';
  for (const chapter of context.outline.chapters) {
    const chapterHeader = `Chapter ${chapter.number}: ${chapter.title}`;
    markdown += `* [${chapterHeader}](#${slugify(chapterHeader)})\n`;

    const chapterScenes = context.scenes.filter((s) => s.chapterNumber === chapter.number);
    for (const scene of chapterScenes) {
      const sceneLinkText = `Scene ${scene.number}: ${scene.title}`;
      // Add chapter number to scene header for slug uniqueness
      const sceneHeaderForSlug = `Scene ${chapter.number}-${scene.number}: ${scene.title}`;
      markdown += `  * [${sceneLinkText}](#${slugify(sceneHeaderForSlug)})\n`;
    }
  }
  markdown += '\n';

  for (const chapter of context.outline.chapters) {
    const chapterHeader = `Chapter ${chapter.number}: ${chapter.title}`;
    markdown += `## ${chapterHeader}\n\n`;
    const chapterScenes = context.scenes.filter((s) => s.chapterNumber === chapter.number);
    for (const scene of chapterScenes) {
      // Add chapter number to scene header for uniqueness
      const sceneHeader = `Scene ${chapter.number}-${scene.number}: ${scene.title}`;
      markdown += `### ${sceneHeader}\n\n`;
      markdown += `${scene.text}\n\n`;
    }
  }

  await writeOutputFile(context, 'story.md', markdown);
  await writeOutputFile(context, 'context.json', JSON.stringify(context, null, 2));
}

async function exportStats(context: Context) {
  let markdown = '# Generation Stats\n\n';
  markdown += '| Step | Time (min)|\n';
  markdown += '|------|-----------|\n';
  let totalMs = 0;
  for (const stat of context.stats) {
    const minutes = (stat.time / 60000).toFixed(2);
    markdown += `| ${stat.step} | ${minutes} |\n`;
    totalMs += stat.time;
  }
  const totalMinutes = (totalMs / 60000).toFixed(2);
  markdown += `\n**Total time:** ${totalMinutes} minutes\n`;

  await writeOutputFile(context, 'stats.md', markdown);
}
