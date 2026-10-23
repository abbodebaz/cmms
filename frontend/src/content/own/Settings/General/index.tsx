import {
  Button,
  debounce,
  MenuItem,
  Select,
  Stack,
  TextField,
  InputAdornment,
  Switch
} from '@mui/material';
import LanguageTwoToneIcon from '@mui/icons-material/LanguageTwoTone';
import NotificationsActiveTwoToneIcon from '@mui/icons-material/NotificationsActiveTwoTone';
import PaletteTwoToneIcon from '@mui/icons-material/PaletteTwoTone';
import DeleteSweepTwoToneIcon from '@mui/icons-material/DeleteSweepTwoTone';
import SettingsSection from '../components/SettingsSection';
import { SettingsRow, SettingsRowList } from '../components/SettingsRows';
import useHijriPreference from '../../../../hooks/useHijriPreference';
import { formatHijri } from '../../../../utils/locale';
import { useTranslation } from 'react-i18next';
import { Field, Formik } from 'formik';
import * as Yup from 'yup';
import useAuth from '../../../../hooks/useAuth';
import internationalization, {
  loadLanguage,
  supportedLanguages
} from '../../../../i18n/i18n';
import { useDispatch, useSelector } from '../../../../store';
import { getCurrencies } from '../../../../slices/currency';
import { useContext, useEffect, useMemo, useState } from 'react';
import { GeneralPreferences } from '../../../../models/owns/generalPreferences';
import { CustomSnackBarContext } from '../../../../contexts/CustomSnackBarContext';
import ConfirmDialog from '../../components/ConfirmDialog';
import api from '../../../../utils/api';

function GeneralSettings() {
  const { t }: { t: any } = useTranslation();
  const [openDeleteDemo, setOpenDeleteDemo] = useState<boolean>(false);
  const switchLanguage = async ({ lng }: { lng: any }) => {
    await loadLanguage(lng);
    internationalization.changeLanguage(lng);
  };
  const { showSnackBar } = useContext(CustomSnackBarContext);
  const { patchGeneralPreferences, companySettings, hasFeature } = useAuth();
  const { generalPreferences } = companySettings;
  const dispatch = useDispatch();
  const { currencies } = useSelector((state) => state.currencies);
  const [showHijri, setShowHijri] = useHijriPreference();

  useEffect(() => {
    dispatch(getCurrencies());
  }, []);

  const onDaysBeforePMNotifChange = (event) =>
    patchGeneralPreferences({
      daysBeforePrevMaintNotification: Number(event.target.value)
    }).then(() => showSnackBar(t('changes_saved_success'), 'success'));
  const debouncedPMNotifChange = useMemo(
    () => debounce(onDaysBeforePMNotifChange, 1300),
    []
  );
  const onCsvSeparatorChange = (event) =>
    patchGeneralPreferences({
      csvSeparator: event.target.value
    }).then(() => showSnackBar(t('changes_saved_success'), 'success'));
  const debouncedCsvSeparatorChange = useMemo(
    () => debounce(onCsvSeparatorChange, 1300),
    []
  );
  const onBrandColorChange = (event) =>
    patchGeneralPreferences({
      color: event.target.value
    }).then(() => showSnackBar(t('changes_saved_success'), 'success'));
  const debouncedBrandColorChange = useMemo(
    () => debounce(onBrandColorChange, 1300),
    []
  );
  const onDeleteDemoData = async () => {
    const { success, message } = await api.deletes<{
      success: boolean;
      message: string;
    }>('demo/demo-data');
    if (success) {
      showSnackBar('Demo data deleted successfully', 'success');
      setOpenDeleteDemo(false);
    }
  };
  const onSubmit = async (
    _values,
    { resetForm, setErrors, setStatus, setSubmitting }
  ) => {};

  const timezones = useMemo(() => {
    const supported = (Intl as any).supportedValuesOf('timeZone');
    const current = generalPreferences.timeZone;
    return current && !supported.includes(current)
      ? [current, ...supported]
      : supported;
  }, [generalPreferences.timeZone]);
  const selectSx = { minWidth: { xs: '100%', sm: 240 }, maxWidth: { sm: 320 } };
  return (
    <Formik
      initialValues={generalPreferences}
      validationSchema={Yup.object().shape({
        language: Yup.string(),
        dateFormat: Yup.string(),
        timeZone: Yup.string(),
        currency: Yup.string(),
        businessType: Yup.string()
      })}
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
              title="settings_localization"
              description="settings_localization_description"
              icon={<LanguageTwoToneIcon fontSize="small" />}
              noPadding
            >
              <SettingsRowList>
                <SettingsRow
                  title={t('language')}
                  description={t('settings_language_description')}
                  control={
                    <Field
                      onChange={(event) => {
                        patchGeneralPreferences({
                          language: event.target.value
                        });
                        switchLanguage({
                          lng: event.target.value.toLowerCase()
                        });
                      }}
                      value={generalPreferences.language}
                      as={Select}
                      size="small"
                      sx={selectSx}
                      name="language"
                    >
                      {supportedLanguages.map((language) => (
                        <MenuItem
                          key={language.code}
                          value={language.code.toUpperCase()}
                        >
                          {language.label}
                        </MenuItem>
                      ))}
                    </Field>
                  }
                />
                <SettingsRow
                  title={t('date_format')}
                  description={t('settings_date_format_description')}
                  control={
                    <Field
                      onChange={(event) =>
                        patchGeneralPreferences({
                          dateFormat: event.target.value
                        })
                      }
                      value={generalPreferences.dateFormat}
                      as={Select}
                      size="small"
                      sx={selectSx}
                      name="dateFormat"
                    >
                      <MenuItem value="DDMMYY">DD/MM/YYYY</MenuItem>
                      <MenuItem value="MMDDYY">MM/DD/YYYY</MenuItem>
                    </Field>
                  }
                />
                <SettingsRow
                  title={t('show_hijri_dates')}
                  description={t('show_hijri_dates_description', {
                    example: formatHijri(new Date())
                  })}
                  stackOnMobile={false}
                  control={
                    <Switch
                      checked={showHijri}
                      onChange={(event) => setShowHijri(event.target.checked)}
                      inputProps={{ 'aria-label': t('show_hijri_dates') }}
                    />
                  }
                />
                <SettingsRow
                  title={t('time_zone')}
                  description={t('settings_time_zone_description')}
                  control={
                    <Field
                      onChange={(event) =>
                        patchGeneralPreferences({
                          timeZone: event.target.value
                        })
                      }
                      value={generalPreferences.timeZone}
                      as={Select}
                      size="small"
                      sx={selectSx}
                      MenuProps={{ PaperProps: { sx: { maxHeight: 360 } } }}
                      name="timeZone"
                    >
                      {timezones.map((timezone) => (
                        <MenuItem key={timezone} value={timezone}>
                          {timezone}
                        </MenuItem>
                      ))}
                    </Field>
                  }
                />
                <SettingsRow
                  title={t('currency')}
                  description={t('settings_currency_description')}
                  control={
                    <Field
                      onChange={(event) =>
                        patchGeneralPreferences({
                          currency: currencies.find(
                            (currency) =>
                              currency.id === Number(event.target.value)
                          )
                        })
                      }
                      value={generalPreferences.currency?.id}
                      as={Select}
                      size="small"
                      sx={selectSx}
                      MenuProps={{ PaperProps: { sx: { maxHeight: 360 } } }}
                      name="currency"
                    >
                      {[...currencies]
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((currency) => (
                          <MenuItem
                            key={currency.id}
                            value={currency.id}
                          >{`${currency.name} - ${currency.code}`}</MenuItem>
                        ))}
                    </Field>
                  }
                />
              </SettingsRowList>
            </SettingsSection>

            <SettingsSection
              title="settings_operations"
              description="settings_operations_description"
              icon={<NotificationsActiveTwoToneIcon fontSize="small" />}
              noPadding
            >
              <SettingsRowList>
                <SettingsRow
                  title={t('days_before_pm_notification')}
                  description={t('settings_pm_notification_description')}
                  control={
                    <TextField
                      onChange={debouncedPMNotifChange}
                      type={'number'}
                      size="small"
                      defaultValue={
                        generalPreferences.daysBeforePrevMaintNotification
                      }
                      name="daysBeforePrevMaintNotification"
                      sx={{ width: { xs: '100%', sm: 160 } }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            {t('day')}
                          </InputAdornment>
                        )
                      }}
                    />
                  }
                />
                <SettingsRow
                  title={t('csv_separator')}
                  description={t('settings_csv_separator_description')}
                  control={
                    <TextField
                      onChange={debouncedCsvSeparatorChange}
                      type={'text'}
                      size="small"
                      defaultValue={generalPreferences.csvSeparator}
                      name="csvSeparator"
                      inputProps={{ style: { textAlign: 'center' } }}
                      sx={{ width: 72 }}
                    />
                  }
                />
              </SettingsRowList>
            </SettingsSection>

            <SettingsSection
              title="settings_branding"
              description="settings_branding_description"
              icon={<PaletteTwoToneIcon fontSize="small" />}
              noPadding
            >
              <SettingsRowList>
                <SettingsRow
                  title={t('brand_color')}
                  description={t('settings_brand_color_description')}
                  control={
                    <TextField
                      onChange={debouncedBrandColorChange}
                      type={'text'}
                      size="small"
                      defaultValue={generalPreferences.color || ''}
                      name="color"
                      placeholder="#977537"
                      sx={{ width: { xs: '100%', sm: 220 } }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <input
                              type="color"
                              aria-label={t('brand_color')}
                              defaultValue={
                                generalPreferences.color || '#977537'
                              }
                              onChange={debounce(
                                (e) =>
                                  patchGeneralPreferences({
                                    color: e.target.value
                                  }).then(() =>
                                    showSnackBar(
                                      t('changes_saved_success'),
                                      'success'
                                    )
                                  ),
                                2000
                              )}
                              style={{
                                width: 28,
                                height: 28,
                                padding: 0,
                                border: 'none',
                                borderRadius: 8,
                                cursor: 'pointer',
                                background: 'none'
                              }}
                            />
                          </InputAdornment>
                        )
                      }}
                    />
                  }
                />
              </SettingsRowList>
            </SettingsSection>

            <SettingsSection
              title="settings_danger_zone"
              description="settings_danger_zone_description"
              icon={<DeleteSweepTwoToneIcon fontSize="small" />}
              noPadding
            >
              <SettingsRow
                title={t('delete_demo_data')}
                description={t('settings_delete_demo_description')}
                control={
                  <Button
                    onClick={() => setOpenDeleteDemo(true)}
                    variant={'outlined'}
                    color={'error'}
                    sx={{ borderRadius: '10px', fontWeight: 700 }}
                  >
                    {t('delete_demo_data')}
                  </Button>
                }
              />
            </SettingsSection>
            <ConfirmDialog
              open={openDeleteDemo}
              onCancel={() => setOpenDeleteDemo(false)}
              onConfirm={onDeleteDemoData}
              confirmText={'Delete'}
              question={'Are you sure you want to delete demo data?'}
            />
          </Stack>
        </form>
      )}
    </Formik>
  );
}

export default GeneralSettings;
