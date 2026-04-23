
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, MessageSquare, Book, Info, ChevronDown, Sparkles, Languages } from 'lucide-react';
import ConversationCard from './ConversationCard';

interface WordDetails {
  kanji: string;
  kana: string;
  romaji: string;
}

interface ResultData {
  wordDetails: WordDetails;
  meaning: string;
  nuance?: string;
  grammar?: string;
  conversations: any[];
}

interface ResultDisplayProps {
  result: ResultData;
  showRomaji: boolean;
  showEnglish: boolean;
  onDelete?: (index: number) => void;
  index?: number;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, showRomaji, showEnglish, onDelete, index }) => {
  const [isConversationsVisible, setIsConversationsVisible] = useState(true);
  const { wordDetails, meaning, nuance, grammar, conversations } = result;

  const handleDelete = () => {
    if (onDelete && typeof index === 'number') {
      onDelete(index);
    }
  };

  return (
    <div className="w-full mb-24">
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] overflow-hidden border border-slate-200/60 dark:border-slate-800/60 shadow-2xl shadow-slate-200/50 dark:shadow-none">
        {/* Hero Header Section */}
        <div className="relative p-10 sm:p-16 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-br from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
          <div className="absolute top-10 right-10 flex gap-3">
            {onDelete && (
              <button 
                onClick={handleDelete}
                className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-red-500 hover:border-red-200 dark:hover:border-red-900 transition-all shadow-sm active:scale-95 group"
                title="Delete result"
              >
                <Trash2 className="w-6 h-6 group-hover:rotate-12 transition-transform" />
              </button>
            )}
          </div>

          <div className="flex flex-col gap-10">
            <div className="flex items-center gap-4">
              <div className="px-5 py-2 bg-primary/10 text-primary rounded-full text-xs font-black uppercase tracking-[0.3em]">
                Target Expression
              </div>
            </div>
            
            <div className="flex flex-col lg:flex-row lg:items-end gap-6 lg:gap-12">
              <h3 className="text-6xl sm:text-7xl font-black font-jp text-slate-900 dark:text-white tracking-tighter leading-none">
                {wordDetails.kanji}
              </h3>
              <div className="flex flex-col gap-1 pb-2">
                <p className="text-2xl sm:text-3xl text-slate-400 dark:text-slate-500 font-jp font-bold">
                  {wordDetails.kana}
                </p>
                {showRomaji && (
                  <p className="text-lg sm:text-xl text-primary/60 font-mono font-bold tracking-[0.1em]">
                    {wordDetails.romaji}
                  </p>
                )}
              </div>
            </div>

            {showEnglish && (
              <div className="flex items-start gap-6 max-w-4xl">
                <div className="mt-1 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400">
                  <Languages className="w-5 h-5" />
                </div>
                <p className="text-xl sm:text-2xl text-slate-700 dark:text-slate-200 font-serif italic leading-tight tracking-tight">
                  {meaning}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-10 sm:p-16 space-y-20">
          {/* Linguistic Insights - Horizontal Grid */}
          {(nuance || grammar) && (
            <div className="space-y-10">
              <div className="flex items-center gap-4">
                <Sparkles className="w-6 h-6 text-primary" />
                <h4 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Linguistic Insights</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {nuance && (
                  <div className="group">
                    <div className="flex items-center gap-3 mb-4 text-slate-900 dark:text-white font-black text-sm uppercase tracking-widest">
                      <Info className="w-4 h-4 text-primary/60" />
                      <span>Usage & Nuance</span>
                    </div>
                    <div className="p-6 bg-slate-50/50 dark:bg-slate-950/50 rounded-[2rem] border border-slate-100 dark:border-slate-800 group-hover:border-primary/20 transition-all duration-500 shadow-inner">
                      <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed font-serif italic">
                        {nuance}
                      </p>
                    </div>
                  </div>
                )}
                
                {grammar && (
                  <div className="group">
                    <div className="flex items-center gap-3 mb-4 text-slate-900 dark:text-white font-black text-sm uppercase tracking-widest">
                      <Book className="w-4 h-4 text-primary/60" />
                      <span>Grammar Notes</span>
                    </div>
                    <div className="p-6 bg-slate-50/50 dark:bg-slate-950/50 rounded-[2rem] border border-slate-100 dark:border-slate-800 group-hover:border-primary/20 transition-all duration-500 shadow-inner">
                      <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                        {grammar}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Contextual Examples - Full Width */}
          <div className="space-y-10">
            <button 
              onClick={() => setIsConversationsVisible(!isConversationsVisible)}
              className="w-full flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-sm">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">Contextual Examples</h4>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-slate-50 dark:bg-slate-800 group-hover:bg-slate-100 dark:group-hover:bg-slate-700 transition-colors">
                <ChevronDown className={`w-6 h-6 text-slate-400 transition-transform duration-500 ${isConversationsVisible ? 'rotate-180' : ''}`} />
              </div>
            </button>
            
            <AnimatePresence initial={false}>
              {isConversationsVisible && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 gap-10 pb-4">
                    {conversations.map((conv, i) => (
                      <ConversationCard 
                        key={i} 
                        conversation={conv} 
                        showRomaji={showRomaji} 
                        showEnglish={showEnglish} 
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultDisplay;
