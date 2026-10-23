import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Link,
  Stack,
  Typography,
  useTheme
} from '@mui/material';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from '../../../../store';
import { deleteLabor } from '../../../../slices/labor';
import { CompanySettingsContext } from '../../../../contexts/CompanySettingsContext';
import { CustomSnackBarContext } from '../../../../contexts/CustomSnackBarContext';
import useAuth from '../../../../hooks/useAuth';
import { PermissionEntity } from '../../../../models/owns/role';
import { getHoursAndMinutesAndSeconds } from '../../../../utils/formatters';
import { getUserUrl } from '../../../../utils/urlPaths';
import { getErrorMessage } from '../../../../utils/api';
import WorkOrder from '../../../../models/owns/workOrder';
import Labor from '../../../../models/owns/labor';
import { useBrand } from '../../../../hooks/useBrand';
import AddTimeModal from './AddTimeModal';
import ConfirmDialog from '../../components/ConfirmDialog';
import SectionCard from '../../components/SectionCard';
import { CardBody, DetailRow, MutedText } from '../../components/DetailsKit';
import { alpha } from '@mui/material/styles';
import TimerTwoToneIcon from '@mui/icons-material/TimerTwoTone';
import AddTwoToneIcon from '@mui/icons-material/AddTwoTone';

interface TimeSectionProps {
  workOrder: WorkOrder;
  labors: Labor[];
  loading: boolean;
}

const getLaborCost = (labor: Labor): number => {
  const [hours, minutes] = getHoursAndMinutesAndSeconds(labor.duration);
  return Number((labor.hourlyRate * (hours + minutes / 60)).toFixed(2));
};

export default function TimeSection({
  workOrder,
  labors,
  loading
}: TimeSectionProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { getFormattedCurrency } = useContext(CompanySettingsContext);
  const { showSnackBar } = useContext(CustomSnackBarContext);
  const { hasEditPermission } = useAuth();
  const brandConfig = useBrand();
  const [openAddTimeModal, setOpenAddTimeModal] = useState<boolean>(false);
  const [selectedLabor, setSelectedLabor] = useState<Labor | null>(null);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState<boolean>(false);
  const [laborToDelete, setLaborToDelete] = useState<Labor | null>(null);

  const handleEdit = (labor: Labor) => {
    setSelectedLabor(labor);
    setOpenAddTimeModal(true);
  };

  const handleDelete = (labor: Labor) => {
    setLaborToDelete(labor);
    setOpenDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (laborToDelete) {
      dispatch(deleteLabor(workOrder.id, laborToDelete.id)).catch((err) =>
        showSnackBar(getErrorMessage(err), 'error')
      );
    }
    setOpenDeleteConfirm(false);
    setLaborToDelete(null);
  };

  const canEdit = hasEditPermission(PermissionEntity.WORK_ORDERS, workOrder);

  const unloggedLabors = labors.filter((labor) => !labor.logged);

  return (
    <Box>
      <SectionCard
        title="labors"
        icon={<TimerTwoToneIcon fontSize="small" />}
        noPadding
        actions={
          canEdit ? (
            <Button
              size="small"
              startIcon={<AddTwoToneIcon />}
              onClick={() => {
                setSelectedLabor(null);
                setOpenAddTimeModal(true);
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
              {t('add_time')}
            </Button>
          ) : undefined
        }
      >
        {loading ? (
          <CardBody>
            <Stack width={'100%'} alignItems="center">
              <CircularProgress size={28} />
            </Stack>
          </CardBody>
        ) : !unloggedLabors.length ? (
          <CardBody>
            <MutedText>
              {t('no_labor', { shortBrandName: brandConfig.shortName })}
            </MutedText>
          </CardBody>
        ) : (
          <Box>
            {unloggedLabors.map((labor) => (
              <DetailRow key={labor.id}>
                <Box sx={{ flex: 1, minWidth: 0, textAlign: 'start' }}>
                  {labor.assignedTo ? (
                    <Link
                      href={getUserUrl(labor.assignedTo.id)}
                      underline="hover"
                      sx={{ fontWeight: 600, fontSize: 14 }}
                    >
                      {`${labor.assignedTo.firstName} ${labor.assignedTo.lastName}`}
                    </Link>
                  ) : (
                    <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
                      {t('not_assigned')}
                    </Typography>
                  )}
                  <Typography
                    sx={{ color: 'text.secondary', fontSize: 12.5, mt: 0.25 }}
                  >
                    <bdi>{`${
                      getHoursAndMinutesAndSeconds(labor.duration)[0]
                    }h ${getHoursAndMinutesAndSeconds(labor.duration)[1]}m`}</bdi>
                  </Typography>
                </Box>
                <Typography
                  sx={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap' }}
                >
                  {getFormattedCurrency(getLaborCost(labor))}
                </Typography>
                {canEdit && (
                  <Stack direction="row" spacing={0.5}>
                    <IconButton size="small" onClick={() => handleEdit(labor)}>
                      <EditTwoToneIcon fontSize="small" color="primary" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(labor)}
                    >
                      <DeleteTwoToneIcon fontSize="small" color="error" />
                    </IconButton>
                  </Stack>
                )}
              </DetailRow>
            ))}
            <DetailRow
              sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.04) }}
            >
              <Typography sx={{ flex: 1, fontWeight: 700, fontSize: 14 }}>
                {t('total')}
              </Typography>
              <Typography sx={{ fontWeight: 700, fontSize: 14 }}>
                {getFormattedCurrency(
                  unloggedLabors.reduce(
                    (acc, labor) =>
                      labor.includeToTotalTime ? acc + getLaborCost(labor) : acc,
                    0
                  )
                )}
              </Typography>
            </DetailRow>
          </Box>
        )}
      </SectionCard>
      <AddTimeModal
        open={openAddTimeModal}
        onClose={() => {
          setOpenAddTimeModal(false);
          setSelectedLabor(null);
        }}
        workOrderId={workOrder.id}
        labor={selectedLabor}
      />
      <ConfirmDialog
        open={openDeleteConfirm}
        onCancel={() => {
          setOpenDeleteConfirm(false);
          setLaborToDelete(null);
        }}
        onConfirm={confirmDelete}
        confirmText={t('delete')}
        question={t('confirm_delete_labor')}
      />
    </Box>
  );
}
