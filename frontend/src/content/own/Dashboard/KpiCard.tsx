import { ReactNode } from 'react';
import { Box, ButtonBase, Skeleton, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded';
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';

export type KpiTone = 'primary' | 'error' | 'warning' | 'success' | 'info';

interface KpiCardProps {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  caption?: ReactNode;
  tone?: KpiTone;
  /** Colors the value with the tone (e.g. red overdue count) */
  emphasize?: boolean;
  loading?: boolean;
  onClick?: () => void;
}

export default function KpiCard({
  label,
  value,
  icon,
  caption,
  tone = 'primary',
  emphasize,
  loading,
  onClick
}: KpiCardProps) {
  const theme = useTheme();
  const toneColor = theme.colors[tone].main;
  const clickable = !!onClick && !loading;

  return (
    <ButtonBase
      component="div"
      onClick={clickable ? onClick : undefined}
      disabled={!clickable}
      focusRipple
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        textAlign: 'start',
        width: '100%',
        height: '100%',
        minHeight: 148,
        p: 2.5,
        overflow: 'hidden',
        borderRadius: theme.general.borderRadiusLg,
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.colors.alpha.black[10]}`,
        boxShadow: '0 1px 2px rgba(42, 38, 32, 0.04)',
        transition: theme.transitions.create(
          ['box-shadow', 'border-color', 'transform'],
          { duration: theme.transitions.duration.shorter }
        ),
        '&::before': {
          content: '""',
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          background:
            tone === 'primary' ? theme.colors.gradients.blue1 : toneColor,
          opacity: 0.9
        },
        '& .kpi-arrow': {
          opacity: 0,
          transition: theme.transitions.create('opacity')
        },
        ...(clickable && {
          cursor: 'pointer',
          '&:hover, &.Mui-focusVisible': {
            borderColor: alpha(theme.colors.primary.main, 0.45),
            boxShadow: `0 8px 24px ${alpha(theme.colors.primary.main, 0.14)}`,
            transform: 'translateY(-2px)',
            '& .kpi-arrow': { opacity: 1 }
          }
        }),
        '&.Mui-disabled': { pointerEvents: 'auto' }
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 1.5
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            color: theme.palette.text.secondary,
            fontWeight: 600,
            lineHeight: 1.4,
            pt: 0.5
          }}
        >
          {label}
        </Typography>
        <Box
          sx={{
            flexShrink: 0,
            width: 44,
            height: 44,
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            color: toneColor,
            backgroundColor: alpha(toneColor, 0.12),
            boxShadow: `inset 0 0 0 1px ${alpha(toneColor, 0.18)}`,
            '& svg': { fontSize: 22 }
          }}
        >
          {icon}
        </Box>
      </Box>
      <Box sx={{ mt: 'auto', pt: 1.5 }}>
        {loading ? (
          <>
            <Skeleton variant="text" width={72} height={44} />
            <Skeleton variant="text" width="60%" height={18} />
          </>
        ) : (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography
                component="div"
                sx={{
                  fontSize: theme.typography.pxToRem(32),
                  fontWeight: 700,
                  lineHeight: 1.15,
                  letterSpacing: '-0.02em',
                  fontFeatureSettings: '"tnum"',
                  color: emphasize ? toneColor : theme.palette.text.primary
                }}
              >
                {value}
              </Typography>
              {clickable && (
                <Box
                  className="kpi-arrow"
                  sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}
                >
                  {theme.direction === 'rtl' ? (
                    <ArrowBackIosNewRoundedIcon
                      sx={{ fontSize: 14, color: theme.colors.primary.main }}
                    />
                  ) : (
                    <ArrowForwardIosRoundedIcon
                      sx={{ fontSize: 14, color: theme.colors.primary.main }}
                    />
                  )}
                </Box>
              )}
            </Box>
            {caption && (
              <Typography
                variant="caption"
                component="div"
                sx={{
                  mt: 0.5,
                  color: theme.palette.text.secondary,
                  minHeight: 18
                }}
              >
                {caption}
              </Typography>
            )}
          </>
        )}
      </Box>
    </ButtonBase>
  );
}
