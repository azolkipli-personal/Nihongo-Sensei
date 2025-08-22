import React, { useState, useRef } from 'react';

const InputForm = ({ onGenerate, isLoading, llmConfig }) => {
  const [inputType, setInputType] = useState('manual');
  const [word, setWord] = useState('よろしくお願いします');
  const [scenario, setScenario] = useState('work conversations in a IT engineering company');
  const [fileWords, setFileWords] = useState([]);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef(null);

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
      onGenerate(wordsToGenerate, scenario);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      const words = parseWords(text);
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
    (llmConfig.service === 'ollama' && !llmConfig.ollamaModel) ||
    (llmConfig.service === 'gemini' && !llmConfig.geminiApiKey);


  const tabStyle = "px-4 py-2 text-sm font-medium rounded-t-lg transition-colors focus:outline-none";
  const activeTabStyle = "bg-white border-slate-200 border-l border-t border-r -mb-px text-primary";
  const inactiveTabStyle = "bg-slate-50 text-slate-500 hover:bg-slate-100";

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl mx-auto">
        <div className="flex border-b border-slate-200">
            <button onClick={() => setInputType('manual')} className={`${tabStyle} ${inputType === 'manual' ? activeTabStyle : inactiveTabStyle}`}>Manual Entry</button>
            <button onClick={() => setInputType('file')} className={`${tabStyle} ${inputType === 'file' ? activeTabStyle : inactiveTabStyle}`}>File Upload</button>
        </div>
      <form onSubmit={handleSubmit} className="space-y-6 pt-6">
        {inputType === 'manual' && (
             <div>
                <label htmlFor="word" className="block text-sm font-medium text-slate-700 mb-2">
                    Japanese Words or Phrases
                </label>
                <textarea
                    id="word"
                    rows={5}
                    value={word}
                    onChange={(e) => setWord(e.target.value)}
                    placeholder="Enter words separated by commas or new lines, e.g.,&#10;お疲れ様です,&#10;すみません"
                    className="w-full px-4 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-primary focus:border-primary font-jp text-lg"
                    required
                />
            </div>
        )}

        {inputType === 'file' && (
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                    Word List File (.txt)
                </label>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".txt,text/plain" className="hidden"/>
                <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full text-left px-4 py-2 border border-dashed border-slate-300 rounded-md text-slate-500 hover:border-primary hover:text-primary">
                    {fileName || "Choose a .txt file with words separated by lines or commas..."}
                </button>
                {fileWords.length > 0 && (
                    <div className="mt-4 p-3 bg-slate-50 rounded-md max-h-32 overflow-y-auto">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold text-slate-700 text-sm">Loaded Words ({fileWords.length})</h4>
                            <button type="button" onClick={clearFile} className="text-xs text-red-500 hover:underline">Clear</button>
                        </div>
                        <ul className="text-sm text-slate-600 list-disc list-inside">
                            {fileWords.map((fw, i) => <li key={i}>{fw}</li>)}
                        </ul>
                    </div>
                )}
            </div>
        )}

        <div>
          <label htmlFor="scenario" className="block text-sm font-medium text-slate-700 mb-2">
            Scenario / Context (for all words)
          </label>
          <input
            type="text"
            id="scenario"
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
            placeholder="e.g., Leaving the office for the day"
            className="w-full px-4 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-primary focus:border-primary text-lg"
            required
          />
        </div>
        <div>
          <button
            type="submit"
            disabled={isSubmitDisabled}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-primary hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Generating...' : 'Generate Examples'}
          </button>
          {!isLoading && (llmConfig.service === 'ollama' && !llmConfig.ollamaModel) && (
            <p className="text-xs text-center text-amber-700 mt-2">Please select an Ollama model in Settings before generating.</p>
          )}
           {!isLoading && (llmConfig.service === 'gemini' && !llmConfig.geminiApiKey) && (
            <p className="text-xs text-center text-amber-700 mt-2">Please enter your Google Gemini API key in Settings before generating.</p>
          )}
        </div>
      </form>
    </div>
  );
};

export default InputForm;
