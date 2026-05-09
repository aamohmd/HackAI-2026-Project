import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi, type UserPreference } from '@/api/users';
import type { User } from '@/api/auth';

export const usePreferences = () => {
  const queryClient = useQueryClient();

  const { data: preferences, isLoading, error } = useQuery({
    queryKey: ['preferences'],
    queryFn: usersApi.getMePreferences, // I need to add this to usersApi
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<UserPreference>) => usersApi.updateMePreferences(data),
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: ['preferences'] });
      const previous = queryClient.getQueryData<UserPreference>(['preferences']);
      if (previous) {
        queryClient.setQueryData<UserPreference>(['preferences'], { ...previous, ...newData });
      }
      return { previous };
    },
    onError: (err, newData, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['preferences'], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['preferences'] });
    },
  });

  return {
    preferences,
    isLoading,
    error,
    updatePreferences: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  };
};
