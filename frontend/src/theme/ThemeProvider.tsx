import React, { useEffect, useMemo, useState } from 'react';
import { createTheme, ThemeProvider } from '@mui/material';
import { arEG } from '@mui/material/locale';
import { arSD } from '@mui/x-data-grid';
import { themeCreator } from './base';
import { StylesProvider } from '@mui/styles';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import stylisRTLPlugin from 'stylis-plugin-rtl';
import { useTranslation } from 'react-i18next';

const isPrerender =
  typeof navigator !== 'undefined' &&
  navigator.userAgent.toLowerCase().indexOf('prerender') !== -1;

const cacheRtl = createCache({
  key: 'bloom-ui-rtl',
  prepend: true,
  speedy: !isPrerender,
  // @ts-ignore
  stylisPlugins: [stylisRTLPlugin]
});

const cacheLtr = createCache({
  key: 'bloom-ui-ltr',
  prepend: true,
  speedy: !isPrerender
});

export const ThemeContext = React.createContext(
  (themeName: string): void => {}
);

const ThemeProviderWrapper: React.FC = (props) => {
  const curThemeName = localStorage.getItem('appTheme') || 'PureLightTheme';
  const [themeName, _setThemeName] = useState(curThemeName);
  const { i18n } = useTranslation();
  const rtl = i18n.dir() === 'rtl';
  const isArabic = (i18n.language || '').toLowerCase().startsWith('ar');
  // Built-in MUI / DataGrid strings (pagination, column menu, filters…) in Arabic
  const theme = useMemo(() => {
    const baseTheme = themeCreator(themeName);
    const direction = rtl ? 'rtl' : 'ltr';
    // Theme schemes read i18n.dir() once at import; keep it in sync on language switch
    const themed =
      baseTheme.direction === direction
        ? baseTheme
        : createTheme(baseTheme, { direction });
    return isArabic ? createTheme(themed, arEG, arSD) : themed;
  }, [themeName, isArabic, rtl]);
  const setThemeName = (themeName: string): void => {
    localStorage.setItem('appTheme', themeName);
    _setThemeName(themeName);
  };

  useEffect(() => {
    if (rtl) document.documentElement.setAttribute('dir', 'rtl');
    else document.documentElement.removeAttribute('dir');
  }, [rtl]);

  const providers = (
    <ThemeContext.Provider value={setThemeName}>
      <ThemeProvider theme={theme}>{props.children}</ThemeProvider>
    </ThemeContext.Provider>
  );
  return (
    <StylesProvider injectFirst>
      <CacheProvider value={rtl ? cacheRtl : cacheLtr}>
        {providers}
      </CacheProvider>
    </StylesProvider>
  );
};

export default ThemeProviderWrapper;
