import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { loadSettingsAtom, settingsAtom, isLoadingAtom } from '@/store/settings.js';

const SettingsInitializer = () => {
  const [, loadSettings] = useAtom(loadSettingsAtom);
  const [settings] = useAtom(settingsAtom);
  const [isLoading] = useAtom(isLoadingAtom);

  // Load settings on component mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Apply theme when settings change
  useEffect(() => {
    if (!isLoading) {
      const { theme } = settings;
      const root = window.document.documentElement;

      // Remove existing theme classes
      root.classList.remove('light', 'dark');

      // Apply theme based on setting
      if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        root.classList.add(systemTheme);
      } else {
        root.classList.add(theme);
      }
    }
  }, [settings, isLoading]);

  return null;
};

export default SettingsInitializer;