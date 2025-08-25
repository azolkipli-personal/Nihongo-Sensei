import React, { useState, useRef, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import InputForm from './components/InputForm';
import ResultDisplay from './components/ResultDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import ReviewPage from './components/ReviewPage';
import SettingsSidebar from './components/SettingsSidebar';

import { generateWithGemini } from './services/llm/gemini';
import { generateWithOllama } from './services/llm/ollama';

const App = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(null);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [currentPage, setCurrentPage] = useState('generator');
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState({
    service: 'gemini',
    geminiApiKey: '',
    geminiModel: 'gemini-2.5-flash',
    ollamaModel: '',
    ollamaUrl: 'http://localhost:11434',
  });

  const [showRomaji, setShowRomaji] = useState(true);
  const [showEnglish, setShowEnglish] = useState(true);
  const isCancelledRef = useRef(false);
  
  useEffect(() => {
    try {
        const savedSettings = localStorage.getItem('kaiwa-renshuu-settings');
        if (savedSettings) {
            const parsedSettings = JSON.parse(savedSettings);
            // Ensure new settings have defaults if not in storage
            setSettings(prev => ({...prev, ...parsedSettings}));
        }
    } catch (e) {
        console.error("Failed to parse settings from localStorage", e);
    }
  }, []);

  const handleSaveSettings = (newSettings) => {
    setSettings(newSettings);
    try {
        localStorage.setItem('kaiwa-renshuu-settings', JSON.stringify(newSettings));
    } catch (e) {
        console.error("Failed to save settings to localStorage", e);
    }
    setIsSettingsOpen(false);
  };

  const handleStop = () => {
    isCancelledRef.current = true;
    setLoadingMessage("Stopping generation...");
  };

  const handleExportAll = () => {
    if (!results || results.length === 0) return;

    const slugify = (text) => {
      return text
        .toLowerCase()
        .trim()
        .replace(/[^ \p{L}\p{N}]+/gu, '')
        .replace(/\s+/g, '-')
        .slice(0, 50);
    };
    
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(now.getDate()).padStart(2, '0');
    const datePrefix = `${year}${month}${day}`;

    const firstWordSlug = slugify(results[0].wordDetails.romaji || 'session');
    const fileName = `${datePrefix}-kaiwa-renshuu-session-${firstWordSlug}.json`;

    const jsonString = JSON.stringify(results, null, 2);
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

  const handleGenerate = async (words, scenario) => {
    if (settings.service === 'gemini' && !settings.geminiApiKey) {
        setError("Gemini is selected, but the API Key is missing. Please add it in the Settings sidebar.");
        return;
    }
    if (settings.service === 'ollama' && (!settings.ollamaUrl || !settings.ollamaModel)) {
      setError("Ollama is selected, but the server URL is missing or no model is selected. Please configure it in Settings.");
      return;
    }
    
    isCancelledRef.current = false;
    setIsLoading(true);
    setError(null);
    setResults([]);

    for (let i = 0; i < words.length; i++) {
      if (isCancelledRef.current) {
        setError(prevError => (prevError ? `${prevError}\n` : '') + 'Generation stopped by user.');
        break;
      }

      const word = words[i];
      try {
        setLoadingMessage(words.length > 1 ? `Generating ${i + 1} of ${words.length}: "${word}"` : `Generating content for "${word}"...`);

        let generatedResult;
        if (settings.service === 'gemini') {
            generatedResult = await generateWithGemini(settings.geminiModel, word, scenario, settings.geminiApiKey);
        } else {
            generatedResult = await generateWithOllama(settings.ollamaModel, word, scenario, settings.ollamaUrl);
        }
        
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

  const visibilityButtonStyle = "py-2 px-4 rounded-md border shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors";
  const activeVisibilityStyle = "bg-primary text-white border-primary";
  const inactiveVisibilityStyle = "bg-white text-slate-700 border-slate-300 hover:bg-slate-50";

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} onOpenSettings={() => setIsSettingsOpen(true)} />
      <SettingsSidebar 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveSettings}
        currentSettings={settings}
      />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        {currentPage === 'generator' && (
          <>
            <InputForm onGenerate={handleGenerate} isLoading={isLoading} llmConfig={settings} />

            {isLoading && (
              <div className="text-center mt-8">
                <LoadingSpinner message={loadingMessage} />
                <button
                    onClick={handleStop}
                    className="mt-4 py-2 px-6 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75 transition-colors"
                >
                    Stop Generation
                </button>
              </div>
            )}
            
            {error && (
              <div className="mt-8 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative max-w-2xl mx-auto" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline whitespace-pre-wrap">{error}</span>
              </div>
            )}
            
            {results && results.length > 0 && (
              <div className="max-w-4xl mx-auto mt-8 flex justify-between items-center">
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
                    onClick={handleExportAll}
                    className="bg-secondary text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary inline-flex items-center gap-2 shadow-md"
                    aria-label="Export All Results to JSON"
                    title="Export All Results to JSON"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export All Results
                  </button>
              </div>
            )}
            {results && results.length > 0 && results.map((result, index) => (
              <ResultDisplay key={index} result={result} showRomaji={showRomaji} showEnglish={showEnglish} />
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