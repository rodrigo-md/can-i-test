import githubErrors from '../clients/github/errors';
import httpErrors from './http-errors';
import { validateRepositoryAffiliationUseCase } from '../../domain/use-cases/validate-repository-affiliation';
import { NonExistentRepository } from '../../domain/use-cases/validate-repository-affiliation/errors';
import type { GithubClient } from '../../domain/use-cases/validate-repository-affiliation';
import type { HttpContext } from './interfaces/http';

export const createValidateRepositoryAffiliationHandler = (
  githubClient: GithubClient,
) => {
  return async (ctxt: HttpContext) => {
    try {
      const { repositoryName } = ctxt.pathParams<{ repositoryName: string }>();
      const githubToken = ctxt.retrieveFromStore<string>('githubToken');
      // TODO: store username in the authentication handler
      const username = ctxt.retrieveFromStore<string>('username');

      const repository = await validateRepositoryAffiliationUseCase(
        githubClient,
        {
          githubToken,
          repositoryName,
          username,
        },
      );

      ctxt.status(200);
      ctxt.send(repository);
    } catch (e) {
      switch (true) {
        case e instanceof githubErrors.ValidationFailed: {
          throw new httpErrors.InternalServerError();
        }
        case e instanceof githubErrors.Forbidden:
        case e instanceof githubErrors.RequiresAuthentication: {
          throw new httpErrors.Forbidden();
        }
        case e instanceof githubErrors.Unknown: {
          throw new httpErrors.BadGateway();
        }
        case e instanceof NonExistentRepository: {
          throw new httpErrors.NotFound();
        }
        default: {
          throw e;
        }
      }
    }
  };
};
