import React, { useState, useEffect } from 'react';
import { fetchOllamaModels } from '../services/llm/ollama';

// Define types for component props
export type LLMService = 'gemini' | 'ollama';
export interface LLMConfig {
  service: LLMService;
  ollamaModel?: string;
  ollamaUrl?: string;
}

interface LLMSelectorProps {
  onConfigChange: (config: LLMConfig) => void;
  isLoading: boolean;
}

const LLMSelector: React.FC<LLMSelectorProps> = ({ onConfigChange, isLoading }) => {
  const [service, setService] = useState<LLMService>('gemini');
  const [ollamaUrl, setOllamaUrl] = useState<string>('http://localhost:11434');
  const [ollamaModels, setOllamaModels] = useState<string[]>([]);
  const [selectedOllamaModel, setSelectedOllamaModel] = useState<string>('');
  const [isFetchingModels, setIsFetchingModels] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Effect to update the parent component's config state
  useEffect(() => {
    onConfigChange({
      service,
      ollamaModel: selectedOllamaModel,
      ollamaUrl,
    });
  }, [service, selectedOllamaModel, ollamaUrl, onConfigChange]);

  const handleFetchModels = async () => {
    setIsFetchingModels(true);
    setFetchError(null);
    setOllamaModels([]);
    setSelectedOllamaModel('');
    try {
      const models = await fetchOllamaModels(ollamaUrl);
      if (models.length > 0) {
        setOllamaModels(models);
        setSelectedOllamaModel(models[0]);
      } else {
        setFetchError("No models found at this URL. Make sure Ollama is running and has models installed (e.g., 'ollama pull llama3').");
      }
    } catch (error) {
      console.error("Failed to fetch Ollama models:", error);
      setFetchError("Could not connect to Ollama server at the specified URL. Please ensure it is running and accessible.");
    } finally {
      setIsFetchingModels(false);
    }
  };

  const baseRadioStyle = "flex items-center justify-center w-full px-4 py-3 text-sm font-medium border rounded-lg cursor-pointer transition-all";
  const activeRadioStyle = "bg-primary text-white border-primary shadow-md";
  const inactiveRadioStyle = "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300";

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl mx-auto mb-8">
      <h2 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">Language Model Configuration</h2>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <label className={`${baseRadioStyle} ${service === 'gemini' ? activeRadioStyle : inactiveRadioStyle}`}>
          <input type="radio" name="llm-service" value="gemini" checked={service === 'gemini'} onChange={() => setService('gemini')} className="sr-only" disabled={isLoading} />
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M10 3.5a1.5 1.5 0 011.5 1.5v1.5a1.5 1.5 0 01-3 0V5A1.5 1.5 0 0110 3.5zM5.5 10a1.5 1.5 0 011.5-1.5h1.5a1.5 1.5 0 010 3H7a1.5 1.5 0 01-1.5-1.5zM10 16.5a1.5 1.5 0 01-1.5-1.5v-1.5a1.5 1.5 0 013 0V15a1.5 1.5 0 01-1.5 1.5zM14.5 10a1.5 1.5 0 01-1.5 1.5h-1.5a1.5 1.5 0 010-3H13a1.5 1.5 0 011.5 1.5z" /></svg>
          Google Gemini
        </label>
        <label className={`${baseRadioStyle} ${service === 'ollama' ? activeRadioStyle : inactiveRadioStyle}`}>
          <input type="radio" name="llm-service" value="ollama" checked={service === 'ollama'} onChange={() => setService('ollama')} className="sr-only" disabled={isLoading} />
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm2 0h10v6H5V5zm0 8a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
          Ollama (Local)
        </label>
      </div>

      {service === 'ollama' && (
        <div className="space-y-4 p-4 border border-slate-200 rounded-lg bg-slate-50">
          <div>
            <label htmlFor="ollamaUrl" className="block text-sm font-medium text-slate-700 mb-1">Ollama Server URL</label>
            <input
              type="text"
              id="ollamaUrl"
              value={ollamaUrl}
              onChange={(e) => setOllamaUrl(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-primary focus:border-primary text-sm"
              placeholder="http://localhost:11434"
              disabled={isLoading}
            />
          </div>
          <div className="flex items-end gap-4">
            <div className="flex-grow">
              <label htmlFor="ollamaModel" className="block text-sm font-medium text-slate-700 mb-1">Select a Model</label>
              <select
                id="ollamaModel"
                value={selectedOllamaModel}
                onChange={(e) => setSelectedOllamaModel(e.target.value)}
                disabled={isLoading || ollamaModels.length === 0 || isFetchingModels}
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-primary focus:border-primary text-sm disabled:bg-slate-200 disabled:cursor-not-allowed"
              >
                {ollamaModels.length === 0 && <option>Click 'Fetch Models' first</option>}
                {ollamaModels.map(model => <option key={model} value={model}>{model}</option>)}
              </select>
            </div>
            <button
              type="button"
              onClick={handleFetchModels}
              disabled={isLoading || isFetchingModels}
              className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-secondary hover:bg-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-slate-400"
            >
              {isFetchingModels ? 'Fetching...' : 'Fetch Models'}
            </button>
          </div>
          {fetchError && <p className="text-sm text-red-600 mt-2">{fetchError}</p>}
        </div>
      )}
    </div>
  );
};

export default LLMSelector;
