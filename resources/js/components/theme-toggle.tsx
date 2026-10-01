import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

const storageKey = 'vagary:theme';

export function ThemeToggle() {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const savedTheme = localStorage.getItem(storageKey);
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const nextIsDark = savedTheme ? savedTheme === 'dark' : prefersDark;

        document.documentElement.classList.toggle('dark', nextIsDark);
        setIsDark(nextIsDark);
    }, []);

    const toggleTheme = () => {
        const nextIsDark = !isDark;
        document.documentElement.classList.toggle('dark', nextIsDark);
        localStorage.setItem(storageKey, nextIsDark ? 'dark' : 'light');
        setIsDark(nextIsDark);
    };

    return (
        <button
            type="button"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            onClick={toggleTheme}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-neutral-900 transition hover:border-neutral-950 dark:border-white/15 dark:bg-neutral-900 dark:text-white dark:hover:border-white/40"
        >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
    );
}
