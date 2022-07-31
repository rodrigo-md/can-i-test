import { Forbidden, RequiresAuthentication, Unknown } from './errors';
import { ok, err } from '../../../domain/utilities';
import { RepositoryErrors } from '../../../domain/use-cases/interfaces';
import type { HttpClient } from './interfaces/dependencies';
import type { GithubRepository } from './interfaces/repository';
import type { Result, ErrReason } from '../../../domain/use-cases/interfaces';
import type { Repository } from '../../../domain/use-cases/interfaces/repository';

export function createGetRepository(httpClient: HttpClient) {
  return async (
    accessToken: string,
    owner: string,
    repositoryName: string,
  ): Promise<Result<Repository, ErrReason<RepositoryErrors.NotFound>>> => {
    try {
      const response = await httpClient.get<GithubRepository>(
        `https://api.github.com/repos/${owner}/${repositoryName}`,
        {
          headers: {
            authorization: `token ${accessToken}`,
            accept: 'application/vnd.github+json',
          },
        },
      );

      const {
        private: isPrivate,
        fork,
        parent = { owner: { login: '' } },
      } = response.data;

      return ok({
        name: repositoryName,
        owner: fork ? parent.owner.login : owner,
        isPublic: !isPrivate,
        isFork: fork,
      });
    } catch (e) {
      if (e.response && e.response.status) {
        switch (e.response.status) {
          case 401: {
            throw new RequiresAuthentication();
          }
          case 403: {
            throw new Forbidden();
          }
          case 404: {
            return err({
              type: RepositoryErrors.NotFound,
            });
          }
          default: {
            throw new Unknown(e.response.data);
          }
        }
      }
      throw e;
    }
  };
}
