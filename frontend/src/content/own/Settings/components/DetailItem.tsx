import { Box, Typography, useTheme } from '@mui/material';
import { ReactNode } from 'react';

/** Key/value detail: small muted label above, value below; empty → muted "—". */
export default function DetailItem({
  label,
  value
}: {
  label: ReactNode;
  value?: ReactNode;
}) {
  const theme = useTheme();
  const empty =
    value === null ||
    value === undefined ||
    (typeof value === 'string' && value.trim() === '');
  return (
    <Box sx={{ minWidth: 0, textAlign: 'start' }}>
      <Typography
        sx={{
          fontSize: theme.typography.pxToRem(12.5),
          fontWeight: 500,
          color: theme.palette.text.secondary,
          mb: 0.5
        }}
      >
        {label}
      </Typography>
      <Typography
        component="div"
        sx={{
          fontSize: theme.typography.pxToRem(14),
          fontWeight: 600,
          color: empty ? theme.palette.text.disabled : theme.palette.text.primary,
          wordBreak: 'break-word'
        }}
      >
        {empty ? '—' : value}
      </Typography>
    </Box>
  );
}
