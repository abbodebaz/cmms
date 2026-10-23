import { ReactNode, useEffect, useRef, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, ButtonBase, Container, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { keyframes } from '@emotion/react';
import { useTranslation } from 'react-i18next';
import CampaignTwoToneIcon from '@mui/icons-material/CampaignTwoTone';
import EngineeringTwoToneIcon from '@mui/icons-material/EngineeringTwoTone';
import InsightsTwoToneIcon from '@mui/icons-material/InsightsTwoTone';
import AssignmentTwoToneIcon from '@mui/icons-material/AssignmentTwoTone';
import EventRepeatTwoToneIcon from '@mui/icons-material/EventRepeatTwoTone';
import PrecisionManufacturingTwoToneIcon from '@mui/icons-material/PrecisionManufacturingTwoTone';
import Inventory2TwoToneIcon from '@mui/icons-material/Inventory2TwoTone';
import SpeedTwoToneIcon from '@mui/icons-material/SpeedTwoTone';
import BarChartTwoToneIcon from '@mui/icons-material/BarChartTwoTone';
import PhoneIphoneTwoToneIcon from '@mui/icons-material/PhoneIphoneTwoTone';
import CheckCircleTwoToneIcon from '@mui/icons-material/CheckCircleTwoTone';
import PhotoCameraTwoToneIcon from '@mui/icons-material/PhotoCameraTwoTone';
import PlaceTwoToneIcon from '@mui/icons-material/PlaceTwoTone';
import useAuth from 'src/hooks/useAuth';
import { useBrand } from 'src/hooks/useBrand';
import i18n, { loadLanguage } from 'src/i18n/i18n';

/* ---------------------------------------------------------------- tokens */
const C = {
  ink: '#1E1B17',
  ink2: '#2A2620',
  gold: '#977537',
  goldLight: '#C8A86A',
  goldPale: '#E9DCC0',
  paper: '#FFFFFF',
  sand: '#F6F4EF',
  text: '#2A2620',
  muted: '#6F675A',
  line: '#E7E1D6'
};
const reduceMotion = '@media (prefers-reduced-motion: reduce)';

const draw = keyframes`from { stroke-dashoffset: 900; } to { stroke-dashoffset: 0; }`;
const rise = keyframes`from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; }`;
const fadeIn = keyframes`from { opacity: 0; } to { opacity: 1; }`;
const pulse = keyframes`0% { box-shadow: 0 0 0 0 rgba(200,168,106,.55); } 70% { box-shadow: 0 0 0 10px rgba(200,168,106,0); } 100% { box-shadow: 0 0 0 0 rgba(200,168,106,0); }`;

const focusRing = {
  '&:focus-visible': { outline: `3px solid ${C.goldLight}`, outlineOffset: 3 }
};

/* ------------------------------------------------------- hero: live ticket */
const STAGES = ['new', 'assigned', 'in_progress', 'done'] as const;

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!mq) return;
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);
  return reduced;
}

function TicketFlow() {
  const { t } = useTranslation();
  const reduced = useReducedMotion();
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (reduced) {
      setStage(STAGES.length - 1);
      return;
    }
    const delays = [1900, 1900, 2100, 3400];
    let timer: ReturnType<typeof setTimeout>;
    const tick = (s: number) => {
      timer = setTimeout(() => {
        const next = (s + 1) % STAGES.length;
        setStage(next);
        tick(next);
      }, delays[s]);
    };
    tick(0);
    return () => clearTimeout(timer);
  }, [reduced]);

  const progress = (stage / (STAGES.length - 1)) * 100;
  const done = stage === STAGES.length - 1;

  return (
    <Box
      aria-label={t('landing.ticket_aria')}
      role="img"
      sx={{
        position: 'relative',
        width: '100%',
        maxWidth: 440,
        mx: 'auto',
        animation: `${rise} .8s .35s both cubic-bezier(.2,.7,.2,1)`,
        [reduceMotion]: { animation: 'none' }
      }}
    >
      <Box
        sx={{
          bgcolor: C.paper,
          color: C.text,
          borderRadius: '20px',
          p: { xs: 2.25, sm: 3 },
          boxShadow: `0 30px 60px ${alpha('#000', 0.35)}, 0 0 0 1px ${alpha(
            C.goldLight,
            0.25
          )}`
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <Typography
            sx={{ fontSize: 12.5, color: C.muted, fontWeight: 600, direction: 'ltr' }}
          >
            WO-1042
          </Typography>
          <Box sx={{ flex: 1 }} />
          <Box
            sx={{
              px: 1.25,
              py: 0.25,
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 700,
              color: '#B42318',
              bgcolor: '#FDECEA'
            }}
          >
            {t('landing.ticket_priority')}
          </Box>
        </Box>
        <Typography sx={{ fontWeight: 800, fontSize: { xs: 17, sm: 19 }, lineHeight: 1.4 }}>
          {t('landing.ticket_title')}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            color: C.muted,
            fontSize: 13.5,
            mt: 0.75
          }}
        >
          <PlaceTwoToneIcon sx={{ fontSize: 18, color: C.gold }} />
          {t('landing.ticket_location')}
        </Box>

        {/* status track */}
        <Box sx={{ position: 'relative', mt: 3, mb: 1 }}>
          <Box
            sx={{
              position: 'absolute',
              top: 9,
              insetInlineStart: 9,
              insetInlineEnd: 9,
              height: 3,
              borderRadius: 3,
              bgcolor: C.line
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: 9,
              insetInlineStart: 9,
              height: 3,
              borderRadius: 3,
              width: `calc((100% - 18px) * ${progress / 100})`,
              background: `linear-gradient(90deg, ${C.goldLight}, ${C.gold})`,
              transition: 'width .9s cubic-bezier(.4,0,.2,1)',
              [reduceMotion]: { transition: 'none' }
            }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
            {STAGES.map((s, i) => {
              const reached = i <= stage;
              const current = i === stage;
              return (
                <Box
                  key={s}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1,
                    width: 64
                  }}
                >
                  <Box
                    sx={{
                      width: 21,
                      height: 21,
                      borderRadius: '50%',
                      display: 'grid',
                      placeItems: 'center',
                      bgcolor: reached ? C.gold : C.paper,
                      border: `3px solid ${reached ? C.gold : C.line}`,
                      transition: 'all .4s',
                      animation:
                        current && !(done && i === STAGES.length - 1)
                          ? `${pulse} 1.6s infinite`
                          : 'none',
                      [reduceMotion]: { animation: 'none' }
                    }}
                  >
                    {reached && (i < stage || done) && (
                      <Box
                        component="svg"
                        viewBox="0 0 12 12"
                        sx={{ width: 10, height: 10 }}
                      >
                        <path
                          d="M2 6.5 4.8 9 10 3"
                          fill="none"
                          stroke="#fff"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </Box>
                    )}
                  </Box>
                  <Typography
                    sx={{
                      fontSize: 11.5,
                      fontWeight: current ? 800 : 600,
                      color: current ? C.text : C.muted,
                      textAlign: 'center',
                      lineHeight: 1.3,
                      transition: 'color .3s'
                    }}
                  >
                    {t(`landing.stage_${s}`)}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* activity line */}
        <Box
          key={stage}
          sx={{
            mt: 2.25,
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
            p: 1.5,
            borderRadius: '12px',
            bgcolor: done ? '#EAF6E5' : C.sand,
            animation: `${fadeIn} .45s both`,
            [reduceMotion]: { animation: 'none' }
          }}
        >
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: '10px',
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
              bgcolor: done ? '#D3EDCB' : C.goldPale,
              color: done ? '#2E7D32' : C.gold
            }}
          >
            {done ? (
              <CheckCircleTwoToneIcon fontSize="small" />
            ) : stage === 0 ? (
              <PhotoCameraTwoToneIcon fontSize="small" />
            ) : stage === 1 ? (
              <EngineeringTwoToneIcon fontSize="small" />
            ) : (
              <SpeedTwoToneIcon fontSize="small" />
            )}
          </Box>
          <Typography sx={{ fontSize: 13.5, fontWeight: 600, lineHeight: 1.5 }}>
            {t(`landing.activity_${STAGES[stage]}`)}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

/* ------------------------------------------------- logo-echo stroke artwork */
function HeroStrokes() {
  return (
    <Box
      component="svg"
      viewBox="0 0 600 600"
      aria-hidden
      sx={{
        position: 'absolute',
        insetInlineEnd: { xs: '-40%', md: '-6%' },
        top: { xs: '-10%', md: '-12%' },
        width: { xs: 520, md: 760 },
        height: { xs: 520, md: 760 },
        opacity: 0.55,
        pointerEvents: 'none',
        '& path': {
          strokeDasharray: 900,
          animation: `${draw} 2.2s cubic-bezier(.6,.05,.2,1) both`,
          [reduceMotion]: { animation: 'none', strokeDasharray: 'none' }
        },
        '& path:nth-of-type(2)': { animationDelay: '.25s' },
        '& path:nth-of-type(3)': { animationDelay: '.5s' }
      }}
    >
      <defs>
        <linearGradient id="lp-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={C.goldLight} stopOpacity="0.9" />
          <stop offset="1" stopColor={C.gold} stopOpacity="0.15" />
        </linearGradient>
      </defs>
      <path d="M90 40 L330 540" stroke="url(#lp-gold)" strokeWidth="46" strokeLinecap="round" fill="none" />
      <path d="M230 40 L470 540" stroke="url(#lp-gold)" strokeWidth="46" strokeLinecap="round" fill="none" />
      <path d="M300 40 C460 40 560 150 560 290 C560 380 520 440 470 480" stroke="url(#lp-gold)" strokeWidth="18" strokeLinecap="round" fill="none" />
    </Box>
  );
}

/* --------------------------------------------------------- role mockups */
function MockFrame({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        bgcolor: C.paper,
        borderRadius: '18px',
        border: `1px solid ${C.line}`,
        boxShadow: `0 20px 40px ${alpha(C.ink, 0.08)}`,
        p: 2.5,
        width: '100%',
        maxWidth: 380,
        mx: 'auto'
      }}
    >
      {children}
    </Box>
  );
}

function MockRequester() {
  const { t } = useTranslation();
  const row = (label: string, value: string) => (
    <Box sx={{ border: `1px solid ${C.line}`, borderRadius: '10px', px: 1.5, py: 1, mb: 1.25 }}>
      <Typography sx={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>{label}</Typography>
      <Typography sx={{ fontSize: 13.5, fontWeight: 600 }}>{value}</Typography>
    </Box>
  );
  return (
    <MockFrame>
      <Typography sx={{ fontWeight: 800, fontSize: 15, mb: 1.75 }}>
        {t('landing.mock_req_title')}
      </Typography>
      {row(t('landing.mock_req_what'), t('landing.mock_req_what_v'))}
      {row(t('landing.mock_req_where'), t('landing.mock_req_where_v'))}
      <Box
        sx={{
          border: `1.5px dashed ${alpha(C.gold, 0.45)}`,
          borderRadius: '10px',
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
          color: C.gold,
          fontSize: 13,
          fontWeight: 700,
          mb: 1.75
        }}
      >
        <PhotoCameraTwoToneIcon fontSize="small" /> {t('landing.mock_req_photo')}
      </Box>
      <Box
        sx={{
          bgcolor: C.gold,
          color: '#fff',
          borderRadius: '10px',
          textAlign: 'center',
          py: 1.1,
          fontWeight: 800,
          fontSize: 14
        }}
      >
        {t('landing.mock_req_send')}
      </Box>
    </MockFrame>
  );
}

function MockTeam() {
  const { t } = useTranslation();
  const items = [
    { k: 'landing.mock_team_1', p: 'high' },
    { k: 'landing.mock_team_2', p: 'medium' },
    { k: 'landing.mock_team_3', p: 'low' }
  ];
  const pc: Record<string, [string, string]> = {
    high: ['#B42318', '#FDECEA'],
    medium: ['#B54708', '#FEF0DC'],
    low: ['#175CD3', '#E8F1FD']
  };
  return (
    <MockFrame>
      <Typography sx={{ fontWeight: 800, fontSize: 15, mb: 1.75 }}>
        {t('landing.mock_team_title')}
      </Typography>
      {items.map((it, i) => (
        <Box
          key={it.k}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
            py: 1.25,
            borderTop: i ? `1px solid ${C.line}` : 'none'
          }}
        >
          <Box
            sx={{
              width: 4,
              alignSelf: 'stretch',
              borderRadius: 4,
              bgcolor: pc[it.p][0]
            }}
          />
          <Typography sx={{ flex: 1, fontSize: 13.5, fontWeight: 600 }}>{t(it.k)}</Typography>
          <Box
            sx={{
              fontSize: 11.5,
              fontWeight: 700,
              px: 1.1,
              py: 0.2,
              borderRadius: 20,
              color: pc[it.p][0],
              bgcolor: pc[it.p][1]
            }}
          >
            {t(`landing.prio_${it.p}`)}
          </Box>
        </Box>
      ))}
      <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
        <Box sx={{ flex: 1, textAlign: 'center', py: 1, borderRadius: '10px', bgcolor: C.gold, color: '#fff', fontWeight: 800, fontSize: 13.5 }}>
          {t('landing.mock_team_start')}
        </Box>
        <Box sx={{ flex: 1, textAlign: 'center', py: 1, borderRadius: '10px', bgcolor: C.sand, color: C.text, fontWeight: 700, fontSize: 13.5 }}>
          {t('landing.mock_team_photo')}
        </Box>
      </Box>
    </MockFrame>
  );
}

function MockManagement() {
  const { t } = useTranslation();
  const bars = [62, 80, 54, 91, 73, 86, 95];
  return (
    <MockFrame>
      <Typography sx={{ fontWeight: 800, fontSize: 15, mb: 1.75 }}>
        {t('landing.mock_mgmt_title')}
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.25, mb: 2 }}>
        {[
          ['landing.mock_mgmt_k1', '94%'],
          ['landing.mock_mgmt_k2', '3.2']
        ].map(([k, v]) => (
          <Box key={k} sx={{ bgcolor: C.sand, borderRadius: '12px', p: 1.5 }}>
            <Typography sx={{ fontSize: 22, fontWeight: 800, direction: 'ltr', textAlign: 'start' }}>
              {v}
            </Typography>
            <Typography sx={{ fontSize: 11.5, color: C.muted, fontWeight: 600 }}>{t(k)}</Typography>
          </Box>
        ))}
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, height: 90 }}>
        {bars.map((h, i) => (
          <Box
            key={i}
            sx={{
              flex: 1,
              height: `${h}%`,
              borderRadius: '6px 6px 2px 2px',
              background:
                i === bars.length - 1
                  ? `linear-gradient(180deg, ${C.goldLight}, ${C.gold})`
                  : alpha(C.gold, 0.22)
            }}
          />
        ))}
      </Box>
      <Typography sx={{ fontSize: 11.5, color: C.muted, mt: 1, fontWeight: 600 }}>
        {t('landing.mock_mgmt_chart')}
      </Typography>
    </MockFrame>
  );
}

/* ------------------------------------------------------------------ page */
const ROLES = [
  { id: 'requester', icon: CampaignTwoToneIcon, mock: MockRequester, points: 3 },
  { id: 'team', icon: EngineeringTwoToneIcon, mock: MockTeam, points: 4 },
  { id: 'mgmt', icon: InsightsTwoToneIcon, mock: MockManagement, points: 4 }
] as const;

const CAPABILITIES = [
  { id: 'wo', icon: AssignmentTwoToneIcon },
  { id: 'pm', icon: EventRepeatTwoToneIcon },
  { id: 'assets', icon: PrecisionManufacturingTwoToneIcon },
  { id: 'parts', icon: Inventory2TwoToneIcon },
  { id: 'meters', icon: SpeedTwoToneIcon },
  { id: 'reports', icon: BarChartTwoToneIcon }
];

const sectionPad = { py: { xs: 8, md: 12 } };

function SectionHeading({ title, lead, dark }: { title: string; lead?: string; dark?: boolean }) {
  return (
    <Box sx={{ maxWidth: 640, mb: { xs: 4, md: 6 } }}>
      <Typography
        component="h2"
        sx={{
          fontWeight: 800,
          fontSize: { xs: 26, md: 36 },
          lineHeight: 1.3,
          color: dark ? '#fff' : C.text
        }}
      >
        {title}
      </Typography>
      {lead && (
        <Typography
          sx={{
            mt: 1.5,
            fontSize: { xs: 16, md: 17.5 },
            lineHeight: 1.85,
            color: dark ? alpha('#fff', 0.72) : C.muted
          }}
        >
          {lead}
        </Typography>
      )}
    </Box>
  );
}

export default function LandingPage() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { logo, name: brandName } = useBrand();
  const [role, setRole] = useState<(typeof ROLES)[number]['id']>('requester');
  const [scrolled, setScrolled] = useState(false);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const isAr = i18n.language?.startsWith('ar');

  // Internal Saudi deployment: default to Arabic unless the visitor chose a language before.
  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem('i18nextLng');
    } catch (e) {
      stored = null;
    }
    if (!stored && !i18n.language?.startsWith('ar')) switchLanguage('ar');
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    // The app shell may scroll an inner container instead of the window, so listen in the capture phase.
    const onScroll = (e?: Event) => {
      const target = e?.target as HTMLElement | Document | undefined;
      const inner =
        target && target !== document && 'scrollTop' in target
          ? (target as HTMLElement).scrollTop
          : 0;
      setScrolled(Math.max(window.scrollY, inner) > 12);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true, capture: true });
    return () =>
      window.removeEventListener('scroll', onScroll, { capture: true } as EventListenerOptions);
  }, []);

  useEffect(() => {
    document.title = `${brandName} | ${t('landing.meta_title')}`;
  }, [brandName, t]);

  async function switchLanguage(lang: string) {
    await loadLanguage(lang);
    await i18n.changeLanguage(lang);
  }

  const primaryCta = isAuthenticated
    ? { to: '/app/dashboard', label: t('landing.cta_dashboard') }
    : { to: '/account/login', label: t('landing.cta_login') };

  const primaryBtnSx = {
    borderRadius: '12px',
    px: 3.5,
    py: 1.4,
    fontSize: 16,
    fontWeight: 800,
    bgcolor: C.gold,
    color: '#fff',
    boxShadow: `0 10px 24px ${alpha(C.gold, 0.35)}`,
    '&:hover': { bgcolor: '#7E612C', boxShadow: `0 12px 28px ${alpha(C.gold, 0.45)}` },
    ...focusRing
  };

  const activeRole = ROLES.find((r) => r.id === role)!;
  const ActiveMock = activeRole.mock;

  const onRoleKey = (e: React.KeyboardEvent, index: number) => {
    const dirNext = isAr ? 'ArrowLeft' : 'ArrowRight';
    const dirPrev = isAr ? 'ArrowRight' : 'ArrowLeft';
    let next = -1;
    if (e.key === dirNext) next = (index + 1) % ROLES.length;
    if (e.key === dirPrev) next = (index - 1 + ROLES.length) % ROLES.length;
    if (next >= 0) {
      e.preventDefault();
      setRole(ROLES[next].id);
      tabRefs.current[next]?.focus();
    }
  };

  return (
    <Box
      sx={{
        bgcolor: C.paper,
        color: C.text,
        minHeight: '100vh',
        overflowX: 'hidden',
        '& ::selection': { background: C.goldPale }
      }}
    >
      {/* ------------------------------------------------------------ nav */}
      <Box
        component="header"
        sx={{
          position: 'fixed',
          insetInline: 0,
          top: 0,
          zIndex: 10,
          transition: 'background-color .3s, box-shadow .3s',
          bgcolor: scrolled ? alpha(C.ink, 0.92) : 'transparent',
          backdropFilter: scrolled ? 'blur(10px)' : 'none',
          boxShadow: scrolled ? `0 1px 0 ${alpha('#fff', 0.06)}` : 'none'
        }}
      >
        <Container
          maxWidth="lg"
          sx={{ display: 'flex', alignItems: 'center', gap: 2, height: { xs: 64, md: 76 } }}
        >
          <Box
            component={RouterLink}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              textDecoration: 'none',
              color: '#fff',
              borderRadius: 2,
              ...focusRing
            }}
          >
            <Box component="img" src={logo.white} alt="" sx={{ width: { xs: 34, md: 40 }, height: 'auto' }} />
            <Typography sx={{ display: { xs: 'none', sm: 'block' }, fontWeight: 800, fontSize: 16, color: '#fff', whiteSpace: 'nowrap' }}>
              {brandName}
            </Typography>
          </Box>
          <Box sx={{ flex: 1 }} />
          <Box
            component="nav"
            aria-label={t('landing.nav_aria')}
            sx={{ display: { xs: 'none', md: 'flex' }, gap: 3.5 }}
          >
            {[
              ['#how', 'landing.nav_how'],
              ['#roles', 'landing.nav_roles'],
              ['#features', 'landing.nav_features']
            ].map(([href, k]) => (
              <Box
                key={href}
                component="a"
                href={href}
                sx={{
                  color: alpha('#fff', 0.78),
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: 15,
                  borderRadius: 1,
                  '&:hover': { color: '#fff' },
                  ...focusRing
                }}
              >
                {t(k)}
              </Box>
            ))}
          </Box>
          <ButtonBase
            onClick={() => switchLanguage(isAr ? 'en' : 'ar')}
            aria-label={t('landing.lang_aria')}
            sx={{
              color: '#fff',
              fontWeight: 700,
              fontSize: 14,
              px: 1.5,
              height: 38,
              borderRadius: '10px',
              border: `1px solid ${alpha('#fff', 0.2)}`,
              '&:hover': { bgcolor: alpha('#fff', 0.08) },
              ...focusRing
            }}
          >
            {isAr ? 'EN' : 'عربي'}
          </ButtonBase>
          <Button
            component={RouterLink}
            to={primaryCta.to}
            sx={{
              ...primaryBtnSx,
              px: { xs: 2, md: 2.5 },
              py: 0.9,
              fontSize: { xs: 14, md: 15 },
              whiteSpace: 'nowrap',
              boxShadow: 'none'
            }}
          >
            {primaryCta.label}
          </Button>
        </Container>
      </Box>

      {/* ----------------------------------------------------------- hero */}
      <Box
        component="section"
        sx={{
          position: 'relative',
          overflow: 'hidden',
          background: `radial-gradient(1200px 600px at 85% 0%, ${alpha(C.gold, 0.22)}, transparent 60%), linear-gradient(180deg, ${C.ink} 0%, ${C.ink2} 100%)`,
          color: '#fff',
          pt: { xs: 13, md: 18 },
          pb: { xs: 9, md: 14 }
        }}
      >
        <HeroStrokes />
        <Container maxWidth="lg" sx={{ position: 'relative' }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1.1fr 0.9fr' },
              gap: { xs: 7, md: 8 },
              alignItems: 'center'
            }}
          >
            <Box sx={{ animation: `${rise} .8s both cubic-bezier(.2,.7,.2,1)`, [reduceMotion]: { animation: 'none' } }}>
              <Typography
                component="h1"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: 34, sm: 44, md: 56 },
                  lineHeight: 1.22,
                  letterSpacing: isAr ? 0 : '-0.02em',
                  maxWidth: 620
                }}
              >
                {t('landing.hero_title')}
              </Typography>
              <Typography
                sx={{
                  mt: 2.5,
                  fontSize: { xs: 17, md: 19 },
                  lineHeight: 1.85,
                  color: alpha('#fff', 0.74),
                  maxWidth: 560
                }}
              >
                {t('landing.hero_lead')}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 4 }}>
                <Button component={RouterLink} to={primaryCta.to} sx={primaryBtnSx}>
                  {primaryCta.label}
                </Button>
                <Button
                  href="#how"
                  sx={{
                    borderRadius: '12px',
                    px: 3,
                    py: 1.4,
                    fontSize: 16,
                    fontWeight: 700,
                    color: '#fff',
                    border: `1px solid ${alpha('#fff', 0.24)}`,
                    '&:hover': { bgcolor: alpha('#fff', 0.06), borderColor: alpha('#fff', 0.4) },
                    ...focusRing
                  }}
                >
                  {t('landing.cta_how')}
                </Button>
              </Box>
            </Box>
            <TicketFlow />
          </Box>
        </Container>
      </Box>

      {/* -------------------------------------------------- how it works */}
      <Box component="section" id="how" sx={{ ...sectionPad, scrollMarginTop: 70 }}>
        <Container maxWidth="lg">
          <SectionHeading title={t('landing.how_title')} lead={t('landing.how_lead')} />
          <Box
            component="ol"
            sx={{
              listStyle: 'none',
              p: 0,
              m: 0,
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
              gap: { xs: 3.5, md: 3 }
            }}
          >
            {[1, 2, 3, 4].map((n) => (
              <Box component="li" key={n} sx={{ position: 'relative', pt: 2.5 }}>
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    insetInlineStart: 0,
                    insetInlineEnd: { md: n < 4 ? -24 : 0 },
                    height: 3,
                    borderRadius: 3,
                    bgcolor: n === 1 ? C.gold : alpha(C.gold, 0.22)
                  }}
                />
                <Typography sx={{ fontWeight: 800, fontSize: 40, lineHeight: 1, color: alpha(C.gold, 0.9), direction: 'ltr', textAlign: 'start' }}>
                  {n}
                </Typography>
                <Typography component="h3" sx={{ fontWeight: 800, fontSize: 19, mt: 1.5 }}>
                  {t(`landing.step${n}_title`)}
                </Typography>
                <Typography sx={{ mt: 1, color: C.muted, lineHeight: 1.85, fontSize: 15.5 }}>
                  {t(`landing.step${n}_body`)}
                </Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* --------------------------------------------------------- roles */}
      <Box component="section" id="roles" sx={{ ...sectionPad, bgcolor: C.sand, scrollMarginTop: 70 }}>
        <Container maxWidth="lg">
          <SectionHeading title={t('landing.roles_title')} lead={t('landing.roles_lead')} />
          <Box
            role="tablist"
            aria-label={t('landing.roles_title')}
            sx={{
              display: { xs: 'grid', sm: 'inline-flex' },
              gridTemplateColumns: 'repeat(3, 1fr)',
              width: { xs: '100%', sm: 'auto' },
              gap: 0.75,
              p: 0.75,
              borderRadius: '16px',
              bgcolor: C.paper,
              border: `1px solid ${C.line}`,
              mb: { xs: 4, md: 5 },
              maxWidth: '100%'
            }}
          >
            {ROLES.map((r, i) => {
              const Icon = r.icon;
              const selected = r.id === role;
              return (
                <ButtonBase
                  key={r.id}
                  ref={(el) => (tabRefs.current[i] = el)}
                  role="tab"
                  id={`role-tab-${r.id}`}
                  aria-selected={selected}
                  aria-controls={`role-panel-${r.id}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setRole(r.id)}
                  onKeyDown={(e) => onRoleKey(e, i)}
                  sx={{
                    gap: 1,
                    px: { xs: 1, sm: 2.5 },
                    py: 1.25,
                    whiteSpace: 'nowrap',
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: { xs: 14, sm: 15.5 },
                    color: selected ? '#fff' : C.text,
                    bgcolor: selected ? C.ink : 'transparent',
                    transition: 'background-color .25s, color .25s',
                    '&:hover': { bgcolor: selected ? C.ink : alpha(C.gold, 0.08) },
                    ...focusRing
                  }}
                >
                  <Icon sx={{ display: { xs: 'none', sm: 'block' }, fontSize: 20, color: selected ? C.goldLight : C.gold }} />
                  {t(`landing.role_${r.id}`)}
                </ButtonBase>
              );
            })}
          </Box>

          <Box
            key={role}
            role="tabpanel"
            id={`role-panel-${role}`}
            aria-labelledby={`role-tab-${role}`}
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: { xs: 5, md: 8 },
              alignItems: 'center',
              animation: `${fadeIn} .4s both`,
              [reduceMotion]: { animation: 'none' }
            }}
          >
            <Box>
              <Typography component="h3" sx={{ fontWeight: 800, fontSize: { xs: 21, md: 25 }, lineHeight: 1.4 }}>
                {t(`landing.role_${role}_headline`)}
              </Typography>
              <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0, mt: 3, display: 'grid', gap: 2.25 }}>
                {Array.from({ length: activeRole.points }).map((_, i) => (
                  <Box component="li" key={i} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                    <CheckCircleTwoToneIcon sx={{ color: C.gold, mt: 0.25, flexShrink: 0 }} />
                    <Typography sx={{ fontSize: 16, lineHeight: 1.8 }}>
                      {t(`landing.role_${role}_p${i + 1}`)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
            <ActiveMock />
          </Box>
        </Container>
      </Box>

      {/* ------------------------------------------------------ features */}
      <Box component="section" id="features" sx={{ ...sectionPad, scrollMarginTop: 70 }}>
        <Container maxWidth="lg">
          <SectionHeading title={t('landing.features_title')} lead={t('landing.features_lead')} />
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' },
              columnGap: 5,
              rowGap: { xs: 3.5, md: 5 }
            }}
          >
            {CAPABILITIES.map(({ id, icon: Icon }) => (
              <Box key={id} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <Box
                  sx={{
                    width: 46,
                    height: 46,
                    borderRadius: '14px',
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                    bgcolor: alpha(C.gold, 0.1),
                    color: C.gold
                  }}
                >
                  <Icon />
                </Box>
                <Box>
                  <Typography component="h3" sx={{ fontWeight: 800, fontSize: 17.5 }}>
                    {t(`landing.feat_${id}`)}
                  </Typography>
                  <Typography sx={{ color: C.muted, mt: 0.5, lineHeight: 1.8, fontSize: 15 }}>
                    {t(`landing.feat_${id}_body`)}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>

          {/* devices note */}
          <Box
            sx={{
              mt: { xs: 7, md: 10 },
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'center' },
              gap: 2.5,
              p: { xs: 2.5, md: 3.5 },
              borderRadius: '20px',
              border: `1px solid ${C.line}`,
              bgcolor: C.sand
            }}
          >
            <Box sx={{ width: 54, height: 54, borderRadius: '16px', display: 'grid', placeItems: 'center', bgcolor: C.ink, color: C.goldLight, flexShrink: 0 }}>
              <PhoneIphoneTwoToneIcon />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: 18 }}>{t('landing.devices_title')}</Typography>
              <Typography sx={{ color: C.muted, mt: 0.5, lineHeight: 1.8 }}>{t('landing.devices_body')}</Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ---------------------------------------------------- closing cta */}
      <Box
        component="section"
        sx={{
          position: 'relative',
          overflow: 'hidden',
          bgcolor: C.ink,
          color: '#fff',
          py: { xs: 8, md: 11 }
        }}
      >
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            insetInlineStart: '-120px',
            bottom: '-160px',
            width: 420,
            height: 420,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(C.gold, 0.28)}, transparent 65%)`
          }}
        />
        <Container maxWidth="md" sx={{ position: 'relative', textAlign: 'center' }}>
          <Typography component="h2" sx={{ fontWeight: 800, fontSize: { xs: 26, md: 38 }, lineHeight: 1.3 }}>
            {t('landing.final_title')}
          </Typography>
          <Typography sx={{ mt: 1.5, color: alpha('#fff', 0.72), fontSize: { xs: 16, md: 18 }, lineHeight: 1.8 }}>
            {t('landing.final_body')}
          </Typography>
          <Button component={RouterLink} to={primaryCta.to} sx={{ ...primaryBtnSx, mt: 4 }}>
            {primaryCta.label}
          </Button>
        </Container>
      </Box>

      {/* -------------------------------------------------------- footer */}
      <Box component="footer" sx={{ bgcolor: '#15130F', color: alpha('#fff', 0.6), py: 3.5 }}>
        <Container
          maxWidth="lg"
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1.5
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <Box component="img" src={logo.white} alt="" sx={{ width: 26, height: 'auto' }} />
            <Typography sx={{ fontWeight: 700, color: alpha('#fff', 0.85), fontSize: 14 }}>
              {brandName}
            </Typography>
          </Box>
          <Typography sx={{ fontSize: 13 }}>
            {t('landing.footer_note', { year: new Date().getFullYear() })}
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
