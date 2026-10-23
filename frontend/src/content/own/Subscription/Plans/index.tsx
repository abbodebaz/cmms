import { Helmet } from 'react-helmet-async';
import PersonTwoToneIcon from '@mui/icons-material/PersonTwoTone';
import { randomInt } from '../../../../utils/generators';
import {
  Box,
  Button,
  Card,
  CircularProgress,
  FormControlLabel,
  Grid,
  Link,
  Radio,
  RadioGroup,
  Slider,
  Stack,
  Typography,
  useTheme
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import WorkspacePremiumTwoToneIcon from '@mui/icons-material/WorkspacePremiumTwoTone';
import GroupsTwoToneIcon from '@mui/icons-material/GroupsTwoTone';
import EventRepeatTwoToneIcon from '@mui/icons-material/EventRepeatTwoTone';
import FactCheckTwoToneIcon from '@mui/icons-material/FactCheckTwoTone';
import ReceiptLongTwoToneIcon from '@mui/icons-material/ReceiptLongTwoTone';
import SectionCard from '../../components/SectionCard';
import PageHeading from '../../Settings/components/PageHeading';
import { Trans, useTranslation } from 'react-i18next';
import { useContext, useEffect, useRef, useState } from 'react';
import PlanFeatures from './PlanFeatures';
import { TitleContext } from '../../../../contexts/TitleContext';
import { useDispatch, useSelector } from '../../../../store';
import { getSubscriptionPlans } from '../../../../slices/subscriptionPlan';
import useAuth from '../../../../hooks/useAuth';
import PermissionErrorMessage from '../../components/PermissionErrorMessage';
import { CustomSnackBarContext } from '../../../../contexts/CustomSnackBarContext';
import { SubscriptionPlan } from '../../../../models/owns/subscriptionPlan';
import { useNavigate } from 'react-router-dom';
import { CompanySettingsContext } from '../../../../contexts/CompanySettingsContext';
import api from '../../../../utils/api';
import { useBrand } from '../../../../hooks/useBrand';
import { fireGa4Event } from '../../../../utils/overall';
import { initializePaddle, Paddle } from '@paddle/paddle-js';
import {
  homeUrl,
  isCloudVersion,
  PADDLE_SECRET_TOKEN,
  paddleEnvironment
} from '../../../../config';
import { getLocalizedHomeUrl } from '../../../../utils/urlPaths';

function SubscriptionPlans() {
  const { t, i18n } = useTranslation();
  const { company, user, patchSubscription } = useAuth();
  const brandConfig = useBrand();
  const subscription = company.subscription;
  const theme = useTheme();
  const [usersCount, setUsersCount] = useState<number>(
    company.subscription.usersCount > 150 ? 10 : company.subscription.usersCount
  );
  const [period, setPeriod] = useState<'monthly' | 'annually'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<string>('STARTER');
  const [selectedPlanObject, setSelectedPlanObject] =
    useState<SubscriptionPlan>();
  const { subscriptionPlans } = useSelector((state) => state.subscriptionPlans);
  const { setTitle } = useContext(TitleContext);
  const { showSnackBar } = useContext(CustomSnackBarContext);
  const [submitting, setSubmitting] = useState(false);
  const checkoutComplete = useRef<boolean>(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  let paddle = useRef<Paddle | null>(null);

  useEffect(() => {
    const initPaddle = async () => {
      paddle.current = await initializePaddle({
        token: PADDLE_SECRET_TOKEN,
        eventCallback: function (data) {
          if (data.name == 'checkout.completed') {
            checkoutComplete.current = true;
            fireGa4Event('checkout_completed');
          } else if (
            data.name == 'checkout.closed' &&
            checkoutComplete.current
          ) {
            patchSubscription({
              id: randomInt(),
              usersCount,
              monthly: period === 'monthly',
              subscriptionPlan: selectedPlanObject,
              activated: true
            }).then(onSubcriptionPatchSuccess);
          }
        }
      });
      paddle.current.Environment.set(paddleEnvironment);
    };
    initPaddle();
  }, [usersCount, period, selectedPlanObject?.code]);

  useEffect(() => {
    setTitle(t('plans'));
    if (user.ownsCompany) {
      dispatch(getSubscriptionPlans());
      setPeriod(company.subscription.monthly ? 'monthly' : 'annually');
    }
  }, []);
  useEffect(() => {
    if (subscriptionPlans.length) {
      setSelectedPlan(company.subscription.subscriptionPlan.code);
    }
  }, [subscriptionPlans]);

  const buyProduct = async () => {
    if (company.demo) {
      showSnackBar('Create a real account to upgrade', 'error');
      return;
    }
    fireGa4Event('checkout_started');
    setSubmitting(true);

    const alreadySubscribed = company.subscription.activated;

    let path = selectedPlanObject.code.toLowerCase();
    path = `${path}-${period === 'monthly' ? 'monthly' : 'yearly'}`;

    try {
      if (alreadySubscribed) {
        const { success } = await api.patch<{ success: boolean }>(
          'paddle/subscription',
          {
            planId: path,
            quantity: usersCount
          }
        );
        if (success) {
          patchSubscription({
            id: randomInt(),
            usersCount,
            monthly: period === 'monthly',
            subscriptionPlan: selectedPlanObject,
            activated: true
          }).then(onSubcriptionPatchSuccess);
        } else {
          showSnackBar(t("The Subscription couldn't be changed"), 'error');
        }
      } else {
        // New checkout session
        const data = await api.post<{ sessionId: string }>(
          'paddle/create-checkout-session',
          {
            planId: path,
            userId: user.id,
            quantity: usersCount
          }
        );

        if (data.sessionId) {
          paddle.current.Checkout.open({
            transactionId: data.sessionId,
            customer: {
              email: user.email.trim().toLowerCase()
            }
          });
        }
      }
    } catch (error) {
      console.error('Failed to update subscription:', error);
      showSnackBar(t("The Subscription couldn't be changed"), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const periods = [
    { name: t('monthly'), value: 'monthly' },
    { name: t('annually'), value: 'annually' }
  ];

  useEffect(() => {
    setSelectedPlanObject(
      subscriptionPlans.find((plan) => plan.code == selectedPlan)
    );
  }, [selectedPlan, subscriptionPlans]);

  const isChangingSubscription = company.subscription.activated;
  const currentPeriodLabel = subscription.monthly
    ? t('monthly')
    : t('annually');

  const getCost = () => {
    const selectedPlanData = subscriptionPlans.find(
      (plan) => plan.code == selectedPlan
    );
    return selectedPlanData
      ? selectedPlanData[
          period == 'monthly' ? 'monthlyCostPerUser' : 'yearlyCostPerUser'
        ] * usersCount
      : 0;
  };

  const onSubcriptionPatchSuccess = () => {
    showSnackBar(t('subscription_change_success'), 'success');
    navigate('/app/work-orders');
  };

  useEffect(() => {
    fireGa4Event('pricing_view');
  }, []);

  const choiceSx = (selected: boolean) => ({
    border: `1.5px solid ${
      selected
        ? theme.palette.primary.main
        : alpha(theme.palette.text.primary, 0.14)
    }`,
    borderRadius: '12px',
    m: 0,
    width: '100%',
    p: 1.5,
    pr: 2,
    alignItems: 'center',
    transition: theme.transitions.create([
      'border-color',
      'background-color',
      'box-shadow'
    ]),
    backgroundColor: selected
      ? alpha(theme.palette.primary.main, 0.07)
      : theme.palette.background.paper,
    boxShadow: selected
      ? `0 0 0 4px ${alpha(theme.palette.primary.main, 0.1)}`
      : 'none',
    '&:hover': {
      borderColor: alpha(theme.palette.primary.main, 0.5)
    }
  });

  const summaryRows = [
    {
      key: 'plan',
      label: t('plan'),
      value: t('change_from_to', {
        current: subscription.subscriptionPlan.name,
        next: selectedPlanObject?.name
      })
    },
    {
      key: 'users',
      label: t('users'),
      value: t('change_from_to', {
        current: subscription.usersCount,
        next: usersCount
      })
    },
    {
      key: 'billing_period',
      label: t('billing_period'),
      value: t('change_from_to', {
        current: currentPeriodLabel,
        next: period === 'monthly' ? t('monthly') : t('annually')
      })
    }
  ];

  if (user.ownsCompany)
    return (
      <>
        <Helmet>
          <title>{t('plan')}</title>
        </Helmet>
        <Box sx={{ px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 } }}>
          <PageHeading
            title={t('plans')}
            description={t('subscription_page_description')}
            icon={<WorkspacePremiumTwoToneIcon />}
            actions={
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.75,
                    px: 1.5,
                    py: 0.75,
                    borderRadius: '20px',
                    fontSize: 13,
                    fontWeight: 600,
                    color: theme.palette.primary.dark,
                    backgroundColor: alpha(theme.palette.primary.main, 0.1)
                  }}
                >
                  {t('current_plan')}
                  <Box component="span" sx={{ fontWeight: 700 }}>
                    {subscription.subscriptionPlan.name}
                  </Box>
                </Box>
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.5,
                    px: 1.5,
                    py: 0.75,
                    borderRadius: '20px',
                    fontSize: 13,
                    fontWeight: 600,
                    color: theme.palette.text.secondary,
                    backgroundColor: alpha(theme.palette.text.primary, 0.05)
                  }}
                >
                  <PersonTwoToneIcon sx={{ fontSize: 18 }} />
                  {subscription.usersCount} {t(`Users`)}
                </Box>
              </Stack>
            }
          />
          <Grid container spacing={{ xs: 2, md: 2.5 }} alignItems="flex-start">
            <Grid item xs={12} lg={8}>
              <Stack spacing={{ xs: 2, md: 2.5 }}>
                <SectionCard
                  title="subscription_users_title"
                  icon={<GroupsTwoToneIcon fontSize="small" />}
                >
                  <Typography
                    sx={{
                      fontWeight: 600,
                      fontSize: theme.typography.pxToRem(14)
                    }}
                  >
                    {t('number_users_who_will_use_grash', {
                      shortBrandName: brandConfig.shortName
                    })}
                  </Typography>
                  <Typography
                    sx={{
                      mt: 0.5,
                      fontSize: theme.typography.pxToRem(12.5),
                      color: theme.palette.text.secondary,
                      '& strong': { color: theme.palette.text.primary }
                    }}
                  >
                    <Trans
                      i18nKey={'pay_only_for_roles'}
                      components={{ italic: <i />, bold: <strong /> }}
                    />
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={2.5}
                    sx={{ mt: 2.5, px: 1 }}
                    alignItems={'center'}
                  >
                    <Slider
                      size="medium"
                      value={usersCount}
                      min={0}
                      step={1}
                      max={150}
                      onChange={(_, value) => setUsersCount(value as number)}
                      aria-label={t('users')}
                    />
                    <Box
                      sx={{
                        px: 1.5,
                        py: 0.75,
                        flexShrink: 0,
                        borderRadius: '10px',
                        fontWeight: 700,
                        fontSize: 14,
                        whiteSpace: 'nowrap',
                        color: theme.palette.primary.dark,
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
                      }}
                    >
                      {t('users_count_display', { count: usersCount })}
                    </Box>
                  </Stack>
                </SectionCard>

                <SectionCard
                  title="how_will_you_be_billed"
                  icon={<EventRepeatTwoToneIcon fontSize="small" />}
                >
                  <RadioGroup
                    value={period}
                    onChange={(event) => {
                      setPeriod(event.target.value as 'monthly' | 'annually');
                    }}
                    name="period"
                  >
                    <Grid container spacing={1.5}>
                      {periods.map((item) => (
                        <Grid item xs={12} sm={6} key={item.value}>
                          <FormControlLabel
                            sx={choiceSx(item.value === period)}
                            value={item.value}
                            control={<Radio />}
                            label={
                              <Typography sx={{ fontWeight: 700, fontSize: 14 }}>
                                {item.name}
                              </Typography>
                            }
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </RadioGroup>
                </SectionCard>

                <SectionCard
                  title="which_plan_fits_you"
                  icon={<WorkspacePremiumTwoToneIcon fontSize="small" />}
                >
                  <Typography
                    sx={{
                      mb: 2,
                      fontSize: theme.typography.pxToRem(13),
                      color: theme.palette.text.secondary
                    }}
                  >
                    {t('checkout_our')}{' '}
                    <Link
                      target={'_blank'}
                      href={getLocalizedHomeUrl('pricing', i18n.language)}
                      sx={{ fontWeight: 600 }}
                    >
                      {t('pricing_page')}
                    </Link>{' '}
                    {t('for_more_details')}
                  </Typography>
                  <RadioGroup
                    value={selectedPlan}
                    onChange={(event) => {
                      setSelectedPlan(event.target.value);
                    }}
                    name="plans"
                  >
                    <Grid container spacing={1.5}>
                      {[...subscriptionPlans]
                        .sort(
                          (a, b) => a.monthlyCostPerUser - b.monthlyCostPerUser
                        )
                        .map((plan) => (
                          <Grid item xs={12} sm={6} md={4} key={plan.id}>
                            <FormControlLabel
                              sx={choiceSx(plan.code === selectedPlan)}
                              value={plan.code}
                              control={<Radio />}
                              label={
                                <Box>
                                  <Typography sx={{ fontWeight: 700, fontSize: 14 }}>
                                    {plan.name}
                                  </Typography>
                                  <Typography
                                    sx={{
                                      fontSize: 12.5,
                                      color: theme.palette.text.secondary
                                    }}
                                  >
                                    <Box
                                      component="span"
                                      sx={{
                                        fontWeight: 700,
                                        fontSize: 15,
                                        color: theme.palette.text.primary
                                      }}
                                    >
                                      {period == 'monthly'
                                        ? plan.monthlyCostPerUser
                                        : plan.yearlyCostPerUser}{' '}
                                      USD
                                    </Box>{' '}
                                    {period == 'monthly'
                                      ? t('per_user_month')
                                      : t('per_user_year')}
                                  </Typography>
                                </Box>
                              }
                            />
                          </Grid>
                        ))}
                    </Grid>
                  </RadioGroup>
                </SectionCard>

                <SectionCard
                  title="features"
                  icon={<FactCheckTwoToneIcon fontSize="small" />}
                >
                  <PlanFeatures features={selectedPlanObject?.features ?? []} />
                </SectionCard>
              </Stack>
            </Grid>
            <Grid item xs={12} lg={4}>
              <Box sx={{ position: { lg: 'sticky' }, top: { lg: theme.spacing(10) } }}>
                <SectionCard
                  title={
                    isChangingSubscription
                      ? 'subscription_change_summary'
                      : 'subscription_checkout_title'
                  }
                  icon={<ReceiptLongTwoToneIcon fontSize="small" />}
                >
                  {isChangingSubscription && (
                    <Box sx={{ mb: 2 }}>
                      {summaryRows.map((row) => (
                        <Stack
                          key={row.key}
                          direction="row"
                          justifyContent="space-between"
                          spacing={2}
                          sx={{
                            py: 1,
                            borderBottom: `1px dashed ${alpha(theme.palette.primary.main, 0.16)}`
                          }}
                        >
                          <Typography sx={{ fontSize: 13, color: theme.palette.text.secondary }}>
                            {row.label}
                          </Typography>
                          <Typography sx={{ fontSize: 13.5, fontWeight: 600, textAlign: 'end' }}>
                            {row.value}
                          </Typography>
                        </Stack>
                      ))}
                      <Typography
                        sx={{
                          mt: 1.5,
                          fontSize: 12.5,
                          color: theme.palette.text.secondary
                        }}
                      >
                        {t('prorata_notice')}
                      </Typography>
                    </Box>
                  )}
                  {selectedPlanObject?.code !== 'BUSINESS' && (
                    <Box
                      sx={{
                        p: 2,
                        mb: 2,
                        borderRadius: '12px',
                        textAlign: 'center',
                        backgroundColor: alpha(theme.palette.primary.main, 0.06),
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.16)}`
                      }}
                    >
                      <Typography sx={{ fontSize: 13, color: theme.palette.text.secondary }}>
                        {t('you_will_be_charged')}
                      </Typography>
                      <Typography
                        sx={{
                          my: 0.5,
                          fontSize: theme.typography.pxToRem(30),
                          fontWeight: 700,
                          color: theme.palette.primary.dark,
                          direction: 'ltr'
                        }}
                      >
                        {`$ ${getCost()}`}
                      </Typography>
                      <Typography sx={{ fontSize: 13, color: theme.palette.text.secondary }}>
                        {period == 'monthly'
                          ? t('monthly_adverb')
                          : t('yearly_adverb')}
                      </Typography>
                    </Box>
                  )}
                  <Button
                    onClick={buyProduct}
                    size="large"
                    fullWidth
                    variant="contained"
                    startIcon={submitting && <CircularProgress size="1rem" />}
                    disabled={
                      !selectedPlan || submitting || selectedPlan == 'FREE'
                    }
                    sx={{
                      borderRadius: '12px',
                      fontWeight: 700,
                      boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.28)}`
                    }}
                  >
                    {t('upgrade_now')}
                  </Button>
                </SectionCard>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </>
    );
  else return <PermissionErrorMessage message={'no_access_page'} />;
}

export default SubscriptionPlans;
