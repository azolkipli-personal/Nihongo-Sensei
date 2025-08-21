import React, { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import InputForm from './components/InputForm';
import ResultDisplay from './components/ResultDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import ReviewPage from './components/ReviewPage';
import { generateLearningContent } from './services/geminiService';
import type { LearningResult } from './types';

type Page = 'generator' | 'review';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<LearningResult[] | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>('generator');

  const handleGenerate = async (words: string[], scenario: string) => {
    setIsLoading(true);
    setError(null);
    setResults([]); // Clear previous results

    for (let i = 0; i < words.length; i++) {
        const word = words[i];
        try {
            if (words.length > 1) {
                setLoadingMessage(`Generating ${i + 1} of ${words.length}: "${word}"`);
            }
            const generatedResult = await generateLearningContent(word, scenario);
            setResults(prevResults => [...(prevResults || []), generatedResult]);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
            setError(prevError => 
                (prevError ? `${prevError}\n` : '') + `Failed on "${word}": ${errorMessage}`
            );
        }
    }
    
    setIsLoading(false);
    setLoadingMessage(null);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        {currentPage === 'generator' && (
          <>
            <InputForm onGenerate={handleGenerate} isLoading={isLoading} />

            {isLoading && <LoadingSpinner message={loadingMessage} />}
            
            {error && (
              <div className="mt-8 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative max-w-2xl mx-auto" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline whitespace-pre-wrap">{error}</span>
              </div>
            )}
            
            {results && results.map((result, index) => (
              <ResultDisplay key={index} result={result} />
            ))}
          </>
        )}
        {currentPage === 'review' && <ReviewPage />}
      </main>
      <Footer />
    </div>
  );
};

export default App;