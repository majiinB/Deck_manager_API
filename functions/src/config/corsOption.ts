import {CorsOptions} from "cors";

/**
 * Configuration options for CORS (Cross-Origin Resource Sharing).
 *
 * This object defines the behavior for handling CORS requests, including
 * dynamically validating the origin of incoming requests.
 *
 * @property origin - A function that determines whether a given origin is allowed
 * to access the resource. It logs the origin of the request and checks it against
 * a predefined list of allowed origins. If the origin is allowed or undefined,
 * the request is permitted; otherwise, an error is returned.
 *
 * @param origin - The origin of the incoming request as a string or undefined.
 * @param callback - A callback function to signal whether the request is allowed.
 *                   It accepts an error (if any) and a boolean indicating permission.
 *
 * @example
 * // Example of an allowed origin
 * const allowedOrigins = ["https://frontend.com"];
 * // If the request comes from "https://frontend.com", it will be allowed.
 *
 * @throws {Error} If the origin is not in the list of allowed origins.
 */
export const corsOptions: CorsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    console.log(`CORS Request from: ${origin}`);
    const allowedOrigins = [process.env.URL_ONE, process.env.URL_TWO];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true); // Allow request
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};
