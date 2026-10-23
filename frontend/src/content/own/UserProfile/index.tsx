import { useContext, useEffect } from 'react';

import { Helmet } from 'react-helmet-async';

import { Box, Button, Grid } from '@mui/material';
import AccountCircleTwoToneIcon from '@mui/icons-material/AccountCircleTwoTone';
import PersonOffTwoToneIcon from '@mui/icons-material/PersonOffTwoTone';
import PageHeading from '../Settings/components/PageHeading';
import SectionCard from '../components/SectionCard';
import { SettingsRow } from '../Settings/components/SettingsRows';
import { useTranslation } from 'react-i18next';
import ProfileCover from './ProfileCover';
import RecentActivity from './RecentActivity';
import ProfileDetails from './ProfileDetails';
import { TitleContext } from '../../../contexts/TitleContext';
import useAuth from '../../../hooks/useAuth';
import api from '../../../utils/api';
import { useNavigate } from 'react-router-dom';
import { CustomSnackBarContext } from '../../../contexts/CustomSnackBarContext';

function UserProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { showSnackBar } = useContext(CustomSnackBarContext);
  const { t } = useTranslation();
  const { setTitle } = useContext(TitleContext);
  useEffect(() => {
    setTitle(t('profile'));
  }, []);

  if (!user) {
    return null;
  }

  const onDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account?')) {
      const { success } = await api.post<{ success: boolean }>(
        `auth/delete-account-request`,
        {}
      );
      if (success) {
        showSnackBar(t('delete_account_email_confirmation'), 'warning');
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>{user.firstName} - Profile Details</title>
      </Helmet>
      <Box sx={{ px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 } }}>
        <PageHeading
          title={t('profile')}
          description={t('personal_details_description')}
          icon={<AccountCircleTwoToneIcon />}
        />
        <Grid container alignItems="stretch" spacing={{ xs: 2, md: 2.5 }}>
          <Grid item xs={12} md={4}>
            <ProfileCover user={user} />
          </Grid>
          <Grid item xs={12} md={8}>
            <RecentActivity />
          </Grid>
          <Grid item xs={12}>
            <ProfileDetails />
          </Grid>
          <Grid item xs={12}>
            <SectionCard
              title="settings_danger_zone"
              icon={<PersonOffTwoToneIcon fontSize="small" />}
              noPadding
            >
              <SettingsRow
                title={t('delete_account')}
                description={t('settings_delete_account_description')}
                control={
                  <Button
                    onClick={onDeleteAccount}
                    variant="outlined"
                    color="error"
                    sx={{ borderRadius: '10px', fontWeight: 700, whiteSpace: 'nowrap' }}
                  >
                    {t('delete_account')}
                  </Button>
                }
              />
            </SectionCard>
          </Grid>
          {/*<Grid item xs={12} md={12}>*/}
          {/*  <MyCards />*/}
          {/*</Grid>*/}
        </Grid>
      </Box>
    </>
  );
}

export default UserProfile;
