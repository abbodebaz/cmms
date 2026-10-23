import { Stack } from '@mui/material';
import TuneTwoToneIcon from '@mui/icons-material/TuneTwoTone';
import DynamicFormTwoToneIcon from '@mui/icons-material/DynamicFormTwoTone';
import RuleTwoToneIcon from '@mui/icons-material/RuleTwoTone';
import {
  SettingsLinkRow,
  SettingsRowList,
  SettingsSwitchRow
} from '../../components/SettingsRows';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Formik } from 'formik';
import useAuth from '../../../../../hooks/useAuth';
import { GeneralPreferences } from '../../../../../models/owns/generalPreferences';
import SettingsSection from '../../components/SettingsSection';

function AssetSettings() {
  const { t }: { t: any } = useTranslation();
  const navigate = useNavigate();
  const { patchGeneralPreferences, companySettings } = useAuth();
  const { generalPreferences } = companySettings;

  const switches: {
    title: string;
    description: string;
    name: keyof GeneralPreferences;
  }[] = [
    {
      title: t('auto_generate_asset_barcode'),
      description: t('auto_generate_asset_barcode_description'),
      name: 'autoGenerateAssetBarcode'
    }
  ];

  const onSubmit = async (
    _values,
    { resetForm, setErrors, setStatus, setSubmitting }
  ) => {};

  return (
    <Formik
      initialValues={generalPreferences}
      validationSchema={undefined}
      onSubmit={onSubmit}
    >
      {({
        errors,
        handleBlur,
        handleChange,
        handleSubmit,
        isSubmitting,
        touched,
        values
      }) => (
        <form onSubmit={handleSubmit}>
          <Stack spacing={{ xs: 2, md: 2.5 }}>
            <SettingsSection
              title="preferences"
              description="settings_preferences_description"
              icon={<TuneTwoToneIcon fontSize="small" />}
              noPadding
            >
              <SettingsRowList>
                {switches.map((element) => (
                  <SettingsSwitchRow
                    key={element.name}
                    title={element.title}
                    description={element.description}
                    checked={values[element.name]}
                    name={element.name}
                    handleChange={(event) => {
                      handleChange(event);
                      patchGeneralPreferences({
                        [element.name]: event.target.checked
                      });
                    }}
                  />
                ))}
              </SettingsRowList>
            </SettingsSection>
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
                  onClick={() => navigate('/app/settings/features/asset/custom-fields')}
                />
              </SettingsRowList>
            </SettingsSection>
          </Stack>
        </form>
      )}
    </Formik>
  );
}

export default AssetSettings;
