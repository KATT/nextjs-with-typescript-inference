export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly message: string = 'Something went wrong',
  ) {
    super(message);

    Object.setPrototypeOf(this, HttpError.prototype);
  }
}
