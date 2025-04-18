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
import { Repository } from '../../../api/models';

/**
 * Repository grid component that renders repository cards
 */
export const RepositoryGrid: React.FC<{
  repositories: Repository[];
  onDelete: (id: number) => void;
  onRefresh: (id: number) => void;
  isRefreshing: (id: number) => boolean;
}> = React.memo(({ repositories, onDelete, onRefresh, isRefreshing }) => {
  return (
    <div className={styles.repositoryGrid}>
      {repositories.map((repo) => (
        <div className={styles.cardContainer} key={repo.id}>
          <RepoCard
            repo={repo}
            onAdd={EMPTY_FUNC}
            onDelete={() => onDelete(repo.id)}
            saved
            onRefresh={() => onRefresh(repo.id)}
            isRefreshing={isRefreshing(repo.id)}
          />
        </div>
      ))}
    </div>
  );
});

/**
 * Repository section component that handles fetching repositories and rendering
 * appropriate UI based on loading/error/empty states
 */
export const RepositoriesSection: React.FC = React.memo(() => {
  const { getUserRepositories } = useRepositoriesApi();
  const { deleteRepository } = useDeleteRepository();
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
      <NonIdealState
        icon={IconNames.ERROR}
        title="Error loading repositories"
        description="There was a problem loading your repositories. Please try again."
      />
    );
  }

  if (repositories.length === 0) {
    return (
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
    );
  }

  return (
    <RepositoryGrid
      repositories={repositories}
      onDelete={deleteRepository}
      onRefresh={refreshRepository}
      isRefreshing={isRefreshing}
    />
  );
});
