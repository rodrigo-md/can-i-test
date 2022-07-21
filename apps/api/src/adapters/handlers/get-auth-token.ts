import { HttpContext } from './interfaces/http';
import { isGithubError } from '../clients/github/errors';
import httpErrors from './http-errors';
import { getAuthTokenUseCase } from '../../use-cases/get-auth-token';
import type {
  GithubClient,
  JWT,
  AuthTokenDTO,
} from '../../use-cases/get-auth-token';

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export const createGetAuthTokenHandler = (
  githubClient: GithubClient,
  jwt: JWT,
  config: Pick<AuthTokenDTO, 'jwtSecret'>
) => {
  return async (ctxt: HttpContext) => {
    const cookieConfig = { sameSite: 'none', secure: true };
    const { code = '' } = ctxt.queryParams();

    if (!isString(code) || code.length === 0) {
      throw new httpErrors.BadRequest('"code" query parameter must be a non empty string.');
    }

    try {
      const authTokenDTO = { ...config, authorizationCode: code };
      const { payload, signature } = await getAuthTokenUseCase(
        githubClient,
        jwt,
        authTokenDTO
      );

      ctxt.status(200);
      ctxt.cookie('auth', payload, cookieConfig);
      ctxt.cookie('token', signature, { ...cookieConfig, httpOnly: true });
      ctxt.send({ ...payload });
    } catch (err) {
      if (isGithubError(err)) {
        throw new httpErrors.BadGateway();
      }

      throw err;
    }
  };
};
