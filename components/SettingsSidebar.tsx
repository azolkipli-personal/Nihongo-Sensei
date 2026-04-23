import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Settings, Palette, Cpu, Sparkles, Globe, RefreshCw, Download, Upload, Check, AlertCircle } from 'lucide-react';
import { fetchOllamaModels } from '../services/llm/ollama';

const SettingsSidebar = ({ isOpen, onClose, onSave, currentSettings }) => {
  const [settings, setSettings] = useState(currentSettings);
  const [ollamaModels, setOllamaModels] = useState([]);
  const [isFetchingModels, setIsFetchingModels] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [importError, setImportError] = useState(null);
  const fileInputRef = useRef(null);

  const geminiModelOptions = [
    'gemini-3.1-pro-preview',
    'gemini-3.1-flash-lite-preview',
    'gemini-3-flash-preview',
    'gemini-2.5-flash-preview',
    'gemini-flash-latest',
  ];

  useEffect(() => {
    setSettings(currentSettings);
  }, [currentSettings, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleServiceChange = (service) => setSettings(prev => ({ ...prev, service }));
  const handleThemeChange = (theme) => setSettings(prev => ({ ...prev, theme }));
  const handleColorThemeChange = (colorTheme) => setSettings(prev => ({ ...prev, colorTheme }));

  const handleSave = () => onSave(settings);

  const handleFetchModels = async () => {
    setIsFetchingModels(true);
    setFetchError(null);
    try {
      const models = await fetchOllamaModels(settings.ollamaUrl);
      if (models.length > 0) {
        setOllamaModels(models);
        if (!settings.ollamaModel || !models.includes(settings.ollamaModel)) {
          setSettings(prev => ({ ...prev, ollamaModel: models[0] }));
        }
      } else {
        setFetchError("No models found. Ensure Ollama is running.");
      }
    } catch (error) {
      setFetchError("Could not connect to Ollama server.");
    } finally {
      setIsFetchingModels(false);
    }
  };

  const handleExportSettings = () => {
    const jsonString = JSON.stringify(settings, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'japaneasy-settings.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const result = event.target?.result;
        if (typeof result !== 'string') return;
        const importedSettings = JSON.parse(result);
        if (importedSettings?.service) {
          const { geminiApiKey, ...rest } = importedSettings;
          setSettings(prev => ({ ...prev, ...rest }));
        }
      } catch (err) {
        setImportError("Failed to parse settings file.");
      }
    };
    reader.readAsText(file);
  };

  const colorOptions = [
    { id: 'sky', color: '#38bdf8', label: 'Sky' },
    { id: 'emerald', color: '#34d399', label: 'Emerald' },
    { id: 'violet', color: '#a78bfa', label: 'Violet' },
    { id: 'rose', color: '#fb7185', label: 'Rose' },
    { id: 'amber', color: '#fbbf24', label: 'Amber' },
    { id: 'indigo', color: '#818cf8', label: 'Indigo' },
    { id: 'midnight', color: '#8b5cf6', label: 'Midnight' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-slate-950 z-50 shadow-2xl border-l border-slate-100 dark:border-slate-800 flex flex-col"
          >
            <header className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Settings className="w-4 h-4" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Settings</h2>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </header>

            <div className="flex-grow overflow-y-auto p-6 space-y-10">
              {/* Appearance Section */}
              <section className="space-y-6">
                <div className="flex items-center gap-2 text-slate-400 uppercase tracking-widest text-[10px] font-bold">
                  <Palette className="w-3 h-3" />
                  <span>Appearance</span>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleThemeChange('light')}
                    className={`p-3 rounded-xl border-2 transition-all font-bold text-sm ${
                      settings.theme === 'light' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Light
                  </button>
                  <button
                    onClick={() => handleThemeChange('dark')}
                    className={`p-3 rounded-xl border-2 transition-all font-bold text-sm ${
                      settings.theme === 'dark' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Dark
                  </button>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-900 dark:text-white">Accent Color</label>
                  <div className="flex flex-wrap gap-3">
                    {colorOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => handleColorThemeChange(option.id)}
                        className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center ${
                          settings.colorTheme === option.id ? 'border-slate-900 dark:border-white scale-110 shadow-lg' : 'border-transparent hover:scale-105'
                        }`}
                        style={{ backgroundColor: option.color }}
                        title={option.label}
                      >
                        {settings.colorTheme === option.id && <Check className="w-4 h-4 text-white drop-shadow-sm" />}
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              {/* AI Engine Section */}
              <section className="space-y-6">
                <div className="flex items-center gap-2 text-slate-400 uppercase tracking-widest text-[10px] font-bold">
                  <Cpu className="w-3 h-3" />
                  <span>AI Engine</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleServiceChange('gemini')}
                    className={`p-3 rounded-xl border-2 transition-all font-bold text-sm flex items-center justify-center gap-2 ${
                      settings.service === 'gemini' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                    Gemini
                  </button>
                  <button
                    onClick={() => handleServiceChange('ollama')}
                    className={`p-3 rounded-xl border-2 transition-all font-bold text-sm flex items-center justify-center gap-2 ${
                      settings.service === 'ollama' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Globe className="w-4 h-4" />
                    Ollama
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {settings.service === 'gemini' ? (
                    <motion.div
                      key="gemini-config"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4"
                    >
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Model Selection</label>
                      <select
                        name="geminiModel"
                        value={settings.geminiModel}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-primary transition-all text-sm text-slate-900 dark:text-white"
                      >
                        {geminiModelOptions.map(model => <option key={model} value={model}>{model}</option>)}
                      </select>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="ollama-config"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4"
                    >
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Server URL</label>
                        <input
                          type="text"
                          name="ollamaUrl"
                          value={settings.ollamaUrl}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-primary transition-all text-sm text-slate-900 dark:text-white"
                          placeholder="http://localhost:11434"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Select Model</label>
                        <div className="flex gap-2">
                          <select
                            name="ollamaModel"
                            value={settings.ollamaModel}
                            onChange={handleChange}
                            disabled={ollamaModels.length === 0 || isFetchingModels}
                            className="flex-grow px-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-primary transition-all text-sm disabled:opacity-50 text-slate-900 dark:text-white"
                          >
                            {ollamaModels.length === 0 && <option value="">Fetch models...</option>}
                            {ollamaModels.map(model => <option key={model} value={model}>{model}</option>)}
                          </select>
                          <button
                            onClick={handleFetchModels}
                            disabled={isFetchingModels}
                            className="p-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
                          >
                            <RefreshCw className={`w-4 h-4 ${isFetchingModels ? 'animate-spin' : ''}`} />
                          </button>
                        </div>
                      </div>
                      {fetchError && (
                        <div className="flex items-center gap-2 text-red-500 text-[10px] font-bold uppercase tracking-wider">
                          <AlertCircle className="w-3 h-3" />
                          {fetchError}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>
            </div>

            <footer className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-4">
              <button
                onClick={handleSave}
                className="btn-primary w-full py-4 text-base font-bold shadow-lg shadow-primary/20"
              >
                Save Changes
              </button>
              
              <div className="grid grid-cols-2 gap-3">
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-white dark:hover:bg-slate-800 transition-all"
                >
                  <Upload className="w-3.5 h-3.5" />
                  IMPORT
                </button>
                <button
                  onClick={handleExportSettings}
                  className="flex items-center justify-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-white dark:hover:bg-slate-800 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  EXPORT
                </button>
              </div>
              {importError && <p className="text-[10px] text-center text-red-500 font-bold uppercase tracking-widest">{importError}</p>}
            </footer>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SettingsSidebar;
