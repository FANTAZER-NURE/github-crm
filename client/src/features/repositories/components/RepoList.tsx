import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { useRepositoriesApi } from '../api/repositoriesApi';
import { RepoCard } from './RepoCard';
import { useDeleteRepository } from '../hooks/use-delete-repository';
import { useRefreshRepository } from '../hooks/use-refresh-repository';
import { IconNames } from '@blueprintjs/icons';
import { Button, NonIdealState, Spinner } from '@blueprintjs/core';
import styles from '../styles/RepositoriesPage.module.scss';
import { EMPTY_FUNC } from '../../../utils/placeholders';
import { useToast } from '../../../contexts/ToastContext';

/**
 * Repository list component that handles fetching, loading states, and rendering repository cards
 */
export const RepoList = React.memo(() => {
  const { getUserRepositories } = useRepositoriesApi();
  const { showSuccess, showError } = useToast();
  const { deleteRepository } = useDeleteRepository(showSuccess, showError);
  const { refreshRepository, isRefreshing } = useRefreshRepository();

  const {
    data: repositories = [],
    isFetching,
    isError,
  } = useQuery({
    queryKey: ['userRepositories'],
    queryFn: getUserRepositories,
  });

  if (isFetching && repositories.length === 0) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner size={50} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.pageContainer}>
        <NonIdealState
          icon={IconNames.ERROR}
          title="Error loading repositories"
          description="There was a problem loading your repositories. Please try again."
        />
      </div>
    );
  }

  if (repositories.length === 0) {
    return (
      <div className={styles.pageContainer}>
        <NonIdealState
          icon={IconNames.GIT_REPO}
          title="No repositories found"
          description="You don't have any saved repositories yet. Go to the search page to add repositories."
          action={
            <Button
              intent="primary"
              icon={IconNames.SEARCH}
              text="Search Repositories"
              onClick={() => (window.location.href = '/')}
            />
          }
        />
      </div>
    );
  }

  return (
    <>
      {repositories.map((repo) => (
        <div className={styles.cardContainer} key={repo.id}>
          <RepoCard
            repo={repo}
            onAdd={EMPTY_FUNC}
            onDelete={() => deleteRepository(repo.id)}
            saved
            onRefresh={() => refreshRepository(repo.id)}
            isRefreshing={isRefreshing(repo.id)}
          />
        </div>
      ))}
    </>
  );
});
