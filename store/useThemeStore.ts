import { create } from 'zustand';

type Theme = 'dark' | 'light';

interface ThemeState {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
    theme: 'dark', // Default
    toggleTheme: () => set((state) => {
        const newTheme = state.theme === 'dark' ? 'light' : 'dark';
        if (typeof document !== 'undefined') {
            document.documentElement.setAttribute('data-theme', newTheme);
        }
        return { theme: newTheme };
    }),
    setTheme: (theme) => set(() => {
        if (typeof document !== 'undefined') {
            document.documentElement.setAttribute('data-theme', theme);
        }
        return { theme };
    }),
}));
