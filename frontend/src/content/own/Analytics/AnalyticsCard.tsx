import {
  Box,
  IconButton,
  Tooltip as TooltipMUI,
  Typography,
  useTheme
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import InfoTwoToneIcon from '@mui/icons-material/InfoTwoTone';
import { useTranslation } from 'react-i18next';
import { ReactNode } from 'react';

interface AnalyticsCardProps {
  children: ReactNode;
  title: string;
  description?: string;
  height?: number;
}

/**
 * Chart / KPI card for analytics pages. Same visual language as the shared
 * SectionCard (gold bar header, 14px radius, soft border + shadow). Kept as a
 * local component because `title` arrives already translated.
 * Wide fixed-size charts scroll horizontally inside the card on small screens.
 */
export default function AnalyticsCard({
  children,
  title,
  description,
  height
}: AnalyticsCardProps) {
  const { t }: { t: any } = useTranslation();
  const theme = useTheme();
  const primary = theme.palette.primary.main;

  return (
    <Box
      sx={{
        height: height ?? '100%',
        minHeight: height,
        display: 'flex',
        flexDirection: 'column',
        border: `1px solid ${alpha(primary, 0.18)}`,
        borderRadius: '14px',
        backgroundColor: theme.palette.background.paper,
        overflow: 'hidden',
        boxShadow: `0 1px 2px ${alpha(
          theme.palette.common.black,
          0.04
        )}, 0 6px 18px ${alpha(primary, 0.06)}`
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: { xs: 2, sm: 2.5 },
          py: 1.5,
          backgroundColor: alpha(primary, 0.035),
          borderBottom: `1px solid ${alpha(primary, 0.1)}`
        }}
      >
        <Box
          sx={{
            width: 4,
            alignSelf: 'stretch',
            minHeight: 22,
            borderRadius: 4,
            flexShrink: 0,
            background: `linear-gradient(180deg, ${alpha(
              primary,
              0.95
            )} 0%, ${alpha(primary, 0.45)} 100%)`
          }}
        />
        <Typography
          component="h2"
          sx={{
            flex: 1,
            minWidth: 0,
            fontWeight: 700,
            fontSize: theme.typography.pxToRem(15),
            color: theme.palette.text.primary,
            textAlign: 'start'
          }}
        >
          {title}
        </Typography>
        {description && (
          <TooltipMUI title={t(description)} arrow>
            <IconButton
              size="small"
              aria-label={t(description)}
              sx={{
                color: alpha(primary, 0.85),
                '&:hover': { backgroundColor: alpha(primary, 0.08) }
              }}
            >
              <InfoTwoToneIcon fontSize="small" />
            </IconButton>
          </TooltipMUI>
        )}
      </Box>
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 1.5, sm: 2 },
          overflowX: 'auto',
          '& .recharts-wrapper': { maxWidth: 'none' },
          '& .recharts-cartesian-grid line': {
            stroke: alpha(theme.palette.text.primary, 0.08)
          },
          '& .recharts-text': {
            fill: theme.palette.text.secondary,
            fontSize: 12
          },
          '& .recharts-default-tooltip': {
            borderRadius: '10px !important',
            border: `1px solid ${alpha(primary, 0.2)} !important`,
            backgroundColor: `${theme.palette.background.paper} !important`,
            boxShadow: `0 6px 18px ${alpha(primary, 0.12)}`
          },
          '& .recharts-legend-item-text': {
            color: `${theme.palette.text.secondary} !important`,
            fontSize: 13
          }
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
