import {
  Avatar,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Stack,
  Typography,
  useTheme
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { ReactNode } from 'react';
import SectionCard from '../components/SectionCard';

/** Shared layout for the upgrade (enable users) / downgrade (disable users) pages. */
export default function UsersSelection({
  icon,
  title,
  description,
  hint,
  users,
  selectedUsers,
  onChange,
  showSelection = true,
  submitting,
  onSubmit,
  submitLabel,
  listTitle
}: {
  icon: ReactNode;
  title: string;
  description: string;
  hint: string;
  users: { id: number; firstName: string; lastName: string }[];
  selectedUsers: { [key: number]: boolean };
  onChange: (value: boolean, id: number) => void;
  showSelection?: boolean;
  submitting: boolean;
  onSubmit: () => void;
  submitLabel: string;
  listTitle: string;
}) {
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const selectedCount = Object.values(selectedUsers ?? {}).filter(Boolean).length;

  return (
    <Box
      sx={{
        minHeight: '100%',
        display: 'flex',
        justifyContent: 'center',
        px: { xs: 2, md: 3 },
        py: { xs: 3, md: 6 }
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 560 }}>
        <Box textAlign="center" sx={{ mb: 3 }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              mx: 'auto',
              mb: 2,
              borderRadius: '18px',
              display: 'grid',
              placeItems: 'center',
              color: primary,
              backgroundColor: alpha(primary, 0.1),
              border: `1px solid ${alpha(primary, 0.2)}`,
              '& .MuiSvgIcon-root': { fontSize: 32 }
            }}
          >
            {icon}
          </Box>
          <Typography
            component="h1"
            sx={{
              fontWeight: 700,
              fontSize: { xs: theme.typography.pxToRem(22), md: theme.typography.pxToRem(26) },
              color: theme.palette.text.primary
            }}
          >
            {title}
          </Typography>
          <Typography
            sx={{
              mt: 1,
              fontSize: theme.typography.pxToRem(14),
              color: theme.palette.text.secondary,
              lineHeight: 1.7
            }}
          >
            {description}
          </Typography>
        </Box>
        {showSelection && (
          <SectionCard
            title={listTitle}
            badge={
              <Box
                component="span"
                sx={{
                  px: 1.25,
                  py: 0.4,
                  borderRadius: '20px',
                  fontSize: 12,
                  fontWeight: 700,
                  color: theme.palette.primary.dark,
                  backgroundColor: alpha(primary, 0.1)
                }}
              >
                {selectedCount}
              </Box>
            }
            noPadding
          >
            <Typography
              sx={{
                px: { xs: 2, sm: 2.5 },
                py: 1.5,
                fontSize: theme.typography.pxToRem(13),
                fontWeight: 500,
                color: theme.palette.text.secondary,
                backgroundColor: alpha(primary, 0.03),
                borderBottom: `1px solid ${alpha(primary, 0.08)}`
              }}
            >
              {hint}
            </Typography>
            <Box
              sx={{
                maxHeight: 420,
                overflowY: 'auto',
                '& > *:not(:last-of-type)': {
                  borderBottom: `1px solid ${alpha(primary, 0.08)}`
                }
              }}
            >
              {users.map((user) => {
                const checked = !!selectedUsers[user.id];
                return (
                  <Stack
                    key={user.id}
                    component="label"
                    direction="row"
                    alignItems="center"
                    spacing={1.5}
                    sx={{
                      px: { xs: 2, sm: 2.5 },
                      py: 1,
                      cursor: 'pointer',
                      backgroundColor: checked ? alpha(primary, 0.05) : 'transparent',
                      transition: theme.transitions.create('background-color'),
                      '&:hover': { backgroundColor: alpha(primary, 0.06) }
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 34,
                        height: 34,
                        fontSize: 14,
                        fontWeight: 700,
                        color: primary,
                        backgroundColor: alpha(primary, 0.12)
                      }}
                    >
                      {user.firstName?.charAt(0)}
                    </Avatar>
                    <Typography sx={{ flex: 1, fontWeight: 600, fontSize: 14 }}>
                      {`${user.firstName} ${user.lastName}`}
                    </Typography>
                    <Checkbox
                      checked={checked}
                      onChange={(event) => {
                        onChange(event.target.checked, user.id);
                      }}
                    />
                  </Stack>
                );
              })}
            </Box>
            <Box
              sx={{
                p: { xs: 2, sm: 2.5 },
                borderTop: `1px solid ${alpha(primary, 0.1)}`
              }}
            >
              <Button
                fullWidth
                size="large"
                disabled={submitting}
                startIcon={submitting && <CircularProgress size={'1rem'} />}
                onClick={onSubmit}
                variant="contained"
                sx={{
                  borderRadius: '12px',
                  fontWeight: 700,
                  boxShadow: `0 6px 16px ${alpha(primary, 0.28)}`
                }}
              >
                {submitLabel}
              </Button>
            </Box>
          </SectionCard>
        )}
      </Box>
    </Box>
  );
}
