import SettingsSection from '../../components/SettingsSection';
import { useTranslation } from 'react-i18next';
import CustomFieldsManager from '../../../components/CustomFields/CustomFieldsManager';
import { CustomFieldEntityType } from '../../../../../models/owns/customField';

function CustomFields() {
  const { t }: { t: any } = useTranslation();

  return (
    <SettingsSection
      title="custom_fields"
      description="settings_custom_fields_description"
      noPadding
    >
      <CustomFieldsManager entityType={CustomFieldEntityType.WORK_ORDER} />
    </SettingsSection>
  );
}

export default CustomFields;
