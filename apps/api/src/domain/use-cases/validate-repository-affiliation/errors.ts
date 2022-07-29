export class NonExistentRepository extends Error {
  constructor(repositoryName: string) {
    super(`User doesn't own nor collaborate on ${repositoryName}`);

    Object.setPrototypeOf(this, NonExistentRepository.prototype);
  }
}
