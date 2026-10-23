import { Box, Button, Typography, useTheme } from '@mui/material';
import AddTwoToneIcon from '@mui/icons-material/AddTwoTone';

function EmptyIllustration({ size = 132 }: { size?: number }) {
  const theme = useTheme();
  const gold = theme.colors.primary.main;
  const goldLight = theme.colors.primary.light;
  const goldLighter = theme.colors.primary.lighter;
  const paper = theme.palette.background.paper;
  return (
    <svg
      width={size}
      height={size * 0.8}
      viewBox="0 0 160 128"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      {/* soft backdrop */}
      <ellipse cx="80" cy="66" rx="70" ry="54" fill={goldLighter} />
      <ellipse cx="80" cy="118" rx="52" ry="5" fill={gold} opacity="0.12" />
      {/* back box */}
      <rect
        x="92"
        y="62"
        width="40"
        height="40"
        rx="6"
        fill={paper}
        stroke={goldLight}
        strokeWidth="2"
      />
      <path d="M92 74h40" stroke={goldLight} strokeWidth="2" />
      <rect x="106" y="62" width="12" height="18" rx="2" fill={goldLighter} />
      {/* clipboard */}
      <rect
        x="38"
        y="22"
        width="62"
        height="84"
        rx="8"
        fill={paper}
        stroke={gold}
        strokeWidth="2.5"
      />
      <rect x="55" y="15" width="28" height="14" rx="4" fill={gold} />
      <circle cx="69" cy="22" r="2.5" fill={paper} />
      {/* checklist lines */}
      <rect
        x="49"
        y="44"
        width="9"
        height="9"
        rx="2.5"
        fill={goldLighter}
        stroke={goldLight}
        strokeWidth="1.5"
      />
      <path
        d="M51.2 48.6l2 2 3.4-4"
        stroke={gold}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="63"
        y="46"
        width="27"
        height="5"
        rx="2.5"
        fill={goldLight}
        opacity="0.55"
      />
      <rect
        x="49"
        y="62"
        width="9"
        height="9"
        rx="2.5"
        fill={goldLighter}
        stroke={goldLight}
        strokeWidth="1.5"
      />
      <rect
        x="63"
        y="64"
        width="22"
        height="5"
        rx="2.5"
        fill={goldLight}
        opacity="0.4"
      />
      <rect
        x="49"
        y="80"
        width="9"
        height="9"
        rx="2.5"
        fill={goldLighter}
        stroke={goldLight}
        strokeWidth="1.5"
      />
      <rect
        x="63"
        y="82"
        width="25"
        height="5"
        rx="2.5"
        fill={goldLight}
        opacity="0.3"
      />
      {/* sparkles */}
      <path
        d="M128 30v8M124 34h8"
        stroke={gold}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="26" cy="52" r="3" fill={goldLight} />
      <circle cx="140" cy="54" r="2" fill={gold} opacity="0.6" />
    </svg>
  );
}

export interface NoRowsMessageProps {
  message: string;
  action?: string;
  actionLabel?: string;
  onAction?: () => void;
  hideIllustration?: boolean;
}

export default function NoRowsMessage({
  message,
  action,
  actionLabel,
  onAction,
  hideIllustration
}: NoRowsMessageProps) {
  return (
    <Box
      sx={{
        py: 3,
        px: 3,
        mx: 'auto',
        maxWidth: 440,
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      {!hideIllustration && (
        <Box sx={{ mb: 2, lineHeight: 0 }}>
          <EmptyIllustration />
        </Box>
      )}
      <Typography
        variant="h4"
        sx={{ fontWeight: 700, lineHeight: 1.4, color: 'text.primary' }}
      >
        {message}
      </Typography>
      {action && (
        <Typography
          component="span"
          variant="subtitle2"
          sx={{ mt: 0.75, color: 'text.secondary', lineHeight: 1.6 }}
        >
          {action}
        </Typography>
      )}
      {actionLabel && onAction && (
        <Button
          variant="contained"
          startIcon={<AddTwoToneIcon />}
          onClick={(event) => {
            event.stopPropagation();
            onAction();
          }}
          sx={{ mt: 2.5, px: 2.5 }}
        >
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}
