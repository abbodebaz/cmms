import {
  Box,
  CircularProgress,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Typography,
  useTheme
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import React, { useContext, useEffect, useState } from 'react';
import { getWorkOrderUrl } from '../../../utils/urlPaths';
import { CompanySettingsContext } from '../../../contexts/CompanySettingsContext';
import api from '../../../utils/api';
import { useNavigate } from 'react-router-dom';
import { WorkOrderMini } from '../../../models/owns/workOrder';
import StatusChip from '../components/StatusChip';
import SectionCard from '../components/SectionCard';
import {
  CardLoading,
  DetailRow,
  DetailRowText,
  EmptyCardBody
} from '../components/DetailsKit';
import AssignmentTwoToneIcon from '@mui/icons-material/AssignmentTwoTone';

const RecentWorkOrders = ({ pmId }: { pmId: number }) => {
  const { t }: { t: any } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const { getFormattedDate } = useContext(CompanySettingsContext);
  const [workOrders, setWorkOrders] = useState<WorkOrderMini[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchRecentWorkOrders = async () => {
      try {
        const response = await api.get<WorkOrderMini[]>(
          `preventive-maintenances/${pmId}/recent-work-orders`
        );
        setWorkOrders(response);
      } catch (error) {
        console.error('Failed to fetch recent work orders:', error);
      } finally {
        setLoading(false);
      }
    };

    if (pmId) {
      setLoading(true);
      fetchRecentWorkOrders();
    }
  }, [pmId]);

  return (
    <SectionCard
      title="recent_work_orders"
      icon={<AssignmentTwoToneIcon fontSize="small" />}
      noPadding
    >
      {loading ? (
        <CardLoading />
      ) : workOrders.length > 0 ? (
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
        <EmptyCardBody message={t('no_recent_work_orders')} />
      )}
    </SectionCard>
  );
};

export default RecentWorkOrders;
