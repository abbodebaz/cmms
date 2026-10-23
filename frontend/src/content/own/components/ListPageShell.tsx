import { useContext, useEffect } from 'react';
import { TitleContext } from '../../../contexts/TitleContext';
import { ReactNode } from 'react';
import {
  Box,
  Button,
  ButtonProps,
  Card,
  IconButton,
  IconButtonProps,
  Stack,
  styled,
  SxProps,
  Tabs,
  Theme,
  Tooltip,
  Typography
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import AddTwoToneIcon from '@mui/icons-material/AddTwoTone';
import { useTranslation } from 'react-i18next';

/**
 * Shared shell for list pages: page wrapper, header (title + count + actions),
 * primary CTA, soft icon buttons, segmented view toggle, toolbar row and the
 * card that hosts the table.
 */

export const ListPage = ({ children }: { children: ReactNode }) => (
  <Box
    sx={{
      px: { xs: 2, md: 3 },
      pt: { xs: 2, md: 2.5 },
      pb: 3
    }}
  >
    {children}
  </Box>
);

export const ListPageHeader = ({
  title,
  subtitle,
  count,
  actions
}: {
  title: string;
  subtitle?: ReactNode;
  count?: number;
  actions?: ReactNode;
}) => {
  const { setHideHeaderTitle } = useContext(TitleContext);
  useEffect(() => {
    setHideHeaderTitle?.(true);
    return () => setHideHeaderTitle?.(false);
  }, []);
  const { t }: { t: any } = useTranslation();
  const hasCount = typeof count === 'number' && !Number.isNaN(count);
  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      alignItems={{ xs: 'stretch', md: 'center' }}
      justifyContent="space-between"
      gap={2}
      sx={{ mb: 2.5 }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography
          component="h1"
          sx={{
            fontSize: { xs: 22, md: 24 },
            fontWeight: 700,
            lineHeight: 1.25,
            color: 'text.primary',
            textAlign: 'start'
          }}
        >
          {title}
        </Typography>
        {(subtitle || hasCount) && (
          <Typography
            sx={{
              mt: 0.5,
              fontSize: 13.5,
              fontWeight: 500,
              color: 'text.secondary',
              textAlign: 'start'
            }}
          >
            {subtitle ?? t('lists.total_records', { count })}
          </Typography>
        )}
      </Box>
      {actions && (
        <Stack
          direction="row"
          alignItems="center"
          flexWrap="wrap"
          gap={1}
          sx={{ justifyContent: { xs: 'flex-start', md: 'flex-end' } }}
        >
          {actions}
        </Stack>
      )}
    </Stack>
  );
};

export const primaryCtaSx = (theme: Theme) => ({
  borderRadius: '12px',
  fontWeight: 700,
  minHeight: 40,
  px: 2.25,
  whiteSpace: 'nowrap' as const,
  boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.28)}`,
  '&:hover': {
    boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.36)}`
  }
});

export const PrimaryAddButton = ({
  label,
  onClick,
  startIcon,
  sx,
  ...rest
}: {
  label: string;
  onClick: () => void;
  startIcon?: ReactNode;
  sx?: SxProps<Theme>;
} & Omit<ButtonProps, 'onClick' | 'startIcon' | 'sx'>) => (
  <Button
    variant="contained"
    color="primary"
    startIcon={startIcon ?? <AddTwoToneIcon />}
    onClick={onClick}
    sx={[
      (theme: Theme) => primaryCtaSx(theme),
      ...(Array.isArray(sx) ? sx : [sx])
    ]}
    {...rest}
  >
    {label}
  </Button>
);

export const softIconButtonSx = (theme: Theme) => ({
  width: 40,
  height: 40,
  borderRadius: '12px',
  color: theme.palette.primary.dark,
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  transition: 'background-color .2s',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.18)
  }
});

export const SoftIconButton = ({
  title,
  children,
  sx,
  ...rest
}: {
  title: string;
  children: ReactNode;
  sx?: SxProps<Theme>;
} & Omit<IconButtonProps, 'title' | 'children' | 'sx'>) => (
  <Tooltip title={title} arrow>
    <IconButton
      aria-label={title}
      sx={[
        (theme: Theme) => softIconButtonSx(theme),
        ...(Array.isArray(sx) ? sx : [sx])
      ]}
      {...rest}
    >
      {children}
    </IconButton>
  </Tooltip>
);

/** Pill-group view toggle: drop-in replacement for MUI <Tabs>. */
export const SegmentedTabs = styled(Tabs)(({ theme }) => ({
  display: 'inline-flex',
  maxWidth: '100%',
  height: 44,
  minHeight: 44,
  padding: 3,
  borderRadius: 12,
  overflow: 'hidden',
  backgroundColor: alpha(theme.palette.primary.main, 0.08),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.14)}`,
  '& .MuiTabs-scroller, & .MuiTabs-scrollableX': {
    overflowX: 'auto !important' as any,
    overflowY: 'hidden',
    scrollbarWidth: 'none',
    '&::-webkit-scrollbar': { display: 'none' }
  },
  '& .MuiTabs-flexContainer': { height: '100%' },
  '& .MuiTabs-scrollButtons': { width: 28 },
  '& .MuiTabs-indicator': {
    height: '100%',
    minHeight: 0,
    borderRadius: 9,
    border: 0,
    backgroundColor: theme.palette.primary.main,
    boxShadow: `0 3px 8px ${alpha(theme.palette.primary.main, 0.3)}`
  },
  '& .MuiTab-root.MuiButtonBase-root': {
    height: 36,
    minHeight: 36,
    minWidth: 0,
    margin: 0,
    paddingLeft: 16,
    paddingRight: 16,
    borderRadius: 9,
    fontSize: 13.5,
    fontWeight: 600,
    textTransform: 'none',
    color: theme.palette.text.secondary,
    zIndex: 1,
    transition: 'color .2s',
    '&:hover': { color: theme.palette.primary.dark },
    '&.Mui-selected, &.Mui-selected:hover': {
      color: theme.palette.primary.contrastText
    },
    '&.Mui-disabled': { opacity: 0.5 }
  }
}));

/** Search + filters row that wraps nicely on small screens. */
export const ListToolbar = ({
  children,
  end,
  bare = false
}: {
  children: ReactNode;
  end?: ReactNode;
  /** bare: no own padding/border (when the parent already pads). */
  bare?: boolean;
}) => (
  <Box
    sx={{
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 1.25,
      width: '100%',
      ...(bare
        ? { pb: 2 }
        : {
            px: { xs: 2, md: 2.5 },
            py: 2,
            borderBottom: (theme: Theme) =>
              `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
          })
    }}
  >
    {children}
    {end && (
      <Box
        sx={{
          ml: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        {end}
      </Box>
    )}
  </Box>
);

/** Card hosting the table/list of a list page. */
export const ListCard = ({
  children,
  sx
}: {
  children: ReactNode;
  sx?: SxProps<Theme>;
}) => (
  <Card
    sx={[
      (theme: Theme) => ({
        borderRadius: '14px',
        border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
        backgroundColor: theme.palette.background.paper,
        boxShadow: `0 4px 18px ${alpha(theme.palette.common.black, 0.04)}`,
        overflow: 'hidden'
      }),
      ...(Array.isArray(sx) ? sx : [sx])
    ]}
  >
    {children}
  </Card>
);

/** Padding wrapper for the table inside a ListCard. */
export const ListCardBody = ({ children }: { children: ReactNode }) => (
  <Box sx={{ px: { xs: 1, md: 2 }, py: 1.5, width: '100%' }}>{children}</Box>
);

/** Pill-shaped filter button style (outlined or active). */
export const filterPillSx =
  (active: boolean, iconOnly = false) =>
  (theme: Theme) => ({
    minWidth: 0,
    height: 38,
    borderRadius: '20px',
    px: iconOnly ? 1.25 : 1.75,
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'none' as const,
    whiteSpace: 'nowrap' as const,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: active
      ? alpha(theme.palette.primary.main, 0.6)
      : alpha(theme.palette.primary.main, 0.3),
    color: active ? theme.palette.primary.dark : theme.palette.text.primary,
    backgroundColor: active
      ? alpha(theme.palette.primary.main, 0.14)
      : theme.palette.background.paper,
    boxShadow: 'none',
    '& .MuiButton-startIcon': {
      margin: 0,
      mr: iconOnly ? 0 : 0.75,
      color: theme.palette.primary.main
    },
    '&:hover': {
      borderColor: alpha(theme.palette.primary.main, 0.6),
      backgroundColor: alpha(theme.palette.primary.main, 0.1),
      boxShadow: 'none'
    }
  });
