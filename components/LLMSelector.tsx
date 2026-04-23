import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Cpu, Globe, RefreshCw, AlertCircle, Check } from 'lucide-react';
import { fetchOllamaModels } from '../services/llm/ollama';

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
    try {
      const models = await fetchOllamaModels(ollamaUrl);
      if (models.length > 0) {
        setOllamaModels(models);
        setSelectedOllamaModel(models[0]);
      } else {
        setFetchError("No models found. Make sure Ollama is running and has models installed.");
      }
    } catch (error) {
      setFetchError("Could not connect to Ollama server. Check the URL and ensure it's running.");
    } finally {
      setIsFetchingModels(false);
    }
  };

  return (
    <div className="card-modern p-6 sm:p-8 max-w-2xl mx-auto mb-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <Cpu className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">AI Engine</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Choose your preferred language model</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <button
          onClick={() => setService('gemini')}
          disabled={isLoading}
          className={`relative flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
            service === 'gemini'
              ? 'border-primary bg-primary/5 text-primary shadow-sm'
              : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-200 dark:hover:border-slate-700'
          }`}
        >
          <div className={`p-2 rounded-lg ${service === 'gemini' ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex-grow">
            <p className="font-bold">Google Gemini</p>
            <p className="text-xs opacity-70">Cloud-based, high performance</p>
          </div>
          {service === 'gemini' && (
            <motion.div layoutId="active-check" className="absolute top-2 right-2 text-primary">
              <Check className="w-4 h-4" />
            </motion.div>
          )}
        </button>

        <button
          onClick={() => setService('ollama')}
          disabled={isLoading}
          className={`relative flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
            service === 'ollama'
              ? 'border-primary bg-primary/5 text-primary shadow-sm'
              : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-200 dark:hover:border-slate-700'
          }`}
        >
          <div className={`p-2 rounded-lg ${service === 'ollama' ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
            <Globe className="w-5 h-5" />
          </div>
          <div className="flex-grow">
            <p className="font-bold">Ollama</p>
            <p className="text-xs opacity-70">Local execution, private</p>
          </div>
          {service === 'ollama' && (
            <motion.div layoutId="active-check" className="absolute top-2 right-2 text-primary">
              <Check className="w-4 h-4" />
            </motion.div>
          )}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {service === 'ollama' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-6 overflow-hidden"
          >
            <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Server URL</label>
                <input
                  type="text"
                  value={ollamaUrl}
                  onChange={(e) => setOllamaUrl(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm"
                  placeholder="http://localhost:11434"
                  disabled={isLoading}
                />
              </div>

              <div className="flex flex-col sm:flex-row items-end gap-4">
                <div className="flex-grow w-full">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Model</label>
                  <select
                    value={selectedOllamaModel}
                    onChange={(e) => setSelectedOllamaModel(e.target.value)}
                    disabled={isLoading || ollamaModels.length === 0 || isFetchingModels}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm disabled:opacity-50"
                  >
                    {ollamaModels.length === 0 && <option>Fetch models first...</option>}
                    {ollamaModels.map(model => <option key={model} value={model}>{model}</option>)}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={handleFetchModels}
                  disabled={isLoading || isFetchingModels}
                  className="w-full sm:w-auto py-3 px-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isFetchingModels ? 'animate-spin' : ''}`} />
                  {isFetchingModels ? 'Fetching...' : 'Fetch Models'}
                </button>
              </div>

              {fetchError && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-xl text-xs font-medium"
                >
                  <AlertCircle className="w-4 h-4" />
                  {fetchError}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LLMSelector;
