import * as fs from 'fs/promises';
import { Document, Packer, Paragraph, HeadingLevel, TextRun, Styles, AlignmentType } from 'docx';
import { Context, ArtPrompts, Blurb } from './models';

// Helper to write files in output/<book title> folder
async function writeOutputFile(context: Context, filename: string, data: string | Buffer) {
  const title = context.outline ? context.outline.title : 'unknown_book';
  const outputDir = `output/${title.replace(/[^a-zA-Z0-9-_ ]/g, '').replace(/ /g, '_')}`;
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(`${outputDir}/${filename}`, data);
}

export async function exportStoryMd(context: Context) {
  if (!context.outline || !context.scenes) {
    return;
  }

  // Slugify function to create valid markdown anchor links from header text
  const slugify = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // remove non-word characters
      .replace(/\s+/g, '-') // replace spaces with hyphens

  let markdown = `# ${context.outline.title}\n\n`;

  markdown += '## Index\n\n';
  for (const chapter of context.outline.chapters) {
    const chapterHeader = `Chapter ${chapter.number}: ${chapter.title}`;
    markdown += `* [${chapterHeader}](#${slugify(chapterHeader)})
`;

    const chapterScenes = context.scenes.filter((s) => s.chapterNumber === chapter.number);
    for (const scene of chapterScenes) {
      const sceneLinkText = `Scene ${scene.number}: ${scene.title}`;
      // Add chapter number to scene header for slug uniqueness
      const sceneHeaderForSlug = `Scene ${chapter.number}-${scene.number}: ${scene.title}`;
      markdown += `  * [${sceneLinkText}](#${slugify(sceneHeaderForSlug)})
`;
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
}

export async function exportStoryDocx(context: Context) {
    if (!context.outline || !context.scenes) {
      return;
    }
  
    const children = [
      new Paragraph({
        text: context.outline.title,
        heading: HeadingLevel.TITLE,
      }),
    ];
  
    for (const chapter of context.outline.chapters) {
      children.push(
        new Paragraph({
          text: `Chapter ${chapter.number}: ${chapter.title}`,
          heading: HeadingLevel.HEADING_1,
        })
      );
  
      const chapterScenes = context.scenes.filter((s) => s.chapterNumber === chapter.number);
      for (const scene of chapterScenes) {
        children.push(
          new Paragraph({
            text: `Scene ${scene.number}: ${scene.title}`,
            heading: HeadingLevel.HEADING_2,
          })
        );
        // Split scene text into paragraphs
        const sceneParagraphs = scene.text ? scene.text.split('\n').filter(p => p.trim() !== '') : [];
        for (const paragraphText of sceneParagraphs) {
            children.push(
                new Paragraph({
                    children: [new TextRun({
                      text:paragraphText,
                      font: "Calibri",
                      size: 24, // 12 points
                    })],
                    spacing: { after: 200 },
                     alignment: AlignmentType.JUSTIFIED,
                })
            );
        }
      }
    }

  
    const doc = new Document({
      sections: [{
        properties: {},
        children,
      }],
    });
  
    const buffer = await Packer.toBuffer(doc);
    await writeOutputFile(context, 'story.docx', buffer);
  }

export async function exportContext(context: Context) {
    await writeOutputFile(context, 'context.json', JSON.stringify(context, null, 2));
}

export async function exportStatsMd(context: Context) {
  let markdown = '# Generation Stats\n\n';
  markdown += '| Step | Time (min) | Prompt Tokens | Completion Tokens | Total Tokens |\n';
  markdown += '|------|------------|---------------|-------------------|--------------|\n';
  let totalMs = 0;
  let totalPromptTokens = 0;
  let totalCompletionTokens = 0;
  let totalTokens = 0;

  for (const stat of context.stats) {
    const minutes = (stat.time / 60000).toFixed(2);
    markdown += `| ${stat.step} | ${minutes} | ${stat.inputTokens} | ${stat.outputTokens} | ${stat.totalTokens} |\n`;
    totalMs += stat.time;
    totalPromptTokens += stat.inputTokens;
    totalCompletionTokens += stat.outputTokens;
    totalTokens += stat.totalTokens;
  }

  const totalMinutes = (totalMs / 60000).toFixed(2);
  markdown += `\n**Total time:** ${totalMinutes} minutes\n`;
  markdown += `**Total prompt tokens:** ${(totalPromptTokens / 1_000_000).toFixed(4)}M\n`;
  markdown += `**Total completion tokens:** ${(totalCompletionTokens / 1_000_000).toFixed(4)}M\n`;
  markdown += `**Total tokens:** ${(totalTokens / 1_000_000).toFixed(4)}M\n`;

  await writeOutputFile(context, 'stats.md', markdown);
}

export async function exportArtPromptsMd(context: Context, artPrompts: ArtPrompts) {
  let markdown = '# Art Prompts\n\n';
  markdown += '## Cover Art Prompt\n\n';
  markdown += `${artPrompts.cover_prompt}\n\n`;
  markdown += '## Scene Art Prompts\n\n';
  for (const scenePrompt of artPrompts.scene_prompts) {
    markdown += `### ${scenePrompt.scene_title}\n\n`;
    markdown += `${scenePrompt.prompt}\n\n`;
  }

  await writeOutputFile(context, 'art_prompts.md', markdown);
}
