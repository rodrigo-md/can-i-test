import { describe, test } from '@jest/globals';
import { createGetRepository } from '../get-repository';
import githubErrors from '../errors';
import type { HttpClient } from '../interfaces/dependencies';

describe('getRepository', () => {
  test('request a repository using the owner and the repository name given', async () => {
    const username = 'octocat';
    const repositoryName = 'hello-world';
    const accessToken = 'gho_912e0asd0q821edqd';
    const httpClient = {
      get: jest.fn().mockResolvedValue({ status: 200, data: [] }),
    };
    const getRepository = createGetRepository(
      httpClient as unknown as HttpClient,
    );

    getRepository(accessToken, username, repositoryName);

    expect(httpClient.get).toHaveBeenCalledWith(
      `https://api.github.com/repos/${username}/${repositoryName}`,
      {
        headers: {
          authorization: `token ${accessToken}`,
          accept: 'application/vnd.github+json',
        },
      },
    );
  });

  test('returns a repository with name, owner and if the repo is public', async () => {
    const username = 'octocat';
    const repositoryName = 'hello-world';
    const accessToken = 'gho_912e0asd0q821edqd';
    const response = {
      status: 200,
      data: {
        name: repositoryName,
        owner: {
          login: username,
          id: 1,
          type: 'User',
          avatar_url: 'https://github.com/images/error/octocat_happy.gif',
        },
        private: false,
        fork: false,
      },
    };
    const httpClient = { get: jest.fn().mockResolvedValue(response) };
    const getRepository = createGetRepository(
      httpClient as unknown as HttpClient,
    );

    const result = await getRepository(accessToken, username, repositoryName);

    expect(result.isOk()).toBe(true);
    expect(result.value).toEqual({
      name: repositoryName,
      owner: username,
      isPublic: true,
      isFork: false,
    });
  });

  test('indicates when the repository is a fork and returns original owner', async () => {
    const username = 'octocat';
    const repositoryName = 'hello-world';
    const accessToken = 'gho_912e0asd0q821edqd';
    const response = {
      status: 200,
      data: {
        name: repositoryName,
        parent: {
          owner: {
            login: 'rodrigo-md',
          },
        },
        owner: {
          login: username,
        },
        private: false,
        fork: true,
      },
    };
    const httpClient = { get: jest.fn().mockResolvedValue(response) };
    const getRepository = createGetRepository(
      httpClient as unknown as HttpClient,
    );

    const result = await getRepository(accessToken, username, repositoryName);

    expect(result.isOk()).toBe(true);
    expect(result.value).toEqual({
      name: repositoryName,
      owner: 'rodrigo-md',
      isPublic: true,
      isFork: true,
    });
  });

  test('throw RequiresAuthentication error when receives a 401', async () => {
    const username = 'octocat';
    const repositoryName = 'hello-world';
    const accessToken = 'gho_912e0asd0q821edqd';
    const response = { status: 401 };
    const httpClient = { get: jest.fn().mockRejectedValue({ response }) };
    const getRepository = createGetRepository(
      httpClient as unknown as HttpClient,
    );

    await expect(() =>
      getRepository(accessToken, username, repositoryName),
    ).rejects.toThrow(githubErrors.RequiresAuthentication);
  });

  test('throw Forbidden error when receives a 403', async () => {
    const username = 'octocat';
    const repositoryName = 'hello-world';
    const accessToken = 'gho_912e0asd0q821edqd';
    const response = { status: 403 };
    const httpClient = { get: jest.fn().mockRejectedValue({ response }) };
    const getRepository = createGetRepository(
      httpClient as unknown as HttpClient,
    );

    await expect(() =>
      getRepository(accessToken, username, repositoryName),
    ).rejects.toThrow(githubErrors.Forbidden);
  });

  test('returns a result error when the repository cannot be found', async () => {
    const username = 'octocat';
    const repositoryName = 'hello-world';
    const accessToken = 'gho_912e0asd0q821edqd';
    const response = { status: 404 };
    const httpClient = { get: jest.fn().mockRejectedValue({ response }) };
    const getRepository = createGetRepository(
      httpClient as unknown as HttpClient,
    );

    const result = await getRepository(accessToken, username, repositoryName);

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.value).toEqual(expect.any(Object));
      expect(result.value.type).toEqual('NotFound');
    }
  });

  test('throw any other error as it is', async () => {
    const username = 'octocat';
    const repositoryName = 'hello-world';
    const accessToken = 'gho_912e0asd0q821edqd';
    const customError = new Error('custom error');
    const httpClient = { get: jest.fn().mockRejectedValue(customError) };
    const getRepository = createGetRepository(
      httpClient as unknown as HttpClient,
    );

    await expect(() =>
      getRepository(accessToken, username, repositoryName),
    ).rejects.toThrow(customError);
  });

  test('throw any other http error as Unknown', async () => {
    const username = 'octocat';
    const repositoryName = 'hello-world';
    const accessToken = 'gho_912e0asd0q821edqd';
    const response = { status: 503, data: 'Service Unavailable' };
    const httpClient = { get: jest.fn().mockRejectedValue({ response }) };
    const getRepository = createGetRepository(
      httpClient as unknown as HttpClient,
    );

    await expect(() =>
      getRepository(accessToken, username, repositoryName),
    ).rejects.toThrow(githubErrors.Unknown);
  });
});
