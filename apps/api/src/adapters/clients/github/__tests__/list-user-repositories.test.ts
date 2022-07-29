import { describe, test } from '@jest/globals';
import { createListUserRepositories } from '../list-user-repositories';
import githubErrors from '../errors';
import type { HttpClient } from '../interfaces/dependencies';

describe('listUserRepositories method', () => {
  test('request public repositories on which the user is owner or collaborator', async () => {
    const githubToken = 'gho_asd098sdgv981239eas89d';
    const expectedQueryParams =
      'visibility=public&affiliation=owner,collaborator&per_page=50';
    const httpClient = {
      get: jest.fn().mockResolvedValue({ status: 200, data: [] }),
    };
    const listUserRepositories = createListUserRepositories(
      httpClient as unknown as HttpClient,
    );

    await listUserRepositories(githubToken);

    expect(httpClient.get).toHaveBeenCalledWith(
      expect.stringContaining('https://api.github.com/user/repos'),
      {
        headers: {
          accept: 'application/vnd.github+json',
          authorization: `token ${githubToken}`,
        },
      },
    );

    const [url] = httpClient.get.mock.calls[0];
    expectedQueryParams.split('&').forEach((query) => {
      expect(url).toEqual(expect.stringContaining(query));
    });
  });

  test('returns only the repositories names', async () => {
    const githubToken = 'gho_asd098sdgv981239eas89d';
    const response = {
      status: 200,
      data: [
        {
          id: 812,
          name: 'hello-world',
          full_name: 'octocat/hello-world',
          html_url: 'https://github.com/octocat/hello-world',
          url: 'https://api.github.com/repos/octocat/hello-world',
          owner: { id: 123, login: 'octocat' },
        },
        {
          id: 739,
          name: 'can-i-help',
          full_name: 'rodrigo-md/can-i-help',
          html_url: 'https://github.com/rodrigo-md/can-i-help',
          url: 'https://api.github.com/repos/rodrigo-md/can-i-help',
          owner: { id: 123, login: 'rodrigo-md' },
        },
      ],
    };
    const httpClient = {
      get: jest.fn().mockResolvedValue(response),
    };
    const listUserRepositories = createListUserRepositories(
      httpClient as unknown as HttpClient,
    );

    const result = await listUserRepositories(githubToken);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ name: 'hello-world' });
    expect(result[1]).toEqual({ name: 'can-i-help' });
  });

  test('throw RequiresAuthentication error when receives a 401 response', async () => {
    const githubToken = 'gho_asd098sdgv981239eas89d';
    const response = { status: 401 };
    const httpClient = {
      get: jest.fn().mockRejectedValue({ response }),
    };
    const listUserRepositories = createListUserRepositories(
      httpClient as unknown as HttpClient,
    );

    await expect(() => listUserRepositories(githubToken)).rejects.toThrow(
      githubErrors.RequiresAuthentication,
    );
  });

  test('throw Forbidden error when receives a 403 response', async () => {
    const githubToken = 'gho_asd098sdgv981239eas89d';
    const response = { status: 403 };
    const httpClient = {
      get: jest.fn().mockRejectedValue({ response }),
    };
    const listUserRepositories = createListUserRepositories(
      httpClient as unknown as HttpClient,
    );

    await expect(() => listUserRepositories(githubToken)).rejects.toThrow(
      githubErrors.Forbidden,
    );
  });

  test('throw ValidationFailed error when receives a 422 response', async () => {
    const githubToken = 'gho_asd098sdgv981239eas89d';
    const response = { status: 422 };
    const httpClient = {
      get: jest.fn().mockRejectedValue({ response }),
    };
    const listUserRepositories = createListUserRepositories(
      httpClient as unknown as HttpClient,
    );

    await expect(() => listUserRepositories(githubToken)).rejects.toThrow(
      githubErrors.ValidationFailed,
    );
  });

  test('throw any other error caught as it is', async () => {
    const githubToken = 'gho_asd098sdgv981239eas89d';
    const error = new TypeError('invalid token u in json');
    const httpClient = {
      get: jest.fn().mockRejectedValue(error),
    };
    const listUserRepositories = createListUserRepositories(
      httpClient as unknown as HttpClient,
    );

    await expect(() => listUserRepositories(githubToken)).rejects.toThrow(
      error,
    );
  });
});
