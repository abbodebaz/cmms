import { useContext } from 'react';
import { alpha, IconButton, styled, Tooltip, useTheme } from '@mui/material';
import DarkModeTwoToneIcon from '@mui/icons-material/DarkModeTwoTone';
import LightModeTwoToneIcon from '@mui/icons-material/LightModeTwoTone';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from 'src/theme/ThemeProvider';

export const LIGHT_THEME_NAME = 'PureLightTheme';
export const DARK_THEME_NAME = 'GoldDarkTheme';

const IconButtonWrapper = styled(IconButton)(
  ({ theme }) => `
  width: ${theme.spacing(4)};
  height: ${theme.spacing(4)};
  border-radius: ${theme.general.borderRadiusLg};
  margin-right: ${theme.spacing(1)};
`
);

function HeaderThemeToggle() {
  const { t }: { t: any } = useTranslation();
  const theme = useTheme();
  const setThemeName = useContext(ThemeContext);
  const isDark = theme.palette.mode === 'dark';

  return (
    <Tooltip arrow title={isDark ? t('light_mode') : t('dark_mode')}>
      <IconButtonWrapper
        aria-label={isDark ? t('light_mode') : t('dark_mode')}
        color="primary"
        onClick={() =>
          setThemeName(isDark ? LIGHT_THEME_NAME : DARK_THEME_NAME)
        }
        sx={{
          background: alpha(theme.colors.primary.main, 0.1),
          transition: `${theme.transitions.create(['background'])}`,
          color: theme.colors.primary.main,
          '&:hover': {
            background: alpha(theme.colors.primary.main, 0.2)
          }
        }}
      >
        {isDark ? (
          <LightModeTwoToneIcon fontSize="small" />
        ) : (
          <DarkModeTwoToneIcon fontSize="small" />
        )}
      </IconButtonWrapper>
    </Tooltip>
  );
}

export default HeaderThemeToggle;
