
import React from 'react';
import { motion } from 'motion/react';
import { User, MessageCircle, Quote } from 'lucide-react';

const Furigana = ({ text }: { text: string }) => {
  const regex = /([\u4e00-\u9faf]+)\[(.+?)\]/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    const [_, kanji, furigana] = match;
    parts.push(
      <ruby key={match.index} className="group/kanji relative inline-flex flex-col-reverse items-center align-bottom">
        <span className="relative z-10">{kanji}</span>
        <rt className="text-[0.45em] text-primary/40 font-black tracking-tighter mb-0.5 group-hover/kanji:text-primary group-hover/kanji:scale-110 transition-all duration-300 select-none">
          {furigana}
        </rt>
      </ruby>
    );
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return <>{parts.map((part, i) => <React.Fragment key={i}>{part}</React.Fragment>)}</>;
};

interface ConversationLine {
  speaker: string;
  japanese: string;
  romaji: string;
  english: string;
}

interface Conversation {
  title: string;
  dialogue: ConversationLine[];
}

interface ConversationCardProps {
  conversation: Conversation;
  showRomaji: boolean;
  showEnglish: boolean;
}

const ConversationCard: React.FC<ConversationCardProps> = ({ conversation, showRomaji, showEnglish }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 group/card"
    >
      <div className="bg-slate-50/50 dark:bg-slate-950/50 px-6 py-4 border-b border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <MessageCircle className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">{conversation.title}</h3>
        </div>
        <Quote className="w-4 h-4 text-slate-200 dark:text-slate-800 group-hover/card:text-primary/20 transition-colors duration-500" />
      </div>
      
      <div className="p-6 sm:p-8 space-y-10">
        {conversation.dialogue.map((line, lineIndex) => (
          <div key={lineIndex} className="relative flex items-start gap-6 group/line">
            {/* Vertical Line Connector */}
            {lineIndex < conversation.dialogue.length - 1 && (
              <div className="absolute left-5 top-10 bottom-[-40px] w-px bg-gradient-to-b from-slate-200 to-transparent dark:from-slate-800" />
            )}
            
            <div className="flex-shrink-0 relative z-10">
              <div className="h-10 w-10 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 group-hover/line:border-primary/50 group-hover/line:text-primary transition-all duration-300 shadow-sm group-hover/line:shadow-lg group-hover/line:shadow-primary/10 group-hover/line:-translate-y-0.5">
                <User className="w-5 h-5" />
              </div>
            </div>
            
            <div className="flex-grow space-y-4 pt-1">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] bg-primary/5 px-2 py-0.5 rounded-md">
                  {line.speaker}
                </span>
              </div>
              
              <div className="font-jp text-slate-800 dark:text-slate-100 text-3xl sm:text-4xl leading-[1.6] tracking-tight">
                <Furigana text={line.japanese} />
              </div>
              
              {(showRomaji || showEnglish) && (
                <div className="space-y-4 pt-2">
                  {showRomaji && (
                    <p className="text-lg sm:text-xl text-slate-400 dark:text-slate-500 font-medium italic tracking-widest font-mono">
                      {line.romaji}
                    </p>
                  )}
                  {showEnglish && (
                    <p className="text-xl sm:text-2xl text-slate-600 dark:text-slate-400 font-serif italic leading-relaxed opacity-80 group-hover/line:opacity-100 transition-opacity">
                      {line.english}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default ConversationCard;
