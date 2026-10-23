import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import { Link } from '@mui/material';
import { Helmet } from 'react-helmet-async';
import JWTRegister from '../RegisterJWT';
import { useTranslation } from 'react-i18next';
import AuthLayout, { AuthFooterLink } from '../../AuthLayout';

function RegisterCover() {
  const { t }: { t: any } = useTranslation();
  const [searchParams] = useSearchParams();

  return (
    <>
      <Helmet>
        <title>{t('register')}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <AuthLayout
        title={t('create_account')}
        subtitle={t('signup_description')}
        maxWidth={540}
        footer={
          <AuthFooterLink
            text={t('account_already')}
            link={
              <Link component={RouterLink} to="/account/login">
                {t('signin_here')}
              </Link>
            }
          />
        }
      >
        <JWTRegister
          email={searchParams.get('email')}
          role={Number(searchParams.get('role'))}
          subscriptionPlanId={searchParams.get('subscription-plan-id')}
        />
      </AuthLayout>
    </>
  );
}

export default RegisterCover;
