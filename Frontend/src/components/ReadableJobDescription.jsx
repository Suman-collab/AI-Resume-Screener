const parseDescription = (description) => {
  const lines = String(description || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const blocks = [];
  let currentList = [];

  const flushList = () => {
    if (currentList.length) {
      blocks.push({ type: 'list', items: currentList });
      currentList = [];
    }
  };

  lines.forEach((line) => {
    const bulletMatch = line.match(/^[-*•]\s+(.+)$/) || line.match(/^\d+[.)]\s+(.+)$/);

    if (bulletMatch) {
      currentList.push(bulletMatch[1].trim());
      return;
    }

    flushList();

    if (/^[A-Za-z][A-Za-z/&\s]{1,40}:$/.test(line)) {
      blocks.push({ type: 'heading', text: line.replace(/:$/, '') });
      return;
    }

    blocks.push({ type: 'paragraph', text: line });
  });

  flushList();

  return blocks;
};

const ReadableJobDescription = ({
  description,
  compact = false,
  maxBlocks,
}) => {
  const blocks = parseDescription(description);
  const visibleBlocks = typeof maxBlocks === 'number' ? blocks.slice(0, maxBlocks) : blocks;

  return (
    <div className={`text-slate-700 ${compact ? 'space-y-2.5 text-sm leading-6' : 'space-y-4 text-[15px] leading-7'}`}>
      {visibleBlocks.map((block, index) => {
        if (block.type === 'heading') {
          return (
            <h4 key={`${block.type}-${index}`} className={`font-semibold text-slate-900 ${compact ? 'text-sm' : 'text-base'}`}>
              {block.text}
            </h4>
          );
        }

        if (block.type === 'list') {
          return (
            <ul key={`${block.type}-${index}`} className={`list-disc text-slate-600 ${compact ? 'space-y-1 pl-5' : 'space-y-1.5 pl-6'}`}>
              {block.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          );
        }

        return (
          <p key={`${block.type}-${index}`} className="text-slate-600">
            {block.text}
          </p>
        );
      })}
    </div>
  );
};

export default ReadableJobDescription;
