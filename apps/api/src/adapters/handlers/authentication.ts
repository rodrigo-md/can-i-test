import { authenticateUserUseCase } from '../../use-cases/authenticate-user';
import httpErrors from './http-errors';
import { HttpContext } from './interfaces/http';
import type {
  JWT,
  AuthCookie,
  TokenCookie,
} from '../../use-cases/authenticate-user';

export const createAuthenticationHandler = (
  validationFactory: any,
  jwt: JWT,
) => {
  const validatePublicCookie = validationFactory();
  const validatePrivateCookie = validationFactory();

  return async (ctxt: HttpContext) => {
    try {
      const cookies = ctxt.cookies<{ auth?: unknown; token?: unknown }>();

      const { valid: isPublicCookieValid } = validatePublicCookie(cookies.auth);
      const { valid: isPrivateCookieValid } = validatePrivateCookie(
        cookies.token,
      );

      if (!isPublicCookieValid || !isPrivateCookieValid) {
        throw new httpErrors.Unauthorized();
      }

      // TODO: store githubtoken for posteriori handlers
      await authenticateUserUseCase(
        jwt,
        cookies.auth as unknown as AuthCookie,
        cookies.token as unknown as TokenCookie,
      );
    } catch (e) {
      if (!(e instanceof httpErrors.Unauthorized)) {
        throw new httpErrors.Forbidden();
      }
      throw e;
    }
  };
};
