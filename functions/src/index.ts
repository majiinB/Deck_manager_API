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
 * @module index
 *
 * @author Arthur M. Artugue
 * @created 2024-03-26
 * @updated 2025-03-26
 */
import * as functions from "firebase-functions";
import express from "express";
import cors from "cors";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Deck Manager API is running",
  });
});

export const api = functions.https.onRequest(app);
