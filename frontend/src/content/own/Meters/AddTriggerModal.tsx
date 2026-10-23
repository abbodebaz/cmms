import { Dialog, DialogContent, DialogTitle, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import Form from '../components/form';
import FormDialogTitle from '../components/form/FormDialogTitle';
import * as Yup from 'yup';
import { IField } from '../type';
import { formatSelect, formatSelectMultiple, formatCustomFields } from '../../../utils/formatters';
import { useDispatch, useSelector } from '../../../store';
import { createWorkOrderMeterTrigger } from '../../../slices/workOrderMeterTrigger';
import { getWOBaseFields } from '../../../utils/woBase';
import { getCustomFields } from '../../../slices/customField';
import { CustomFieldEntityType } from '../../../models/owns/customField';
import { getCustomFieldsRequiredShape } from '../../own/type';
import Meter from '../../../models/owns/meter';
import { useContext, useEffect } from 'react';
import { CompanySettingsContext } from '../../../contexts/CompanySettingsContext';
import { CustomSnackBarContext } from '../../../contexts/CustomSnackBarContext';
import { getImageAndFiles } from '../../../utils/overall';
import { getErrorMessage } from '../../../utils/api';

interface AddTriggerProps {
  open: boolean;
  onClose: () => void;
  meter: Meter;
}
export default function AddTriggerModal({
  open,
  onClose,
  meter
}: AddTriggerProps) {
  const { t }: { t: any } = useTranslation();
  const dispatch = useDispatch();
  const { showSnackBar } = useContext(CustomSnackBarContext);
  const { uploadFiles } = useContext(CompanySettingsContext);
  const { customFields } = useSelector((state) => state.customFields);

  useEffect(() => {
    if (open && !customFields.length) {
      dispatch(getCustomFields());
    }
  }, [open]);

  const woBaseFields = getWOBaseFields(t, customFields);
  const pickWOBaseFields = (names: string[]): IField[] =>
    names.flatMap((name) => woBaseFields.filter((field) => field.name === name));
  const woBaseCustomFields = woBaseFields.filter((field) =>
    field.name.startsWith('customField_')
  );
  const fields: Array<IField> = [
    {
      name: 'triggerConfiguration',
      type: 'titleGroupField',
      label: t('trigger_configuration'),
      description: t('form_section_meter_trigger_desc')
    },
    {
      name: 'name',
      type: 'text',
      label: t('trigger_name'),
      required: true
    },
    {
      name: 'triggerCondition',
      type: 'select',
      label: t('when_reading_is'),
      items: [
        { label: t('greater_than'), value: 'MORE_THAN' },
        { label: t('lower_than'), value: 'LESS_THAN' }
      ],
      midWidth: true,
      required: true
    },
    {
      name: 'value',
      type: 'number',
      label: t('value') + '(' + meter.unit + ')',
      midWidth: true,
      required: true
    },
    {
      name: 'workOrderConfig',
      type: 'titleGroupField',
      label: t('wo_configuration'),
      description: t('form_section_meter_wo_desc')
    },
    ...pickWOBaseFields([
      'title',
      'description',
      'priority',
      'category',
      'location',
      'asset'
    ]),
    {
      name: 'schedulingGroup',
      type: 'titleGroupField',
      label: t('form_section_scheduling'),
      description: t('form_section_scheduling_desc'),
      defaultCollapsed: true
    },
    ...pickWOBaseFields(['dueDate', 'estimatedStartDate', 'estimatedDuration']),
    {
      name: 'assignmentGroup',
      type: 'titleGroupField',
      label: t('form_section_assignment'),
      description: t('form_section_wo_assignment_desc'),
      defaultCollapsed: true
    },
    ...pickWOBaseFields(['primaryUser', 'team']),
    {
      name: 'attachmentsGroup',
      type: 'titleGroupField',
      label: t('form_section_attachments'),
      description: t('form_section_files_desc'),
      defaultCollapsed: true
    },
    ...pickWOBaseFields(['image', 'files']),
    ...(woBaseCustomFields.length
      ? ([
          {
            name: 'customFieldsGroup',
            type: 'titleGroupField',
            label: t('custom_fields')
          },
          ...woBaseCustomFields
        ] as IField[])
      : [])
  ];
  const shape = {
    name: Yup.string().required(t('required_trigger_name')),
    title: Yup.string().required(t('required_wo_title')),
    value: Yup.number().required(t('required_value')),
    triggerCondition: Yup.object().required(t('required_trigger_condition')),
    ...getCustomFieldsRequiredShape(
      customFields,
      CustomFieldEntityType.WORK_ORDER,
      t
    )
  };
  const formatValues = (values) => {
    const newValues = { ...values };
    newValues.primaryUser = formatSelect(newValues.primaryUser);
    newValues.location = formatSelect(newValues.location);
    newValues.team = formatSelect(newValues.team);
    newValues.asset = formatSelect(newValues.asset);
    newValues.category = formatSelect(newValues.category);
    newValues.assignedTo = formatSelectMultiple(newValues.assignedTo);
    newValues.priority = newValues.priority?.value;
    newValues.triggerCondition = newValues.triggerCondition.value;
    return formatCustomFields(newValues);
  };
  const onCreationSuccess = () => {
    onClose();
    showSnackBar(t('wo_trigger_create_success'), 'success');
  };
  const onCreationFailure = (err) =>
    showSnackBar(getErrorMessage(err, t('wo_trigger_create_failure')), 'error');

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose}>
      <FormDialogTitle
        title={t('add_wo_trigger')}
        subtitle={t('add_wo_trigger_description')}
        onClose={onClose}
      />
      <DialogContent
        dividers
        sx={{
          p: 3
        }}
      >
        <Form
          fields={fields}
          validation={Yup.object().shape(shape)}
          submitText={t('add')}
          values={{ dueDate: null }}
          onChange={({ field, e }) => {}}
          onSubmit={async (values) => {
            let formattedValues = formatValues(values);
            try {
              const uploadedFiles = await uploadFiles(
                formattedValues.files,
                formattedValues.image
              );

              const imageAndFiles = getImageAndFiles(uploadedFiles);
              formattedValues = {
                ...formattedValues,
                image: imageAndFiles.image,
                files: imageAndFiles.files
              };

              await dispatch(
                createWorkOrderMeterTrigger(meter.id, formattedValues)
              );
              onCreationSuccess();
            } catch (err) {
              onCreationFailure(err);
              throw err;
            }
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
