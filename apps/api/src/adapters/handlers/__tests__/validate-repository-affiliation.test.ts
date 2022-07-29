import { describe, test } from '@jest/globals';
import httpErrors from '../http-errors';
import { HttpContext } from '../interfaces/http';
import { createValidateRepositoryAffiliationHandler } from '../validate-repository-affiliation';
import githubErrors from '../../clients/github/errors';

describe('Validate repository affiliation handler', () => {
  test("throws Http Not Found when repository isn't in the user's repository list", async () => {
    const githubClient = {
      listUserRepositories: jest.fn().mockResolvedValue([]),
    };
    const handler = createValidateRepositoryAffiliationHandler(githubClient);

    const ctxt = {
      pathParams: jest.fn().mockReturnValue({ repositoryName: 'supertest' }),
      retrieveFromStore: jest.fn().mockReturnValue('gho_a98sda8s9fya9'),
      status: jest.fn(),
    };

    try {
      await handler(ctxt as unknown as HttpContext);
      expect.hasAssertions();
    } catch (e) {
      expect(ctxt.pathParams).toHaveBeenCalled();
      expect(e).toBeInstanceOf(httpErrors.NotFound);
    }
  });

  test("returns 200 when the repository is in the user's repository list", async () => {
    const githubClient = {
      listUserRepositories: jest.fn().mockResolvedValue([{ name: 'supertest' }]),
    };
    const handler = createValidateRepositoryAffiliationHandler(githubClient);

    const ctxt = {
      pathParams: jest.fn().mockReturnValue({ repositoryName: 'supertest' }),
      retrieveFromStore: jest.fn().mockReturnValue('gho_a98sda8s9fya9'),
      status: jest.fn(),
      send: jest.fn(),
    };

    await handler(ctxt as unknown as HttpContext);

    expect(ctxt.retrieveFromStore).toHaveBeenCalledWith('githubToken');
    expect(ctxt.status).toHaveBeenCalledWith(200);
    expect(ctxt.send).toHaveBeenCalledWith({ message: 'Ok' });
  });

  test('throw an Http 500 when receives a github validation error', async () => {
    const githubClient = {
      listUserRepositories: jest
        .fn()
        .mockRejectedValue(new githubErrors.ValidationFailed()),
    };
    const handler = createValidateRepositoryAffiliationHandler(githubClient);

    const ctxt = {
      pathParams: jest.fn().mockReturnValue({ repositoryName: 'supertest' }),
      retrieveFromStore: jest.fn().mockReturnValue('gho_a98sda8s9fya9'),
      status: jest.fn(),
      send: jest.fn(),
    };

    await expect(() => handler(ctxt as unknown as HttpContext)).rejects.toThrow(
      httpErrors.InternalServerError,
    );
  });

  test('throw an Http 403 when receives a github forbidden error', async () => {
    const githubClient = {
      listUserRepositories: jest
        .fn()
        .mockRejectedValue(new githubErrors.Forbidden()),
    };
    const handler = createValidateRepositoryAffiliationHandler(githubClient);

    const ctxt = {
      pathParams: jest.fn().mockReturnValue({ repositoryName: 'supertest' }),
      retrieveFromStore: jest.fn().mockReturnValue('gho_a98sda8s9fya9'),
      status: jest.fn(),
      send: jest.fn(),
    };

    await expect(() => handler(ctxt as unknown as HttpContext)).rejects.toThrow(
      httpErrors.Forbidden,
    );
  });

  test('throw an Http 403 when receives a github requires authentication error', async () => {
    const githubClient = {
      listUserRepositories: jest
        .fn()
        .mockRejectedValue(new githubErrors.RequiresAuthentication()),
    };
    const handler = createValidateRepositoryAffiliationHandler(githubClient);

    const ctxt = {
      pathParams: jest.fn().mockReturnValue({ repositoryName: 'supertest' }),
      retrieveFromStore: jest.fn().mockReturnValue('gho_a98sda8s9fya9'),
      status: jest.fn(),
      send: jest.fn(),
    };

    await expect(() => handler(ctxt as unknown as HttpContext)).rejects.toThrow(
      httpErrors.Forbidden,
    );
  });

  test('throw any other unexpected error', async () => {
    const githubClient = {
      listUserRepositories: jest.fn().mockResolvedValue([{ name: 'supertest' }]),
    };
    const handler = createValidateRepositoryAffiliationHandler(githubClient);
    const customError = new TypeError('cannot parse invalid json');
    const ctxt = {
      pathParams: jest.fn().mockReturnValue({ repositoryName: 'supertest' }),
      retrieveFromStore: jest.fn().mockReturnValue('gho_a98sda8s9fya9'),
      status: jest.fn(),
      send: jest.fn().mockImplementation(() => {
        throw customError;
      }),
    };

    await expect(() => handler(ctxt as unknown as HttpContext)).rejects.toThrow(
      customError,
    );
  });
});
