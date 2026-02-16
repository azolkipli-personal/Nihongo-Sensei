
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

const themeColors: Record<string, { primary: string; secondary: string; light: string; background: string }> = {
  sky: { primary: '#38bdf8', secondary: '#2c3e50', light: '#e0f2fe', background: '#f0fdf4' }, // Sky 400
  emerald: { primary: '#34d399', secondary: '#064e3b', light: '#d1fae5', background: '#ecfdf5' }, // Emerald 400
  violet: { primary: '#a78bfa', secondary: '#4c1d95', light: '#ede9fe', background: '#f5f3ff' }, // Violet 400
  rose: { primary: '#fb7185', secondary: '#881337', light: '#ffe4e6', background: '#fff1f2' }, // Rose 400
  amber: { primary: '#fbbf24', secondary: '#78350f', light: '#fef3c7', background: '#fffbeb' }, // Amber 400
  indigo: { primary: '#818cf8', secondary: '#312e81', light: '#e0e7ff', background: '#eef2ff' }, // Indigo 400
  midnight: { primary: '#8b5cf6', secondary: '#0f172a', light: '#ddd6fe', background: '#f8fafc' }, // Violet 500, Slate 900
};

const App = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any[] | null>(null);
  const [currentPage, setCurrentPage] = useState('generator');
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState({
    service: 'gemini',
    geminiModel: 'gemini-3-flash-preview',
    ollamaModel: '',
    ollamaUrl: 'http://localhost:11434',
    theme: 'light',
    colorTheme: 'sky',
  });

  const [showRomaji, setShowRomaji] = useState(true);
  const [showEnglish, setShowEnglish] = useState(true);
  const isCancelledRef = useRef(false);
  
  useEffect(() => {
    try {
        const savedSettings = localStorage.getItem('kaiwa-renshuu-settings');
        if (savedSettings) {
            const parsedSettings = JSON.parse(savedSettings);
            const { geminiApiKey, ...rest } = parsedSettings;
            setSettings(prev => ({...prev, ...rest}));
        }
    } catch (e) {
        console.error("Failed to parse settings from localStorage", e);
    }
  }, []);

  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  // Apply color theme
  useEffect(() => {
    const colors = themeColors[settings.colorTheme] || themeColors.sky;
    const root = document.documentElement;
    root.style.setProperty('--color-primary', colors.primary);
    root.style.setProperty('--color-secondary', colors.secondary);
    root.style.setProperty('--color-light', colors.light);
    root.style.setProperty('--color-background', colors.background);
  }, [settings.colorTheme]);

  const handleSaveSettings = (newSettings: any) => {
    const { geminiApiKey, ...safeSettings } = newSettings;
    setSettings(safeSettings);
    try {
        localStorage.setItem('kaiwa-renshuu-settings', JSON.stringify(safeSettings));
    } catch (e) {
        console.error("Failed to save settings to localStorage", e);
    }
    setIsSettingsOpen(false);
  };

  const handleStop = () => {
    isCancelledRef.current = true;
    setLoadingMessage("Stopping generation...");
  };

  const handleDeleteResult = (indexToDelete: number) => {
    setResults(prevResults => (prevResults || []).filter((_, index) => index !== indexToDelete));
  };

  const handleExportAll = () => {
    if (!results || results.length === 0) return;

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

  const handleGenerate = async (words: string[], scenario: string, cefrLevel: string) => {
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
            generatedResult = await generateWithGemini(settings.geminiModel, word, scenario, cefrLevel);
        } else {
            generatedResult = await generateWithOllama(settings.ollamaModel, word, scenario, settings.ollamaUrl, cefrLevel);
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
  const inactiveVisibilityStyle = "bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600";

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
              <div className="mt-8 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative max-w-2xl mx-auto dark:bg-red-900/50 dark:border-red-500/80 dark:text-red-400" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline whitespace-pre-wrap">{error}</span>
              </div>
            )}
            
            {results && results.length > 0 && (
              <div className="max-w-4xl mx-auto mt-8 flex justify-between items-center">
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
                    onClick={handleExportAll}
                    className="bg-secondary dark:bg-primary text-white py-2 px-4 rounded-md hover:bg-slate-700 dark:hover:bg-sky-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary dark:focus:ring-primary inline-flex items-center gap-2 shadow-md"
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
              <ResultDisplay 
                key={index} 
                result={result} 
                showRomaji={showRomaji} 
                showEnglish={showEnglish} 
                onDelete={handleDeleteResult}
                index={index}
              />
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
