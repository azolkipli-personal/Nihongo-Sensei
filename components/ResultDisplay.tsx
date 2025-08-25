import React, { useState } from 'react';
import ConversationCard from './ConversationCard';

const ResultDisplay = ({ result, showRomaji, showEnglish }) => {
  const [isConversationsVisible, setIsConversationsVisible] = useState(false);

  // Create a unique ID for ARIA attributes
  const conversationSectionId = `conversations-${result.wordDetails.romaji.replace(/\s+/g, '-')}`;

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
      
      <div className="bg-white rounded-lg shadow-lg">
        <button
          onClick={() => setIsConversationsVisible(prev => !prev)}
          className="w-full text-left p-4 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors rounded-t-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
          aria-expanded={isConversationsVisible}
          aria-controls={conversationSectionId}
        >
          <h2 className="text-xl font-bold text-slate-800">Example Conversations</h2>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`h-6 w-6 transform transition-transform duration-300 text-slate-500 ${isConversationsVisible ? 'rotate-180' : 'rotate-0'}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        <div
          id={conversationSectionId}
          style={{ transition: 'max-height 0.5s ease-in-out' }}
          className={`overflow-hidden ${isConversationsVisible ? 'max-h-[2000px]' : 'max-h-0'}`}
        >
            <div className="p-4 pt-0 space-y-6">
                {result.conversations.map((convo, index) => (
                <ConversationCard key={index} conversation={convo} index={index} showRomaji={showRomaji} showEnglish={showEnglish} />
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ResultDisplay;
