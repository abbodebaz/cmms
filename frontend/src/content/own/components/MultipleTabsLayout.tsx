import { ChangeEvent, ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';
import AddTwoToneIcon from '@mui/icons-material/AddTwoTone';
import { Box, Button, Stack, Tab } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import {
  ListCard,
  ListPageHeader,
  primaryCtaSx,
  SegmentedTabs
} from './ListPageShell';

interface SettingsLayoutProps {
  children?: ReactNode;
  tabs: { value: string; label: string }[];
  basePath: string;
  title: string;
  tabIndex: number;
  action?: () => void;
  secondAction?: () => void;
  actionTitle?: string;
  secondActionTitle?: string;
  secondActionIcon?: ReactNode;
  editAction?: boolean;
  rawAction?: ReactNode;
  withoutCard?: boolean;
}

function MultipleTabsLayout(props: SettingsLayoutProps) {
  const {
    children,
    tabIndex,
    title,
    tabs,
    basePath,
    action,
    actionTitle,
    withoutCard,
    editAction,
    secondAction,
    secondActionTitle,
    secondActionIcon,
    rawAction
  } = props;
  const { t }: { t: any } = useTranslation();
  const navigate = useNavigate();
  const currentTab = tabs[tabIndex].value;

  const handleTabsChange = (_event: ChangeEvent<{}>, value: string): void => {
    navigate(`${basePath}/${value}`);
  };

  const hasActions = Boolean(action || secondAction || rawAction);
  const actionsNode = hasActions ? (
    <>
      {action && (
        <Button
          startIcon={editAction ? <EditTwoToneIcon /> : <AddTwoToneIcon />}
          variant="contained"
          onClick={action}
          sx={primaryCtaSx}
        >
          {actionTitle}
        </Button>
      )}
      {secondAction && secondActionTitle && (
        <Button
          startIcon={secondActionIcon}
          variant="outlined"
          onClick={secondAction}
          sx={(theme) => ({
            borderRadius: '12px',
            minHeight: 40,
            fontWeight: 700,
            borderColor: alpha(theme.palette.primary.main, 0.35),
            color: theme.palette.primary.dark
          })}
        >
          {secondActionTitle}
        </Button>
      )}
      {rawAction}
    </>
  ) : null;

  const tabsNode = (
    <SegmentedTabs
      onChange={handleTabsChange}
      value={currentTab}
      variant="scrollable"
      scrollButtons="auto"
      allowScrollButtonsMobile
      textColor="primary"
      indicatorColor="primary"
    >
      {tabs.map((tab) => (
        <Tab key={tab.value} label={tab.label} value={tab.value} />
      ))}
    </SegmentedTabs>
  );

  return (
    <Box
      sx={{
        px: { xs: 2, md: 3 },
        pt: { xs: 2, md: 2.5 },
        pb: 3
      }}
    >
      <Helmet>
        <title>{title}</title>
      </Helmet>
      {withoutCard ? (
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          alignItems={{ xs: 'stretch', md: 'center' }}
          justifyContent="space-between"
          gap={2}
          sx={{ mb: 2.5 }}
        >
          <Box sx={{ minWidth: 0 }}>{tabsNode}</Box>
          {hasActions && (
            <Stack direction="row" alignItems="center" flexWrap="wrap" gap={1}>
              {actionsNode}
            </Stack>
          )}
        </Stack>
      ) : (
        <>
          <ListPageHeader title={title} actions={actionsNode} />
          <Box sx={{ mb: 2 }}>{tabsNode}</Box>
        </>
      )}
      {withoutCard ? children : <ListCard>{children}</ListCard>}
    </Box>
  );
}

export default MultipleTabsLayout;
