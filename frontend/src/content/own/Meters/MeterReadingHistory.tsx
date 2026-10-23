import {
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography
} from '@mui/material';
import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import Meter from '../../../models/owns/meter';
import Reading from '../../../models/owns/reading';
import Form from '../components/form';
import * as Yup from 'yup';
import { IField } from '../type';
import { useDispatch, useSelector } from '../../../store';
import { deleteReading, updateReading } from '../../../slices/reading';
import { CompanySettingsContext } from '../../../contexts/CompanySettingsContext';
import ConfirmDialog from '../components/ConfirmDialog';
import { CustomSnackBarContext } from '../../../contexts/CustomSnackBarContext';
import useAuth from '../../../hooks/useAuth';
import { PermissionEntity } from '../../../models/owns/role';
import FormDialogTitle from '../components/form/FormDialogTitle';
import SectionCard from '../components/SectionCard';
import {
  CardLoading,
  DetailRow,
  DetailRowText,
  EmptyCardBody,
  IconTile
} from '../components/DetailsKit';
import HistoryTwoToneIcon from '@mui/icons-material/HistoryTwoTone';
import SpeedTwoToneIcon from '@mui/icons-material/SpeedTwoTone';

interface MeterReadingHistoryProps {
  meter: Meter;
  historyFetched: boolean;
  onRefreshHistogram: () => void;
}

export default function MeterReadingHistory({
  meter,
  historyFetched,
  onRefreshHistogram
}: MeterReadingHistoryProps) {
  const { t }: { t: any } = useTranslation();
  const dispatch = useDispatch();
  const { hasEditPermission, hasDeletePermission } = useAuth();
  const { getFormattedDate } = useContext(CompanySettingsContext);
  const { showSnackBar } = useContext(CustomSnackBarContext);
  const { readingsByMeter, loadingGet } = useSelector(
    (state) => state.readings
  );
  const currentMeterReadings = readingsByMeter[meter?.id] ?? [];

  const [editingReading, setEditingReading] = useState<Reading | null>(null);
  const [deletingReading, setDeletingReading] = useState<Reading | null>(null);

  const fields: Array<IField> = [
    {
      name: 'value',
      type: 'number',
      label: t('reading'),
      placeholder: t('enter_meter_value'),
      required: true
    }
  ];
  const shape = {
    value: Yup.number().required(t('required_reading_value'))
  };

  const handleDelete = async () => {
    if (!deletingReading) return;
    try {
      await dispatch(deleteReading(meter.id, deletingReading.id));
      showSnackBar(t('operation_success'), 'success');
      onRefreshHistogram();
    } catch (err) {
      showSnackBar(t('an_error_occured'), 'error');
      console.error(err);
    }
    setDeletingReading(null);
  };

  return (
    <>
      {historyFetched ? (
        <SectionCard
          title="history"
          icon={<HistoryTwoToneIcon fontSize="small" />}
          noPadding
        >
          {loadingGet ? (
            <CardLoading />
          ) : !currentMeterReadings.length ? (
            <EmptyCardBody message={t('no_data')} />
          ) : (
            <Box>
              {[...currentMeterReadings].reverse().map((reading) => (
                <DetailRow key={reading.id}>
                  <IconTile>
                    <SpeedTwoToneIcon fontSize="small" />
                  </IconTile>
                  <DetailRowText
                    primary={<bdi>{`${reading.value} ${meter.unit}`}</bdi>}
                    secondary={getFormattedDate(reading.createdAt)}
                  />
                  <Stack spacing={0.5} direction="row">
                    {hasEditPermission(PermissionEntity.METERS, meter) && (
                      <IconButton
                        size="small"
                        onClick={() => setEditingReading(reading)}
                      >
                        <EditTwoToneIcon fontSize="small" color={'primary'} />
                      </IconButton>
                    )}
                    {hasDeletePermission(PermissionEntity.METERS, meter) && (
                      <IconButton
                        size="small"
                        onClick={() => setDeletingReading(reading)}
                      >
                        <DeleteTwoToneIcon fontSize="small" color="error" />
                      </IconButton>
                    )}
                  </Stack>
                </DetailRow>
              ))}
            </Box>
          )}
        </SectionCard>
      ) : null}

      <Dialog
        fullWidth
        maxWidth="sm"
        open={!!editingReading}
        onClose={() => setEditingReading(null)}
      >
        <FormDialogTitle
          title={t('edit_reading')}
          onClose={() => setEditingReading(null)}
        />
        <DialogContent dividers sx={{ p: 3 }}>
          <Form
            fields={fields}
            validation={Yup.object().shape(shape)}
            submitText={t('save')}
            values={{ value: editingReading?.value ?? 0 }}
            onSubmit={async (values) => {
              try {
                await dispatch(
                  updateReading(meter.id, editingReading.id, {
                    value: values.value
                  })
                );
                showSnackBar(t('operation_success'), 'success');
                onRefreshHistogram();
                setEditingReading(null);
              } catch {
                showSnackBar(t('an_error_occured'), 'error');
              }
            }}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deletingReading}
        onCancel={() => setDeletingReading(null)}
        onConfirm={handleDelete}
        confirmText={t('delete')}
        question={t('are_you_sure_delete_reading')}
      />
    </>
  );
}
