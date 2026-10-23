import { Theme } from '@mui/material';

/**
 * Brand chart palette: gold primary + warm complementary series colors.
 * The charcoal series is swapped for a light warm tone in dark mode so it stays visible.
 */
export const getChartPalette = (theme: Theme): string[] => {
  const dark = theme.palette.mode === 'dark';
  return [
    '#977537',
    '#C8A86A',
    dark ? '#E6D3A8' : '#2A2620',
    '#7A7262',
    '#57CA22',
    '#FFA319',
    '#B8925A',
    '#5E4A26',
    '#A89F8C',
    '#D9C29A'
  ];
};

/** Color used for overlay lines (e.g. averages) on top of gold bars. */
export const getChartLineColor = (theme: Theme): string =>
  theme.palette.mode === 'dark' ? '#E6D3A8' : '#2A2620';

/** Returns a function that yields palette colors in order (deterministic across renders). */
export const createColorSequence = (theme: Theme) => {
  const palette = getChartPalette(theme);
  let index = 0;
  return () => palette[index++ % palette.length];
};
