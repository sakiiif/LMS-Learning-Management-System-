// Converts plain text (with blank lines separating paragraphs) into
// Strapi's Rich Text (Blocks) JSON format.
export function textToBlocks(text: string) {
  const paragraphs = text.split('\n').filter((line) => line.trim() !== '');

  if (paragraphs.length === 0) {
    return [{ type: 'paragraph', children: [{ type: 'text', text: '' }] }];
  }

  return paragraphs.map((line) => ({
    type: 'paragraph',
    children: [{ type: 'text', text: line }],
  }));
}

// Converts Blocks JSON back into plain text, for editing in a plain
// textarea (reverse of textToBlocks).
export function blocksToText(blocks: any[] | null | undefined): string {
  if (!blocks || !Array.isArray(blocks)) return '';

  return blocks
    .map((block) =>
      (block.children || []).map((child: any) => child.text || '').join('')
    )
    .join('\n');
}