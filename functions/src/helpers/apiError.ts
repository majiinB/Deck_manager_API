/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Represents a custom API error with an HTTP status code and optional details.
 *
 * @extends Error
 *
 * @property {number} statusCode - The HTTP status code associated with the error.
 * @property {any} [details] - Optional additional details about the error.
 *
 * @constructor
 * @param {string} message - The error message.
 * @param {number} [statusCode=500] - The HTTP status code (defaults to 500).
 * @param {any} [details] - Optional additional details about the error.
 */
export class ApiError extends Error {
  statusCode: number;
  details?: any;

  /**
   * Creates an instance of ApiError.
   *
   * @param {string} message - The error message.
   * @param {number} [statusCode=500] - The HTTP status code (defaults to 500).
   * @param {any} [details] - Optional additional details about the error.
   */
  constructor(message: string, statusCode = 500, details?: any) {
    super(message);
    Object.setPrototypeOf(this, ApiError.prototype);
    this.statusCode = statusCode;
    this.details = details;
  }
}
