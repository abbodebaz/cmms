import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Card,
  Checkbox,
  FormControlLabel,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Popover,
  useTheme
} from '@mui/material';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import useDateLocale from '../../../hooks/useDateLocale';
import useAuth from '../../../hooks/useAuth';
import BusinessTwoToneIcon from '@mui/icons-material/BusinessTwoTone';

interface OwnProps {
  start: Date;
  end: Date;
  setStart: (date: Date) => void;
  setEnd: (date: Date) => void;
  companyId?: number;
  onCompanyChange?: (companyId: number | undefined) => void;
}

export default function ({
  start,
  end,
  setEnd,
  setStart,
  companyId,
  onCompanyChange
}: OwnProps) {
  const { t }: { t: any } = useTranslation();
  const { user } = useAuth();
  const anchorRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);
  const theme = useTheme();
  const dateLocale = useDateLocale();

  const [state, setState] = useState([
    {
      startDate: start,
      endDate: end,
      key: 'selection'
    }
  ]);

  useEffect(() => {
    setState([
      {
        startDate: start,
        endDate: end,
        key: 'selection'
      }
    ]);
  }, [start, end]);

  const handleSelect = (ranges: any) => {
    const selection = ranges.selection;
    setStart(selection.startDate);
    setEnd(selection.endDate);
    setState([selection]);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleCompanyChange = (id: number) => {
    if (companyId === id) {
      onCompanyChange?.(undefined);
    } else {
      onCompanyChange?.(id);
    }
    handleCloseMenu();
  };

  const isSuperUser = user?.superAccountRelations?.length > 0;
  const selectedName = companyId
    ? user?.superAccountRelations?.find(
        (rel) => rel.childCompanyId === companyId
      )?.childCompanyName
    : null;

  // Day-first display (Saudi localization)
  const displayStartDate = start
    ? format(start, 'dd MMM yyyy', { locale: dateLocale })
    : '';
  const displayEndDate = end
    ? format(end, 'dd MMM yyyy', { locale: dateLocale })
    : '';

  return (
    <>
      <Card sx={{ display: 'flex', p: 2, justifyContent: 'center' }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            sx={{ width: 250 }}
            value={`${displayStartDate} ${t('to')} ${displayEndDate}`}
            onClick={handleOpen}
            InputProps={{
              readOnly: true
            }}
            ref={anchorRef}
          />
          {isSuperUser && (
            <>
              <Button
                onClick={handleOpenMenu}
                sx={{
                  '& .MuiButton-startIcon': { margin: '0px' },
                  minWidth: 0
                }}
                variant={selectedName ? 'contained' : 'outlined'}
                startIcon={<BusinessTwoToneIcon />}
                size={'large'}
              >
                {selectedName ?? t('all_companies')}
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={openMenu}
                onClose={handleCloseMenu}
              >
                {user.superAccountRelations.map((relation) => {
                  const isChecked = companyId === relation.childCompanyId;
                  return (
                    <MenuItem
                      key={relation.childCompanyId}
                      onClick={() =>
                        handleCompanyChange(relation.childCompanyId)
                      }
                    >
                      <FormControlLabel
                        control={<Checkbox checked={isChecked} />}
                        label={relation.childCompanyName}
                        onClick={(e) => e.preventDefault()}
                      />
                    </MenuItem>
                  );
                })}
              </Menu>
            </>
          )}
        </Stack>
      </Card>
      <Popover
        open={open}
        anchorEl={anchorRef.current}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left'
        }}
      >
        <DateRange
          ranges={state}
          onChange={handleSelect}
          months={2}
          locale={dateLocale}
          weekStartsOn={0}
          direction="horizontal"
          rangeColors={[theme.palette.primary.main]}
        />
      </Popover>
    </>
  );
}
