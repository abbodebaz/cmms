import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Stack,
  Typography,
  useTheme
} from '@mui/material';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import { Fragment, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from '../../../../store';
import { deleteAdditionalCost } from '../../../../slices/additionalCost';
import { CompanySettingsContext } from '../../../../contexts/CompanySettingsContext';
import { CustomSnackBarContext } from '../../../../contexts/CustomSnackBarContext';
import useAuth from '../../../../hooks/useAuth';
import { PermissionEntity } from '../../../../models/owns/role';
import { getErrorMessage } from '../../../../utils/api';
import WorkOrder from '../../../../models/owns/workOrder';
import AdditionalCost from '../../../../models/owns/additionalCost';
import AddCostModal from './AddCostModal';
import ConfirmDialog from '../../components/ConfirmDialog';
import SectionCard from '../../components/SectionCard';
import { CardBody, DetailRow, MutedText } from '../../components/DetailsKit';
import { alpha } from '@mui/material/styles';
import PaymentsTwoToneIcon from '@mui/icons-material/PaymentsTwoTone';
import AddTwoToneIcon from '@mui/icons-material/AddTwoTone';
interface CostSectionProps {
  workOrder: WorkOrder;
  additionalCosts: AdditionalCost[];
  loading: boolean;
}

export default function CostSection({
  workOrder,
  additionalCosts,
  loading
}: CostSectionProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { getFormattedCurrency, getFormattedDate } = useContext(
    CompanySettingsContext
  );
  const { showSnackBar } = useContext(CustomSnackBarContext);
  const { hasEditPermission } = useAuth();
  const [openAddCostModal, setOpenAddCostModal] = useState<boolean>(false);
  const [selectedCost, setSelectedCost] = useState<AdditionalCost | null>(null);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState<boolean>(false);
  const [costToDelete, setCostToDelete] = useState<AdditionalCost | null>(null);

  const handleEdit = (cost: AdditionalCost) => {
    setSelectedCost(cost);
    setOpenAddCostModal(true);
  };

  const handleDelete = (cost: AdditionalCost) => {
    setCostToDelete(cost);
    setOpenDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (costToDelete) {
      dispatch(deleteAdditionalCost(workOrder.id, costToDelete.id)).catch(
        (err) => showSnackBar(getErrorMessage(err), 'error')
      );
    }
    setOpenDeleteConfirm(false);
    setCostToDelete(null);
  };

  const canEdit = hasEditPermission(PermissionEntity.WORK_ORDERS, workOrder);

  return (
    <Box>
      <SectionCard
        title="additional_costs"
        icon={<PaymentsTwoToneIcon fontSize="small" />}
        noPadding
        actions={
          canEdit ? (
            <Button
              size="small"
              startIcon={<AddTwoToneIcon />}
              onClick={() => {
                setSelectedCost(null);
                setOpenAddCostModal(true);
              }}
              sx={{
                borderRadius: '10px',
                fontWeight: 700,
                color: theme.palette.primary.dark,
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.16)
                }
              }}
            >
              {t('add_additional_cost')}
            </Button>
          ) : undefined
        }
      >
        {loading ? (
          <CardBody>
            <Stack width={'100%'} alignItems={'center'}>
              <CircularProgress size={28} />
            </Stack>
          </CardBody>
        ) : (
          <Fragment>
            {!additionalCosts.length ? (
              <CardBody>
                <MutedText>{t('no_additional_cost')}</MutedText>
              </CardBody>
            ) : (
              <Box>
                {additionalCosts.map((additionalCost) => (
                  <DetailRow key={additionalCost.id}>
                    <Box sx={{ flex: 1, minWidth: 0, textAlign: 'start' }}>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          fontSize: 14,
                          wordBreak: 'break-word'
                        }}
                      >
                        {additionalCost.description}
                      </Typography>
                      <Typography
                        sx={{ color: 'text.secondary', fontSize: 12.5, mt: 0.25 }}
                      >
                        {getFormattedDate(additionalCost.createdAt)}
                      </Typography>
                    </Box>
                    <Typography
                      sx={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap' }}
                    >
                      {getFormattedCurrency(additionalCost.cost)}
                    </Typography>
                    {canEdit && (
                      <Stack direction="row" spacing={0.5}>
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(additionalCost)}
                        >
                          <EditTwoToneIcon fontSize="small" color="primary" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(additionalCost)}
                        >
                          <DeleteTwoToneIcon fontSize="small" color="error" />
                        </IconButton>
                      </Stack>
                    )}
                  </DetailRow>
                ))}
                <DetailRow
                  sx={{
                    backgroundColor: alpha(theme.palette.primary.main, 0.04)
                  }}
                >
                  <Typography sx={{ flex: 1, fontWeight: 700, fontSize: 14 }}>
                    {t('total')}
                  </Typography>
                  <Typography sx={{ fontWeight: 700, fontSize: 14 }}>
                    {getFormattedCurrency(
                      additionalCosts.reduce(
                        (acc, additionalCost) =>
                          additionalCost.includeToTotalCost
                            ? acc + additionalCost.cost
                            : acc,
                        0
                      )
                    )}
                  </Typography>
                </DetailRow>
              </Box>
            )}
          </Fragment>
        )}
      </SectionCard>
      <AddCostModal
        open={openAddCostModal}
        onClose={() => {
          setOpenAddCostModal(false);
          setSelectedCost(null);
        }}
        workOrderId={workOrder.id}
        additionalCost={selectedCost}
      />
      <ConfirmDialog
        open={openDeleteConfirm}
        onCancel={() => {
          setOpenDeleteConfirm(false);
          setCostToDelete(null);
        }}
        onConfirm={confirmDelete}
        confirmText={t('delete')}
        question={t('confirm_delete_additional_cost')}
      />
    </Box>
  );
}
