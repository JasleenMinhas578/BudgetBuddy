export default function MessageText({ text, className }) {
  const lines = text.split('\n').flatMap(line => line.split(/(?=•)/)).map(l => l.trim()).filter(Boolean);
  const hasBullets = lines.some(l => l.startsWith('•'));

  if (!hasBullets) return <p className={className}>{text}</p>;

  return (
    <div className={className}>
      {lines.map((line, i) =>
        line.startsWith('•')
          ? <div key={i} className="ai-bullet-line">{line}</div>
          : <p key={i} className="ai-bullet-intro">{line}</p>
      )}
    </div>
  );
}
