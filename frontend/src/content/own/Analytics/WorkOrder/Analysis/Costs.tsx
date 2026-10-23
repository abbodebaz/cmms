import { Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { KpiLabel, KpiRow, KpiTile, KpiValue } from '../../KpiTiles';
import AnalyticsCard from '../../AnalyticsCard';
import { Filter } from '../WOModal';
import { useDispatch, useSelector } from '../../../../../store';
import { useContext, useEffect } from 'react';
import { getCompleteCosts } from '../../../../../slices/analytics/workOrder';
import { CompanySettingsContext } from '../../../../../contexts/CompanySettingsContext';

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

function Costs({ handleOpenModal, start, end, companyId }: HoursWorkedProps) {
  const { t }: { t: any } = useTranslation();
  const dispatch = useDispatch();
  const { completeCosts, loading } = useSelector((state) => state.woAnalytics);
  const { getFormattedCurrency } = useContext(CompanySettingsContext);
  useEffect(() => {
    dispatch(getCompleteCosts(start, end, companyId));
  }, [start, end, companyId]);

  const columns = ['id'];
  const formattedData: { label: string; value: string; filters: Filter[] }[] = [
    {
      label: t('total_cost'),
      value: getFormattedCurrency(completeCosts.total.toFixed(2)),
      filters: []
    },
    {
      label: t('average_cost'),
      value: getFormattedCurrency(completeCosts.average.toFixed(2)),
      filters: []
    }
  ];
  const title = t('costs');
  return (
    <AnalyticsCard
      title={title}
      description="total_cost_description"
    >
      <Stack sx={{ height: '100%', width: '100%', justifyContent: 'center' }}>
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
      </Stack>
    </AnalyticsCard>
  );
}

export default Costs;
