import { TErrorData } from './shared';

export class BliteError extends Error {
  constructor(public readonly meta: TErrorData) {
    super(`Server Error: ${meta.message}`);

    Object.setPrototypeOf(this, BliteError.prototype);
  }
}

export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly message: string = 'Something went wrong',
  ) {
    super(message);

    Object.setPrototypeOf(this, HttpError.prototype);
  }
}
