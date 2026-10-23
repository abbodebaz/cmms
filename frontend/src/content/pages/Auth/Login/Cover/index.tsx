import { Link as RouterLink } from 'react-router-dom';
import { Link } from '@mui/material';
import { Helmet } from 'react-helmet-async';
import JWTLogin from '../LoginJWT';

import { useTranslation } from 'react-i18next';
import { ldapEnabled } from '../../../../../config';
import AuthLayout, { AuthFooterLink } from '../../AuthLayout';

function LoginCover() {
  const { t }: { t: any } = useTranslation();

  return (
    <>
      <Helmet>
        <title>{t('Login')}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <AuthLayout
        title={t('login')}
        subtitle={t('login_description')}
        footer={
          !ldapEnabled && (
            <AuthFooterLink
              text={t('no_account_yet')}
              link={
                <Link component={RouterLink} to="/account/register">
                  {t('signup_here')}
                </Link>
              }
            />
          )
        }
      >
        <JWTLogin />
      </AuthLayout>
    </>
  );
}

export default LoginCover;
