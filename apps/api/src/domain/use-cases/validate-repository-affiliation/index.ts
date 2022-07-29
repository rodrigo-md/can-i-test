import { NonExistentRepository } from './errors';

export interface GithubClient {
  listUserRepositories(token: unknown): Promise<{ name: string }[]>;
}

export const validateRepositoryAffiliationUseCase = async (
  githubClient: GithubClient,
  githubToken: unknown,
  repositoryName: string,
) => {
  const repositories = await githubClient.listUserRepositories(githubToken);
  const findings = repositories.filter(
    (repository) => repository.name === repositoryName,
  );

  if (findings.length === 0) {
    throw new NonExistentRepository(repositoryName);
  }
};
