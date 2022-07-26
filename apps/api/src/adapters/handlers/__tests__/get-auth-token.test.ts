// eslint-disable @typescript-eslint/no-explicit-any
import { describe, test } from '@jest/globals';
import { HttpContext } from '../interfaces/http';
import { createGetAuthTokenHandler } from '../get-auth-token';
import githubErrors from '../../clients/github/errors';
import httpErrors from '../http-errors';

describe('GetAuthToken handler', () => {
  test('store a cookie with a JWT payload', async () => {
    const ctxt = createHttpContext();
    const githubClient = createGithubClient();
    const jwt = { sign: jest.fn().mockResolvedValueOnce('signedToken') };
    const handler = createGetAuthTokenHandler(githubClient, jwt, {
      jwtSecret: 'secret',
    });
    const payload = {
      username: 'octocat',
      homepage: 'https://github.com/octocat',
      avatarUrl: 'https://static.github.com/octocat',
    };

    ctxt.queryParams.mockReturnValueOnce({ code: 'asd' });
    await handler(ctxt as unknown as HttpContext);

    expect(ctxt.status).toHaveBeenCalledWith(200);
    expect(ctxt.cookie).toHaveBeenNthCalledWith(
      1,
      'auth',
      expect.objectContaining({ ...payload, exp: expect.any(Number) }),
      { sameSite: 'none', secure: true },
    );
    expect(ctxt.send).toHaveBeenCalledWith(
      expect.objectContaining({ ...payload, exp: expect.any(Number) }),
    );
  });

  test('store an httpOnly cookie with the JWT signature', async () => {
    const ctxt = createHttpContext();
    const githubClient = createGithubClient();
    const jwt = { sign: jest.fn().mockResolvedValueOnce('signedToken') };
    const handler = createGetAuthTokenHandler(githubClient, jwt, {
      jwtSecret: 'secret',
    });

    ctxt.queryParams.mockReturnValueOnce({ code: 'asd' });
    await handler(ctxt as unknown as HttpContext);

    expect(ctxt.status).toHaveBeenCalledWith(200);
    expect(ctxt.cookie).toHaveBeenNthCalledWith(
      2,
      'token',
      { githubToken: 'gho_189asdjhADAs8', signedToken: 'signedToken' },
      { sameSite: 'none', secure: true, httpOnly: true },
    );
  });

  test('throws BAD_REQUEST_ERROR when authorizationCode is empty', async () => {
    const ctxt = createHttpContext();
    const githubClient = createGithubClient();
    const jwt = { sign: jest.fn().mockResolvedValueOnce('signedToken') };
    const handler = createGetAuthTokenHandler(githubClient, jwt, {
      jwtSecret: 'secret',
    });

    ctxt.queryParams.mockReturnValueOnce({});
    expect(() => handler(ctxt as unknown as HttpContext)).rejects.toThrow(
      httpErrors.BadRequest,
    );
  });

  test.each`
    githubError
    ${new githubErrors.BadVerificationCode()}
    ${new githubErrors.IncorrectClientCredentials()}
  `(
    'throws BAD_GATEWAY_ERROR when github client fails trying to get an access token',
    async ({ githubError }) => {
      const ctxt = createHttpContext();
      const githubClient = createGithubClient({ raw: true });
      const jwt = { sign: jest.fn().mockResolvedValueOnce('signedToken') };
      ctxt.queryParams.mockReturnValueOnce({ code: 'a129as912zdx' });

      githubClient.getAccessToken.mockRejectedValue(githubError);
      const handler = createGetAuthTokenHandler(githubClient, jwt, {
        jwtSecret: 'secret',
      });

      await expect(handler(ctxt as unknown as HttpContext)).rejects.toThrow(
        httpErrors.BadGateway,
      );
    },
  );

  test.each`
    githubError
    ${new githubErrors.RequiresAuthentication()}
    ${new githubErrors.Forbidden()}
  `(
    'throws BAD_GATEWAY_ERROR when github client fails trying to get the authenticated user',
    async ({ githubError }) => {
      const ctxt = createHttpContext();
      const githubClient = createGithubClient({ raw: true });
      const jwt = { sign: jest.fn().mockResolvedValueOnce('signedToken') };
      githubClient.getAccessToken.mockResolvedValueOnce({
        accessToken: 'gho_a219a0s9',
      });
      ctxt.queryParams.mockReturnValueOnce({ code: 'a129as912zdx' });

      githubClient.getUser.mockRejectedValueOnce(githubError);
      const handler = createGetAuthTokenHandler(githubClient, jwt, {
        jwtSecret: 'secret',
      });

      await expect(handler(ctxt as unknown as HttpContext)).rejects.toThrow(
        httpErrors.BadGateway,
      );
    },
  );

  test('bubble up unknown errors', async () => {
    const ctxt = createHttpContext();
    const githubClient = createGithubClient({ raw: true });
    const jwt = { sign: jest.fn().mockResolvedValueOnce('signedToken') };
    const error = new Error('unhandled promise rejection');
    githubClient.getAccessToken.mockResolvedValueOnce({
      accessToken: 'gho_a219a0s9',
    });
    ctxt.queryParams.mockReturnValueOnce({ code: 'a129as912zdx' });

    githubClient.getUser.mockRejectedValueOnce(error);
    const handler = createGetAuthTokenHandler(githubClient, jwt, {
      jwtSecret: 'secret',
    });

    await expect(handler(ctxt as unknown as HttpContext)).rejects.toThrow(
      error,
    );
  });
});

function createHttpContext() {
  return {
    queryParams: jest.fn(),
    status: jest.fn(),
    cookie: jest.fn(),
    send: jest.fn(),
  };
}

function createGithubClient(
  options: { accessToken?: string; user?: any; raw?: boolean } = {},
) {
  const defaultToken = 'gho_189asdjhADAs8';
  const defaultUser = {
    username: 'octocat',
    homepage: 'https://github.com/octocat',
    avatarUrl: 'https://static.github.com/octocat',
  };
  const defaultClient = { getAccessToken: jest.fn(), getUser: jest.fn() };

  return options.raw
    ? defaultClient
    : {
      getAccessToken: jest.fn().mockResolvedValueOnce({
        accessToken: options.accessToken ?? defaultToken,
      }),
      getUser: jest.fn().mockResolvedValueOnce(options.user ?? defaultUser),
    };
}
