import {
  createColorSequence,
  getChartLineColor,
  getChartPalette
} from '../../chartColors';
import { useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Cell, Legend, Pie, PieChart, Tooltip } from 'recharts';
import AnalyticsCard from '../../AnalyticsCard';
import { Filter } from '../WOModal';
import { useDispatch, useSelector } from '../../../../../store';
import { useEffect } from 'react';
import { getCompleteByCategory } from '../../../../../slices/analytics/workOrder';
import Loading from '../../Loading';
import { getRequestsByCategory } from '../../../../../slices/analytics/request';

interface RequestByCategoryProps {
  handleOpenModal: (
    columns: string[],
    filters: Filter[],
    title: string
  ) => void;
  start: Date;
  end: Date;
  companyId?: number;
}

function RequestByCategory({ handleOpenModal, start, end, companyId }: RequestByCategoryProps) {
  const { t }: { t: any } = useTranslation();
  const theme = useTheme();
  const chartPalette = getChartPalette(theme);
  const chartLineColor = getChartLineColor(theme);
  const nextChartColor = createColorSequence(theme);
  const dispatch = useDispatch();
  const { requestsByCategory, loading } = useSelector(
    (state) => state.requestAnalytics
  );

  useEffect(() => {
    dispatch(getRequestsByCategory(start, end, companyId));
  }, [start, end, companyId]);

  const columns = ['id'];

  const formattedData = requestsByCategory.map((category) => {
    return {
      label: category.name,
      value: category.count,
      color: nextChartColor(),
      filters: [{ key: 'category', value: category.id }]
    };
  });
  const title = t('grouped_by_category');
  return (
    <AnalyticsCard title={title}>
      {loading.requestsByCategory ? (
        <Loading />
      ) : (
        <PieChart width={200} height={300}>
          <Pie
            data={formattedData}
            dataKey="value"
            nameKey="label"
            cx="50%"
            cy="50%"
            outerRadius={100}
            innerRadius={50}
            fill={chartPalette[0]}
          >
            {formattedData.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.color}
                onClick={() => {
                  handleOpenModal(columns, entry.filters, title);
                }}
              />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      )}
    </AnalyticsCard>
  );
}

export default RequestByCategory;
