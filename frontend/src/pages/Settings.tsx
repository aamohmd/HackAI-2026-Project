import { useState } from 'react';
import { SettingsTabs, AppearanceSection, GeneralSection, NotificationSection, DangerZone } from '@/features/settings';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');

  const renderContent = () => {
    switch (activeTab) {
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
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your account preferences and application settings.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="flex-1">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
