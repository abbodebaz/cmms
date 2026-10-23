import {
  Box,
  BoxProps,
  CircularProgress,
  Tabs,
  TabsProps,
  Typography,
  useTheme
} from '@mui/material';
import { alpha, SxProps, Theme } from '@mui/material/styles';
import { ReactNode } from 'react';

/**
 * Shared building blocks for record DETAILS views (drawers and pages):
 * - DetailsPage: padded vertical stack of cards.
 * - DetailsHeader: title / muted subtitle / chips / compact action toolbar.
 * - DetailGrid + DetailItem: responsive label-above-value grid ("—" for empty).
 * - DetailRow: clean list row for lists rendered inside SectionCard noPadding.
 * - DetailThumb: rounded image thumbnail.
 */

export const DetailsPage = ({
  children,
  sx,
  dense = false
}: {
  children: ReactNode;
  sx?: SxProps<Theme>;
  dense?: boolean;
}) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      gap: { xs: 2, sm: 2.5 },
      p: dense ? 0 : { xs: 2, sm: 3 },
      minWidth: 0,
      ...((sx as object) ?? {})
    }}
  >
    {children}
  </Box>
);

export const DetailsHeader = ({
  title,
  subtitle,
  chips,
  actions,
  description,
  media,
  cta,
  children
}: {
  /** Prominent button(s) shown next to the toolbar (e.g. "New work order"). */
  cta?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  chips?: ReactNode;
  actions?: ReactNode;
  description?: ReactNode;
  media?: ReactNode;
  children?: ReactNode;
}) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        pb: 2,
        borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.14)}`
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 2,
          flexWrap: { xs: 'wrap', sm: 'nowrap' }
        }}
      >
        {media && <Box sx={{ flexShrink: 0 }}>{media}</Box>}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {subtitle && (
            <Typography
              component="div"
              sx={{
                color: 'text.secondary',
                fontSize: theme.typography.pxToRem(12.5),
                fontWeight: 500,
                mb: 0.5,
                textAlign: 'start'
              }}
            >
              {subtitle}
            </Typography>
          )}
          <Typography
            component="h2"
            sx={{
              fontSize: { xs: theme.typography.pxToRem(20), sm: theme.typography.pxToRem(23) },
              fontWeight: 700,
              lineHeight: 1.3,
              color: 'text.primary',
              wordBreak: 'break-word',
              textAlign: 'start'
            }}
          >
            {title}
          </Typography>
          {chips && (
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: 1,
                mt: 1.25
              }}
            >
              {chips}
            </Box>
          )}
        </Box>
        {(actions || cta) && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              flexShrink: 0,
              flexWrap: 'wrap'
            }}
          >
            {cta}
            {actions && <DetailsToolbar>{actions}</DetailsToolbar>}
          </Box>
        )}
      </Box>
      {description && (
        <Typography
          component="div"
          sx={{
            color: 'text.secondary',
            fontSize: theme.typography.pxToRem(14),
            lineHeight: 1.6,
            whiteSpace: 'pre-line',
            wordBreak: 'break-word',
            textAlign: 'start'
          }}
        >
          {description}
        </Typography>
      )}
      {children}
    </Box>
  );
};

/** Compact pill toolbar grouping header icon buttons. */
export const DetailsToolbar = ({ children }: { children: ReactNode }) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        flexShrink: 0,
        p: 0.5,
        borderRadius: '12px',
        border: `1px solid ${alpha(theme.palette.primary.main, 0.16)}`,
        backgroundColor: theme.palette.background.paper,
        '& .MuiIconButton-root': {
          borderRadius: '10px',
          width: 36,
          height: 36
        },
        '& .MuiIconButton-root:hover': {
          backgroundColor: alpha(theme.palette.primary.main, 0.08)
        }
      }}
    >
      {children}
    </Box>
  );
};

export const DetailGrid = ({
  children,
  minColumnWidth = 210,
  sx
}: {
  children: ReactNode;
  minColumnWidth?: number;
  sx?: SxProps<Theme>;
}) => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: `repeat(auto-fill, minmax(min(100%, ${minColumnWidth}px), 1fr))`,
      columnGap: 3,
      rowGap: 2.25,
      minWidth: 0,
      ...((sx as object) ?? {})
    }}
  >
    {children}
  </Box>
);

export const isEmptyValue = (value: unknown) =>
  value === null ||
  value === undefined ||
  value === '' ||
  (Array.isArray(value) && value.length === 0);

export const EmptyValue = () => (
  <Box component="span" sx={{ color: 'text.disabled', fontWeight: 500 }}>
    —
  </Box>
);

export const DetailItem = ({
  label,
  value,
  children,
  fullWidth = false,
  sx
}: {
  label: ReactNode;
  value?: ReactNode;
  children?: ReactNode;
  fullWidth?: boolean;
  sx?: SxProps<Theme>;
}) => {
  const theme = useTheme();
  const content = children ?? value;
  return (
    <Box
      sx={{
        minWidth: 0,
        gridColumn: fullWidth ? '1 / -1' : undefined,
        textAlign: 'start',
        ...((sx as object) ?? {})
      }}
    >
      <Typography
        component="div"
        sx={{
          color: 'text.secondary',
          fontSize: theme.typography.pxToRem(12.5),
          fontWeight: 500,
          lineHeight: 1.4,
          mb: 0.5
        }}
      >
        {label}
      </Typography>
      <Box
        sx={{
          color: 'text.primary',
          fontSize: theme.typography.pxToRem(14),
          fontWeight: 600,
          lineHeight: 1.5,
          wordBreak: 'break-word',
          '& a': { fontWeight: 600 }
        }}
      >
        {isEmptyValue(content) || content === false ? <EmptyValue /> : content}
      </Box>
    </Box>
  );
};

/** Row inside a `SectionCard noPadding` list. */
export const DetailRow = ({
  children,
  sx,
  ...rest
}: BoxProps & { children: ReactNode }) => {
  const theme = useTheme();
  return (
    <Box
      {...rest}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: { xs: 2, sm: 2.5 },
        py: 1.5,
        minWidth: 0,
        '&:not(:last-of-type)': {
          borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`
        },
        ...(rest.onClick
          ? {
              cursor: 'pointer',
              transition: theme.transitions.create('background-color'),
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.05)
              }
            }
          : {}),
        ...((sx as object) ?? {})
      }}
    >
      {children}
    </Box>
  );
};

export const DetailThumb = ({
  src,
  alt = '',
  size = 72,
  height,
  onClick
}: {
  src: string;
  alt?: string;
  size?: number | string;
  height?: number | string;
  onClick?: () => void;
}) => {
  const theme = useTheme();
  return (
    <Box
      component="img"
      src={src}
      alt={alt}
      onClick={onClick}
      sx={{
        width: size,
        height: height ?? size,
        maxWidth: '100%',
        objectFit: 'cover',
        borderRadius: '12px',
        border: `1px solid ${alpha(theme.palette.primary.main, 0.18)}`,
        backgroundColor: theme.palette.background.default,
        cursor: onClick ? 'pointer' : 'default',
        display: 'block',
        transition: theme.transitions.create(['box-shadow', 'transform']),
        '&:hover': onClick
          ? {
              boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.2)}`
            }
          : undefined
      }}
    />
  );
};

/** Padding wrapper for empty-state / footer content inside a noPadding card. */
export const CardBody = ({
  children,
  sx
}: {
  children: ReactNode;
  sx?: SxProps<Theme>;
}) => (
  <Box sx={{ px: { xs: 2, sm: 2.5 }, py: 2, ...((sx as object) ?? {}) }}>
    {children}
  </Box>
);

export const MutedText = ({ children }: { children: ReactNode }) => (
  <Typography sx={{ color: 'text.secondary', fontSize: 14, textAlign: 'start' }}>
    {children}
  </Typography>
);

/** Primary + muted secondary text block for a DetailRow. */
export const DetailRowText = ({
  primary,
  secondary
}: {
  primary: ReactNode;
  secondary?: ReactNode;
}) => (
  <Box sx={{ flex: 1, minWidth: 0, textAlign: 'start' }}>
    <Typography
      component="div"
      sx={{
        fontWeight: 600,
        fontSize: 14,
        color: 'text.primary',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }}
    >
      {primary}
    </Typography>
    {secondary && (
      <Typography
        component="div"
        sx={{ color: 'text.secondary', fontSize: 12.5, mt: 0.25 }}
      >
        {secondary}
      </Typography>
    )}
  </Box>
);

/** Wrapped list of soft pill links (people, teams, vendors...). */
export const LinkPills = ({
  items
}: {
  items: { key: string | number; href: string; label: ReactNode }[];
}) => {
  const theme = useTheme();
  if (!items?.length) return <EmptyValue />;
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
      {items.map((item) => (
        <Box
          component="a"
          key={item.key}
          href={item.href}
          sx={{
            px: 1.25,
            py: 0.25,
            borderRadius: '20px',
            fontSize: 13,
            fontWeight: 600,
            textDecoration: 'none',
            color: theme.palette.primary.dark,
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
            transition: theme.transitions.create('background-color'),
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.16)
            }
          }}
        >
          {item.label}
        </Box>
      ))}
    </Box>
  );
};

/** Soft-tinted secondary action button style for card headers. */
export const softButtonSx = (theme: Theme) => ({
  borderRadius: '10px',
  fontWeight: 700,
  color: theme.palette.primary.dark,
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.16) }
});

/** Main CTA style (contained gold with shadow). */
export const primaryButtonSx = (theme: Theme) => ({
  borderRadius: '12px',
  fontWeight: 700,
  boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.28)}`
});

/** Tabs styled for details drawers/pages (underline tabs on a hairline). */
export const DetailsTabs = ({ sx, children, ...rest }: TabsProps) => {
  const theme = useTheme();
  return (
    <Tabs
      variant="scrollable"
      scrollButtons="auto"
      textColor="primary"
      indicatorColor="primary"
      {...rest}
      sx={{
        minHeight: 44,
        borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
        '& .MuiTab-root': { minHeight: 44, fontWeight: 600 },
        ...((sx as object) ?? {})
      }}
    >
      {children}
    </Tabs>
  );
};

/** Square tinted icon tile used at the start of list rows. */
export const IconTile = ({ children }: { children: ReactNode }) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        width: 36,
        height: 36,
        borderRadius: '10px',
        display: 'grid',
        placeItems: 'center',
        flexShrink: 0,
        color: theme.palette.primary.main,
        backgroundColor: alpha(theme.palette.primary.main, 0.1)
      }}
    >
      {children}
    </Box>
  );
};

/** Centered muted message inside a noPadding card. */
export const EmptyCardBody = ({ message }: { message: ReactNode }) => (
  <Box sx={{ px: { xs: 2, sm: 2.5 }, py: 3.5, textAlign: 'center' }}>
    <Typography sx={{ color: 'text.secondary', fontSize: 14 }}>
      {message}
    </Typography>
  </Box>
);

/** Centered spinner inside a card. */
export const CardLoading = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
    <CircularProgress size={28} />
  </Box>
);
