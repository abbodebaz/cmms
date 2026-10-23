import { Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { KpiLabel, KpiRow, KpiTile, KpiValue } from '../../KpiTiles';
import AnalyticsCard from '../../AnalyticsCard';
import { Filter } from '../WOModal';
import { useDispatch, useSelector } from '../../../../../store';
import { useEffect } from 'react';
import { getWOHours } from '../../../../../slices/analytics/workOrder';
import Loading from '../../Loading';

interface HoursWorkedProps {
  handleOpenModal: (
    columns: string[],
    filters: Filter[],
    title: string
  ) => void;
  start: Date;
  end: Date;
  companyId?: number;
}

function HoursWorked({ handleOpenModal, start, end, companyId }: HoursWorkedProps) {
  const { t }: { t: any } = useTranslation();
  const dispatch = useDispatch();
  const { hours, loading } = useSelector((state) => state.woAnalytics);

  useEffect(() => {
    dispatch(getWOHours(start, end, companyId));
  }, [start, end, companyId]);

  const columns = ['id'];
  const formattedData: { label: string; value: string | number; filters: Filter[] }[] = [
    { label: t('estimated_hours'), value: hours.estimated, filters: [] },
    {
      label: t('total_time_spent_in_hours'),
      value: hours.actual,
      filters: []
    },
    {
      label: t('estimation_accuracy_ratio'),
      value: (hours.estimated / hours.actual).toFixed(2),
      filters: []
    }
  ];
  const title = t('hours_worked');
  return (
    <AnalyticsCard
      title={title}
      description="hours_worked_description"
    >
      <Stack sx={{ height: '100%', width: '100%', justifyContent: 'center' }}>
        {loading.hours ? (
          <Loading />
        ) : (
          <KpiRow>
            {formattedData.map((data) => (
              <KpiTile key={data.label}>
                <KpiValue
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleOpenModal(columns, data.filters, title)}
                >
                  {data.value}
                </KpiValue>
                <KpiLabel>{data.label}</KpiLabel>
              </KpiTile>
            ))}
          </KpiRow>
        )}
      </Stack>
    </AnalyticsCard>
  );
}

export default HoursWorked;
