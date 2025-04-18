import { useCallback } from 'react';
import { Repository } from '../../../api/models';
import { deleteApi, getApi, postApi } from '../../../api/privateHttpClient';

export const useRepositoriesApi = () => {
  const searchRepositories = useCallback(
    async (searchTerm: string): Promise<Repository[]> => {
      if (!searchTerm.trim()) return [];

      try {
        const response = await getApi('/github/search', {
          query: searchTerm,
        });

        if (response) {
          return response.repositories || [];
        }

        return [];
      } catch (error) {
        console.error('Error searching repositories:', error);
        throw error;
      }
    },
    []
  );

  const getUserRepositories = useCallback(async (): Promise<Repository[]> => {
    try {
      const response = await getApi('/github/repositories', {});

      if (response && response.success) {
        return response.repositories || [];
      }

      return [];
    } catch (error) {
      console.error('Error fetching user repositories:', error);
      throw error;
    }
  }, []);

  const getRepositoryById = useCallback(
    async (id: number): Promise<Repository> => {
      const response = await getApi(
        `/github/repositories/${id}` as '/github/repositories/:id'
      );
      return response;
    },
    []
  );

  const createRepository = useCallback(
    async (
      repository: Repository | { repoPath: string }
    ): Promise<Repository> => {
      try {
        const response = await postApi('/github/repositories', repository);
        return response;
      } catch (error) {
        console.error('Error creating repository:', error);
        throw error;
      }
    },
    []
  );

  const refreshRepository = useCallback(
    async (id: number): Promise<Repository> => {
      const response = await getApi(
        `/github/repositories/refresh/${id}` as '/github/repositories/refresh/:id'
      );
      return response;
    },
    []
  );

  const deleteRepository = useCallback(
    async (id: number): Promise<{ success: boolean; message: string }> => {
      const response = await deleteApi(
        `/github/repositories/${id}` as '/github/repositories/:id'
      );
      return response;
    },
    []
  );

  return {
    searchRepositories,
    getUserRepositories,
    getRepositoryById,
    createRepository,
    refreshRepository,
    deleteRepository,
  };
};
