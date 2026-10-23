import {
  Box,
  debounce,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography
} from '@mui/material';
import {
  addVendor,
  clearSingleVendor,
  deleteVendor,
  editVendor,
  getSingleVendor,
  getVendors
} from '../../../slices/vendor';
import { useDispatch, useSelector } from '../../../store';
import { useTranslation } from 'react-i18next';
import { ListToolbar } from '../components/ListPageShell';
import Form from '../components/form';
import FormDialogTitle from '../components/form/FormDialogTitle';
import * as Yup from 'yup';
import {
  getCustomFieldsValues,
  getCustomFieldValuesForDetails,
  IField
} from '../type';
import ConfirmDialog from '../components/ConfirmDialog';
import * as React from 'react';
import { useContext, useEffect, useMemo, useState } from 'react';
import CustomDatagrid2, {
  CustomDatagridColumn2
} from '../components/CustomDatagrid2';
import { CustomSnackBarContext } from '../../../contexts/CustomSnackBarContext';
import {
  emailRegExp,
  isNumeric,
  phoneRegExp,
  websiteRegExp
} from '../../../utils/validators';
import { Close } from '@mui/icons-material';
import { Link } from '@mui/material';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import ArrowBackTwoToneIcon from '@mui/icons-material/ArrowBackTwoTone';
import InfoTwoToneIcon from '@mui/icons-material/InfoTwoTone';
import SectionCard from '../components/SectionCard';
import { SoftChip } from '../components/StatusChip';
import {
  DetailGrid,
  DetailItem,
  DetailsHeader
} from '../components/DetailsKit';
import { Vendor } from '../../../models/owns/vendor';
import { useParams } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';
import { PermissionEntity } from '../../../models/owns/role';
import NoRowsMessageWrapper from '../components/NoRowsMessageWrapper';
import { SearchCriteria, SortDirection } from '../../../models/owns/page';
import { onSearchQueryChange } from '../../../utils/overall';
import SearchInput from '../components/SearchInput';
import { createColumnHelper } from '@tanstack/react-table';
import useTableState from '../../../hooks/useTableState';
import { useBrand } from '../../../hooks/useBrand';
import { getCustomFields } from '../../../slices/customField';
import { CustomFieldEntityType } from '../../../models/owns/customField';
import { getCustomFieldsIFields, getCustomFieldsRequiredShape } from '../type';
import { formatCustomFields } from '../../../utils/formatters';
import { getErrorMessage } from '../../../utils/api';
import { CompanySettingsContext } from '../../../contexts/CompanySettingsContext';

interface PropsType {
  values?: any;
  openModal: boolean;
  handleCloseModal: () => void;
}

const fieldMapping: Record<string, string> = {
  companyName: 'companyName',
  name: 'name',
  vendorType: 'vendorType',
  email: 'email',
  phone: 'phone',
  website: 'website',
  rate: 'rate'
};

const Vendors = ({ openModal, handleCloseModal }: PropsType) => {
  const { t }: { t: any } = useTranslation();
  const brandConfig = useBrand();
  const [isVendorDetailsOpen, setIsVendorDetailsOpen] =
    useState<boolean>(false);
  const { vendorId } = useParams();
  const dispatch = useDispatch();
  const [openDelete, setOpenDelete] = useState<boolean>(false);
  const { vendors, loadingGet, singleVendor } = useSelector(
    (state) => state.vendors
  );
  const { getFormattedDate } = useContext(CompanySettingsContext);
  const { customFields } = useSelector((state) => state.customFields);
  const [openDrawerFromUrl, setOpenDrawerFromUrl] = useState<boolean>(false);
  const [criteria, setCriteria] = useState<SearchCriteria>({
    filterFields: [],
    pageSize: 10,
    pageNum: 0,
    direction: 'DESC'
  });

  // Use the table state hook for TanStack Table
  const {
    sorting,
    setSorting,
    pagination,
    setPagination,
    columnOrder,
    setColumnOrder,
    columnSizing,
    setColumnSizing,
    columnVisibility,
    setColumnVisibility,
    pinnedColumns,
    setPinnedColumns
  } = useTableState({
    prefix: 'vendors',
    initialSorting: [],
    initialPagination: {
      pageSize: criteria.pageSize,
      pageIndex: criteria.pageNum
    },
    setCriteria,
    fieldMapping
  });
  const [currentVendor, setCurrentVendor] = useState<Vendor>();
  const [viewOrUpdate, setViewOrUpdate] = useState<'view' | 'update'>('view');
  const { showSnackBar } = useContext(CustomSnackBarContext);
  const { hasEditPermission, hasDeletePermission } = useAuth();

  const onQueryChange = (event) => {
    onSearchQueryChange<Vendor>(event, criteria, setCriteria, [
      'name',
      'vendorType',
      'companyName',
      'description',
      'customFieldValues.value'
    ]);
  };
  const debouncedQueryChange = useMemo(() => debounce(onQueryChange, 1300), []);

  const handleDelete = (id: number) => {
    handleCloseDetails();
    dispatch(deleteVendor(id)).then(onDeleteSuccess).catch(onDeleteFailure);
    setOpenDelete(false);
  };
  const onCreationSuccess = () => {
    handleCloseModal();
    showSnackBar(t('vendor_create_success'), 'success');
  };
  const onCreationFailure = (err) =>
    showSnackBar(getErrorMessage(err, t('vendor_create_failure')), 'error');
  const onEditSuccess = () => {
    setViewOrUpdate('view');
    showSnackBar(t('changes_saved_success'), 'success');
  };
  const onEditFailure = (err) =>
    showSnackBar(t('vendor_edit_failure'), 'error');
  const onDeleteSuccess = () => {
    showSnackBar(t('vendor_delete_success'), 'success');
  };
  const onDeleteFailure = (err) =>
    showSnackBar(t('vendor_delete_failure'), 'error');

  const handleOpenModal = (vendor: Vendor) => {
    setCurrentVendor(vendor);
    window.history.replaceState(
      null,
      'Vendor details',
      `/app/vendors-customers/vendors/${vendor.id}`
    );
    setIsVendorDetailsOpen(true);
  };
  const handleOpenDetails = (id: number) => {
    const foundVendor = vendors.content.find((vendor) => vendor.id === id);
    if (foundVendor) {
      handleOpenModal(foundVendor);
    }
  };
  const handleCloseDetails = () => {
    window.history.replaceState(
      null,
      'Vendors',
      `/app/vendors-customers/vendors`
    );
    setIsVendorDetailsOpen(false);
  };
  useEffect(() => {
    if (vendorId && isNumeric(vendorId)) {
      dispatch(getSingleVendor(Number(vendorId)));
    }
  }, [vendorId]);

  useEffect(() => {
    dispatch(getVendors(criteria));
  }, [criteria]);

  useEffect(() => {
    if (openModal && !customFields.length) {
      dispatch(getCustomFields());
    }
  }, [openModal]);

  //see changes in ui on edit
  useEffect(() => {
    if (singleVendor || vendors.content.length) {
      const currentInContent = vendors.content.find(
        (vendor) => vendor.id === currentVendor?.id
      );
      const updatedVendor = currentInContent ?? singleVendor;
      if (updatedVendor) {
        if (openDrawerFromUrl) {
          setCurrentVendor(updatedVendor);
        } else {
          handleOpenModal(updatedVendor);
          setOpenDrawerFromUrl(true);
        }
      }
    }
    return () => {
      dispatch(clearSingleVendor());
    };
  }, [singleVendor, vendors]);

  const onPageSizeChange = (size: number) => {
    setCriteria({ ...criteria, pageSize: size });
  };
  const onPageChange = (number: number) => {
    setCriteria({ ...criteria, pageNum: number });
  };

  let fields: Array<IField> = [
    {
      name: 'details',
      type: 'titleGroupField',
      label: t('details'),
      description: t('form_section_vendor_details_desc')
    },
    {
      name: 'companyName',
      type: 'text',
      label: t('company_name'),
      placeholder: brandConfig.shortName,
      required: true
    },
    {
      name: 'vendorType',
      type: 'text',
      label: t('vendor_type'),
      placeholder: t('vendor_type_description')
    },
    {
      name: 'description',
      type: 'text',
      label: t('Description'),
      multiple: true,
      placeholder: t('description')
    },
    {
      name: 'contactGroup',
      type: 'titleGroupField',
      label: t('form_section_contact'),
      description: t('form_section_vendor_contact_desc')
    },
    {
      name: 'name',
      type: 'text',
      label: t('name'),
      placeholder: 'John Doe',
      required: true
    },
    {
      name: 'phone',
      type: 'text',
      label: t('phone'),
      placeholder: '+00212611223344'
    },
    {
      name: 'email',
      type: 'text',
      label: t('email'),
      placeholder: 'john.doe@gmail.com'
    },
    {
      name: 'website',
      type: 'text',
      label: t('website'),
      placeholder: 'https://web-site.com'
    },
    {
      name: 'address',
      type: 'text',
      label: t('address'),
      placeholder: t('address')
    },
    {
      name: 'billingGroup',
      type: 'titleGroupField',
      label: t('billing_information'),
      description: t('form_section_vendor_billing_desc'),
      defaultCollapsed: true
    },
    {
      name: 'rate',
      type: 'number',
      label: t('hourly_rate'),
      placeholder: t('hourly_rate'),
      icon: '$'
    },
    {
      name: 'customFieldsGroup',
      type: 'titleGroupField',
      label: t('custom_fields')
    },
    ...getCustomFieldsIFields(customFields, CustomFieldEntityType.VENDOR)
  ];

  const shape = {
    companyName: Yup.string().required(t('required_company_name')),
    rate: Yup.number(),
    phone: Yup.string().matches(phoneRegExp, t('invalid_phone')).nullable(),
    name: Yup.string().required(t('required_name')),
    website: Yup.string()
      .matches(websiteRegExp, t('invalid_website'))
      .nullable(),
    email: Yup.string().matches(emailRegExp, t('invalid_email')).nullable(),
    ...getCustomFieldsRequiredShape(
      customFields,
      CustomFieldEntityType.VENDOR,
      t
    )
  };

  const columnHelper = createColumnHelper<Vendor>();

  const columns: CustomDatagridColumn2<Vendor>[] = [
    columnHelper.accessor('companyName', {
      id: 'companyName',
      header: () => t('company_name'),
      cell: (info) => <Box sx={{ fontWeight: 'bold' }}>{info.getValue()}</Box>,
      size: 150
    }),
    columnHelper.accessor('address', {
      id: 'address',
      header: () => t('address'),
      cell: (info) => info.getValue() || '',
      size: 150
    }),
    columnHelper.accessor('phone', {
      id: 'phone',
      header: () => t('phone'),
      cell: (info) => info.getValue() || '',
      size: 150
    }),
    columnHelper.accessor('website', {
      id: 'website',
      header: () => t('website'),
      cell: (info) => info.getValue() || '',
      size: 150
    }),
    columnHelper.accessor('name', {
      id: 'name',
      header: () => t('name'),
      cell: (info) => info.getValue() || '',
      size: 150
    }),
    columnHelper.accessor('email', {
      id: 'email',
      header: () => t('email'),
      cell: (info) => info.getValue() || '',
      size: 150
    }),
    columnHelper.accessor('vendorType', {
      id: 'vendorType',
      header: () => t('vendor_type'),
      cell: (info) => info.getValue() || '',
      size: 150
    }),
    columnHelper.accessor('description', {
      id: 'description',
      header: () => t('description'),
      cell: (info) => info.getValue() || '',
      size: 300
    }),
    columnHelper.accessor('rate', {
      id: 'rate',
      header: () => t('hourly_rate'),
      cell: (info) => info.getValue() || '',
      size: 150
    })
  ];

  // const searchFilterProperties = ['name', 'companyName', 'vendorType', 'email'];
  const fieldsToRender = [
    {
      label: t('address'),
      value: currentVendor?.address
    },
    {
      label: t('phone'),
      value: currentVendor?.phone
    },
    {
      label: t('email'),
      value: currentVendor?.email
    },
    {
      label: t('type'),
      value: currentVendor?.vendorType
    },
    {
      label: t('contact_name'),
      value: currentVendor?.name
    },
    ...getCustomFieldValuesForDetails(
      currentVendor?.customFieldValues,
      getFormattedDate
    )
  ];
  const renderKeyAndValue = (key: string, value: string) => {
    if (value)
      return (
        <>
          <Typography variant="subtitle1">{key}</Typography>
          <Typography variant="h5" sx={{ mb: 1 }}>
            {value}
          </Typography>
        </>
      );
  };
  const RenderVendorsAddModal = () => (
    <Dialog fullWidth maxWidth="md" open={openModal} onClose={handleCloseModal}>
      <FormDialogTitle
        title={t('add_vendor')}
        subtitle={t('add_vendor_description')}
        onClose={handleCloseModal}
      />
      <DialogContent
        dividers
        sx={{
          p: 3
        }}
      >
        <Box>
          <Form
            fields={fields}
            validation={Yup.object().shape(shape)}
            submitText={t('add')}
            values={{}}
            onChange={({ field, e }) => {}}
            onSubmit={async (values) => {
              let formattedValues = formatCustomFields(values);
              formattedValues = {
                ...formattedValues,
                rate: Number(values.rate)
              };
              return dispatch(addVendor(formattedValues))
                .then(onCreationSuccess)
                .catch(onCreationFailure);
            }}
          />
        </Box>
      </DialogContent>
    </Dialog>
  );

  const RenderVendorsList = () => (
    <Box
      sx={{
        width: '95%'
      }}
    >
      <CustomDatagrid2
        columns={columns}
        data={vendors.content}
        loading={loadingGet}
        pagination={pagination}
        onPaginationChange={setPagination}
        totalRows={vendors.totalElements}
        pageSizeOptions={[10, 20, 50]}
        sorting={sorting}
        onSortingChange={setSorting}
        columnOrder={columnOrder}
        onColumnOrderChange={setColumnOrder}
        columnSizing={columnSizing}
        onColumnSizingChange={setColumnSizing}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={setColumnVisibility}
        onRowClick={(row) => handleOpenDetails(row.id)}
        noRowsMessage={t('noRows.vendor.message')}
        noRowsAction={t('noRows.vendor.action')}
        enableColumnReordering
        enableColumnResizing
        pinnedColumns={pinnedColumns}
        onPinnedColumnsChange={setPinnedColumns}
      />
    </Box>
  );

  const ModalVendorDetails = () => (
    <Dialog
      fullWidth
      maxWidth="sm"
      open={isVendorDetailsOpen}
      onClose={handleCloseDetails}
    >
      <DialogTitle component="div" sx={{ p: { xs: 2, sm: 3 }, pb: 0 }}>
        <DetailsHeader
          subtitle={t('vendor')}
          title={currentVendor?.companyName}
          chips={
            currentVendor?.vendorType ? (
              <SoftChip tone="neutral" size="medium" label={currentVendor.vendorType} />
            ) : undefined
          }
          actions={
            <>
              {viewOrUpdate === 'view' ? (
                hasEditPermission(
                  PermissionEntity.VENDORS_AND_CUSTOMERS,
                  currentVendor
                ) && (
                  <IconButton
                    aria-label={t('edit')}
                    onClick={() => setViewOrUpdate('update')}
                  >
                    <EditTwoToneIcon fontSize="small" color="primary" />
                  </IconButton>
                )
              ) : (
                <IconButton
                  aria-label={t('go_back')}
                  onClick={() => setViewOrUpdate('view')}
                >
                  <ArrowBackTwoToneIcon
                    fontSize="small"
                    sx={{ transform: (theme) =>
                      theme.direction === 'rtl' ? 'scaleX(-1)' : 'none' }}
                  />
                </IconButton>
              )}
              {hasDeletePermission(
                PermissionEntity.VENDORS_AND_CUSTOMERS,
                currentVendor
              ) && (
                <IconButton
                  aria-label={t('to_delete')}
                  onClick={() => {
                    setIsVendorDetailsOpen(false);
                    setOpenDelete(true);
                  }}
                >
                  <DeleteTwoToneIcon fontSize="small" color="error" />
                </IconButton>
              )}
              <IconButton
                aria-label="close"
                onClick={() => {
                  setIsVendorDetailsOpen(false);
                }}
              >
                <Close fontSize="small" />
              </IconButton>
            </>
          }
        />
      </DialogTitle>

      <DialogContent
        dividers
        sx={{
          p: 3
        }}
      >
        {viewOrUpdate === 'view' ? (
          <Stack spacing={2.5}>
            {currentVendor?.description && (
              <Typography
                sx={{
                  color: 'text.secondary',
                  fontSize: 14,
                  lineHeight: 1.6,
                  whiteSpace: 'pre-line',
                  textAlign: 'start'
                }}
              >
                {currentVendor.description}
              </Typography>
            )}
            <SectionCard
              title="details"
              icon={<InfoTwoToneIcon fontSize="small" />}
            >
              <DetailGrid minColumnWidth={180}>
                {fieldsToRender
                  .filter((field) => field.label !== t('type'))
                  .map((field) => (
                    <DetailItem
                      key={field.label}
                      label={field.label}
                      value={field.value}
                    />
                  ))}
                <DetailItem label={t('website')}>
                  {currentVendor?.website ? (
                    <Link
                      href={
                        currentVendor.website.toLowerCase().startsWith('http')
                          ? currentVendor.website
                          : `https://${currentVendor.website}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      underline="hover"
                    >
                      {currentVendor.website}
                    </Link>
                  ) : null}
                </DetailItem>
              </DetailGrid>
            </SectionCard>
          </Stack>
        ) : (
          <Box>
            <Form
              fields={fields}
              validation={Yup.object().shape(shape)}
              submitText={t('save')}
              values={
                { ...currentVendor, ...getCustomFieldsValues(currentVendor) } ||
                {}
              }
              onChange={({ field, e }) => {}}
              onSubmit={async (values) => {
                let formattedValues = formatCustomFields(values);
                formattedValues = values.rate
                  ? {
                      ...formattedValues,
                      rate: Number(values.rate)
                    }
                  : formattedValues;
                return dispatch(editVendor(currentVendor.id, formattedValues))
                  .then(onEditSuccess)
                  .catch(onEditFailure);
              }}
            />
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );

  return (
    <Box
      sx={{
        py: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%'
      }}
    >
      <ModalVendorDetails />
      <RenderVendorsAddModal />
      <Box sx={{ width: '100%', px: 2 }}>
        <ListToolbar bare>
          <SearchInput onChange={debouncedQueryChange} />
        </ListToolbar>
      </Box>
      {RenderVendorsList()}
      <ConfirmDialog
        open={openDelete}
        onCancel={() => {
          setOpenDelete(false);
          setIsVendorDetailsOpen(true);
        }}
        onConfirm={() => handleDelete(currentVendor?.id)}
        confirmText={t('to_delete')}
        question={t('confirm_delete_vendor')}
      />
    </Box>
  );
};

export default Vendors;
