import type { GithubToken } from './interfaces/github-token';
import type { GithubUser } from './interfaces/github-user';
import {
  BadVerificationCode,
  IncorrectClientCredentials,
  RequiresAuthentication,
  Forbidden,
  AccessTokenNotFound,
} from './errors';

interface GithubConfig {
  clientId: string;
  clientSecret: string;
}

interface HttpClient {
  get<T>(url: string, config?: unknown): Promise<{ status: number; data: T }>;
  post<T>(
    url: string,
    data: unknown,
    config?: unknown
  ): Promise<{ status: number; data: T }>;
}

function createGetAccessToken(httpClient: HttpClient, config: GithubConfig) {
  return async (authorizationCode: string) => {
    try {
      const response = await httpClient.post<GithubToken>(
        'https://github.com/login/oauth/access_token',
        {
          client_id: config.clientId,
          client_secret: config.clientSecret,
          code: authorizationCode,
          scope: 'read:user,user:email',
        },
        { headers: { accept: 'application/json' } },
      );

      return {
        accessToken: response.data.access_token,
      };
    } catch (e) {
      if (e.response && e.response.data && e.response.data.error) {
        switch (e.response.data.error) {
          case 'bad_verification_code': {
            throw new BadVerificationCode();
          }
          case 'incorrect_client_credentials': {
            throw new IncorrectClientCredentials();
          }
          case 'Not Found': {
            throw new AccessTokenNotFound();
          }
        }
      }
      throw e;
    }
  };
}

function createGetUser(httpClient: HttpClient) {
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
      throw e;
    }
  };
}

export default (httpClient: HttpClient, config: GithubConfig) => {
  return {
    getUser: createGetUser(httpClient),
    getAccessToken: createGetAccessToken(httpClient, config),
  };
};
