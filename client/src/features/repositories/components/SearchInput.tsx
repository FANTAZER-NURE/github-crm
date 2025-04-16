import React from 'react';
import { InputGroup, Tag } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import styles from '../styles/RepositoriesPage.module.scss';

// GitHub API requires at least 3 characters
const MIN_SEARCH_LENGTH = 3;

export interface SearchInputProps {
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  resultsCount?: number;
  searchQuery?: string;
  isSearching: boolean;
}

export const SearchInput: React.FC<SearchInputProps> = React.memo(
  ({
    searchTerm,
    onSearchChange,
    onClear,
    resultsCount,
    searchQuery,
    isSearching,
  }) => {
    const isValid = searchTerm.trim().length >= MIN_SEARCH_LENGTH;

    return (
      <div className={styles.searchContainer}>
        <InputGroup
          large
          placeholder="Search repositories..."
          value={searchTerm}
          onChange={onSearchChange}
          leftIcon={IconNames.SEARCH}
          rightElement={
            searchTerm.trim() ? (
              <Tag minimal interactive onClick={onClear}>
                Clear
              </Tag>
            ) : undefined
          }
        />
        {isValid &&
          !isSearching &&
          resultsCount !== undefined &&
          searchQuery && (
            <div className={styles.searchStats}>
              Found {resultsCount} repositories for "{searchQuery}"
            </div>
          )}
      </div>
    );
  }
);

export default SearchInput;
