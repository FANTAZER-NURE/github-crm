import React, { useState, useCallback } from 'react';
import { InputGroup, Button, FormGroup, Callout } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRepositoriesApi } from '../api/repositoriesApi';
import styles from '../styles/RepositoriesPage.module.scss';
import { useAppDispatch } from '../../../redux/hooks';
import { showSuccess, showError } from '../../../redux/slices/toastSlice';
import { AxiosError } from 'axios';
/**
 * Component that allows users to add a GitHub repository directly using owner/repo path
 */
export const AddRepositoryByPath: React.FC = React.memo(() => {
  const [repoPath, setRepoPath] = useState('');
  const [isValidPath, setIsValidPath] = useState(true);
  
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const { createRepository } = useRepositoriesApi();

  const validatePath = useCallback((path: string) => {
    const isValid = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(path.trim());
    setIsValidPath(isValid);
    return isValid;
  }, []);

  const { mutate: addRepositoryByPath, isLoading } = useMutation({
    mutationFn: async (path: string) => {
      return createRepository({ repoPath: path });
    },
    onSuccess: () => {
      dispatch(
        showSuccess({
          message: 'Repository added successfully!',
        })
      );
      setRepoPath('');
      queryClient.invalidateQueries({ queryKey: ['userRepositories'] });
    },
    onError: (error) => {
      console.error('Error adding repository:', error);
      dispatch(
        showError({
          message:
            error instanceof AxiosError
              ? `Failed to add repository: ${error.response?.data.errorMessage}`
              : 'Failed to add repository',
        })
      );
    },
  });

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;
      setRepoPath(newValue);
      if (newValue) {
        validatePath(newValue);
      } else {
        setIsValidPath(true);
      }
    },
    [validatePath]
  );

  const handleSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      if (repoPath.trim() && validatePath(repoPath)) {
        addRepositoryByPath(repoPath.trim());
      }
    },
    [repoPath, validatePath, addRepositoryByPath]
  );

  return (
    <form onSubmit={handleSubmit} className={styles.addRepositoryForm}>
      <FormGroup
        label="Add repository by path"
        labelInfo="(e.g. facebook/react)"
        helperText={
          !isValidPath && repoPath
            ? "Please enter a valid repository path in the format 'owner/repository'"
            : "Enter a repository path and click 'Add'"
        }
        intent={!isValidPath && repoPath ? 'danger' : 'none'}
      >
        <div className={styles.inputWithButton}>
          <InputGroup
            placeholder="owner/repository"
            value={repoPath}
            onChange={handleInputChange}
            intent={!isValidPath && repoPath ? 'danger' : 'none'}
            rightElement={
              <Button
                icon={IconNames.PLUS}
                intent="primary"
                loading={isLoading}
                type="submit"
                disabled={!repoPath.trim() || !isValidPath}
              >
                Add
              </Button>
            }
          />
        </div>
      </FormGroup>
      <Callout
        intent="primary"
        icon={IconNames.INFO_SIGN}
        className={styles.addRepoCallout}
      >
        Add any GitHub repository directly by entering its path in the format{' '}
        <strong>owner/repository</strong>. The system will fetch all repository
        data automatically.
      </Callout>
    </form>
  );
});

export default AddRepositoryByPath;
