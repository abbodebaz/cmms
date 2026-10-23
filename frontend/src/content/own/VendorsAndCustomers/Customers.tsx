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
import * as React from 'react';
import { useContext, useEffect, useMemo, useState } from 'react';
import CustomDatagrid2, {
  CustomDatagridColumn2
} from '../components/CustomDatagrid2';
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
import { Customer } from '../../../models/owns/customer';
import { useParams } from 'react-router-dom';
import {
  addCustomer,
  clearSingleCustomer,
  deleteCustomer,
  editCustomer,
  getCustomers,
  getSingleCustomer
} from '../../../slices/customer';
import { useDispatch, useSelector } from '../../../store';
import ConfirmDialog from '../components/ConfirmDialog';
import { CustomSnackBarContext } from '../../../contexts/CustomSnackBarContext';
import useAuth from '../../../hooks/useAuth';
import { PermissionEntity } from '../../../models/owns/role';
import NoRowsMessageWrapper from '../components/NoRowsMessageWrapper';
import { formatSelect } from '../../../utils/formatters';
import Currency from '../../../models/owns/currency';
import { SearchCriteria, SortDirection } from '../../../models/owns/page';
import { onSearchQueryChange } from '../../../utils/overall';
import SearchInput from '../components/SearchInput';
import { createColumnHelper } from '@tanstack/react-table';
import useTableState from '../../../hooks/useTableState';
import { getErrorMessage } from '../../../utils/api';
import { getCustomFields } from '../../../slices/customField';
import { CustomFieldEntityType } from '../../../models/owns/customField';
import { getCustomFieldsIFields, getCustomFieldsRequiredShape } from '../type';
import { formatCustomFields } from '../../../utils/formatters';
import { CompanySettingsContext } from '../../../contexts/CompanySettingsContext';

interface PropsType {
  values?: any;
  openModal: boolean;
  handleCloseModal: () => void;
}

const fieldMapping: Record<string, string> = {
  companyName: 'companyName',
  name: 'name',
  customerType: 'customerType',
  email: 'email',
  phone: 'phone',
  website: 'website',
  billingCurrency: 'billingCurrency.name'
};

const Customers = ({ openModal, handleCloseModal }: PropsType) => {
  const { t }: { t: any } = useTranslation();
  const [isCustomerDetailsOpen, setIsCustomerDetailsOpen] =
    useState<boolean>(false);
  const { customerId } = useParams();
  const dispatch = useDispatch();
  const { customers, loadingGet, singleCustomer } = useSelector(
    (state) => state.customers
  );
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
    prefix: 'customers',
    initialSorting: [],
    initialPagination: {
      pageSize: criteria.pageSize,
      pageIndex: criteria.pageNum
    },
    setCriteria,
    fieldMapping
  });
  const { hasEditPermission, hasDeletePermission } = useAuth();
  const [currentCustomer, setCurrentCustomer] = useState<Customer>();
  const [viewOrUpdate, setViewOrUpdate] = useState<'view' | 'update'>('view');
  const [openDelete, setOpenDelete] = useState<boolean>(false);
  const { showSnackBar } = useContext(CustomSnackBarContext);
  const { getFormattedDate } = useContext(CompanySettingsContext);

  const onQueryChange = (event) => {
    onSearchQueryChange<Customer>(event, criteria, setCriteria, [
      'name',
      'customerType',
      'billingName',
      'billingAddress',
      'billingAddress2',
      'customFieldValues.value'
    ]);
  };
  const debouncedQueryChange = useMemo(() => debounce(onQueryChange, 1300), []);

  const handleOpenModal = (customer: Customer) => {
    setCurrentCustomer(customer);
    window.history.replaceState(
      null,
      'Customer details',
      `/app/vendors-customers/customers/${customer.id}`
    );
    setIsCustomerDetailsOpen(true);
  };
  const handleOpenDetails = (id: number) => {
    const foundCustomer = customers.content.find(
      (customer) => customer.id === id
    );
    if (foundCustomer) {
      handleOpenModal(foundCustomer);
    }
  };
  const handleCloseDetails = () => {
    window.history.replaceState(
      null,
      'Customer',
      `/app/vendors-customers/customers`
    );
    setIsCustomerDetailsOpen(false);
  };

  const handleDelete = (id: number) => {
    handleCloseDetails();
    dispatch(deleteCustomer(id)).then(onDeleteSuccess).catch(onDeleteFailure);
    setOpenDelete(false);
  };
  const onCreationSuccess = () => {
    handleCloseModal();
    showSnackBar(t('customer_create_success'), 'success');
  };
  const onCreationFailure = (err) =>
    showSnackBar(getErrorMessage(err, t('customer_create_failure')), 'error');
  const onEditSuccess = () => {
    setViewOrUpdate('view');
    showSnackBar(t('changes_saved_success'), 'success');
  };
  const onEditFailure = (err) =>
    showSnackBar(t('customer_edit_failure'), 'error');
  const onDeleteSuccess = () => {
    showSnackBar(t('customer_delete_success'), 'success');
  };
  const onDeleteFailure = (err) =>
    showSnackBar(t('customer_delete_failure'), 'error');

  useEffect(() => {
    if (customerId && isNumeric(customerId)) {
      dispatch(getSingleCustomer(Number(customerId)));
    }
  }, [customerId]);

  useEffect(() => {
    dispatch(getCustomers(criteria));
  }, [criteria]);

  useEffect(() => {
    if (openModal && !customFields.length) {
      dispatch(getCustomFields());
    }
  }, [openModal]);

  //see changes in ui on edit
  useEffect(() => {
    if (singleCustomer || customers.content.length) {
      const currentInContent = customers.content.find(
        (customer) => customer.id === currentCustomer?.id
      );
      const updatedCustomer = currentInContent ?? singleCustomer;
      if (updatedCustomer) {
        if (openDrawerFromUrl) {
          setCurrentCustomer(updatedCustomer);
        } else {
          handleOpenModal(updatedCustomer);
          setOpenDrawerFromUrl(true);
        }
      }
    }
    return () => {
      dispatch(clearSingleCustomer());
    };
  }, [singleCustomer, customers]);

  const onPageSizeChange = (size: number) => {
    setCriteria({ ...criteria, pageSize: size });
  };
  const onPageChange = (number: number) => {
    setCriteria({ ...criteria, pageNum: number });
  };

  const formatValues = (values) => {
    const newValues = { ...values };
    newValues.billingCurrency = formatSelect(newValues.billingCurrency);
    newValues.rate = newValues.rate ? Number(newValues.rate) : null;
    return formatCustomFields(newValues);
  };
  let fields: Array<IField> = [
    {
      name: 'details',
      type: 'titleGroupField',
      label: t('details'),
      description: t('form_section_customer_details_desc')
    },
    {
      name: 'name',
      type: 'text',
      label: t('customer_name'),
      placeholder: 'John Doe',
      required: true
    },
    {
      name: 'customerType',
      type: 'text',
      label: t('customer_type'),
      placeholder: t('customer_type_description')
    },
    {
      name: 'description',
      type: 'text',
      label: t('description'),
      multiple: true,
      placeholder: t('customer_description_description')
    },
    {
      name: 'contactGroup',
      type: 'titleGroupField',
      label: t('form_section_contact'),
      description: t('form_section_contact_desc')
    },
    {
      name: 'phone',
      type: 'text',
      label: t('phone'),
      placeholder: '+212611223344',
      required: true
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
      description: t('form_section_billing_desc'),
      defaultCollapsed: true
    },
    {
      name: 'rate',
      type: 'number',
      label: t('hourly_rate'),
      placeholder: t('hourly_rate'),
      icon: '$'
      // helperText: 'Changes will only apply to Work Orders created in the future'
    },
    {
      name: 'billingName',
      type: 'text',
      label: t('billing_name'),
      placeholder: t('billing_name')
    },
    {
      name: 'billingAddress',
      type: 'text',
      label: t('address'),
      placeholder: t('address')
    },
    {
      name: 'billingAddress2',
      type: 'text',
      label: t('address_line_2'),
      placeholder: t('address_line_2')
    },
    {
      name: 'customFieldsGroup',
      type: 'titleGroupField',
      label: t('custom_fields')
    },
    // {
    //   name: 'billingCurrency',
    //   type: 'select',
    //   type2: 'currency',
    //   label: t('currency'),
    //   placeholder: t('select_currency')
    // }
    ...getCustomFieldsIFields(customFields, CustomFieldEntityType.CUSTOMER)
  ];

  const shape = {
    name: Yup.string().required('required_customer_name'),
    ...getCustomFieldsRequiredShape(
      customFields,
      CustomFieldEntityType.CUSTOMER,
      t
    ),
    phone: Yup.string()
      .matches(phoneRegExp, t('invalid_phone'))
      .required(t('required_phone')),
    website: Yup.string()
      .matches(websiteRegExp, t('invalid_website'))
      .nullable(),
    email: Yup.string().matches(emailRegExp, t('invalid_email')).nullable()
  };

  const columnHelper = createColumnHelper<Customer>();

  const columns: CustomDatagridColumn2<Customer>[] = [
    columnHelper.accessor('name', {
      id: 'name',
      header: () => t('customer_name'),
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
    columnHelper.accessor('email', {
      id: 'email',
      header: () => t('email'),
      cell: (info) => info.getValue() || '',
      size: 150
    }),
    columnHelper.accessor('customerType', {
      id: 'customerType',
      header: () => t('customer_type'),
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
    }),
    columnHelper.accessor('billingAddress', {
      id: 'billingAddress',
      header: () => t('billing_address'),
      cell: (info) => info.getValue() || '',
      size: 150
    }),
    columnHelper.accessor('billingName', {
      id: 'billingName',
      header: () => t('billing_name'),
      cell: (info) => info.getValue() || '',
      size: 150
    }),
    columnHelper.accessor((row) => row.billingCurrency?.name, {
      id: 'billingCurrency',
      header: () => t('currency'),
      cell: (info) => info.getValue() || '',
      size: 150
    })
  ];
  const RenderCustomersAddModal = () => (
    <Dialog fullWidth maxWidth="md" open={openModal} onClose={handleCloseModal}>
      <FormDialogTitle
        title={t('add_customer')}
        subtitle={t('add_customer_description')}
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
              const formattedValues = formatValues(values);
              return dispatch(addCustomer(formattedValues))
                .then(onCreationSuccess)
                .catch(onCreationFailure);
            }}
          />
        </Box>
      </DialogContent>
    </Dialog>
  );

  const RenderCustomersList = () => (
    <Box
      sx={{
        width: '95%'
      }}
    >
      <CustomDatagrid2
        columns={columns}
        data={customers.content}
        loading={loadingGet}
        pagination={pagination}
        onPaginationChange={setPagination}
        totalRows={customers.totalElements}
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
        noRowsMessage={t('noRows.customer.message')}
        noRowsAction={t('noRows.customer.action')}
        enableColumnReordering
        enableColumnResizing
        pinnedColumns={pinnedColumns}
        onPinnedColumnsChange={setPinnedColumns}
      />
    </Box>
  );
  const fieldsToRender: { label: string; value: string }[] = [
    {
      label: t('address'),
      value: currentCustomer?.address
    },
    {
      label: t('phone'),
      value: currentCustomer?.phone
    },
    {
      label: t('email'),
      value: currentCustomer?.email
    },
    {
      label: t('type'),
      value: currentCustomer?.customerType
    },
    {
      label: t('billing_currency'),
      value: currentCustomer?.billingCurrency?.name
    },
    ...getCustomFieldValuesForDetails(
      currentCustomer?.customFieldValues,
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
  const ModalCustomerDetails = () => (
    <Dialog
      fullWidth
      maxWidth="sm"
      open={isCustomerDetailsOpen}
      onClose={handleCloseDetails}
    >
      <DialogTitle component="div" sx={{ p: { xs: 2, sm: 3 }, pb: 0 }}>
        <DetailsHeader
          subtitle={t('customer')}
          title={currentCustomer?.name}
          chips={
            currentCustomer?.customerType ? (
              <SoftChip tone="neutral" size="medium" label={currentCustomer.customerType} />
            ) : undefined
          }
          actions={
            <>
              {viewOrUpdate === 'view' ? (
                hasEditPermission(
                  PermissionEntity.VENDORS_AND_CUSTOMERS,
                  currentCustomer
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
                currentCustomer
              ) && (
                <IconButton
                  aria-label={t('to_delete')}
                  onClick={() => {
                    setIsCustomerDetailsOpen(false);
                    setOpenDelete(true);
                  }}
                >
                  <DeleteTwoToneIcon fontSize="small" color="error" />
                </IconButton>
              )}
              <IconButton
                aria-label="close"
                onClick={() => {
                  setIsCustomerDetailsOpen(false);
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
            {currentCustomer?.description && (
              <Typography
                sx={{
                  color: 'text.secondary',
                  fontSize: 14,
                  lineHeight: 1.6,
                  whiteSpace: 'pre-line',
                  textAlign: 'start'
                }}
              >
                {currentCustomer.description}
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
                  {currentCustomer?.website ? (
                    <Link
                      href={
                        currentCustomer.website.toLowerCase().startsWith('http')
                          ? currentCustomer.website
                          : `https://${currentCustomer.website}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      underline="hover"
                    >
                      {currentCustomer.website}
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
              values={{
                ...currentCustomer,
                billingCurrency: currentCustomer?.billingCurrency
                  ? {
                      label: currentCustomer.billingCurrency.name,
                      value: currentCustomer.billingCurrency.id
                    }
                  : null,
                ...getCustomFieldsValues(currentCustomer)
              }}
              onChange={({ field, e }) => {}}
              onSubmit={async (values) => {
                const formattedValues = formatValues(values);
                return dispatch(
                  editCustomer(currentCustomer.id, formattedValues)
                )
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
      <ModalCustomerDetails />
      <RenderCustomersAddModal />
      <Box sx={{ width: '100%', px: 2 }}>
        <ListToolbar bare>
          <SearchInput onChange={debouncedQueryChange} />
        </ListToolbar>
      </Box>
      {RenderCustomersList()}
      <ConfirmDialog
        open={openDelete}
        onCancel={() => {
          setOpenDelete(false);
          setIsCustomerDetailsOpen(true);
        }}
        onConfirm={() => handleDelete(currentCustomer?.id)}
        confirmText={t('to_delete')}
        question={t('confirm_delete_customer')}
      />
    </Box>
  );
};

export default Customers;
