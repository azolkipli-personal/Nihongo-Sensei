import React from 'react';
import type { LearningResult } from '../types';
import ConversationCard from './ConversationCard';

interface ResultDisplayProps {
  result: LearningResult;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ result }) => {

  const handleExport = () => {
    // Create a URL-friendly slug from the Japanese reading or word
    const slugify = (text: string) => {
      return text
        .toLowerCase()
        .trim()
        .replace(/[^ \p{L}\p{N}]+/gu, '') // Remove non-letter/number characters except spaces
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .slice(0, 50); // Limit length
    };
    
    const wordSlug = slugify(result.reading || 'session');
    const fileName = `nihongo-sensei-${wordSlug}.json`;
    
    const jsonString = JSON.stringify(result, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-12 w-full max-w-4xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-lg shadow-lg relative">
        <button
          onClick={handleExport}
          className="absolute top-4 right-4 bg-secondary text-white p-2 rounded-full hover:bg-primary transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          aria-label="Export to JSON"
          title="Export to JSON"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </button>

        <h2 className="text-3xl font-bold text-primary mb-2 font-jp">{result.reading}</h2>
        <p className="text-xl text-slate-700">{result.meaning}</p>
      </div>

      <h2 className="text-center text-2xl font-bold text-slate-800">Example Conversations</h2>
      
      <div className="space-y-6">
        {result.conversations.map((convo, index) => (
          <ConversationCard key={index} conversation={convo} index={index} />
        ))}
      </div>
    </div>
  );
};

export default ResultDisplay;