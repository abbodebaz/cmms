import {
  Box,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  Link,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  Tab,
  Tabs,
  Typography,
  useTheme
} from '@mui/material';
import { ChangeEvent, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AddShoppingCartTwoToneIcon from '@mui/icons-material/AddShoppingCartTwoTone';
import Part from '../../../models/owns/part';
import { CompanySettingsContext } from '../../../contexts/CompanySettingsContext';
import { PermissionEntity } from '../../../models/owns/role';
import useAuth from '../../../hooks/useAuth';
import ImageViewer from 'react-simple-image-viewer';
import {
  getAssetUrl,
  getCustomerUrl,
  getTeamUrl,
  getUserUrl,
  getVendorUrl,
  getWorkOrderUrl
} from '../../../utils/urlPaths';
import { editPart } from '../../../slices/part';
import { useDispatch, useSelector } from '../../../store';
import FilesList from '../components/FilesList';
import BasicField from '../components/BasicField';
import { getAssetsByPart } from '../../../slices/asset';
import { useNavigate } from 'react-router-dom';
import { getWorkOrdersByPart } from '../../../slices/workOrder';
import { getFormattedQuantityWithUnit } from './Parts';
import { getFormattedCostPerUnit } from '../../../utils/formatters';
import { getCustomFieldValuesForDetails } from '../type';
import RestockPartModal from './RestockPartModal';
import SectionCard from '../components/SectionCard';
import StatusChip, { SoftChip } from '../components/StatusChip';
import {
  CardLoading,
  DetailGrid,
  DetailItem,
  DetailRow,
  DetailRowText,
  DetailsHeader,
  DetailsPage,
  DetailsTabs,
  DetailThumb,
  EmptyCardBody,
  LinkPills
} from '../components/DetailsKit';
import InfoTwoToneIcon from '@mui/icons-material/InfoTwoTone';
import PlaceTwoToneIcon from '@mui/icons-material/PlaceTwoTone';
import PeopleAltTwoToneIcon from '@mui/icons-material/PeopleAltTwoTone';
import Inventory2TwoToneIcon from '@mui/icons-material/Inventory2TwoTone';
import AttachFileTwoToneIcon from '@mui/icons-material/AttachFileTwoTone';
import AssignmentTwoToneIcon from '@mui/icons-material/AssignmentTwoTone';

interface PartDetailsProps {
  part: Part;
  handleOpenUpdate: () => void;
  handleOpenDelete: () => void;
  onCopy: (part: Part) => void;
}
export default function PartDetails(props: PartDetailsProps) {
  const { part, handleOpenUpdate, handleOpenDelete, onCopy } = props;
  const { hasEditPermission, hasDeletePermission, hasCreatePermission } =
    useAuth();
  const { t }: { t: any } = useTranslation();
  const { getFormattedDate, getFormattedCurrency } = useContext(
    CompanySettingsContext
  );
  const dispatch = useDispatch();
  const [currentTab, setCurrentTab] = useState<string>('details');
  const [isImageViewerOpen, setIsImageViewerOpen] = useState<boolean>(false);
  const [openRestock, setOpenRestock] = useState<boolean>(false);
  const theme = useTheme();
  const { assetsByPart } = useSelector((state) => state.assets);
  const { workOrdersByPart } = useSelector((state) => state.workOrders);
  const navigate = useNavigate();
  const assets = assetsByPart[part?.id] ?? [];
  const workOrders = workOrdersByPart[part?.id] ?? [];
  const [loadingAssets, setLoadingAssets] = useState<boolean>(false);
  const [loadingWorkOrders, setLoadingWorkOrders] = useState<boolean>(false);
  const tabs = [
    { value: 'details', label: t('details') },
    { value: 'assets', label: t('assets') },
    { value: 'files', label: t('files') },
    { value: 'workOrders', label: t('work_orders') }
    //TODO events
  ];
  const handleTabsChange = (_event: ChangeEvent<{}>, value: string): void => {
    setCurrentTab(value);
    if (value === 'assets' && !assets.length) {
      setLoadingAssets(true);
      dispatch(getAssetsByPart(part.id)).finally(() => setLoadingAssets(false));
    } else if (value === 'workOrders' && !workOrders.length) {
      setLoadingWorkOrders(true);
      dispatch(getWorkOrdersByPart(part.id)).finally(() => setLoadingWorkOrders(false));
    }
  };
  const firstFieldsToRender = (part: Part): { label: string; value: any }[] => [
    {
      label: t('name'),
      value: part.name
    },
    {
      label: t('id'),
      value: part.id
    },
    {
      label: t('description'),
      value: part.description
    },
    {
      label: t('category'),
      value: part.category?.name
    },
    {
      label: t('additional_information'),
      value: part.additionalInfos
    },
    {
      label: t('cost'),
      value: getFormattedCostPerUnit(part.cost, part.unit, getFormattedCurrency)
    },
    {
      label: t('quantity'),
      value: getFormattedQuantityWithUnit(part.quantity, part.unit)
    },
    {
      label: t('minimum_quantity'),
      value: getFormattedQuantityWithUnit(part.minQuantity, part.unit)
    },
    {
      label: t('barcode'),
      value: part.barcode
    },
    ...getCustomFieldValuesForDetails(part.customFieldValues, getFormattedDate)
  ];
  const areaFieldsToRender = (part: Part): { label: string; value: any }[] => [
    {
      label: t('area'),
      value: part.area
    }
  ];

  const canEditPart = hasEditPermission(
    PermissionEntity.PARTS_AND_MULTIPARTS,
    part
  );
  const canDeletePart = hasDeletePermission(
    PermissionEntity.PARTS_AND_MULTIPARTS,
    part
  );
  const canCopyPart = hasCreatePermission(PermissionEntity.PARTS_AND_MULTIPARTS);
  const isLowStock =
    part?.minQuantity != null && part?.quantity < part?.minQuantity;
  return (
    <DetailsPage>
      <DetailsHeader
        subtitle={<bdi>{`#${part?.id}`}</bdi>}
        title={part?.name}
        description={part?.description}
        media={
          part.image ? (
            <DetailThumb
              src={part.image.url}
              alt={part?.name}
              size={80}
              onClick={() => setIsImageViewerOpen(true)}
            />
          ) : undefined
        }
        chips={
          <>
            <SoftChip
              tone={isLowStock ? 'warning' : 'success'}
              size="medium"
              label={`${t('quantity')}: ${getFormattedQuantityWithUnit(
                part.quantity,
                part.unit
              )}`}
            />
            {part.category?.name && (
              <SoftChip tone="neutral" size="medium" label={part.category.name} />
            )}
          </>
        }
        actions={
          canEditPart || canCopyPart || canDeletePart ? (
            <>
              {canEditPart && (
                <IconButton aria-label={t('edit')} onClick={handleOpenUpdate}>
                  <EditTwoToneIcon fontSize="small" color="primary" />
                </IconButton>
              )}
              {canCopyPart && (
                <IconButton aria-label={t('copy')} onClick={() => onCopy(part)}>
                  <ContentCopyIcon fontSize="small" color="primary" />
                </IconButton>
              )}
              {canEditPart && (
                <IconButton
                  aria-label={t('restock')}
                  onClick={() => setOpenRestock(true)}
                >
                  <AddShoppingCartTwoToneIcon fontSize="small" color="primary" />
                </IconButton>
              )}
              {canDeletePart && (
                <IconButton aria-label={t('delete')} onClick={handleOpenDelete}>
                  <DeleteTwoToneIcon fontSize="small" color="error" />
                </IconButton>
              )}
            </>
          ) : undefined
        }
      />
      <DetailsTabs onChange={handleTabsChange} value={currentTab}>
        {tabs.map((tab) => (
          <Tab key={tab.value} label={tab.label} value={tab.value} />
        ))}
      </DetailsTabs>
      <Box>
        {currentTab === 'details' && (
          <Stack spacing={2.5}>
            <SectionCard
              title="part_details"
              icon={<InfoTwoToneIcon fontSize="small" />}
            >
              <DetailGrid>
                {firstFieldsToRender(part)
                  .filter(
                    (field) =>
                      field.label !== t('name') &&
                      field.label !== t('description')
                  )
                  .map((field) => (
                    <BasicField key={field.label} {...field} />
                  ))}
              </DetailGrid>
            </SectionCard>
            <SectionCard
              title="area_details"
              icon={<PlaceTwoToneIcon fontSize="small" />}
            >
              <DetailGrid>
                {areaFieldsToRender(part).map((field) => (
                  <DetailItem
                    key={field.label}
                    label={field.label}
                    value={field.value}
                  />
                ))}
              </DetailGrid>
            </SectionCard>
            <SectionCard
              title="assigned_people"
              icon={<PeopleAltTwoToneIcon fontSize="small" />}
            >
              <DetailGrid>
                <DetailItem label={t('assigned_to')}>
                  <LinkPills
                    items={part.assignedTo.map((user) => ({
                      key: user.id,
                      href: getUserUrl(user.id),
                      label: `${user.firstName} ${user.lastName}`
                    }))}
                  />
                </DetailItem>
                <DetailItem label={t('assigned_teams')}>
                  <LinkPills
                    items={part.teams.map((team) => ({
                      key: team.id,
                      href: getTeamUrl(team.id),
                      label: team.name
                    }))}
                  />
                </DetailItem>
                <DetailItem label={t('assigned_customers')}>
                  <LinkPills
                    items={part.customers.map((customer) => ({
                      key: customer.id,
                      href: getCustomerUrl(customer.id),
                      label: customer.name
                    }))}
                  />
                </DetailItem>
                <DetailItem label={t('assigned_vendors')}>
                  <LinkPills
                    items={part.vendors.map((vendor) => ({
                      key: vendor.id,
                      href: getVendorUrl(vendor.id),
                      label: vendor.companyName
                    }))}
                  />
                </DetailItem>
              </DetailGrid>
            </SectionCard>
          </Stack>
        )}
        {currentTab === 'assets' && (
          <SectionCard
            title="assets"
            icon={<Inventory2TwoToneIcon fontSize="small" />}
            noPadding
          >
            {loadingAssets ? (
              <CardLoading />
            ) : assets.length ? (
              <Box>
                {assets.map((asset) => (
                  <DetailRow
                    key={asset.id}
                    onClick={() => navigate(getAssetUrl(asset.id))}
                  >
                    <DetailRowText
                      primary={asset.name}
                      secondary={getFormattedDate(asset.createdAt)}
                    />
                    <SoftChip tone="neutral" label={t(asset.status)} />
                  </DetailRow>
                ))}
              </Box>
            ) : (
              <EmptyCardBody message={t('no_asset_related_part')} />
            )}
          </SectionCard>
        )}
        {currentTab === 'files' && (
          <SectionCard
            title="files"
            icon={<AttachFileTwoToneIcon fontSize="small" />}
            noPadding
          >
            {part.files.length ? (
              <FilesList
                confirmMessage={t(
                  'Are you sure you want to remove this file from this Part ?'
                )}
                files={part.files}
                removeDisabled={!canEditPart}
                onRemove={(id: number) => {
                  dispatch(
                    editPart(part.id, {
                      ...part,
                      files: part.files.filter((f) => f.id !== id)
                    })
                  );
                }}
              />
            ) : (
              <EmptyCardBody message={t('no_file_found')} />
            )}
          </SectionCard>
        )}
        {currentTab === 'workOrders' && (
          <SectionCard
            title="work_orders"
            icon={<AssignmentTwoToneIcon fontSize="small" />}
            noPadding
          >
            {loadingWorkOrders ? (
              <CardLoading />
            ) : workOrders.length ? (
              <Box>
                {workOrders.map((workOrder) => (
                  <DetailRow
                    key={workOrder.id}
                    onClick={() => navigate(getWorkOrderUrl(workOrder.id))}
                  >
                    <DetailRowText
                      primary={workOrder.title}
                      secondary={getFormattedDate(workOrder.createdAt)}
                    />
                    <StatusChip status={workOrder.status} />
                  </DetailRow>
                ))}
              </Box>
            ) : (
              <EmptyCardBody message={t('no_wo_found')} />
            )}
          </SectionCard>
        )}
      </Box>
      <RestockPartModal
        open={openRestock}
        onClose={() => setOpenRestock(false)}
        part={part}
      />
      {isImageViewerOpen && (
        <div style={{ zIndex: 100 }}>
          <ImageViewer
            src={[part.image.url]}
            currentIndex={0}
            onClose={() => setIsImageViewerOpen(false)}
            disableScroll={true}
            backgroundStyle={{
              backgroundColor: 'rgba(0,0,0,0.9)'
            }}
            closeOnClickOutside={true}
          />
        </div>
      )}
    </DetailsPage>
  );
}
