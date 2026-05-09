import React, { useRef, useState } from 'react';
import { Camera, CircleNotch, User } from "@phosphor-icons/react";
import { usersApi } from '@/api/users';
import { useQueryClient } from '@tanstack/react-query';

interface AvatarUploadProps {
  currentAvatarUrl?: string | null;
}

export function AvatarUpload({ currentAvatarUrl }: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validation
    if (file.size > 2 * 1024 * 1024) {
      alert('File size exceeds 2MB limit');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      alert('Invalid file type. Please upload JPG, PNG or SVG.');
      return;
    }

    try {
      setIsUploading(true);
      await usersApi.uploadAvatar(file);
      await queryClient.invalidateQueries({ queryKey: ['profile'] });
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      alert('Failed to upload avatar. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div 
        onClick={triggerFileInput}
        className="relative w-32 h-32 rounded-full bg-muted border-4 border-card shadow-md cursor-pointer overflow-hidden group transition-all hover:border-primary/50"
      >
        {currentAvatarUrl ? (
          <img 
            src={currentAvatarUrl} 
            alt="Avatar" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <User size={48} weight="bold" />
          </div>
        )}

        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          {isUploading ? (
            <CircleNotch size={32} className="text-white animate-spin" />
          ) : (
            <Camera size={32} className="text-white" />
          )}
        </div>
      </div>
      
      <button 
        type="button"
        onClick={triggerFileInput}
        disabled={isUploading}
        className="text-sm font-medium text-primary hover:underline disabled:text-muted-foreground"
      >
        {isUploading ? 'Uploading...' : 'Change Avatar'}
      </button>

      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/svg+xml"
        className="hidden"
      />
      
      <p className="text-xs text-muted-foreground text-center">
        JPG, PNG or SVG. Max 2MB.
      </p>
    </div>
  );
}
