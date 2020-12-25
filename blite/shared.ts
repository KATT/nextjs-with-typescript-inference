import { TErrorData } from './server';

export class BliteError extends Error {
  constructor(public readonly meta: TErrorData) {
    super(`Server Error: ${meta.message}`);

    Object.setPrototypeOf(this, BliteError.prototype);
  }
}
