import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import DynamicFormTwoToneIcon from '@mui/icons-material/DynamicFormTwoTone';
import SettingsSection from '../../components/SettingsSection';
import { SettingsLinkRow, SettingsRowList } from '../../components/SettingsRows';

function MetersSettings() {
  const { t }: { t: any } = useTranslation();
  const navigate = useNavigate();

  return (
    <SettingsSection
      title="customize_form"
      description="settings_customize_form_description"
      noPadding
    >
      <SettingsRowList>
        <SettingsLinkRow
          title={t('custom_fields')}
          description={t('settings_custom_fields_description')}
          icon={<DynamicFormTwoToneIcon fontSize="small" />}
          onClick={() =>
            navigate('/app/settings/features/meters/custom-fields')
          }
        />
      </SettingsRowList>
    </SettingsSection>
  );
}

export default MetersSettings;
