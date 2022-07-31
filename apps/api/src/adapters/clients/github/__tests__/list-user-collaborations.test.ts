import { describe, test } from '@jest/globals';
import { createListUserCollaborations } from '../list-user-collaborations';
import githubErrors from '../errors';
import type { HttpClient } from '../interfaces/dependencies';

describe('listUserCollaborations method', () => {
  test('request public repositories on which the user a collaborator', async () => {
    const githubToken = 'gho_asd098sdgv981239eas89d';
    const expectedQueryParams =
      'visibility=public&affiliation=collaborator&per_page=50';
    const httpClient = {
      get: jest.fn().mockResolvedValue({ status: 200, data: [] }),
    };
    const listUserCollaborations = createListUserCollaborations(
      httpClient as unknown as HttpClient,
    );

    await listUserCollaborations(githubToken);

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

  test('returns a list of repositories', async () => {
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
          private: false,
          fork: false,
        },
        {
          id: 739,
          name: 'can-i-help',
          full_name: 'rodrigo-md/can-i-help',
          html_url: 'https://github.com/rodrigo-md/can-i-help',
          url: 'https://api.github.com/repos/rodrigo-md/can-i-help',
          owner: { id: 123, login: 'rodrigo-md' },
          private: true,
          fork: false,
        },
      ],
    };
    const httpClient = {
      get: jest.fn().mockResolvedValue(response),
    };
    const listUserCollaborations = createListUserCollaborations(
      httpClient as unknown as HttpClient,
    );

    const result = await listUserCollaborations(githubToken);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      name: 'hello-world',
      owner: 'octocat',
      isPublic: true,
      isFork: false,
    });
    expect(result[1]).toEqual({
      name: 'can-i-help',
      owner: 'rodrigo-md',
      isPublic: false,
      isFork: false,
    });
  });

  test('throw RequiresAuthentication error when receives a 401 response', async () => {
    const githubToken = 'gho_asd098sdgv981239eas89d';
    const response = { status: 401 };
    const httpClient = {
      get: jest.fn().mockRejectedValue({ response }),
    };
    const listUserCollaborations = createListUserCollaborations(
      httpClient as unknown as HttpClient,
    );

    await expect(() => listUserCollaborations(githubToken)).rejects.toThrow(
      githubErrors.RequiresAuthentication,
    );
  });

  test('throw Forbidden error when receives a 403 response', async () => {
    const githubToken = 'gho_asd098sdgv981239eas89d';
    const response = { status: 403 };
    const httpClient = {
      get: jest.fn().mockRejectedValue({ response }),
    };
    const listUserCollaborations = createListUserCollaborations(
      httpClient as unknown as HttpClient,
    );

    await expect(() => listUserCollaborations(githubToken)).rejects.toThrow(
      githubErrors.Forbidden,
    );
  });

  test('throw ValidationFailed error when receives a 422 response', async () => {
    const githubToken = 'gho_asd098sdgv981239eas89d';
    const response = { status: 422 };
    const httpClient = {
      get: jest.fn().mockRejectedValue({ response }),
    };
    const listUserCollaborations = createListUserCollaborations(
      httpClient as unknown as HttpClient,
    );

    await expect(() => listUserCollaborations(githubToken)).rejects.toThrow(
      githubErrors.ValidationFailed,
    );
  });

  test('throw any other error caught as it is', async () => {
    const githubToken = 'gho_asd098sdgv981239eas89d';
    const error = new TypeError('invalid token u in json');
    const httpClient = {
      get: jest.fn().mockRejectedValue(error),
    };
    const listUserCollaborations = createListUserCollaborations(
      httpClient as unknown as HttpClient,
    );

    await expect(() => listUserCollaborations(githubToken)).rejects.toThrow(
      TypeError,
    );
  });

  test('throw any other http error as Unknown', async () => {
    const githubToken = 'gho_asd098sdgv981239eas89d';
    const response = { status: 500, data: 'Internal Server Error' };
    const httpClient = {
      get: jest.fn().mockRejectedValue({ response }),
    };
    const listUserCollaborations = createListUserCollaborations(
      httpClient as unknown as HttpClient,
    );

    await expect(() => listUserCollaborations(githubToken)).rejects.toThrow(
      githubErrors.Unknown,
    );
  });
});
