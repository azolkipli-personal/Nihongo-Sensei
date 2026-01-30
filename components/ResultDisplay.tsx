
import React, { useState } from 'react';
import ConversationCard from './ConversationCard';

// Fix: Defined interfaces for result data to fix TS errors and enable proper prop typing
interface WordDetails {
  kanji: string;
  kana: string;
  romaji: string;
}

interface ResultData {
  wordDetails: WordDetails;
  meaning: string;
  conversations: any[];
}

interface ResultDisplayProps {
  result: ResultData;
  showRomaji: boolean;
  showEnglish: boolean;
  onDelete?: (index: number) => void;
  index?: number;
}

// Fix: Used React.FC to handle 'key' prop and other standard React attributes in .tsx files
const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, showRomaji, showEnglish, onDelete, index }) => {
  const [isConversationsVisible, setIsConversationsVisible] = useState(false);

  // Create a unique ID for ARIA attributes
  const conversationSectionId = `conversations-${result.wordDetails.romaji.replace(/\s+/g, '-')}`;
  
  const handleDelete = () => {
    if (onDelete && typeof index === 'number') {
      onDelete(index);
    }
  };

  return (
    <div className="mt-12 w-full max-w-4xl mx-auto space-y-8">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg relative">
        {onDelete && (
            <button
                onClick={handleDelete}
                className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/50 dark:hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-slate-800 transition-colors"
                aria-label={`Delete entry for ${result.wordDetails.kanji}`}
                title={`Delete entry for ${result.wordDetails.kanji}`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
            </button>
        )}
        <div className="mb-4">
            <h2 className="text-4xl font-bold text-primary mb-1 font-jp">{result.wordDetails.kanji}</h2>
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-slate-600 dark:text-slate-400">
                <p className="text-xl font-medium font-jp">{result.wordDetails.kana}</p>
                <p className="text-lg font-sans italic">{result.wordDetails.romaji}</p>
            </div>
        </div>
        <p className="text-xl text-slate-700 dark:text-slate-300">{result.meaning}</p>
      </div>
      
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg">
        <button
          onClick={() => setIsConversationsVisible(prev => !prev)}
          className="w-full text-left p-4 flex justify-between items-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors rounded-t-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
          aria-expanded={isConversationsVisible}
          aria-controls={conversationSectionId}
        >
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Example Conversations</h2>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`h-6 w-6 transform transition-transform duration-300 text-slate-500 dark:text-slate-400 ${isConversationsVisible ? 'rotate-180' : 'rotate-0'}`} 
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
