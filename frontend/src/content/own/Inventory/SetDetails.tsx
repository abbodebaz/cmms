import {
  Box,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  useTheme
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import SetType from '../../../models/owns/setType';
import HandymanTwoToneIcon from '@mui/icons-material/HandymanTwoTone';
import AttachMoneyTwoToneIcon from '@mui/icons-material/AttachMoneyTwoTone';
import { useContext } from 'react';
import { CompanySettingsContext } from '../../../contexts/CompanySettingsContext';
import useAuth from '../../../hooks/useAuth';
import { PermissionEntity } from '../../../models/owns/role';
import { alpha } from '@mui/material/styles';
import SectionCard from '../components/SectionCard';
import { SoftChip } from '../components/StatusChip';
import {
  DetailRow,
  DetailRowText,
  DetailsHeader,
  DetailsPage,
  EmptyCardBody
} from '../components/DetailsKit';

interface PartDetailsProps {
  set: SetType;
  handleOpenUpdate: () => void;
  handleOpenDelete: () => void;
}
export default function SetDetails(props: PartDetailsProps) {
  const { set, handleOpenUpdate, handleOpenDelete } = props;
  const { t }: { t: any } = useTranslation();
  const theme = useTheme();
  const { hasEditPermission, hasDeletePermission } = useAuth();
  const { getFormattedCurrency } = useContext(CompanySettingsContext);
  const { getFormattedDate } = useContext(CompanySettingsContext);

  const canEditSet = hasEditPermission(PermissionEntity.PARTS_AND_MULTIPARTS, set);
  const canDeleteSet = hasDeletePermission(
    PermissionEntity.PARTS_AND_MULTIPARTS,
    set
  );
  return (
    <DetailsPage>
      <DetailsHeader
        subtitle={set?.createdAt ? getFormattedDate(set?.createdAt) : undefined}
        title={set?.name}
        chips={
          <SoftChip
            tone="primary"
            size="medium"
            label={`${set?.parts.length ?? 0} ${t('parts')}`}
          />
        }
        actions={
          canEditSet || canDeleteSet ? (
            <>
              {canEditSet && (
                <IconButton aria-label={t('edit')} onClick={handleOpenUpdate}>
                  <EditTwoToneIcon fontSize="small" color="primary" />
                </IconButton>
              )}
              {canDeleteSet && (
                <IconButton aria-label={t('delete')} onClick={handleOpenDelete}>
                  <DeleteTwoToneIcon fontSize="small" color="error" />
                </IconButton>
              )}
            </>
          ) : undefined
        }
      />
      <SectionCard
        title="parts"
        icon={<HandymanTwoToneIcon fontSize="small" />}
        noPadding
      >
        {set?.parts.length ? (
          <Box>
            {set?.parts.map((part) => (
              <DetailRow key={part.id}>
                <DetailRowText
                  primary={part.name}
                  secondary={part.description}
                />
                <Typography
                  sx={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap' }}
                >
                  {getFormattedCurrency(part.cost)}
                </Typography>
              </DetailRow>
            ))}
            <DetailRow
              sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.04) }}
            >
              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <AttachMoneyTwoToneIcon fontSize="small" color="primary" />
                <Typography sx={{ fontWeight: 700, fontSize: 14 }}>
                  {t('total_cost')}
                </Typography>
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: 14 }}>
                {getFormattedCurrency(
                  set?.parts.reduce((acc, part) => acc + part.cost, 0)
                )}
              </Typography>
            </DetailRow>
          </Box>
        ) : (
          <EmptyCardBody message="—" />
        )}
      </SectionCard>
    </DetailsPage>
  );
}
