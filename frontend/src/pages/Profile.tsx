import { ProfileForm } from '@/components/profile/ProfileForm';

export default function ProfilePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Profile Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account information and how you appear on the platform.
        </p>
      </div>
      
      <ProfileForm />
    </div>
  );
}
