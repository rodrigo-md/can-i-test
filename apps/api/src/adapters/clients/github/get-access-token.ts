import {
  AccessTokenNotFound,
  BadVerificationCode,
  IncorrectClientCredentials,
} from './errors';
import type { GithubToken } from './interfaces/access-token';
import type { GithubConfig, HttpClient } from './interfaces/dependencies';

export function createGetAccessToken(
  httpClient: HttpClient,
  config: GithubConfig,
) {
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
