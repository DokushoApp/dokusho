import { useEffect, useCallback } from 'react';
import { useAtom } from 'jotai';
import { settingsAtom, isLoadingAtom, saveSettingsAtom, loadSettingsAtom } from '@/store/settings.js';

const SettingsInitializer = () => {
  const [, saveSettings] = useAtom(saveSettingsAtom);
  const [, loadSettings] = useAtom(loadSettingsAtom);
  const [settings] = useAtom(settingsAtom);
  const [isLoading] = useAtom(isLoadingAtom);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Apply theme based on settings and system preference
  const applyTheme = useCallback((themeValue) => {
    const root = window.document.documentElement;

    // Remove existing theme classes
    root.classList.remove('light', 'dark');

    // Apply theme based on setting
    if (themeValue === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(themeValue);
    }
  }, []);

  // Apply theme when settings change
  useEffect(() => {
    if (!isLoading && settings) {
      applyTheme(settings.theme);
    }
  }, [settings, isLoading, applyTheme]);

  // Listen for system theme changes
  useEffect(() => {
    if (settings && settings.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

      const handleChange = () => {
        const systemTheme = mediaQuery.matches ? 'dark' : 'light';
        const root = window.document.documentElement;

        root.classList.remove('light', 'dark');
        root.classList.add(systemTheme);
      };

      mediaQuery.addEventListener('change', handleChange);

      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [settings]);

  return null;
};

export default SettingsInitializer;