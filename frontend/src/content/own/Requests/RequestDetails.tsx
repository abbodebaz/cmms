import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  Link,
  MenuItem,
  Select,
  Stack,
  Typography,
  useTheme
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import CheckTwoToneIcon from '@mui/icons-material/CheckTwoTone';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import ClearTwoToneIcon from '@mui/icons-material/ClearTwoTone';
import Request from '../../../models/owns/request';
import { getPriorityLabel } from '../../../utils/formatters';
import { useDispatch } from '../../../store';
import {
  approveRequest,
  cancelRequest,
  editRequest
} from '../../../slices/request';
import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAssetUrl,
  getLocationUrl,
  getTeamUrl,
  getUserUrl
} from '../../../utils/urlPaths';
import useAuth from '../../../hooks/useAuth';
import { PermissionEntity } from '../../../models/owns/role';
import ImageViewer from 'react-simple-image-viewer';
import { CompanySettingsContext } from '../../../contexts/CompanySettingsContext';
import FilesList from '../components/FilesList';
import RequestCancellationModal from './RequestCancellationModal';
import BasicField from '../components/BasicField';
import { editAsset } from '../../../slices/asset';
import { AssetStatus, assetStatuses } from '../../../models/owns/asset';
import { getCustomFieldValuesForDetails } from '../type';
import { alpha } from '@mui/material/styles';
import SectionCard from '../components/SectionCard';
import { SoftChip } from '../components/StatusChip';
import PriorityWrapper from '../components/PriorityWrapper';
import {
  DetailGrid,
  DetailItem,
  DetailsHeader,
  DetailsPage,
  DetailThumb,
  primaryButtonSx
} from '../components/DetailsKit';
import InfoTwoToneIcon from '@mui/icons-material/InfoTwoTone';
import AttachFileTwoToneIcon from '@mui/icons-material/AttachFileTwoTone';
import Inventory2TwoToneIcon from '@mui/icons-material/Inventory2TwoTone';

interface RequestDetailsProps {
  request: Request;
  handleOpenUpdate: () => void;
  handleOpenDelete: () => void;
  onClose: () => void;
}

export default function RequestDetails({
  request,
  handleOpenUpdate,
  handleOpenDelete,
  onClose
}: RequestDetailsProps) {
  const [approving, setApproving] = useState<boolean>(false);
  const { t }: { t: any } = useTranslation();
  const dispatch = useDispatch();
  const theme = useTheme();
  const [showAssetStatuses, setShowAssetStatuses] = useState<boolean>(false);
  const [selectedAssetStatus, setSelectedAssetStatus] = useState<AssetStatus>(
    'INSPECTION_SCHEDULED'
  );
  const {
    hasEditPermission,
    hasDeletePermission,
    hasViewPermission,
    hasCreatePermission,
    user
  } = useAuth();
  const navigate = useNavigate();
  const { getFormattedDate, getUserNameById } = useContext(
    CompanySettingsContext
  );
  const [isImageViewerOpen, setIsImageViewerOpen] = useState<boolean>(false);
  const [openCancellationModal, setOpenCancellationModal] =
    useState<boolean>(false);
  const onApprove = () => {
    setApproving(true);
    dispatch(
      approveRequest(request.id, request.asset ? selectedAssetStatus : null)
    )
      .then((workOrderId) => {
        navigate(`/app/work-orders/${workOrderId}`);
      })
      .finally(() => setApproving(false));
  };

  const fieldsToRender = (
    request: Request
  ): { label: string; value: string | number }[] => [
    {
      label: t('contact'),
      value: request.contact
    },
    {
      label: t('description'),
      value: request.description
    },
    {
      label: t('id'),
      value: request.customId
    },
    {
      label: t('priority'),
      value: request.priority
    },
    {
      label: t('due_date'),
      value: getFormattedDate(request.dueDate)
    },
    {
      label: t('estimated_start_date'),
      value: getFormattedDate(request.estimatedStartDate)
    },
    {
      label: t('estimated_duration'),
      value: !!request.estimatedDuration
        ? t('estimated_hours_in_text', { hours: request.estimatedDuration })
        : null
    },
    {
      label: t('category'),
      value: request.category?.name
    },
    {
      label: t('feedback'),
      value: request.cancellationReason
    },
    {
      label: t('created_at'),
      value: getFormattedDate(request.createdAt)
    },
    ...getCustomFieldValuesForDetails(
      request.customFieldValues,
      getFormattedDate
    )
  ];
  const canEditRequest =
    !request.cancelled && hasEditPermission(PermissionEntity.REQUESTS, request);
  const canDeleteRequest = hasDeletePermission(
    PermissionEntity.REQUESTS,
    request
  );
  const canReview =
    !request.workOrder &&
    !request.cancelled &&
    (hasViewPermission(PermissionEntity.SETTINGS) ||
      user.role.code === 'LIMITED_ADMIN') &&
    hasCreatePermission(PermissionEntity.WORK_ORDERS);
  const approveIcon = approving ? (
    <CircularProgress size="1rem" color="inherit" />
  ) : (
    <CheckTwoToneIcon />
  );
  return (
    <DetailsPage>
      <DetailsHeader
        subtitle={
          request?.customId ? <bdi>{`#${request.customId}`}</bdi> : undefined
        }
        title={request?.title}
        media={
          request.image ? (
            <DetailThumb
              src={request.image.url}
              alt={request?.title}
              size={80}
              onClick={() => setIsImageViewerOpen(true)}
            />
          ) : undefined
        }
        chips={
          <>
            {request.cancelled ? (
              <SoftChip tone="error" size="medium" label={t('cancelled')} />
            ) : request.workOrder ? (
              <SoftChip tone="success" size="medium" label={t('approved')} />
            ) : (
              <SoftChip tone="warning" size="medium" label={t('pending')} />
            )}
            {request.priority && request.priority !== 'NONE' && (
              <PriorityWrapper
                priority={request.priority}
                withSuffix
                size="medium"
              />
            )}
          </>
        }
        actions={
          canEditRequest || canDeleteRequest ? (
            <>
              {canEditRequest && (
                <IconButton aria-label={t('edit')} onClick={handleOpenUpdate}>
                  <EditTwoToneIcon fontSize="small" color="primary" />
                </IconButton>
              )}
              {canDeleteRequest && (
                <IconButton aria-label={t('delete')} onClick={handleOpenDelete}>
                  <DeleteTwoToneIcon fontSize="small" color="error" />
                </IconButton>
              )}
            </>
          ) : undefined
        }
        description={request?.description}
      />
      {!showAssetStatuses ? (
        canReview && (
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
              startIcon={<ClearTwoToneIcon />}
              onClick={() => setOpenCancellationModal(true)}
              variant="outlined"
              color="error"
              sx={{ borderRadius: '12px', fontWeight: 700 }}
            >
              {t('reject')}
            </Button>
            <Button
              startIcon={approveIcon}
              onClick={() => {
                if (request.asset) setShowAssetStatuses(true);
                else onApprove();
              }}
              variant="contained"
              sx={primaryButtonSx}
            >
              {t('approve')}
            </Button>
          </Box>
        )
      ) : (
        <SectionCard
          title="asset_status"
          icon={<Inventory2TwoToneIcon fontSize="small" />}
        >
          <Stack spacing={2}>
            <Select
              size="small"
              value={selectedAssetStatus}
              sx={{ borderRadius: '10px', maxWidth: 360 }}
              onChange={(event) => {
                setSelectedAssetStatus(event.target.value as AssetStatus);
              }}
            >
              {assetStatuses.map((assetStatusConfig) => (
                <MenuItem
                  key={assetStatusConfig.status}
                  value={assetStatusConfig.status}
                >
                  {t(assetStatusConfig.status)}
                </MenuItem>
              ))}
            </Select>
            <Stack direction={'row'} spacing={1.5} justifyContent="flex-end">
              <Button
                onClick={() => setShowAssetStatuses(false)}
                variant={'outlined'}
                sx={{ borderRadius: '12px', fontWeight: 700 }}
              >
                {t('go_back')}
              </Button>
              <Button
                startIcon={approveIcon}
                variant={'contained'}
                onClick={onApprove}
                sx={primaryButtonSx}
              >
                {t('approve')}
              </Button>
            </Stack>
          </Stack>
        </SectionCard>
      )}
      {request.requestPortal && (
        <Alert severity={'info'} sx={{ borderRadius: '12px' }}>
          {t('requested_from_portal')}{' '}
          {
            <Link
              href={`/app/settings/features/request-portals/${request.requestPortal.id}`}
            >
              {request.requestPortal.title}
            </Link>
          }
        </Alert>
      )}
      <SectionCard
        title="request_details"
        icon={<InfoTwoToneIcon fontSize="small" />}
      >
        <DetailGrid>
          {fieldsToRender(request)
            .filter((field) => field.label !== t('description'))
            .map((field) => (
              <BasicField
                key={field.label}
                label={field.label}
                value={field.value}
                isPriority={field.label === t('priority')}
                {...field}
              />
            ))}
          {request?.createdBy && (
            <DetailItem label={t('requested_by')}>
              <Link href={getUserUrl(request.createdBy)} underline="hover">
                {getUserNameById(request.createdBy)}
              </Link>
            </DetailItem>
          )}
          {request?.asset && (
            <DetailItem label={t('asset')}>
              <Link href={getAssetUrl(request.asset.id)} underline="hover">
                {request.asset.name}
              </Link>
            </DetailItem>
          )}
          {request?.location && (
            <DetailItem label={t('location')}>
              <Link href={getLocationUrl(request.location.id)} underline="hover">
                {request.location.name}
              </Link>
            </DetailItem>
          )}
          {request?.primaryUser && (
            <DetailItem label={t('assigned_to')}>
              <Link href={getUserUrl(request.primaryUser.id)} underline="hover">
                {`${request.primaryUser.firstName} ${request.primaryUser.lastName}`}
              </Link>
            </DetailItem>
          )}
          {request?.team && (
            <DetailItem label={t('team')}>
              <Link href={getTeamUrl(request.team.id)} underline="hover">
                {request.team.name}
              </Link>
            </DetailItem>
          )}
        </DetailGrid>
      </SectionCard>
      {!!request.files.length && (
        <SectionCard
          title="files"
          icon={<AttachFileTwoToneIcon fontSize="small" />}
          noPadding
        >
          <FilesList
            confirmMessage={t(
              'Are you sure you want to remove this file from this Request ?'
            )}
            removeDisabled={!hasEditPermission(PermissionEntity.REQUESTS, request)}
            files={request.files}
            onRemove={(id: number) => {
              dispatch(
                editRequest(request.id, {
                  ...request,
                  files: request.files.filter((f) => f.id !== id)
                })
              );
            }}
          />
        </SectionCard>
      )}
      {isImageViewerOpen && (
        <div style={{ zIndex: 100 }}>
          <ImageViewer
            src={[request.image.url]}
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
      <RequestCancellationModal
        requestId={request.id}
        open={openCancellationModal}
        onClose={() => setOpenCancellationModal(false)}
        onCancel={() => {
          setOpenCancellationModal(false);
          onClose();
        }}
      />
    </DetailsPage>
  );
}
