import React, { useEffect, useState } from 'react';

type Theme = 'system' | 'light' | 'dark';

export const ThemeToggle: React.FC = () => {
  const [currentTheme, setCurrentTheme] = useState<Theme>('system');

  useEffect(() => {
    // Get initial theme from localStorage or default to system
    const savedTheme = localStorage.getItem('phx:theme') as Theme;
    if (savedTheme) {
      setCurrentTheme(savedTheme);
    } else {
      setCurrentTheme('system');
    }
  }, []);

  const setTheme = (theme: Theme) => {
    if (theme === 'system') {
      localStorage.removeItem('phx:theme');
      document.documentElement.removeAttribute('data-theme');
    } else {
      localStorage.setItem('phx:theme', theme);
      document.documentElement.setAttribute('data-theme', theme);
    }
    setCurrentTheme(theme);
  };

  return (
    <div className="card relative flex flex-row items-center border-2 border-base-300 bg-base-300 rounded-full">
      <div 
        className={`absolute w-1/3 h-full rounded-full border-1 border-base-200 bg-base-100 brightness-200 transition-[left] ${
          currentTheme === 'system' ? 'left-0' : 
          currentTheme === 'light' ? 'left-1/3' : 
          'left-2/3'
        }`} 
      />

      <button
        className="flex p-2 cursor-pointer w-1/3 relative z-10"
        onClick={() => setTheme('system')}
        title="System theme"
      >
        <ComputerDesktopIcon className="size-4 opacity-75 hover:opacity-100" />
      </button>

      <button
        className="flex p-2 cursor-pointer w-1/3 relative z-10"
        onClick={() => setTheme('light')}
        title="Light theme"
      >
        <SunIcon className="size-4 opacity-75 hover:opacity-100" />
      </button>

      <button
        className="flex p-2 cursor-pointer w-1/3 relative z-10"
        onClick={() => setTheme('dark')}
        title="Dark theme"
      >
        <MoonIcon className="size-4 opacity-75 hover:opacity-100" />
      </button>
    </div>
  );
};

// Heroicons components (micro versions)
const ComputerDesktopIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 16 16">
    <path
      fill="currentColor"
      d="M1.75 2.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25H1.75ZM0 2.75C0 1.784.784 1 1.75 1h12.5c.966 0 1.75.784 1.75 1.75v7.5A1.75 1.75 0 0 1 14.25 12H9.533l.467 1.75h1.25a.75.75 0 0 1 0 1.5H4.75a.75.75 0 0 1 0-1.5H6l.467-1.75H1.75A1.75 1.75 0 0 1 0 10.25v-7.5Z"
    />
  </svg>
);

const SunIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 16 16">
    <path
      fill="currentColor"
      d="M8 1a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 8 1ZM3.05 3.05a.75.75 0 0 1 1.06 0l1.062 1.06A.75.75 0 1 1 4.11 5.172L3.05 4.11a.75.75 0 0 1 0-1.06ZM1 8a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5A.75.75 0 0 1 1 8ZM3.05 12.95a.75.75 0 0 1 0-1.06l1.06-1.062a.75.75 0 1 1 1.062 1.061l-1.06 1.061a.75.75 0 0 1-1.061 0ZM8 15a.75.75 0 0 1-.75-.75v-1.5a.75.75 0 0 1 1.5 0v1.5A.75.75 0 0 1 8 15ZM12.95 12.95a.75.75 0 0 1-1.061 0l-1.061-1.061a.75.75 0 1 1 1.061-1.061l1.061 1.061a.75.75 0 0 1 0 1.061ZM15 8a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 15 8ZM12.95 3.05a.75.75 0 0 1 0 1.061L11.889 5.172A.75.75 0 1 1 10.828 4.11l1.061-1.061a.75.75 0 0 1 1.061 0ZM8 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"
    />
  </svg>
);

const MoonIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 16 16">
    <path
      fill="currentColor"
      d="M14.438 10.148c.19-.425-.321-.787-.748-.601A5.5 5.5 0 0 1 6.453 2.31c.186-.427-.176-.938-.6-.748a6.501 6.501 0 1 0 8.585 8.586Z"
    />
  </svg>
);