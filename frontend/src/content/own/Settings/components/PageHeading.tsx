import { Box, Stack, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { ReactNode, useContext, useEffect } from 'react';
import { TitleContext } from '../../../../contexts/TitleContext';

/**
 * Consistent page header used by settings, account, subscription, import and
 * analytics pages: 22–26px bold title, muted subtitle, optional icon and
 * actions aligned to the end (wrapping under the title on phones).
 */
export default function PageHeading({
  title,
  description,
  icon,
  actions,
  sx
}: {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
  sx?: any;
}) {
  const { setHideHeaderTitle } = useContext(TitleContext);
  useEffect(() => {
    setHideHeaderTitle?.(true);
    return () => setHideHeaderTitle?.(false);
  }, []);
  const theme = useTheme();
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      alignItems={{ xs: 'stretch', sm: 'center' }}
      justifyContent="space-between"
      spacing={2}
      sx={{ mb: { xs: 2, md: 3 }, ...sx }}
    >
      <Stack direction="row" spacing={1.75} alignItems="center" sx={{ minWidth: 0 }}>
        {icon && (
          <Box
            sx={{
              width: 46,
              height: 46,
              borderRadius: '14px',
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
              color: theme.palette.primary.main,
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.18)}`
            }}
          >
            {icon}
          </Box>
        )}
        <Box sx={{ minWidth: 0, textAlign: 'start' }}>
          <Typography
            component="h1"
            sx={{
              fontWeight: 700,
              fontSize: { xs: theme.typography.pxToRem(21), md: theme.typography.pxToRem(24) },
              lineHeight: 1.25,
              color: theme.palette.text.primary
            }}
          >
            {title}
          </Typography>
          {description && (
            <Typography
              sx={{
                mt: 0.5,
                fontSize: theme.typography.pxToRem(13.5),
                color: theme.palette.text.secondary
              }}
            >
              {description}
            </Typography>
          )}
        </Box>
      </Stack>
      {actions && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 1,
            flexShrink: 0
          }}
        >
          {actions}
        </Box>
      )}
    </Stack>
  );
}
