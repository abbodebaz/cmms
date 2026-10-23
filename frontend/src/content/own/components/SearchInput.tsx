import { InputAdornment, TextField } from '@mui/material';
import { alpha } from '@mui/material/styles';
import SearchTwoToneIcon from '@mui/icons-material/SearchTwoTone';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

interface OwnProps {
  onChange: (event) => void;
}

export default function SearchInput({ onChange }: OwnProps) {
  const { t }: { t: any } = useTranslation();
  return (
    <TextField
      size="small"
      sx={(theme) => ({
        m: 0,
        flex: { xs: '1 1 100%', sm: '0 1 300px' },
        minWidth: { xs: 0, sm: 220 },
        '& .MuiOutlinedInput-root': {
          height: 38,
          borderRadius: '12px',
          backgroundColor: theme.palette.background.paper,
          fontSize: 14,
          '& fieldset': {
            borderColor: alpha(theme.palette.text.primary, 0.14)
          },
          '&:hover fieldset': {
            borderColor: alpha(theme.palette.primary.main, 0.5)
          },
          '&.Mui-focused fieldset': {
            borderColor: theme.palette.primary.main,
            borderWidth: '1.5px'
          },
          '&.Mui-focused': {
            boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.12)}`
          }
        }
      })}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchTwoToneIcon fontSize="small" color="primary" />
          </InputAdornment>
        )
      }}
      placeholder={t('search')}
      variant="outlined"
      onChange={onChange}
    />
  );
}
