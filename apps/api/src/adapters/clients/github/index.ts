import { createGetUser } from './get-user';
import { createGetAccessToken } from './get-access-token';
import type { HttpClient, GithubConfig } from './interfaces/dependencies';

export default (httpClient: HttpClient, config: GithubConfig) => {
  return {
    getUser: createGetUser(httpClient),
    getAccessToken: createGetAccessToken(httpClient, config),
  };
};
