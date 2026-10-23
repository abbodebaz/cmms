import {
  Box,
  Button,
  Grid,
  Stack,
  Switch,
  Typography,
  useTheme
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import WidgetsTwoToneIcon from '@mui/icons-material/WidgetsTwoTone';
import SettingsSection from '../components/SettingsSection';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  AccountTree,
  Assignment,
  Build,
  Business,
  ElectricalServices,
  Engineering,
  EngineeringTwoTone,
  GroupsTwoTone,
  Inventory,
  LocationOn,
  Settings,
  WebAssetTwoTone
} from '@mui/icons-material';
import useAuth from '../../../../hooks/useAuth';
import { Formik } from 'formik';
import { UiConfiguration } from '../../../../models/owns/uiConfiguration';
import AssignmentTwoToneIcon from '@mui/icons-material/AssignmentTwoTone';
import MoveToInboxTwoToneIcon from '@mui/icons-material/MoveToInboxTwoTone';
import Inventory2TwoToneIcon from '@mui/icons-material/Inventory2TwoTone';
import LocationOnTwoToneIcon from '@mui/icons-material/LocationOnTwoTone';
import HandymanTwoToneIcon from '@mui/icons-material/HandymanTwoTone';
import SpeedTwoToneIcon from '@mui/icons-material/SpeedTwoTone';
import AccountTreeTwoToneIcon from '@mui/icons-material/AccountTreeTwoTone';
import { useContext, useEffect } from 'react';
import { TitleContext } from '../../../../contexts/TitleContext';
import BusinessTwoToneIcon from '@mui/icons-material/BusinessTwoTone';

interface FeatureModule {
  id: string;
  icon: React.ElementType;
  titleKey: string;
  descriptionKey: string;
  preferencesPath: string;
  preferencesTitleKey?: string;
  toggleKey?: keyof Omit<UiConfiguration, 'id'>;
}

function FeaturesSettings() {
  const { t }: { t: any } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const {
    companySettings,
    patchGeneralPreferences,
    patchUiConfiguration,
    user
  } = useAuth();
  const { setTitle } = useContext(TitleContext);
  const { generalPreferences } = companySettings;
  const { uiConfiguration } = user;

  const featureModules: FeatureModule[] = [
    {
      id: 'work-orders',
      icon: AssignmentTwoToneIcon,
      titleKey: 'work_orders',
      descriptionKey: 'work_orders_settings_description',
      preferencesPath: '/app/settings/features/work-order'
    },
    {
      id: 'requests',
      icon: MoveToInboxTwoToneIcon,
      titleKey: 'requests',
      descriptionKey: 'requests_settings_description',
      preferencesPath: '/app/settings/features/request',
      toggleKey: 'requests'
    },
    {
      id: 'assets',
      icon: Inventory2TwoToneIcon,
      titleKey: 'assets',
      descriptionKey: 'assets_settings_description',
      preferencesPath: '/app/settings/features/asset'
    },
    {
      id: 'locations',
      icon: LocationOnTwoToneIcon,
      titleKey: 'locations',
      descriptionKey: 'locations_settings_description',
      preferencesPath: '/app/settings/features/location',
      toggleKey: 'locations'
    },
    {
      id: 'request-portals',
      icon: WebAssetTwoTone,
      titleKey: 'request_portals',
      preferencesTitleKey: 'go_to_request_portals',
      descriptionKey: 'request_portals_settings_description',
      preferencesPath: '/app/settings/features/request-portals'
    },
    {
      id: 'parts-inventory',
      icon: HandymanTwoToneIcon,
      titleKey: 'parts_inventory',
      descriptionKey: 'parts_inventory_settings_description',
      preferencesPath: '/app/settings/features/parts'
    },
    {
      id: 'meters',
      icon: SpeedTwoToneIcon,
      titleKey: 'meters',
      descriptionKey: 'meters_settings_description',
      preferencesPath: '/app/settings/features/meters',
      toggleKey: 'meters'
    },
    {
      id: 'contractors',
      icon: EngineeringTwoTone,
      titleKey: 'customers',
      descriptionKey: 'customers_settings_description',
      preferencesPath: '/app/settings/features/contractors',
      toggleKey: 'vendorsAndCustomers'
    },
    {
      id: 'vendors',
      icon: BusinessTwoToneIcon,
      titleKey: 'vendors',
      descriptionKey: 'vendors_settings_description',
      preferencesPath: '/app/settings/features/vendors',
      toggleKey: 'vendorsAndCustomers'
    },
    {
      id: 'workflows',
      icon: AccountTreeTwoToneIcon,
      titleKey: 'workflows',
      descriptionKey: 'workflows_settings_description',
      preferencesPath: '/app/settings/features/workflows'
    }
  ];

  useEffect(() => {
    setTitle(t('features'));
  }, []);

  const handleToggleChange = (
    feature: FeatureModule,
    currentValue: boolean
  ) => {
    if (feature.toggleKey) {
      patchUiConfiguration({
        ...uiConfiguration!,
        [feature.toggleKey]: !currentValue
      });
    }
  };

  const getToggleValue = (feature: FeatureModule): boolean => {
    if (feature.toggleKey) {
      return uiConfiguration?.[feature.toggleKey] || false;
    }
    return false;
  };

  const handleSetPreferences = (path: string) => {
    navigate(path);
  };

  return (
    <Formik initialValues={{}} onSubmit={() => {}}>
      {() => (
        <form>
          <SettingsSection
            title="features"
            description="settings_features_description"
            icon={<WidgetsTwoToneIcon fontSize="small" />}
          >
            <Grid container spacing={2}>
              {featureModules.map((feature) => {
                const IconComponent = feature.icon;
                const enabled = !feature.toggleKey || getToggleValue(feature);

                return (
                  <Grid item xs={12} lg={6} key={feature.id}>
                    <Box
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                        p: 2,
                        borderRadius: '12px',
                        border: `1px solid ${alpha(
                          theme.palette.primary.main,
                          enabled ? 0.16 : 0.08
                        )}`,
                        backgroundColor: enabled
                          ? theme.palette.background.paper
                          : alpha(theme.palette.text.primary, 0.02),
                        transition: theme.transitions.create([
                          'border-color',
                          'box-shadow'
                        ]),
                        '&:hover': {
                          borderColor: alpha(theme.palette.primary.main, 0.3),
                          boxShadow: `0 6px 16px ${alpha(
                            theme.palette.primary.main,
                            0.08
                          )}`
                        }
                      }}
                    >
                      <Stack direction="row" spacing={1.5} alignItems="flex-start">
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '12px',
                            display: 'grid',
                            placeItems: 'center',
                            flexShrink: 0,
                            color: enabled
                              ? theme.palette.primary.main
                              : theme.palette.text.secondary,
                            backgroundColor: alpha(
                              theme.palette.primary.main,
                              enabled ? 0.1 : 0.05
                            )
                          }}
                        >
                          <IconComponent />
                        </Box>
                        <Box flex={1} minWidth={0}>
                          <Typography
                            sx={{
                              fontWeight: 700,
                              fontSize: theme.typography.pxToRem(14.5),
                              color: theme.palette.text.primary
                            }}
                          >
                            {t(feature.titleKey)}
                          </Typography>
                          <Typography
                            sx={{
                              mt: 0.25,
                              fontSize: theme.typography.pxToRem(12.5),
                              color: theme.palette.text.secondary,
                              lineHeight: 1.5
                            }}
                          >
                            {t(feature.descriptionKey)}
                          </Typography>
                        </Box>
                        {feature.toggleKey && (
                          <Switch
                            checked={getToggleValue(feature)}
                            name={feature.toggleKey}
                            onChange={() => {
                              handleToggleChange(
                                feature,
                                getToggleValue(feature)
                              );
                            }}
                            inputProps={{
                              'aria-label': `${t(feature.titleKey)} - ${
                                getToggleValue(feature)
                                  ? t('enabled')
                                  : t('disabled')
                              }`
                            }}
                            sx={{ mt: -0.5, flexShrink: 0 }}
                          />
                        )}
                      </Stack>
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        spacing={1}
                        sx={{ mt: 'auto' }}
                      >
                        {feature.toggleKey ? (
                          <Typography
                            sx={{
                              fontSize: theme.typography.pxToRem(12),
                              fontWeight: 600,
                              px: 1.25,
                              py: 0.4,
                              borderRadius: '20px',
                              color: getToggleValue(feature)
                                ? theme.palette.success.main
                                : theme.palette.text.secondary,
                              backgroundColor: getToggleValue(feature)
                                ? alpha(theme.palette.success.main, 0.1)
                                : alpha(theme.palette.text.primary, 0.05)
                            }}
                          >
                            {getToggleValue(feature)
                              ? t('enabled')
                              : t('disabled')}
                          </Typography>
                        ) : (
                          <span />
                        )}
                        <Button
                          variant="outlined"
                          size="small"
                          disabled={
                            feature.toggleKey && !getToggleValue(feature)
                          }
                          onClick={() =>
                            handleSetPreferences(feature.preferencesPath)
                          }
                          startIcon={<Settings fontSize="small" />}
                          sx={{
                            borderRadius: '10px',
                            fontWeight: 600,
                            borderColor: alpha(theme.palette.primary.main, 0.35)
                          }}
                        >
                          {t(feature.preferencesTitleKey ?? 'set_preferences')}
                        </Button>
                      </Stack>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </SettingsSection>
        </form>
      )}
    </Formik>
  );
}

export default FeaturesSettings;
