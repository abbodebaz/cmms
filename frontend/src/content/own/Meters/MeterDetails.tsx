import {
  Box,
  Button,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Stack,
  Tab,
  Tabs,
  Typography,
  useTheme,
  CircularProgress
} from '@mui/material';
import { ChangeEvent, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Meter from '../../../models/owns/meter';
import * as Yup from 'yup';
import Form from '../components/form';
import { getCustomFieldValuesForDetails, IField } from '../type';
import { useDispatch, useSelector } from '../../../store';
import {
  createReading,
  getReadings,
  getHistogramData
} from '../../../slices/reading';
import { CompanySettingsContext } from '../../../contexts/CompanySettingsContext';
import {
  deleteWorkOrderMeterTrigger,
  getWorkOrderMeterTriggers
} from '../../../slices/workOrderMeterTrigger';
import AddTwoToneIcon from '@mui/icons-material/AddTwoTone';
import AddTriggerModal from './AddTriggerModal';
import EditTriggerModal from './EditTriggerModal';
import MeterReadingHistory from './MeterReadingHistory';
import WorkOrderMeterTrigger from '../../../models/owns/workOrderMeterTrigger';
import useAuth from '../../../hooks/useAuth';
import { PermissionEntity } from '../../../models/owns/role';
import ImageViewer from 'react-simple-image-viewer';
import { canAddReading } from '../../../utils/overall';
import BasicField from '../components/BasicField';
import DateRangePicker from '../components/form/DateRangePicker';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { format } from 'date-fns';
import { subDays } from 'date-fns';
import useDateLocale from '../../../hooks/useDateLocale';
import { alpha } from '@mui/material/styles';
import SectionCard from '../components/SectionCard';
import { SoftChip } from '../components/StatusChip';
import {
  DetailGrid,
  DetailRow,
  DetailRowText,
  DetailsHeader,
  DetailsPage,
  DetailsTabs,
  DetailThumb,
  EmptyCardBody,
  softButtonSx
} from '../components/DetailsKit';
import InfoTwoToneIcon from '@mui/icons-material/InfoTwoTone';
import ShowChartTwoToneIcon from '@mui/icons-material/ShowChartTwoTone';
import NotificationsActiveTwoToneIcon from '@mui/icons-material/NotificationsActiveTwoTone';

interface MeterDetailsProps {
  meter: Meter;
  handleOpenUpdate: () => void;
  handleOpenDelete: () => void;
  onCopy: (meter: Meter) => void;
  onNewReading: () => void;
}
export default function MeterDetails(props: MeterDetailsProps) {
  const { meter, handleOpenUpdate, handleOpenDelete, onCopy, onNewReading } =
    props;
  const { t }: { t: any } = useTranslation();
  const dispatch = useDispatch();
  const { hasEditPermission, hasDeletePermission, hasCreatePermission } =
    useAuth();
  const [currentTab, setCurrentTab] = useState<string>('details');
  const dateLocale = useDateLocale();
  const { getFormattedDate } = useContext(CompanySettingsContext);
  const theme = useTheme();
  const { histogramData, loadingHistogram } = useSelector(
    (state) => state.readings
  );
  const { metersTriggers } = useSelector(
    (state) => state.workOrderMeterTriggers
  );
  const [openAddTriggerModal, setOpenAddTriggerModal] =
    useState<boolean>(false);
  const [openEditTriggerModal, setOpenEditTriggerModal] =
    useState<boolean>(false);
  const [currentWorkOrderMeterTrigger, setCurrentWorkOrderMeterTrigger] =
    useState<WorkOrderMeterTrigger>();
  const [isImageViewerOpen, setIsImageViewerOpen] = useState<boolean>(false);
  const [dateRange, setDateRange] = useState<[Date, Date]>([
    subDays(new Date(), 7),
    new Date()
  ]);
  const [historyFetched, setHistoryFetched] = useState(false);

  const currentMeterTriggers = metersTriggers[meter?.id] ?? [];
  const tabs = [
    { value: 'details', label: t('details') },
    { value: 'history', label: t('history') }
  ];

  useEffect(() => {
    dispatch(getWorkOrderMeterTriggers(meter.id));
  }, [meter.id]);

  useEffect(() => {
    dispatch(
      getHistogramData(
        meter.id,
        dateRange[0].toISOString(),
        dateRange[1].toISOString()
      )
    );
  }, [meter.id, dateRange]);

  const handleTabsChange = (_event: ChangeEvent<{}>, value: string): void => {
    setCurrentTab(value);
    if (value === 'history' && !historyFetched) {
      setHistoryFetched(true);
      dispatch(getReadings(meter.id));
    }
  };
  const fieldsToRender = (meter: Meter): { label: string; value: any }[] => [
    {
      label: t('location_name'),
      value: meter.location?.name
    },
    {
      label: t('asset_name'),
      value: meter.asset.name
    },
    {
      label: t('reading_frequency'),
      value: t('every_frequency_days', { frequency: meter.updateFrequency })
    },
    {
      label: t('category'),
      value: meter.meterCategory?.name
    },
    {
      label: t('assigned_to'),
      value: meter.users.reduce(
        (acc, user, index) =>
          acc + `${index !== 0 ? ',' : ''} ${user.firstName} ${user.lastName}`,
        ''
      )
    },
    ...getCustomFieldValuesForDetails(meter.customFieldValues, getFormattedDate)
  ];

  const onRefreshHistogram = () => {
    const [start, end] = [subDays(new Date(), 7), new Date()];
    setDateRange([start, end]);
    dispatch(
      getHistogramData(meter.id, start.toISOString(), end.toISOString())
    );
  };
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
  const canEditMeter = hasEditPermission(PermissionEntity.METERS, meter);
  const canDeleteMeter = hasDeletePermission(PermissionEntity.METERS, meter);
  const canCopyMeter = hasCreatePermission(PermissionEntity.METERS);
  return (
    <DetailsPage>
      <DetailsHeader
        subtitle={meter?.unit ? <bdi>{meter.unit}</bdi> : undefined}
        title={meter?.name}
        media={
          meter.image ? (
            <DetailThumb
              src={meter.image.url}
              alt={meter?.name}
              size={80}
              onClick={() => setIsImageViewerOpen(true)}
            />
          ) : undefined
        }
        chips={
          meter.meterCategory?.name ? (
            <SoftChip
              tone="neutral"
              size="medium"
              label={meter.meterCategory.name}
            />
          ) : undefined
        }
        actions={
          canEditMeter || canCopyMeter || canDeleteMeter ? (
            <>
              {canEditMeter && (
                <IconButton aria-label={t('edit')} onClick={handleOpenUpdate}>
                  <EditTwoToneIcon fontSize="small" color="primary" />
                </IconButton>
              )}
              {canCopyMeter && (
                <IconButton
                  aria-label={t('copy')}
                  onClick={() => onCopy(meter)}
                >
                  <ContentCopyIcon fontSize="small" color="primary" />
                </IconButton>
              )}
              {canDeleteMeter && (
                <IconButton aria-label={t('delete')} onClick={handleOpenDelete}>
                  <DeleteTwoToneIcon fontSize="small" color="error" />
                </IconButton>
              )}
            </>
          ) : undefined
        }
      />
      <DetailsTabs onChange={handleTabsChange} value={currentTab}>
        {tabs.map((tab) => (
          <Tab key={tab.value} label={tab.label} value={tab.value} />
        ))}
      </DetailsTabs>
      <Box>
        {currentTab === 'details' && (
          <Stack spacing={2.5}>
            <SectionCard
              title="meter_details"
              icon={<InfoTwoToneIcon fontSize="small" />}
            >
              <DetailGrid>
                {fieldsToRender(meter).map((field) => (
                  <BasicField key={field.label} {...field} />
                ))}
              </DetailGrid>
            </SectionCard>
            <SectionCard
              title="reading"
              icon={<ShowChartTwoToneIcon fontSize="small" />}
            >
              <Box sx={{ mb: 2 }}>
                <DateRangePicker
                  value={dateRange}
                  onChange={(range) => setDateRange(range)}
                />
              </Box>
              {loadingHistogram ? (
                <Box display="flex" justifyContent="center" py={4}>
                  <CircularProgress size={28} />
                </Box>
              ) : histogramData.length > 0 ? (
                <Box sx={{ direction: 'ltr' }}>
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={histogramData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={alpha(theme.palette.text.primary, 0.1)}
                      />
                      <XAxis
                        dataKey="date"
                        tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                        tickFormatter={(d) =>
                          format(new Date(d), 'MMM dd', { locale: dateLocale })
                        }
                      />
                      <YAxis
                        tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                      />
                      <Tooltip
                        labelFormatter={(d) =>
                          format(new Date(d), 'MMM dd, yyyy', {
                            locale: dateLocale
                          })
                        }
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        strokeWidth={2}
                        stroke={theme.palette.primary.main}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              ) : (
                <Typography
                  sx={{ color: 'text.secondary', fontSize: 14 }}
                  textAlign="center"
                  py={4}
                >
                  {t('no_data')}
                </Typography>
              )}
              {canAddReading(meter) && canEditMeter ? (
                <Box
                  sx={{
                    mt: 2,
                    pt: 2,
                    borderTop: `1px solid ${alpha(
                      theme.palette.primary.main,
                      0.1
                    )}`
                  }}
                >
                  <Form
                    fields={fields}
                    validation={Yup.object().shape(shape)}
                    submitText={t('add_reading')}
                    values={{ value: 0 }}
                    onSubmit={async (values) => {
                      return dispatch(createReading(meter.id, values))
                        .then(onNewReading)
                        .then(onRefreshHistogram);
                    }}
                  />
                </Box>
              ) : null}
            </SectionCard>
            <SectionCard
              title="wo_triggers"
              icon={<NotificationsActiveTwoToneIcon fontSize="small" />}
              noPadding
              actions={
                canEditMeter ? (
                  <Button
                    size="small"
                    startIcon={<AddTwoToneIcon />}
                    sx={softButtonSx}
                    onClick={() => setOpenAddTriggerModal(true)}
                  >
                    {t('add_trigger')}
                  </Button>
                ) : undefined
              }
            >
              {currentMeterTriggers.length ? (
                <Box>
                  {currentMeterTriggers.map((trigger) => (
                    <DetailRow key={trigger.id}>
                      <DetailRowText
                        primary={trigger.name}
                        secondary={
                          <bdi>{`${
                            trigger.triggerCondition === 'MORE_THAN'
                              ? t('greater_than')
                              : t('lower_than')
                          } ${trigger.value} ${meter.unit}`}</bdi>
                        }
                      />
                      <Stack spacing={0.5} direction="row">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setCurrentWorkOrderMeterTrigger(
                              currentMeterTriggers.find(
                                (t) => t.id === trigger.id
                              )
                            );
                            setOpenEditTriggerModal(true);
                          }}
                        >
                          <EditTwoToneIcon fontSize="small" color="primary" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => {
                            dispatch(
                              deleteWorkOrderMeterTrigger(meter.id, trigger.id)
                            );
                          }}
                        >
                          <DeleteTwoToneIcon fontSize="small" color="error" />
                        </IconButton>
                      </Stack>
                    </DetailRow>
                  ))}
                </Box>
              ) : (
                <EmptyCardBody message="—" />
              )}
            </SectionCard>
          </Stack>
        )}
        {currentTab === 'history' && (
          <MeterReadingHistory
            meter={meter}
            historyFetched={historyFetched}
            onRefreshHistogram={onRefreshHistogram}
          />
        )}
      </Box>
      <AddTriggerModal
        open={openAddTriggerModal}
        onClose={() => setOpenAddTriggerModal(false)}
        meter={meter}
      />
      <EditTriggerModal
        open={openEditTriggerModal}
        onClose={() => setOpenEditTriggerModal(false)}
        meter={meter}
        workOrderMeterTrigger={currentWorkOrderMeterTrigger}
      />
      {isImageViewerOpen && (
        <div style={{ zIndex: 100 }}>
          <ImageViewer
            src={[meter.image.url]}
            currentIndex={0}
            onClose={() => setIsImageViewerOpen(false)}
            disableScroll={true}
            backgroundStyle={{
              backgroundColor: 'rgba(0,0,0,0.9)'
            }}
            closeOnClickOutside={true}
          />
        </div>
      )}
    </DetailsPage>
  );
}
