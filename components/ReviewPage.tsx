
import React, { useState, useRef } from 'react';
import ResultDisplay from './ResultDisplay';

const ReviewPage = () => {
  const [reviewedResults, setReviewedResults] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showRomaji, setShowRomaji] = useState(true);
  const [showEnglish, setShowEnglish] = useState(true);
  const [dragEnabledIndex, setDragEnabledIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Refs to store indices during drag operation
  const dragItemIndex = useRef<number | null>(null);
  const dragOverIndex = useRef<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

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
        const filesArray = Array.from(files) as File[];
        for (const file of filesArray) {
            const text = await readFile(file);
            const parsed = JSON.parse(text);

            if (Array.isArray(parsed)) {
                const validItems = parsed.filter(isValidLearningResult);
                if (validItems.length !== parsed.length) {
                    console.warn(`File ${file.name} contains some invalid items.`);
                }
                loadedResults.push(...validItems);
            } else if (isValidLearningResult(parsed)) {
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
      if (event.target) {
          event.target.value = '';
      }
    }
  };

  const handleButtonClick = () => {
      fileInputRef.current?.click();
  }
  
  const handleDeleteResult = (indexToDelete: number) => {
    setReviewedResults(prevResults => prevResults ? prevResults.filter((_, index) => index !== indexToDelete) : null);
  };
  
  const handleExportChanges = () => {
    if (!reviewedResults || reviewedResults.length === 0) return;

    const slugify = (text: string) => {
      return text
        .toLowerCase()
        .trim()
        .replace(/[^ \p{L}\p{N}]+/gu, '')
        .replace(/\s+/g, '-')
        .slice(0, 50);
    };
    
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const datePrefix = `${year}${month}${day}`;

    const firstWordSlug = slugify(reviewedResults[0].wordDetails.romaji || 'session');
    const fileName = `${datePrefix}-kaiwa-renshuu-reordered-${firstWordSlug}.json`;

    const jsonString = JSON.stringify(reviewedResults, null, 2);
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

  // --- Drag and Drop Handlers ---
  const onDragStart = (e: React.DragEvent, index: number) => {
      dragItemIndex.current = index;
      setIsDragging(true);
      e.dataTransfer.effectAllowed = 'move';
  };

  const onDragEnter = (e: React.DragEvent, index: number) => {
      e.preventDefault();
      dragOverIndex.current = index;
  };

  const onDragOver = (e: React.DragEvent) => {
      e.preventDefault(); 
  };

  const onDrop = () => {
      if (reviewedResults && dragItemIndex.current !== null && dragOverIndex.current !== null && dragItemIndex.current !== dragOverIndex.current) {
          const items = [...reviewedResults];
          const draggedItem = items.splice(dragItemIndex.current, 1)[0];
          items.splice(dragOverIndex.current, 0, draggedItem);
          setReviewedResults(items);
      }
      onDragEnd();
  };

  const onDragEnd = () => {
      dragItemIndex.current = null;
      dragOverIndex.current = null;
      setIsDragging(false);
      setDragEnabledIndex(null); // Reset draggable state
  };

  const visibilityButtonStyle = "py-2 px-4 rounded-md border shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors";
  const activeVisibilityStyle = "bg-primary text-white border-primary";
  const inactiveVisibilityStyle = "bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600";

  return (
    <div className="w-full max-w-4xl mx-auto text-center">
      {!reviewedResults && (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">Review Saved Session</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
            Load one or more exported <code className="bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-300 text-sm p-1 rounded font-mono">.json</code> files to review your study session.
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
          <div className="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative text-left dark:bg-red-900/50 dark:border-red-500/80 dark:text-red-400" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

      {reviewedResults && (
        <>
            <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200 text-left">Reviewing {reviewedResults.length} item(s)</h2>
                <div className="flex items-center gap-4 flex-wrap">
                     <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Show:</span>
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
                        onClick={handleExportChanges}
                        className="py-2 px-4 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors inline-flex items-center gap-2"
                        title="Save the current order to a new JSON file"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Export Changes
                    </button>
                    <button
                        onClick={() => {
                            setReviewedResults(null);
                            setError(null);
                        }}
                        className="py-2 px-4 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                    >
                        Load other files
                    </button>
                </div>
            </div>
            {reviewedResults.map((result, index) => (
                 <div
                    key={`${result.wordDetails.romaji}-${index}`}
                    draggable={dragEnabledIndex === index}
                    onDragStart={(e) => onDragStart(e, index)}
                    onDragEnter={(e) => onDragEnter(e, index)}
                    onDragOver={onDragOver}
                    onDrop={onDrop}
                    onDragEnd={onDragEnd}
                    className={`relative group transition-opacity ${dragItemIndex.current === index && isDragging ? 'opacity-40' : 'opacity-100'}`}
                  >
                    <div 
                        onMouseEnter={() => setDragEnabledIndex(index)}
                        onMouseLeave={() => !isDragging && setDragEnabledIndex(null)}
                        className="absolute top-4 left-[-2rem] p-2 rounded-full text-slate-400 cursor-move opacity-0 group-hover:opacity-100 transition-opacity z-10" 
                        title="Drag to reorder"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                            <circle cx="9" cy="6" r="1.5"></circle><circle cx="15" cy="6" r="1.5"></circle>
                            <circle cx="9" cy="12" r="1.5"></circle><circle cx="15" cy="12" r="1.5"></circle>
                            <circle cx="9" cy="18" r="1.5"></circle><circle cx="15" cy="18" r="1.5"></circle>
                        </svg>
                    </div>
                    <ResultDisplay 
                        result={result} 
                        showRomaji={showRomaji} 
                        showEnglish={showEnglish} 
                        onDelete={handleDeleteResult}
                        index={index}
                    />
                 </div>
            ))}
        </>
      )}
    </div>
  );
};

export default ReviewPage;
