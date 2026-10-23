import {
  Box,
  Button,
  Card,
  CardActionArea,
  CircularProgress,
  Divider,
  Skeleton,
  Stack,
  Typography,
  useTheme
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded';
import AddAPhotoOutlinedIcon from '@mui/icons-material/AddAPhotoOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import PrecisionManufacturingOutlinedIcon from '@mui/icons-material/PrecisionManufacturingOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import WorkOrder from '../../../models/owns/workOrder';
import PriorityWrapper from '../components/PriorityWrapper';
import StatusChip from '../components/StatusChip';

export type TaskAction = 'start' | 'pause' | 'complete' | 'photo';

interface TaskCardProps {
  workOrder: WorkOrder;
  overdue: boolean;
  canEdit: boolean;
  busyAction: TaskAction | null;
  onOpen: () => void;
  onAction: (action: TaskAction) => void;
}

export const formatDueDate = (date: string | null | undefined): string =>
  date ? format(new Date(date), 'dd/MM/yyyy') : null;

export default function TaskCard({
  workOrder,
  overdue,
  canEdit,
  busyAction,
  onOpen,
  onAction
}: TaskCardProps) {
  const { t }: { t: any } = useTranslation();
  const theme = useTheme();
  const isComplete = workOrder.status === 'COMPLETE';
  const isInProgress = workOrder.status === 'IN_PROGRESS';
  const disabled = !canEdit || busyAction !== null;
  const dueLabel = formatDueDate(workOrder.dueDate);
  const accent = overdue
    ? theme.colors.error.main
    : isInProgress
    ? theme.colors.primary.main
    : workOrder.status === 'ON_HOLD'
    ? theme.colors.warning.main
    : isComplete
    ? theme.colors.success.main
    : theme.colors.alpha.black[30];

  const actionButtonSx = {
    minHeight: 48,
    borderRadius: '12px',
    fontWeight: 700,
    fontSize: theme.typography.pxToRem(14),
    flex: 1,
    minWidth: 0,
    whiteSpace: 'nowrap' as const
  };

  const spinner = <CircularProgress size={18} color="inherit" />;

  return (
    <Card
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '16px',
        border: `1px solid ${theme.colors.alpha.black[10]}`,
        boxShadow: `0 1px 2px ${alpha('#2A2620', 0.06)}, 0 6px 18px ${alpha(
          '#2A2620',
          0.05
        )}`,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        '&::before': {
          content: '""',
          position: 'absolute',
          insetInlineStart: 0,
          top: 0,
          bottom: 0,
          width: 4,
          backgroundColor: accent
        }
      }}
    >
      <CardActionArea
        onClick={onOpen}
        sx={{ p: 2, pl: 2.5, flex: 1, alignItems: 'flex-start' }}
      >
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{ flexWrap: 'wrap', rowGap: 1, mb: 1.25 }}
        >
          <StatusChip status={workOrder.status} />
          <PriorityWrapper priority={workOrder.priority} withSuffix />
          {workOrder.customId && (
            <Typography
              variant="caption"
              sx={{
                ml: 'auto !important',
                color: theme.colors.alpha.black[50],
                fontWeight: 600
              }}
            >
              #{workOrder.customId}
            </Typography>
          )}
        </Stack>
        <Typography
          variant="h4"
          sx={{
            fontSize: theme.typography.pxToRem(17),
            lineHeight: 1.35,
            fontWeight: 700,
            mb: 1.25,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            wordBreak: 'break-word'
          }}
        >
          {workOrder.title}
        </Typography>
        <Stack spacing={0.75}>
          {workOrder.asset && (
            <MetaRow
              icon={<PrecisionManufacturingOutlinedIcon fontSize="small" />}
              text={workOrder.asset.name}
            />
          )}
          {workOrder.location && (
            <MetaRow
              icon={<PlaceOutlinedIcon fontSize="small" />}
              text={workOrder.location.name}
            />
          )}
          <MetaRow
            icon={<EventOutlinedIcon fontSize="small" />}
            text={
              isComplete && workOrder.completedOn
                ? `${t('COMPLETE')}: ${formatDueDate(workOrder.completedOn)}`
                : dueLabel
                ? `${t('due_date')}: ${dueLabel}`
                : t('no_due_date')
            }
            color={overdue ? theme.colors.error.main : undefined}
            strong={overdue}
          />
        </Stack>
      </CardActionArea>
      {!isComplete && (
        <>
          <Divider />
          <Box
            sx={{
              p: 1.5,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 1
            }}
          >
            {isInProgress ? (
              <Button
                variant="outlined"
                color="warning"
                disabled={disabled}
                startIcon={
                  busyAction === 'pause' ? spinner : <PauseRoundedIcon />
                }
                onClick={() => onAction('pause')}
                sx={actionButtonSx}
              >
                {t('mytasks_pause')}
              </Button>
            ) : (
              <Button
                variant="contained"
                disabled={disabled}
                startIcon={
                  busyAction === 'start' ? spinner : <PlayArrowRoundedIcon />
                }
                onClick={() => onAction('start')}
                sx={actionButtonSx}
              >
                {workOrder.status === 'ON_HOLD'
                  ? t('mytasks_resume')
                  : t('start')}
              </Button>
            )}
            <Button
              variant={isInProgress ? 'contained' : 'outlined'}
              color="success"
              disabled={disabled}
              startIcon={
                busyAction === 'complete' ? spinner : <TaskAltRoundedIcon />
              }
              onClick={() => onAction('complete')}
              sx={{
                ...actionButtonSx,
                ...(isInProgress ? { color: '#fff' } : {})
              }}
            >
              {t('complete')}
            </Button>
            <Button
              variant="text"
              disabled={disabled}
              startIcon={
                busyAction === 'photo' ? spinner : <AddAPhotoOutlinedIcon />
              }
              onClick={() => onAction('photo')}
              sx={{
                ...actionButtonSx,
                gridColumn: '1 / -1',
                backgroundColor: alpha(theme.colors.primary.main, 0.08),
                '&:hover': {
                  backgroundColor: alpha(theme.colors.primary.main, 0.14)
                }
              }}
            >
              {t('mytasks_add_photo')}
            </Button>
          </Box>
        </>
      )}
    </Card>
  );
}

function MetaRow({
  icon,
  text,
  color,
  strong
}: {
  icon: JSX.Element;
  text: string;
  color?: string;
  strong?: boolean;
}) {
  const theme = useTheme();
  return (
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      sx={{ color: color ?? theme.colors.alpha.black[70], minWidth: 0 }}
    >
      <Box
        sx={{
          display: 'flex',
          color: color ?? theme.colors.alpha.black[50],
          flexShrink: 0
        }}
      >
        {icon}
      </Box>
      <Typography
        variant="body2"
        sx={{
          color: 'inherit',
          fontWeight: strong ? 700 : 500,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}
      >
        {text}
      </Typography>
    </Stack>
  );
}

export function TaskCardSkeleton() {
  const theme = useTheme();
  return (
    <Card
      sx={{
        borderRadius: '16px',
        border: `1px solid ${theme.colors.alpha.black[10]}`,
        boxShadow: 'none',
        p: 2
      }}
    >
      <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
        <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 12 }} />
        <Skeleton variant="rectangular" width={90} height={24} sx={{ borderRadius: 12 }} />
      </Stack>
      <Skeleton variant="text" width="85%" height={28} />
      <Skeleton variant="text" width="60%" />
      <Skeleton variant="text" width="50%" />
      <Skeleton variant="text" width="40%" sx={{ mb: 1.5 }} />
      <Stack direction="row" spacing={1}>
        <Skeleton variant="rectangular" height={48} sx={{ flex: 1, borderRadius: 3 }} />
        <Skeleton variant="rectangular" height={48} sx={{ flex: 1, borderRadius: 3 }} />
      </Stack>
      <Skeleton variant="rectangular" height={48} sx={{ mt: 1, borderRadius: 3 }} />
    </Card>
  );
}
