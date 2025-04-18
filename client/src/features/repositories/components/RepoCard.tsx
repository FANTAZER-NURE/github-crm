import {
  Card,
  Colors,
  H3,
  H4,
  IconSize,
  Text,
  Spinner,
  Icon,
} from '@blueprintjs/core';
import { Repository } from '../../../api/models';
import styles from '../styles/RepoCard.module.scss';
import { FlexContainer } from '../../../shared/ui/FlexContainer';
import { Avatar } from '../../../shared/ui/Avatar';
import { formatDate } from '../../../utils/formatDate';
import { IconNames } from '@blueprintjs/icons';
import { IconButton } from '../../../shared/ui/IconButton';
import { useCallback, useMemo } from 'react';
import React from 'react';

type RepoCardProps = {
  repo: Repository;
  onAdd: (repo: Repository) => void;
  onDelete: (repo: Repository) => void;
  onRefresh?: (repoId: number) => void;
  saved: boolean;
  isRefreshing?: boolean;
};

export const RepoCard: React.FC<RepoCardProps> = React.memo(
  ({ repo, onAdd, onDelete, onRefresh, saved, isRefreshing = false }) => {
    const formattedDate = useMemo(
      () => formatDate(repo.createdAt) || 'Unknown date',
      [repo.createdAt]
    );

    const handleAdd = useCallback(() => {
      onAdd(repo);
    }, [onAdd, repo]);

    const handleDelete = useCallback(() => {
      onDelete(repo);
    }, [onDelete, repo]);

    const handleRefresh = useCallback(() => {
      if (onRefresh) {
        onRefresh(repo.id);
      }
    }, [onRefresh, repo.id]);

    return (
      <Card key={repo.id} className={styles.repositoryCard}>
        <FlexContainer widthFull between>
          <H3 className={styles.repositoryName}>{repo.name}</H3>
          <FlexContainer gap={8}>
            {isRefreshing ? (
              <Spinner size={IconSize.LARGE} intent="primary" />
            ) : (
              <IconButton
                intent="primary"
                size={IconSize.LARGE}
                icon={IconNames.REFRESH}
                onClick={handleRefresh}
                title="Refresh repository data from GitHub"
              />
            )}
            {!saved ? (
              <IconButton
                intent="success"
                size={IconSize.LARGE}
                icon={IconNames.PLUS}
                onClick={handleAdd}
                title="Add to saved repositories"
              />
            ) : (
              <IconButton
                intent="danger"
                size={IconSize.LARGE}
                icon={IconNames.TRASH}
                onClick={handleDelete}
                title="Remove from saved repositories"
              />
            )}
          </FlexContainer>
        </FlexContainer>
        <FlexContainer gap={5} centeredY>
          <Avatar width={32} height={32} rounded url={repo.ownerAvatarUrl} />
          <H4 color={Colors.GRAY5} className={styles.repositoryOwner}>
            {repo.owner}
          </H4>
        </FlexContainer>
        <Text ellipsize className={styles.repositoryDescription}>
          {repo.description}
        </Text>
        <div className={styles.repositoryStats}>
          <span>⭐ {repo.stars}</span>
          <span>
            <Icon icon={IconNames.FORK} /> {repo.forks}
          </span>
          <span>🔍 {repo.issues}</span>
          <span title={`Created on ${formattedDate}`}>🕒 {formattedDate}</span>
        </div>
        <a
          href={repo.url}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.repositoryLink}
        >
          View on GitHub
        </a>
      </Card>
    );
  }
);
