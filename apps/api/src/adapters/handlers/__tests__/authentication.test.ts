import { describe, test } from '@jest/globals';
import httpErrors from '../http-errors';
import { createAuthenticationHandler } from '../authentication';
import { HttpContext } from '../interfaces/http';
import { JWT } from '../../../use-cases/authenticate-user';

describe('Authentication middleware', () => {
  test('throw an HTTP Unauthorized error when public cookie is invalid', async () => {
    const validatePublicCookie = jest
      .fn()
      .mockReturnValue({ valid: false, errors: {} });
    const validatePrivateCookie = jest
      .fn()
      .mockReturnValue({ valid: false, errors: {} });
    const validationFactory = jest
      .fn()
      .mockReturnValueOnce(validatePublicCookie)
      .mockReturnValueOnce(validatePrivateCookie);
    const jwt = { sign: jest.fn() };
    const handler = createAuthenticationHandler(
      validationFactory,
      jwt as unknown as JWT,
    );
    const ctxt = {
      cookies: jest.fn().mockReturnValue({ auth: {} }),
    };

    await expect(() => handler(ctxt as unknown as HttpContext)).rejects.toThrow(
      httpErrors.Unauthorized,
    );
  });

  test('throw an HTTP Unauthorized error when private cookie is invalid', async () => {
    const authCookie = createFakeAuthCookie();
    const validatePublicCookie = jest
      .fn()
      .mockReturnValue({ valid: true, errors: null });
    const validatePrivateCookie = jest
      .fn()
      .mockReturnValue({ valid: false, errors: {} });
    const validationFactory = jest
      .fn()
      .mockReturnValueOnce(validatePublicCookie)
      .mockReturnValueOnce(validatePrivateCookie);
    const jwt = { sign: jest.fn() };
    const handler = createAuthenticationHandler(
      validationFactory,
      jwt as unknown as JWT,
    );
    const ctxt = {
      cookies: jest.fn().mockReturnValue({ auth: authCookie }),
    };

    await expect(() => handler(ctxt as unknown as HttpContext)).rejects.toThrow(
      httpErrors.Unauthorized,
    );
  });

  test('throw an Http Forbidden error when the signature calculated is not the same as the provided', async () => {
    const authCookie = createFakeAuthCookie();
    const tokenCookie = createFakeTokenCookie();
    const validatePublicCookie = jest
      .fn()
      .mockReturnValue({ valid: true, errors: null });
    const validatePrivateCookie = jest
      .fn()
      .mockReturnValue({ valid: true, errors: null });
    const validationFactory = jest
      .fn()
      .mockReturnValueOnce(validatePublicCookie)
      .mockReturnValueOnce(validatePrivateCookie);

    const jwt = {
      sign: jest.fn().mockResolvedValue('123AS8D9ASD.12EASasdasd.1289as9d'),
    };
    const handler = createAuthenticationHandler(
      validationFactory,
      jwt as unknown as JWT,
    );
    const ctxt = {
      cookies: jest
        .fn()
        .mockReturnValue({ auth: authCookie, token: tokenCookie }),
    };

    try {
      await handler(ctxt as unknown as HttpContext);
      expect.hasAssertions();
    } catch (e) {
      expect(jwt.sign).toHaveBeenCalledWith(
        {
          ...authCookie,
          githubToken: tokenCookie.githubToken,
        },
        expect.any(String),
      );
      expect(e).toBeInstanceOf(httpErrors.Forbidden);
    }
  });

  test('ends successfully when the signature calculated and the provided are the same', async () => {
    const authCookie = createFakeAuthCookie();
    const tokenCookie = createFakeTokenCookie();
    const { signedToken } = tokenCookie;
    const validatePublicCookie = jest
      .fn()
      .mockReturnValue({ valid: true, errors: null });
    const validatePrivateCookie = jest
      .fn()
      .mockReturnValue({ valid: true, errors: null });
    const validationFactory = jest
      .fn()
      .mockReturnValueOnce(validatePublicCookie)
      .mockReturnValueOnce(validatePrivateCookie);

    const jwt = {
      sign: jest.fn().mockResolvedValue(signedToken),
    };
    const handler = createAuthenticationHandler(
      validationFactory,
      jwt as unknown as JWT,
    );
    const ctxt = {
      cookies: jest
        .fn()
        .mockReturnValue({ auth: authCookie, token: tokenCookie }),
    };

    await handler(ctxt as unknown as HttpContext);
  });
});

function createFakeAuthCookie() {
  return {
    username: 'octocat',
    homepage: 'https://github.com/octocat',
    avatarUrl: 'https://avatar.github.com/octocat',
    exp: 1287178,
  };
}

function createFakeTokenCookie() {
  return {
    githubToken: 'gho_9120as98d192eqdfhf129w8edasdh',
    signedToken: '21e8q9w8e12ea.1238127r83as8das.129387129e7',
  };
}
