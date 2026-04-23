
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Keyboard, FileText, Send, X, Upload, Sparkles, Target, Layers } from 'lucide-react';

const InputForm = ({ onGenerate, isLoading, llmConfig }) => {
  const [inputType, setInputType] = useState('manual');
  const [word, setWord] = useState('よろしくお願いします');
  const [scenario, setScenario] = useState('work conversations in a IT engineering company');
  const [cefrLevel, setCefrLevel] = useState('B1');
  const [fileWords, setFileWords] = useState([]);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef(null);

  const cefrLevels = [
    { value: 'A1', label: 'A1 - Beginner' },
    { value: 'A2', label: 'A2 - Elementary' },
    { value: 'B1', label: 'B1 - Intermediate' },
    { value: 'B2', label: 'B2 - Upper Intermediate' },
    { value: 'C1', label: 'C1 - Advanced' },
    { value: 'C2', label: 'C2 - Mastery' },
  ];

  const parseWords = (text) => {
    if (!text) return [];
    return text
      .split(/[\n,]+/) // Split by one or more newlines or commas
      .map(w => w.trim())
      .filter(Boolean); // Remove any empty strings
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const wordsToGenerate = inputType === 'manual' ? parseWords(word) : fileWords;
    if (wordsToGenerate.length > 0 && scenario.trim() && !isLoading) {
      onGenerate(wordsToGenerate, scenario, cefrLevel);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      const words = parseWords(text as string);
      setFileWords(words);
    };
    reader.readAsText(file);
  };

  const clearFile = () => {
    setFileWords([]);
    setFileName('');
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  }

  const isSubmitDisabled = 
    isLoading ||
    (inputType === 'file' && fileWords.length === 0) ||
    (inputType === 'manual' && !word.trim()) ||
    (llmConfig.service === 'ollama' && !llmConfig.ollamaModel);


  const tabStyle = "relative px-8 py-4 text-sm font-bold transition-all duration-300 flex items-center gap-2.5 z-10";
  const activeTabStyle = "text-primary";
  const inactiveTabStyle = "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300";

  return (
    <div className="bg-white dark:bg-slate-900 p-2 rounded-[3rem] shadow-2xl shadow-slate-200/50 dark:shadow-none w-full max-w-4xl mx-auto border border-slate-200/60 dark:border-slate-800/60">
        <div className="flex p-2 bg-slate-50/50 dark:bg-slate-950/50 rounded-[2.2rem] relative overflow-hidden">
            <button 
              onClick={() => setInputType('manual')} 
              className={`${tabStyle} ${inputType === 'manual' ? activeTabStyle : inactiveTabStyle}`}
            >
              <Keyboard className="w-4 h-4" />
              Manual Entry
            </button>
            <button 
              onClick={() => setInputType('file')} 
              className={`${tabStyle} ${inputType === 'file' ? activeTabStyle : inactiveTabStyle}`}
            >
              <FileText className="w-4 h-4" />
              File Upload
            </button>
            
            <motion.div 
              className="absolute top-2 bottom-2 bg-white dark:bg-slate-800 rounded-[1.8rem] shadow-sm border border-slate-200/50 dark:border-slate-700/50 z-0"
              initial={false}
              animate={{ 
                left: inputType === 'manual' ? '8px' : '174px',
                width: inputType === 'manual' ? '166px' : '158px'
              }}
              transition={{ type: "spring", bounce: 0.15, duration: 0.6 }}
            />
        </div>
        
      <form onSubmit={handleSubmit} className="p-8 sm:p-12 space-y-12">
        <AnimatePresence mode="wait">
          {inputType === 'manual' ? (
             <motion.div
                key="manual"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
             >
                <div className="flex items-center gap-2 mb-2 ml-1">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <label htmlFor="word" className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                      Japanese Expressions
                  </label>
                </div>
                <textarea
                    id="word"
                    rows={4}
                    value={word}
                    onChange={(e) => setWord(e.target.value)}
                    placeholder="Enter words separated by commas or new lines..."
                    className="w-full px-8 py-6 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-[2rem] shadow-inner focus:ring-4 focus:ring-primary/5 focus:border-primary/50 outline-none font-jp text-2xl text-slate-900 dark:text-white dark:placeholder-slate-700 transition-all resize-none leading-relaxed"
                    required
                />
            </motion.div>
          ) : (
            <motion.div
                key="file"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
            >
                <div className="flex items-center gap-2 mb-2 ml-1">
                  <FileText className="w-4 h-4 text-primary" />
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                      Word List File (.txt)
                  </label>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".txt,text/plain" className="hidden"/>
                
                {!fileName ? (
                  <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()} 
                    className="w-full h-48 flex flex-col items-center justify-center gap-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] text-slate-400 dark:text-slate-600 hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-all group"
                  >
                      <div className="w-16 h-16 rounded-3xl bg-slate-50 dark:bg-slate-950 flex items-center justify-center group-hover:bg-primary/10 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm">
                        <Upload className="w-8 h-8" />
                      </div>
                      <div className="text-center">
                        <span className="block font-bold text-slate-600 dark:text-slate-300 text-lg">Drop your word list here</span>
                        <span className="text-sm opacity-60">TXT files with words separated by lines or commas</span>
                      </div>
                  </button>
                ) : (
                  <div className="p-6 bg-primary/5 border border-primary/20 rounded-[2rem] flex items-center justify-between">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-sm">
                        <FileText className="w-7 h-7" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white text-lg truncate max-w-[250px]">{fileName}</p>
                        <p className="text-xs text-primary font-black uppercase tracking-widest">{fileWords.length} words detected</p>
                      </div>
                    </div>
                    <button type="button" onClick={clearFile} className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-7">
            <div className="flex items-center gap-2 mb-3 ml-1">
              <Target className="w-4 h-4 text-primary" />
              <label htmlFor="scenario" className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                Scenario Context
              </label>
            </div>
            <input
              type="text"
              id="scenario"
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              placeholder="e.g., Leaving the office for the day"
              className="w-full px-8 py-5 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-[1.8rem] shadow-inner focus:ring-4 focus:ring-primary/5 focus:border-primary/50 outline-none text-lg text-slate-900 dark:text-white dark:placeholder-slate-700 transition-all font-medium"
              required
            />
          </div>
          <div className="md:col-span-5">
            <div className="flex items-center gap-2 mb-3 ml-1">
              <Layers className="w-4 h-4 text-primary" />
              <label htmlFor="cefr" className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                Proficiency Level
              </label>
            </div>
            <div className="relative">
              <select
                id="cefr"
                value={cefrLevel}
                onChange={(e) => setCefrLevel(e.target.value)}
                className="w-full px-8 py-5 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-[1.8rem] shadow-inner focus:ring-4 focus:ring-primary/5 focus:border-primary/50 outline-none text-lg text-slate-900 dark:text-white appearance-none transition-all cursor-pointer font-bold"
              >
                {cefrLevels.map(lvl => (
                  <option key={lvl.value} value={lvl.value}>{lvl.label}</option>
                ))}
              </select>
              <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>
        </div>
        
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitDisabled}
            className="w-full flex items-center justify-center gap-4 py-6 px-8 border border-transparent rounded-[2rem] shadow-2xl shadow-primary/30 text-2xl font-black text-white bg-primary hover:bg-primary/90 hover:shadow-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/20 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 disabled:shadow-none disabled:cursor-not-allowed transition-all active:scale-[0.97] group"
          >
            {isLoading ? (
              <>
                <div className="w-7 h-7 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                <span className="tracking-tight">Generating Insights...</span>
              </>
            ) : (
              <>
                <Send className="w-7 h-7 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                <span className="tracking-tight">Generate Examples</span>
              </>
            )}
          </button>
          {!isLoading && (llmConfig.service === 'ollama' && !llmConfig.ollamaModel) && (
            <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 rounded-2xl flex items-center justify-center gap-3">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <p className="text-xs text-amber-700 dark:text-amber-400 font-bold uppercase tracking-widest">Please select an Ollama model in Settings</p>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default InputForm;
