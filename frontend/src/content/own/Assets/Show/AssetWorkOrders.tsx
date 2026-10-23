import Asset from '../../../../models/owns/asset';
import { Box, Card, CircularProgress, Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from '../../../../store';
import { useContext, useEffect } from 'react';
import { getAssetWorkOrders } from '../../../../slices/asset';
import { useNavigate } from 'react-router-dom';
import { CompanySettingsContext } from '../../../../contexts/CompanySettingsContext';
import Loading from '../../Analytics/Loading';
import SectionCard from '../../components/SectionCard';
import StatusChip from '../../components/StatusChip';
import {
  DetailRow,
  DetailRowText,
  EmptyCardBody
} from '../../components/DetailsKit';
import AssignmentTwoToneIcon from '@mui/icons-material/AssignmentTwoTone';

interface PropsType {
  asset: Asset;
}

const AssetWorkOrders = ({ asset }: PropsType) => {
  const { t }: { t: any } = useTranslation();
  const { getFormattedDate } = useContext(CompanySettingsContext);
  const { assetInfos, loadingGet } = useSelector((state) => state.assets);
  const workOrders = assetInfos[asset?.id]?.workOrders;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (asset) dispatch(getAssetWorkOrders(asset.id));
  }, [asset]);

  if (loadingGet)
    return (
      <Box
        sx={{
          height: '50vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <Loading />
      </Box>
    );
  return (
    <SectionCard
      title="work_orders"
      icon={<AssignmentTwoToneIcon fontSize="small" />}
      noPadding
    >
      {workOrders?.length ? (
        <Box>
          {workOrders.map((workOrder) => (
            <DetailRow
              key={workOrder.id}
              onClick={() => navigate(`/app/work-orders/${workOrder.id}`)}
              sx={{ flexWrap: { xs: 'wrap', sm: 'nowrap' } }}
            >
              <DetailRowText
                primary={workOrder.title}
                secondary={
                  <>
                    <bdi>{`#${workOrder.id}`}</bdi>
                    {' · '}
                    {workOrder.primaryUser
                      ? `${workOrder.primaryUser.firstName} ${workOrder.primaryUser.lastName}`
                      : t('no_primary_worker')}
                  </>
                }
              />
              <Typography
                sx={{
                  fontSize: 12.5,
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  color: workOrder.dueDate ? 'error.main' : 'text.secondary'
                }}
              >
                {workOrder.dueDate
                  ? t('due_at_date', {
                      date: getFormattedDate(workOrder.dueDate)
                    })
                  : t('no_due_date')}
              </Typography>
              <StatusChip status={workOrder.status} />
            </DetailRow>
          ))}
        </Box>
      ) : (
        <EmptyCardBody message={t('no_wo_linked_asset')} />
      )}
    </SectionCard>
  );
};

export default AssetWorkOrders;
