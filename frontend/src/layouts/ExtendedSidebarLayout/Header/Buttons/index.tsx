import { Box } from '@mui/material';
import HeaderNotifications from './Notifications';
import HeaderThemeToggle from './ThemeToggle';

function HeaderButtons() {
  return (
    <Box display="flex" alignItems="center">
      <HeaderThemeToggle />
      <HeaderNotifications />
      {/*<LanguageSwitcher />*/}
      {/*<Chat />*/}
    </Box>
  );
}

export default HeaderButtons;
