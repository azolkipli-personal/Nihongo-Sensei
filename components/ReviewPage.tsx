import React, { useState, useRef } from 'react';
import ResultDisplay from './ResultDisplay';

const ReviewPage = () => {
  const [reviewedResults, setReviewedResults] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showRomaji, setShowRomaji] = useState(true);
  const [showEnglish, setShowEnglish] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isValidLearningResult = (obj: any): boolean => {
      return (
          obj &&
          typeof obj.meaning === 'string' &&
          typeof obj.wordDetails === 'object' &&
          obj.wordDetails !== null &&
          typeof obj.wordDetails.kanji === 'string' &&
          typeof obj.wordDetails.kana === 'string' &&
          typeof obj.wordDetails.romaji === 'string' &&
          Array.isArray(obj.conversations)
      );
  };
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setError(null);
    setReviewedResults(null);
    const loadedResults: any[] = [];

    const readFile = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              const result = e.target?.result;
              if (typeof result === 'string') {
                resolve(result);
              } else {
                reject(new Error(`Failed to read file ${file.name} as text.`));
              }
            };
            reader.onerror = () => reject(new Error(`Error reading file ${file.name}`));
            reader.readAsText(file);
        });
    };

    try {
        for (const file of Array.from(files)) {
            const text = await readFile(file);
            const parsed = JSON.parse(text);

            if (Array.isArray(parsed)) {
                // Handle multi-word export file
                const validItems = parsed.filter(isValidLearningResult);
                if (validItems.length !== parsed.length) {
                    console.warn(`File ${file.name} contains some invalid items.`);
                }
                loadedResults.push(...validItems);
            } else if (isValidLearningResult(parsed)) {
                // Handle single-word export file
                loadedResults.push(parsed);
            } else {
                throw new Error(`File ${file.name} has an invalid JSON structure.`);
            }
        }
        
        if (loadedResults.length > 0) {
            setReviewedResults(loadedResults);
        } else {
            throw new Error("No valid learning results found in the selected file(s).");
        }

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse JSON file(s).");
      setReviewedResults(null);
    } finally {
      // Clear the file input value so the same file can be re-uploaded
      if (event.target) {
          event.target.value = '';
      }
    }
  };

  const handleButtonClick = () => {
      fileInputRef.current?.click();
  }

  const visibilityButtonStyle = "py-2 px-4 rounded-md border shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors";
  const activeVisibilityStyle = "bg-primary text-white border-primary";
  const inactiveVisibilityStyle = "bg-white text-slate-700 border-slate-300 hover:bg-slate-50";

  return (
    <div className="w-full max-w-4xl mx-auto text-center">
      {!reviewedResults && (
        <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Review Saved Session</h2>
            <p className="text-slate-600 mb-6">
            Load one or more exported <code className="bg-slate-200 text-slate-800 text-sm p-1 rounded font-mono">.json</code> files to review your study session.
            </p>
            
            <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange} 
                accept=".json,application/json"
                className="hidden"
                aria-hidden="true"
                multiple
            />

            <button 
                onClick={handleButtonClick}
                className="py-3 px-6 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-primary hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
            >
                Upload JSON File(s)
            </button>
        </div>
      )}

        {error && (
          <div className="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative text-left" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

      {reviewedResults && (
        <>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-slate-700 text-left">Reviewing {reviewedResults.length} item(s)</h2>
                <div className="flex items-center gap-4">
                     <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-600">Show:</span>
                        <button
                          onClick={() => setShowRomaji(prev => !prev)}
                          className={`${visibilityButtonStyle} ${showRomaji ? activeVisibilityStyle : inactiveVisibilityStyle}`}
                          aria-pressed={showRomaji}
                        >
                          Romaji
                        </button>
                        <button
                          onClick={() => setShowEnglish(prev => !prev)}
                          className={`${visibilityButtonStyle} ${showEnglish ? activeVisibilityStyle : inactiveVisibilityStyle}`}
                          aria-pressed={showEnglish}
                        >
                          English
                        </button>
                      </div>
                    <button
                        onClick={() => {
                            setReviewedResults(null);
                            setError(null);
                        }}
                        className="py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                    >
                        Load other files
                    </button>
                </div>
            </div>
            {reviewedResults.map((result, index) => (
                <ResultDisplay key={index} result={result} showRomaji={showRomaji} showEnglish={showEnglish} />
            ))}
        </>
      )}
    </div>
  );
};

export default ReviewPage;