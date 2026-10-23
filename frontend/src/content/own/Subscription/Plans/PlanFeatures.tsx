import { Box, Grid, Stack, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import CheckTwoToneIcon from '@mui/icons-material/CheckTwoTone';
import CloseTwoToneIcon from '@mui/icons-material/CloseTwoTone';
import { PlanFeature } from '../../../../models/owns/subscriptionPlan';
import { useTranslation } from 'react-i18next';

interface PlanFeatureProps {
  features: PlanFeature[];
}

function PlanFeatures(props: PlanFeatureProps) {
  const { features } = props;
  const { t }: { t: any } = useTranslation();
  const theme = useTheme();
  const basicFeatures = [
    'WORK_ORDER',
    'REQUEST',
    'PART',
    'MOBILE_APP',
    'WORK_ORDER_HISTORY'
  ].map((feature) => ({
    name: feature,
    isBasic: true as const
  }));
  const completeFeatures: (
    | { isBasic: true; name: string }
    | { isBasic: false; name: PlanFeature }
  )[] = [
    ...basicFeatures,
    ...Object.values(PlanFeature).map((feature) => ({
      name: feature,
      isBasic: false as const
    }))
  ];
  return (
    <Grid container spacing={1}>
      {completeFeatures.map((feature, index) => {
        const included =
          feature.isBasic || features.includes(feature.name as PlanFeature);
        return (
          <Grid key={index} item xs={12} sm={6} md={4}>
            <Stack
              spacing={1}
              direction="row"
              alignItems="center"
              sx={{ py: 0.5 }}
            >
              <Box
                sx={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                  color: included
                    ? theme.palette.success.main
                    : theme.palette.text.disabled,
                  backgroundColor: included
                    ? alpha(theme.palette.success.main, 0.12)
                    : alpha(theme.palette.text.primary, 0.05)
                }}
              >
                {included ? (
                  <CheckTwoToneIcon sx={{ fontSize: 15 }} />
                ) : (
                  <CloseTwoToneIcon sx={{ fontSize: 15 }} />
                )}
              </Box>
              <Typography
                sx={{
                  fontSize: 13.5,
                  color: included
                    ? theme.palette.text.primary
                    : theme.palette.text.secondary
                }}
              >
                {t(`${feature.name}_feature`)}
              </Typography>
            </Stack>
          </Grid>
        );
      })}
    </Grid>
  );
}

export default PlanFeatures;
