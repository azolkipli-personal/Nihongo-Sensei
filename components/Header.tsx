import React from 'react';
import { motion } from 'motion/react';
import { Settings, BookOpen, Sparkles, Command } from 'lucide-react';

const Header = ({ currentPage, setCurrentPage, onOpenSettings }) => {
  const navButtonStyle = "px-6 py-2.5 rounded-2xl text-sm font-bold transition-all duration-300 flex items-center gap-2.5 relative overflow-hidden group";
  const activeStyle = "text-white";
  const inactiveStyle = "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white";

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60">
      <div className="container mx-auto px-6 h-24 flex justify-between items-center max-w-7xl">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4 cursor-pointer group"
          onClick={() => setCurrentPage('generator')}
        >
            <div className="w-12 h-12 bg-primary rounded-[1.25rem] flex items-center justify-center shadow-xl shadow-primary/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
              <span className="text-white font-black text-2xl">会</span>
            </div>
            <div className="flex flex-col">
                <h1 className="text-xl font-black font-jp leading-none text-slate-900 dark:text-white tracking-tight">会話練習</h1>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mt-1 opacity-80">Kaiwa Renshuu</p>
            </div>
        </motion.div>
        
        <div className="flex items-center gap-4 sm:gap-6">
            <nav className="hidden md:flex bg-slate-100/50 dark:bg-slate-950/50 p-1.5 rounded-[1.5rem] border border-slate-200/50 dark:border-slate-800/50 relative">
                <button 
                    onClick={() => setCurrentPage('generator')}
                    className={`${navButtonStyle} ${currentPage === 'generator' ? activeStyle : inactiveStyle}`}
                    aria-current={currentPage === 'generator' ? 'page' : undefined}
                >
                    <Sparkles className={`w-4 h-4 transition-transform duration-500 ${currentPage === 'generator' ? 'scale-110' : 'group-hover:scale-110'}`} />
                    <span className="relative z-10">Generator</span>
                    {currentPage === 'generator' && (
                      <motion.div 
                        layoutId="activeNav"
                        className="absolute inset-0 bg-primary rounded-[1.1rem] shadow-lg shadow-primary/20"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                </button>
                <button 
                    onClick={() => setCurrentPage('review')}
                    className={`${navButtonStyle} ${currentPage === 'review' ? activeStyle : inactiveStyle}`}
                    aria-current={currentPage === 'review' ? 'page' : undefined}
                >
                    <BookOpen className={`w-4 h-4 transition-transform duration-500 ${currentPage === 'review' ? 'scale-110' : 'group-hover:scale-110'}`} />
                    <span className="relative z-10">Review</span>
                    {currentPage === 'review' && (
                      <motion.div 
                        layoutId="activeNav"
                        className="absolute inset-0 bg-primary rounded-[1.1rem] shadow-lg shadow-primary/20"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                </button>
            </nav>
            
            <div className="h-10 w-px bg-slate-200 dark:bg-slate-800 mx-2 hidden md:block"></div>

            <div className="flex items-center gap-2">
              <button
                  onClick={onOpenSettings}
                  className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary hover:border-primary/50 transition-all shadow-sm active:scale-90 group"
                  aria-label="Open settings"
                  title="Open settings"
              >
                  <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
              </button>
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
