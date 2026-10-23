import PersonRemoveTwoToneIcon from '@mui/icons-material/PersonRemoveTwoTone';
import UsersSelection from '../UsersSelection';
import { Helmet } from 'react-helmet-async';

import { useTranslation } from 'react-i18next';
import { useContext, useEffect, useState } from 'react';
import { TitleContext } from '../../../../contexts/TitleContext';
import { getUsersMini } from '../../../../slices/user';
import useAuth from '../../../../hooks/useAuth';
import { useDispatch, useSelector } from '../../../../store';
import { CustomSnackBarContext } from '../../../../contexts/CustomSnackBarContext';
import { useNavigate } from 'react-router-dom';
import PermissionErrorMessage from '../../components/PermissionErrorMessage';


function Downgrade() {
  const { t }: { t: any } = useTranslation();
  const { setTitle } = useContext(TitleContext);
  const { user, company, downgrade } = useAuth();
  const dispatch = useDispatch();
  const { usersMini } = useSelector((state) => state.users);
  const [selectedUsers, setSelectedUsers] = useState<{
    [key: number]: boolean;
  }>([]);
  const { showSnackBar } = useContext(CustomSnackBarContext);
  const [downgrading, setDowngrading] = useState<boolean>(false);
  const [minUsers, setMinUsers] = useState<number>(0);
  const navigate = useNavigate();

  useEffect(() => {
    setTitle(t('downgrade'));
    if (user.ownsCompany) dispatch(getUsersMini());
  }, []);

  useEffect(() => {
    setMinUsers(usersMini.length - company.subscription.usersCount);
  }, [usersMini]);

  const onDowngrade = () => {
    setDowngrading(true);
    let usersIds: number[] = [];
    Object.entries(selectedUsers).forEach(([key, value]) => {
      if (value) {
        usersIds.push(Number(key));
      }
    });
    if (usersIds.length < minUsers) {
      showSnackBar(t('min_users_description', { minUsers }), 'error');
      setDowngrading(false);
      return;
    }
    downgrade(usersIds)
      .then((success) => {
        if (success) navigate('/app/work-orders');
      })
      .finally(() => setDowngrading(false));
  };
  const onChange = (value: boolean, id: number) => {
    const newSelectedUsers = { ...selectedUsers };
    newSelectedUsers[id] = value;
    setSelectedUsers(newSelectedUsers);
  };
  if (company.subscription.downgradeNeeded)
    return (
      <>
        <Helmet>
          <title>{t('downgrade')}</title>
        </Helmet>
        <UsersSelection
          icon={<PersonRemoveTwoToneIcon />}
          title={t('disable_users')}
          description={t(
            user.ownsCompany
              ? 'downgrade_description'
              : 'downgrade_description_no_owner'
          )}
          listTitle="users"
          hint={t('min_users_description', { minUsers })}
          users={usersMini.filter((userMini) => userMini.id !== user.id)}
          selectedUsers={selectedUsers}
          onChange={onChange}
          showSelection={user.ownsCompany}
          submitting={downgrading}
          onSubmit={onDowngrade}
          submitLabel={t('disable_users')}
        />
      </>
    );
  else return <PermissionErrorMessage message={'no_access_page'} />;
}

export default Downgrade;
