import { Box, DialogTitle, IconButton, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import CloseTwoToneIcon from '@mui/icons-material/CloseTwoTone';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Consistent header for dialogs hosting a create/edit form:
 * title 18px/700, muted 13px subtitle, close button at the end.
 * `title` / `subtitle` are already-translated strings.
 */
const FormDialogTitle = ({
  title,
  subtitle,
  onClose
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  onClose?: () => void;
}) => {
  const { t }: { t: any } = useTranslation();
  const theme = useTheme();
  return (
    <DialogTitle
      component="div"
      sx={{
        px: { xs: 2, sm: 3 },
        py: 2.25,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1.5
      }}
    >
      <Box sx={{ minWidth: 0, flex: 1, textAlign: 'start' }}>
        <Typography
          component="h2"
          sx={{
            fontSize: theme.typography.pxToRem(18),
            fontWeight: 700,
            lineHeight: 1.35,
            color: theme.palette.text.primary
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography
            component="p"
            sx={{
              mt: 0.5,
              fontSize: theme.typography.pxToRem(13),
              fontWeight: 400,
              color: theme.palette.text.secondary
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
      {onClose && (
        <IconButton
          aria-label={t('close')}
          onClick={onClose}
          size="small"
          sx={{
            flexShrink: 0,
            mt: -0.25,
            borderRadius: '10px',
            color: theme.palette.text.secondary,
            '&:hover': {
              color: theme.palette.primary.dark,
              backgroundColor: alpha(theme.palette.primary.main, 0.1)
            }
          }}
        >
          <CloseTwoToneIcon fontSize="small" />
        </IconButton>
      )}
    </DialogTitle>
  );
};

export default FormDialogTitle;
