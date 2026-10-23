import { Link } from '@mui/material';
import { DetailItem } from './DetailsKit';
import { getPriorityLabel } from '../../../utils/formatters';
import { useTranslation } from 'react-i18next';
import { HijriSuffix } from './DualDate';

interface BasicFieldProps {
  label: string | number;
  value: string | number;
  isPriority?: boolean;
  isLink?: boolean;
  id?: number;
  type?: 'location' | 'asset' | 'team' | 'vendor';
  linkPrefix?: string;
  /** Raw date of the value; when set, a muted Hijri date is appended (if enabled). */
  hijriDate?: string | null;
}

const BasicField: React.FC<BasicFieldProps> = ({
  label,
  value,
  isPriority,
  isLink,
  id,
  type,
  linkPrefix,
  hijriDate
}) => {
  const { t } = useTranslation();
  if (!value) return null;

  const getHref = () => {
    if (type === 'vendor' && id) {
      return `/app/vendors-customers/vendors/${id}`;
    }
    if (type && id) {
      return `/app/${type}s/${id}`;
    }
    if (isLink) {
      const href = value.toString().startsWith('http')
        ? value.toString()
        : `https://${value}`;
      return href;
    }
    return undefined;
  };

  const href = getHref();

  const renderValue = () => {
    if (isPriority) {
      return getPriorityLabel(value.toString(), t);
    }
    return value;
  };

  if (href) {
    const isExternal = isLink || (type === 'vendor' && id);
    return (
      <DetailItem label={label}>
        <Link
          href={href}
          underline="hover"
          sx={{ fontWeight: 600 }}
          target={isExternal && isLink ? '_blank' : undefined}
          rel={isExternal && isLink ? 'noopener noreferrer' : undefined}
        >
          {renderValue()}
        </Link>
      </DetailItem>
    );
  }

  return (
    <DetailItem label={label}>
      {renderValue()}
      {hijriDate && <HijriSuffix date={hijriDate} />}
    </DetailItem>
  );
};

export default BasicField;
