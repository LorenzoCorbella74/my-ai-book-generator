import inquirer from 'inquirer';
import { runPipeline, generateIdeas } from './pipeline';
import { StoryIdea } from './models';

async function main() {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'genre',
      message: 'Enter the genre of the story:',
      default: 'Fantasy', // 'Fantasy','Science Fiction','Mystery','Historical','Horror','Romance','Adventure','Cyberpunk','Steampunk','Magical Realism','Thriller','Comedy',
    },
    {
      type: 'input',
      name: 'tone',
      message: 'Enter the tone of the story:',
      default: 'Epic', //  'Epic','Dark','Lighthearted','Suspenseful','Whimsical','Melancholic','Satirical','Uplifting',
    },
    {
      type: 'list',
      name: 'rating',
      message: 'Select the rating of the story:',
      choices: ['PG', '16', '18'],
    },
    {
      type: 'input',
      name: 'style',
      message: 'Enter the writing style of the story:',
      default: 'Clear and concise', // 'Clear and concise','Descriptive and poetic','Fast-paced and action-packed','Dialogue-driven','First-person narrative','Stream of consciousness','Minimalist','Classic literature',
    },
    {
      type: 'number',
      name: 'maxChapters',
      message: 'Enter the maximum number of chapters:',
      default: 5,
    },
  ]);

  const context = { ...answers, stats: [] };
  console.log('🤔 Generating ideas...');
  const ideas = await generateIdeas(context);

  const ideaChoices = ideas.map((idea: StoryIdea) => ({
    name: `${idea.title}: ${idea.premise}`,
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

  console.log('Story generated successfully in story.md!');
}

main();
