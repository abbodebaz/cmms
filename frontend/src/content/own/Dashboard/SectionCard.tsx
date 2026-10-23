import { ReactNode } from 'react';
import { Box, Button, Card, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';

interface SectionCardProps {
  title: string;
  subtitle?: ReactNode;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  children: ReactNode;
  /** Remove inner padding of the body (for edge-to-edge lists) */
  flush?: boolean;
}

export default function SectionCard({
  title,
  subtitle,
  icon,
  actionLabel,
  onAction,
  children,
  flush
}: SectionCardProps) {
  const theme = useTheme();
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: theme.general.borderRadiusLg,
        border: `1px solid ${theme.colors.alpha.black[10]}`,
        boxShadow: '0 1px 2px rgba(42, 38, 32, 0.04)'
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: { xs: 2, sm: 2.5 },
          pt: 2.25,
          pb: 1.75
        }}
      >
        {icon && (
          <Box
            sx={{
              flexShrink: 0,
              width: 36,
              height: 36,
              borderRadius: '50%',
              display: 'grid',
              placeItems: 'center',
              color: theme.colors.primary.main,
              backgroundColor: alpha(theme.colors.primary.main, 0.12),
              '& svg': { fontSize: 20 }
            }}
          >
            {icon}
          </Box>
        )}
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }} noWrap>
            {title}
          </Typography>
          {subtitle && (
            <Typography
              variant="caption"
              component="div"
              sx={{ color: theme.palette.text.secondary }}
              noWrap
            >
              {subtitle}
            </Typography>
          )}
        </Box>
        {actionLabel && onAction && (
          <Button
            size="small"
            onClick={onAction}
            sx={{ flexShrink: 0, fontWeight: 600 }}
          >
            {actionLabel}
          </Button>
        )}
      </Box>
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          px: flush ? 0 : { xs: 2, sm: 2.5 },
          pb: flush ? 1 : 2.5
        }}
      >
        {children}
      </Box>
    </Card>
  );
}

export function EmptyState({
  icon,
  title,
  description
}: {
  icon: ReactNode;
  title: string;
  description?: string;
}) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        gap: 1,
        py: 4,
        px: 2
      }}
    >
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          color: theme.colors.primary.main,
          backgroundColor: alpha(theme.colors.primary.main, 0.1),
          mb: 0.5,
          '& svg': { fontSize: 28 }
        }}
      >
        {icon}
      </Box>
      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
      {description && (
        <Typography
          variant="body2"
          sx={{ color: theme.palette.text.secondary, maxWidth: 320 }}
        >
          {description}
        </Typography>
      )}
    </Box>
  );
}
