import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi, type UserUpdate } from '../api/users';
import type { User } from '@/features/auth';

export const useProfile = () => {
  const queryClient = useQueryClient();

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile'],
    queryFn: usersApi.getMe,
  });

  const updateMutation = useMutation({
    mutationFn: (userData: UserUpdate) => usersApi.updateMe(userData),
    // Optimistic updates
    onMutate: async (newUserData) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['profile'] });

      // Snapshot the previous value
      const previousProfile = queryClient.getQueryData<User>(['profile']);

      // Optimistically update to the new value
      if (previousProfile) {
        queryClient.setQueryData<User>(['profile'], {
          ...previousProfile,
          ...newUserData,
        });
      }

      // Return a context object with the snapshotted value
      return { previousProfile };
    },
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (_err, _newUserData, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(['profile'], context.previousProfile);
      }
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  return {
    profile,
    isLoading,
    error,
    updateProfile: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  };
};
