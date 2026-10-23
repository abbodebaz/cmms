import { ChangeEvent, FC, useContext, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardMedia,
  CircularProgress,
  styled
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import UploadTwoToneIcon from '@mui/icons-material/UploadTwoTone';
import { CompanySettingsContext } from '../../../contexts/CompanySettingsContext';
import useAuth from '../../../hooks/useAuth';
import { Company } from '../../../models/owns/company';

const Input = styled('input')({
  display: 'none'
});

const CardCover = styled(Card)(
  ({ theme }) => `
    position: relative;
    border-radius: 14px;
    border: 1px solid ${alpha(theme.palette.primary.main, 0.18)};
    box-shadow: 0 6px 18px ${alpha(theme.palette.primary.main, 0.06)};
    background: linear-gradient(135deg, ${alpha(
      theme.palette.primary.main,
      0.1
    )} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%);

    .MuiCardMedia-root {
      height: ${theme.spacing(22)};
      background-size: contain;
      background-position: center;
      margin: ${theme.spacing(2)};
    }

    ${theme.breakpoints.down('sm')} {
      .MuiCardMedia-root {
        height: ${theme.spacing(16)};
        margin-bottom: ${theme.spacing(8)};
      }
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

interface CompanyCoverProps {
  image: string;
}

const CompanyCover: FC<CompanyCoverProps> = ({ image }) => {
  const { t }: { t: any } = useTranslation();
  const [changingPicture, setChangingPicture] = useState<boolean>(false);
  const { uploadFiles } = useContext(CompanySettingsContext);
  const { patchCompany } = useAuth();
  const onChangePicture = (event: ChangeEvent<HTMLInputElement>) => {
    setChangingPicture(true);
    uploadFiles([], Array.from(event.target.files))
      .then((files) =>
        patchCompany({ logo: { id: files[0].id } } as Partial<Company>)
      )
      .finally(() => setChangingPicture(false));
  };
  return (
    <>
      <CardCover>
        <CardMedia image={image} />
        <CardCoverAction>
          <Input
            accept="image/*"
            id="change-cover"
            disabled={changingPicture}
            onChange={onChangePicture}
            multiple
            type="file"
          />
          <label htmlFor="change-cover">
            <Button
              startIcon={
                changingPicture ? (
                  <CircularProgress size="1rem" />
                ) : (
                  <UploadTwoToneIcon />
                )
              }
              variant="contained"
              size="small"
              disabled={changingPicture}
              component="span"
              sx={{
                borderRadius: '10px',
                fontWeight: 700,
                boxShadow: (theme) =>
                  `0 6px 16px ${alpha(theme.palette.primary.main, 0.28)}`
              }}
            >
              {t('change_cover')}
            </Button>
          </label>
        </CardCoverAction>
      </CardCover>
    </>
  );
};

export default CompanyCover;
