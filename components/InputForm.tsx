
import React, { useState, useRef } from 'react';

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


  const tabStyle = "px-4 py-2 text-sm font-medium rounded-t-lg transition-colors focus:outline-none";
  const activeTabStyle = "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 border-l border-t border-r -mb-px text-primary";
  const inactiveTabStyle = "bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700";

  return (
    <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg w-full max-w-2xl mx-auto">
        <div className="flex border-b border-slate-200 dark:border-slate-700">
            <button onClick={() => setInputType('manual')} className={`${tabStyle} ${inputType === 'manual' ? activeTabStyle : inactiveTabStyle}`}>Manual Entry</button>
            <button onClick={() => setInputType('file')} className={`${tabStyle} ${inputType === 'file' ? activeTabStyle : inactiveTabStyle}`}>File Upload</button>
        </div>
      <form onSubmit={handleSubmit} className="space-y-6 pt-6">
        {inputType === 'manual' && (
             <div>
                <label htmlFor="word" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Japanese Words or Phrases
                </label>
                <textarea
                    id="word"
                    rows={5}
                    value={word}
                    onChange={(e) => setWord(e.target.value)}
                    placeholder="Enter words separated by commas or new lines, e.g.,&#10;お疲れ様です,&#10;すみません"
                    className="w-full px-4 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-primary focus:border-primary font-jp text-lg bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
                    required
                />
            </div>
        )}

        {inputType === 'file' && (
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Word List File (.txt)
                </label>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".txt,text/plain" className="hidden"/>
                <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full text-left px-4 py-2 border border-dashed border-slate-300 dark:border-slate-600 rounded-md text-slate-500 dark:text-slate-400 hover:border-primary hover:text-primary">
                    {fileName || "Choose a .txt file with words separated by lines or commas..."}
                </button>
                {fileWords.length > 0 && (
                    <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-md max-h-32 overflow-y-auto">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold text-slate-700 dark:text-slate-300 text-sm">Loaded Words ({fileWords.length})</h4>
                            <button type="button" onClick={clearFile} className="text-xs text-red-500 hover:underline">Clear</button>
                        </div>
                        <ul className="text-sm text-slate-600 dark:text-slate-400 list-disc list-inside">
                            {fileWords.map((fw, i) => <li key={i}>{fw}</li>)}
                        </ul>
                    </div>
                )}
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-3">
            <label htmlFor="scenario" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Scenario / Context
            </label>
            <input
              type="text"
              id="scenario"
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              placeholder="e.g., Leaving the office for the day"
              className="w-full px-4 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-primary focus:border-primary text-lg bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
              required
            />
          </div>
          <div className="md:col-span-1">
            <label htmlFor="cefr" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              CEFR Level
            </label>
            <select
              id="cefr"
              value={cefrLevel}
              onChange={(e) => setCefrLevel(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-primary focus:border-primary text-lg bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            >
              {cefrLevels.map(lvl => (
                <option key={lvl.value} value={lvl.value}>{lvl.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <button
            type="submit"
            disabled={isSubmitDisabled}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-primary hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Generating...' : 'Generate Examples'}
          </button>
          {!isLoading && (llmConfig.service === 'ollama' && !llmConfig.ollamaModel) && (
            <p className="text-xs text-center text-amber-700 dark:text-amber-500 mt-2">Please select an Ollama model in Settings before generating.</p>
          )}
        </div>
      </form>
    </div>
  );
};

export default InputForm;
