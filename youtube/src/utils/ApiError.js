export class ApiError extends Error {
  constructor(status, message, success, stack) {
    super(message);
    this.status = status;
    (this.message = message), (this.success = success);
  }
}
