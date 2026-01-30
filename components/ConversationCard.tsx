
import React from 'react';

// Fix: Added explicit prop types for Furigana component
const Furigana = ({ text }: { text: string }) => {
  // Regex to find patterns like `漢字[かんじ]` or `食[た]べます`
  const regex = /([\u4e00-\u9faf]+)\[(.+?)\]/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Push the text before the match
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    // Push the ruby element
    const [_, kanji, furigana] = match;
    parts.push(<ruby key={match.index} className="ruby">{kanji}<rt>{furigana}</rt></ruby>);
    lastIndex = regex.lastIndex;
  }

  // Push any remaining text after the last match
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return <>{parts.map((part, i) => <React.Fragment key={i}>{part}</React.Fragment>)}</>;
};

// Fix: Defined interfaces for conversation structure to fix TS validation errors
interface ConversationLine {
  speaker: string;
  japanese: string;
  romaji: string;
  english: string;
}

interface Conversation {
  title: string;
  dialogue: ConversationLine[];
}

interface ConversationCardProps {
  conversation: Conversation;
  index: number;
  showRomaji: boolean;
  showEnglish: boolean;
}

// Fix: Used React.FC to properly handle standard props like 'key' in .tsx files
const ConversationCard: React.FC<ConversationCardProps> = ({ conversation, index, showRomaji, showEnglish }) => {
  return (
    <div className="bg-white dark:bg-slate-700 rounded-lg shadow-md overflow-hidden transition-shadow hover:shadow-xl">
      <div className="bg-secondary text-white p-4">
        <h3 className="text-lg font-bold font-jp">会話 {index + 1}: {conversation.title}</h3>
      </div>
      <div className="p-4 space-y-6">
        {conversation.dialogue.map((line, lineIndex) => (
          <div key={lineIndex} className="flex items-start space-x-3">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-light dark:bg-sky-900 flex items-center justify-center text-primary font-bold">
              {line.speaker.charAt(0)}
            </div>
            <div className="flex-grow space-y-1">
              <p className="font-semibold text-primary">{line.speaker}</p>
              <div className="font-jp text-slate-800 dark:text-slate-200 text-3xl leading-relaxed">
                <Furigana text={line.japanese} />
              </div>
              {showRomaji && <p className="text-3xl text-slate-500 dark:text-slate-400 italic">{line.romaji}</p>}
              {showEnglish && <p className="text-3xl text-slate-600 dark:text-slate-300">"{line.english}"</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConversationCard;
