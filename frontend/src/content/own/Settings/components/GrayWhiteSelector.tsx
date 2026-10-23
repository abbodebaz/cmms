import {
  Box,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useTheme
} from '@mui/material';
import { alpha } from '@mui/material/styles';

type FieldType<Type> = { label: string; name: string; type?: Type };

/**
 * Field configuration table: one clean row per field (label at the start,
 * segmented Optional / Required / Hidden control at the end).
 * Name kept for backwards compatibility.
 */
export default function GrayWhiteSelector<Value extends string, Type>({
  fields,
  options,
  onFieldChange,
  getValue
}: {
  fields: FieldType<Type>[];
  options: { label: string; value: Value }[];
  onFieldChange?: (fieldName: string, value: Value, type?: Type) => void;
  getValue: (field: FieldType<Type>) => Value;
}) {
  const theme = useTheme();
  const primary = theme.palette.primary.main;

  return (
    <Box
      sx={{
        width: '100%',
        '& > *:not(:last-of-type)': {
          borderBottom: `1px solid ${alpha(primary, 0.08)}`
        }
      }}
    >
      {fields.map((field) => (
        <Stack
          key={field.name}
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          justifyContent="space-between"
          spacing={{ xs: 1, sm: 2 }}
          sx={{
            px: { xs: 2, sm: 2.5 },
            py: 1.5,
            transition: theme.transitions.create('background-color'),
            '&:hover': { backgroundColor: alpha(primary, 0.03) }
          }}
        >
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: theme.typography.pxToRem(14),
              color: theme.palette.text.primary,
              textAlign: 'start'
            }}
          >
            {field.label}
          </Typography>
          <ToggleButtonGroup
            exclusive
            size="small"
            value={getValue(field)}
            aria-label={field.label}
            onChange={(_event, value: Value | null) => {
              if (value !== null && value !== getValue(field))
                onFieldChange?.(field.name, value, field.type);
            }}
            sx={{
              flexShrink: 0,
              p: 0.375,
              gap: 0.375,
              borderRadius: '11px',
              backgroundColor: alpha(primary, 0.06),
              border: `1px solid ${alpha(primary, 0.12)}`,
              '& .MuiToggleButtonGroup-grouped': {
                flex: { xs: 1, sm: 'initial' },
                border: 0,
                m: 0,
                borderRadius: '8px !important',
                px: 1.75,
                py: 0.5,
                fontSize: theme.typography.pxToRem(13),
                fontWeight: 500,
                textTransform: 'none',
                color: theme.palette.text.secondary,
                '&:hover': { backgroundColor: alpha(primary, 0.08) },
                '&.Mui-selected': {
                  fontWeight: 700,
                  color: theme.palette.primary.dark,
                  backgroundColor: theme.palette.background.paper,
                  boxShadow: `0 1px 2px ${alpha(
                    theme.palette.common.black,
                    0.06
                  )}, 0 3px 8px ${alpha(primary, 0.14)}`,
                  '&:hover': { backgroundColor: theme.palette.background.paper }
                }
              }
            }}
          >
            {options.map((option) => (
              <ToggleButton key={option.value} value={option.value}>
                {option.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Stack>
      ))}
    </Box>
  );
}
