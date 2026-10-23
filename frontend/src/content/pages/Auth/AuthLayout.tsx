import { ReactNode } from 'react';
import { alpha, Box, styled, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import AssignmentTurnedInTwoToneIcon from '@mui/icons-material/AssignmentTurnedInTwoTone';
import EventRepeatTwoToneIcon from '@mui/icons-material/EventRepeatTwoTone';
import Inventory2TwoToneIcon from '@mui/icons-material/Inventory2TwoTone';
import { useBrand } from '../../../hooks/useBrand';
import { getLocalizedHomeUrl } from '../../../utils/urlPaths';
import { homeUrl } from '../../../config';

/**
 * Brand palette for the auth panel. The panel is always charcoal/gold,
 * independently of the light/dark theme currently selected.
 */
const GOLD = '#C8A86A';
const GOLD_DEEP = '#8C6B2C';
const CHARCOAL_FROM = '#1E1B17';
const CHARCOAL_TO = '#2A2620';
const INK_ON_DARK = '#EDE6D8';
const MUTED_ON_DARK = '#A89F8D';

const Panel = styled(Box)(
  ({ theme }) => `
    position: relative;
    overflow: hidden;
    color: ${INK_ON_DARK};
    background: linear-gradient(155deg, ${CHARCOAL_FROM} 0%, ${CHARCOAL_TO} 100%);
    display: flex;
    flex-direction: column;
    padding: ${theme.spacing(3, 2.5)};

    @media (min-width: ${theme.breakpoints.values.md}px) {
      flex: 0 0 44%;
      max-width: 620px;
      min-height: 100vh;
      position: sticky;
      top: 0;
      padding: ${theme.spacing(6, 7)};
      justify-content: space-between;
    }
`
);

const FeatureIcon = styled(Box)(
  ({ theme }) => `
    flex: 0 0 auto;
    width: ${theme.spacing(5)};
    height: ${theme.spacing(5)};
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${GOLD};
    background: ${alpha(GOLD, 0.1)};
    border: 1px solid ${alpha(GOLD, 0.25)};

    .MuiSvgIcon-root {
      font-size: 22px;
    }
`
);

/**
 * Decorative diagonal strokes echoing the two slanted bars of the logo.
 * Pure SVG, purely decorative (aria-hidden).
 */
function GeometricAccents() {
  return (
    <Box
      aria-hidden
      sx={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0
      }}
    >
      {/* fine dot grid */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          opacity: 0.35,
          backgroundImage: `radial-gradient(${alpha(
            GOLD,
            0.18
          )} 1px, transparent 1px)`,
          backgroundSize: '22px 22px',
          maskImage:
            'linear-gradient(160deg, transparent 0%, #000 45%, transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(160deg, transparent 0%, #000 45%, transparent 100%)'
        }}
      />
      {/* large slanted bars, bottom corner */}
      <Box
        component="svg"
        viewBox="0 0 400 400"
        sx={{
          position: 'absolute',
          width: { xs: 220, md: 440 },
          height: { xs: 220, md: 440 },
          bottom: { xs: -90, md: -120 },
          right: { xs: -70, md: -140 },
          opacity: { xs: 0.5, md: 1 }
        }}
      >
        <defs>
          <linearGradient id="authGoldStroke" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={GOLD} stopOpacity="0.55" />
            <stop offset="100%" stopColor={GOLD_DEEP} stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <polygon
          points="40,20 110,20 260,380 190,380"
          fill="url(#authGoldStroke)"
          opacity="0.35"
        />
        <polygon
          points="150,20 185,20 335,380 300,380"
          fill="url(#authGoldStroke)"
          opacity="0.22"
        />
        <polygon
          points="230,20 245,20 395,380 380,380"
          fill="url(#authGoldStroke)"
          opacity="0.18"
        />
      </Box>
      {/* thin outline diamond, top corner */}
      <Box
        component="svg"
        viewBox="0 0 200 200"
        sx={{
          position: 'absolute',
          width: 200,
          height: 200,
          top: -60,
          left: -60,
          display: { xs: 'none', md: 'block' }
        }}
      >
        <rect
          x="45"
          y="45"
          width="110"
          height="110"
          transform="rotate(45 100 100)"
          fill="none"
          stroke={alpha(GOLD, 0.25)}
          strokeWidth="1"
        />
        <rect
          x="65"
          y="65"
          width="70"
          height="70"
          transform="rotate(45 100 100)"
          fill="none"
          stroke={alpha(GOLD, 0.15)}
          strokeWidth="1"
        />
      </Box>
      {/* gold hairline on the inner edge */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          right: 0,
          width: '1px',
          display: { xs: 'none', md: 'block' },
          background: `linear-gradient(180deg, transparent, ${alpha(
            GOLD,
            0.45
          )}, transparent)`
        }}
      />
      {/* bottom hairline on mobile */}
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: '2px',
          display: { xs: 'block', md: 'none' },
          background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`
        }}
      />
    </Box>
  );
}

function BrandPanel() {
  const { t, i18n }: { t: any; i18n: any } = useTranslation();
  const { logo, name } = useBrand();

  const features = [
    {
      icon: <AssignmentTurnedInTwoToneIcon />,
      label: t('auth_feature_work_orders')
    },
    {
      icon: <EventRepeatTwoToneIcon />,
      label: t('auth_feature_preventive')
    },
    {
      icon: <Inventory2TwoToneIcon />,
      label: t('auth_feature_assets')
    }
  ];

  return (
    <Panel>
      <GeometricAccents />
      <Box
        position="relative"
        zIndex={1}
        display="flex"
        flexDirection={{ xs: 'row', md: 'column' }}
        alignItems={{ xs: 'center', md: 'flex-start' }}
        gap={{ xs: 2, md: 0 }}
      >
        <Box
          {...(homeUrl
            ? { component: 'a', href: getLocalizedHomeUrl('', i18n.language) }
            : {})}
          sx={{
            display: 'inline-flex',
            flex: '0 0 auto',
            width: { xs: 56, md: 112 },
            height: { xs: 56, md: 112 },
            mb: { md: 5 }
          }}
        >
          {logo.white && (
            <img
              src={logo.white}
              alt={name}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          )}
        </Box>
        <Box>
          <Typography
            component="h1"
            sx={{
              color: INK_ON_DARK,
              fontWeight: 700,
              lineHeight: 1.25,
              fontSize: { xs: 18, sm: 20, md: 34 },
              maxWidth: 440
            }}
          >
            {t('auth_tagline')}
          </Typography>
          <Box
            sx={{
              display: { xs: 'none', md: 'block' },
              width: 48,
              height: 3,
              borderRadius: 2,
              my: 2.5,
              background: `linear-gradient(90deg, ${GOLD}, ${GOLD_DEEP})`
            }}
          />
          <Typography
            sx={{
              display: { xs: 'none', sm: 'block' },
              color: MUTED_ON_DARK,
              fontSize: { xs: 13, md: 16 },
              lineHeight: 1.7,
              mt: { xs: 0.5, md: 0 },
              maxWidth: 420
            }}
          >
            {t('auth_tagline_sub')}
          </Typography>
        </Box>
      </Box>

      <Box
        component="ul"
        position="relative"
        zIndex={1}
        sx={{
          listStyle: 'none',
          p: 0,
          m: 0,
          mt: 6,
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          gap: 2.5
        }}
      >
        {features.map((feature, index) => (
          <Box
            component="li"
            key={index}
            display="flex"
            alignItems="center"
            gap={2}
          >
            <FeatureIcon>{feature.icon}</FeatureIcon>
            <Typography sx={{ color: INK_ON_DARK, fontSize: 15 }}>
              {feature.label}
            </Typography>
          </Box>
        ))}
      </Box>

      <Typography
        position="relative"
        zIndex={1}
        sx={{
          display: { xs: 'none', md: 'block' },
          mt: 6,
          color: alpha(MUTED_ON_DARK, 0.7),
          fontSize: 12
        }}
      >
        {t('auth_copyright', { year: new Date().getFullYear(), name })}
      </Typography>
    </Panel>
  );
}

interface AuthLayoutProps {
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  /** Rendered under the form (e.g. "no account yet? sign up") */
  footer?: ReactNode;
  /** Max width of the form column */
  maxWidth?: number;
}

/**
 * Split-screen layout shared by the authentication screens:
 * brand panel on one side (start side, flips automatically in RTL),
 * form on the other. Collapses to a single column under `md`.
 */
export default function AuthLayout({
  title,
  subtitle,
  children,
  footer,
  maxWidth = 460
}: AuthLayoutProps) {
  return (
    <Box
      sx={{
        flex: 1,
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        bgcolor: 'background.default'
      }}
    >
      <BrandPanel />
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: { xs: 'flex-start', md: 'center' },
          justifyContent: 'center',
          px: { xs: 2, sm: 4, md: 6 },
          py: { xs: 4, md: 6 }
        }}
      >
        <Box
          sx={(theme) => ({
            width: '100%',
            maxWidth,
            // Larger, softer inputs and a gold primary CTA on auth screens only
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              backgroundColor: theme.palette.background.paper
            },
            '& .MuiOutlinedInput-input': {
              paddingTop: '17.5px',
              paddingBottom: '17.5px',
              fontSize: 15
            },
            '& .MuiButton-root.MuiButton-sizeLarge': {
              minHeight: 52,
              borderRadius: '12px',
              fontSize: 15
            },
            '& .MuiButton-containedPrimary': {
              background: theme.colors.gradients.blue1,
              color: '#ffffff',
              boxShadow: theme.colors.shadows.primary,
              '&:hover': {
                background: theme.colors.gradients.blue1,
                filter: 'brightness(1.06)',
                boxShadow: theme.colors.shadows.primary
              },
              '&.Mui-disabled': {
                opacity: 0.6,
                color: '#ffffff'
              }
            }
          })}
        >
          <Box mb={4}>
            <Typography
              variant="h2"
              component="h2"
              sx={{ fontSize: { xs: 24, md: 30 }, mb: 1 }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography
                color="text.secondary"
                sx={{ fontSize: 15, lineHeight: 1.6 }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
          {children}
          {footer && <Box mt={4}>{footer}</Box>}
        </Box>
      </Box>
    </Box>
  );
}

/** "Question? Link" line used under auth forms. */
export function AuthFooterLink({
  text,
  link
}: {
  text: ReactNode;
  link: ReactNode;
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0.75,
        pt: 3,
        borderTop: 1,
        borderColor: 'divider'
      }}
    >
      <Typography component="span" color="text.secondary" fontSize={14}>
        {text}
      </Typography>
      <Typography component="span" fontSize={14} fontWeight={700}>
        {link}
      </Typography>
    </Box>
  );
}
