import { authenticateUserUseCase } from '../../domain/use-cases/authenticate-user';
import {
  JwtTokenExpired,
  CorruptedCookies,
} from '../../domain/use-cases/authenticate-user/errors';
import httpErrors from './http-errors';
import { HttpContext } from './interfaces/http';
import type {
  JWT,
  AuthCookie,
  TokenCookie,
} from '../../domain/use-cases/authenticate-user';
import type { ValidatorFactory } from '../services/validator';
import type { AuthConfig } from '../../domain/use-cases/authenticate-user';

const authCookieSchema = {
  type: 'object',
  properties: {
    username: {
      type: 'string',
    },
    homepage: {
      type: 'string',
    },
    avatarUrl: {
      type: 'string',
    },
    exp: {
      type: 'integer',
    },
  },
  required: ['username', 'homepage', 'avatarUrl', 'exp'],
  additionalProperties: false,
};

const tokenCookieSchema = {
  type: 'object',
  properties: {
    githubToken: {
      type: 'string',
    },
    signedToken: {
      type: 'string',
    },
  },
  required: ['githubToken', 'signedToken'],
  additionalProperties: false,
};

export const createAuthenticationHandler = (
  validatorFactory: ValidatorFactory,
  jwt: JWT,
  config: AuthConfig,
) => {
  const validatePublicCookie = validatorFactory<AuthCookie>(authCookieSchema);
  const validatePrivateCookie =
    validatorFactory<TokenCookie>(tokenCookieSchema);

  return async (ctxt: HttpContext) => {
    try {
      const cookies = ctxt.cookies<{ auth?: unknown; token?: unknown }>();

      const { valid: publicCookie } = validatePublicCookie(cookies.auth);
      const { valid: privateCookie } = validatePrivateCookie(cookies.token);

      if (!publicCookie || !privateCookie) {
        throw new httpErrors.Unauthorized();
      }

      await authenticateUserUseCase(jwt, publicCookie, privateCookie, config);

      ctxt.store('githubToken', privateCookie.githubToken);
      ctxt.next();
    } catch (e) {
      switch (true) {
        case e instanceof JwtTokenExpired:
        case e instanceof CorruptedCookies: {
          throw new httpErrors.Forbidden();
        }
        default: {
          throw e;
        }
      }
    }
  };
};
