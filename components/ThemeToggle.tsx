'use client';

import { useEffect, useState } from 'react';

function getInitialTheme() {
  if (typeof window === 'undefined') return 'light'; // SSR guard

  const stored = localStorage.getItem('theme');
  if (stored) return stored;

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      const stored = localStorage.getItem('theme');
      if (!stored) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <label className="swap swap-rotate p-1">
      <input
        type="checkbox"
        onChange={toggleTheme}
        checked={theme === 'dark'}
        readOnly
      />
      <svg className="swap-off h-6 w-6 fill-current" viewBox="0 0 24 24">
        <path d="M5.64 17l-.71.71a1 1 0 001.41 1.41l.71-.71A1 1 0 005.64 17zM5 12a1 1 0 00-1-1H3a1 1 0 000 2h1a1 1 0 001-1zm7-7a1 1 0 001-1V3a1 1 0 00-2 0v1a1 1 0 001 1zM5.64 7a1 1 0 00.7-1.7l-.71-.71a1 1 0 10-1.41 1.42l.71.71a1 1 0 00.7.29zm12 0a1 1 0 00.7-.29l.71-.71a1 1 0 10-1.41-1.41l-.71.7a1 1 0 00.71 1.71zM12 6a6 6 0 106 6 6 6 0 00-6-6zm0 10a4 4 0 114-4 4 4 0 01-4 4zm8-5h-1a1 1 0 000 2h1a1 1 0 000-2zm-1.36 5.36a1 1 0 00-1.41 1.41l.71.71a1 1 0 001.41-1.41zM12 20a1 1 0 00-1 1v1a1 1 0 002 0v-1a1 1 0 00-1-1z"/>
      </svg>
      <svg className="swap-on h-6 w-6 fill-current" viewBox="0 0 24 24">
        <path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Z"/>
      </svg>
    </label>
  );
}
