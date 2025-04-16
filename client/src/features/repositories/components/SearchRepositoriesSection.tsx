import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { Spinner, NonIdealState, Callout } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import styles from '../styles/RepositoriesPage.module.scss';
import { Repository } from '../../../api/models';
import { useDeleteRepository } from '../hooks/use-delete-repository';
import { useRefreshRepository } from '../hooks/use-refresh-repository';
import SearchInput from './SearchInput';
import SearchResultsGrid from './SearchResultsGrid';
import { useToast } from '../../../contexts/ToastContext';
import { useRepositoriesApi } from '../api/repositoriesApi';

const SEARCH_DEBOUNCE_MS = 500;
const MIN_SEARCH_LENGTH = 3; // GitHub API requires at least 3 characters

/**
 * Main component that handles the search repository functionality
 */
export interface SearchRepositoriesSectionProps {
  greeting?: string;
}

export const SearchRepositoriesSection: React.FC<SearchRepositoriesSectionProps> =
  React.memo(() => {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

    const { refreshRepository, isRefreshing } = useRefreshRepository();
    const { getUserRepositories, createRepository, searchRepositories } =
      useRepositoriesApi();
    const { showSuccess, showError } = useToast();
    const { deleteRepository } = useDeleteRepository(showSuccess, showError);

    const queryClient = useQueryClient();

    const isSearchValid = useMemo(
      () => debouncedSearchTerm.trim().length >= MIN_SEARCH_LENGTH,
      [debouncedSearchTerm]
    );

    const { data: savedRepositories = [] } = useQuery({
      queryKey: ['userRepositories'],
      queryFn: () => getUserRepositories(),
      staleTime: 60000,
    });

    const {
      data: repositories = [],
      isFetching,
      isError,
      error,
    } = useQuery<Repository[], Error>({
      queryKey: ['repositories', debouncedSearchTerm],
      queryFn: () => searchRepositories(debouncedSearchTerm),
      enabled: isSearchValid,
      staleTime: 60000,
      retry: 1,
    });

    const { mutate: addRepository } = useMutation({
      mutationFn: (repo: Repository) => createRepository(repo),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['userRepositories'] });
        showSuccess('Repository added successfully!');
      },
      onError: (error) => {
        console.error('Error adding repository:', error);
        showError(
          error instanceof Error
            ? `Failed to add repository: ${error.message}`
            : 'Failed to add repository'
        );
      },
    });

    const handleSearchChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
      },
      []
    );

    const handleClearSearch = useCallback(() => {
      setSearchTerm('');
    }, []);

    const handleAddRepository = useCallback(
      (repo: Repository) => {
        addRepository(repo);
      },
      [addRepository]
    );

    useEffect(() => {
      const timerId = setTimeout(() => {
        setDebouncedSearchTerm(searchTerm);
      }, SEARCH_DEBOUNCE_MS);

      return () => {
        clearTimeout(timerId);
      };
    }, [searchTerm]);

    const renderContent = () => {
      if (isFetching && !repositories.length) {
        return (
          <div className={styles.loadingContainer}>
            <Spinner size={50} />
          </div>
        );
      }

      if (isError) {
        return (
          <NonIdealState
            icon={IconNames.ERROR}
            title="Error loading repositories"
            description={
              error instanceof Error
                ? `Error: ${error.message}`
                : 'There was an error loading the repositories. Please try again.'
            }
            action={
              <Callout intent="warning">
                Note: GitHub API has rate limits for unauthenticated requests.
                You may need to wait a few minutes if you've made too many
                requests.
              </Callout>
            }
          />
        );
      }

      if (!searchTerm.trim()) {
        return (
          <NonIdealState
            icon={IconNames.GIT_REPO}
            title="Search for repositories"
            description="Enter a search term to find repositories."
          />
        );
      }

      if (searchTerm.trim().length < MIN_SEARCH_LENGTH) {
        return (
          <NonIdealState
            icon={IconNames.INFO_SIGN}
            title="Keep typing..."
            description={`GitHub API requires at least ${MIN_SEARCH_LENGTH} characters to search.`}
          />
        );
      }

      if (repositories.length === 0) {
        return (
          <NonIdealState
            icon={IconNames.SEARCH}
            title="No repositories found"
            description="Try a different search term."
          />
        );
      }

      return (
        <SearchResultsGrid
          repositories={repositories}
          savedRepositories={savedRepositories}
          onAdd={handleAddRepository}
          onDelete={deleteRepository}
          onRefresh={refreshRepository}
          isRefreshing={isRefreshing}
          onError={showError}
        />
      );
    };

    return (
      <>
        <SearchInput
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          onClear={handleClearSearch}
          resultsCount={repositories.length}
          searchQuery={debouncedSearchTerm}
          isSearching={isFetching}
        />
        {renderContent()}
      </>
    );
  });

export default SearchRepositoriesSection;
