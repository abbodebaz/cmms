import PersonAddAlt1TwoToneIcon from '@mui/icons-material/PersonAddAlt1TwoTone';
import UsersSelection from '../UsersSelection';
import { Helmet } from 'react-helmet-async';

import { useTranslation } from 'react-i18next';
import { useContext, useEffect, useState } from 'react';
import { TitleContext } from '../../../../contexts/TitleContext';
import { getDisabledUsersMini } from '../../../../slices/user';
import useAuth from '../../../../hooks/useAuth';
import { useDispatch, useSelector } from '../../../../store';
import { CustomSnackBarContext } from '../../../../contexts/CustomSnackBarContext';
import { useNavigate } from 'react-router-dom';
import PermissionErrorMessage from '../../components/PermissionErrorMessage';
import { useBrand } from '../../../../hooks/useBrand';


function Upgrade() {
  const { t }: { t: any } = useTranslation();
  const { setTitle } = useContext(TitleContext);
  const { user, company, upgrade } = useAuth();
  const brandConfig = useBrand();
  const dispatch = useDispatch();
  const { disabledUsersMini, usersMini } = useSelector((state) => state.users);
  const [selectedUsers, setSelectedUsers] = useState<{
    [key: number]: boolean;
  }>([]);
  const { showSnackBar } = useContext(CustomSnackBarContext);
  const [upgrading, setUpgrading] = useState<boolean>(false);
  const [maxUsers, setMaxUsers] = useState<number>(0);
  const navigate = useNavigate();

  useEffect(() => {
    setTitle(t('upgrade'));
    if (user.ownsCompany) dispatch(getDisabledUsersMini());
  }, []);

  useEffect(() => {
    setMaxUsers(company.subscription.usersCount - usersMini.length);
  }, [usersMini, disabledUsersMini]);

  const onUpgrade = () => {
    setUpgrading(true);
    let usersIds: number[] = [];
    Object.entries(selectedUsers).forEach(([key, value]) => {
      if (value) {
        usersIds.push(Number(key));
      }
    });
    if (usersIds.length > maxUsers) {
      showSnackBar(t('max_users_description', { maxUsers }), 'error');
      setUpgrading(false);
      return;
    }
    upgrade(usersIds)
      .then((success) => {
        if (success) navigate('/app/work-orders');
      })
      .finally(() => setUpgrading(false));
  };
  const onChange = (value: boolean, id: number) => {
    const newSelectedUsers = { ...selectedUsers };
    newSelectedUsers[id] = value;
    setSelectedUsers(newSelectedUsers);
  };
  if (company.subscription.upgradeNeeded && user.ownsCompany)
    return (
      <>
        <Helmet>
          <title>{t('upgrade')}</title>
        </Helmet>
        <UsersSelection
          icon={<PersonAddAlt1TwoToneIcon />}
          title={t('enable_users')}
          description={t('upgrade_description', {
            shortBrandName: brandConfig.shortName
          })}
          listTitle="users"
          hint={t('max_users_description', { maxUsers })}
          users={disabledUsersMini}
          selectedUsers={selectedUsers}
          onChange={onChange}
          submitting={upgrading}
          onSubmit={onUpgrade}
          submitLabel={t('enable_users')}
        />
      </>
    );
  else return <PermissionErrorMessage message={'no_access_page'} />;
}

export default Upgrade;
