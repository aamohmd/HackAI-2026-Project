import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { usePreferences } from '@/hooks/usePreferences';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/shared/ui/card';
import { Label } from '@/shared/ui/label';
import { Switch } from '@/shared/ui/switch';
import { Button } from '@/shared/ui/button';
import { CircleNotch } from '@phosphor-icons/react';

interface NotificationFormValues {
  marketing_emails: boolean;
  security_emails: boolean;
  update_emails: boolean;
}

export const NotificationSection: React.FC = () => {
  const { preferences, isLoading, updatePreferences, isUpdating } = usePreferences();

  const {
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { isDirty },
  } = useForm<NotificationFormValues>({
    defaultValues: {
      marketing_emails: preferences?.marketing_emails ?? false,
      security_emails: preferences?.security_emails ?? true,
      update_emails: preferences?.update_emails ?? true,
    },
  });

  useEffect(() => {
    if (preferences) {
      reset({
        marketing_emails: preferences.marketing_emails,
        security_emails: preferences.security_emails,
        update_emails: preferences.update_emails,
      });
    }
  }, [preferences, reset]);

  const onSubmit = (data: NotificationFormValues) => {
    updatePreferences(data);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <CircleNotch className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  const values = watch();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>Configure how you receive updates and alerts.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between space-x-2">
            <div className="flex flex-col space-y-1">
              <Label htmlFor="security_emails">Security Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Receive emails about your account security and login activity.
              </p>
            </div>
            <Switch
              id="security_emails"
              checked={values.security_emails}
              onCheckedChange={(checked) => setValue('security_emails', checked, { shouldDirty: true })}
            />
          </div>

          <div className="flex items-center justify-between space-x-2">
            <div className="flex flex-col space-y-1">
              <Label htmlFor="update_emails">Platform Updates</Label>
              <p className="text-sm text-muted-foreground">
                Receive emails about new features and platform improvements.
              </p>
            </div>
            <Switch
              id="update_emails"
              checked={values.update_emails}
              onCheckedChange={(checked) => setValue('update_emails', checked, { shouldDirty: true })}
            />
          </div>

          <div className="flex items-center justify-between space-x-2">
            <div className="flex flex-col space-y-1">
              <Label htmlFor="marketing_emails">Marketing Emails</Label>
              <p className="text-sm text-muted-foreground">
                Receive emails about special offers and promotions.
              </p>
            </div>
            <Switch
              id="marketing_emails"
              checked={values.marketing_emails}
              onCheckedChange={(checked) => setValue('marketing_emails', checked, { shouldDirty: true })}
            />
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button type="submit" disabled={isUpdating || !isDirty}>
            {isUpdating ? (
              <>
                <CircleNotch className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Preferences'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
