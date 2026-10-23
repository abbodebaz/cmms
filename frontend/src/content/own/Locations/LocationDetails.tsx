import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
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
import Location from '../../../models/owns/location';
import { ChangeEvent, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AddTwoToneIcon from '@mui/icons-material/AddTwoTone';
import Form from '../components/form';
import * as Yup from 'yup';
import { IField } from '../type';
import { useDispatch, useSelector } from '../../../store';
import { getAssetsByLocation } from '../../../slices/asset';
import { useNavigate } from 'react-router-dom';
import { getWorkOrdersByLocation } from '../../../slices/workOrder';
import {
  createFloorPlan,
  deleteFloorPlan,
  getFloorPlans
} from '../../../slices/floorPlan';
import { CompanySettingsContext } from '../../../contexts/CompanySettingsContext';
import { getAssetUrl } from '../../../utils/urlPaths';
import useAuth from '../../../hooks/useAuth';
import { PermissionEntity } from '../../../models/owns/role';
import { PlanFeature } from '../../../models/owns/subscriptionPlan';
import FormDialogTitle from '../components/form/FormDialogTitle';
import { alpha } from '@mui/material/styles';
import SectionCard from '../components/SectionCard';
import StatusChip from '../components/StatusChip';
import {
  CardBody,
  DetailGrid,
  DetailItem,
  DetailRow,
  DetailRowText,
  DetailsHeader,
  DetailsPage,
  DetailThumb,
  LinkPills,
  MutedText,
  softButtonSx
} from '../components/DetailsKit';
import Inventory2TwoToneIcon from '@mui/icons-material/Inventory2TwoTone';
import AssignmentTwoToneIcon from '@mui/icons-material/AssignmentTwoTone';
import AttachFileTwoToneIcon from '@mui/icons-material/AttachFileTwoTone';
import MapTwoToneIcon from '@mui/icons-material/MapTwoTone';
import PeopleAltTwoToneIcon from '@mui/icons-material/PeopleAltTwoTone';
import InsertDriveFileTwoToneIcon from '@mui/icons-material/InsertDriveFileTwoTone';

interface LocationDetailsProps {
  location: Location;
  handleOpenUpdate: () => void;
  handleOpenDelete: () => void;
  onCopy: (location: Location) => void;
}
export default function LocationDetails(props: LocationDetailsProps) {
  const { location, handleOpenUpdate, handleOpenDelete, onCopy } = props;
  const { t }: { t: any } = useTranslation();
  const dispatch = useDispatch();
  const { getFormattedDate, uploadFiles } = useContext(CompanySettingsContext);
  const [openAddFloorPlan, setOpenAddFloorPlan] = useState<boolean>(false);
  const [currentTab, setCurrentTab] = useState<string>('assets');
  const { assetsByLocation } = useSelector((state) => state.assets);
  const { workOrdersByLocation } = useSelector((state) => state.workOrders);
  const { floorPlansByLocation } = useSelector((state) => state.floorPlans);
  const {
    hasEditPermission,
    hasDeletePermission,
    getFilteredFields,
    hasCreatePermission,
    hasFeature
  } = useAuth();
  const locationAssets = assetsByLocation[location.id] ?? [];
  const locationWorkOrders = workOrdersByLocation[location.id] ?? [];
  const floorPlans = floorPlansByLocation[location.id] ?? [];
  const theme = useTheme();
  const navigate = useNavigate();
  const tabs = [
    { value: 'assets', label: t('assets') },
    { value: 'files', label: t('files') },
    { value: 'workOrders', label: t('work_orders') },
    { value: 'floorPlans', label: t('floor_plans') },
    { value: 'people', label: t('people') }
  ];

  const fields: Array<IField> = [
    {
      name: 'name',
      type: 'text',
      label: t('name'),
      placeholder: t('floor_plan_name_description'),
      required: true
    },
    {
      name: 'area',
      type: 'number',
      label: t('area'),
      placeholder: t('Floor plan area in m²')
    },
    {
      name: 'image',
      type: 'file',
      fileType: 'image',
      label: 'Image',
      placeholder: t('upload_image')
    }
  ];
  const floorPlanShape = {
    name: Yup.string().required(t('required_floor_plan_name'))
  };

  useEffect(() => {
    dispatch(getAssetsByLocation(location.id));
    dispatch(getWorkOrdersByLocation(location.id));
    dispatch(getFloorPlans(location.id));
  }, [location]);

  const renderAddFloorPlanModal = () => (
    <Dialog
      fullWidth
      maxWidth="sm"
      open={openAddFloorPlan}
      onClose={() => setOpenAddFloorPlan(false)}
    >
      <FormDialogTitle
        title={t('add_floor_plan')}
        subtitle={t('add_floor_plan_description')}
        onClose={() => setOpenAddFloorPlan(false)}
      />
      <DialogContent
        dividers
        sx={{
          p: 3
        }}
      >
        <Box>
          <Form
            fields={getFilteredFields(fields)}
            validation={Yup.object().shape(floorPlanShape)}
            submitText={t('add_floor_plan')}
            values={{}}
            onChange={({ field, e }) => {}}
            onSubmit={async (values) => {
              return new Promise<void>((resolve, rej) => {
                uploadFiles([], values.image)
                  .then((files) => {
                    values = {
                      ...values,
                      image: files.length ? { id: files[0].id } : null
                    };
                    dispatch(createFloorPlan(location.id, values))
                      .then(() => setOpenAddFloorPlan(false))
                      .finally(resolve);
                  })
                  .catch((err) => {
                    rej(err);
                  });
              });
            }}
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
  const handleTabsChange = (_event: ChangeEvent<{}>, value: string): void => {
    setCurrentTab(value);
  };
  const canEditLocation = hasEditPermission(
    PermissionEntity.LOCATIONS,
    location
  );
  const canDeleteLocation = hasDeletePermission(
    PermissionEntity.LOCATIONS,
    location
  );
  const canCopyLocation = hasCreatePermission(PermissionEntity.LOCATIONS);
  const addButton = (label: string, onClick: () => void) => (
    <Button
      size="small"
      startIcon={<AddTwoToneIcon fontSize="small" />}
      onClick={onClick}
      sx={softButtonSx}
    >
      {label}
    </Button>
  );
  const emptyBody = (message: string) => (
    <CardBody sx={{ py: 3 }}>
      <Box sx={{ textAlign: 'center' }}>
        <MutedText>{message}</MutedText>
      </Box>
    </CardBody>
  );
  return (
    <DetailsPage>
      {renderAddFloorPlanModal()}
      <DetailsHeader
        title={location?.name}
        subtitle={
          location?.customId ? (
            <bdi>{`#${location.customId}`}</bdi>
          ) : undefined
        }
        description={location?.address}
        media={
          location.image ? (
            <DetailThumb
              src={location.image.url}
              alt={location?.name}
              size={80}
              onClick={() => window.open(location.image.url, '_blank')}
            />
          ) : undefined
        }
        actions={
          canEditLocation || canCopyLocation || canDeleteLocation ? (
            <>
              {canEditLocation && (
                <IconButton aria-label={t('edit')} onClick={handleOpenUpdate}>
                  <EditTwoToneIcon fontSize="small" color="primary" />
                </IconButton>
              )}
              {canCopyLocation && (
                <IconButton
                  aria-label={t('copy')}
                  onClick={() => onCopy(location)}
                >
                  <ContentCopyIcon fontSize="small" color="primary" />
                </IconButton>
              )}
              {canDeleteLocation && (
                <IconButton aria-label={t('delete')} onClick={handleOpenDelete}>
                  <DeleteTwoToneIcon fontSize="small" color="error" />
                </IconButton>
              )}
            </>
          ) : undefined
        }
      />
      <Tabs
        onChange={handleTabsChange}
        value={currentTab}
        variant="scrollable"
        scrollButtons="auto"
        textColor="primary"
        indicatorColor="primary"
        sx={{
          minHeight: 44,
          borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
          '& .MuiTab-root': { minHeight: 44, fontWeight: 600 }
        }}
      >
        {tabs.map((tab) => (
          <Tab key={tab.value} label={tab.label} value={tab.value} />
        ))}
      </Tabs>
      <Box>
        {currentTab === 'assets' && (
          <SectionCard
            title="assets"
            icon={<Inventory2TwoToneIcon fontSize="small" />}
            noPadding
            actions={
              hasCreatePermission(PermissionEntity.ASSETS)
                ? addButton(t('asset'), () =>
                    navigate(`/app/assets?location=${location.id}`)
                  )
                : undefined
            }
          >
            {locationAssets.length ? (
              <Box>
                {locationAssets.map((asset) => (
                  <DetailRow
                    key={asset.id}
                    onClick={() => navigate(getAssetUrl(asset.id))}
                  >
                    <DetailRowText
                      primary={asset.name}
                      secondary={getFormattedDate(asset.createdAt)}
                    />
                  </DetailRow>
                ))}
              </Box>
            ) : (
              emptyBody(t('no_asset_in_location'))
            )}
          </SectionCard>
        )}
        {currentTab === 'workOrders' && (
          <SectionCard
            title="work_orders"
            icon={<AssignmentTwoToneIcon fontSize="small" />}
            noPadding
            actions={
              hasCreatePermission(PermissionEntity.WORK_ORDERS)
                ? addButton(t('work_order'), () =>
                    navigate(`/app/work-orders?location=${location.id}`)
                  )
                : undefined
            }
          >
            {locationWorkOrders.length ? (
              <Box>
                {locationWorkOrders.map((workOrder) => (
                  <DetailRow
                    key={workOrder.id}
                    onClick={() => navigate(`/app/work-orders/${workOrder.id}`)}
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
              emptyBody(t('no_wo_in_location'))
            )}
          </SectionCard>
        )}
        {currentTab === 'files' && (
          <SectionCard
            title="files"
            icon={<AttachFileTwoToneIcon fontSize="small" />}
            noPadding
            actions={
              hasCreatePermission(PermissionEntity.FILES) &&
              hasFeature(PlanFeature.FILE)
                ? addButton(t('file'), handleOpenUpdate)
                : undefined
            }
          >
            {location.files.length ? (
              <Box>
                {location.files.map((file) => (
                  <DetailRow
                    key={file.id}
                    onClick={() => window.open(file.url, '_blank')}
                  >
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '10px',
                        display: 'grid',
                        placeItems: 'center',
                        flexShrink: 0,
                        color: theme.palette.primary.main,
                        backgroundColor: alpha(theme.palette.primary.main, 0.1)
                      }}
                    >
                      <InsertDriveFileTwoToneIcon fontSize="small" />
                    </Box>
                    <DetailRowText primary={file.name} />
                  </DetailRow>
                ))}
              </Box>
            ) : (
              emptyBody(t('no_file_in_location'))
            )}
          </SectionCard>
        )}
        {currentTab === 'floorPlans' && (
          <SectionCard
            title="floor_plans"
            icon={<MapTwoToneIcon fontSize="small" />}
            noPadding
            actions={
              canEditLocation
                ? addButton(t('floor_plan'), () => setOpenAddFloorPlan(true))
                : undefined
            }
          >
            {floorPlans.length ? (
              <Box>
                {floorPlans.map((floorPlan) => (
                  <DetailRow key={floorPlan.id}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '10px',
                        display: 'grid',
                        placeItems: 'center',
                        flexShrink: 0,
                        color: theme.palette.primary.main,
                        backgroundColor: alpha(theme.palette.primary.main, 0.1)
                      }}
                    >
                      <MapTwoToneIcon fontSize="small" />
                    </Box>
                    <DetailRowText
                      primary={floorPlan.name}
                      secondary={
                        floorPlan.area ? (
                          <bdi>{`${floorPlan.area} m²`}</bdi>
                        ) : undefined
                      }
                    />
                    <IconButton
                      size="small"
                      onClick={() => {
                        if (
                          window.confirm(
                            t(
                              "Are you sure you want to delete this Floor Plan. It can't be undone"
                            )
                          )
                        ) {
                          dispatch(deleteFloorPlan(location.id, floorPlan.id));
                        }
                      }}
                    >
                      <DeleteTwoToneIcon fontSize="small" color="error" />
                    </IconButton>
                  </DetailRow>
                ))}
              </Box>
            ) : (
              emptyBody(t('no_floor_plan_in_location'))
            )}
          </SectionCard>
        )}
        {currentTab === 'people' && (
          <SectionCard
            title="people"
            icon={<PeopleAltTwoToneIcon fontSize="small" />}
          >
            <DetailGrid>
              <DetailItem label={t('assigned_to')}>
                <LinkPills
                  items={location.workers.map((worker) => ({
                    key: worker.id,
                    href: `/app/people-teams/people/${worker.id}`,
                    label: `${worker.firstName} ${worker.lastName}`
                  }))}
                />
              </DetailItem>
              <DetailItem label={t('assigned_teams')}>
                <LinkPills
                  items={location.teams.map((team) => ({
                    key: team.id,
                    href: `/app/people-teams/teams/${team.id}`,
                    label: team.name
                  }))}
                />
              </DetailItem>
              <DetailItem label={t('assigned_customers')}>
                <LinkPills
                  items={location.customers.map((customer) => ({
                    key: customer.id,
                    href: `/app/vendors-customers/customers/${customer.id}`,
                    label: customer.name
                  }))}
                />
              </DetailItem>
              <DetailItem label={t('assigned_vendors')}>
                <LinkPills
                  items={location.vendors.map((vendor) => ({
                    key: vendor.id,
                    href: `/app/vendors-customers/vendors/${vendor.id}`,
                    label: vendor.companyName
                  }))}
                />
              </DetailItem>
            </DetailGrid>
          </SectionCard>
        )}
      </Box>
    </DetailsPage>
  );
}
