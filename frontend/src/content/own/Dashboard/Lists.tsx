import { ReactNode } from 'react';
import {
  Box,
  ButtonBase,
  Divider,
  Skeleton,
  Stack,
  Typography,
  useTheme
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { differenceInCalendarDays, format } from 'date-fns';
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import PrecisionManufacturingOutlinedIcon from '@mui/icons-material/PrecisionManufacturingOutlined';
import WorkOrder from '../../../models/owns/workOrder';
import Request from '../../../models/owns/request';
import PriorityWrapper from '../components/PriorityWrapper';
import { SoftChip, SoftChipTone } from '../components/StatusChip';

const formatDate = (value?: string | null): string =>
  value ? format(new Date(value), 'dd/MM/yyyy') : '';

function RowButton({
  onClick,
  children
}: {
  onClick: () => void;
  children: ReactNode;
}) {
  const theme = useTheme();
  return (
    <ButtonBase
      onClick={onClick}
      focusRipple
      sx={{
        display: 'block',
        width: '100%',
        textAlign: 'start',
        px: { xs: 2, sm: 2.5 },
        py: 1.5,
        transition: theme.transitions.create('background-color'),
        '&:hover, &.Mui-focusVisible': {
          backgroundColor: alpha(theme.colors.primary.main, 0.06)
        }
      }}
    >
      {children}
    </ButtonBase>
  );
}

export function ListSkeleton({ rows }: { rows: number }) {
  return (
    <Stack divider={<Divider />}>
      {Array.from({ length: rows }).map((_, index) => (
        <Box key={index} sx={{ px: { xs: 2, sm: 2.5 }, py: 1.5 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="70%" height={22} />
              <Skeleton variant="text" width="45%" height={18} />
            </Box>
            <Skeleton
              variant="rectangular"
              width={64}
              height={24}
              sx={{ borderRadius: '999px' }}
            />
          </Stack>
        </Box>
      ))}
    </Stack>
  );
}

export function WorkOrderRow({
  workOrder,
  onClick
}: {
  workOrder: WorkOrder;
  onClick: () => void;
}) {
  const theme = useTheme();
  const { t }: { t: any } = useTranslation();
  const due = workOrder.dueDate ? new Date(workOrder.dueDate) : null;
  const daysLate = due ? differenceInCalendarDays(new Date(), due) : 0;
  const overdue = !!due && due.getTime() < Date.now();

  return (
    <RowButton onClick={onClick}>
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={1} alignItems="baseline">
            {workOrder.customId && (
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.text.secondary,
                  fontWeight: 600,
                  flexShrink: 0
                }}
              >
                #{workOrder.customId}
              </Typography>
            )}
            <Typography
              variant="subtitle2"
              noWrap
              sx={{ fontWeight: 600, color: theme.palette.text.primary }}
            >
              {workOrder.title}
            </Typography>
          </Stack>
          <Stack
            direction="row"
            alignItems="center"
            sx={{
              mt: 0.5,
              columnGap: 2,
              rowGap: 0.25,
              flexWrap: 'wrap',
              color: theme.palette.text.secondary
            }}
          >
            <Stack direction="row" spacing={0.5} alignItems="center">
              <EventRoundedIcon sx={{ fontSize: 15 }} />
              <Typography
                variant="caption"
                sx={{
                  fontWeight: overdue ? 700 : 500,
                  color: overdue
                    ? theme.colors.error.main
                    : theme.palette.text.secondary
                }}
              >
                {due ? formatDate(workOrder.dueDate) : t('dashboard_no_due_date')}
                {overdue && daysLate > 0 && (
                  <>
                    {' · '}
                    {t('dashboard_days_late', { count: daysLate })}
                  </>
                )}
              </Typography>
            </Stack>
            {workOrder.asset && (
              <Stack
                direction="row"
                spacing={0.5}
                alignItems="center"
                sx={{ minWidth: 0 }}
              >
                <PrecisionManufacturingOutlinedIcon sx={{ fontSize: 15 }} />
                <Typography variant="caption" noWrap>
                  {workOrder.asset.name}
                </Typography>
              </Stack>
            )}
          </Stack>
        </Box>
        <Box sx={{ flexShrink: 0, pt: 0.25 }}>
          <PriorityWrapper priority={workOrder.priority} />
        </Box>
      </Stack>
    </RowButton>
  );
}

const requestStatus = (
  request: Request
): { key: string; tone: SoftChipTone } =>
  request.cancelled
    ? { key: 'rejected', tone: 'error' }
    : request.workOrder
    ? { key: 'approved', tone: 'success' }
    : { key: 'pending', tone: 'warning' };

export function RequestRow({
  request,
  onClick
}: {
  request: Request;
  onClick: () => void;
}) {
  const theme = useTheme();
  const { t }: { t: any } = useTranslation();
  const status = requestStatus(request);

  return (
    <RowButton onClick={onClick}>
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="subtitle2"
            noWrap
            sx={{ fontWeight: 600, color: theme.palette.text.primary }}
          >
            {request.title}
          </Typography>
          <Stack
            direction="row"
            alignItems="center"
            sx={{
              mt: 0.5,
              columnGap: 1.5,
              rowGap: 0.5,
              flexWrap: 'wrap',
              color: theme.palette.text.secondary
            }}
          >
            <Typography variant="caption">
              {formatDate(request.createdAt)}
            </Typography>
            {request.asset && (
              <Typography variant="caption" noWrap sx={{ minWidth: 0 }}>
                · {request.asset.name}
              </Typography>
            )}
            {request.priority && request.priority !== 'NONE' && (
              <PriorityWrapper priority={request.priority} />
            )}
          </Stack>
        </Box>
        <Box sx={{ flexShrink: 0, pt: 0.25 }}>
          <SoftChip tone={status.tone} label={t(status.key)} />
        </Box>
      </Stack>
    </RowButton>
  );
}
