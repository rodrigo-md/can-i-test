import { describe, test } from '@jest/globals';
import createGithubClient from '../index';
import { readdir } from 'fs/promises';
import * as path from 'path';

const EXCLUDED_FILES = ['index.ts', 'errors.ts'];

describe('Github client', () => {
  test('exported factory creates an object with methods named as the files in the directory', async () => {
    const methods = await getMethodNames(EXCLUDED_FILES);
    const httpClient = { get: jest.fn(), post: jest.fn() };
    const config = {
      clientId: '8918da9s8d12e',
      clientSecret: '1239e8asd9f97wedf',
    };

    const githubClient = createGithubClient(httpClient, config);

    expect(githubClient).toEqual(expect.any(Object));
    expect(Object.keys(githubClient).sort()).toEqual(methods.sort());

    Object.keys(githubClient).forEach((key) => {
      expect(githubClient[key]).toEqual(expect.any(Function));
    });
  });
});

function snakeToCamel(str: string) {
  return str
    .toLowerCase()
    .replace(/([-_][a-z])/g, (group) =>
      group.toUpperCase().replace('-', '').replace('_', ''),
    );
}

function removeExtension(str: string) {
  return str.replace(/\.[tj]s$/, '');
}

async function getMethodNames(excludedFiles: string[]) {
  const dirents = await readdir(path.resolve(__dirname, '..'), {
    withFileTypes: true,
  });

  return dirents
    .filter((dirent) => dirent.isFile() && !excludedFiles.includes(dirent.name))
    .map((dirent) => removeExtension(snakeToCamel(dirent.name)));
}
