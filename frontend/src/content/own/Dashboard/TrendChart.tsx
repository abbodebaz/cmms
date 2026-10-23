import { useMemo } from 'react';
import { Box, Skeleton, Stack, Typography, useTheme } from '@mui/material';
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { TrendPoint } from './useDashboardData';

interface TrendChartProps {
  data: TrendPoint[];
  loading: boolean;
}

const CHART_HEIGHT = 300;

export default function TrendChart({ data, loading }: TrendChartProps) {
  const theme = useTheme();
  const { t }: { t: any } = useTranslation();
  const createdColor = theme.colors.primary.main;
  const completedColor = theme.colors.secondary.main;

  const totals = useMemo(
    () =>
      data.reduce(
        (acc, point) => ({
          created: acc.created + point.created,
          completed: acc.completed + point.completed
        }),
        { created: 0, completed: 0 }
      ),
    [data]
  );

  const options: ApexOptions = useMemo(
    () => ({
      chart: {
        type: 'area',
        background: 'transparent',
        toolbar: { show: false },
        zoom: { enabled: false },
        fontFamily: theme.typography.fontFamily,
        animations: { speed: 400 }
      },
      colors: [createdColor, completedColor],
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth', width: [2.5, 2.5] },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.28,
          opacityTo: 0.02,
          stops: [0, 95]
        }
      },
      markers: { size: 0, hover: { size: 5 } },
      grid: {
        strokeDashArray: 4,
        borderColor: theme.palette.divider,
        padding: { left: 8, right: 8 }
      },
      legend: { show: false },
      xaxis: {
        categories: data.map((point) => format(point.date, 'dd/MM')),
        tickAmount: 6,
        axisBorder: { show: false },
        axisTicks: { show: false },
        tooltip: { enabled: false },
        labels: {
          rotate: 0,
          hideOverlappingLabels: true,
          style: { colors: theme.palette.text.secondary, fontSize: '11px' }
        }
      },
      yaxis: {
        min: 0,
        forceNiceScale: true,
        labels: {
          formatter: (value: number) => `${Math.round(value)}`,
          style: { colors: theme.palette.text.secondary, fontSize: '11px' }
        }
      },
      tooltip: {
        theme: theme.palette.mode,
        shared: true,
        intersect: false,
        x: {
          formatter: (_value: number, opts?: any) => {
            const point = data[opts?.dataPointIndex ?? -1];
            return point ? format(point.date, 'dd/MM/yyyy') : '';
          }
        }
      }
    }),
    [data, theme, createdColor, completedColor]
  );

  const series = [
    { name: t('created'), data: data.map((point) => point.created) },
    { name: t('completed'), data: data.map((point) => point.completed) }
  ];

  const legend = [
    { label: t('created'), color: createdColor, value: totals.created },
    { label: t('completed'), color: completedColor, value: totals.completed }
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <Stack direction="row" spacing={3} sx={{ mb: 1 }}>
        {legend.map((item) => (
          <Box key={item.label}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  backgroundColor: item.color
                }}
              />
              <Typography
                variant="caption"
                sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}
              >
                {item.label}
              </Typography>
            </Stack>
            {loading ? (
              <Skeleton variant="text" width={40} height={32} />
            ) : (
              <Typography
                sx={{
                  fontSize: theme.typography.pxToRem(22),
                  fontWeight: 700,
                  fontFeatureSettings: '"tnum"'
                }}
              >
                {item.value}
              </Typography>
            )}
          </Box>
        ))}
      </Stack>
      {loading ? (
        <Skeleton
          variant="rectangular"
          height={CHART_HEIGHT - 20}
          sx={{ borderRadius: theme.general.borderRadius, mt: 1 }}
        />
      ) : (
        // Time axes read left-to-right in Arabic UIs as well
        <Box dir="ltr" sx={{ mx: -1 }}>
          <Chart
            options={options}
            series={series}
            type="area"
            height={CHART_HEIGHT}
          />
        </Box>
      )}
    </Box>
  );
}
