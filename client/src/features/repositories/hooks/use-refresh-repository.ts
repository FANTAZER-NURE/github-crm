import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRepositoriesApi } from '../api/repositoriesApi';
import { Repository } from '../../../api/models';
import { useToastActions } from '../../toast/hooks/useToastActions';
import { AxiosError } from 'axios';

type ApiResponse =
  | Repository
  | { success: boolean; message?: string; repository: Repository };

export const useRefreshRepository = () => {
  const { refreshRepository: apiRefreshRepository } = useRepositoriesApi();
  const [refreshingIds, setRefreshingIds] = useState<Record<number, boolean>>(
    {}
  );
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToastActions();

  const refreshRepository = useCallback(
    async (id: number) => {
      try {
        setRefreshingIds((prev) => ({ ...prev, [id]: true }));

        const response = (await apiRefreshRepository(id)) as ApiResponse;

        const refreshedRepo =
          'repository' in response ? response.repository : response;

        // 1. Invalidate saved repositories query to refresh from server
        queryClient.invalidateQueries({ queryKey: ['userRepositories'] });

        // 2. Update search results cache for the specific repo
        const searchQueries = queryClient.getQueriesData({
          queryKey: ['repositories'],
        });

        for (const [queryKey, data] of searchQueries) {
          if (Array.isArray(data)) {
            const updatedData = data.map((repo: Repository) =>
              repo.id === id
                ? {
                    ...repo,
                    stars: refreshedRepo.stars,
                    forks: refreshedRepo.forks,
                    issues: refreshedRepo.issues,
                    description: refreshedRepo.description || repo.description,
                  }
                : repo
            );

            queryClient.setQueryData(queryKey, updatedData);
          }
        }

        showSuccess(
          `Repository "${refreshedRepo.name}" refreshed successfully`
        );

        return refreshedRepo;
      } catch (error) {
        showError(
          `Failed to refresh repository: ${
            error instanceof AxiosError
              ? error.response?.data.errorMessage
              : 'Unknown error'
          }`
        );
        return;
      } finally {
        setRefreshingIds((prev) => ({ ...prev, [id]: false }));
      }
    },
    [apiRefreshRepository, queryClient, showError, showSuccess]
  );

  const isRefreshing = useCallback(
    (id: number) => {
      return !!refreshingIds[id];
    },
    [refreshingIds]
  );

  return {
    refreshRepository,
    isRefreshing,
    refreshingIds,
  };
};
