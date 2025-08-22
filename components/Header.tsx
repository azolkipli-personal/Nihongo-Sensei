import React from 'react';

const Header = ({ currentPage, setCurrentPage, onOpenSettings }) => {
  const navButtonStyle = "px-4 py-2 rounded-md text-sm font-medium transition-colors";
  const activeStyle = "bg-secondary text-white";
  const inactiveStyle = "text-light hover:bg-primary/70 hover:text-white";

  return (
    <header className="bg-primary text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold font-jp">会話練習</h1>
            <p className="text-lg font-sans -mt-1">Kaiwa Renshuu</p>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
            <nav className="flex space-x-2 sm:space-x-4">
                <button 
                    onClick={() => setCurrentPage('generator')}
                    className={`${navButtonStyle} ${currentPage === 'generator' ? activeStyle : inactiveStyle}`}
                    aria-current={currentPage === 'generator' ? 'page' : undefined}
                >
                    Generator
                </button>
                <button 
                    onClick={() => setCurrentPage('review')}
                    className={`${navButtonStyle} ${currentPage === 'review' ? activeStyle : inactiveStyle}`}
                    aria-current={currentPage === 'review' ? 'page' : undefined}
                >
                    Review
                </button>
            </nav>
            <button
                onClick={onOpenSettings}
                className="p-2 rounded-full hover:bg-primary/70 focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="Open settings"
                title="Open settings"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
