import { useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Box, ButtonBase, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import TuneTwoToneIcon from '@mui/icons-material/TuneTwoTone';
import WidgetsTwoToneIcon from '@mui/icons-material/WidgetsTwoTone';
import AdminPanelSettingsTwoToneIcon from '@mui/icons-material/AdminPanelSettingsTwoTone';
import ChecklistTwoToneIcon from '@mui/icons-material/FactCheckTwoTone';
import HubTwoToneIcon from '@mui/icons-material/HubTwoTone';
import SettingsTwoToneIcon from '@mui/icons-material/SettingsTwoTone';
import { TitleContext } from '../../../contexts/TitleContext';
import useAuth from '../../../hooks/useAuth';
import { PermissionEntity } from '../../../models/owns/role';
import PermissionErrorMessage from '../components/PermissionErrorMessage';
import PageHeading from './components/PageHeading';

function SettingsLayout() {
  const { t }: { t: any } = useTranslation();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const primary = theme.palette.primary.main;

  const tabs = [
    {
      value: '',
      label: t('general_settings'),
      description: t('settings_nav_general_description'),
      icon: <TuneTwoToneIcon />
    },
    {
      value: 'features',
      label: t('features'),
      description: t('settings_nav_features_description'),
      icon: <WidgetsTwoToneIcon />
    },
    {
      value: 'roles',
      label: t('roles'),
      description: t('settings_nav_roles_description'),
      icon: <AdminPanelSettingsTwoToneIcon />
    },
    {
      value: 'checklists',
      label: t('checklists'),
      description: t('settings_nav_checklists_description'),
      icon: <ChecklistTwoToneIcon />
    },
    {
      value: 'integrations',
      label: t('integrations'),
      description: t('settings_nav_integrations_description'),
      icon: <HubTwoToneIcon />
    }
  ];

  // Determine the current tab index based on the URL path
  const getCurrentTabIndex = () => {
    return (
      tabs.length -
      1 -
      [...tabs]
        .reverse()
        .findIndex((tab) => location.pathname.includes('/' + tab.value))
    );
  };

  const { setTitle } = useContext(TitleContext);

  useEffect(() => {
    setTitle(t('settings'));
  }, []);

  const currentIndex = getCurrentTabIndex();

  const renderNavItem = (tab: typeof tabs[number], index: number, compact: boolean) => {
    const selected = index === currentIndex;
    return (
      <ButtonBase
        key={tab.value}
        onClick={() => navigate(`/app/settings/${tab.value}`)}
        aria-current={selected ? 'page' : undefined}
        sx={{
          flexShrink: 0,
          width: compact ? 'auto' : '100%',
          justifyContent: 'flex-start',
          textAlign: 'start',
          gap: 1.25,
          px: compact ? 1.75 : 1.5,
          py: compact ? 1 : 1.25,
          borderRadius: compact ? '20px' : '12px',
          color: selected ? theme.palette.primary.dark : theme.palette.text.secondary,
          backgroundColor: selected
            ? alpha(primary, compact ? 0.14 : 0.1)
            : compact
            ? alpha(primary, 0.04)
            : 'transparent',
          border: compact
            ? `1px solid ${alpha(primary, selected ? 0.3 : 0.12)}`
            : '1px solid transparent',
          transition: theme.transitions.create(['background-color', 'color']),
          '&:hover': {
            backgroundColor: alpha(primary, selected ? 0.14 : 0.07),
            color: theme.palette.primary.dark
          },
          '&.Mui-focusVisible': {
            outline: `2px solid ${alpha(primary, 0.5)}`,
            outlineOffset: 1
          },
          '& .MuiSvgIcon-root': {
            fontSize: compact ? 18 : 20,
            color: selected ? primary : alpha(theme.palette.text.secondary, 0.9)
          }
        }}
      >
        {!compact && (
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: '10px',
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
              backgroundColor: selected
                ? alpha(primary, 0.16)
                : alpha(theme.palette.text.primary, 0.04)
            }}
          >
            {tab.icon}
          </Box>
        )}
        {compact && tab.icon}
        <Box sx={{ minWidth: 0 }}>
          <Typography
            component="span"
            sx={{
              display: 'block',
              fontSize: theme.typography.pxToRem(compact ? 13.5 : 14),
              fontWeight: selected ? 700 : 600,
              color: 'inherit',
              whiteSpace: 'nowrap'
            }}
          >
            {tab.label}
          </Typography>
          {!compact && (
            <Typography
              component="span"
              sx={{
                display: 'block',
                fontSize: theme.typography.pxToRem(12),
                color: theme.palette.text.secondary,
                lineHeight: 1.4,
                mt: 0.25
              }}
            >
              {tab.description}
            </Typography>
          )}
        </Box>
      </ButtonBase>
    );
  };

  return user.role.viewPermissions.includes(PermissionEntity.SETTINGS) ? (
    <Box sx={{ px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 } }}>
      <Helmet>
        <title>{t('settings')}</title>
      </Helmet>
      <PageHeading
        title={t('settings')}
        description={t('settings_page_description')}
        icon={<SettingsTwoToneIcon />}
      />
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'flex-start',
          gap: { xs: 2, md: 3 }
        }}
      >
        {/* Desktop: vertical side nav */}
        <Box
          component="nav"
          aria-label={t('settings')}
          sx={{
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            gap: 0.5,
            width: 264,
            flexShrink: 0,
            position: 'sticky',
            top: theme.spacing(10),
            p: 1,
            borderRadius: '14px',
            border: `1px solid ${alpha(primary, 0.14)}`,
            backgroundColor: theme.palette.background.paper,
            boxShadow: `0 6px 18px ${alpha(primary, 0.05)}`
          }}
        >
          {tabs.map((tab, index) => renderNavItem(tab, index, false))}
        </Box>
        {/* Mobile / tablet: horizontal pill nav */}
        <Box
          component="nav"
          aria-label={t('settings')}
          sx={{
            display: { xs: 'flex', md: 'none' },
            width: '100%',
            gap: 1,
            overflowX: 'auto',
            pb: 0.5,
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' }
          }}
        >
          {tabs.map((tab, index) => renderNavItem(tab, index, true))}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0, width: '100%' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  ) : (
    <PermissionErrorMessage message={'no_access_settings'} />
  );
}

export default SettingsLayout;
