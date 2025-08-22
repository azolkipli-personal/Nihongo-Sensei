import React from 'react';

type Page = 'generator' | 'review';

interface HeaderProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}

const Header: React.FC<HeaderProps> = ({ currentPage, setCurrentPage }) => {
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
      </div>
    </header>
  );
};

export default Header;