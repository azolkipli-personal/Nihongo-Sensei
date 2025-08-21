
import React from 'react';
import type { Conversation } from '../types';

interface ConversationCardProps {
  conversation: Conversation;
  index: number;
}

const ConversationCard: React.FC<ConversationCardProps> = ({ conversation, index }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-shadow hover:shadow-xl">
      <div className="bg-secondary text-white p-4">
        <h3 className="text-lg font-bold font-jp">会話 {index + 1}: {conversation.title}</h3>
      </div>
      <div className="p-4 space-y-4">
        {conversation.dialogue.map((line, lineIndex) => (
          <div key={lineIndex} className="flex items-start space-x-3">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-light flex items-center justify-center text-primary font-bold">
              {line.speaker.charAt(0)}
            </div>
            <div className="flex-grow">
              <p className="font-semibold text-primary">{line.speaker}</p>
              <p className="font-jp text-slate-800 text-lg">{line.japanese}</p>
              <p className="text-sm text-slate-500 italic">{line.romaji}</p>
              <p className="text-sm text-slate-600">"{line.english}"</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConversationCard;
