import { ReactNode } from 'react';
import SectionCard from '../../components/SectionCard';

interface SectionProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  badge?: ReactNode;
  noPadding?: boolean;
  children: ReactNode;
}

/**
 * Settings group card. Thin wrapper around the shared brand SectionCard so all
 * settings pages share the same look (gold bar header, soft border, 14px radius).
 * `title` / `description` may be i18n keys or already translated strings.
 */
function SettingsSection({
  title,
  description,
  icon,
  actions,
  badge,
  noPadding,
  children
}: SectionProps) {
  return (
    <SectionCard
      title={title}
      description={description}
      icon={icon}
      actions={actions}
      badge={badge}
      noPadding={noPadding}
    >
      {children}
    </SectionCard>
  );
}

export default SettingsSection;
