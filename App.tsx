
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, Download, Eye, EyeOff, StopCircle, AlertCircle } from 'lucide-react';
import Header from './components/Header';
import InputForm from './components/InputForm';
import ResultDisplay from './components/ResultDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import ReviewPage from './components/ReviewPage';
import SettingsSidebar from './components/SettingsSidebar';

import { generateWithGemini } from './services/llm/gemini';
import { generateWithOllama } from './services/llm/ollama';

const themeColors: Record<string, { primary: string; secondary: string; light: string; background: string; darkBackground: string; darkLight: string }> = {
  sky: { primary: '#38bdf8', secondary: '#2c3e50', light: '#e0f2fe', background: '#f0fdf4', darkBackground: '#082f49', darkLight: '#0c4a6e' },
  emerald: { primary: '#34d399', secondary: '#064e3b', light: '#d1fae5', background: '#ecfdf5', darkBackground: '#064e3b', darkLight: '#065f46' },
  violet: { primary: '#a78bfa', secondary: '#4c1d95', light: '#ede9fe', background: '#f5f3ff', darkBackground: '#2e1065', darkLight: '#4c1d95' },
  rose: { primary: '#fb7185', secondary: '#881337', light: '#ffe4e6', background: '#fff1f2', darkBackground: '#4c0519', darkLight: '#881337' },
  amber: { primary: '#fbbf24', secondary: '#78350f', light: '#fef3c7', background: '#fffbeb', darkBackground: '#451a03', darkLight: '#78350f' },
  indigo: { primary: '#818cf8', secondary: '#312e81', light: '#e0e7ff', background: '#eef2ff', darkBackground: '#1e1b4b', darkLight: '#312e81' },
  midnight: { primary: '#8b5cf6', secondary: '#0f172a', light: '#ddd6fe', background: '#f8fafc', darkBackground: '#0f172a', darkLight: '#1e1b4b' },
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
    const isDark = settings.theme === 'dark';
    
    root.style.setProperty('--color-primary-hex', colors.primary);
    root.style.setProperty('--color-secondary-hex', colors.secondary);
    root.style.setProperty('--color-light-hex', isDark ? colors.darkLight : colors.light);
    root.style.setProperty('--color-background-hex', isDark ? colors.darkBackground : colors.background);
  }, [settings.colorTheme, settings.theme]);

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

  const visibilityButtonStyle = "py-2 px-4 rounded-xl border shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 flex items-center gap-2";
  const activeVisibilityStyle = "bg-primary text-white border-primary shadow-primary/20";
  const inactiveVisibilityStyle = "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700";

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-primary/30">
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} onOpenSettings={() => setIsSettingsOpen(true)} />
      <SettingsSidebar 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveSettings}
        currentSettings={settings}
      />
      <main className="flex-grow container mx-auto p-6 md:p-12 max-w-screen-2xl">
        <AnimatePresence mode="wait">
          {currentPage === 'generator' && (
            <motion.div
              key="generator"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="text-center mb-20">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                  className="inline-block mb-6 px-4 py-1.5 bg-primary/5 border border-primary/10 rounded-full"
                >
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">AI-Powered Language Learning</span>
                </motion.div>
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                  className="text-4xl md:text-6xl font-black text-slate-900 dark:!text-white mb-8 tracking-tighter leading-[1.1]"
                >
                  Master Japanese <br />
                  <span className="text-primary italic font-serif font-normal">Conversation</span>
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                  className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed"
                >
                  Generate contextual examples and practice your speaking skills with AI-powered scenarios tailored to your level.
                </motion.p>
              </div>

              <InputForm onGenerate={handleGenerate} isLoading={isLoading} llmConfig={settings} />

              {isLoading && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center mt-16 p-12 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200/60 dark:border-slate-800/60 shadow-2xl shadow-slate-200/50 dark:shadow-none max-w-3xl mx-auto relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-slate-100 dark:bg-slate-800">
                    <motion.div 
                      className="h-full bg-primary"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    />
                  </div>
                  <LoadingSpinner message={loadingMessage} />
                  <button
                      onClick={handleStop}
                      className="mt-10 py-3.5 px-10 bg-red-500 text-white font-bold rounded-2xl shadow-xl shadow-red-500/20 hover:bg-red-600 hover:shadow-red-500/40 focus:outline-none focus:ring-4 focus:ring-red-500/20 transition-all inline-flex items-center gap-3 active:scale-95"
                  >
                      <StopCircle className="w-5 h-5" />
                      Stop Generation
                  </button>
                </motion.div>
              )}
              
              {error && (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="mt-12 bg-red-50/50 border border-red-200 text-red-700 px-8 py-6 rounded-[2rem] relative max-w-3xl mx-auto dark:bg-red-900/10 dark:border-red-500/20 dark:text-red-400 flex items-start gap-4 shadow-sm" 
                  role="alert"
                >
                  <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <strong className="font-black text-xs uppercase tracking-[0.2em] block mb-2">System Error</strong>
                    <span className="block text-base font-medium opacity-90 whitespace-pre-wrap leading-relaxed">{error}</span>
                  </div>
                </motion.div>
              )}
              
              {results && results.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full mt-24 mb-12 flex flex-col sm:flex-row justify-between items-center gap-6"
                >
                    <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-2 rounded-[1.8rem] shadow-sm border border-slate-200/60 dark:border-slate-800/60">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 ml-4">View Options</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setShowRomaji(prev => !prev)}
                          className={`${visibilityButtonStyle} ${showRomaji ? activeVisibilityStyle : inactiveVisibilityStyle}`}
                          aria-pressed={showRomaji}
                        >
                          {showRomaji ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          Romaji
                        </button>
                        <button
                          onClick={() => setShowEnglish(prev => !prev)}
                          className={`${visibilityButtonStyle} ${showEnglish ? activeVisibilityStyle : inactiveVisibilityStyle}`}
                          aria-pressed={showEnglish}
                        >
                          {showEnglish ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          English
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={handleExportAll}
                      className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-3.5 px-8 rounded-2xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-all focus:outline-none focus:ring-4 focus:ring-slate-900/20 inline-flex items-center gap-3 shadow-2xl shadow-slate-900/10 active:scale-95"
                      aria-label="Export All Results to JSON"
                      title="Export All Results to JSON"
                    >
                      <Download className="h-5 w-5" />
                      <span className="font-bold tracking-tight">Export Session</span>
                    </button>
                </motion.div>
              )}
              
              <div className="space-y-12">
                <AnimatePresence mode="popLayout">
                  {results && results.length > 0 && results.map((result, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.95, y: 30 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 20 }}
                      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <ResultDisplay 
                        result={result} 
                        showRomaji={showRomaji} 
                        showEnglish={showEnglish} 
                        onDelete={handleDeleteResult}
                        index={index}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
          
          {currentPage === 'review' && (
            <motion.div
              key="review"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
            >
              <ReviewPage />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default App;
