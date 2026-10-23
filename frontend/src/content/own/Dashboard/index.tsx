import { ReactNode, useContext, useEffect, useMemo } from 'react';
import {
  Box,
  Button,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import { alpha, lighten } from '@mui/material/styles';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import EventBusyOutlinedIcon from '@mui/icons-material/EventBusyOutlined';
import EngineeringOutlinedIcon from '@mui/icons-material/EngineeringOutlined';
import PrecisionManufacturingOutlinedIcon from '@mui/icons-material/PrecisionManufacturingOutlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import ShowChartRoundedIcon from '@mui/icons-material/ShowChartRounded';
import DonutLargeRoundedIcon from '@mui/icons-material/DonutLargeRounded';
import PriorityHighRoundedIcon from '@mui/icons-material/PriorityHighRounded';
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded';
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined';
import { TitleContext } from '../../../contexts/TitleContext';
import useAuth from '../../../hooks/useAuth';
import useDashboardData, { TREND_DAYS } from './useDashboardData';
import KpiCard, { KpiTone } from './KpiCard';
import SectionCard, { EmptyState } from './SectionCard';
import TrendChart from './TrendChart';
import StatusDonut from './StatusDonut';
import { ListSkeleton, RequestRow, WorkOrderRow } from './Lists';

interface KpiDefinition {
  key: string;
  label: string;
  value: ReactNode;
  icon: ReactNode;
  caption?: ReactNode;
  tone?: KpiTone;
  emphasize?: boolean;
  to: string;
}

const greetingKey = (hour: number): string =>
  hour < 12
    ? 'dashboard_greeting_morning'
    : hour < 18
    ? 'dashboard_greeting_afternoon'
    : 'dashboard_greeting_evening';

export default function Dashboard() {
  const theme = useTheme();
  const { t, i18n }: { t: any; i18n: any } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setTitle } = useContext(TitleContext);
  const {
    access,
    loading,
    counts,
    urgent,
    trend,
    completedInRange,
    pmCompliance,
    requests,
    pendingRequests,
    assetStats,
    reload
  } = useDashboardData();

  const charcoal = theme.colors.alpha.black[100];

  useEffect(() => {
    setTitle(t('dashboard'));
  }, []);

  const now = new Date();
  const weekday = useMemo(() => {
    const language: string = i18n.language || 'en';
    const locale = language.startsWith('ar')
      ? 'ar-u-ca-gregory-nu-latn'
      : language;
    try {
      return new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(now);
    } catch (e) {
      return '';
    }
  }, [i18n.language]);

  const kpis: KpiDefinition[] = [];
  if (access.workOrders) {
    kpis.push(
      {
        key: 'open',
        label: t('dashboard_kpi_open'),
        value: counts?.open ?? 0,
        icon: <AssignmentOutlinedIcon />,
        caption: t('dashboard_kpi_on_hold_caption', {
          count: counts?.onHold ?? 0
        }),
        to: '/app/work-orders'
      },
      {
        key: 'overdue',
        label: t('dashboard_kpi_overdue'),
        value: counts?.overdue ?? 0,
        icon: <EventBusyOutlinedIcon />,
        tone: counts?.overdue ? 'error' : 'primary',
        emphasize: !!counts?.overdue,
        caption: counts?.overdue
          ? t('dashboard_kpi_overdue_caption')
          : t('dashboard_kpi_overdue_none'),
        to: '/app/work-orders'
      },
      {
        key: 'inProgress',
        label: t('dashboard_kpi_in_progress'),
        value: counts?.inProgress ?? 0,
        icon: <EngineeringOutlinedIcon />,
        caption: t('dashboard_kpi_completed_caption', {
          count: completedInRange,
          days: TREND_DAYS
        }),
        to: '/app/work-orders'
      }
    );
  }
  if (access.assets && access.analytics && (loading || assetStats)) {
    kpis.push({
      key: 'availability',
      label: t('dashboard_kpi_availability'),
      value: `${assetStats?.availability ?? 0}%`,
      icon: <PrecisionManufacturingOutlinedIcon />,
      tone:
        assetStats && assetStats.availability < 90 ? 'warning' : 'primary',
      caption: t('dashboard_kpi_downtime_caption', {
        count: assetStats?.downtimeEvents ?? 0,
        days: TREND_DAYS
      }),
      to: '/app/assets'
    });
  }
  if (access.preventive) {
    const rate =
      pmCompliance && pmCompliance.total
        ? Math.round((pmCompliance.compliant * 100) / pmCompliance.total)
        : null;
    kpis.push({
      key: 'pm',
      label: t('dashboard_kpi_pm_compliance'),
      value: rate === null ? '—' : `${rate}%`,
      icon: <VerifiedOutlinedIcon />,
      tone:
        rate === null || rate >= 90
          ? 'primary'
          : rate >= 70
          ? 'warning'
          : 'error',
      emphasize: rate !== null && rate < 70,
      caption:
        rate === null
          ? t('dashboard_kpi_pm_none', { days: TREND_DAYS })
          : t('dashboard_kpi_pm_caption', {
              compliant: pmCompliance.compliant,
              total: pmCompliance.total
            }),
      to: '/app/preventive-maintenances'
    });
  }
  if (access.requests) {
    kpis.push({
      key: 'requests',
      label: t('dashboard_kpi_requests'),
      value: pendingRequests ?? 0,
      icon: <InboxOutlinedIcon />,
      caption: t('dashboard_kpi_requests_caption'),
      to: '/app/requests'
    });
  }

  const quickActions = [
    access.createWorkOrder && {
      key: 'wo',
      label: t('dashboard_new_work_order'),
      onClick: () => navigate('/app/work-orders?new=true')
    },
    access.createRequest && {
      key: 'request',
      label: t('dashboard_new_request'),
      onClick: () => navigate('/app/requests')
    },
    access.createAsset && {
      key: 'asset',
      label: t('dashboard_new_asset'),
      onClick: () => navigate('/app/assets?new=true')
    }
  ].filter(Boolean) as { key: string; label: string; onClick: () => void }[];

  const kpiColumnsLg = kpis.length % 4 === 0 ? 4 : 3;
  const kpiColumnsXl =
    kpis.length >= 5 ? kpis.length : Math.max(kpis.length, 1);

  return (
    <>
      <Helmet>
        <title>{t('dashboard')}</title>
      </Helmet>
      <Box
        sx={{
          width: '100%',
          maxWidth: 1480,
          mx: 'auto',
          px: { xs: 2, sm: 3 },
          py: { xs: 2, sm: 3 }
        }}
      >
        {/* Header */}
        <Box
          sx={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: theme.general.borderRadiusXl,
            p: { xs: 2.5, sm: 3.5 },
            mb: 3,
            color: '#fff',
            background: `linear-gradient(135deg, ${charcoal} 0%, ${lighten(
              charcoal,
              0.08
            )} 100%)`,
            boxShadow: `0 10px 30px ${alpha(charcoal, 0.18)}`,
            '&::after': {
              content: '""',
              position: 'absolute',
              width: 320,
              height: 320,
              right: -90,
              top: -150,
              borderRadius: '50%',
              background: alpha(theme.colors.primary.main, 0.28),
              filter: 'blur(60px)',
              pointerEvents: 'none'
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: 3,
              background: theme.colors.gradients.blue1
            }
          }}
        >
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            alignItems={{ xs: 'stretch', md: 'center' }}
            justifyContent="space-between"
            spacing={2.5}
            sx={{ position: 'relative', zIndex: 1 }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  color: theme.colors.primary.light,
                  fontWeight: 600,
                  fontSize: theme.typography.pxToRem(13),
                  letterSpacing: '0.02em',
                  mb: 0.75
                }}
              >
                {weekday ? `${weekday} · ` : ''}
                {format(now, 'dd/MM/yyyy')}
              </Typography>
              <Typography
                component="h1"
                sx={{
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: {
                    xs: theme.typography.pxToRem(22),
                    sm: theme.typography.pxToRem(28)
                  },
                  lineHeight: 1.25
                }}
              >
                {t(greetingKey(now.getHours()), {
                  name: user?.firstName ?? ''
                })}
              </Typography>
              <Typography
                sx={{ color: alpha('#fff', 0.7), mt: 0.75, fontSize: 14 }}
              >
                {t('dashboard_subtitle')}
              </Typography>
            </Box>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ flexWrap: 'wrap', rowGap: 1, flexShrink: 0 }}
            >
              {quickActions.map((action, index) => (
                <Button
                  key={action.key}
                  onClick={action.onClick}
                  startIcon={<AddRoundedIcon />}
                  variant={index === 0 ? 'contained' : 'outlined'}
                  sx={{
                    whiteSpace: 'nowrap',
                    fontWeight: 700,
                    ...(index === 0
                      ? {
                          background: theme.colors.gradients.blue1,
                          color: '#fff',
                          boxShadow: `0 6px 16px ${alpha(
                            theme.colors.primary.main,
                            0.4
                          )}`,
                          '&:hover': {
                            background: theme.colors.gradients.blue1,
                            filter: 'brightness(1.08)'
                          }
                        }
                      : {
                          color: '#fff',
                          borderColor: alpha('#fff', 0.28),
                          backgroundColor: alpha('#fff', 0.04),
                          '&:hover': {
                            borderColor: theme.colors.primary.light,
                            backgroundColor: alpha('#fff', 0.1)
                          }
                        })
                  }}
                >
                  {action.label}
                </Button>
              ))}
              <Tooltip title={t('dashboard_refresh')}>
                <span>
                  <IconButton
                    onClick={reload}
                    disabled={loading}
                    sx={{
                      color: alpha('#fff', 0.85),
                      border: `1px solid ${alpha('#fff', 0.2)}`,
                      '&:hover': { backgroundColor: alpha('#fff', 0.1) },
                      '&.Mui-disabled': { color: alpha('#fff', 0.35) }
                    }}
                  >
                    <RefreshRoundedIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>
          </Stack>
        </Box>

        {/* KPIs */}
        {kpis.length > 0 && (
          <Box
            sx={{
              display: 'grid',
              gap: { xs: 1.5, sm: 2 },
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, minmax(0, 1fr))',
                md: 'repeat(3, minmax(0, 1fr))',
                lg: `repeat(${kpiColumnsLg}, minmax(0, 1fr))`,
                xl: `repeat(${kpiColumnsXl}, minmax(0, 1fr))`
              },
              mb: 3
            }}
          >
            {kpis.map((kpi) => (
              <KpiCard
                key={kpi.key}
                label={kpi.label}
                value={kpi.value}
                icon={kpi.icon}
                caption={kpi.caption}
                tone={kpi.tone}
                emphasize={kpi.emphasize}
                loading={loading}
                onClick={() => navigate(kpi.to)}
              />
            ))}
          </Box>
        )}

        {access.workOrders && (
          <Box
            sx={{
              display: 'grid',
              gap: { xs: 2, sm: 2.5 },
              gridTemplateColumns: {
                xs: '1fr',
                lg: 'minmax(0, 2fr) minmax(0, 1fr)'
              },
              mb: 3
            }}
          >
            <SectionCard
              title={t('dashboard_trend_title')}
              subtitle={t('dashboard_last_days', { days: TREND_DAYS })}
              icon={<ShowChartRoundedIcon />}
            >
              <TrendChart data={trend} loading={loading} />
            </SectionCard>
            <SectionCard
              title={t('dashboard_status_title')}
              subtitle={t('dashboard_status_subtitle')}
              icon={<DonutLargeRoundedIcon />}
              actionLabel={t('dashboard_view_all')}
              onAction={() => navigate('/app/work-orders')}
            >
              <StatusDonut
                open={counts?.open ?? 0}
                inProgress={counts?.inProgress ?? 0}
                onHold={counts?.onHold ?? 0}
                loading={loading}
              />
            </SectionCard>
          </Box>
        )}

        {(access.workOrders || access.requests) && (
          <Box
            sx={{
              display: 'grid',
              gap: { xs: 2, sm: 2.5 },
              gridTemplateColumns: {
                xs: '1fr',
                lg:
                  access.workOrders && access.requests
                    ? 'minmax(0, 7fr) minmax(0, 5fr)'
                    : '1fr'
              }
            }}
          >
            {access.workOrders && (
              <SectionCard
                title={t('dashboard_urgent_title')}
                subtitle={t('dashboard_urgent_subtitle')}
                icon={<PriorityHighRoundedIcon />}
                actionLabel={t('dashboard_view_all')}
                onAction={() => navigate('/app/work-orders')}
                flush
              >
                {loading ? (
                  <ListSkeleton rows={4} />
                ) : urgent.length ? (
                  <Stack divider={<Divider />}>
                    {urgent.map((workOrder) => (
                      <WorkOrderRow
                        key={workOrder.id}
                        workOrder={workOrder}
                        onClick={() =>
                          navigate(`/app/work-orders/${workOrder.id}`)
                        }
                      />
                    ))}
                  </Stack>
                ) : (
                  <EmptyState
                    icon={<TaskAltRoundedIcon />}
                    title={t('dashboard_urgent_empty')}
                    description={t('dashboard_urgent_empty_description')}
                  />
                )}
              </SectionCard>
            )}
            {access.requests && (
              <SectionCard
                title={t('dashboard_requests_title')}
                subtitle={t('dashboard_requests_subtitle')}
                icon={<InboxOutlinedIcon />}
                actionLabel={t('dashboard_view_all')}
                onAction={() => navigate('/app/requests')}
                flush
              >
                {loading ? (
                  <ListSkeleton rows={4} />
                ) : requests.length ? (
                  <Stack divider={<Divider />}>
                    {requests.map((request) => (
                      <RequestRow
                        key={request.id}
                        request={request}
                        onClick={() => navigate(`/app/requests/${request.id}`)}
                      />
                    ))}
                  </Stack>
                ) : (
                  <EmptyState
                    icon={<MarkEmailReadOutlinedIcon />}
                    title={t('dashboard_requests_empty')}
                    description={t('dashboard_requests_empty_description')}
                  />
                )}
              </SectionCard>
            )}
          </Box>
        )}
      </Box>
    </>
  );
}
