import {
  Box,
  ButtonBase,
  Stack,
  Switch,
  Typography,
  useTheme
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Field } from 'formik';
import { ChangeEvent, ReactNode } from 'react';
import ChevronRightTwoToneIcon from '@mui/icons-material/ChevronRightTwoTone';

/** Vertical list container: rows separated by hairline dividers. Use inside a noPadding SettingsSection. */
export function SettingsRowList({ children }: { children: ReactNode }) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        '& > *:not(:last-of-type)': {
          borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`
        }
      }}
    >
      {children}
    </Box>
  );
}

/** Generic row: label + muted description at the start, control at the end. */
export function SettingsRow({
  title,
  description,
  control,
  icon,
  stackOnMobile = true
}: {
  title: ReactNode;
  description?: ReactNode;
  control?: ReactNode;
  icon?: ReactNode;
  stackOnMobile?: boolean;
}) {
  const theme = useTheme();
  return (
    <Stack
      direction={stackOnMobile ? { xs: 'column', sm: 'row' } : 'row'}
      alignItems={stackOnMobile ? { xs: 'stretch', sm: 'center' } : 'center'}
      justifyContent="space-between"
      spacing={{ xs: 1.25, sm: 2 }}
      sx={{ px: { xs: 2, sm: 2.5 }, py: 1.75 }}
    >
      <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ minWidth: 0, flex: 1 }}>
        {icon && (
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: '10px',
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
              color: theme.palette.primary.main,
              backgroundColor: alpha(theme.palette.primary.main, 0.1)
            }}
          >
            {icon}
          </Box>
        )}
        <Box sx={{ minWidth: 0, textAlign: 'start' }}>
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: theme.typography.pxToRem(14),
              color: theme.palette.text.primary
            }}
          >
            {title}
          </Typography>
          {description && (
            <Typography
              sx={{
                mt: 0.25,
                fontSize: theme.typography.pxToRem(12.5),
                color: theme.palette.text.secondary,
                lineHeight: 1.5
              }}
            >
              {description}
            </Typography>
          )}
        </Box>
      </Stack>
      {control && (
        <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
          {control}
        </Box>
      )}
    </Stack>
  );
}

/** Formik-bound switch row (keeps the `Field as={Switch}` behaviour of CustomSwitch). */
export function SettingsSwitchRow({
  title,
  description,
  name,
  checked,
  handleChange,
  disabled
}: {
  title: string;
  description?: string;
  name: string;
  checked: boolean;
  handleChange: (event: ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}) {
  return (
    <SettingsRow
      title={title}
      description={description}
      stackOnMobile={false}
      control={
        <Field
          as={Switch}
          name={name}
          checked={!!checked}
          disabled={disabled}
          onChange={handleChange}
          inputProps={{ 'aria-label': title }}
        />
      }
    />
  );
}

/** Navigation row with a direction-aware chevron. */
export function SettingsLinkRow({
  title,
  description,
  icon,
  onClick
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  onClick: () => void;
}) {
  const theme = useTheme();
  return (
    <ButtonBase
      onClick={onClick}
      sx={{
        width: '100%',
        display: 'block',
        textAlign: 'start',
        transition: theme.transitions.create('background-color'),
        '&:hover': {
          backgroundColor: alpha(theme.palette.primary.main, 0.05)
        },
        '&.Mui-focusVisible': {
          outline: `2px solid ${alpha(theme.palette.primary.main, 0.5)}`,
          outlineOffset: -2
        }
      }}
    >
      <SettingsRow
        title={title}
        description={description}
        icon={icon}
        stackOnMobile={false}
        control={
          <ChevronRightTwoToneIcon
            sx={{
              color: theme.palette.primary.main,
              transform: theme.direction === 'rtl' ? 'scaleX(-1)' : 'none'
            }}
          />
        }
      />
    </ButtonBase>
  );
}
