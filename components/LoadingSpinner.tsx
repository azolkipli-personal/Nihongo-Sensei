import React from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message }) => {
  return (
    <div className="flex flex-col justify-center items-center p-12 min-h-[300px]">
      <div className="relative">
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1],
          }}
          transition={{
            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
            scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
          }}
          className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary shadow-lg shadow-primary/20"
        />
        <motion.div
          animate={{
            opacity: [0.3, 1, 0.3],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 flex items-center justify-center text-primary"
        >
          <Sparkles className="w-6 h-6" />
        </motion.div>
      </div>
      
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 text-center"
        >
          <p className="text-lg font-medium text-slate-900 dark:text-white">
            {message}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 uppercase tracking-widest font-bold animate-pulse">
            Generating your lesson...
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default LoadingSpinner;
