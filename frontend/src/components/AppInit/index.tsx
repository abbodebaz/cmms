import { Box, Typography } from '@mui/material';

import Logo from 'src/components/LogoSign';
import { useBrand } from 'src/hooks/useBrand';
import { isWhiteLabeled } from '../../config';

function AppInit() {
  const { name: brandName } = useBrand();
  return (
    <Box
      sx={{
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        right: 0,
        width: '100%',
        height: '100%'
      }}
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Box>
        <Logo />
        {!isWhiteLabeled && (
          <Typography
            style={{ textAlign: 'center', fontWeight: 600 }}
                    fontSize={13}
          >
            {brandName}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export default AppInit;
