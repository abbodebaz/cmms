import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Helmet } from 'react-helmet-async';
import {
  ChangeEvent,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { endOfDay, startOfDay } from 'date-fns';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import { TitleContext } from '../../../contexts/TitleContext';
import { CustomSnackBarContext } from '../../../contexts/CustomSnackBarContext';
import { CompanySettingsContext } from '../../../contexts/CompanySettingsContext';
import useAuth from '../../../hooks/useAuth';
import { useDispatch } from '../../../store';
import api from '../../../utils/api';
import WorkOrder from '../../../models/owns/workOrder';
import { Page, SearchCriteria } from '../../../models/owns/page';
import { PermissionEntity } from '../../../models/owns/role';
import { PlanFeature } from '../../../models/owns/subscriptionPlan';
import {
  addFilesToWorkOrder,
  changeWorkOrderStatus
} from '../../../slices/workOrder';
import TaskCard, { TaskAction, TaskCardSkeleton } from './TaskCard';

type TaskTab = 'today' | 'overdue' | 'upcoming' | 'completed';
const TABS: TaskTab[] = ['today', 'overdue', 'upcoming', 'completed'];
const ACTIVE_STATUSES = ['OPEN', 'IN_PROGRESS', 'ON_HOLD'];
const COMPLETION_REQUIREMENT_FIELDS = [
  'completeFiles',
  'completeTasks',
  'completeTime',
  'completeParts',
  'completeCost'
];

const tabLabelKey: Record<TaskTab, string> = {
  today: 'today',
  overdue: 'overdue',
  upcoming: 'mytasks_upcoming',
  completed: 'completed'
};
const emptyKey: Record<TaskTab, string> = {
  today: 'mytasks_empty_today',
  overdue: 'mytasks_empty_overdue',
  upcoming: 'mytasks_empty_upcoming',
  completed: 'mytasks_empty_completed'
};

const isAssignedTo = (workOrder: WorkOrder, userId: number): boolean =>
  workOrder.primaryUser?.id === userId ||
  !!workOrder.assignedTo?.some((user) => user.id === userId) ||
  !!workOrder.team?.users?.some((user) => user.id === userId);

const dueTime = (workOrder: WorkOrder): number =>
  workOrder.dueDate ? new Date(workOrder.dueDate).getTime() : Infinity;

function MyTasks() {
  const { t }: { t: any } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { setTitle } = useContext(TitleContext);
  const { showSnackBar } = useContext(CustomSnackBarContext);
  const { uploadFiles } = useContext(CompanySettingsContext);
  const { user, companySettings, hasEditPermission, hasFeature } = useAuth();

  const [tab, setTab] = useState<TaskTab>('today');
  const [active, setActive] = useState<WorkOrder[]>([]);
  const [completed, setCompleted] = useState<WorkOrder[]>([]);
  const [completedTotal, setCompletedTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [busy, setBusy] = useState<{ id: number; action: TaskAction } | null>(
    null
  );
  const [confirmComplete, setConfirmComplete] = useState<WorkOrder | null>(
    null
  );
  const photoInputRef = useRef<HTMLInputElement>(null);
  const photoTargetRef = useRef<WorkOrder | null>(null);

  useEffect(() => {
    setTitle(t('my_tasks'));
  }, []);

  const search = useCallback(
    (criteria: SearchCriteria) =>
      api.post<Page<WorkOrder>>('work-orders/search', criteria),
    []
  );

  const fetchTasks = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const baseFilters = [
      { field: 'archived', operation: 'eq' as const, value: false },
      { field: 'assignedToUser', operation: 'eq' as const, value: user.id }
    ];
    try {
      const [activePage, completedPage] = await Promise.all([
        search({
          filterFields: [
            ...baseFilters,
            {
              field: 'status',
              operation: 'in',
              values: ACTIVE_STATUSES,
              value: '',
              enumName: 'STATUS'
            }
          ],
          pageNum: 0,
          pageSize: 200,
          sortField: 'dueDate',
          direction: 'ASC'
        }),
        search({
          filterFields: [
            ...baseFilters,
            {
              field: 'status',
              operation: 'in',
              values: ['COMPLETE'],
              value: '',
              enumName: 'STATUS'
            }
          ],
          pageNum: 0,
          pageSize: 30,
          sortField: 'completedOn',
          direction: 'DESC'
        })
      ]);
      // Users without "view others" permission also receive work orders they
      // merely created; keep only the ones actually assigned to them.
      setActive(activePage.content.filter((wo) => isAssignedTo(wo, user.id)));
      const completedMine = completedPage.content.filter((wo) =>
        isAssignedTo(wo, user.id)
      );
      setCompleted(completedMine);
      setCompletedTotal(
        Math.max(completedPage.totalElements ?? 0, completedMine.length)
      );
    } catch (err) {
      showSnackBar(t('mytasks_load_error'), 'error');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const groups = useMemo(() => {
    const todayStart = startOfDay(new Date()).getTime();
    const todayEnd = endOfDay(new Date()).getTime();
    const result: Record<TaskTab, WorkOrder[]> = {
      today: [],
      overdue: [],
      upcoming: [],
      completed
    };
    [...active]
      .sort((a, b) => dueTime(a) - dueTime(b))
      .forEach((workOrder) => {
        const due = dueTime(workOrder);
        if (due < todayStart) result.overdue.push(workOrder);
        else if (due <= todayEnd) result.today.push(workOrder);
        else result.upcoming.push(workOrder);
      });
    return result;
  }, [active, completed]);

  const counts: Record<TaskTab, number> = {
    today: groups.today.length,
    overdue: groups.overdue.length,
    upcoming: groups.upcoming.length,
    completed: completedTotal
  };

  const replaceStatus = (workOrder: WorkOrder, status: string) => {
    if (status === 'COMPLETE') {
      setActive((prev) => prev.filter((wo) => wo.id !== workOrder.id));
      setCompleted((prev) => [
        { ...workOrder, status, completedOn: new Date().toISOString() },
        ...prev
      ]);
      setCompletedTotal((prev) => prev + 1);
    } else
      setActive((prev) =>
        prev.map((wo) => (wo.id === workOrder.id ? { ...wo, status } : wo))
      );
  };

  const changeStatus = (
    workOrder: WorkOrder,
    status: string,
    action: TaskAction
  ) => {
    setBusy({ id: workOrder.id, action });
    return dispatch(changeWorkOrderStatus(workOrder.id, { status }))
      .then(() => {
        replaceStatus(workOrder, status);
        showSnackBar(t('mytasks_status_updated'), 'success');
      })
      .catch(() => showSnackBar(t('mytasks_status_error'), 'error'))
      .finally(() => setBusy(null));
  };

  const openDetails = (workOrder: WorkOrder) =>
    navigate(`/app/work-orders/${workOrder.id}`);

  const completionNeedsDetails = (workOrder: WorkOrder): boolean => {
    const fieldConfigurations =
      companySettings?.workOrderConfiguration?.workOrderFieldConfigurations ??
      [];
    return (
      workOrder.requiredSignature ||
      !!companySettings?.generalPreferences?.askFeedBackOnWOClosed ||
      fieldConfigurations.some(
        (config) =>
          COMPLETION_REQUIREMENT_FIELDS.includes(config.fieldName) &&
          config.fieldType === 'REQUIRED'
      )
    );
  };

  const onAction = (workOrder: WorkOrder, action: TaskAction) => {
    switch (action) {
      case 'start':
        changeStatus(workOrder, 'IN_PROGRESS', action);
        break;
      case 'pause':
        changeStatus(workOrder, 'ON_HOLD', action);
        break;
      case 'complete':
        if (completionNeedsDetails(workOrder)) {
          // Signature / feedback / checklist / time / parts requirements are
          // enforced by the work order details complete flow — never bypass it.
          showSnackBar(t('mytasks_complete_in_details'), 'warning');
          openDetails(workOrder);
        } else setConfirmComplete(workOrder);
        break;
      case 'photo':
        if (!hasFeature(PlanFeature.FILE)) {
          showSnackBar(t('mytasks_photo_unavailable'), 'error');
          return;
        }
        photoTargetRef.current = workOrder;
        photoInputRef.current?.click();
        break;
    }
  };

  const onPhotoSelected = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    const workOrder = photoTargetRef.current;
    if (!files.length || !workOrder) return;
    setBusy({ id: workOrder.id, action: 'photo' });
    try {
      const uploaded = await uploadFiles(files as [], []);
      if (!uploaded.length) return;
      await dispatch(addFilesToWorkOrder(workOrder.id, uploaded));
      showSnackBar(t('mytasks_photo_added'), 'success');
    } catch (err) {
      showSnackBar(t('mytasks_photo_error'), 'error');
    } finally {
      setBusy(null);
    }
  };

  const canEdit = (workOrder: WorkOrder) =>
    hasEditPermission(PermissionEntity.WORK_ORDERS, workOrder);

  const items = groups[tab];

  return (
    <>
      <Helmet>
        <title>{t('my_tasks')}</title>
      </Helmet>
      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={onPhotoSelected}
      />
      <Box
        sx={{
          width: '100%',
          maxWidth: 1040,
          mx: 'auto',
          px: { xs: 1.5, sm: 3 },
          py: { xs: 2, sm: 3 }
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={2}
          sx={{ mb: 2 }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="h3"
              sx={{ fontSize: theme.typography.pxToRem(22), fontWeight: 800 }}
            >
              {t('my_tasks')}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: theme.colors.alpha.black[50], mt: 0.25 }}
            >
              {t('mytasks_subtitle', {
                count: counts.today + counts.overdue + counts.upcoming
              })}
            </Typography>
          </Box>
          <Tooltip title={t('mytasks_refresh')}>
            <span>
              <IconButton
                onClick={fetchTasks}
                disabled={loading}
                aria-label={t('mytasks_refresh')}
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '12px',
                  border: `1px solid ${theme.colors.alpha.black[10]}`,
                  backgroundColor: theme.colors.alpha.white[100],
                  color: theme.colors.primary.main,
                  '& svg': {
                    transition: 'transform .6s ease',
                    transform: loading ? 'rotate(360deg)' : 'none'
                  }
                }}
              >
                <RefreshRoundedIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>

        <Box
          sx={{
            position: 'sticky',
            top: { xs: 0, lg: 8 },
            zIndex: 2,
            mb: 2,
            p: 0.5,
            borderRadius: '14px',
            backgroundColor: theme.colors.alpha.white[100],
            border: `1px solid ${theme.colors.alpha.black[10]}`,
            boxShadow: `0 4px 14px ${alpha('#2A2620', 0.06)}`
          }}
        >
          <Tabs
            value={tab}
            onChange={(_, value: TaskTab) => setTab(value)}
            variant="fullWidth"
            TabIndicatorProps={{ style: { display: 'none' } }}
            sx={{
              minHeight: 48,
              '& .MuiTabs-flexContainer': { gap: 0.5 },
              '& .MuiTab-root': {
                minHeight: 48,
                minWidth: 0,
                px: 0.5,
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: theme.typography.pxToRem(13),
                color: theme.colors.alpha.black[70],
                textTransform: 'none',
                transition: 'background-color .2s, color .2s'
              },
              '& .MuiTab-root.Mui-selected': {
                color: theme.colors.alpha.white[100],
                backgroundColor: theme.colors.primary.main
              }
            }}
          >
            {TABS.map((value) => (
              <Tab
                key={value}
                value={value}
                disableRipple
                label={
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    alignItems="center"
                    spacing={{ xs: 0.25, sm: 0.75 }}
                  >
                    <span>{t(tabLabelKey[value])}</span>
                    {!loading && (
                      <Box
                        component="span"
                        sx={{
                          minWidth: 22,
                          height: 20,
                          px: 0.75,
                          borderRadius: '999px',
                          fontSize: theme.typography.pxToRem(11),
                          lineHeight: '20px',
                          textAlign: 'center',
                          backgroundColor:
                            tab === value
                              ? alpha('#fff', 0.22)
                              : value === 'overdue' && counts.overdue
                              ? theme.colors.error.lighter
                              : theme.colors.alpha.black[5],
                          color:
                            tab === value
                              ? 'inherit'
                              : value === 'overdue' && counts.overdue
                              ? theme.colors.error.main
                              : theme.colors.alpha.black[70]
                        }}
                      >
                        {counts[value]}
                      </Box>
                    )}
                  </Stack>
                }
              />
            ))}
          </Tabs>
        </Box>

        {loading ? (
          <TaskGrid>
            {[0, 1, 2, 3].map((index) => (
              <TaskCardSkeleton key={index} />
            ))}
          </TaskGrid>
        ) : items.length ? (
          <TaskGrid>
            {items.map((workOrder) => (
              <TaskCard
                key={workOrder.id}
                workOrder={workOrder}
                overdue={tab === 'overdue'}
                canEdit={canEdit(workOrder)}
                busyAction={busy?.id === workOrder.id ? busy.action : null}
                onOpen={() => openDetails(workOrder)}
                onAction={(action) => onAction(workOrder, action)}
              />
            ))}
          </TaskGrid>
        ) : (
          <EmptyState
            title={t(emptyKey[tab])}
            description={t('mytasks_empty_hint')}
          />
        )}
      </Box>

      <Dialog
        open={!!confirmComplete}
        onClose={() => setConfirmComplete(null)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: '16px', m: 2 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: 18 }}>
          {t('mytasks_confirm_complete_title')}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            {t('mytasks_confirm_complete_body', {
              title: confirmComplete?.title ?? ''
            })}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0, gap: 1 }}>
          <Button
            onClick={() => setConfirmComplete(null)}
            sx={{ minHeight: 44, flex: 1 }}
            variant="outlined"
          >
            {t('cancel')}
          </Button>
          <Button
            variant="contained"
            color="success"
            sx={{ minHeight: 44, flex: 1, color: '#fff' }}
            onClick={() => {
              const workOrder = confirmComplete;
              setConfirmComplete(null);
              if (workOrder) changeStatus(workOrder, 'COMPLETE', 'complete');
            }}
          >
            {t('complete')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

function TaskGrid({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gap: 2,
        gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
        alignItems: 'stretch'
      }}
    >
      {children}
    </Box>
  );
}

function EmptyState({
  title,
  description
}: {
  title: string;
  description: string;
}) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        textAlign: 'center',
        py: { xs: 6, sm: 8 },
        px: 3,
        borderRadius: '16px',
        border: `1px dashed ${theme.colors.alpha.black[30]}`,
        backgroundColor: theme.colors.alpha.white[100]
      }}
    >
      <Box
        sx={{
          width: 72,
          height: 72,
          mx: 'auto',
          mb: 2,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: theme.colors.primary.main,
          backgroundColor: alpha(theme.colors.primary.main, 0.1)
        }}
      >
        <AssignmentTurnedInOutlinedIcon sx={{ fontSize: 36 }} />
      </Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.75 }}>
        {title}
      </Typography>
      <Typography
        variant="body2"
        sx={{ color: theme.colors.alpha.black[50], maxWidth: 320, mx: 'auto' }}
      >
        {description}
      </Typography>
    </Box>
  );
}

export default MyTasks;
