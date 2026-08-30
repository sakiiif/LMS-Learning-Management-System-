type BlockNode = {
  type: string;
  children?: BlockNode[];
  text?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
};

function renderInline(node: BlockNode, key: number): React.ReactNode {
  if (node.text !== undefined) {
    let el: React.ReactNode = node.text;
    if (node.bold) el = <strong key={key}>{el}</strong>;
    if (node.italic) el = <em key={key}>{el}</em>;
    if (node.underline) el = <u key={key}>{el}</u>;
    return <span key={key}>{el}</span>;
  }
  return null;
}

export function renderBlocks(blocks: BlockNode[] | null | undefined): React.ReactNode {
  if (!blocks || !Array.isArray(blocks)) return null;

  return blocks.map((block, i) => {
    const children = (block.children || []).map((child, j) => renderInline(child, j));

    switch (block.type) {
      case 'paragraph':
        return (
          <p key={i} className="mb-3">
            {children}
          </p>
        );
      case 'heading':
        return (
          <h3 key={i} className="font-semibold text-lg mt-4 mb-2">
            {children}
          </h3>
        );
      case 'list':
        return (
          <ul key={i} className="list-disc pl-5 mb-3">
            {(block.children || []).map((item, j) => (
              <li key={j}>
                {(item.children || []).map((c, k) => renderInline(c, k))}
              </li>
            ))}
          </ul>
        );
      default:
        return <p key={i} className="mb-3">{children}</p>;
    }
  });
}