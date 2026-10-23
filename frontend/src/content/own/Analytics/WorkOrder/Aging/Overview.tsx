import { Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { KpiLabel, KpiRow, KpiTile, KpiValue } from '../../KpiTiles';
import AnalyticsCard from '../../AnalyticsCard';
import { Filter } from '../WOModal';
import { useDispatch, useSelector } from '../../../../../store';
import { useEffect } from 'react';
import { getIncompleteStats } from '../../../../../slices/analytics/workOrder';
import Loading from '../../Loading';

interface WOStatusNumbersProps {
  handleOpenModal: (
    columns: string[],
    filters: Filter[],
    title: string
  ) => void,
  start: Date,
  end: Date,
  companyId?: number
}

function Overview({ handleOpenModal, start, end, companyId }: WOStatusNumbersProps) {
  const { t }: { t: any } = useTranslation();
  const dispatch = useDispatch();
  const { incompleteOverview, loading } = useSelector(
    (state) => state.woAnalytics
  );

  useEffect(() => {
    dispatch(getIncompleteStats(start, end, companyId));
  }, [start, end, companyId]);

  const formattedData: {
    label: string;
    value: number | string;
    config?: {
      columns: string[];
      filters: Filter[];
    };
  }[] = [
    {
      label: t('count'),
      value: incompleteOverview.total,
      config: {
        columns: ['id'],
        filters: [{ key: 'fs', value: false }]
      }
    },
    {
      label: t('average_age'),
      value: incompleteOverview.averageAge,
      config: {
        columns: ['id'],
        filters: [{ key: 'fs', value: false }]
      }
    }
  ];
  return (
    <AnalyticsCard
      title={t('incomplete_wo')}
      description="wo_age_description"
    >
      <Stack sx={{ height: '100%', width: '100%', justifyContent: 'center' }}>
        {loading.incompleteOverview ? (
          <Loading />
        ) : (
          <KpiRow>
            {formattedData.map((data) => (
              <KpiTile key={data.label}>
                <KpiValue
                  style={{ cursor: data.config ? 'pointer' : 'auto' }}
                  onClick={() =>
                    handleOpenModal(
                      data.config.columns,
                      data.config.filters,
                      t('incomplete_wo')
                    )
                  }
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

export default Overview;
