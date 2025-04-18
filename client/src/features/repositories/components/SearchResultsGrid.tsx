import React, { useCallback } from 'react';
import { Repository } from '../../../api/models';
import { RepoCard } from './RepoCard';
import { EMPTY_FUNC } from '../../../utils/placeholders';
import styles from '../styles/RepositoriesPage.module.scss';

/**
 * Search results grid component that displays repositories in a grid layout
 */
export interface SearchResultsGridProps {
  repositories: Repository[];
  savedRepositories: Repository[];
  onAdd: (repo: Repository) => void;
  onDelete: (id: number) => void;
  onRefresh: (id: number) => void;
  isRefreshing: (id: number) => boolean;
  onError: (message: string) => void;
}

export const SearchResultsGrid: React.FC<SearchResultsGridProps> = React.memo(
  ({
    repositories,
    savedRepositories,
    onAdd,
    onDelete,
    onRefresh,
    isRefreshing,
    onError,
  }) => {
    // Helper to check if a repository is saved
    const isRepositorySaved = useCallback(
      (repo: Repository) => {
        return savedRepositories.some(
          (savedRepo) =>
            savedRepo.owner === repo.owner && savedRepo.name === repo.name
        );
      },
      [savedRepositories]
    );

    // Helper to get the saved repository ID
    const getSavedRepositoryId = useCallback(
      (repo: Repository): number | null => {
        const savedRepo = savedRepositories.find(
          (savedRepo) =>
            savedRepo.owner === repo.owner && savedRepo.name === repo.name
        );
        return savedRepo ? savedRepo.id : null;
      },
      [savedRepositories]
    );

    return (
      <div className={styles.repositoryGrid}>
        {repositories.map((repo: Repository) => {
          const saved = isRepositorySaved(repo);

          // Handle delete with correct database ID
          const handleDelete = () => {
            const savedId = getSavedRepositoryId(repo);
            if (savedId) {
              onDelete(savedId);
            } else {
              onError('Error: Could not find repository in database');
            }
          };

          return (
            <div className={styles.cardContainer} key={repo.id}>
              <RepoCard
                repo={repo}
                onAdd={saved ? EMPTY_FUNC : onAdd}
                onDelete={saved ? handleDelete : EMPTY_FUNC}
                onRefresh={() => onRefresh(repo.id)}
                saved={saved}
                isRefreshing={isRefreshing(repo.id)}
              />
            </div>
          );
        })}
      </div>
    );
  }
);

export default SearchResultsGrid;
