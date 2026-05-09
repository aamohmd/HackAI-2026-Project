import { useState } from 'react';
import { SettingsTabs } from '@/components/settings/SettingsTabs';
import { AppearanceSection } from '@/components/settings/AppearanceSection';
import { GeneralSection } from '@/components/settings/GeneralSection';
import { NotificationSection } from '@/components/settings/NotificationSection';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

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
        return (
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>Irreversible actions for your account.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="py-8 text-center text-muted-foreground border-2 border-dashed border-destructive/20 rounded-lg">
                Account deletion coming in Task 7...
              </div>
            </CardContent>
          </Card>
        );
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
