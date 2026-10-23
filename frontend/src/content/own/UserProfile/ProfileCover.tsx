import { ChangeEvent, FC, useContext, useState } from 'react';
import PropTypes from 'prop-types';
import type { OwnUser, UserResponseDTO } from 'src/models/user';
import {
  Avatar,
  Box,
  Card,
  CircularProgress,
  IconButton,
  styled,
  Typography,
  useTheme
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import UploadTwoToneIcon from '@mui/icons-material/UploadTwoTone';
import { CompanySettingsContext } from '../../../contexts/CompanySettingsContext';
import useAuth from '../../../hooks/useAuth';

const Input = styled('input')({
  display: 'none'
});

const AvatarWrapper = styled(Card)(
  ({ theme }) => `
    position: relative;
    overflow: visible;
    display: inline-block;
    border-radius: 18px;
    box-shadow: none;
    background: transparent;

    .MuiAvatar-root {
      width: ${theme.spacing(12)};
      height: ${theme.spacing(12)};
    }
`
);

const ButtonUploadWrapper = styled(Box)(
  ({ theme }) => `
    position: absolute;
    width: ${theme.spacing(4)};
    height: ${theme.spacing(4)};
    bottom: -${theme.spacing(1)};
    right: -${theme.spacing(1)};

    .MuiIconButton-root {
      border-radius: 100%;
      background: ${theme.colors.primary.main};
      color: ${theme.palette.primary.contrastText};
      box-shadow: 0 4px 12px ${alpha(theme.palette.primary.main, 0.35)};
      border: 2px solid ${theme.palette.background.paper};
      width: ${theme.spacing(4)};
      height: ${theme.spacing(4)};
      padding: 0;
  
      &:hover {
        background: ${theme.colors.primary.dark};
      }
    }
`
);

const CardCover = styled(Card)(
  ({ theme }) => `
    position: relative;

    .MuiCardMedia-root {
      height: ${theme.spacing(26)};
    }
`
);

const CardCoverAction = styled(Box)(
  ({ theme }) => `
    position: absolute;
    right: ${theme.spacing(2)};
    bottom: ${theme.spacing(2)};
`
);

interface ProfileCoverProps {
  user: UserResponseDTO;
}

const ProfileCover: FC<ProfileCoverProps> = ({ user }) => {
  const { t }: { t: any } = useTranslation();
  const [changingPicture, setChangingPicture] = useState<boolean>(false);
  const { uploadFiles } = useContext(CompanySettingsContext);
  const { patchUser } = useAuth();
  const theme = useTheme();
  const onChangePicture = (event: ChangeEvent<HTMLInputElement>) => {
    setChangingPicture(true);
    uploadFiles([], Array.from(event.target.files), true, true)
      .then((files) =>
        patchUser({ image: { id: files[0].id } } as Partial<OwnUser>)
      )
      .finally(() => setChangingPicture(false));
  };
  return (
    <Box
      sx={{
        height: '100%',
        borderRadius: '14px',
        overflow: 'hidden',
        border: `1px solid ${alpha(theme.palette.primary.main, 0.18)}`,
        backgroundColor: theme.palette.background.paper,
        boxShadow: `0 6px 18px ${alpha(theme.palette.primary.main, 0.06)}`
      }}
    >
      <Box
        sx={{
          height: 84,
          background: `linear-gradient(135deg, ${alpha(
            theme.palette.primary.light ?? theme.palette.primary.main,
            0.55
          )} 0%, ${alpha(theme.palette.primary.main, 0.9)} 100%)`
        }}
      />
      <Box sx={{ px: 2.5, pb: 2.5, mt: -6, textAlign: 'center' }}>
        <AvatarWrapper>
          <Avatar
            variant="rounded"
            src={user.image?.url}
            alt={user.firstName}
            sx={{
              borderRadius: '18px',
              border: `3px solid ${theme.palette.background.paper}`,
              backgroundColor: alpha(theme.palette.primary.main, 0.12),
              color: theme.palette.primary.main,
              fontSize: 32,
              fontWeight: 700
            }}
          >
            {user.firstName?.charAt(0)}
          </Avatar>
          <ButtonUploadWrapper>
            <Input
              accept="image/*"
              id="icon-button-file"
              onChange={onChangePicture}
              disabled={changingPicture}
              name="icon-button-file"
              type="file"
            />
            <label htmlFor="icon-button-file">
              <IconButton
                component="span"
                color="primary"
                aria-label={t('settings_change_picture')}
              >
                {changingPicture ? (
                  <CircularProgress
                    size="1rem"
                    sx={{ color: theme.palette.primary.contrastText }}
                  />
                ) : (
                  <UploadTwoToneIcon fontSize="small" />
                )}
              </IconButton>
            </label>
          </ButtonUploadWrapper>
        </AvatarWrapper>
        <Typography
          sx={{
            mt: 1.5,
            fontWeight: 700,
            fontSize: theme.typography.pxToRem(18),
            color: theme.palette.text.primary
          }}
        >
          {user.firstName} {user.lastName}
        </Typography>
        {user.jobTitle && (
          <Typography
            sx={{
              mt: 0.25,
              fontSize: theme.typography.pxToRem(13),
              color: theme.palette.text.secondary
            }}
          >
            {user.jobTitle}
          </Typography>
        )}
        {user.email && (
          <Typography
            sx={{
              mt: 1,
              display: 'inline-block',
              px: 1.25,
              py: 0.4,
              borderRadius: '20px',
              fontSize: theme.typography.pxToRem(12.5),
              fontWeight: 500,
              color: theme.palette.primary.dark,
              backgroundColor: alpha(theme.palette.primary.main, 0.08),
              direction: 'ltr',
              maxWidth: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {user.email}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

ProfileCover.propTypes = {
  // @ts-ignore
  user: PropTypes.object.isRequired
};

export default ProfileCover;
