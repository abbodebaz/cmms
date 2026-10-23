import { Box, ButtonBase, Collapse, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import ExpandMoreTwoToneIcon from '@mui/icons-material/ExpandMoreTwoTone';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Shared brand card used by forms, detail pages and settings pages.
 * - title/description are i18n keys (passed through t()).
 * - collapsible + open + onToggle for accordion behaviour; otherwise a static card.
 * - actions: optional node rendered at the end of the header (buttons/badges).
 * - noPadding: render children edge-to-edge (tables, lists).
 */
const SectionCard = ({
  title,
  description,
  open = true,
  collapsible = false,
  onToggle,
  hasError = false,
  badge,
  actions,
  contentId,
  noPadding = false,
  icon,
  children
}: {
  title: string;
  description?: string;
  open?: boolean;
  collapsible?: boolean;
  onToggle?: () => void;
  hasError?: boolean;
  badge?: ReactNode;
  actions?: ReactNode;
  contentId?: string;
  noPadding?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}) => {
  const { t }: { t: any } = useTranslation();
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const borderColor = hasError
    ? theme.palette.error.main
    : alpha(primary, open ? 0.22 : 0.14);

  const headerContent = (
    <>
      <Box
        sx={{
          width: 4,
          alignSelf: 'stretch',
          minHeight: 28,
          borderRadius: 4,
          background: hasError
            ? theme.palette.error.main
            : `linear-gradient(180deg, ${alpha(primary, 0.95)} 0%, ${alpha(
                primary,
                0.45
              )} 100%)`,
          flexShrink: 0
        }}
      />
      {icon && (
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: '10px',
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
            color: primary,
            backgroundColor: alpha(primary, 0.1)
          }}
        >
          {icon}
        </Box>
      )}
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          component="span"
          sx={{
            display: 'block',
            fontWeight: 700,
            fontSize: theme.typography.pxToRem(15),
            letterSpacing: 0.1,
            color: hasError ? theme.palette.error.main : theme.palette.text.primary
          }}
        >
          {t(title, { nsSeparator: false })}
        </Typography>
        {description && (
          <Typography
            component="span"
            sx={{
              display: 'block',
              color: theme.palette.text.secondary,
              fontSize: theme.typography.pxToRem(12.5),
              mt: 0.25
            }}
          >
            {t(description, { nsSeparator: false })}
          </Typography>
        )}
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {badge}
        {actions}
        {collapsible && (
          <Box
            sx={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              display: 'grid',
              placeItems: 'center',
              backgroundColor: alpha(primary, open ? 0.14 : 0.07),
              transition: theme.transitions.create('background-color')
            }}
          >
            <ExpandMoreTwoToneIcon
              fontSize="small"
              sx={{
                color: primary,
                transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: theme.transitions.create('transform', {
                  duration: theme.transitions.duration.shorter
                })
              }}
            />
          </Box>
        )}
      </Box>
    </>
  );

  const headerSx = {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
    textAlign: 'start' as const,
    px: { xs: 2, sm: 2.5 },
    py: 1.75
  };

  return (
    <Box
      sx={{
        border: `1px solid ${borderColor}`,
        borderRadius: '14px',
        backgroundColor: theme.palette.background.paper,
        overflow: 'hidden',
        boxShadow: open
          ? `0 1px 2px ${alpha(theme.palette.common.black, 0.04)}, 0 6px 18px ${alpha(
              primary,
              0.06
            )}`
          : 'none',
        transition: theme.transitions.create(['border-color', 'box-shadow'])
      }}
    >
      {collapsible ? (
        <ButtonBase
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={contentId}
          aria-label={`${t(title, { nsSeparator: false })} - ${t('form_section_toggle')}`}
          sx={{
            ...headerSx,
            backgroundColor: open ? alpha(primary, 0.035) : 'transparent',
            transition: theme.transitions.create('background-color'),
            '&:hover': { backgroundColor: alpha(primary, 0.06) },
            '&.Mui-focusVisible': {
              outline: `2px solid ${alpha(primary, 0.5)}`,
              outlineOffset: -2
            }
          }}
        >
          {headerContent}
        </ButtonBase>
      ) : (
        <Box sx={{ ...headerSx, backgroundColor: alpha(primary, 0.035) }}>
          {headerContent}
        </Box>
      )}
      <Collapse in={open} timeout={250} id={contentId}>
        <Box
          sx={{
            px: noPadding ? 0 : { xs: 2, sm: 2.5 },
            pt: noPadding ? 0 : 2.5,
            pb: noPadding ? 0 : 2.5,
            borderTop: `1px solid ${alpha(primary, 0.1)}`
          }}
        >
          {children}
        </Box>
      </Collapse>
    </Box>
  );
};


export default SectionCard;
