import { useTranslation } from 'react-i18next';
import { getPriorityLabel } from '../../../utils/formatters';
import { SoftChip, SoftChipTone } from './StatusChip';

export const priorityTone = (priority: string): SoftChipTone => {
  switch (priority) {
    case 'HIGH':
      return 'error';
    case 'MEDIUM':
      return 'warning';
    case 'LOW':
      return 'info';
    default:
      return 'neutral';
  }
};

export default function PriorityWrapper(props: {
  priority: string | null;
  withSuffix?: boolean;
  size?: 'small' | 'medium';
}) {
  const { priority, withSuffix, size } = props;
  const { t }: { t: any } = useTranslation();
  if (!priority) return null;
  const label = getPriorityLabel(priority, t) ?? t(priority);
  return (
    <SoftChip
      tone={priorityTone(priority)}
      size={size}
      label={withSuffix ? `${label} ${t('priority')}` : label}
    />
  );
}
