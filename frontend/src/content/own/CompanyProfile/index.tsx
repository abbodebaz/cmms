import { useContext, useEffect } from 'react';

import { Helmet } from 'react-helmet-async';

import { Box, Stack } from '@mui/material';
import BusinessTwoToneIcon from '@mui/icons-material/BusinessTwoTone';
import PageHeading from '../Settings/components/PageHeading';
import CompanyCover from './CompanyCover';
import CompanyDetails from './CompanyDetails';
import CompanyPlan from './CompanyPlan';
import { TitleContext } from '../../../contexts/TitleContext';
import { useTranslation } from 'react-i18next';
import useAuth from '../../../hooks/useAuth';
import { isCloudVersion } from '../../../config';

function CompanyProfile() {
  const { t }: { t: any } = useTranslation();
  const { company, user } = useAuth();
  const { setTitle } = useContext(TitleContext);

  useEffect(() => {
    setTitle(t('company'));
  }, []);
  if (!company) {
    return null;
  }
  return (
    <>
      <Helmet>
        <title>{company.name} - Company Details</title>
      </Helmet>
      <Box sx={{ px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 } }}>
        <PageHeading
          title={company.name || t('company')}
          description={t('company_details_description')}
          icon={<BusinessTwoToneIcon />}
        />
        <Stack spacing={{ xs: 2, md: 2.5 }}>
          <CompanyCover image={company.logo?.url} />
          <CompanyDetails company={company} />
          {user.ownsCompany && (
            <CompanyPlan plan={company.subscription.subscriptionPlan} />
          )}
        </Stack>
      </Box>
    </>
  );
}

export default CompanyProfile;
