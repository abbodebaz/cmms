import { Box, Typography, TypographyProps, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { ReactNode } from 'react';

/** Responsive grid of KPI tiles (wraps on small screens). */
export function KpiRow({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        width: '100%',
        display: 'grid',
        gap: 1.5,
        gridTemplateColumns: {
          xs: 'repeat(2, minmax(0, 1fr))',
          md: 'repeat(auto-fit, minmax(150px, 1fr))'
        }
      }}
    >
      {children}
    </Box>
  );
}

export function KpiTile({ children }: { children: ReactNode }) {
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  return (
    <Box
      sx={{
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column-reverse',
        justifyContent: 'flex-end',
        gap: 0.5,
        p: { xs: 1.5, sm: 2 },
        borderRadius: '12px',
        textAlign: 'start',
        border: `1px solid ${alpha(primary, 0.14)}`,
        background: `linear-gradient(180deg, ${alpha(primary, 0.06)} 0%, ${alpha(
          primary,
          0.015
        )} 100%)`
      }}
    >
      {children}
    </Box>
  );
}

/** Big number. Accepts the Typography props used by existing call sites (onClick/style). */
export function KpiValue({ children, sx, variant, fontWeight, ...rest }: TypographyProps) {
  const theme = useTheme();
  return (
    <Typography
      {...rest}
      sx={{
        fontWeight: 700,
        fontSize: { xs: theme.typography.pxToRem(22), md: theme.typography.pxToRem(26) },
        lineHeight: 1.2,
        color: theme.palette.text.primary,
        wordBreak: 'break-word',
        transition: theme.transitions.create('color'),
        '&[style*="pointer"]:hover': { color: theme.palette.primary.main },
        ...(sx as any)
      }}
    >
      {children}
    </Typography>
  );
}

export function KpiLabel({ children }: { children: ReactNode }) {
  const theme = useTheme();
  return (
    <Typography
      sx={{
        fontSize: theme.typography.pxToRem(12.5),
        fontWeight: 500,
        color: theme.palette.text.secondary,
        lineHeight: 1.4
      }}
    >
      {children}
    </Typography>
  );
}
