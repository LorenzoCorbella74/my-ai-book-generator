import inquirer from 'inquirer';
import { runPipeline, generateIdeas } from './pipeline';
import { StoryIdea } from './models';
import { readFileSync } from 'fs';

async function main() {
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'language',
      message: 'Choose the language of the book:',
      choices: ['English', 'Italian', 'Spanish', 'French'],
      default: 'English',
    },
    {
      type: 'checkbox',
      name: 'genre',
      message: 'Select the genre(s) of the story (choose 1-3):',
      choices: [
        'Fantasy', 'Science Fiction', 'Mystery', 'Historical', 'Horror', 'Romance', 'Adventure', 'Cyberpunk', 'Steampunk', 'Magical Realism', 'Thriller', 'Comedy'
      ],
      validate: (input: string[]) => input.length >= 1 && input.length <= 3 ? true : 'Select between 1 and 3 genres.'
    },
    {
      type: 'checkbox',
      name: 'tone',
      message: 'Select the tone(s) of the story (choose 1-3):',
      choices: [
        'Epic', 'Dark', 'Lighthearted', 'Suspenseful', 'Whimsical', 'Melancholic', 'Satirical', 'Uplifting'
      ],
      validate: (input: string[]) => input.length >= 1 && input.length <= 3 ? true : 'Select between 1 and 3 tones.'
    },
    {
      type: 'list',
      name: 'rating',
      message: 'Select the rating of the story:',
      choices: ['PG', '16', '18'],
    },
    {
      type: 'checkbox',
      name: 'style',
      message: 'Select the writing style(s) of the story (choose 1-3):',
      choices: [
        'Clear and concise', 'Descriptive and poetic', 'Fast-paced and action-packed', 'Dialogue-driven', 'First-person narrative', 'Stream of consciousness', 'Minimalist', 'Classic literature'
      ],
      validate: (input: string[]) => input.length >= 1 && input.length <= 3 ? true : 'Select between 1 and 3 styles.'
    },
    {
      type: 'checkbox',
      name: 'targetAudience',
      message: 'Select the target audience(s) (choose 1-3):',
      choices: [
        'Children', 'Middle Grade', 'Young Adult', 'Adult', 'Seniors', 'LGBTQ+', 'Families', 'Educators', 'General', 'Fans of a specific genre', 'Reluctant readers', 'Advanced readers'
      ],
      validate: (input: string[]) => input.length >= 1 && input.length <= 3 ? true : 'Select between 1 and 3 audiences.'
    },
    {
      type: 'number',
      name: 'maxChapters',
      message: 'Enter the maximum number of chapters:',
      default: 5,
    },
    {
      type: 'checkbox',
      name: 'outputFormats',
      message: 'Select desired output formats/files:',
      choices: [
        { name: 'Markdown (.md) story', value: 'md', checked: true },
        { name: 'DOCX (.docx) story', value: 'docx', checked: true },
        { name: 'Context JSON (.json)', value: 'json', checked: true },
        { name: 'Stats Markdown (.md)', value: 'stats', checked: true },
        { name: 'Art Prompts (.md)', value: 'art_prompts', checked: true },
        { name: 'Back Cover Blurb (.md)', value: 'blurb', checked: true },
        { name: 'World-Building Bible (.md)', value: 'world_bible', checked: true },
      ],
    },
    {
      type: 'list',
      name: 'narrativeStructure',
      message: 'Select the narrative structure:',
      choices: [
        'Three-Act Structure',
        'The Hero\'s Journey',
        'Fichtean Curve',
        'Save the Cat!',
        'Seven-Point Story Structure',
        'In Medias Res',
        'Freytag\'s Pyramid',
        /* 'The Snowflake Method', */
        'Kishōtenketsu',
        'Non-linear Narrative'
      ],
      default: 'Three-Act Structure',
    }
  ]);

  const context = { ...answers, stats: [] };
  console.log('🤔 Generating ideas...');
  const ideas = await generateIdeas(context);

  const ideaChoices = ideas.map((idea: StoryIdea) => ({
    name: `${idea.title}: ${idea.logline}`,
    value: idea.id,
  }));

  const { selectedIdeaId } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedIdeaId',
      message: 'Select a story idea:',
      choices: ideaChoices,
    },
  ]);

  const selectedIdea = ideas.find((idea: StoryIdea) => idea.id === selectedIdeaId);

  if (!selectedIdea) {
    console.error('Invalid idea selected');
    return;
  }

  await runPipeline({ ...context, idea: selectedIdea });

  console.log('Story generated successfully. Look at the output folder!');
}

// Load package.json to display version and author
const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'));
const { author, version } = packageJson;

console.log(`My AI Book Generator 📚 - Your Bestselling Co-Author`);
console.log(`By ${author} | Version ${version}\n`);

main();
