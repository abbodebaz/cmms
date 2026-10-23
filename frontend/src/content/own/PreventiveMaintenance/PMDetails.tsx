import {
  Box,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  Link,
  Menu,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  Typography,
  useTheme
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import MoreVertTwoToneIcon from '@mui/icons-material/MoreVertTwoTone';
import PlayArrowTwoToneIcon from '@mui/icons-material/PlayArrowTwoTone';
import PreventiveMaintenance from '../../../models/owns/preventiveMaintenance';
import { useDispatch } from '../../../store';
import {
  editPreventiveMaintenance,
  triggerWorkOrder
} from '../../../slices/preventiveMaintenance';
import React, { useContext, useEffect, useState } from 'react';
import {
  getAssetUrl,
  getLocationUrl,
  getTeamUrl,
  getUserUrl,
  getWorkOrderUrl
} from '../../../utils/urlPaths';
import useAuth from '../../../hooks/useAuth';
import { PermissionEntity } from '../../../models/owns/role';
import ImageViewer from 'react-simple-image-viewer';
import { CompanySettingsContext } from '../../../contexts/CompanySettingsContext';
import { CustomSnackBarContext } from '../../../contexts/CustomSnackBarContext';
import FilesList from '../components/FilesList';
import BasicField from '../components/BasicField';
import DualDate from '../components/DualDate';
import { getTasksByPreventiveMaintenance } from '../../../slices/task';
import Tasks from '../WorkOrders/Details/Tasks';
import { Task } from '../../../models/owns/tasks';
import { getScheduleDescription } from '../../../utils/dates';
import i18n from 'i18next';
import RecentWorkOrders from './RecentWorkOrders';
import { useNavigate } from 'react-router-dom';
import useDateLocale from '../../../hooks/useDateLocale';
import { getCustomFieldValuesForDetails } from '../type';
import { getErrorMessage } from '../../../utils/api';
import { ContentCopyTwoTone } from '@mui/icons-material';
import { WorkOrderMini } from '../../../models/owns/workOrder';
import SectionCard from '../components/SectionCard';
import { SoftChip } from '../components/StatusChip';
import PriorityWrapper from '../components/PriorityWrapper';
import {
  DetailGrid,
  DetailItem,
  DetailsHeader,
  DetailsPage,
  DetailsTabs,
  DetailThumb
} from '../components/DetailsKit';
import InfoTwoToneIcon from '@mui/icons-material/InfoTwoTone';
import EventRepeatTwoToneIcon from '@mui/icons-material/EventRepeatTwoTone';
import PeopleAltTwoToneIcon from '@mui/icons-material/PeopleAltTwoTone';
import AttachFileTwoToneIcon from '@mui/icons-material/AttachFileTwoTone';

interface RequestDetailsProps {
  preventiveMaintenance: PreventiveMaintenance;
  handleOpenUpdate: () => void;
  handleOpenDelete: () => void;
  onCopy: (preventiveMaintenance: PreventiveMaintenance) => void;
  onClose: () => void;
  tasks: Task[];
}

export default function PMDetails({
  preventiveMaintenance,
  handleOpenUpdate,
  handleOpenDelete,
  onCopy,
  onClose,
  tasks
}: RequestDetailsProps) {
  const { t }: { t: any } = useTranslation();
  const dispatch = useDispatch();
  const theme = useTheme();
  const getLanguage = i18n.language;
  const dateLocale = useDateLocale();
  const { hasEditPermission, hasDeletePermission, hasCreatePermission } =
    useAuth();
  const navigate = useNavigate();
  const { getFormattedDate, getUserNameById } = useContext(
    CompanySettingsContext
  );
  const { showSnackBar } = useContext(CustomSnackBarContext);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState<boolean>(false);
  const [tab, setTab] = React.useState<number>(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);
  const [triggering, setTriggering] = useState<boolean>(false);

  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };
  const handleTriggerWorkOrder = () => {
    handleCloseMenu();
    setTriggering(true);
    dispatch(triggerWorkOrder(preventiveMaintenance.id))
      .then((workOrder: WorkOrderMini) => {
        showSnackBar(t('wo_create_success'), 'success');
        navigate(getWorkOrderUrl(workOrder.id));
      })
      .catch((err) => showSnackBar(getErrorMessage(err), 'error'))
      .finally(() => setTriggering(false));
  };

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  useEffect(() => {
    dispatch(getTasksByPreventiveMaintenance(preventiveMaintenance.id));
  }, [preventiveMaintenance.id]);

  const fieldsToRender = (
    preventiveMaintenance: PreventiveMaintenance
  ): { label: string; value: string | number; hijriDate?: string }[] => [
    {
      label: t('title'),
      value: preventiveMaintenance.title
    },
    {
      label: t('description'),
      value: preventiveMaintenance.description
    },
    {
      label: t('priority'),
      value: preventiveMaintenance.priority
    },
    {
      label: t('due_date_delay'),
      value:
        preventiveMaintenance.schedule.dueDateDelay === null
          ? null
          : t('days_count', {
              days: preventiveMaintenance.schedule.dueDateDelay
            })
    },
    {
      label: t('estimated_start_date'),
      value: getFormattedDate(preventiveMaintenance.estimatedStartDate),
      hijriDate: preventiveMaintenance.estimatedStartDate
    },
    {
      label: t('estimated_duration'),
      value: preventiveMaintenance.estimatedDuration
    },
    {
      label: t('category'),
      value: preventiveMaintenance?.category?.name
    },
    ...(preventiveMaintenance?.requiredSignature
      ? [
          {
            label: t('required_signature'),
            value: t('yes')
          }
        ]
      : []),
    ...getCustomFieldValuesForDetails(
      preventiveMaintenance.customFieldValues,
      getFormattedDate
    )
  ];
  const pm = preventiveMaintenance;
  const canEditPM = hasEditPermission(PermissionEntity.PREVENTIVE_MAINTENANCES, pm);
  const canDeletePM = hasDeletePermission(
    PermissionEntity.PREVENTIVE_MAINTENANCES,
    pm
  );
  const canUseMenu =
    hasCreatePermission(PermissionEntity.PREVENTIVE_MAINTENANCES) ||
    hasCreatePermission(PermissionEntity.WORK_ORDERS);
  return (
    <DetailsPage>
      <DetailsHeader
        subtitle={pm?.customId ? <bdi>{`#${pm.customId}`}</bdi> : undefined}
        title={pm?.name}
        media={
          pm.image ? (
            <DetailThumb
              src={pm.image.url}
              alt={pm?.name}
              size={80}
              onClick={() => setIsImageViewerOpen(true)}
            />
          ) : undefined
        }
        chips={
          <>
            {pm?.schedule.disabled ? (
              <SoftChip tone="warning" size="medium" label={t('paused')} />
            ) : (
              <SoftChip tone="success" size="medium" label={t('active')} />
            )}
            {pm.priority && pm.priority !== 'NONE' && (
              <PriorityWrapper priority={pm.priority} withSuffix size="medium" />
            )}
          </>
        }
        actions={
          canUseMenu || canEditPM || canDeletePM ? (
            <>
              {canUseMenu && (
                <IconButton aria-label={t('more')} onClick={handleOpenMenu}>
                  <MoreVertTwoToneIcon fontSize="small" />
                </IconButton>
              )}
              {canEditPM && (
                <IconButton aria-label={t('edit')} onClick={handleOpenUpdate}>
                  <EditTwoToneIcon fontSize="small" color="primary" />
                </IconButton>
              )}
              {canDeletePM && (
                <IconButton aria-label={t('delete')} onClick={handleOpenDelete}>
                  <DeleteTwoToneIcon fontSize="small" color="error" />
                </IconButton>
              )}
            </>
          ) : undefined
        }
      />
      <DetailsTabs value={tab} onChange={handleChange}>
        <Tab label={t('details')} />
        <Tab label={t('recent_work_orders')} />
      </DetailsTabs>
      {tab === 0 ? (
        <Stack spacing={2.5}>
          <SectionCard
            title="trigger_details"
            icon={<EventRepeatTwoToneIcon fontSize="small" />}
          >
            <DetailGrid>
              {pm.schedule?.frequency && (
                <DetailItem label={t('frequency')} fullWidth>
                  {getScheduleDescription(pm.schedule, dateLocale, t)}
                </DetailItem>
              )}
              {pm.schedule?.recurrenceBasedOn && (
                <DetailItem label={t('based_on')}>
                  {pm.schedule.recurrenceBasedOn === 'SCHEDULED_DATE'
                    ? t('scheduled_date')
                    : t('completed_on')}
                </DetailItem>
              )}
              <DetailItem label={t('starts_on')}>
                {pm.schedule?.startsOn ? (
                  <DualDate date={pm.schedule.startsOn} />
                ) : null}
              </DetailItem>
              <DetailItem label={t('ends_on')}>
                {pm.schedule?.endsOn ? (
                  <DualDate date={pm.schedule.endsOn} />
                ) : null}
              </DetailItem>
              {pm?.createdBy && (
                <DetailItem label={t('created_by')}>
                  <Link href={getUserUrl(pm.createdBy)} underline="hover">
                    {getUserNameById(pm.createdBy)}
                  </Link>
                </DetailItem>
              )}
            </DetailGrid>
          </SectionCard>
          <SectionCard
            title="wo_details"
            icon={<InfoTwoToneIcon fontSize="small" />}
          >
            <DetailGrid>
              {fieldsToRender(pm)
                .filter(
                  (field) =>
                    field.label !== t('description') &&
                    field.label !== t('priority')
                )
                .map((field) => (
                  <BasicField
                    key={field.label}
                    isPriority={field.label === t('priority')}
                    {...field}
                  />
                ))}
              {pm.description && (
                <DetailItem label={t('description')} fullWidth>
                  <Box sx={{ whiteSpace: 'pre-line', fontWeight: 500 }}>
                    {pm.description}
                  </Box>
                </DetailItem>
              )}
            </DetailGrid>
          </SectionCard>
          {(pm?.asset || pm?.location || pm?.primaryUser || pm?.team) && (
            <SectionCard
              title="details_assignment"
              icon={<PeopleAltTwoToneIcon fontSize="small" />}
            >
              <DetailGrid>
                {pm?.asset && (
                  <DetailItem label={t('asset')}>
                    <Link href={getAssetUrl(pm.asset.id)} underline="hover">
                      {pm.asset.name}
                    </Link>
                  </DetailItem>
                )}
                {pm?.location && (
                  <DetailItem label={t('location')}>
                    <Link href={getLocationUrl(pm.location.id)} underline="hover">
                      {pm.location.name}
                    </Link>
                  </DetailItem>
                )}
                {pm?.primaryUser && (
                  <DetailItem label={t('assigned_to')}>
                    <Link href={getUserUrl(pm.primaryUser.id)} underline="hover">
                      {`${pm.primaryUser.firstName} ${pm.primaryUser.lastName}`}
                    </Link>
                  </DetailItem>
                )}
                {pm?.team && (
                  <DetailItem label={t('team')}>
                    <Link href={getTeamUrl(pm.team.id)} underline="hover">
                      {pm.team.name}
                    </Link>
                  </DetailItem>
                )}
              </DetailGrid>
            </SectionCard>
          )}
          {!!tasks.length && (
            <Tasks
              tasksProps={tasks}
              workOrderId={null}
              handleZoomImage={null}
              disabled={true}
            />
          )}
          {!!pm.files.length && (
            <SectionCard
              title="files"
              icon={<AttachFileTwoToneIcon fontSize="small" />}
              noPadding
            >
              <FilesList
                confirmMessage={t('confirm_delete_file')}
                removeDisabled={!canEditPM}
                files={pm.files}
                onRemove={(id: number) => {
                  dispatch(
                    editPreventiveMaintenance(pm.id, {
                      ...pm,
                      files: pm.files.filter((f) => f.id !== id)
                    })
                  );
                }}
              />
            </SectionCard>
          )}
        </Stack>
      ) : (
        <RecentWorkOrders pmId={preventiveMaintenance.id} />
      )}
      {isImageViewerOpen && (
        <div style={{ zIndex: 1300 }}>
          <ImageViewer
            src={[preventiveMaintenance.image.url]}
            currentIndex={0}
            onClose={() => setIsImageViewerOpen(false)}
            disableScroll
            backgroundStyle={{
              backgroundColor: 'rgba(0,0,0,0.9)'
            }}
            closeOnClickOutside
          />
        </div>
      )}
      <Menu anchorEl={anchorEl} open={openMenu} onClose={handleCloseMenu}>
        <MenuItem
          onClick={() => {
            onCopy(preventiveMaintenance);
            handleCloseMenu();
          }}
        >
          <Stack spacing={2} direction="row">
            <ContentCopyTwoTone />
            <Typography variant="h6">{t('copy')}</Typography>
          </Stack>
        </MenuItem>
        <MenuItem disabled={triggering} onClick={handleTriggerWorkOrder}>
          <Stack spacing={2} direction="row">
            {triggering ? (
              <CircularProgress size="1rem" />
            ) : (
              <PlayArrowTwoToneIcon />
            )}
            <Typography variant="h6">{t('trigger_work_order')}</Typography>
          </Stack>
        </MenuItem>
      </Menu>
    </DetailsPage>
  );
}
