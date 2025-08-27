import { z } from 'zod';

export const StoryIdeaSchema = z.object({
  id: z.number(),
  title: z.string(),
  logline: z.string(),
  premise: z.string(),
  centralConflict: z.string(),
  moralDilemma: z.string(),
  mainCharacters: z.array(
    z.object({
      name: z.string(),
      motivation: z.string(),
      secret: z.string(),
    })
  ),
  settings: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
    })
  ),
});

export const ChapterSchema = z.object({
  number: z.number(),
  title: z.string(),
  summary: z.string(),
  turningPoint: z.string(),
  emotionalShift: z.string(),
  subplotsAdvanced: z.array(z.string()),
});

export const StoryOutlineSchema = z.object({
  title: z.string(),
  chapters: z.array(ChapterSchema),
});

export const CharacterSchema = z.object({
  name: z.string(),
  role: z.string(),
  description: z.string(),
  internalConflict: z.string(),
  externalConflict: z.string(),
  virtues: z.array(z.string()),
  flaws: z.array(z.string()),
  arc: z.string(),
  lieTheyBelieve: z.string(),
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
  atmosphere: z.string(),
  plotSignificance: z.string(),
  sensoryDetails: z.string(),
});

export const RawSceneSchema = z.object({
  number: z.number(),
  title: z.string(),
  summary: z.string(),
  purpose: z.string(),
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

export const EditedSceneSchema = z.object({
  number: z.number(),
  title: z.string(),
  summary: z.string(),
  text: z.string(),
});

export const EditedChapterSchema = z.object({
    scenes: z.array(EditedSceneSchema),
});

export type EditedScene = z.infer<typeof EditedSceneSchema>;
export type EditedChapter = z.infer<typeof EditedChapterSchema>;

export const ArtScenePromptSchema = z.object({
  scene_title: z.string(),
  prompt: z.string(),
});

export const ArtPromptsSchema = z.object({
  cover_prompt: z.string(),
  scene_prompts: z.array(ArtScenePromptSchema),
});

export type ArtScenePrompt = z.infer<typeof ArtScenePromptSchema>;
export type ArtPrompts = z.infer<typeof ArtPromptsSchema>;

export const BlurbSchema = z.object({
  tagline: z.string(),
  blurb: z.string(),
});

export type Blurb = z.infer<typeof BlurbSchema>;

export interface Stat {
  step: string;
  time: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  reasoningTokens?:number;
}

export interface Context {
  genre: string[] | string;
  tone: string[] | string;
  rating: string;
  style: string[] | string;
  targetAudience: string[] | string;
  language: string;
  maxChapters: number;
  narrativeStructure: string;
  idea?: StoryIdea;
  outline?: StoryOutline;
  characters?: Character[];
  settings?: Setting[];
  scenes?: Scene[];
  stats: Stat[];
}
