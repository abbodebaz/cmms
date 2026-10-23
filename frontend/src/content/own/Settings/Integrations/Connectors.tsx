import { Box, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import LeakAddIcon from '@mui/icons-material/LeakAdd';
import SettingsSection from '../components/SettingsSection';

function Connectors() {
  const { t }: { t: any } = useTranslation();
  const theme = useTheme();

  return (
    <SettingsSection
      title="connectors"
      description="settings_connectors_description"
      icon={<LeakAddIcon fontSize="small" />}
    >
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        py={6}
      >
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: '16px',
            display: 'grid',
            placeItems: 'center',
            mb: 2,
            color: theme.palette.primary.main,
            backgroundColor: alpha(theme.palette.primary.main, 0.1)
          }}
        >
          <LeakAddIcon />
        </Box>
        <Typography sx={{ fontWeight: 700, fontSize: theme.typography.pxToRem(16) }}>
          {t('connectors')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {t('settings_coming_soon')}
        </Typography>
      </Box>
    </SettingsSection>
  );
}

export default Connectors;
