import axios from "axios";
import {ApiError} from "../helpers/apiError";

interface CallFirebaseFunctionOptions {
  method: "GET" | "POST" | "PUT" | "DELETE";
  url: string; // full URL to the Firebase Function endpoint
  headers?: Record<string, string>;
  data?: unknown; // for POST/PUT requests
  params?: Record<string, unknown>; // for query params
  timeoutMs?: number;
}

// eslint-disable-next-line valid-jsdoc
/**
 * Calls a Firebase Function using axios.
 *
 * @param {CallFirebaseFunctionOptions} options - The options for the function call
 * @return The response data from the Firebase Function
 * @throws Error if the function call fails
 */
export async function callFirebaseFunction<T>(
  options: CallFirebaseFunctionOptions
): Promise<T> {
  try {
    const response = await axios.request<T>({
      method: options.method,
      url: options.url,
      headers: options.headers,
      data: options.data,
      params: options.params,
      timeout: options.timeoutMs || 20000, // 5s default timeout
    });

    return response.data;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log(error);
    throw new ApiError(
      error.message,
      error.response?.status || 500,
    );
  }
}
