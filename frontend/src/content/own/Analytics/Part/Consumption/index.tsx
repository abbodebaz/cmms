import { Helmet } from 'react-helmet-async';
import { Box, Grid } from '@mui/material';
import InsightsTwoToneIcon from '@mui/icons-material/InsightsTwoTone';
import PageHeading from '../../../Settings/components/PageHeading';
import { useTranslation } from 'react-i18next';
import { useContext, useEffect, useState } from 'react';
import { TitleContext } from '../../../../../contexts/TitleContext';
import useAuth from '../../../../../hooks/useAuth';
import Overview from './Overview';
import { Filter } from '../WOModal';
import PartConsumptionsByDate from './PartConsumptionsByDate';
import CustomDateRangePicker from '../../CustomDateRangePicker';
import PartConsumptionsPareto from './PartConsumptionsPareto';
import PartConsumptionsByAsset from './PartConsumptionsByAsset';
import PartConsumptionByCategory from './PartConsumptionByCategory';
import PartConsumptionByWOCategory from './PartConsumptionByWOCategory';

interface WOStatusStatsProps {
  handleOpenWOModal: (
    columns: string[],
    filters: Filter[],
    title: string
  ) => void;
}

function PartsConsumption({ handleOpenWOModal }: WOStatusStatsProps) {
  const { t }: { t: any } = useTranslation();
  const { setTitle } = useContext(TitleContext);
  const [end, setEnd] = useState(new Date());
  const nowMinusMonth = new Date();
  nowMinusMonth.setMonth(nowMinusMonth.getMonth() - 1);
  const [start, setStart] = useState(nowMinusMonth);
  const { user } = useAuth();
  const [companyId, setCompanyId] = useState<number | undefined>(
    user?.superAccountRelations?.[0]?.childCompanyId ?? undefined
  );

  useEffect(() => {
    setTitle(t('parts_consumption'));
  }, []);

  return (
    <>
      <Helmet>
        <title>{t('parts_consumption')}</title>
      </Helmet>
      <Box sx={{ px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 } }}>
        <PageHeading
          title={t('parts_consumption')}
          description={t('analytics_page_description')}
          icon={<InsightsTwoToneIcon />}
        />
      <Grid container alignItems="stretch" spacing={{ xs: 2, md: 2.5 }}>
        <Grid item xs={12}>
          <CustomDateRangePicker start={start} end={end} setStart={setStart} setEnd={setEnd} companyId={companyId} onCompanyChange={setCompanyId} />
        </Grid>
        <Grid item xs={12} md={12}>
          <Overview handleOpenModal={handleOpenWOModal} start={start} end={end} companyId={companyId} />
        </Grid>
        <Grid item xs={12} md={6}>
          <PartConsumptionsPareto handleOpenModal={handleOpenWOModal} start={start} end={end} companyId={companyId} />
        </Grid>
        <Grid item xs={12} md={6}>
          <PartConsumptionsByAsset handleOpenModal={handleOpenWOModal} start={start} end={end} companyId={companyId} />
        </Grid>
        <Grid item xs={12} md={6}>
          <PartConsumptionByCategory handleOpenModal={handleOpenWOModal} start={start} end={end} companyId={companyId} />
        </Grid>
        <Grid item xs={12} md={6}>
          <PartConsumptionByWOCategory handleOpenModal={handleOpenWOModal} start={start} end={end} companyId={companyId} />
        </Grid>
        <Grid item xs={12}>
          <PartConsumptionsByDate handleOpenModal={handleOpenWOModal} start={start} end={end} companyId={companyId} />
        </Grid>
      </Grid>
      </Box>
    </>
  );
}

export default PartsConsumption;
