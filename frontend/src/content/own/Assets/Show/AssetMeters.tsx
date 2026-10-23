import {
  Box,
  Button,
  Card,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Select,
  Stack,
  Typography
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import SectionCard from '../../components/SectionCard';
import SpeedTwoToneIcon from '@mui/icons-material/SpeedTwoTone';
import { alpha } from '@mui/material/styles';
import CustomDataGrid from '../../components/CustomDatagrid';
import { GridRowParams, GridToolbar } from '@mui/x-data-grid';
import { GridEnrichedColDef } from '@mui/x-data-grid/models/colDef/gridColDef';
import { AssetDTO } from '../../../../models/owns/asset';
import { useDispatch, useSelector } from '../../../../store';
import { getMetersByAsset } from '../../../../slices/meter';
import { useContext, useEffect, useState } from 'react';
import Meter from '../../../../models/owns/meter';
import { createReading, getReadings } from '../../../../slices/reading';
import { CompanySettingsContext } from '../../../../contexts/CompanySettingsContext';
import AddTwoToneIcon from '@mui/icons-material/AddTwoTone';
import Form from '../../components/form';
import * as Yup from 'yup';
import { IField } from '../../type';
import { CustomSnackBarContext } from '../../../../contexts/CustomSnackBarContext';
import { canAddReading } from '../../../../utils/overall';
import useAuth from '../../../../hooks/useAuth';
import { PermissionEntity } from '../../../../models/owns/role';
import FormDialogTitle from '../../components/form/FormDialogTitle';

interface PropsType {
  asset: AssetDTO;
}

const AssetMeters = ({ asset }: PropsType) => {
  const { t }: { t: any } = useTranslation();
  const dispatch = useDispatch();
  const { metersByAsset, loadingGet: loadingMeters } = useSelector(
    (state) => state.meters
  );
  const { readingsByMeter, loadingGet } = useSelector(
    (state) => state.readings
  );
  const meters = metersByAsset[asset?.id] ?? [];
  const [selectedMeter, setSelectedMeter] = useState<Meter>();
  const { hasEditPermission } = useAuth();
  const { getFormattedDate, getUserNameById } = useContext(
    CompanySettingsContext
  );
  const [openReadingModal, setOpenReadingModal] = useState<boolean>(false);
  const readings = readingsByMeter[selectedMeter?.id] ?? [];
  const { showSnackBar } = useContext(CustomSnackBarContext);
  const [canAddReadingInternal, setCanAddReadingInternal] =
    useState<boolean>(true);
  useEffect(() => {
    if (asset) dispatch(getMetersByAsset(asset?.id));
  }, [asset?.id]);

  useEffect(() => {
    if (meters.length) {
      setSelectedMeter(meters[0]);
    }
  }, [meters]);

  useEffect(() => {
    if (!readingsByMeter[selectedMeter?.id] && selectedMeter) {
      dispatch(getReadings(selectedMeter?.id));
    }
  }, [selectedMeter]);

  const onCreationSuccess = () => {
    setOpenReadingModal(false);
    showSnackBar(t('reading_create_success'), 'success');
  };
  const onCreationFailure = (err) =>
    showSnackBar(t('reading_create_failure'), 'error');

  const columns: GridEnrichedColDef[] = [
    {
      field: 'value',
      headerName: t('reading'),
      description: t('reading'),
      width: 150,
      valueGetter: (params) => `${params.value} ${selectedMeter.unit}`
    },
    {
      field: 'createdAt',
      headerName: t('date'),
      description: t('date'),
      width: 150,
      valueGetter: (params) => getFormattedDate(params.value)
    },
    {
      field: 'createdBy',
      headerName: t('added_by'),
      description: t('added_by'),
      width: 150,
      valueGetter: (params) => getUserNameById(params.value)
    }
  ];
  const fields: Array<IField> = [
    {
      name: 'value',
      type: 'number',
      label: t('reading'),
      placeholder: t('enter_meter_value'),
      required: true
    }
  ];
  const renderReadingModal = () => (
    <Dialog
      fullWidth
      maxWidth="md"
      open={openReadingModal}
      onClose={() => setOpenReadingModal(false)}
    >
      <FormDialogTitle
        title={t('add_reading')}
        onClose={() => setOpenReadingModal(false)}
      />
      <DialogContent
        dividers
        sx={{
          p: 3
        }}
      >
        <Box>
          <Form
            fields={fields}
            validation={Yup.object().shape({})}
            submitText={t('add')}
            values={{}}
            onChange={({ field, e }) => {}}
            onSubmit={async (values) => {
              return dispatch(createReading(selectedMeter.id, values))
                .then(onCreationSuccess)
                .then(() => setCanAddReadingInternal(false))
                .catch(onCreationFailure);
            }}
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
  return (
    <Box>
      <SectionCard
        title="meters"
        icon={<SpeedTwoToneIcon fontSize="small" />}
        noPadding
      >
        {!!meters.length && (
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', sm: 'center' }}
            gap={1.5}
            sx={{
              px: { xs: 2, sm: 2.5 },
              py: 1.75,
              borderBottom: (theme) =>
                `1px solid ${alpha(theme.palette.primary.main, 0.08)}`
            }}
          >
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <Typography
                sx={{ color: 'text.secondary', fontSize: 13, fontWeight: 500 }}
              >
                {t('select_meter')}
              </Typography>
              <Select
                size="small"
                value={selectedMeter?.id ?? ''}
                sx={{ minWidth: 200, borderRadius: '10px' }}
                onChange={(event) => {
                  setSelectedMeter(
                    meters.find(
                      (meter) => meter.id === Number(event.target.value)
                    )
                  );
                }}
              >
                <MenuItem value={''}>{t('select_meter')}</MenuItem>
                {meters.map((meter) => (
                  <MenuItem key={meter.id} value={meter.id}>
                    {meter.name}
                  </MenuItem>
                ))}
              </Select>
            </Stack>

            {hasEditPermission(PermissionEntity.ASSETS, asset) && (
              <Button
                startIcon={<AddTwoToneIcon />}
                variant="contained"
                sx={(theme) => ({
                  borderRadius: '12px',
                  fontWeight: 700,
                  boxShadow: `0 6px 16px ${alpha(
                    theme.palette.primary.main,
                    0.28
                  )}`
                })}
                disabled={
                  !(canAddReading(selectedMeter) && canAddReadingInternal)
                }
                onClick={() => setOpenReadingModal(true)}
              >
                {t('add_reading')}
              </Button>
            )}
          </Stack>
        )}
        <Box sx={{ width: '100%' }}>
          <CustomDataGrid
            columns={columns}
            rows={readings}
            components={{
              Toolbar: GridToolbar
            }}
            loading={loadingMeters || loadingGet}
            onRowClick={(params: GridRowParams<Meter>) => null}
            initialState={{
              columns: {
                columnVisibilityModel: {}
              }
            }}
          />
        </Box>
      </SectionCard>
      {renderReadingModal()}
    </Box>
  );
};

export default AssetMeters;
