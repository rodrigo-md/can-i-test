import { Forbidden, RequiresAuthentication, ValidationFailed } from './errors';
import type { HttpClient } from './interfaces/dependencies';
import type { GithubRepository } from './interfaces/repository';

export function createListUserRepositories(httpClient: HttpClient) {
  return async (accessToken: unknown) => {
    try {
      const response = await httpClient.get<GithubRepository[]>(
        'https://api.github.com/user/repos?affiliation=owner,collaborator&visibility=public&per_page=50',
        {
          headers: {
            authorization: `token ${accessToken}`,
            accept: 'application/vnd.github+json',
          },
        },
      );

      return response.data.map((repo) => ({ name: repo.name }));
    } catch (e) {
      if (e.response && e.response.status) {
        switch (e.response.status) {
          case 401: {
            throw new RequiresAuthentication();
          }
          case 403: {
            throw new Forbidden();
          }
          case 422: {
            throw new ValidationFailed();
          }
        }
      }
      throw e;
    }
  };
}
