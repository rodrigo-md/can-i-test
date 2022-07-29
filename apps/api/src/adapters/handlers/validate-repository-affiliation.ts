import { validateRepositoryAffiliationUseCase } from '../../domain/use-cases/validate-repository-affiliation';
import type { HttpContext } from './interfaces/http';
import type { GithubClient } from '../../domain/use-cases/validate-repository-affiliation';
import httpErrors from './http-errors';
import githubErrors from '../clients/github/errors';
import { NonExistentRepository } from '../../domain/use-cases/validate-repository-affiliation/errors';

export const createValidateRepositoryAffiliationHandler = (
  githubClient: GithubClient,
) => {
  return async (ctxt: HttpContext) => {
    try {
      const { repositoryName } = ctxt.pathParams<{ repositoryName: string }>();
      const githubToken = ctxt.retrieveFromStore('githubToken');

      await validateRepositoryAffiliationUseCase(
        githubClient,
        githubToken,
        repositoryName,
      );

      ctxt.status(200);
      ctxt.send({ message: 'Ok' });
    } catch (e) {
      switch (true) {
        case e instanceof githubErrors.ValidationFailed: {
          throw new httpErrors.InternalServerError();
        }
        case e instanceof githubErrors.Forbidden:
        case e instanceof githubErrors.RequiresAuthentication: {
          throw new httpErrors.Forbidden();
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
