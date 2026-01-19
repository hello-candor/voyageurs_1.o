
import React, { useEffect } from 'react';
import { useAppConfig } from '../context/AppConfigContext';
import { useTheme } from '../context/ThemeContext';

export const ThemeInjector: React.FC = () => {
  const { config } = useAppConfig();
  const hostTheme = config.theme; 
  const { theme: userTheme } = useTheme(); 

  useEffect(() => {
    if (!hostTheme) return;
    const isDark = userTheme === 'dark';
    const root = document.documentElement;

    const metaThemeColor = document.querySelector('meta[name="theme-color"]');

    if (isDark) {
        // DARK MODE: High contrast against deep backgrounds
        // Primary text/accents should be light but not pure white to maintain "blue" identity
        root.style.setProperty('--color-primary', '#CBD5E1'); // Slate 300
        root.style.setProperty('--color-primary-light', '#334155'); // Slate 700
        root.style.setProperty('--color-bg', '#030712'); // Slate 950 (Rich Black)
        root.style.setProperty('--color-accent', '#C25E3E'); // Darker Rich Terracotta
        root.style.setProperty('--color-success', '#BEF264'); // Lime 300 (Olive equivalent)
        
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', '#030712');
        }
    } else {
        // LIGHT MODE: Host defined branding
        root.style.setProperty('--color-primary', hostTheme.primaryColor);
        root.style.setProperty('--color-primary-light', hostTheme.primaryLightColor);
        root.style.setProperty('--color-bg', hostTheme.backgroundColor);
        root.style.setProperty('--color-accent', hostTheme.accentColor);
        root.style.setProperty('--color-success', hostTheme.successColor);

        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', hostTheme.primaryColor);
        }
    }

  }, [hostTheme, userTheme]);

  return null;
};
