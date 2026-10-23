import SettingsSection from '../../components/SettingsSection';
import CustomFieldsManager from '../../../components/CustomFields/CustomFieldsManager';
import { CustomFieldEntityType } from '../../../../../models/owns/customField';

function ConfigureAssetFields() {
  return (
    <SettingsSection
      title="custom_fields"
      description="settings_custom_fields_description"
      noPadding
    >
      <CustomFieldsManager entityType={CustomFieldEntityType.ASSET} />
    </SettingsSection>
  );
}

export default ConfigureAssetFields;
