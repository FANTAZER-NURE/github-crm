import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRepositoriesApi } from '../api/repositoriesApi';
import { Repository } from '../../../api/models';
import { RepositoriesResponse } from '../../../api/endpoints';
import { useToastActions } from '../../toast/hooks/useToastActions';
import { AxiosError } from 'axios';

/**
 * Custom hook for handling repository deletion operations
 * @param customShowSuccess - Optional custom function to show success toast
 * @param customShowError - Optional custom function to show error toast
 * @returns Functions and state for repository deletion
 */
export const useDeleteRepository = () => {
  const queryClient = useQueryClient();
  const { deleteRepository: apiDeleteRepository } = useRepositoriesApi();
  const { showSuccess, showError } = useToastActions();

  const { mutate: removeRepository, isLoading } = useMutation({
    mutationFn: apiDeleteRepository,
    // Use optimistic updates to prevent screen flicker
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey: ['userRepositories'] });

      const previousRepos = queryClient.getQueryData<RepositoriesResponse>([
        'userRepositories',
      ]);

      queryClient.setQueryData<RepositoriesResponse>(
        ['userRepositories'],
        (old) => {
          if (!old || !old.repositories) return old;

          return {
            ...old,
            repositories: old.repositories.filter(
              (repo: Repository) => repo.id !== id
            ),
          };
        }
      );

      return { previousRepos };
    },
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (error, _id, context) => {
      queryClient.setQueryData(['userRepositories'], context?.previousRepos);

      const errorMessage =
        error instanceof AxiosError
          ? error.response?.data.errorMessage
          : 'Unknown error occurred';
      showError(`Failed to delete repository: ${errorMessage}`);
    },
    onSettled: () => {
      // Refetch in the background after a short delay to ensure UI is smooth
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['userRepositories'] });
      }, 100);
    },
    onSuccess: () => {
      showSuccess('Repository deleted successfully');
    },
  });

  const deleteRepository = useCallback(
    (id: number, onSuccess?: () => void) => {
      removeRepository(id, {
        onSuccess: () => {
          onSuccess?.();
        },
      });
    },
    [removeRepository]
  );

  return {
    deleteRepository,
    isDeleting: isLoading,
  };
};
