import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, FileJson, Trash2, Download, GripVertical, Eye, EyeOff, RefreshCcw, AlertCircle } from 'lucide-react';
import ResultDisplay from './ResultDisplay';

const ReviewPage = () => {
  const [reviewedResults, setReviewedResults] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showRomaji, setShowRomaji] = useState(true);
  const [showEnglish, setShowEnglish] = useState(true);
  const [dragEnabledIndex, setDragEnabledIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const dragItemIndex = useRef<number | null>(null);
  const dragOverIndex = useRef<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const isValidLearningResult = (obj: any): boolean => {
    return (
      obj &&
      typeof obj.meaning === 'string' &&
      typeof obj.wordDetails === 'object' &&
      obj.wordDetails !== null &&
      typeof obj.wordDetails.kanji === 'string' &&
      typeof obj.wordDetails.kana === 'string' &&
      typeof obj.wordDetails.romaji === 'string' &&
      Array.isArray(obj.conversations)
    );
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setError(null);
    const loadedResults: any[] = [];

    const readFile = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result;
          if (typeof result === 'string') resolve(result);
          else reject(new Error(`Failed to read file ${file.name}`));
        };
        reader.onerror = () => reject(new Error(`Error reading file ${file.name}`));
        reader.readAsText(file);
      });
    };

    try {
      const filesArray = Array.from(files) as File[];
      for (const file of filesArray) {
        const text = await readFile(file);
        const parsed = JSON.parse(text);

        if (Array.isArray(parsed)) {
          const validItems = parsed.filter(isValidLearningResult);
          loadedResults.push(...validItems);
        } else if (isValidLearningResult(parsed)) {
          loadedResults.push(parsed);
        } else {
          throw new Error(`File ${file.name} has an invalid structure.`);
        }
      }

      if (loadedResults.length > 0) {
        setReviewedResults(loadedResults);
      } else {
        throw new Error("No valid learning results found.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse JSON file(s).");
    } finally {
      if (event.target) event.target.value = '';
    }
  };

  const handleDeleteResult = (indexToDelete: number) => {
    setReviewedResults(prev => prev ? prev.filter((_, i) => i !== indexToDelete) : null);
  };

  const handleExportChanges = () => {
    if (!reviewedResults || reviewedResults.length === 0) return;
    const jsonString = JSON.stringify(reviewedResults, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reviewed-session-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const onDragStart = (e: React.DragEvent, index: number) => {
    dragItemIndex.current = index;
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragEnter = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    dragOverIndex.current = index;
  };

  const onDrop = () => {
    if (reviewedResults && dragItemIndex.current !== null && dragOverIndex.current !== null && dragItemIndex.current !== dragOverIndex.current) {
      const items = [...reviewedResults];
      const draggedItem = items.splice(dragItemIndex.current, 1)[0];
      items.splice(dragOverIndex.current, 0, draggedItem);
      setReviewedResults(items);
    }
    onDragEnd();
  };

  const onDragEnd = () => {
    dragItemIndex.current = null;
    dragOverIndex.current = null;
    setIsDragging(false);
    setDragEnabledIndex(null);
  };

  return (
    <div className="w-full px-4 pb-20">
      <AnimatePresence mode="wait">
        {!reviewedResults ? (
          <motion.div
            key="upload-state"
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="card-modern p-16 md:p-24 text-center relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-primary/10">
              <motion.div 
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />
            </div>
            
            <div className="w-24 h-24 rounded-[2rem] bg-primary/5 border border-primary/10 flex items-center justify-center text-primary mx-auto mb-10 shadow-inner">
              <FileJson className="w-12 h-12" />
            </div>
            
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tighter">
              Review Your <span className="text-primary italic font-serif font-normal">Journey</span>
            </h2>
            
            <p className="text-xl text-slate-500 dark:text-slate-400 mb-12 max-w-lg mx-auto font-medium leading-relaxed">
              Upload your exported <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg font-mono text-sm text-primary">.json</code> files to revisit, reorder, and refine your study materials.
            </p>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json,application/json"
              className="hidden"
              multiple
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-primary px-12 py-5 text-xl flex items-center gap-4 mx-auto group"
            >
              <Upload className="w-6 h-6 group-hover:-translate-y-1 transition-transform" />
              Select Files
            </button>
            
            <p className="mt-8 text-sm font-black uppercase tracking-[0.2em] text-slate-300 dark:text-slate-700">
              Multiple files supported
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="review-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-12"
          >
            {/* Toolbar */}
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="sticky top-24 z-30 glass p-4 rounded-[2rem] border border-white/40 dark:border-slate-800/40 flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl shadow-slate-200/50 dark:shadow-none"
            >
              <div className="flex items-center gap-6 pl-4">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-1">Session Active</span>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Reviewing</h2>
                    <div className="px-3 py-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-xs font-black">
                      {reviewedResults.length} ITEMS
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap justify-center pr-2">
                <div className="flex bg-slate-100/50 dark:bg-slate-950/50 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
                  <button
                    onClick={() => setShowRomaji(!showRomaji)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black tracking-widest transition-all ${
                      showRomaji ? 'bg-white dark:bg-slate-800 text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                    }`}
                  >
                    {showRomaji ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    ROMAJI
                  </button>
                  <button
                    onClick={() => setShowEnglish(!showEnglish)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black tracking-widest transition-all ${
                      showEnglish ? 'bg-white dark:bg-slate-800 text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                    }`}
                  >
                    {showEnglish ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    ENGLISH
                  </button>
                </div>

                <div className="h-10 w-px bg-slate-200 dark:bg-slate-800 mx-2 hidden lg:block" />

                <button
                  onClick={handleExportChanges}
                  className="btn-primary px-6 py-3 text-sm flex items-center gap-2 shadow-sm"
                  title="Export reordered session"
                >
                  <Download className="w-4 h-4" />
                  EXPORT
                </button>

                <button
                  onClick={() => setReviewedResults(null)}
                  className="btn-secondary px-6 py-3 text-sm flex items-center gap-2"
                  title="Load different files"
                >
                  <RefreshCcw className="w-4 h-4" />
                  RESET
                </button>
              </div>
            </motion.div>

            {error && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-6 bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-[2rem] flex items-center gap-4 text-red-600 dark:text-red-400 shadow-sm"
              >
                <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <p className="text-base font-bold leading-relaxed">{error}</p>
              </motion.div>
            )}

            <div className="space-y-8 relative">
              {reviewedResults.map((result, index) => (
                <motion.div
                  key={`${result.wordDetails.romaji}-${index}`}
                  layout
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    delay: index * 0.05,
                    layout: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
                  }}
                  draggable={dragEnabledIndex === index}
                  onDragStart={(e) => onDragStart(e, index)}
                  onDragEnter={(e) => onDragEnter(e, index)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={onDrop}
                  onDragEnd={onDragEnd}
                  className={`relative group ${dragItemIndex.current === index && isDragging ? 'opacity-40 scale-95 z-50' : 'opacity-100'}`}
                >
                  <div 
                    onMouseEnter={() => setDragEnabledIndex(index)}
                    onMouseLeave={() => !isDragging && setDragEnabledIndex(null)}
                    className="absolute -left-16 top-1/2 -translate-y-1/2 p-4 rounded-2xl text-slate-300 dark:text-slate-700 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-all hover:text-primary dark:hover:text-primary hover:bg-white dark:hover:bg-slate-900 hover:shadow-xl"
                    title="Drag to reorder"
                  >
                    <GripVertical className="w-8 h-8" />
                  </div>
                  <ResultDisplay
                    result={result}
                    showRomaji={showRomaji}
                    showEnglish={showEnglish}
                    onDelete={handleDeleteResult}
                    index={index}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReviewPage;
