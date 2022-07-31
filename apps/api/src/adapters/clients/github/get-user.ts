import { Forbidden, RequiresAuthentication } from './errors';
import type { HttpClient } from './interfaces/dependencies';
import type { GithubUser } from './interfaces/user';

export function createGetUser(httpClient: HttpClient) {
  return async (accessToken: string) => {
    try {
      const response = await httpClient.get<GithubUser>(
        'https://api.github.com/user',
        {
          headers: {
            authorization: `bearer ${accessToken}`,
            accept: 'application/vnd.github+json',
          },
        },
      );

      return {
        username: response.data.login,
        avatarUrl: response.data.avatar_url,
        homepage: response.data.html_url,
      };
    } catch (e) {
      if (e.response && e.response.status) {
        switch (e.response.status) {
          case 401: {
            throw new RequiresAuthentication();
          }
          case 403: {
            throw new Forbidden();
          }
        }
      }
      // TODO: throw new Unknown(e.message);
      throw e;
    }
  };
}
