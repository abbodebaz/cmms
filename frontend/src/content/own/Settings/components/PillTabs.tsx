import { Box, ButtonBase, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { ReactNode } from 'react';

/** Horizontally scrollable soft pill tabs (segmented control look). */
export default function PillTabs<V extends string>({
  tabs,
  value,
  onChange,
  ariaLabel
}: {
  tabs: { value: V; label: ReactNode; icon?: ReactNode }[];
  value: V;
  onChange: (value: V) => void;
  ariaLabel?: string;
}) {
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  return (
    <Box
      role="tablist"
      aria-label={ariaLabel}
      sx={{
        display: 'inline-flex',
        maxWidth: '100%',
        overflowX: 'auto',
        gap: 0.5,
        p: 0.5,
        borderRadius: '12px',
        backgroundColor: alpha(primary, 0.07),
        border: `1px solid ${alpha(primary, 0.12)}`,
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': { display: 'none' }
      }}
    >
      {tabs.map((tab) => {
        const selected = tab.value === value;
        return (
          <ButtonBase
            key={tab.value}
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(tab.value)}
            sx={{
              flexShrink: 0,
              gap: 0.75,
              px: 1.75,
              py: 0.9,
              borderRadius: '9px',
              fontSize: theme.typography.pxToRem(13.5),
              fontWeight: selected ? 700 : 500,
              whiteSpace: 'nowrap',
              color: selected ? theme.palette.primary.dark : theme.palette.text.secondary,
              backgroundColor: selected ? theme.palette.background.paper : 'transparent',
              boxShadow: selected
                ? `0 1px 2px ${alpha(theme.palette.common.black, 0.06)}, 0 4px 10px ${alpha(primary, 0.12)}`
                : 'none',
              transition: theme.transitions.create(['background-color', 'color', 'box-shadow']),
              '&:hover': {
                color: theme.palette.primary.dark,
                backgroundColor: selected ? theme.palette.background.paper : alpha(primary, 0.08)
              },
              '& .MuiSvgIcon-root': { fontSize: 18 }
            }}
          >
            {tab.icon}
            {tab.label}
          </ButtonBase>
        );
      })}
    </Box>
  );
}
