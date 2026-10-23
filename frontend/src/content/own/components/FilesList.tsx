import File from '../../../models/owns/file';
import { Box, IconButton, Link, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import DoDisturbOnTwoToneIcon from '@mui/icons-material/DoDisturbOnTwoTone';
import InsertDriveFileTwoToneIcon from '@mui/icons-material/InsertDriveFileTwoTone';
import { useContext } from 'react';
import { CompanySettingsContext } from '../../../contexts/CompanySettingsContext';
import { DetailRow } from './DetailsKit';

interface FilesListProps {
  files: File[];
  onRemove: (id: number) => void;
  confirmMessage: string;
  removeDisabled: boolean;
}
export default function FilesList({
  files,
  onRemove,
  confirmMessage,
  removeDisabled
}: FilesListProps) {
  const { getFormattedDate } = useContext(CompanySettingsContext);
  const theme = useTheme();

  return (
    <Box>
      {files.map((file) => (
        <DetailRow key={file.id}>
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
          <Box sx={{ flex: 1, minWidth: 0, textAlign: 'start' }}>
            <Link
              href={file.url}
              underline="hover"
              sx={{
                display: 'block',
                fontWeight: 600,
                fontSize: 14,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {file.name}
            </Link>
            <Typography
              sx={{ color: 'text.secondary', fontSize: 12.5, mt: 0.25 }}
            >
              {getFormattedDate(file.createdAt)}
            </Typography>
          </Box>
          {!removeDisabled && (
            <IconButton
              size="small"
              aria-label="delete"
              onClick={() => {
                if (window.confirm(confirmMessage)) {
                  onRemove(file.id);
                }
              }}
            >
              <DoDisturbOnTwoToneIcon fontSize="small" color="error" />
            </IconButton>
          )}
        </DetailRow>
      ))}
    </Box>
  );
}
