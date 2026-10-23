import { ChangeEvent, useEffect, useState } from 'react';
import {
  alpha,
  Avatar,
  Box,
  CardContent,
  Divider,
  styled,
  Tab,
  Tabs,
  Typography,
  useTheme
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import Scrollbar from 'src/components/Scrollbar';
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { OwnUser, UserResponseDTO } from '../../../models/user';

const dayTranslationKey: Record<string, string> = {
  MONDAY: 'monday',
  TUESDAY: 'tuesday',
  WEDNESDAY: 'wednesday',
  THURSDAY: 'thursday',
  FRIDAY: 'friday',
  SATURDAY: 'saturday',
  SUNDAY: 'sunday'
};
import { useDispatch, useSelector } from '../../../store';
import { getTwoWeeksWorkOrders } from '../../../slices/analytics/user';
import { getDayAndMonthAndYear } from '../../../utils/dates';
import SectionCard from '../components/SectionCard';
import { SoftChip } from '../components/StatusChip';
import {
  DetailGrid,
  DetailItem,
  DetailsHeader,
  DetailsPage,
  DetailsTabs
} from '../components/DetailsKit';
import BadgeTwoToneIcon from '@mui/icons-material/BadgeTwoTone';
import InsightsTwoToneIcon from '@mui/icons-material/InsightsTwoTone';

const AvatarPrimary = styled(Avatar)(
  ({ theme }) => `
    background: ${theme.colors.primary.lighter};
    color: ${theme.colors.primary.main};
    width: ${theme.spacing(8)};
    height: ${theme.spacing(8)};
    border-radius: 14px;
`
);

const TabsContainerWrapper = styled(CardContent)(
  ({ theme }) => `
        background-color: ${theme.colors.alpha.black[5]};

        .MuiTabs-flexContainer {
            justify-content: center;
        }
  `
);

interface PropsType {
  user: UserResponseDTO;
}

function UserDetailsDrawer({ user }: PropsType) {
  const { t }: { t: any } = useTranslation();
  const theme = useTheme();
  const dispatch = useDispatch();

  const [currentTab, setCurrentTab] = useState<string>('overview');
  const { twoWeeksWorkOrders } = useSelector((state) => state.userAnalytics);
  const completedWorkOrdersCount = twoWeeksWorkOrders.reduce(
    (acc, day) => day.completed + acc,
    0
  );
  const tabs = [
    { value: 'overview', label: t('overview') },
    { value: 'activity', label: t('activity') }
  ];
  useEffect(() => {
    if (user.id) dispatch(getTwoWeeksWorkOrders(user.id));
  }, [user.id]);
  const handleTabsChange = (_event: ChangeEvent<{}>, value: string): void => {
    setCurrentTab(value);
  };
  const getScheduledDays = (): string => {
    if (!user.shiftConfiguration?.days) return '';
    const enabledDays = user.shiftConfiguration.days
      .filter((d) => d.enabled)
      .map((d) => t(dayTranslationKey[d.dayOfWeek] ?? d.dayOfWeek));
    return enabledDays.join(', ');
  };

  const fieldsToRender = (
    user: UserResponseDTO
  ): { label: string; value: string | number }[] => [
    {
      label: t('id'),
      value: user.id
    },
    {
      label: t('first_name'),
      value: user.firstName
    },
    {
      label: t('last_name'),
      value: user.lastName
    },
    {
      label: t('email'),
      value: user.email
    },
    {
      label: t('phone'),
      value: user.phone
    },
    {
      label: t('job_title'),
      value: user.jobTitle
    },
    {
      label: t('role'),
      value: user.role.name
    },
    {
      label: t('hourly_rate'),
      value: user.rate
    },
    {
      label: t('scheduled'),
      value: getScheduledDays()
    }
  ];

  //////////////////////////////////////////////////////////////////////////////////////////////
  const chart3Options: ApexOptions = {
    stroke: {
      curve: 'smooth',
      width: [0, 5]
    },
    theme: {
      mode: theme.palette.mode
    },
    chart: {
      background: 'transparent',
      toolbar: {
        show: false
      }
    },
    colors: [alpha(theme.colors.primary.main, 0.4), theme.colors.primary.main],
    fill: {
      opacity: 1
    },
    labels: twoWeeksWorkOrders.map((day) => getDayAndMonthAndYear(day.date)),
    xaxis: {
      type: 'datetime'
    },
    dataLabels: {
      enabled: false
    },
    grid: {
      strokeDashArray: 5,
      borderColor: theme.palette.divider
    },
    legend: {
      show: true
    }
  };

  const chart3Data = [
    {
      name: t('created'),
      type: 'column',
      data: twoWeeksWorkOrders.map((day) => day.created)
    },
    {
      name: t('completed'),
      type: 'line',
      data: twoWeeksWorkOrders.map((day) => day.completed)
    }
  ];

  return (
    <Box
      sx={{
        height: '100%',
        width: { xs: 340, lg: 400 },
        maxWidth: '100vw'
      }}
    >
      <Scrollbar>
        <DetailsPage sx={{ p: { xs: 2, sm: 2.5 } }}>
          <DetailsHeader
            subtitle={t('user_details')}
            title={`${user.firstName} ${user.lastName}`}
            media={
              <AvatarPrimary variant="rounded" src={user.image?.url}>
                <Typography
                  sx={{ fontSize: 26, fontWeight: 700, color: 'inherit' }}
                >
                  {Array.from(user.firstName)[0]?.toUpperCase()}
                </Typography>
              </AvatarPrimary>
            }
            chips={
              <>
                {user.role?.name && (
                  <SoftChip tone="primary" label={user.role.name} />
                )}
                {user.jobTitle && (
                  <SoftChip tone="neutral" label={user.jobTitle} />
                )}
              </>
            }
          />
          <DetailsTabs onChange={handleTabsChange} value={currentTab}>
            {tabs.map((tab) => (
              <Tab key={tab.value} label={tab.label} value={tab.value} />
            ))}
          </DetailsTabs>

          {currentTab === 'overview' && (
            <SectionCard
              title="details"
              icon={<BadgeTwoToneIcon fontSize="small" />}
            >
              <DetailGrid minColumnWidth={150}>
                {fieldsToRender(user).map(({ label, value }) => (
                  <DetailItem
                    key={label}
                    label={label}
                    value={
                      value === null || value === undefined || value === ''
                        ? null
                        : value
                    }
                  />
                ))}
              </DetailGrid>
            </SectionCard>
          )}

          {currentTab === 'activity' && (
            <SectionCard
              title="activity"
              icon={<InsightsTwoToneIcon fontSize="small" />}
            >
              <Box sx={{ textAlign: 'center' }}>
                <Typography
                  sx={{ color: 'text.secondary', fontSize: 13, fontWeight: 500 }}
                >
                  {t('wo_complete_last_14_days')}
                </Typography>
                <Typography
                  sx={{
                    fontSize: 34,
                    fontWeight: 700,
                    color: 'primary.main',
                    lineHeight: 1.3
                  }}
                >
                  {completedWorkOrdersCount}
                </Typography>
                {completedWorkOrdersCount === 0 && (
                  <Typography
                    sx={{ color: 'text.secondary', fontSize: 13, mt: 0.5 }}
                  >
                    {t('no_wo_complete_last_14_days')}
                  </Typography>
                )}
                <Box flexGrow={1} pt={1}>
                  <Chart
                    options={chart3Options}
                    series={chart3Data}
                    type="line"
                    height={'100%'}
                  />
                </Box>
              </Box>
            </SectionCard>
          )}
        </DetailsPage>
      </Scrollbar>
    </Box>
  );
}

export default UserDetailsDrawer;
