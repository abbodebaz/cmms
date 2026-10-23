import { useContext } from 'react';
import { Box } from '@mui/material';
import { CompanySettingsContext } from '../../../contexts/CompanySettingsContext';
import useAuth from '../../../hooks/useAuth';
import useHijriPreference from '../../../hooks/useHijriPreference';
import { formatHijri } from '../../../utils/locale';

/** Muted " · <Hijri date>" suffix; renders nothing when Hijri is off or the date is empty. */
export const HijriSuffix = ({ date }: { date?: string | Date | null }) => {
  const { companySettings } = useAuth();
  const [showHijri] = useHijriPreference();
  if (!showHijri || !date) return null;
  const hijri = formatHijri(
    date,
    companySettings?.generalPreferences?.timeZone
  );
  if (!hijri) return null;
  return (
    <Box
      component="span"
      sx={{
        color: 'text.secondary',
        fontWeight: 'normal',
        fontSize: '0.85em',
        whiteSpace: 'nowrap',
        display: 'inline-block'
      }}
    >
      <Box component="span" sx={{ mx: 0.75, opacity: 0.6 }}>
        ·
      </Box>
      {hijri}
    </Box>
  );
};

interface DualDateProps {
  date?: string | null;
  hideTime?: boolean;
}

/** Renders "Gregorian · Hijri" (Hijri part muted, optional per user preference). */
const DualDate = ({ date, hideTime }: DualDateProps) => {
  const { getFormattedDate } = useContext(CompanySettingsContext);
  if (!date) return null;
  return (
    <>
      <bdi>{getFormattedDate(date, hideTime)}</bdi>
      <HijriSuffix date={date} />
    </>
  );
};

export default DualDate;
