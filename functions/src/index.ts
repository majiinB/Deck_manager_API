/**
 * Deck manager API
 *
 * @file index.ts
 * @description This is the main entry point for the Deck API. It sets up the
 * Express application.
 *
 * Routes:
 * - /: Handles requests that checks if the server or API is up.
 *
 * Middleware:
 * - express.json(): Parses incoming request bodies in JSON format.
 * - errorHandler: Custom error handler middleware to log errors and return a
 *   422 Unprocessable Entity response.
 * - CORS policy: (Cross origin resource sharing) checks if the request came
 *   from a valid source.
 * - limiter: Controls the rate of request from a user (through IP).
 *
 * Functions:
 * - errorHandler: Middleware function for error handling.
 *
 * Server:
 * - Listens on port 5001.
 *
 * To start the server, run `firebase emulators:start`. The server will listen
 * on the specified port.
 *
 * @author Arthur M. Artugue
 * @created 2024-03-26
 * @updated 2025-03-27
 */
import * as functions from "firebase-functions";
import express from "express";
import {CorsOptions} from "cors";
import cors from "cors";
import rateLimit from "express-rate-limit";
import deckRoutes from "./routes/Routes";

/**
 * Error handler middleware.
 * Logs the error stack trace for debugging and returns appropriate HTTP responses.
 *
 * @param {Error} err - The error object.
 * @param {express.Request} req - The Express request object.
 * @param {express.Response} res - The Express response object.
 * @param {express.NextFunction} next - The next middleware function.
 * @return {void}
 */
function errorHandler(
  err: Error,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): void {
  if (err.message === "Not allowed by CORS") {
    res.status(403).json({message: "CORS policy blocked this request"});
  } else {
    res.status(422).json({
      error: "Unprocessable Entity, check your request data",
    });
  }
}

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
const corsOptions: CorsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    console.log(`CORS Request from: ${origin}`);
    const allowedOrigins = ["https://frontend.com"];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true); // Allow request
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

/**
 * Configures a rate limiter middleware to control the rate of incoming requests.
 *
 * @constant
 * @type {import("express-rate-limit").RateLimit}
 *
 * @property {number} windowMs - The time frame for which requests are checked/remembered, in milliseconds (1 minute).
 * @property {number} max - The maximum number of requests allowed per `windowMs` per IP address.
 * @property {object} message - The response body sent when the rate limit is exceeded.
 * @property {boolean} headers - Whether to include rate limit headers (`X-RateLimit-*`) in the response.
 * @property {function} handler - Custom handler function invoked when the rate limit is exceeded.
 *
 * @example
 * // Example usage in an Express app:
 * app.use(limiter);
 */
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 10 requests per windowMs
  message: {message: "Too many requests, please try again later."},
  headers: true, // Send `X-RateLimit-*` headers
  handler: (req, res, next) => {
    res.status(429).json({message: "Too many requests, please try again later."});
  },
});

const app = express();

// Middleware
app.use(cors(corsOptions));
app.use(limiter);
app.use(express.json());
app.use(errorHandler);

app.use("v1/decks", deckRoutes);
app.get("v1/", (req, res) => {
  res.json({
    message: "Deck Manager API is running",
  });
});

export const api = functions.https.onRequest(app);
