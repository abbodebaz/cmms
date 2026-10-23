import { Link as RouterLink } from 'react-router-dom';
import { Avatar, Box, Link, Typography } from '@mui/material';
import { Helmet } from 'react-helmet-async';
import MarkEmailReadTwoToneIcon from '@mui/icons-material/MarkEmailReadTwoTone';

import { useTranslation } from 'react-i18next';
import AuthLayout, { AuthFooterLink } from '../AuthLayout';

function VerifyEmail() {
  const { t }: { t: any } = useTranslation();
  return (
    <>
      <Helmet>
        <title>{t('verify_email_title')}</title>
      </Helmet>
      <AuthLayout
        title={t('verify_email_title')}
        footer={
          <AuthFooterLink
            text={t('want_to_sign_in_again')}
            link={
              <Link component={RouterLink} to="/account/login">
                {t('click_here')}
              </Link>
            }
          />
        }
      >
        <Box
          sx={(theme) => ({
            display: 'flex',
            alignItems: 'flex-start',
            gap: 2,
            p: 2.5,
            borderRadius: '12px',
            border: `1px solid ${theme.colors.primary.lighter}`,
            background: theme.colors.primary.lighter
          })}
        >
          <Avatar
            sx={(theme) => ({
              bgcolor: theme.colors.primary.main,
              color: '#ffffff',
              width: 44,
              height: 44
            })}
          >
            <MarkEmailReadTwoToneIcon />
          </Avatar>
          <Typography sx={{ fontSize: 15, lineHeight: 1.7 }}>
            {t('verify_email_description')}
          </Typography>
        </Box>
      </AuthLayout>
    </>
  );
}

export default VerifyEmail;
