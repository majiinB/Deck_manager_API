
/**
 * Represents a base response structure for API responses.
 *
 * @template T - The type of the data payload included in the response.
 */
export class BaseResponse<T> {
  /**
   * Indicates whether the operation was successful.
   */
  status: string;

  /**
   * A message providing additional information about the response.
   */
  message: string;

  /**
   * Optional data payload of type `T` included in the response.
   */
  data?: T;

  /**
   * Constructs a new instance of the `BaseResponse` class.
   *
   * @param {string} status - A string indicating the success of the operation.
   * @param {string} message - A string containing a message about the response.
   * @param {T} data - Optional data payload of type `T` to include in the response.
   */
  constructor(status: string, message: string, data?: T) {
    this.status = status;
    this.message = message;
    this.data = data;
  }
}
