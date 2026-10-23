import { useMemo } from 'react';
import { Box, Skeleton, Stack, Typography, useTheme } from '@mui/material';
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { useTranslation } from 'react-i18next';

interface StatusDonutProps {
  open: number;
  inProgress: number;
  onHold: number;
  loading: boolean;
}

export default function StatusDonut({
  open,
  inProgress,
  onHold,
  loading
}: StatusDonutProps) {
  const theme = useTheme();
  const { t }: { t: any } = useTranslation();
  const total = open + inProgress + onHold;

  const items = [
    { label: t('OPEN'), value: open, color: theme.colors.primary.main },
    {
      label: t('IN_PROGRESS'),
      value: inProgress,
      color: theme.colors.info.main
    },
    { label: t('ON_HOLD'), value: onHold, color: theme.colors.warning.main }
  ];

  const options: ApexOptions = useMemo(
    () => ({
      chart: {
        type: 'donut',
        background: 'transparent',
        fontFamily: theme.typography.fontFamily,
        animations: { speed: 400 }
      },
      labels: items.map((item) => item.label),
      colors: items.map((item) => item.color),
      dataLabels: { enabled: false },
      legend: { show: false },
      stroke: { width: 3, colors: [theme.palette.background.paper] },
      tooltip: { theme: theme.palette.mode, fillSeriesColor: false },
      states: { hover: { filter: { type: 'darken', value: 0.9 } } },
      plotOptions: {
        pie: {
          expandOnClick: false,
          donut: {
            size: '74%',
            labels: {
              show: true,
              name: {
                show: true,
                fontSize: '12px',
                color: theme.palette.text.secondary,
                offsetY: 18
              },
              value: {
                show: true,
                fontSize: '28px',
                fontWeight: 700,
                color: theme.palette.text.primary,
                offsetY: -14
              },
              total: {
                show: true,
                showAlways: true,
                label: t('total'),
                fontSize: '12px',
                color: theme.palette.text.secondary,
                formatter: () => `${total}`
              }
            }
          }
        }
      }
    }),
    [theme, total, open, inProgress, onHold, t]
  );

  if (loading) {
    return (
      <Stack alignItems="center" spacing={2} sx={{ py: 2 }}>
        <Skeleton variant="circular" width={180} height={180} />
        <Skeleton variant="text" width="80%" />
        <Skeleton variant="text" width="70%" />
      </Stack>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
        {total > 0 ? (
          <Chart
            options={options}
            series={items.map((item) => item.value)}
            type="donut"
            width={230}
            height={230}
          />
        ) : (
          <Box
            sx={{
              width: 190,
              height: 190,
              my: 2.5,
              borderRadius: '50%',
              border: `18px solid ${theme.colors.alpha.black[5]}`,
              display: 'grid',
              placeItems: 'center',
              textAlign: 'center'
            }}
          >
            <Box>
              <Typography sx={{ fontSize: 28, fontWeight: 700 }}>0</Typography>
              <Typography
                variant="caption"
                sx={{ color: theme.palette.text.secondary }}
              >
                {t('total')}
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
      <Stack spacing={1.25} sx={{ mt: 'auto' }}>
        {items.map((item) => {
          const percent = total ? Math.round((item.value * 100) / total) : 0;
          return (
            <Stack
              key={item.label}
              direction="row"
              alignItems="center"
              spacing={1.25}
            >
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '3px',
                  flexShrink: 0,
                  backgroundColor: item.color
                }}
              />
              <Typography variant="body2" sx={{ flex: 1, fontWeight: 500 }}>
                {item.label}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: theme.palette.text.secondary, minWidth: 40 }}
                textAlign="end"
              >
                {percent}%
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 700,
                  minWidth: 28,
                  fontFeatureSettings: '"tnum"'
                }}
                textAlign="end"
              >
                {item.value}
              </Typography>
            </Stack>
          );
        })}
      </Stack>
    </Box>
  );
}
