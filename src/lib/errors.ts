export class ApiError extends Error {
  status: number;
  retryAfter: string | null;

  constructor(message: string, status: number, retryAfter: string | null = null) {
    super(message);
    this.status = status;
    this.retryAfter = retryAfter;
  }
}
