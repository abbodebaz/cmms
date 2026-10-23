import {
  Avatar,
  Box,
  ButtonBase,
  CircularProgress,
  Grid,
  Typography,
  useTheme
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import SwitchAccountTwoToneIcon from '@mui/icons-material/SwitchAccountTwoTone';
import ChevronRightTwoToneIcon from '@mui/icons-material/ChevronRightTwoTone';
import PageHeading from '../Settings/components/PageHeading';
import { Helmet } from 'react-helmet-async';

import { useTranslation } from 'react-i18next';
import { useContext, useEffect, useState } from 'react';
import { TitleContext } from '../../../contexts/TitleContext';
import { getUsersMini } from '../../../slices/user';
import useAuth from '../../../hooks/useAuth';
import { useDispatch, useSelector } from '../../../store';
import { CustomSnackBarContext } from '../../../contexts/CustomSnackBarContext';
import { useNavigate } from 'react-router-dom';
import PermissionErrorMessage from '../components/PermissionErrorMessage';


function SwitchAccount() {
  const { t }: { t: any } = useTranslation();
  const { setTitle } = useContext(TitleContext);
  const { user, company, downgrade, switchAccount } = useAuth();
  const dispatch = useDispatch();
  const { showSnackBar } = useContext(CustomSnackBarContext);
  const [switching, setSwitching] = useState<boolean>(false);
  const [selectedUserId, setSelectedUserId] = useState<number>(null);
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    setTitle(t('switch_account'));
  }, []);


  if (user.superAccountRelations.length)
    return (
      <>
        <Helmet>
          <title>{t('switch_account')}</title>
        </Helmet>
        <Box sx={{ px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 } }}>
          <PageHeading
            title={t('switch_account')}
            description={t('switch_account_description')}
            icon={<SwitchAccountTwoToneIcon />}
          />
          {user.ownsCompany && (
            <Grid container spacing={2}>
              {user.superAccountRelations.map((superAccountRelation) => {
                const isSwitching =
                  switching &&
                  superAccountRelation.childUserId === selectedUserId;
                return (
                  <Grid
                    item
                    key={superAccountRelation.childUserId}
                    xs={12}
                    sm={6}
                    md={4}
                    lg={3}
                  >
                    <ButtonBase
                      disabled={switching}
                      onClick={() => {
                        if (!switching) {
                          setSwitching(true);
                          setSelectedUserId(superAccountRelation.childUserId);
                          switchAccount(superAccountRelation.childUserId)
                            .then(() => navigate('/app/work-orders'))
                            .finally(() => setSwitching(false));
                        }
                      }}
                      sx={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        gap: 1.5,
                        p: 2,
                        textAlign: 'start',
                        borderRadius: '14px',
                        border: `1px solid ${alpha(
                          theme.palette.primary.main,
                          isSwitching ? 0.5 : 0.16
                        )}`,
                        backgroundColor: theme.palette.background.paper,
                        boxShadow: `0 6px 18px ${alpha(
                          theme.palette.primary.main,
                          0.05
                        )}`,
                        transition: theme.transitions.create([
                          'border-color',
                          'box-shadow',
                          'transform'
                        ]),
                        '&:hover': {
                          borderColor: alpha(theme.palette.primary.main, 0.4),
                          boxShadow: `0 10px 24px ${alpha(
                            theme.palette.primary.main,
                            0.12
                          )}`
                        },
                        '&.Mui-focusVisible': {
                          outline: `2px solid ${alpha(
                            theme.palette.primary.main,
                            0.5
                          )}`
                        }
                      }}
                    >
                      <Avatar
                        variant="rounded"
                        src={superAccountRelation.childCompanyLogo?.url}
                        alt={superAccountRelation.childCompanyName}
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: '12px',
                          color: theme.palette.primary.main,
                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                          fontWeight: 700
                        }}
                      >
                        {superAccountRelation.childCompanyName?.charAt(0)}
                      </Avatar>
                      <Typography
                        sx={{
                          flex: 1,
                          minWidth: 0,
                          fontWeight: 700,
                          fontSize: 14.5,
                          color: theme.palette.text.primary
                        }}
                        noWrap
                      >
                        {superAccountRelation.childCompanyName}
                      </Typography>
                      {isSwitching ? (
                        <CircularProgress size={20} />
                      ) : (
                        <ChevronRightTwoToneIcon
                          sx={{
                            color: theme.palette.primary.main,
                            transform:
                              theme.direction === 'rtl' ? 'scaleX(-1)' : 'none'
                          }}
                        />
                      )}
                    </ButtonBase>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Box>
      </>
    );
  else return <PermissionErrorMessage message={'no_access_page'} />;
}

export default SwitchAccount;
