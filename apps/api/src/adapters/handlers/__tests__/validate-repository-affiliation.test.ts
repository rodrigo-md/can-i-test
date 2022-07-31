import { describe, test } from '@jest/globals';
import httpErrors from '../http-errors';
import { HttpContext } from '../interfaces/http';
import { createValidateRepositoryAffiliationHandler } from '../validate-repository-affiliation';
import githubErrors from '../../clients/github/errors';

describe('Validate repository affiliation handler', () => {
  test('returns 200 when the user authenticated is the repository owner', async () => {
    const username = 'octocat';
    const repositoryName = 'hello-world';
    const githubToken = 'gho_89as8d9as781e9hq9uhd';
    const result = makeResultOk({
      name: repositoryName,
      owner: username,
      isPublic: true,
      isFork: false,
    });
    const githubClient = {
      getRepository: jest.fn().mockResolvedValue(result),
      listUserCollaborations: jest.fn().mockResolvedValue([]),
    };
    const handler = createValidateRepositoryAffiliationHandler(githubClient);

    const ctxt = {
      pathParams: jest.fn().mockReturnValueOnce({ repositoryName }),
      retrieveFromStore: jest
        .fn()
        .mockReturnValueOnce(githubToken)
        .mockReturnValueOnce(username),
      status: jest.fn(),
      send: jest.fn(),
    };

    await handler(ctxt as unknown as HttpContext);

    expect(ctxt.retrieveFromStore).toHaveBeenCalledWith('githubToken');
    expect(ctxt.retrieveFromStore).toHaveBeenCalledWith('username');
    expect(ctxt.status).toHaveBeenCalledWith(200);
    expect(ctxt.send).toHaveBeenCalledWith({
      name: repositoryName,
      owner: username,
      isPublic: true,
      isFork: false,
    });
  });

  test("returns 200 when the repository is contained in the list of user's collaborations", async () => {
    const username = 'octocat';
    const repositoryName = 'hello-world';
    const githubToken = 'gho_89as8d9as781e9hq9uhd';
    const result = makeResultErr({ type: 'NotFound' });
    const githubClient = {
      getRepository: jest.fn().mockResolvedValue(result),
      listUserCollaborations: jest.fn().mockResolvedValue([
        {
          name: 'can-i-help',
          owner: 'rodrigo-md',
          isFork: true,
          isPublic: true,
        },
        {
          name: repositoryName,
          owner: username,
          isFork: false,
          isPublic: true,
        },
        {
          name: 'my-company-product',
          owner: 'boss',
          isFork: true,
          isPublic: true,
        },
      ]),
    };
    const handler = createValidateRepositoryAffiliationHandler(githubClient);

    const ctxt = {
      pathParams: jest.fn().mockReturnValueOnce({ repositoryName }),
      retrieveFromStore: jest
        .fn()
        .mockReturnValueOnce(githubToken)
        .mockReturnValueOnce(username),
      status: jest.fn(),
      send: jest.fn(),
    };

    await handler(ctxt as unknown as HttpContext);

    expect(githubClient.getRepository).toHaveBeenCalled();
    expect(githubClient.listUserCollaborations).toHaveBeenCalled();
    expect(ctxt.status).toHaveBeenCalledWith(200);
    expect(ctxt.send).toHaveBeenCalledWith({
      name: repositoryName,
      owner: username,
      isFork: false,
      isPublic: true,
    });
  });

  test("throws Http Not Found when the authenticated user doesn't own the repo neither is a collaboration", async () => {
    const result = makeResultErr({ type: 'NotFound' });
    const githubClient = {
      getRepository: jest.fn().mockResolvedValue(result),
      listUserCollaborations: jest.fn().mockResolvedValue([]),
    };
    const handler = createValidateRepositoryAffiliationHandler(githubClient);

    const ctxt = {
      pathParams: jest.fn().mockReturnValue({ repositoryName: 'supertest' }),
      retrieveFromStore: jest
        .fn()
        .mockReturnValueOnce('gho_a98sda8s9fya9')
        .mockReturnValueOnce('octocat'),
      status: jest.fn(),
    };

    await expect(() => handler(ctxt as unknown as HttpContext)).rejects.toThrow(
      httpErrors.NotFound,
    );
  });
  test('throws Http Not Found when the authenticated user is the owner but the repository is private', async () => {
    const result = makeResultOk({
      name: 'hello-world',
      owner: 'octocat',
      isPublic: false,
      isFork: false,
    });
    const githubClient = {
      getRepository: jest.fn().mockResolvedValue(result),
      listUserCollaborations: jest.fn().mockResolvedValue([]),
    };
    const handler = createValidateRepositoryAffiliationHandler(githubClient);

    const ctxt = {
      pathParams: jest.fn().mockReturnValue({ repositoryName: 'supertest' }),
      retrieveFromStore: jest
        .fn()
        .mockReturnValueOnce('gho_a98sda8s9fya9')
        .mockReturnValueOnce('octocat'),
      status: jest.fn(),
    };

    await expect(() => handler(ctxt as unknown as HttpContext)).rejects.toThrow(
      httpErrors.NotFound,
    );
  });

  test('throws Http Not Found when the authenticated user is the owner but the repository is a fork', async () => {
    const result = makeResultOk({
      name: 'hello-world',
      owner: 'octocat',
      isPublic: true,
      isFork: true,
    });
    const githubClient = {
      getRepository: jest.fn().mockResolvedValue(result),
      listUserCollaborations: jest.fn().mockResolvedValue([]),
    };
    const handler = createValidateRepositoryAffiliationHandler(githubClient);

    const ctxt = {
      pathParams: jest.fn().mockReturnValue({ repositoryName: 'supertest' }),
      retrieveFromStore: jest
        .fn()
        .mockReturnValueOnce('gho_a98sda8s9fya9')
        .mockReturnValueOnce('octocat'),
      status: jest.fn(),
    };

    await expect(() => handler(ctxt as unknown as HttpContext)).rejects.toThrow(
      httpErrors.NotFound,
    );
  });

  test("throws Http Not Found when the repository is found as a collaboration but it's private", async () => {
    const username = 'octocat';
    const repositoryName = 'hello-world';
    const githubToken = 'gho_89as8d9as781e9hq9uhd';
    const result = makeResultErr({ type: 'NotFound' });
    const githubClient = {
      getRepository: jest.fn().mockResolvedValue(result),
      listUserCollaborations: jest.fn().mockResolvedValue([
        {
          name: 'can-i-help',
          owner: 'rodrigo-md',
          isFork: true,
          isPublic: true,
        },
        {
          name: repositoryName,
          owner: username,
          isFork: false,
          isPublic: false,
        },
        {
          name: 'my-company-product',
          owner: 'boss',
          isFork: true,
          isPublic: true,
        },
      ]),
    };
    const handler = createValidateRepositoryAffiliationHandler(githubClient);

    const ctxt = {
      pathParams: jest.fn().mockReturnValueOnce({ repositoryName }),
      retrieveFromStore: jest
        .fn()
        .mockReturnValueOnce(githubToken)
        .mockReturnValueOnce(username),
      status: jest.fn(),
      send: jest.fn(),
    };

    await expect(() => handler(ctxt as unknown as HttpContext)).rejects.toThrow(
      httpErrors.NotFound,
    );
  });

  test("throws Http Not Found when the repository is found as a collaboration but it's a fork", async () => {
    const username = 'octocat';
    const repositoryName = 'hello-world';
    const githubToken = 'gho_89as8d9as781e9hq9uhd';
    const result = makeResultErr({ type: 'NotFound' });
    const githubClient = {
      getRepository: jest.fn().mockResolvedValue(result),
      listUserCollaborations: jest.fn().mockResolvedValue([
        {
          name: 'can-i-help',
          owner: 'rodrigo-md',
          isFork: true,
          isPublic: true,
        },
        {
          name: repositoryName,
          owner: username,
          isFork: true,
          isPublic: true,
        },
        {
          name: 'my-company-product',
          owner: 'boss',
          isFork: true,
          isPublic: true,
        },
      ]),
    };
    const handler = createValidateRepositoryAffiliationHandler(githubClient);

    const ctxt = {
      pathParams: jest.fn().mockReturnValueOnce({ repositoryName }),
      retrieveFromStore: jest
        .fn()
        .mockReturnValueOnce(githubToken)
        .mockReturnValueOnce(username),
      status: jest.fn(),
      send: jest.fn(),
    };

    await expect(() => handler(ctxt as unknown as HttpContext)).rejects.toThrow(
      httpErrors.NotFound,
    );
  });

  test('throw an Http 500 when receives a github validation error', async () => {
    const result = makeResultErr({ type: 'NotFound ' });
    const githubClient = {
      getRepository: jest.fn().mockResolvedValue(result),
      listUserCollaborations: jest
        .fn()
        .mockRejectedValue(new githubErrors.ValidationFailed()),
    };
    const handler = createValidateRepositoryAffiliationHandler(githubClient);

    const ctxt = {
      pathParams: jest.fn().mockReturnValue({ repositoryName: 'supertest' }),
      retrieveFromStore: jest
        .fn()
        .mockReturnValueOnce('gho_a98sda8s9fya9')
        .mockReturnValueOnce('octocat'),
      status: jest.fn(),
      send: jest.fn(),
    };

    await expect(() => handler(ctxt as unknown as HttpContext)).rejects.toThrow(
      httpErrors.InternalServerError,
    );
  });

  test('throw an Http 403 when receives a 403 looking for the repo in the list of collaborations', async () => {
    const result = makeResultErr({ type: 'NotFound' });
    const githubClient = {
      getRepository: jest.fn().mockResolvedValue(result),
      listUserCollaborations: jest
        .fn()
        .mockRejectedValue(new githubErrors.Forbidden()),
    };
    const handler = createValidateRepositoryAffiliationHandler(githubClient);

    const ctxt = {
      pathParams: jest.fn().mockReturnValue({ repositoryName: 'supertest' }),
      retrieveFromStore: jest
        .fn()
        .mockReturnValueOnce('gho_a98sda8s9fya9')
        .mockReturnValueOnce('octocat'),
      status: jest.fn(),
      send: jest.fn(),
    };

    await expect(() => handler(ctxt as unknown as HttpContext)).rejects.toThrow(
      httpErrors.Forbidden,
    );
  });

  test("throw an Http 403 when receives a 403 looking for the repo as one of the authenticated user's repos", async () => {
    const githubClient = {
      getRepository: jest.fn().mockRejectedValue(new githubErrors.Forbidden()),
      listUserCollaborations: jest.fn(),
    };
    const handler = createValidateRepositoryAffiliationHandler(githubClient);

    const ctxt = {
      pathParams: jest.fn().mockReturnValue({ repositoryName: 'supertest' }),
      retrieveFromStore: jest
        .fn()
        .mockReturnValueOnce('gho_a98sda8s9fya9')
        .mockReturnValueOnce('octocat'),
      status: jest.fn(),
      send: jest.fn(),
    };

    await expect(() => handler(ctxt as unknown as HttpContext)).rejects.toThrow(
      httpErrors.Forbidden,
    );
  });

  test('throw an Http 403 when receives a 401 looking for the repo in the list of collaborations', async () => {
    const result = makeResultErr({ type: 'NotFound' });
    const githubClient = {
      getRepository: jest.fn().mockResolvedValue(result),
      listUserCollaborations: jest
        .fn()
        .mockRejectedValue(new githubErrors.RequiresAuthentication()),
    };
    const handler = createValidateRepositoryAffiliationHandler(githubClient);

    const ctxt = {
      pathParams: jest.fn().mockReturnValue({ repositoryName: 'supertest' }),
      retrieveFromStore: jest
        .fn()
        .mockReturnValueOnce('gho_a98sda8s9fya9')
        .mockReturnValueOnce('octocat'),
      status: jest.fn(),
      send: jest.fn(),
    };

    await expect(() => handler(ctxt as unknown as HttpContext)).rejects.toThrow(
      httpErrors.Forbidden,
    );
  });

  test("throw an Http 403 when receives a 401 looking for the repo as one of the authenticated user's repos", async () => {
    const githubClient = {
      getRepository: jest
        .fn()
        .mockRejectedValue(new githubErrors.RequiresAuthentication()),
      listUserCollaborations: jest.fn(),
    };
    const handler = createValidateRepositoryAffiliationHandler(githubClient);

    const ctxt = {
      pathParams: jest.fn().mockReturnValue({ repositoryName: 'supertest' }),
      retrieveFromStore: jest
        .fn()
        .mockReturnValueOnce('gho_a98sda8s9fya9')
        .mockReturnValueOnce('octocat'),
      status: jest.fn(),
      send: jest.fn(),
    };

    await expect(() => handler(ctxt as unknown as HttpContext)).rejects.toThrow(
      httpErrors.Forbidden,
    );
  });

  test('throw an Http 502 when get an unknown error looking for the repo in the list of collaborations', async () => {
    const result = makeResultErr({ type: 'NotFound' });
    const githubClient = {
      getRepository: jest.fn().mockResolvedValue(result),
      listUserCollaborations: jest
        .fn()
        .mockRejectedValue(new githubErrors.Unknown('Server Unavailable')),
    };
    const handler = createValidateRepositoryAffiliationHandler(githubClient);

    const ctxt = {
      pathParams: jest.fn().mockReturnValue({ repositoryName: 'supertest' }),
      retrieveFromStore: jest
        .fn()
        .mockReturnValueOnce('gho_a98sda8s9fya9')
        .mockReturnValueOnce('octocat'),
      status: jest.fn(),
      send: jest.fn(),
    };

    await expect(() => handler(ctxt as unknown as HttpContext)).rejects.toThrow(
      httpErrors.BadGateway,
    );
  });

  test("throw an Http 502 when get an unknown error looking for the repo as one of the authenticated user's repos", async () => {
    const githubClient = {
      getRepository: jest
        .fn()
        .mockRejectedValue(new githubErrors.Unknown('Internal Server Error')),
      listUserCollaborations: jest.fn(),
    };
    const handler = createValidateRepositoryAffiliationHandler(githubClient);

    const ctxt = {
      pathParams: jest.fn().mockReturnValue({ repositoryName: 'supertest' }),
      retrieveFromStore: jest
        .fn()
        .mockReturnValueOnce('gho_a98sda8s9fya9')
        .mockReturnValueOnce('octocat'),
      status: jest.fn(),
      send: jest.fn(),
    };

    await expect(() => handler(ctxt as unknown as HttpContext)).rejects.toThrow(
      httpErrors.BadGateway,
    );
  });

  test('throw any other unexpected error', async () => {
    const result = makeResultOk({
      name: 'hello-world',
      owner: 'octocat',
      isPublic: true,
      isFork: false,
    });
    const customError = new TypeError('cannot parse invalid json');
    const githubClient = {
      getRepository: jest.fn().mockResolvedValue(result),
      listUserCollaborations: jest.fn(),
    };
    const handler = createValidateRepositoryAffiliationHandler(githubClient);
    const ctxt = {
      pathParams: jest.fn().mockReturnValue({ repositoryName: 'supertest' }),
      retrieveFromStore: jest
        .fn()
        .mockReturnValue('gho_a98sda8s9fya9')
        .mockReturnValueOnce('octocat'),
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

function makeResultOk(value) {
  return {
    isOk: () => true,
    isErr: () => false,
    value: value,
  };
}

function makeResultErr(value) {
  return {
    isOk: () => false,
    isErr: () => true,
    value: value,
  };
}
