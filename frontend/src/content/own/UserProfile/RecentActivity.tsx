import {
  Avatar,
  Box,
  CircularProgress,
  Grid,
  styled,
  Typography,
  useTheme
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import TaskAltTwoToneIcon from '@mui/icons-material/TaskAltTwoTone';
import InsightsTwoToneIcon from '@mui/icons-material/InsightsTwoTone';
import SectionCard from '../components/SectionCard';
import { useTranslation } from 'react-i18next';
import AssignmentTwoToneIcon from '@mui/icons-material/AssignmentTwoTone';
import { useDispatch, useSelector } from '../../../store';
import { getUserWorkOrdersOverview } from '../../../slices/analytics/user';
import { useEffect } from 'react';

const AvatarPrimary = styled(Avatar)(
  ({ theme }) => `
      background: ${theme.colors.primary.lighter};
      color: ${theme.colors.primary.main};
      width: ${theme.spacing(7)};
      height: ${theme.spacing(7)};
`
);

function RecentActivity() {
  const { t }: { t: any } = useTranslation();
  const theme = useTheme();
  const dispatch = useDispatch();
  const { loading, workOrdersOverview } = useSelector(
    (state) => state.userAnalytics
  );
  useEffect(() => {
    dispatch(getUserWorkOrdersOverview());
  }, []);

  const stats = [
    {
      key: 'created',
      label: t('created'),
      value: workOrdersOverview.created,
      icon: <AssignmentTwoToneIcon fontSize="small" />,
      color: theme.palette.primary.main
    },
    {
      key: 'completed',
      label: t('completed'),
      value: workOrdersOverview.completed,
      icon: <TaskAltTwoToneIcon fontSize="small" />,
      color: theme.palette.success.main
    }
  ];
  return (
    <Box sx={{ height: '100%', '& > div': { height: '100%' } }}>
      <SectionCard
        title="recent_activity"
        description="work_orders"
        icon={<InsightsTwoToneIcon fontSize="small" />}
      >
        {loading.workOrdersOverview ? (
          <Box display="flex" justifyContent="center" py={3}>
            <CircularProgress size={28} />
          </Box>
        ) : (
          <Grid container spacing={2}>
            {stats.map((stat) => (
              <Grid item xs={12} sm={6} key={stat.key}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: '12px',
                    border: `1px solid ${alpha(stat.color, 0.18)}`,
                    backgroundColor: alpha(stat.color, 0.05),
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5
                  }}
                >
                  <Box
                    sx={{
                      width: 42,
                      height: 42,
                      borderRadius: '12px',
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0,
                      color: stat.color,
                      backgroundColor: alpha(stat.color, 0.12)
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Box>
                    <Typography
                      sx={{
                        fontSize: theme.typography.pxToRem(12.5),
                        fontWeight: 500,
                        color: theme.palette.text.secondary
                      }}
                    >
                      {stat.label}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: theme.typography.pxToRem(26),
                        fontWeight: 700,
                        lineHeight: 1.2,
                        color: theme.palette.text.primary
                      }}
                    >
                      {stat.value ?? 0}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        )}
      </SectionCard>
    </Box>
  );
}

export default RecentActivity;
