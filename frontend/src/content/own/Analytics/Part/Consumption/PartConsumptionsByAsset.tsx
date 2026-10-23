import {
  createColorSequence,
  getChartLineColor,
  getChartPalette
} from '../../chartColors';
import { useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  Bar, BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import AnalyticsCard from '../../AnalyticsCard';
import { Filter } from '../WOModal';
import { useDispatch, useSelector } from '../../../../../store';
import { useEffect } from 'react';
import Loading from '../../Loading';
import { getPartConsumptionsByAsset } from '../../../../../slices/analytics/part';

interface WOStatusIncompleteProps {
  handleOpenModal: (
    columns: string[],
    filters: Filter[],
    title: string
  ) => void,
  start: Date,
  end: Date,
  companyId?: number
}

function PartConsumptionsByAsset({ handleOpenModal, start, end, companyId }: WOStatusIncompleteProps) {
  const { t }: { t: any } = useTranslation();
  const theme = useTheme();
  const chartPalette = getChartPalette(theme);
  const chartLineColor = getChartLineColor(theme);
  const nextChartColor = createColorSequence(theme);
  const { partConsumptionsByAsset, loading } = useSelector(
    (state) => state.partAnalytics
  );
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getPartConsumptionsByAsset(start, end, companyId));
  }, [start, end, companyId]);

  const columns: string[] = ['id'];

  const formattedData: {
    label: string;
    cost: number;
    color: string;
    filters: Filter[];
  }[] = partConsumptionsByAsset.map((asset) => {
    return {
      label: asset.name,
      cost: asset.cost,
      color: nextChartColor(),
      filters: [{ key: 'asset', value: asset.id }]
    };
  });
  const title = t('part_consumption_by_asset');
  return (
    <AnalyticsCard title={title}>
      {loading.partConsumptionsByAsset ? (
        <Loading />
      ) : (
        <BarChart width={508} height={508} data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" />
          <YAxis yAxisId="left-axis" />
          <Tooltip />
          <Bar dataKey="cost" fill={chartPalette[0]} name={t('cost')} yAxisId="left-axis">
            {formattedData.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.color}
                onClick={() => {
                  handleOpenModal(columns, entry.filters, t(title));
                }}
              />
            ))}
          </Bar>
        </BarChart>
      )}
    </AnalyticsCard>
  );
}

export default PartConsumptionsByAsset;
