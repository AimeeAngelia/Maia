// src/utils/theme-init.js
export function injectDarkClassIfNeeded() {
    const match = document.cookie.match(/(?:^|;\s*)theme=(dark|light)/);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const useDark = match?.[1] === 'dark' || (!match && prefersDark);
    if (useDark) {
        document.documentElement.classList.add('dark');
    }
}
