import {
  Box,
  Button,
  Card,
  Divider,
  Grid,
  IconButton,
  Link,
  Stack,
  styled,
  Typography,
  useTheme
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { AssetDTO } from '../../../../models/owns/asset';
import { UserMiniDTO } from '../../../../models/user';
import { Customer } from '../../../../models/owns/customer';
import { Vendor } from '../../../../models/owns/vendor';
import Team, { TeamMiniDTO } from '../../../../models/owns/team';
import {
  getCustomerUrl,
  getTeamUrl,
  getUserUrl,
  getVendorUrl
} from '../../../../utils/urlPaths';
import { useContext } from 'react';
import { useDispatch } from '../../../../store';
import { editAsset } from '../../../../slices/asset';
import { CompanySettingsContext } from '../../../../contexts/CompanySettingsContext';
import AssetStatusSelect from '../components/AssetStatusSelect';
import Loading from '../../Analytics/Loading';
import { PermissionEntity } from '../../../../models/owns/role';
import SplitButton from '../../components/SplitButton';
import AddTwoToneIcon from '@mui/icons-material/AddTwoTone';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { PlanFeature } from '../../../../models/owns/subscriptionPlan';
import * as React from 'react';
import useAuth from '../../../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { getCustomFieldValuesForDetails } from '../../type';
import { QRCodeSVG } from 'qrcode.react';
import { alpha } from '@mui/material/styles';
import SectionCard from '../../components/SectionCard';
import { SoftChip } from '../../components/StatusChip';
import {
  DetailGrid,
  DetailItem,
  DetailsHeader,
  DetailsPage,
  DetailThumb
} from '../../components/DetailsKit';
import InfoTwoToneIcon from '@mui/icons-material/InfoTwoTone';
import PeopleAltTwoToneIcon from '@mui/icons-material/PeopleAltTwoTone';
import NotesTwoToneIcon from '@mui/icons-material/NotesTwoTone';
import QrCode2TwoToneIcon from '@mui/icons-material/QrCode2TwoTone';

interface PropsType {
  asset: AssetDTO;
  loading: boolean;
  onCopy?: () => void;
}
const downloadQRCode = (value: string) => {
  const svgElement = document.getElementById(`qr-code-${value}`);
  if (!svgElement) return;

  const svgData = new XMLSerializer().serializeToString(svgElement);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const img = new Image();

  canvas.width = 120;
  canvas.height = 120;

  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  img.onload = () => {
    ctx?.drawImage(img, 0, 0);
    URL.revokeObjectURL(url);

    const pngUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = pngUrl;
    link.download = `qr-code-${value}.png`;
    link.click();
  };

  img.src = url;
};
const AssetDetails = ({ asset, loading, onCopy }: PropsType) => {
  const { t }: { t: any } = useTranslation();
  const theme = useTheme();
  const { hasCreatePermission, hasEditPermission } = useAuth();
  const navigate = useNavigate();
  const { getFormattedDate, getFormattedCurrency } = useContext(
    CompanySettingsContext
  );
  const dispatch = useDispatch();
  const informationFields = [
    { label: t('name'), value: asset?.name },
    { label: t('description'), value: asset?.description },
    { label: t('category'), value: asset?.category?.name },
    { label: t('model'), value: asset?.model },
    { label: t('serial_number'), value: asset?.serialNumber },
    { label: t('power'), value: asset?.power },
    { label: t('manufacturer'), value: asset?.manufacturer },
    {
      label: t('acquisition_cost'),
      value: asset?.acquisitionCost
        ? getFormattedCurrency(asset?.acquisitionCost)
        : null
    },
    { label: t('area'), value: asset?.area },
    { label: t('barcode'), value: asset?.barCode, barcode: true }
  ];
  const moreInfosFields = [
    {
      label: t('additional_information'),
      value: asset?.additionalInfos
    },
    {
      label: t('placed_in_service'),
      value: getFormattedDate(asset?.inServiceDate)
    },
    {
      label: t('warranty_expiration'),
      value: getFormattedDate(asset?.warrantyExpirationDate)
    },
    ...getCustomFieldValuesForDetails(
      asset?.customFieldValues,
      getFormattedDate
    )
  ];
  const BasicField = ({
    label,
    value
  }: {
    label: string | number;
    value: string | number;
    barcode?: boolean;
  }) => <DetailItem label={label} value={value} />;
  const ListField = <T extends { id: number }>({
    values,
    label,
    getHref,
    getValueLabel
  }: {
    values: T[];
    label: string;
    getHref: (value: T) => string;
    getValueLabel: (value: T) => string;
  }) => {
    return (
      <DetailItem label={label}>
        {values?.length ? (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {values.map((value) => (
              <Link
                key={value.id}
                href={getHref(value)}
                underline="none"
                sx={{
                  px: 1.25,
                  py: 0.25,
                  borderRadius: '20px',
                  fontSize: 13,
                  fontWeight: 600,
                  color: theme.palette.primary.dark,
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.16)
                  }
                }}
              >
                {getValueLabel(value)}
              </Link>
            ))}
          </Box>
        ) : null}
      </DetailItem>
    );
  };
  if (loading)
    return (
      <Box
        sx={{
          height: '50vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <Loading />
      </Box>
    );
  const barcodeValue = asset?.barCode;
  return (
    <DetailsPage dense>
      <Box
        sx={{
          p: { xs: 2, sm: 2.5 },
          borderRadius: '14px',
          border: `1px solid ${alpha(theme.palette.primary.main, 0.18)}`,
          backgroundColor: theme.palette.background.paper,
          boxShadow: `0 6px 18px ${alpha(theme.palette.primary.main, 0.06)}`,
          '& > div': { pb: 0, borderBottom: 'none' }
        }}
      >
        <DetailsHeader
          subtitle={
            asset?.customId ? <bdi>{`#${asset.customId}`}</bdi> : undefined
          }
          title={asset?.name}
          media={
            asset?.image ? (
              <DetailThumb
                src={asset.image.url}
                alt={asset?.name}
                size={88}
                onClick={() => window.open(asset.image.url, '_blank')}
              />
            ) : undefined
          }
          chips={
            asset ? (
              <>
                <AssetStatusSelect
                  value={asset.status}
                  onChange={(status) =>
                    dispatch(editAsset(asset.id, { ...asset, status }))
                  }
                  disabled={!hasEditPermission(PermissionEntity.ASSETS, asset)}
                />
                {asset.category?.name && (
                  <SoftChip tone="neutral" label={asset.category.name} />
                )}
              </>
            ) : undefined
          }
          actions={
            hasCreatePermission(PermissionEntity.ASSETS) ? (
              <IconButton aria-label={t('copy_asset')} onClick={onCopy}>
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            ) : undefined
          }
          cta={
            hasCreatePermission(PermissionEntity.WORK_ORDERS) ? (
              <Button
                onClick={() => navigate(`/app/work-orders?asset=${asset.id}`)}
                startIcon={<AddTwoToneIcon />}
                variant={'contained'}
                sx={{
                  borderRadius: '12px',
                  fontWeight: 700,
                  boxShadow: `0 6px 16px ${alpha(
                    theme.palette.primary.main,
                    0.28
                  )}`
                }}
              >
                {t('work_order')}
              </Button>
            ) : undefined
          }
          description={asset?.description}
        />
      </Box>
      <Grid container spacing={2.5}>
        <Grid item xs={12} md={barcodeValue ? 8 : 12}>
          <Stack spacing={2.5}>
            <SectionCard
              title="asset_information"
              icon={<InfoTwoToneIcon fontSize="small" />}
            >
              <DetailGrid>
                {informationFields
                  .filter((field) => field.label !== t('description'))
                  .map((field) => (
                    <BasicField key={field.label} {...field} />
                  ))}
                <DetailItem label={t('location')}>
                  {asset?.location ? (
                    <Link
                      href={`/app/locations/${asset.location.id}`}
                      underline="hover"
                    >
                      {asset.location.name}
                    </Link>
                  ) : null}
                </DetailItem>
              </DetailGrid>
            </SectionCard>
            <SectionCard
              title="details_assignment"
              icon={<PeopleAltTwoToneIcon fontSize="small" />}
            >
              <DetailGrid>
                <DetailItem label={t('primary_worker')}>
                  {asset?.primaryUser ? (
                    <Link
                      key={asset.primaryUser.id}
                      href={`/app/people-teams/people/${asset.primaryUser.id}`}
                      underline="hover"
                    >
                      {`${asset.primaryUser.firstName} ${asset.primaryUser.lastName}`}
                    </Link>
                  ) : null}
                </DetailItem>
                <ListField
                  values={asset?.assignedTo}
                  label={t('assigned_to')}
                  getHref={(user: UserMiniDTO) => getUserUrl(user.id)}
                  getValueLabel={(user: UserMiniDTO) =>
                    `${user.firstName} ${user.lastName}`
                  }
                />
                <ListField
                  values={asset?.teams}
                  label={t('teams')}
                  getHref={(team: TeamMiniDTO) => getTeamUrl(team.id)}
                  getValueLabel={(team: TeamMiniDTO) => team.name}
                />
                <ListField
                  values={asset?.customers}
                  label={t('customers')}
                  getHref={(customer: Customer) => getCustomerUrl(customer.id)}
                  getValueLabel={(customer: Customer) => customer.name}
                />
                <ListField
                  values={asset?.vendors}
                  label={t('vendors')}
                  getHref={(vendor: Vendor) => getVendorUrl(vendor.id)}
                  getValueLabel={(vendor: Vendor) => vendor.companyName}
                />
              </DetailGrid>
            </SectionCard>
            <SectionCard
              title="more_informations"
              icon={<NotesTwoToneIcon fontSize="small" />}
            >
              <DetailGrid>
                {moreInfosFields.map((field) => (
                  <BasicField key={field.label} {...field} />
                ))}
              </DetailGrid>
            </SectionCard>
          </Stack>
        </Grid>
        {barcodeValue && (
          <Grid item xs={12} md={4}>
            <SectionCard
              title="barcode"
              icon={<QrCode2TwoToneIcon fontSize="small" />}
            >
              <Stack alignItems="center" spacing={1.5}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: '12px',
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.18)}`,
                    backgroundColor: theme.palette.common.white,
                    lineHeight: 0
                  }}
                >
                  <QRCodeSVG
                    id={`qr-code-${barcodeValue}`}
                    value={barcodeValue.toString()}
                    size={120}
                    level="H"
                    onClick={() => {
                      downloadQRCode(barcodeValue.toString());
                    }}
                    style={{ cursor: 'pointer' }}
                  />
                </Box>
                <Typography
                  sx={{ fontWeight: 600, fontSize: 14, wordBreak: 'break-all' }}
                >
                  <bdi>{barcodeValue}</bdi>
                </Typography>
                <Typography
                  sx={{ color: 'text.secondary', fontSize: 12.5 }}
                >
                  {t('details_qr_download_hint')}
                </Typography>
              </Stack>
            </SectionCard>
          </Grid>
        )}
      </Grid>
    </DetailsPage>
  );
};

export default AssetDetails;
