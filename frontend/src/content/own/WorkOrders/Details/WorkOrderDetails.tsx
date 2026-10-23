import {
  Box,
  Button,
  CircularProgress,
  debounce,
  Divider,
  Grid,
  IconButton,
  Link,
  List,
  ListItem,
  ListItemText,
  ListSubheader,
  Menu,
  MenuItem,
  Select,
  Stack,
  styled,
  Tab,
  Tabs,
  TextField,
  Typography,
  useTheme
} from '@mui/material';
import WorkOrder from '../../../../models/owns/workOrder';
import {
  ChangeEvent,
  Fragment,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import ReportConfigModal from './ReportConfigModal';
import SendReportModal from './SendReportModal';
import Tasks from './Tasks';
import TimeSection from './TimeSection';
import CostSection from './CostSection';
import LinkTwoToneIcon from '@mui/icons-material/LinkTwoTone';
import ArchiveTwoToneIcon from '@mui/icons-material/ArchiveTwoTone';
import PictureAsPdfTwoToneIcon from '@mui/icons-material/PictureAsPdfTwoTone';
import PriorityWrapper from '../../components/PriorityWrapper';
import TimerTwoToneIcon from '@mui/icons-material/TimerTwoTone';
import {
  changeWorkOrderStatus,
  editWorkOrder,
  removeFileFromWorkOrder
} from '../../../../slices/workOrder';
import { useDispatch, useSelector } from '../../../../store';
import MoreVertTwoToneIcon from '@mui/icons-material/MoreVertTwoTone';
import SelectParts from '../../components/form/SelectParts';
import ImageViewer from 'react-simple-image-viewer';
import {
  editPartQuantity,
  editWOPartQuantities,
  getPartQuantitiesByWorkOrder
} from '../../../../slices/partQuantity';
import Labor from '../../../../models/owns/labor';
import { controlTimer, editLabor, getLabors } from '../../../../slices/labor';
import {
  durationToHours,
  getHoursAndMinutesAndSeconds
} from '../../../../utils/formatters';
import { getAdditionalCosts } from '../../../../slices/additionalCost';
import { getTasksByWorkOrder } from '../../../../slices/task';
import { Task } from '../../../../models/owns/tasks';
import LinkModal from './LinkModal';
import { CustomSnackBarContext } from '../../../../contexts/CustomSnackBarContext';
import { deleteRelation, getRelations } from '../../../../slices/relation';
import Relation, { relationTypes } from '../../../../models/owns/relation';
import { CompanySettingsContext } from '../../../../contexts/CompanySettingsContext';
import {
  getAssetUrl,
  getPreventiveMaintenanceUrl,
  getUserUrl,
  getWorkOrderUrl
} from '../../../../utils/urlPaths';
import CompleteWOModal from './CompleteWOModal';
import useAuth from '../../../../hooks/useAuth';
import { PermissionEntity } from '../../../../models/owns/role';
import { getSingleUserMini } from '../../../../slices/user';
import FilesList from '../../components/FilesList';
import DualDate, { HijriSuffix } from '../../components/DualDate';
import { PlanFeature } from '../../../../models/owns/subscriptionPlan';
import PartQuantitiesList from '../../components/PartQuantitiesList';
import AddFileModal from './AddFileModal';
import CommentsSection from './CommentsSection';
import { useLicenseEntitlement } from '../../../../hooks/useLicenseEntitlement';
import { getCustomFieldValuesForDetails } from '../../type';
import { getErrorMessage } from '../../../../utils/api';
import { getCommentsCountByWorkOrder } from '../../../../slices/comment';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CloseIcon from '@mui/icons-material/Close';
import CheckTwoToneIcon from '@mui/icons-material/CheckTwoTone';
import EmailTwoToneIcon from '@mui/icons-material/EmailTwoTone';
import { ContentCopyTwoTone } from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import SectionCard from '../../components/SectionCard';
import StatusChip, { statusTone } from '../../components/StatusChip';
import {
  CardBody,
  DetailGrid,
  DetailItem,
  DetailRow,
  DetailsHeader,
  DetailsPage,
  DetailThumb,
  MutedText
} from '../../components/DetailsKit';
import InfoTwoToneIcon from '@mui/icons-material/InfoTwoTone';
import PeopleAltTwoToneIcon from '@mui/icons-material/PeopleAltTwoTone';
import CheckCircleTwoToneIcon from '@mui/icons-material/CheckCircleTwoTone';
import HandymanTwoToneIcon from '@mui/icons-material/HandymanTwoTone';
import AttachFileTwoToneIcon from '@mui/icons-material/AttachFileTwoTone';
import AddTwoToneIcon from '@mui/icons-material/AddTwoTone';

interface WorkOrderDetailsProps {
  workOrder: WorkOrder;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onCopy: (workOrder: WorkOrder) => void;
  tasks: Task[];
  onClose: () => void;
}

export default function WorkOrderDetails(props: WorkOrderDetailsProps) {
  const { workOrder, onEdit, tasks, onDelete, onCopy, onClose } = props;
  const theme = useTheme();
  const { showSnackBar } = useContext(CustomSnackBarContext);
  const { getFormattedDate, getUserNameById, getFormattedCurrency } =
    useContext(CompanySettingsContext);
  const { t }: { t: any } = useTranslation();
  const { user, hasEditPermission, hasDeletePermission, hasCreatePermission } =
    useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const commentIdParam = searchParams.get('commentId');
  const [openAddFileModal, setOpenAddFileModal] = useState<boolean>(false);
  const [openLinkModal, setOpenLinkModal] = useState<boolean>(false);
  const [openCompleteModal, setOpenCompleteModal] = useState<boolean>(false);
  const [openReportConfigModal, setOpenReportConfigModal] =
    useState<boolean>(false);
  const [openSendReportModal, setOpenSendReportModal] =
    useState<boolean>(false);
  const [currentTab, setCurrentTab] = useState<string>('details');
  const [changingStatus, setChangingStatus] = useState<boolean>(false);
  const { partQuantitiesByWorkOrder, loadingPartQuantities } = useSelector(
    (state) => state.partQuantities
  );
  const partQuantities = partQuantitiesByWorkOrder[workOrder.id] ?? [];
  const [controllingTime, setControllingTime] = useState<boolean>(false);
  const { timesByWorkOrder, loadingLabors } = useSelector(
    (state) => state.labors
  );
  const { workOrderHistories } = useSelector(
    (state) => state.workOrderHistories
  );
  const { relationsByWorkOrder, loadingRelations } = useSelector(
    (state) => state.relations
  );
  const currentWorkOrderHistories = workOrderHistories[workOrder.id] ?? [];
  const currentWorkOrderRelations = relationsByWorkOrder[workOrder.id] ?? [];
  const labors = timesByWorkOrder[workOrder.id] ?? [];
  const primaryTime = labors.find(
    (labor) => labor.logged && labor.assignedTo.id === user.id
  );
  const runningTimer = primaryTime?.status === 'RUNNING';
  const { costsByWorkOrder, loadingCosts } = useSelector(
    (state) => state.additionalCosts
  );
  const additionalCosts = costsByWorkOrder[workOrder.id] ?? [];
  const { commentsCountByWorkOrder } = useSelector((state) => state.comments);
  const commentsCount = commentsCountByWorkOrder[workOrder.id]?.count ?? 0;
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);
  const { companySettings, hasFeature } = useAuth();
  const { workOrderConfiguration, generalPreferences } = companySettings;
  const [generatingReport, setGeneratingReport] = useState<boolean>(false);
  const [openEditPrimaryTime, setOpenEditPrimaryTime] =
    useState<boolean>(false);
  const [primaryTimeHours, setPrimaryTimeHours] = useState<number>();
  const [primaryTimeMinutes, setPrimaryTimeMinutes] = useState<number>();
  const [savingPrimaryTime, setSavingPrimaryTime] = useState<boolean>(false);
  const [commentId, setCommentId] = useState<number>(null);

  useEffect(() => {
    dispatch(getCommentsCountByWorkOrder(workOrder.id));
  }, [workOrder.id, dispatch]);

  useEffect(() => {
    if (commentIdParam) {
      setCurrentTab('comments');
      setCommentId(Number(commentIdParam));
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('commentId');

      setSearchParams(newParams);
    }
  }, [commentIdParam]);

  useEffect(() => {
    [workOrder.createdBy, workOrder.parentRequest?.createdBy].forEach(
      (createdBy) => {
        if (!usersMini.find((user) => user.id === createdBy) && createdBy) {
          dispatch(getSingleUserMini(createdBy));
        }
      }
    );
  }, []);

  const { usersMini } = useSelector((state) => state.users);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState<boolean>(false);
  const [currentImage, setCurrentImage] = useState<string>();
  const [currentImages, setCurrentImages] = useState<string[]>();

  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };
  const onArchiveSuccess = () => {
    onClose();
    showSnackBar(t('wo_archive_success'), 'success');
  };
  const onArchiveFailure = (err) =>
    showSnackBar(t('wo_archive_failure'), 'error');
  const onArchive = () => {
    handleCloseMenu();
    if (window.confirm(t('wo_archive_confirm') + workOrder.title + ' ?')) {
      dispatch(editWorkOrder(workOrder?.id, { ...workOrder, archived: true }))
        .then(onArchiveSuccess)
        .catch(onArchiveFailure);
    }
  };
  const onGenerateReport = () => {
    handleCloseMenu();
    setOpenReportConfigModal(true);
  };
  const onEmailContractors = () => {
    handleCloseMenu();
    setOpenSendReportModal(true);
  };
  useEffect(() => {
    dispatch(getPartQuantitiesByWorkOrder(workOrder.id));
    dispatch(getLabors(workOrder.id));
    dispatch(getAdditionalCosts(workOrder.id));
    dispatch(getTasksByWorkOrder(workOrder.id));
    dispatch(getRelations(workOrder.id));
  }, []);
  useEffect(() => {
    const [hours, minutes] = getHoursAndMinutesAndSeconds(
      primaryTime?.duration
    );
    setPrimaryTimeHours(hours);
    setPrimaryTimeMinutes(minutes);
  }, [primaryTime]);

  const setImageState = (images: string[], image: string) => {
    setCurrentImage(image);
    setCurrentImages(images);
    setIsImageViewerOpen(true);
  };
  const canComplete = (): boolean => {
    let error;
    const fieldsToTest = [
      {
        name: 'completeFiles',
        condition:
          workOrder.files.length +
            commentsCountByWorkOrder[workOrder.id]?.withFilesCount ===
          0,
        message: 'required_files_on_completion'
      },
      {
        name: 'completeTasks',
        condition: tasks.some((task) => !task.value),
        message: 'required_tasks_on_completion'
      },
      {
        name: 'completeTime',
        condition: labors.filter((labor) => labor.duration).length === 0,
        message: 'required_labor_on_completion'
      },
      {
        name: 'completeParts',
        condition: !partQuantities.length,
        message: 'required_part_on_completion'
      },
      {
        name: 'completeCost',
        condition: !additionalCosts.length,
        message: 'required_cost_on_completion'
      }
    ];
    fieldsToTest.every((field) => {
      const fieldConfig =
        workOrderConfiguration.workOrderFieldConfigurations.find(
          (woFC) => woFC.fieldName === field.name
        );
      if (fieldConfig.fieldType === 'REQUIRED' && field.condition) {
        showSnackBar(t(field.message), 'error');
        error = true;
        return false;
      }
      return true;
    });

    return !error;
  };
  const isParent = (relation: Relation): boolean => {
    return relation.parent.id === workOrder.id;
  };
  const onPartQuantityChange = (value: string, partQuantity) => {
    dispatch(
      editPartQuantity(workOrder.id, partQuantity.id, Number(value), false)
    )
      .then(() => showSnackBar(t('quantity_change_success'), 'success'))
      .catch((err) => showSnackBar(t('quantity_change_failure'), 'error'));
  };
  const debouncedPartQuantityChange = useMemo(
    () => debounce(onPartQuantityChange, 1500),
    []
  );
  const onCompleteWO = (
    signature: string | undefined,
    feedback: string | undefined
  ) => {
    setChangingStatus(true);
    return dispatch(
      changeWorkOrderStatus(workOrder?.id, {
        status: 'COMPLETE',
        feedback: feedback ?? null,
        signature
      })
    )
      .then(() => dispatch(getLabors(workOrder?.id)))
      .finally(() => setChangingStatus(false));
  };
  const groupRelations = (
    relations: Relation[]
  ): { [key: string]: { id: number; workOrder: WorkOrder }[] } => {
    const result = {};
    relationTypes.forEach((relationType) => {
      result[relationType] = [];
    });
    relations.forEach((relation) => {
      switch (relation.relationType) {
        case 'BLOCKS':
          if (isParent(relation)) {
            result['BLOCKS'].push({
              id: relation.id,
              workOrder: relation.child
            });
          } else
            result['BLOCKED_BY'].push({
              id: relation.id,
              workOrder: relation.parent
            });
          break;
        case 'DUPLICATE_OF':
          if (isParent(relation)) {
            result['DUPLICATE_OF'].push({
              id: relation.id,
              workOrder: relation.child
            });
          } else
            result['DUPLICATED_BY'].push({
              id: relation.id,
              workOrder: relation.parent
            });
          break;
        case 'RELATED_TO':
          result['RELATED_TO'].push({
            id: relation.id,
            workOrder: isParent(relation) ? relation.child : relation.parent
          });
          break;
        case 'SPLIT_FROM':
          if (isParent(relation)) {
            result['SPLIT_FROM'].push({
              id: relation.id,
              workOrder: relation.child
            });
          } else
            result['SPLIT_TO'].push({
              id: relation.id,
              workOrder: relation.parent
            });
          break;
        default:
          break;
      }
    });

    return result;
  };
  const workOrderStatuses = ['OPEN', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETE'];
  const tabs = [
    { value: 'details', label: t('details') },
    {
      value: 'comments',
      label: `${t('comments')}${commentsCount > 0 ? ` (${commentsCount})` : ''}`
    }
  ];

  const getPath = (resource: string, id: number) => {
    switch (resource) {
      case 'asset':
        return getAssetUrl(id);
      case 'team':
        return `/app/people-teams/teams/${id}`;
      default:
        return `/app/${resource}s/${id}`;
    }
  };
  const onSavePrimaryTime = () => {
    setSavingPrimaryTime(true);
    const duration = primaryTimeHours * 3600 + primaryTimeMinutes * 60;
    dispatch(
      editLabor(primaryTime.id, workOrder.id, {
        ...primaryTime,
        duration
      })
    )
      .then(() => {
        setOpenEditPrimaryTime(false);
      })
      .finally(() => setSavingPrimaryTime(false));
  };
  const BasicField = ({
    label,
    value,
    id,
    type,
    isLink,
    hijriDate
  }: {
    label: string | number;
    value: string | number;
    type?: string;
    id?: number;
    isLink?: boolean;
    hijriDate?: string;
  }) => {
    if (value && (isLink || !type || (type && id))) {
      const href = value.toString().startsWith('http')
        ? value.toString()
        : `https://${value}`;
      return (
        <DetailItem label={label}>
          {type ? (
            <Link href={getPath(type, id)} underline="hover">
              {value}
            </Link>
          ) : isLink ? (
            <Link
              href={href}
              underline="hover"
              target="_blank"
              rel="noopener noreferrer"
            >
              {value}
            </Link>
          ) : (
            <>
              {value}
              {hijriDate && <HijriSuffix date={hijriDate} />}
            </>
          )}
        </DetailItem>
      );
    } else return null;
  };
  const handleTabsChange = (_event: ChangeEvent<{}>, value: string): void => {
    setCurrentTab(value);
  };
  const detailsFieldsToRender = (
    workOrder: WorkOrder
  ): {
    label: string;
    value: string | number;
    type?: 'location' | 'asset' | 'team';
    isLink?: boolean;
    id?: number;
    hijriDate?: string;
  }[] => [
    {
      label: t('id'),
      value: workOrder.customId
    },
    {
      label: t('due_date'),
      value: getFormattedDate(workOrder.dueDate),
      hijriDate: workOrder.dueDate
    },
    {
      label: t('estimated_start_date'),
      value: getFormattedDate(workOrder.estimatedStartDate),
      hijriDate: workOrder.estimatedStartDate
    },
    {
      label: t('estimated_duration'),
      value: !!workOrder.estimatedDuration
        ? t('estimated_hours_in_text', { hours: workOrder.estimatedDuration })
        : null
    },
    {
      label: t('category'),
      value: workOrder.category?.name
    },
    {
      label: t('location'),
      value: workOrder.location?.name,
      type: 'location',
      id: workOrder.location?.id
    },
    {
      label: t('asset'),
      value: workOrder.asset?.name,
      type: 'asset',
      id: workOrder.asset?.id
    },
    {
      label: t('team'),
      value: workOrder.team?.name,
      type: 'team',
      id: workOrder.team?.id
    },
    {
      label: t('created_at'),
      value: getFormattedDate(workOrder.createdAt)
    },
    ...getCustomFieldValuesForDetails(
      workOrder.customFieldValues,
      getFormattedDate
    )
  ];
  const canEditWO = hasEditPermission(PermissionEntity.WORK_ORDERS, workOrder);
  const canDeleteWO = hasDeletePermission(
    PermissionEntity.WORK_ORDERS,
    workOrder
  );
  const statusPalette = theme.colors[
    statusTone(workOrder.status) === 'neutral'
      ? 'primary'
      : (statusTone(workOrder.status) as 'info' | 'primary' | 'warning' | 'success')
  ];
  const softActionSx = {
    borderRadius: '10px',
    fontWeight: 700,
    color: theme.palette.primary.dark,
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.16) }
  };
  const hasAssignment =
    !!workOrder.primaryUser ||
    !!workOrder.assignedTo.length ||
    !!workOrder.customers.length ||
    !!workOrder.team ||
    !!primaryTime;
  return (
    <Grid container sx={{ p: { xs: 2, sm: 3 } }}>
      <Grid item xs={12}>
        <DetailsHeader
          subtitle={
            workOrder?.customId ? (
              <bdi>{`#${workOrder.customId}`}</bdi>
            ) : undefined
          }
          title={workOrder?.title}
          media={
            workOrder.image ? (
              <DetailThumb
                src={workOrder.image.url}
                size={72}
                onClick={() => {
                  setImageState([workOrder.image.url], workOrder.image.url);
                }}
              />
            ) : undefined
          }
          chips={
            <>
              <StatusChip status={workOrder.status} size="medium" />
              {workOrder?.priority && workOrder?.priority !== 'NONE' && (
                <PriorityWrapper
                  priority={workOrder?.priority}
                  withSuffix
                  size="medium"
                />
              )}
            </>
          }
          actions={
            canEditWO || canDeleteWO ? (
              <>
                {canEditWO && (
                  <IconButton aria-label={t('more')} onClick={handleOpenMenu}>
                    <MoreVertTwoToneIcon fontSize="small" />
                  </IconButton>
                )}
                {canEditWO && (
                  <IconButton
                    aria-label={t('edit')}
                    onClick={() => onEdit(workOrder.id)}
                  >
                    <EditTwoToneIcon fontSize="small" color="primary" />
                  </IconButton>
                )}
                {canDeleteWO && (
                  <IconButton
                    aria-label={t('delete')}
                    onClick={() => onDelete(workOrder.id)}
                  >
                    <DeleteTwoToneIcon fontSize="small" color="error" />
                  </IconButton>
                )}
              </>
            ) : undefined
          }
          description={workOrder?.description}
        />
      </Grid>
      <Grid item xs={12} sx={{ mt: 1 }}>
        <Tabs
          onChange={handleTabsChange}
          value={currentTab}
          variant="scrollable"
          scrollButtons="auto"
          textColor="primary"
          indicatorColor="primary"
          sx={{
            minHeight: 44,
            borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
            '& .MuiTab-root': { minHeight: 44, fontWeight: 600 }
          }}
        >
          {tabs.map((tab) => (
            <Tab key={tab.value} label={tab.label} value={tab.value} />
          ))}
        </Tabs>
      </Grid>
      <Grid item xs={12} sx={{ mt: 2.5 }}>
        {currentTab === 'details' && (
          <DetailsPage dense>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1.5,
                p: 1.5,
                borderRadius: '14px',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.16)}`,
                backgroundColor: alpha(theme.palette.primary.main, 0.035)
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Typography
                  sx={{
                    color: 'text.secondary',
                    fontSize: 13,
                    fontWeight: 500
                  }}
                >
                  {t('status')}
                </Typography>
                {changingStatus ? (
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      width: 100,
                      height: 36
                    }}
                  >
                    <CircularProgress size={'1rem'} />
                  </Box>
                ) : (
                  <Select
                    size="small"
                    onChange={(event) => {
                      if (event.target.value === 'COMPLETE') {
                        if (canComplete()) {
                          if (
                            generalPreferences.askFeedBackOnWOClosed ||
                            workOrder.requiredSignature
                          ) {
                            let error;
                            if (workOrder.requiredSignature) {
                              if (!hasFeature(PlanFeature.SIGNATURE)) {
                                error =
                                  'Signature on Work Order completion is not available in your current subscription plan.';
                              }
                            }
                            if (error) {
                              showSnackBar(t(error), 'error');
                            } else {
                              setOpenCompleteModal(true);
                              return;
                            }
                          }
                        } else return;
                      }
                      setChangingStatus(true);
                      dispatch(
                        changeWorkOrderStatus(workOrder?.id, {
                          status: event.target.value
                        })
                      ).finally(() => setChangingStatus(false));
                    }}
                    disabled={!canEditWO}
                    value={workOrder.status}
                    sx={{
                      minWidth: 150,
                      borderRadius: '10px',
                      fontWeight: 700,
                      fontSize: 14,
                      color: statusPalette.dark,
                      backgroundColor: statusPalette.lighter,
                      '.MuiOutlinedInput-notchedOutline': {
                        borderColor: alpha(statusPalette.main, 0.35)
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: statusPalette.main
                      },
                      '.MuiSvgIcon-root': { color: statusPalette.dark }
                    }}
                  >
                    {workOrderStatuses.map((workOrderStatus, index) => (
                      <MenuItem key={index} value={workOrderStatus}>
                        {t(workOrderStatus)}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              </Box>
              <Button
                startIcon={
                  controllingTime ? (
                    <CircularProgress size="1rem" />
                  ) : (
                    <TimerTwoToneIcon />
                  )
                }
                disabled={controllingTime || !canEditWO}
                onClick={() => {
                  setControllingTime(true);
                  dispatch(controlTimer(!runningTimer, workOrder.id))
                    .catch((err) => showSnackBar(getErrorMessage(err), 'error'))
                    .finally(() => setControllingTime(false));
                }}
                variant={runningTimer ? 'contained' : 'outlined'}
                sx={{
                  borderRadius: '12px',
                  fontWeight: 700,
                  ...(runningTimer
                    ? {
                        boxShadow: `0 6px 16px ${alpha(
                          theme.palette.primary.main,
                          0.28
                        )}`
                      }
                    : { borderColor: alpha(theme.palette.primary.main, 0.35) })
                }}
              >
                {runningTimer
                  ? t('timer_running')
                  : t('run_timer') +
                    ' - ' +
                    durationToHours(primaryTime?.duration)}
              </Button>
            </Box>
            <SectionCard
              title="details"
              icon={<InfoTwoToneIcon fontSize="small" />}
            >
              <DetailGrid>
                {detailsFieldsToRender(workOrder).map((field, index) => (
                  <BasicField key={index} {...field} />
                ))}
                {(workOrder.parentRequest || workOrder.createdBy) && (
                  <DetailItem
                    label={
                      workOrder.parentRequest
                        ? t('approved_by')
                        : t('created_by')
                    }
                  >
                    <Link href={getUserUrl(workOrder.createdBy)} underline="hover">
                      {getUserNameById(workOrder.createdBy)}
                    </Link>
                  </DetailItem>
                )}
                {workOrder.parentRequest && (
                  <DetailItem label={t('requested_by')}>
                    <Link
                      href={getUserUrl(workOrder.parentRequest.createdBy)}
                      underline="hover"
                    >
                      {getUserNameById(workOrder.parentRequest.createdBy)}
                    </Link>
                  </DetailItem>
                )}
                {workOrder.parentPreventiveMaintenance && (
                  <DetailItem label={t('preventive_maintenance')}>
                    <Link
                      href={getPreventiveMaintenanceUrl(
                        workOrder.parentPreventiveMaintenance.id
                      )}
                      underline="hover"
                    >
                      {workOrder.parentPreventiveMaintenance.name}
                    </Link>
                  </DetailItem>
                )}
              </DetailGrid>
            </SectionCard>
            {hasAssignment && (
              <SectionCard
                title="details_assignment"
                icon={<PeopleAltTwoToneIcon fontSize="small" />}
              >
                <DetailGrid>
                  {workOrder.primaryUser && (
                    <DetailItem label={t('primary_worker')}>
                      <Link
                        href={getUserUrl(workOrder.primaryUser.id)}
                        underline="hover"
                      >
                        {getUserNameById(workOrder.primaryUser.id)}
                      </Link>
                    </DetailItem>
                  )}
                  {!!workOrder.assignedTo.length && (
                    <DetailItem label={t('assigned_to')}>
                      <Stack spacing={0.5}>
                        {workOrder.assignedTo.map((user) => (
                          <Link
                            key={user.id}
                            href={getUserUrl(user.id)}
                            underline="hover"
                          >{`${user.firstName} ${user.lastName}`}</Link>
                        ))}
                      </Stack>
                    </DetailItem>
                  )}
                  {!!workOrder.customers.length && (
                    <DetailItem label={t('customers')}>
                      <Stack spacing={0.5}>
                        {workOrder.customers.map((customer) => (
                          <Link
                            key={customer.id}
                            href={`/app/vendors-customers/customers/${customer.id}`}
                            underline="hover"
                          >
                            {customer.name}
                          </Link>
                        ))}
                      </Stack>
                    </DetailItem>
                  )}
                  {primaryTime && (
                    <DetailItem label={t('time')}>
                      {openEditPrimaryTime ? (
                        <Stack direction="row" spacing={1} alignItems="center">
                          <TextField
                            size="small"
                            value={primaryTimeHours}
                            type="number"
                            sx={{ width: 76 }}
                            onChange={(event) =>
                              setPrimaryTimeHours(Number(event.target.value))
                            }
                          />
                          <Typography>h</Typography>
                          <TextField
                            size="small"
                            value={primaryTimeMinutes}
                            type="number"
                            sx={{ width: 76 }}
                            InputProps={{ inputProps: { min: 0, max: 59 } }}
                            onChange={(event) =>
                              setPrimaryTimeMinutes(Number(event.target.value))
                            }
                          />
                          <Typography>m</Typography>
                          {savingPrimaryTime ? (
                            <CircularProgress size="1rem" />
                          ) : (
                            <IconButton
                              size="small"
                              disabled={savingPrimaryTime}
                              onClick={onSavePrimaryTime}
                            >
                              <CheckTwoToneIcon
                                fontSize="small"
                                color={'primary'}
                              />
                            </IconButton>
                          )}
                          <IconButton
                            size="small"
                            onClick={() => setOpenEditPrimaryTime(false)}
                          >
                            <CloseIcon fontSize="small" color={'error'} />
                          </IconButton>
                        </Stack>
                      ) : (
                        <Box
                          component="span"
                          role="button"
                          tabIndex={0}
                          onClick={() => setOpenEditPrimaryTime(true)}
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.75,
                            cursor: 'pointer',
                            color: 'primary.main'
                          }}
                        >
                          {durationToHours(primaryTime?.duration)}
                          <EditTwoToneIcon sx={{ fontSize: 16 }} />
                        </Box>
                      )}
                    </DetailItem>
                  )}
                </DetailGrid>
              </SectionCard>
            )}
            {workOrder.status === 'COMPLETE' && (
              <SectionCard
                title="details_completion"
                icon={<CheckCircleTwoToneIcon fontSize="small" />}
              >
                <DetailGrid>
                  {workOrder.completedBy && (
                    <DetailItem label={t('completed_by')}>
                      <Link
                        href={getUserUrl(workOrder.completedBy.id)}
                        underline="hover"
                      >
                        {`${workOrder.completedBy.firstName} ${workOrder.completedBy.lastName}`}
                      </Link>
                    </DetailItem>
                  )}
                  <DetailItem label={t('completed_on')}>
                    {workOrder.completedOn ? (
                      <DualDate date={workOrder.completedOn} />
                    ) : null}
                  </DetailItem>
                  {workOrder.feedback && (
                    <DetailItem label={t('feedback')} fullWidth>
                      <Box sx={{ whiteSpace: 'pre-line', fontWeight: 500 }}>
                        {workOrder.feedback}
                      </Box>
                    </DetailItem>
                  )}
                  {workOrder.signature && (
                    <DetailItem label={t('signature')}>
                      <DetailThumb
                        src={workOrder.signature}
                        size={180}
                        height={96}
                        onClick={() => {
                          setImageState(
                            [workOrder.signature],
                            workOrder.signature
                          );
                        }}
                      />
                    </DetailItem>
                  )}
                </DetailGrid>
              </SectionCard>
            )}
            {!!tasks.length && (
              <Tasks
                tasksProps={tasks}
                workOrderId={workOrder?.id}
                handleZoomImage={setImageState}
                disabled={!canEditWO}
              />
            )}
            <TimeSection
              workOrder={workOrder}
              labors={labors}
              loading={loadingLabors[workOrder.id]}
            />
            <CostSection
              workOrder={workOrder}
              additionalCosts={additionalCosts}
              loading={loadingCosts[workOrder.id]}
            />
            <SectionCard
              title="parts"
              icon={<HandymanTwoToneIcon fontSize="small" />}
            >
              {loadingPartQuantities[workOrder.id] ? (
                <Stack width={'100%'} alignItems={'center'}>
                  <CircularProgress size={28} />
                </Stack>
              ) : (
                <Fragment>
                  {!!partQuantities.length && (
                    <Box sx={{ mx: { xs: -2, sm: -2.5 }, mt: -1.5 }}>
                      <PartQuantitiesList
                        partQuantities={partQuantities}
                        disabled={!canEditWO}
                        onChange={debouncedPartQuantityChange}
                      />
                    </Box>
                  )}
                  {canEditWO && (
                    <SelectParts
                      selected={partQuantities.map(
                        (partQuantity) => partQuantity.part.id
                      )}
                      onChange={(selectedParts) => {
                        dispatch(
                          editWOPartQuantities(
                            workOrder.id,
                            selectedParts.map((part) => part.id)
                          )
                        ).catch((error) =>
                          showSnackBar(t('not_enough_part'), 'error')
                        );
                      }}
                    />
                  )}
                </Fragment>
              )}
            </SectionCard>
            <SectionCard
              title="links"
              icon={<LinkTwoToneIcon fontSize="small" />}
              noPadding
              actions={
                canEditWO ? (
                  <Button
                    size="small"
                    startIcon={<AddTwoToneIcon />}
                    onClick={() => setOpenLinkModal(true)}
                    sx={softActionSx}
                  >
                    {t('link_wo')}
                  </Button>
                ) : undefined
              }
            >
              {loadingRelations[workOrder.id] ? (
                <CardBody>
                  <Stack width={'100%'} alignItems={'center'}>
                    <CircularProgress size={28} />
                  </Stack>
                </CardBody>
              ) : !currentWorkOrderRelations.length ? (
                <CardBody>
                  <MutedText>—</MutedText>
                </CardBody>
              ) : (
                <Box>
                  {Object.entries(
                    groupRelations(currentWorkOrderRelations)
                  ).map(
                    ([relationType, relations]) =>
                      !!relations.length && (
                        <Box key={relationType}>
                          <Typography
                            sx={{
                              px: { xs: 2, sm: 2.5 },
                              pt: 1.5,
                              pb: 0.5,
                              fontSize: 12.5,
                              fontWeight: 600,
                              color: 'text.secondary',
                              textAlign: 'start'
                            }}
                          >
                            {t(relationType)}
                          </Typography>
                          {relations.map((relation) => (
                            <DetailRow key={relation.id}>
                              <Box
                                onClick={() =>
                                  navigate(
                                    getWorkOrderUrl(relation.workOrder.id)
                                  )
                                }
                                sx={{
                                  flex: 1,
                                  minWidth: 0,
                                  cursor: 'pointer',
                                  textAlign: 'start'
                                }}
                              >
                                <Stack
                                  direction="row"
                                  spacing={1}
                                  alignItems="center"
                                  sx={{ minWidth: 0 }}
                                >
                                  <Typography
                                    noWrap
                                    sx={{
                                      fontWeight: 600,
                                      fontSize: 14,
                                      color: 'primary.main'
                                    }}
                                  >
                                    {relation.workOrder.title}
                                  </Typography>
                                  <StatusChip
                                    status={relation.workOrder.status}
                                  />
                                </Stack>
                                <Typography
                                  sx={{
                                    color: 'text.secondary',
                                    fontSize: 12.5,
                                    mt: 0.25
                                  }}
                                >
                                  {getFormattedDate(
                                    relation.workOrder.createdAt
                                  )}
                                </Typography>
                              </Box>
                              <IconButton
                                size="small"
                                onClick={() =>
                                  dispatch(
                                    deleteRelation(workOrder.id, relation.id)
                                  )
                                }
                              >
                                <DeleteTwoToneIcon
                                  fontSize="small"
                                  color="error"
                                />
                              </IconButton>
                            </DetailRow>
                          ))}
                        </Box>
                      )
                  )}
                </Box>
              )}
            </SectionCard>
            <SectionCard
              title="files"
              icon={<AttachFileTwoToneIcon fontSize="small" />}
              noPadding
              actions={
                canEditWO ? (
                  <Button
                    size="small"
                    startIcon={<AddTwoToneIcon />}
                    onClick={() => setOpenAddFileModal(true)}
                    sx={softActionSx}
                  >
                    {t('add_file')}
                  </Button>
                ) : undefined
              }
            >
              {!!workOrder.files.length ? (
                <FilesList
                  confirmMessage={t('confirm_delete_file_wo')}
                  removeDisabled={!canEditWO}
                  files={workOrder.files}
                  onRemove={(id: number) => {
                    dispatch(removeFileFromWorkOrder(workOrder.id, id));
                  }}
                />
              ) : (
                <CardBody>
                  <MutedText>{t('no_file_linked_to_wo')}</MutedText>
                </CardBody>
              )}
            </SectionCard>
          </DetailsPage>
        )}
        {currentTab == 'comments' && (
          <CommentsSection
            disabled={
              !hasEditPermission(PermissionEntity.WORK_ORDERS, workOrder)
            }
            workOrderId={workOrder.id}
            commentId={commentId}
          />
        )}
      </Grid>
      <AddFileModal
        open={openAddFileModal}
        onClose={() => setOpenAddFileModal(false)}
        workOrderId={workOrder.id}
      />
      <LinkModal
        open={openLinkModal}
        onClose={() => setOpenLinkModal(false)}
        workOrderId={workOrder.id}
      />
      {isImageViewerOpen && (
        <div style={{ zIndex: 100 }}>
          <ImageViewer
            src={currentImages}
            currentIndex={currentImages.findIndex(
              (image) => image === currentImage
            )}
            onClose={() => setIsImageViewerOpen(false)}
            disableScroll={true}
            backgroundStyle={{
              backgroundColor: 'rgba(0,0,0,0.9)'
            }}
            closeOnClickOutside={true}
          />
        </div>
      )}
      <ReportConfigModal
        open={openReportConfigModal}
        onClose={() => setOpenReportConfigModal(false)}
        workOrderId={workOrder.id}
      />
      <SendReportModal
        open={openSendReportModal}
        onClose={() => setOpenSendReportModal(false)}
        workOrderId={workOrder.id}
        defaultCustomers={workOrder.customers}
      />
      <CompleteWOModal
        open={openCompleteModal}
        onClose={() => setOpenCompleteModal(false)}
        fieldsConfig={{
          feedback: generalPreferences.askFeedBackOnWOClosed,
          signature: workOrder.requiredSignature
        }}
        onComplete={onCompleteWO}
      />
      <Menu anchorEl={anchorEl} open={openMenu} onClose={handleCloseMenu}>
        <MenuItem
          onClick={() => {
            setOpenLinkModal(true);
            handleCloseMenu();
          }}
        >
          <Stack spacing={2} direction="row">
            <LinkTwoToneIcon />
            <Typography variant="h6">{t('link')}</Typography>
          </Stack>
        </MenuItem>
        <MenuItem disabled={generatingReport} onClick={onGenerateReport}>
          <Stack spacing={2} direction="row">
            {generatingReport ? (
              <CircularProgress size="1rem" />
            ) : (
              <PictureAsPdfTwoToneIcon />
            )}
            <Typography variant="h6">{t('pdf_report')}</Typography>
          </Stack>
        </MenuItem>
        <MenuItem onClick={onEmailContractors}>
          <Stack spacing={2} direction="row">
            <EmailTwoToneIcon />
            <Typography variant="h6">{t('email_contractors')}</Typography>
          </Stack>
        </MenuItem>
        {hasCreatePermission(PermissionEntity.WORK_ORDERS) && (
          <MenuItem
            onClick={() => {
              onCopy(workOrder);
              handleCloseMenu();
            }}
          >
            <Stack spacing={2} direction="row">
              <ContentCopyTwoTone />
              <Typography variant="h6">{t('copy_wo')}</Typography>
            </Stack>
          </MenuItem>
        )}
        <MenuItem onClick={onArchive}>
          <Stack spacing={2} direction="row">
            <ArchiveTwoToneIcon />
            <Typography variant="h6">{t('archive')}</Typography>
          </Stack>
        </MenuItem>
      </Menu>
    </Grid>
  );
}
