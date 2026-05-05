export class InvalidStateError extends Error {
  constructor(message: string = 'Invalid OAuth state') {
    super(message);
    this.name = 'InvalidStateError';
  }
}
