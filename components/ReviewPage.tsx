import React, { useState, useRef } from 'react';
import type { LearningResult } from '../types';
import ResultDisplay from './ResultDisplay';

const ReviewPage: React.FC = () => {
  const [reviewedResult, setReviewedResult] = useState<LearningResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setReviewedResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') {
          throw new Error("Failed to read file content.");
        }
        const parsed = JSON.parse(text);
        
        // Basic validation to ensure it's a valid LearningResult object
        if (
          typeof parsed.meaning === 'string' &&
          typeof parsed.reading === 'string' &&
          Array.isArray(parsed.conversations) &&
          (parsed.conversations.length === 0 || 
            (typeof parsed.conversations[0].title === 'string' && Array.isArray(parsed.conversations[0].dialogue)))
        ) {
          setReviewedResult(parsed);
        } else {
          throw new Error("Invalid JSON structure. The file does not appear to be a valid Nihongo Sensei export.");
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to parse JSON file.");
        setReviewedResult(null);
      } finally {
        // Clear the file input value so the same file can be re-uploaded
        if (event.target) {
            event.target.value = '';
        }
      }
    };
    reader.onerror = () => {
        setError("Error reading the file.");
        setReviewedResult(null);
    };
    reader.readAsText(file);
  };

  const handleButtonClick = () => {
      fileInputRef.current?.click();
  }

  return (
    <div className="w-full max-w-4xl mx-auto text-center">
      {!reviewedResult && (
        <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Review Saved Session</h2>
            <p className="text-slate-600 mb-6">
            Load a previously exported <code className="bg-slate-200 text-slate-800 text-sm p-1 rounded font-mono">.json</code> file to review your study session.
            </p>
            
            <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange} 
                accept=".json,application/json"
                className="hidden"
                aria-hidden="true"
            />

            <button 
                onClick={handleButtonClick}
                className="py-3 px-6 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-primary hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
            >
                Upload JSON File
            </button>
        </div>
      )}

        {error && (
          <div className="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative text-left" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

      {reviewedResult && (
        <>
            <div className="text-right mb-4">
                <button
                    onClick={() => {
                        setReviewedResult(null);
                        setError(null);
                    }}
                    className="py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                >
                    Load another file
                </button>
            </div>
            <ResultDisplay result={reviewedResult} />
        </>
      )}
    </div>
  );
};

export default ReviewPage;
