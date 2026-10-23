import SettingsSection from '../../components/SettingsSection';
import CustomFieldsManager from '../../../components/CustomFields/CustomFieldsManager';
import { CustomFieldEntityType } from '../../../../../models/owns/customField';

function VendorsCustomFields() {
  return (
    <SettingsSection
      title="custom_fields"
      description="settings_custom_fields_description"
      noPadding
    >
      <CustomFieldsManager entityType={CustomFieldEntityType.CUSTOMER} />
    </SettingsSection>
  );
}

export default VendorsCustomFields;
