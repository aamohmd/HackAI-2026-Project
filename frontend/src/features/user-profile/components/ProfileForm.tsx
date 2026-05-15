import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useProfile } from '../hooks/useProfile';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/shared/ui/card';
import { CircleNotch } from '@phosphor-icons/react';
import { AvatarUpload } from './AvatarUpload';

const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional().or(z.literal('')),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional().or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export const ProfileForm: React.FC = () => {
  const { profile, isLoading, updateProfile, isUpdating } = useProfile();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile?.full_name || '',
      bio: profile?.bio || '',
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        full_name: profile.full_name || '',
        bio: profile.bio || '',
      });
    }
  }, [profile, reset]);

  const onSubmit = (data: ProfileFormValues) => {
    updateProfile(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <CircleNotch className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="p-8 pb-0">
        <CardTitle className="text-2xl font-bold">Account Settings</CardTitle>
        <CardDescription>
          Update your profile information and manage how others see you.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6 p-8">
          <div className="flex justify-start py-4">
            <AvatarUpload currentAvatarUrl={profile?.avatar_url} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Phone Number
              </label>
              <Input
                value={profile?.phone_number || ''}
                readOnly
                className="bg-muted cursor-not-allowed border-none"
                title="Phone number cannot be changed"
              />
              <p className="text-[0.8rem] text-muted-foreground">
                Used for sign in and identity.
              </p>
            </div>

            <div className="space-y-2">
              <label 
                htmlFor="full_name"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Full Name
              </label>
              <Input
                id="full_name"
                placeholder="John Doe"
                {...register('full_name')}
                aria-invalid={!!errors.full_name}
              />
              {errors.full_name && (
                <p className="text-[0.8rem] font-medium text-destructive">
                  {errors.full_name.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label 
              htmlFor="bio"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Bio
            </label>
            <Textarea
              id="bio"
              placeholder="Tell us about yourself..."
              className="resize-none min-h-[120px]"
              {...register('bio')}
              aria-invalid={!!errors.bio}
            />
            {errors.bio && (
              <p className="text-[0.8rem] font-medium text-destructive">
                {errors.bio.message}
              </p>
            )}
            <p className="text-[0.8rem] text-muted-foreground">
              A brief description for your profile. Max 500 characters.
            </p>
          </div>
        </CardContent>
        <CardFooter className="p-8 pt-0 flex justify-end">
          <Button 
            type="submit" 
            disabled={isUpdating || !isDirty}
            className="w-full sm:w-auto px-8 h-11"
          >
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
