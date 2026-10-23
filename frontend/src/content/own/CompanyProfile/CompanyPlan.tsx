import {
  alpha,
  Avatar,
  Box,
  Button,
  Card,
  CircularProgress,
  Typography,
  useTheme
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { SubscriptionPlan } from '../../../models/owns/subscriptionPlan';
import CardMembershipTwoToneIcon from '@mui/icons-material/CardMembershipTwoTone';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';
import i18n from 'i18next';
import { useContext, useEffect, useState } from 'react';
import mailToLink from 'mailto-link';
import { CompanySettingsContext } from '../../../contexts/CompanySettingsContext';
import { homeUrl, isCloudVersion } from '../../../config';
import { getLicenseValidity } from '../../../slices/license';
import { useDispatch, useSelector } from 'src/store';
import subscriptionPlan from '../../../slices/subscriptionPlan';
import { getLocalizedHomeUrl } from '../../../utils/urlPaths';
import api from '../../../utils/api';

interface CompanyPlanProps {
  plan: SubscriptionPlan;
}

function CompanyPlan(props: CompanyPlanProps) {
  const { plan } = props;
  const { company, user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const getLanguage = i18n.language;
  const [loadingBilling, setLoadingBilling] = useState<boolean>(false);
  const { state: licensingState } = useSelector((state) => state.license);
  const expiryDate = isCloudVersion
    ? company.subscription.endsOn
    : licensingState.expirationDate;

  useEffect(() => {
    dispatch(getLicenseValidity());
  }, []);

  const goToPaddleBilling = () => {
    setLoadingBilling(true);
    api
      .get<{ message: string }>('paddle/customer-portal')
      .then(({ message }) => window.open(message, '_blank'))
      .finally(() => setLoadingBilling(false));
  };

  const onGold = theme.palette.primary.contrastText;
  return (
    <Card
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '14px',
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        color: onGold,
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'flex-start', sm: 'center' },
        gap: { xs: 2, sm: 3 },
        px: { xs: 2.5, md: 3.5 },
        py: { xs: 3, md: 3.5 },
        mb: 2,
        boxShadow: `0 10px 28px ${alpha(theme.palette.primary.main, 0.3)}`,
        '&::after': {
          content: '""',
          position: 'absolute',
          width: 220,
          height: 220,
          borderRadius: '50%',
          top: -90,
          insetInlineEnd: -60,
          background: alpha(onGold, 0.08),
          pointerEvents: 'none'
        }
      }}
    >
      <Avatar
        sx={{
          width: 56,
          height: 56,
          flexShrink: 0,
          borderRadius: '16px',
          color: theme.palette.primary.main,
          background: alpha(onGold, 0.92)
        }}
      >
        <CardMembershipTwoToneIcon
          sx={{
            fontSize: `${theme.typography.pxToRem(28)}`
          }}
        />
      </Avatar>
      <Box sx={{ position: 'relative', zIndex: 1, minWidth: 0 }}>
        <Typography
          sx={{
            pb: 0.75,
            fontWeight: 700,
            fontSize: theme.typography.pxToRem(20),
            color: onGold
          }}
        >
          {t('upgrade_plan')}
        </Typography>
        <Typography
          sx={{
            lineHeight: 1.8,
            fontSize: theme.typography.pxToRem(13.5),
            color: alpha(onGold, 0.85)
          }}
        >
          {t('you_are_using_plan', {
            planName: isCloudVersion
              ? plan.name
              : licensingState.planName ?? 'Free',
            expiration: expiryDate
              ? new Date(expiryDate).toLocaleString(
                  getLanguage === 'fr' ? 'fr-FR' : 'en-GB'
                )
              : ''
          })}
          {company.subscription.scheduledChangeDate &&
          company.subscription.scheduledChangeType === 'RESET_TO_FREE'
            ? ` ${t('subscription_will_cancel_on', {
                date: new Date(
                  company.subscription.scheduledChangeDate
                ).toLocaleDateString(getLanguage === 'fr' ? 'fr-FR' : 'en-GB')
              })}`
            : ''}
        </Typography>
        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Button
            variant="contained"
            sx={{
              borderRadius: '12px',
              fontWeight: 700,
              color: theme.palette.primary.dark,
              backgroundColor: onGold,
              boxShadow: 'none',
              '&:hover': { backgroundColor: alpha(onGold, 0.9) }
            }}
            component={isCloudVersion ? RouterLink : 'a'}
            {...(isCloudVersion
              ? { to: '/app/subscription/plans' }
              : {
                  href: getLocalizedHomeUrl(
                    'pricing?type=selfhosted',
                    i18n.language
                  ),
                  target: '_blank',
                  rel: 'noopener noreferrer'
                })}
          >
            {t('upgrade_now')}
          </Button>
          {isCloudVersion && (
            <Button
              onClick={() => {
                window.location.href = getLocalizedHomeUrl(
                  'pricing',
                  i18n.language
                );
              }}
              variant="outlined"
              sx={{
                borderRadius: '12px',
                fontWeight: 600,
                color: onGold,
                borderColor: alpha(onGold, 0.5),
                '&:hover': {
                  borderColor: onGold,
                  backgroundColor: alpha(onGold, 0.08)
                }
              }}
            >
              {t('learn_more')}
            </Button>
          )}
          {isCloudVersion && company.subscription.activated && (
            <Button
              disabled={loadingBilling}
              startIcon={
                loadingBilling ? (
                  <CircularProgress size={'1rem'} sx={{ color: onGold }} />
                ) : null
              }
              variant={'outlined'}
              onClick={goToPaddleBilling}
              sx={{
                borderRadius: '12px',
                fontWeight: 600,
                color: onGold,
                borderColor: alpha(onGold, 0.5),
                '&:hover': {
                  borderColor: onGold,
                  backgroundColor: alpha(onGold, 0.08)
                }
              }}
            >
              {t('go_to_billing')}
            </Button>
          )}
        </Box>
      </Box>
    </Card>
  );
}

export default CompanyPlan;
