import { z } from 'zod';

export const StoryIdeaSchema = z.object({
  id: z.number(),
  title: z.string(),
  premise: z.string(),
  mainCharacters: z.array(z.string()),
  settings: z.array(z.string()),
});

export const ChapterSchema = z.object({
  number: z.number(),
  title: z.string(),
  summary: z.string(),
});

export const StoryOutlineSchema = z.object({
  title: z.string(),
  chapters: z.array(ChapterSchema),
});

export const CharacterSchema = z.object({
  name: z.string(),
  role: z.string(),
  description: z.string(),
  relations: z.array(
    z.object({
      type: z.string(),
      with: z.string(),
    })
  ),
});

export const SettingSchema = z.object({
  name: z.string(),
  description: z.string(),
});

export const RawSceneSchema = z.object({
  number: z.number(),
  title: z.string(),
  summary: z.string(),
  characters: z.array(z.string()),
  settings: z.array(z.string()),
});

export const SceneSchema = RawSceneSchema.extend({
  chapterNumber: z.number(),
  text: z.string().optional(),
});

export type StoryIdea = z.infer<typeof StoryIdeaSchema>;
export type StoryOutline = z.infer<typeof StoryOutlineSchema>;
export type Chapter = z.infer<typeof ChapterSchema>;
export type Character = z.infer<typeof CharacterSchema>;
export type Setting = z.infer<typeof SettingSchema>;
export type RawScene = z.infer<typeof RawSceneSchema>;
export type Scene = z.infer<typeof SceneSchema>;
