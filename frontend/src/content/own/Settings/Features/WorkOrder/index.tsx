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

function WorkOrderSettings() {
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
      title: t('auto_assign_wo'),
      description: t('auto_assign_wo_description'),
      name: 'autoAssignWorkOrders'
    },
    {
      title: t('disable_closed_wo_notification'),
      description: t('disable_closed_wo_notification_description'),
      name: 'disableClosedWorkOrdersNotif'
    },
    {
      title: t('ask_feedback_wo_closed'),
      description: t('ask_feedback_wo_closed_description'),
      name: 'askFeedBackOnWOClosed'
    },
    {
      title: t('include_labor_in_total_cost'),
      description: t('include_labor_in_total_cost_description'),
      name: 'laborCostInTotalCost'
    },
    {
      title: t('simplify_wo'),
      description: t('simplify_wo_description'),
      name: 'simplifiedWorkOrder'
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
              title="customize_work_order_form"
              description="settings_customize_form_description"
              noPadding
            >
              <SettingsRowList>
                <SettingsLinkRow
                  title={t('custom_fields')}
                  description={t('settings_custom_fields_description')}
                  icon={<DynamicFormTwoToneIcon fontSize="small" />}
                  onClick={() => navigate('/app/settings/features/work-order/custom-fields')}
                />
                <SettingsLinkRow
                  title={t('configure_fields')}
                  description={t('settings_configure_fields_description')}
                  icon={<RuleTwoToneIcon fontSize="small" />}
                  onClick={() => navigate('/app/settings/features/work-order/configure-fields')}
                />
              </SettingsRowList>
            </SettingsSection>
          </Stack>
        </form>
      )}
    </Formik>
  );
}

export default WorkOrderSettings;
