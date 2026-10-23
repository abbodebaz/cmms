import {
  createColorSequence,
  getChartLineColor,
  getChartPalette
} from '../../chartColors';
import { Helmet } from 'react-helmet-async';
import { Box, Grid, useTheme } from '@mui/material';
import InsightsTwoToneIcon from '@mui/icons-material/InsightsTwoTone';
import PageHeading from '../../../Settings/components/PageHeading';
import { useTranslation } from 'react-i18next';
import { useContext, useEffect, useState } from 'react';
import { TitleContext } from '../../../../../contexts/TitleContext';
import useAuth from '../../../../../hooks/useAuth';
import Overview from './Overview';
import RepairTimeByAsset from './RepairTimeByAsset';
import DowntimesByAsset from './DowntimesByAsset';
import MeantimesTrends from './MeantimesTrends';
import { Filter } from '../WOModal';
import CustomDateRangePicker from '../../CustomDateRangePicker';
import { useDispatch, useSelector } from '../../../../../store';
import { getAssetsMini } from '../../../../../slices/asset';
import MTBFByAsset from './MTBFByAsset';

interface WOStatusStatsProps {
  handleOpenWOModal: (
    columns: string[],
    filters: Filter[],
    title: string
  ) => void;
}

function WOStatusStats({ handleOpenWOModal }: WOStatusStatsProps) {
  const { t }: { t: any } = useTranslation();
  const theme = useTheme();
  const chartPalette = getChartPalette(theme);
  const chartLineColor = getChartLineColor(theme);
  const nextChartColor = createColorSequence(theme);
  const { setTitle } = useContext(TitleContext);
  const [end, setEnd] = useState(new Date());
  const nowMinusMonth = new Date();
  nowMinusMonth.setMonth(nowMinusMonth.getMonth() - 1);
  const [start, setStart] = useState(nowMinusMonth);
  const { user } = useAuth();
  const [companyId, setCompanyId] = useState<number | undefined>(
    user?.superAccountRelations?.[0]?.childCompanyId ?? undefined
  );
  const dispatch = useDispatch();
  const { assetsMini } = useSelector((state) => state.assets);
  const [assetColors, setAssetColors] = useState<{ color: string; id: number }[]>([]);

  useEffect(() => {
    setTitle(t('reliability_dashboard'));
    dispatch(getAssetsMini(companyId));
  }, [companyId]);

  useEffect(() => {
    setAssetColors(assetsMini.map((assetMini) => ({ color: nextChartColor(), id: assetMini.id })));
  }, [assetsMini]);
  return (
    <>
      <Helmet>
        <title>{t('reliability_dashboard')}</title>
      </Helmet>
      <Box sx={{ px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 } }}>
        <PageHeading
          title={t('reliability_dashboard')}
          description={t('analytics_page_description')}
          icon={<InsightsTwoToneIcon />}
        />
      <Grid container alignItems="stretch" spacing={{ xs: 2, md: 2.5 }}>
        <Grid item xs={12}>
          <CustomDateRangePicker start={start} end={end} setStart={setStart} setEnd={setEnd} companyId={companyId} onCompanyChange={setCompanyId} />
        </Grid>
        <Grid item xs={12}>
          <Overview handleOpenModal={handleOpenWOModal} start={start} end={end} companyId={companyId} />
        </Grid>
        <Grid item xs={12}>
          <DowntimesByAsset handleOpenModal={handleOpenWOModal} start={start} end={end} assetColors={assetColors} companyId={companyId} />
        </Grid>
        <Grid item xs={12} md={6}>
          <RepairTimeByAsset handleOpenModal={handleOpenWOModal} start={start}
                             end={end}
                             assetColors={assetColors} companyId={companyId} />
        </Grid>
        <Grid item xs={12} md={6}>
          <MTBFByAsset handleOpenModal={handleOpenWOModal} start={start} end={end} assetColors={assetColors} companyId={companyId} />
        </Grid>

        <Grid item xs={12} md={12}>
          <MeantimesTrends handleOpenModal={handleOpenWOModal} start={start} end={end} companyId={companyId} />
        </Grid>
      </Grid>
      </Box>
    </>
  );
}

export default WOStatusStats;
