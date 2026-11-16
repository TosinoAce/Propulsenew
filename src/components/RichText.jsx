/**
 * Renders the simple writing format used for blog posts and job descriptions:
 *   a blank line starts a new paragraph,
 *   a line starting with "## " is a heading,
 *   lines starting with "- " form a bulleted list.
 * Everything is rendered as plain text, so nothing typed in the admin area can inject markup.
 */
const parse = (source) => {
  const blocks = [];
  let list = null;
  let paragraph = [];

  const flushParagraph = () => {
    if (paragraph.length) blocks.push({ type: "p", text: paragraph.join(" ") });
    paragraph = [];
  };
  const flushList = () => {
    if (list) blocks.push({ type: "ul", items: list });
    list = null;
  };

  for (const raw of (source ?? "").replace(/\r\n/g, "\n").split("\n")) {
    const line = raw.trim();
    if (!line) {
      flushParagraph();
      flushList();
    } else if (line.startsWith("## ")) {
      flushParagraph();
      flushList();
      blocks.push({ type: "h2", text: line.slice(3) });
    } else if (line.startsWith("- ")) {
      flushParagraph();
      (list ??= []).push(line.slice(2));
    } else {
      flushList();
      paragraph.push(line);
    }
  }
  flushParagraph();
  flushList();
  return blocks;
};

const RichText = ({ source, className = "" }) => (
  <div className={`flex flex-col gap-5 text-lg leading-relaxed text-ink-soft ${className}`}>
    {parse(source).map((block, index) => {
      if (block.type === "h2") {
        return (
          <h2 key={index} className="mt-4 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            {block.text}
          </h2>
        );
      }
      if (block.type === "ul") {
        return (
          <ul key={index} className="flex flex-col gap-2.5">
            {block.items.map((item, itemIndex) => (
              <li key={itemIndex} className="flex gap-3">
                <span className="mt-[0.7em] size-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        );
      }
      return <p key={index}>{block.text}</p>;
    })}
  </div>
);

/** Rough reading time for a body of text, in whole minutes. */
export const readingMinutes = (source) =>
  Math.max(1, Math.round((source ?? "").split(/\s+/).filter(Boolean).length / 220));

export default RichText;
