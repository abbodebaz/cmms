import {
  Box,
  Button,
  ButtonBase,
  CircularProgress,
  Collapse,
  Grid,
  TextField,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import ExpandMoreTwoToneIcon from '@mui/icons-material/ExpandMoreTwoTone';
import { ReactNode, useEffect, useState } from 'react';
import { Formik, FormikProps } from 'formik';
import { useTranslation } from 'react-i18next';
import FormikErrorFocus from 'formik-error-focus';
import * as Yup from 'yup';
import { ObjectSchema } from 'yup';
import { IField, IHash } from '../../type';
import CheckBoxForm from './CheckBoxForm';
import Field from './Field';
import FileUpload from '../FileUpload';
import DateTimePicker from '@mui/lab/DateTimePicker';
import CustomSwitch from './CustomSwitch';
import SelectMapCoordinates from './SelectMapCoordinates';
import SelectPartQuantities from './SelectPartQuantities';
import useAuth from '../../../../hooks/useAuth';
import { CustomSelect } from './CustomSelect2';
import SignaturePad from './SignaturePad';
import DateRangePicker from './DateRangePicker';
import SectionCard from '../SectionCard';

interface PropsType {
  fields: Array<IField>;
  values?: IHash<any>;
  onSubmit?: (values: IHash<any>) => Promise<any>;
  onCanceled?: () => void;
  onChange?: any;
  submitText?: string;
  validation?: ObjectSchema<any>;
  isLoading?: boolean;
  isButtonEnabled?: (values: IHash<any>, ...props: any[]) => boolean;
  enableReinitialize?: boolean;
  nextToButton?: React.ReactNode;
  /** Keep the submit button visible at the bottom of the scroll area.
   * Defaults to true for long sectioned forms (3+ sections). */
  stickyFooter?: boolean;
}

interface FormSectionGroup {
  /** The titleGroupField heading; undefined for the leading "basic" block */
  header?: IField;
  fields: IField[];
}

const buildSections = (fields: IField[]): FormSectionGroup[] => {
  const sections: FormSectionGroup[] = [];
  let current: FormSectionGroup = { fields: [] };
  fields.forEach((field) => {
    if (field.type === 'titleGroupField') {
      if (current.header || current.fields.length) sections.push(current);
      current = { header: field, fields: [] };
    } else current.fields.push(field);
  });
  if (current.header || current.fields.length) sections.push(current);
  return sections;
};

const isFilled = (value: any): boolean => {
  if (value === null || value === undefined || value === false) return false;
  if (typeof value === 'string') return value.trim() !== '';
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

const FormSection = ({
  header,
  fields,
  open,
  onToggle,
  values,
  hasError,
  children
}: {
  header: IField;
  fields: IField[];
  open: boolean;
  onToggle: () => void;
  values: IHash<any>;
  hasError: boolean;
  children: ReactNode;
}) => {
  const { t }: { t: any } = useTranslation();
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const total = fields.length;
  const filled = fields.filter((field) => isFilled(values[field.name])).length;
  const complete = total > 0 && filled === total;

  return (
    <SectionCard
      title={header.label}
      description={header.description}
      open={open}
      collapsible
      onToggle={onToggle}
      hasError={hasError}
      contentId={`form-section-${header.name}`}
      badge={
        total > 0 ? (
          <Tooltip
            title={t('form_section_filled_count', { filled, total })}
            arrow
          >
            <Box
              component="span"
              sx={{
                px: 1.1,
                py: 0.3,
                borderRadius: '20px',
                fontSize: theme.typography.pxToRem(11.5),
                fontWeight: 700,
                lineHeight: 1.5,
                whiteSpace: 'nowrap',
                direction: 'ltr',
                backgroundColor: complete
                  ? alpha(theme.palette.success.main, 0.12)
                  : alpha(primary, filled ? 0.12 : 0.06),
                color: complete
                  ? theme.palette.success.dark
                  : filled
                  ? theme.palette.primary.dark
                  : theme.palette.text.secondary
              }}
            >
              {filled}/{total}
            </Box>
          </Tooltip>
        ) : null
      }
    >
      {children}
    </SectionCard>
  );
};

/** Expands every section holding a field with a validation error after a submit attempt */
const SectionErrorExpander = ({
  formik,
  onErrors
}: {
  formik: FormikProps<IHash<any>>;
  onErrors: (errorFieldNames: string[]) => void;
}) => {
  const { submitCount, errors } = formik;
  useEffect(() => {
    if (!submitCount) return;
    const errorFieldNames = Object.keys(errors ?? {});
    if (errorFieldNames.length) onErrors(errorFieldNames);
  }, [submitCount, errors]);
  return null;
};

export default (props: PropsType) => {
  const { t }: { t: any } = useTranslation();
  const theme = useTheme();
  const [sectionOpenState, setSectionOpenState] = useState<
    IHash<boolean>
  >({});
  const shape: IHash<any> = {};

  const allSections = buildSections(props.fields);
  const sectionCount = allSections.filter((section) => section.header).length;
  const stickyFooter = props.stickyFooter ?? false;

  const isSectionOpen = (section: FormSectionGroup): boolean => {
    const name = section.header.name;
    if (sectionOpenState[name] !== undefined) return sectionOpenState[name];
    return (
      !section.header.defaultCollapsed ||
      section.fields.some((field) => field.required)
    );
  };
  const toggleSection = (section: FormSectionGroup) =>
    setSectionOpenState((prev) => ({
      ...prev,
      [section.header.name]: !isSectionOpen(section)
    }));
  const sectionHasError = (
    section: FormSectionGroup,
    formik: FormikProps<IHash<any>>
  ): boolean =>
    section.fields.some(
      (field) => Boolean(formik.errors[field.name]) || Boolean(field.error)
    );
  const expandSectionsWithErrors = (errorFieldNames: string[]) => {
    const toOpen = allSections.filter(
      (section) =>
        section.header &&
        section.fields.some((field) => errorFieldNames.includes(field.name))
    );
    if (toOpen.length)
      setSectionOpenState((prev) => {
        const next = { ...prev };
        toOpen.forEach((section) => (next[section.header.name] = true));
        return next;
      });
  };
  const {
    companySettings: { generalPreferences }
  } = useAuth();

  props.fields.forEach((f) => {
    shape[f.name] = Yup.string();
    if (f.required) {
      shape[f.name] = shape[f.name].required();
    }
  });

  const validationSchema = Yup.object().shape(shape);

  const handleChange = (formik: FormikProps<IHash<any>>, field: string, e) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    props.onChange && props.onChange({ field, e });
    if (props.fields.length == 1) {
      formik.setFieldTouched(field, true);
    }
    formik.setFieldValue(field, e);
    return formik.handleChange(field);
  };

  const handleKeyDown =
    (formik: FormikProps<IHash<any>>, multiple: boolean) =>
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey && !multiple) {
        e.preventDefault();
        formik.handleSubmit();
      }
    };

  const filterRelatedFields = (fields: IField[], formik): IField[] => {
    const fieldsClone = [...fields];
    const withRelatedFields = fields.filter(
      (field) => field.relatedFields?.length
    );
    withRelatedFields.forEach(({ relatedFields, name, type }) => {
      relatedFields.forEach((relatedField) => {
        if (
          formik.values[name] === relatedField.value ||
          formik.values[name]?.value === relatedField.value ||
          (type === 'switch' &&
            formik.values[name] &&
            (formik.values[name][0] === 'on') === relatedField.value) ||
          (formik.values[name] === undefined && !relatedField.value)
        ) {
          if (relatedField.hide) {
            const fieldToDeleteIndex = fieldsClone.findIndex(
              (field) => field.name === relatedField.field
            );
            fieldsClone.splice(fieldToDeleteIndex, 1);
          }
        }
      });
    });
    return fieldsClone;
  };
  const FULL_WIDTH_SELECTS = ['task', 'part'];
  const isHalfWidth = (field: IField, index: number): boolean => {
    if (field.midWidth !== undefined) return field.midWidth;
    if (!sectionCount || field.fullWidth) return false;
    if (field.type === 'select')
      return !FULL_WIDTH_SELECTS.includes(field.type2 as string);
    if (field.type === 'date' || field.type === 'number') return true;
    if (field.type === 'text') return !field.multiple && !field.required;
    return false;
  };
  const renderField = (
    field: IField,
    index: number,
    formik: FormikProps<IHash<any>>
  ) => (
    <Grid
      item
      xs={12}
      md={isHalfWidth(field, index) ? 6 : 12}
      key={field.name}
    >
      {field.type === 'select' ? (
        <CustomSelect field={field} handleChange={handleChange} />
      ) : field.type === 'checkbox' ? (
        <CheckBoxForm
          label={field.label}
          onChange={(e) => {
            handleChange(formik, field.name, e.target.checked);
          }}
          checked={formik.values[field.name]}
        />
      ) : field.type === 'groupCheckbox' ? (
        <CheckBoxForm
          label={field.label}
          type="groupCheckbox"
          listCheckbox={field.items}
          key={field.name}
        />
      ) : field.type === 'switch' ? (
        <CustomSwitch
          title={field.label}
          description={field.helperText}
          name={field.name}
          handleChange={formik.handleChange}
          checked={formik.values[field.name]}
        />
      ) : field.type === 'titleGroupField' ? (
        <Typography variant="h3" sx={{ pb: 1 }}>
          {t(`${field.label}`)}
        </Typography>
      ) : field.type === 'file' ? (
        <Box>
          <FileUpload
            multiple={field.multiple}
            title={field.label}
            type={field.fileType || 'file'}
            description={t('upload')}
            files={
              Array.isArray(formik.values[field.name])
                ? formik.values[field.name]
                : formik.values[field.name]
                ? [formik.values[field.name]]
                : []
            }
            onDrop={(files) => {
              formik.setFieldValue(field.name, files);
            }}
            error={formik.errors[field.name] || field.error}
          />
        </Box>
      ) : field.type === 'date' ? (
        <Box>
          <DateTimePicker
            value={formik.values[field.name] ?? null}
            onChange={(newValue) => {
              handleChange(formik, field.name, newValue);
            }}
            inputFormat={
              generalPreferences.dateFormat === 'MMDDYY'
                ? 'MM/dd/yyyy HH:mm'
                : 'dd/MM/yyyy HH:mm'
            }
            ampm={false}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                label={t(`${field.label}`)}
                placeholder={t('select_date')}
                required={field?.required}
                error={!!formik.errors[field.name] || field.error}
                helperText={
                  typeof formik.errors[field.name] === 'string'
                    ? (formik.errors[field.name] as string)
                    : ''
                }
              />
            )}
          />
        </Box>
      ) : field.type === 'dateRange' ? (
        <Box>
          <Box pb={1}>
            <b>{field.label}:</b>
          </Box>
          <DateRangePicker
            value={formik.values[field.name]}
            onChange={(range) => {
              handleChange(formik, field.name, range);
            }}
            fullWidth
            placeholder={t('select_date_range')}
            required={field?.required}
            error={!!formik.errors[field.name] || field.error}
            helperText={
              typeof formik.errors[field.name] === 'string'
                ? (formik.errors[field.name] as string)
                : ''
            }
          />
        </Box>
      ) : field.type === 'coordinates' ? (
        <SelectMapCoordinates
          selected={formik.values[field.name]}
          onChange={(coordinates) => {
            handleChange(formik, field.name, coordinates);
          }}
        />
      ) : field.type === 'partQuantity' ? (
        <SelectPartQuantities
          selected={formik.values[field.name] ?? []}
          onChange={(newPartQuantities) => {
            handleChange(formik, field.name, newPartQuantities);
          }}
        />
      ) : field.type === 'signature' ? (
        <SignaturePad
          label={field.label}
          value={formik.values[field.name]}
          onChange={(signature) => {
            formik.setFieldValue(field.name, signature);
          }}
        />
      ) : (
        <Field
          key={index}
          {...field}
          isDisabled={formik.isSubmitting}
          type={field.type}
          label={field.label}
          placeholder={field.placeholder}
          value={formik.values[field.name]}
          onBlur={formik.handleBlur}
          // onChange={formik.handleChange}
          onChange={(e) => {
            handleChange(formik, field.name, e.target.value);
          }}
          onKeyDown={handleKeyDown(formik, field.multiple)}
          error={!!formik.errors[field.name] || field.error}
          errorMessage={formik.errors[field.name]}
          fullWidth={field.fullWidth}
        />
      )}
    </Grid>
  );

  return (
    <>
      <Formik<IHash<any>>
        validationSchema={props.validation || validationSchema}
        validateOnChange={false}
        validateOnBlur={false}
        initialValues={props.values || {}}
        enableReinitialize={props.enableReinitialize}
        onSubmit={(
          values,
          { resetForm, setErrors, setStatus, setSubmitting }
        ) => {
          setSubmitting(true);
          props.onSubmit(values).finally(() => {
            // resetForm();
            setStatus({ success: true });
            setSubmitting(false);
          });
        }}
      >
        {(formik) => (
          <Grid
            container
            spacing={sectionCount ? 2.5 : 2}
            sx={
              sectionCount
                ? {
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '10px',
                      backgroundColor: theme.palette.background.paper,
                      transition: theme.transitions.create('box-shadow'),
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: alpha(theme.palette.text.primary, 0.14)
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: alpha(theme.palette.primary.main, 0.5)
                      },
                      '&.Mui-focused': {
                        boxShadow: `0 0 0 4px ${alpha(
                          theme.palette.primary.main,
                          0.12
                        )}`
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.primary.main,
                        borderWidth: '1.5px'
                      },
                      '&.Mui-error .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.error.main
                      }
                    },
                    '& .MuiInputLabel-root': {
                      color: theme.palette.text.secondary,
                      fontWeight: 500
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: theme.palette.primary.dark
                    }
                  }
                : undefined
            }
          >
            {(() => {
              const visibleFields = filterRelatedFields(props.fields, formik);
              const sections = buildSections(visibleFields);
              if (!sections.some((section) => section.header)) {
                // No groups: render exactly as before
                return visibleFields.map((field, index) =>
                  renderField(field, index, formik)
                );
              }
              return sections.map((section, sectionIndex) =>
                section.header ? (
                  section.fields.length ? (
                    <Grid item xs={12} key={`section-${section.header.name}`}>
                      <FormSection
                        header={section.header}
                        fields={section.fields}
                        open={isSectionOpen(section)}
                        onToggle={() => toggleSection(section)}
                        values={formik.values}
                        hasError={sectionHasError(section, formik)}
                      >
                        <Grid container spacing={2}>
                          {section.fields.map((field, index) =>
                            renderField(field, index, formik)
                          )}
                        </Grid>
                      </FormSection>
                    </Grid>
                  ) : null
                ) : (
                  <Grid item xs={12} key={`section-basic-${sectionIndex}`}>
                    <SectionCard
                      title="form_section_basic"
                      contentId={`form-section-basic-${sectionIndex}`}
                    >
                      <Grid container spacing={2}>
                        {section.fields.map((field, index) =>
                          renderField(field, index, formik)
                        )}
                      </Grid>
                    </SectionCard>
                  </Grid>
                )
              );
            })()}

            <Grid
              item
              xs={12}
              sx={
                sectionCount && !stickyFooter
                  ? {
                      mt: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      flexWrap: 'wrap'
                    }
                  : stickyFooter
                  ? {
                      position: 'sticky',
                      bottom: 0,
                      zIndex: 2,
                      pb: 1.5,
                      backgroundColor: theme.palette.background.paper,
                      boxShadow: `0 -1px 0 ${theme.palette.divider}`
                    }
                  : undefined
              }
            >
              <Button
                type="submit"
                size={sectionCount ? 'large' : 'medium'}
                sx={{
                  mt: { xs: 2, sm: 0 },
                  ...(sectionCount
                    ? {
                        mt: 0,
                        minWidth: 160,
                        borderRadius: '12px',
                        fontWeight: 700,
                        boxShadow: `0 6px 16px ${alpha(
                          theme.palette.primary.main,
                          0.28
                        )}`
                      }
                    : {})
                }}
                onClick={() => formik.handleSubmit()}
                variant="contained"
                startIcon={
                  formik.isSubmitting ? <CircularProgress size="1rem" /> : null
                }
                disabled={Boolean(formik.errors.submit) || formik.isSubmitting}
              >
                {t(props.submitText)}
              </Button>

              {props.onCanceled && (
                <Button
                  sx={{
                    mt: { xs: 2, sm: 0 }
                  }}
                  onClick={() => props.onCanceled}
                  variant="outlined"
                  disabled
                >
                  {t(props.submitText)}
                </Button>
              )}
              {props.nextToButton}
            </Grid>
            <FormikErrorFocus
              // See scroll-to-element for configuration options: https://www.npmjs.com/package/scroll-to-element
              offset={0}
              align={'bottom'}
              focusDelay={200}
              ease={'linear'}
              duration={500}
              formik={formik}
            />
            {sectionCount > 0 && (
              <SectionErrorExpander
                formik={formik}
                onErrors={expandSectionsWithErrors}
              />
            )}
          </Grid>
        )}
      </Formik>
    </>
  );
};
