import React from 'react';
import ConversationCard from './ConversationCard';

const ResultDisplay = ({ result, showRomaji, showEnglish }) => {
  return (
    <div className="mt-12 w-full max-w-4xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-lg shadow-lg relative">
        <div className="mb-4">
            <h2 className="text-4xl font-bold text-primary mb-1 font-jp">{result.wordDetails.kanji}</h2>
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-slate-600">
                <p className="text-xl font-medium font-jp">{result.wordDetails.kana}</p>
                <p className="text-lg font-sans italic">{result.wordDetails.romaji}</p>
            </div>
        </div>
        <p className="text-xl text-slate-700">{result.meaning}</p>
      </div>

      <h2 className="text-center text-2xl font-bold text-slate-800">Example Conversations</h2>
      
      <div className="space-y-6">
        {result.conversations.map((convo, index) => (
          <ConversationCard key={index} conversation={convo} index={index} showRomaji={showRomaji} showEnglish={showEnglish} />
        ))}
      </div>
    </div>
  );
};

export default ResultDisplay;
