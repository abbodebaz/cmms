import { Stack } from '@mui/material';
import NoRowsMessage, { NoRowsMessageProps } from './NoRowsMessage';

export default function NoRowsMessageWrapper(props: NoRowsMessageProps) {
  return (
    <Stack height="100%" alignItems="center" justifyContent="center">
      <NoRowsMessage {...props} />
    </Stack>
  );
}
