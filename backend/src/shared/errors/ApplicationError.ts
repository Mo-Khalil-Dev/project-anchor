export class ApplicationError extends Error {
  public readonly stack: string | undefined;

  constructor(
    public readonly code: string,
    public readonly message: string,
    public readonly statusCode: number = 500,
    public readonly details?: Record<string, any>,
    captureStack: boolean = true
  ) {
    super(message);
    this.name = 'ApplicationError';
    Object.setPrototypeOf(this, ApplicationError.prototype);

    if (captureStack) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toJSON(includeStack: boolean = false) {
    const response: Record<string, any> = {
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      details: this.details,
    };

    if (includeStack && this.stack) {
      response.stack = this.stack.split('\n');
    }

    return response;
  }
}
