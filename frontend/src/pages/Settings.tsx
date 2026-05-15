import { useState } from 'react';
import { SettingsTabs, AppearanceSection, GeneralSection, NotificationSection, DangerZone } from '@/features/settings';
import { ProfileForm } from '@/features/user-profile';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageContainer } from '@/components/layout/PageContainer';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileForm />;
      case 'general':
        return <GeneralSection />;
      case 'notifications':
        return <NotificationSection />;
      case 'appearance':
        return <AppearanceSection />;
      case 'danger':
        return <DangerZone />;
      default:
        return null;
    }
  };

  return (
    <PageContainer maxWidth="xl">
      <PageHeader 
        title="Settings"
        description="Manage your account preferences and application settings."
      />

      <div className="flex flex-col md:flex-row gap-12 relative z-10">
        <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="flex-1 animate-in fade-in slide-in-from-right-4 duration-500">
          {renderContent()}
        </div>
      </div>
    </PageContainer>
  );
}
