import { createGetUser } from './get-user';
import { createGetAccessToken } from './get-access-token';
import { createListUserCollaborations } from './list-user-collaborations';
import { createGetRepository } from './get-repository';
import type { HttpClient, GithubConfig } from './interfaces/dependencies';

export default (httpClient: HttpClient, config: GithubConfig) => {
  return {
    getUser: createGetUser(httpClient),
    getAccessToken: createGetAccessToken(httpClient, config),
    listUserCollaborations: createListUserCollaborations(httpClient),
    getRepository: createGetRepository(httpClient),
  };
};
