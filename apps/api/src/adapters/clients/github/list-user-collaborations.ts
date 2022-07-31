import {
  Forbidden,
  RequiresAuthentication,
  Unknown,
  ValidationFailed,
} from './errors';
import type { HttpClient } from './interfaces/dependencies';
import type { GithubRepository } from './interfaces/repository';

export function createListUserCollaborations(httpClient: HttpClient) {
  return async (accessToken: unknown) => {
    try {
      const response = await httpClient.get<GithubRepository[]>(
        'https://api.github.com/user/repos?affiliation=collaborator&visibility=public&per_page=50',
        {
          headers: {
            authorization: `token ${accessToken}`,
            accept: 'application/vnd.github+json',
          },
        },
      );

      return response.data.map((repo) => {
        return {
          name: repo.name,
          owner: repo.owner.login,
          isPublic: !repo.private,
          isFork: repo.fork,
        };
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
          case 422: {
            throw new ValidationFailed();
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
