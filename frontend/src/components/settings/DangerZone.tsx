import React, { useState } from 'react';
import { WarningCircle } from "@phosphor-icons/react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DeleteAccountModal } from './DeleteAccountModal';

export const DangerZone: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <Card className="border-destructive/20 bg-destructive/5">
        <CardHeader>
          <div className="flex items-center gap-2 text-destructive">
            <WarningCircle size={24} weight="bold" />
            <CardTitle>Danger Zone</CardTitle>
          </div>
          <CardDescription className="text-destructive/80">
            These actions are irreversible and will result in the permanent loss of your account data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-destructive/20 rounded-lg bg-background">
            <div className="space-y-0.5">
              <p className="font-semibold text-sm">Delete Account</p>
              <p className="text-xs text-muted-foreground">
                Once you delete your account, there is no going back. Please be certain.
              </p>
            </div>
            <Button 
              variant="destructive" 
              onClick={() => setIsModalOpen(true)}
            >
              Delete my account
            </Button>
          </div>
        </CardContent>
      </Card>

      <DeleteAccountModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};
