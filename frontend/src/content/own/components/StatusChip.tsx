import { Box, Theme, useTheme } from '@mui/material';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

export type SoftChipTone =
  | 'primary'
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'neutral';

const getToneColors = (theme: Theme, tone: SoftChipTone) => {
  if (tone === 'neutral') {
    return {
      bg: theme.colors.alpha.black[5],
      border: theme.colors.alpha.black[10],
      dot: theme.colors.alpha.black[30],
      text: theme.colors.alpha.black[70]
    };
  }
  const palette = theme.colors[tone];
  return {
    bg: palette.lighter,
    border: 'transparent',
    dot: palette.main,
    text: palette.dark
  };
};

/**
 * Soft tinted pill: tinted background + solid dot + label.
 * Shared base for status / priority chips in tables and details.
 */
export function SoftChip({
  tone,
  label,
  size = 'small'
}: {
  tone: SoftChipTone;
  label: ReactNode;
  size?: 'small' | 'medium';
}) {
  const theme = useTheme();
  const c = getToneColors(theme, tone);
  const small = size === 'small';
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.75,
        maxWidth: '100%',
        height: small ? 24 : 28,
        px: small ? 1.25 : 1.5,
        borderRadius: '999px',
        backgroundColor: c.bg,
        border: `1px solid ${c.border}`,
        color: c.text,
        fontSize: theme.typography.pxToRem(small ? 12 : 13),
        fontWeight: 600,
        lineHeight: 1,
        whiteSpace: 'nowrap',
        verticalAlign: 'middle'
      }}
    >
      <Box
        component="span"
        sx={{
          width: 7,
          height: 7,
          flexShrink: 0,
          borderRadius: '50%',
          backgroundColor: c.dot
        }}
      />
      <Box
        component="span"
        sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
      >
        {label}
      </Box>
    </Box>
  );
}

export type WorkOrderStatusValue =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'ON_HOLD'
  | 'COMPLETE';

export const statusTone = (status: string): SoftChipTone => {
  switch (status) {
    case 'OPEN':
      return 'info';
    case 'IN_PROGRESS':
      return 'primary';
    case 'ON_HOLD':
      return 'warning';
    case 'COMPLETE':
      return 'success';
    default:
      return 'neutral';
  }
};

export default function StatusChip({
  status,
  size
}: {
  status: WorkOrderStatusValue | string | null | undefined;
  size?: 'small' | 'medium';
}) {
  const { t }: { t: any } = useTranslation();
  if (!status) return null;
  return <SoftChip tone={statusTone(status)} label={t(status)} size={size} />;
}
