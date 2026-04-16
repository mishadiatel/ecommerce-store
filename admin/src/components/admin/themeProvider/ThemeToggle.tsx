'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      onClick={toggleTheme}
      className={[
        'relative inline-flex h-9 w-[68px] items-center rounded-full',
        'border border-border bg-secondary/60 hover:bg-secondary',
        'transition-colors duration-200 cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      ].join(' ')}
    >
      {/* background icons */}
      <span className="pointer-events-none absolute inset-0 flex items-center justify-between px-2 text-muted-foreground">
        <Sun className="h-4 w-4" />
        <Moon className="h-4 w-4" />
      </span>

      {/* knob */}
      <span
        className={[
          'pointer-events-none z-10 flex h-7 w-7 items-center justify-center rounded-full',
          'bg-background shadow-md ring-1 ring-border',
          'transition-transform duration-200 ease-out',
          isDark ? 'translate-x-[33px]' : 'translate-x-[4px]',
        ].join(' ')}
      >
        {isDark ? (
          <Moon className="h-4 w-4 text-accent" />
        ) : (
          <Sun className="h-4 w-4 text-primary" />
        )}
      </span>
    </button>
  );
}
