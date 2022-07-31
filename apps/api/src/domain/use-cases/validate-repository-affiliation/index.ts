import { Repository } from '../interfaces/repository';
import { NonExistentRepository } from './errors';
import type { ErrReason, RepositoryErrors, Result } from '../interfaces';

export interface GithubClient {
  getRepository(
    token: string,
    owner: string,
    repositoryName: string
  ): Promise<Result<Repository, ErrReason<RepositoryErrors.NotFound>>>;
  listUserCollaborations(token: unknown): Promise<Repository[]>;
}

export interface RepositoryAffiliationDTO {
  githubToken: string;
  username: string;
  repositoryName: string;
}

export const validateRepositoryAffiliationUseCase = async (
  githubClient: GithubClient,
  data: RepositoryAffiliationDTO,
): Promise<Repository> => {
  const { githubToken, username, repositoryName } = data;

  const result = await githubClient.getRepository(
    githubToken,
    username,
    repositoryName,
  );

  if (
    result.isErr() ||
    (result.isOk() && (!result.value.isPublic || result.value.isFork))
  ) {
    const repositories = await githubClient.listUserCollaborations(githubToken);
    const findings = repositories.filter(
      (repository) =>
        repository.name === repositoryName &&
        repository.isPublic &&
        !repository.isFork,
    );

    if (findings.length === 0) {
      throw new NonExistentRepository(repositoryName);
    }

    return findings[0];
  }

  return result.value;
};
