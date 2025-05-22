/**
 * Deck Manager API
 *
 * @file index.ts
 * @description This is the main entry point for the Deck Manager API. It sets up the
 * Express application.
 *
 * Routes:
 * - /: Handles requests that checks if the server or API is up.
 * - /decks: Handles requests tha manages deck resources and it subcollection flashcards.
 *
 * Middleware:
 * - express.json(): Parses incoming request bodies in JSON format.
 * - CORS policy: (Cross origin resource sharing) checks if the request came
 *   from a valid source.
 *
 * Server:
 * - Listens on port 5001. (Firebase Emulator)
 *
 * To start the server, run `firebase emulators:start`. The server will listen
 * on the specified port.
 *
 * @author Arthur M. Artugue
 * @created 2024-03-26
 * @updated 2025-04-02
 */
import * as functions from "firebase-functions";
import * as dotenv from "dotenv";
import express from "express";
import deckRoutes from "./routes/Routes";
import {AuthenticatedRequest} from "./interface/AuthenticatedRequest";
import {BaseResponse} from "./models/BaseResponse";
import {corsOptions} from "./config/corsOption";
import cors from "cors";
import {AuthenticationService} from "./services/AuthenticationService";
import {logRequest} from "./middleware/loggerMiddleware";
import {errorHandler} from "./middleware/errorHandler";

// Load environment variables from .env file
dotenv.config();

const app = express();
const baseResponse = new BaseResponse();
const authService = new AuthenticationService();

// Middlewares
app.use(cors(corsOptions));
// TODO: Add rate limiter
app.use(express.json());

// Middleware to verify Firebase token
app.use(authService.verifyFirebaseToken.bind(authService));
app.use(logRequest);

// Routes
app.use("/v1/decks", deckRoutes);
app.get("/v1", (req: AuthenticatedRequest, res) => {
  baseResponse.setStatus(200);
  baseResponse.setMessage("Deck Manager API is running");
  baseResponse.setData(null);

  res.status(200).json(baseResponse);
});

app.use(errorHandler);

// eslint-disable-next-line camelcase
export const deck_manager_api = functions.https.onRequest(app);
