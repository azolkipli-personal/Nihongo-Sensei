import React, { useState, useEffect, useRef } from 'react';
import { fetchOllamaModels } from '../services/llm/ollama';

const SettingsSidebar = ({ isOpen, onClose, onSave, currentSettings }) => {
  const [settings, setSettings] = useState(currentSettings);
  const [ollamaModels, setOllamaModels] = useState([]);
  const [isFetchingModels, setIsFetchingModels] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [importError, setImportError] = useState(null);
  const fileInputRef = useRef(null);

  // A list of recommended Gemini models for this application
  const geminiModelOptions = [
    'gemini-2.5-flash',
    'gemini-2.0-flash',
  ];

  useEffect(() => {
    setSettings(currentSettings);
  }, [currentSettings, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleServiceChange = (service) => {
    setSettings(prev => ({ ...prev, service }));
  }

  const handleSave = () => {
    onSave(settings);
  };
  
  const handleFetchModels = async () => {
    setIsFetchingModels(true);
    setFetchError(null);
    setOllamaModels([]);
    try {
      const models = await fetchOllamaModels(settings.ollamaUrl);
      if (models.length > 0) {
        setOllamaModels(models);
        // If no model is selected yet, or the current one is not in the list, select the first one.
        if (!settings.ollamaModel || !models.includes(settings.ollamaModel)) {
            setSettings(prev => ({...prev, ollamaModel: models[0]}));
        }
      } else {
        setFetchError("No models found. Ensure Ollama is running and has models installed (e.g., 'ollama pull llama3').");
      }
    } catch (error) {
      console.error("Failed to fetch Ollama models:", error);
      setFetchError("Could not connect to Ollama server at the specified URL.");
    } finally {
      setIsFetchingModels(false);
    }
  };

  const handleExportSettings = () => {
    setImportError(null);
    try {
        const jsonString = JSON.stringify(settings, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'kaiwa-renshuu-settings.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Failed to export settings:", error);
        setImportError("An error occurred during export.");
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const text = event.target?.result;
            if (typeof text !== 'string') {
                throw new Error("Could not read file content.");
            }
            const importedSettings = JSON.parse(text);

            if (importedSettings && importedSettings.service && ['gemini', 'ollama'].includes(importedSettings.service)) {
                // Merge with current settings to ensure all keys exist
                setSettings(prev => ({...prev, ...importedSettings}));
            } else {
                throw new Error("Invalid or incomplete settings file.");
            }
        } catch (err) {
            setImportError(err instanceof Error ? err.message : "Failed to parse the JSON file.");
        }
    };
    reader.onerror = () => {
        setImportError("Error reading the file.");
    }
    reader.readAsText(file);

    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  if (!isOpen) {
    return null;
  }
  
  const baseRadioStyle = "flex items-center justify-center w-full px-4 py-3 text-sm font-medium border rounded-lg cursor-pointer transition-all";
  const activeRadioStyle = "bg-primary text-white border-primary shadow-md";
  const inactiveRadioStyle = "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300";

  return (
    <>
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
            onClick={onClose}
            aria-hidden="true"
        ></div>
        <div className="fixed top-0 right-0 h-full w-full max-w-md bg-background z-50 shadow-2xl transform transition-transform duration-300 ease-in-out"
             style={{ transform: isOpen ? 'translateX(0)' : 'translateX(100%)' }}
             role="dialog"
             aria-modal="true"
             aria-labelledby="settings-title"
        >
            <div className="flex flex-col h-full">
                <header className="p-4 border-b bg-white">
                    <div className="flex justify-between items-center">
                        <h2 id="settings-title" className="text-xl font-bold text-slate-800">Settings</h2>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200" aria-label="Close settings">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </header>
                <div className="p-6 flex-grow overflow-y-auto space-y-6">
                    <fieldset>
                        <legend className="text-lg font-semibold text-slate-800 mb-3">Language Model</legend>
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => handleServiceChange('gemini')} className={`${baseRadioStyle} ${settings.service === 'gemini' ? activeRadioStyle : inactiveRadioStyle}`}>Google Gemini</button>
                            <button onClick={() => handleServiceChange('ollama')} className={`${baseRadioStyle} ${settings.service === 'ollama' ? activeRadioStyle : inactiveRadioStyle}`}>Ollama (Local)</button>
                        </div>
                    </fieldset>

                    {settings.service === 'gemini' && (
                        <div className="p-4 border rounded-lg bg-white space-y-3">
                             <h3 className="font-semibold text-slate-700">Gemini Configuration</h3>
                             <div>
                                <label htmlFor="geminiApiKey" className="block text-sm font-medium text-slate-700 mb-1">Google Gemini API Key</label>
                                <input
                                    type="password"
                                    id="geminiApiKey"
                                    name="geminiApiKey"
                                    value={settings.geminiApiKey}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-primary focus:border-primary text-sm"
                                    placeholder="Enter your API key"
                                />
                                <p className="text-xs text-slate-500 mt-1">Your key is stored only in your browser's local storage.</p>
                             </div>
                             <div>
                                <label htmlFor="geminiModel" className="block text-sm font-medium text-slate-700 mb-1">Select a Model</label>
                                <select
                                    id="geminiModel"
                                    name="geminiModel"
                                    value={settings.geminiModel}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-primary focus:border-primary text-sm"
                                >
                                    {geminiModelOptions.map(model => <option key={model} value={model}>{model}</option>)}
                                </select>
                                <p className="text-xs text-slate-500 mt-1">Only recommended models are shown. More may be added later.</p>
                             </div>
                        </div>
                    )}

                    {settings.service === 'ollama' && (
                        <div className="p-4 border rounded-lg bg-white space-y-4">
                             <h3 className="font-semibold text-slate-700">Ollama Configuration</h3>
                            <div>
                                <label htmlFor="ollamaUrl" className="block text-sm font-medium text-slate-700 mb-1">Ollama Server URL</label>
                                <input
                                    type="text"
                                    id="ollamaUrl"
                                    name="ollamaUrl"
                                    value={settings.ollamaUrl}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-primary focus:border-primary text-sm"
                                    placeholder="http://localhost:11434"
                                />
                            </div>
                            <div className="flex items-end gap-3">
                                <div className="flex-grow">
                                    <label htmlFor="ollamaModel" className="block text-sm font-medium text-slate-700 mb-1">Select a Model</label>
                                    <select
                                        id="ollamaModel"
                                        name="ollamaModel"
                                        value={settings.ollamaModel}
                                        onChange={handleChange}
                                        disabled={ollamaModels.length === 0 || isFetchingModels}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-primary focus:border-primary text-sm disabled:bg-slate-200"
                                    >
                                        {ollamaModels.length === 0 && <option value="">Click 'Fetch Models'</option>}
                                        {ollamaModels.map(model => <option key={model} value={model}>{model}</option>)}
                                    </select>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleFetchModels}
                                    disabled={isFetchingModels}
                                    className="py-2 px-4 border rounded-md shadow-sm text-sm font-medium text-white bg-secondary hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary disabled:bg-slate-400"
                                >
                                    {isFetchingModels ? 'Fetching...' : 'Fetch Models'}
                                </button>
                            </div>
                            {fetchError && <p className="text-sm text-red-600">{fetchError}</p>}
                        </div>
                    )}
                </div>
                <footer className="p-4 border-t bg-white space-y-3">
                    <button
                        onClick={handleSave}
                        className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-primary hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                        Save and Close
                    </button>
                    <div className="flex gap-3">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept=".json,application/json"
                            className="hidden"
                            aria-hidden="true"
                        />
                        <button
                            onClick={handleImportClick}
                            type="button"
                            className="w-full py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                            Import Settings
                        </button>
                        <button
                            onClick={handleExportSettings}
                            type="button"
                            className="w-full py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                            Export Settings
                        </button>
                    </div>
                    {importError && <p className="text-xs text-center text-red-600">{importError}</p>}
                </footer>
            </div>
        </div>
    </>
  );
};

export default SettingsSidebar;
