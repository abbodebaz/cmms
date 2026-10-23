import {
  Box,
  Button,
  CircularProgress,
  debounce,
  Divider,
  Grid,
  IconButton,
  Link,
  Tab,
  Tabs,
  Typography,
  useTheme
} from '@mui/material';
import { ChangeEvent, useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import PurchaseOrder from '../../../models/owns/purchaseOrder';
import { CompanySettingsContext } from '../../../contexts/CompanySettingsContext';
import useAuth from '../../../hooks/useAuth';
import { PermissionEntity } from '../../../models/owns/role';
import { editPartQuantity } from '../../../slices/partQuantity';
import { useDispatch } from '../../../store';
import PartQuantitiesList from '../components/PartQuantitiesList';
import { CustomSnackBarContext } from '../../../contexts/CustomSnackBarContext';
import PartQuantity from 'src/models/owns/partQuantity';
import ClearTwoToneIcon from '@mui/icons-material/ClearTwoTone';
import CheckTwoToneIcon from '@mui/icons-material/CheckTwoTone';
import { respondPurchaseOrder } from '../../../slices/purchaseOrder';
import BasicField from '../components/BasicField';
import { alpha } from '@mui/material/styles';
import SectionCard from '../components/SectionCard';
import { SoftChip } from '../components/StatusChip';
import {
  DetailGrid,
  DetailItem,
  DetailsHeader,
  DetailsPage,
  DetailsTabs,
  primaryButtonSx
} from '../components/DetailsKit';
import InfoTwoToneIcon from '@mui/icons-material/InfoTwoTone';
import HandymanTwoToneIcon from '@mui/icons-material/HandymanTwoTone';
import LocalShippingTwoToneIcon from '@mui/icons-material/LocalShippingTwoTone';
import NotesTwoToneIcon from '@mui/icons-material/NotesTwoTone';

interface PurchaseOrderDetailsProps {
  purchaseOrder: PurchaseOrder;
  handleOpenUpdate: () => void;
  handleDelete: () => void;
  partQuantities: PartQuantity[];
}
export default function PurchaseOrderDetails(props: PurchaseOrderDetailsProps) {
  const { purchaseOrder, handleOpenUpdate, handleDelete, partQuantities } =
    props;
  const { t }: { t: any } = useTranslation();
  const { getFormattedDate } = useContext(CompanySettingsContext);
  const [approving, setApproving] = useState<boolean>(false);
  const [cancelling, setCancelling] = useState<boolean>(false);
  const { hasEditPermission, hasDeletePermission, hasViewPermission } =
    useAuth();
  const dispatch = useDispatch();
  const { showSnackBar } = useContext(CustomSnackBarContext);
  const theme = useTheme();
  const [currentTab, setCurrentTab] = useState<string>('details');
  const tabs = [
    { value: 'details', label: t('details') },
    { value: 'parts', label: t('parts') },
    { value: 'shipping', label: t('shipping_information') },
    { value: 'additionalInfos', label: t('additional_information') }
  ];

  const handleTabsChange = (_event: ChangeEvent<{}>, value: string): void => {
    setCurrentTab(value);
  };
  const onPartQuantityChange = (value: string, partQuantity) => {
    dispatch(
      editPartQuantity(purchaseOrder.id, partQuantity.id, Number(value), true)
    )
      .then(() => showSnackBar(t('quantity_edit_success'), 'success'))
      .catch((err) => showSnackBar(t('quantity_edit_failure'), 'error'));
  };
  const debouncedPartQuantityChange = useMemo(
    () => debounce(onPartQuantityChange, 1500),
    []
  );
  const onApprove = () => {
    setApproving(true);
    dispatch(respondPurchaseOrder(purchaseOrder.id, true)).finally(() =>
      setApproving(false)
    );
  };

  const onCancel = () => {
    setCancelling(true);
    dispatch(respondPurchaseOrder(purchaseOrder.id, false)).finally(() =>
      setCancelling(false)
    );
  };
  const detailsFieldsToRender = (
    purchaseOrder1: PurchaseOrder
  ): {
    label: string;
    value: string | number;
    type?: 'vendor';
    id?: number;
    hijriDate?: string;
  }[] => [
    {
      label: t('name'),
      value: purchaseOrder1.name
    },
    {
      label: t('id'),
      value: purchaseOrder1.id
    },
    {
      label: t('due_date'),
      value: getFormattedDate(purchaseOrder1.shippingDueDate),
      hijriDate: purchaseOrder1.shippingDueDate
    },
    {
      label: t('category'),
      value: purchaseOrder1.category?.name
    },
    {
      label: t('created_at'),
      value: getFormattedDate(purchaseOrder1.createdAt)
    },
    {
      label: t('vendor'),
      type: 'vendor',
      value: purchaseOrder1.vendor?.companyName,
      id: purchaseOrder1.vendor?.id
    }
  ];
  const shippingFieldsToRender = (
    purchaseOrder1: PurchaseOrder
  ): { label: string; value: any }[] => [
    {
      label: t('Company Name'),
      value: purchaseOrder1.shippingCompanyName
    },
    {
      label: t('address'),
      value: purchaseOrder1.shippingAddress
    },
    {
      label: t('city'),
      value: purchaseOrder1.shippingCity
    },
    {
      label: t('state'),
      value: purchaseOrder1.shippingState
    },
    {
      label: t('phone'),
      value: purchaseOrder1.shippingPhone
    },
    {
      label: t('fax_number'),
      value: purchaseOrder1.shippingFax
    },
    {
      label: t('ship_to'),
      value: purchaseOrder1.shippingShipToName
    },
    {
      label: t('additional_details'),
      value: purchaseOrder1.shippingAdditionalDetail
    }
  ];
  const additionalInfosFieldsToRender = (
    purchaseOrder1: PurchaseOrder
  ): { label: string; value: any }[] => [
    {
      label: t('requisitioner'),
      value: purchaseOrder1.additionalInfoRequisitionedName
    },
    {
      label: t('shipping_method'),
      value: purchaseOrder1.additionalInfoShippingMethod
    },
    {
      label: t('notes'),
      value: purchaseOrder1.additionalInfoNotes
    },
    {
      label: t('terms'),
      value: purchaseOrder1.additionalInfoTerm
    }
  ];
  const canEditPO = hasEditPermission(
    PermissionEntity.PURCHASE_ORDERS,
    purchaseOrder
  );
  const canDeletePO = hasDeletePermission(
    PermissionEntity.PURCHASE_ORDERS,
    purchaseOrder
  );
  const poStatusTone =
    purchaseOrder?.status === 'APPROVED'
      ? 'success'
      : purchaseOrder?.status === 'PENDING'
      ? 'warning'
      : purchaseOrder?.status
      ? 'error'
      : 'neutral';
  return (
    <DetailsPage>
      <DetailsHeader
        subtitle={<bdi>{`#${purchaseOrder?.id}`}</bdi>}
        title={purchaseOrder?.name}
        description={purchaseOrder?.shippingAddress}
        chips={
          purchaseOrder?.status ? (
            <SoftChip
              tone={poStatusTone}
              size="medium"
              label={t(purchaseOrder.status)}
            />
          ) : undefined
        }
        actions={
          canEditPO || canDeletePO ? (
            <>
              {canEditPO && (
                <IconButton aria-label={t('edit')} onClick={handleOpenUpdate}>
                  <EditTwoToneIcon fontSize="small" color="primary" />
                </IconButton>
              )}
              {canDeletePO && (
                <IconButton aria-label={t('delete')} onClick={handleDelete}>
                  <DeleteTwoToneIcon fontSize="small" color="error" />
                </IconButton>
              )}
            </>
          ) : undefined
        }
      />
      {purchaseOrder.status === 'PENDING' &&
        hasViewPermission(PermissionEntity.SETTINGS) && (
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'flex-end',
              gap: 1.5,
              p: 1.5,
              borderRadius: '14px',
              border: `1px solid ${alpha(theme.palette.primary.main, 0.16)}`,
              backgroundColor: alpha(theme.palette.primary.main, 0.035)
            }}
          >
            <Button
              startIcon={
                cancelling ? (
                  <CircularProgress size="1rem" />
                ) : (
                  <ClearTwoToneIcon />
                )
              }
              onClick={onCancel}
              variant="outlined"
              color="error"
              sx={{ borderRadius: '12px', fontWeight: 700 }}
            >
              {t('reject')}
            </Button>
            <Button
              startIcon={
                approving ? (
                  <CircularProgress size="1rem" color="inherit" />
                ) : (
                  <CheckTwoToneIcon />
                )
              }
              onClick={onApprove}
              variant="contained"
              sx={primaryButtonSx}
            >
              {t('approve')}
            </Button>
          </Box>
        )}
      <DetailsTabs onChange={handleTabsChange} value={currentTab}>
        {tabs.map((tab) => (
          <Tab key={tab.value} label={tab.label} value={tab.value} />
        ))}
      </DetailsTabs>
      <Box>
        {currentTab === 'details' && (
          <SectionCard
            title="details"
            icon={<InfoTwoToneIcon fontSize="small" />}
          >
            <DetailGrid>
              {detailsFieldsToRender(purchaseOrder).map((field) => (
                <BasicField
                  key={field.label}
                  label={field.label}
                  value={field.value}
                  type={field.type}
                  id={field.id}
                  hijriDate={field.hijriDate}
                />
              ))}
            </DetailGrid>
          </SectionCard>
        )}
        {currentTab === 'parts' && (
          <SectionCard
            title="parts"
            icon={<HandymanTwoToneIcon fontSize="small" />}
          >
            <Box sx={{ mx: { xs: -2, sm: -2.5 }, my: -1.5 }}>
              <PartQuantitiesList
                partQuantities={partQuantities}
                disabled={!canEditPO || purchaseOrder.status !== 'PENDING'}
                deleteDisabled={partQuantities.length === 1}
                onChange={debouncedPartQuantityChange}
              />
            </Box>
          </SectionCard>
        )}
        {currentTab === 'shipping' && (
          <SectionCard
            title="shipping_information"
            icon={<LocalShippingTwoToneIcon fontSize="small" />}
          >
            <DetailGrid>
              {shippingFieldsToRender(purchaseOrder).map((field) => (
                <DetailItem
                  key={field.label}
                  label={field.label}
                  value={field.value}
                />
              ))}
            </DetailGrid>
          </SectionCard>
        )}
        {currentTab === 'additionalInfos' && (
          <SectionCard
            title="additional_information"
            icon={<NotesTwoToneIcon fontSize="small" />}
          >
            <DetailGrid>
              {additionalInfosFieldsToRender(purchaseOrder).map((field) => (
                <DetailItem
                  key={field.label}
                  label={field.label}
                  value={field.value}
                />
              ))}
            </DetailGrid>
          </SectionCard>
        )}
      </Box>
    </DetailsPage>
  );
}
