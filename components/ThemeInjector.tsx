
import React from 'react';
import { useAppConfig } from '../context/AppConfigContext';

export const ThemeInjector: React.FC = () => {
  const { config } = useAppConfig();
  const theme = config.theme;

  return (
    <style dangerouslySetInnerHTML={{
      __html: `
        :root {
          --color-primary: ${theme.primaryColor};
          --color-primary-light: ${theme.primaryLightColor};
          --color-bg: ${theme.backgroundColor};
          --color-accent: ${theme.accentColor};
          --color-success: ${theme.successColor};
        }

        .dark {
          --color-bg: #111827;
          /* You can potentially add more dark overrides here if needed */
        }
      `
    }} />
  );
};
