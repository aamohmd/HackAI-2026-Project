import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { usePreferences } from '../hooks/usePreferences';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/shared/ui/card';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Button } from '@/shared/ui/button';
import { CircleNotch } from '@phosphor-icons/react';

interface GeneralFormValues {
  language: string;
  timezone: string;
}

const languages = [
  { value: 'en', label: 'English (US)' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
];

const timezones = [
  { value: 'UTC', label: '(GMT+00:00) UTC' },
  { value: 'EST', label: '(GMT-05:00) Eastern Time' },
  { value: 'PST', label: '(GMT-08:00) Pacific Time' },
  { value: 'CET', label: '(GMT+01:00) Central European Time' },
];

export const GeneralSection: React.FC = () => {
  const { preferences, isLoading, updatePreferences, isUpdating } = usePreferences();

  const {
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { isDirty },
  } = useForm<GeneralFormValues>({
    defaultValues: {
      language: preferences?.language ?? 'en',
      timezone: preferences?.timezone ?? 'UTC',
    },
  });

  useEffect(() => {
    if (preferences) {
      reset({
        language: preferences.language,
        timezone: preferences.timezone,
      });
    }
  }, [preferences, reset]);

  const onSubmit = (data: GeneralFormValues) => {
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
        <CardTitle>General Settings</CardTitle>
        <CardDescription>Manage your basic account settings and locale.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="language">Interface Language</Label>
            <Select 
              value={values.language} 
              onValueChange={(val) => setValue('language', val, { shouldDirty: true })}
            >
              <SelectTrigger id="language">
                <SelectValue placeholder="Select Language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Select 
              value={values.timezone} 
              onValueChange={(val) => setValue('timezone', val, { shouldDirty: true })}
            >
              <SelectTrigger id="timezone">
                <SelectValue placeholder="Select Timezone" />
              </SelectTrigger>
              <SelectContent>
                {timezones.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              'Save Changes'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
