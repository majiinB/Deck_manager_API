/**
 * Deck Manager API - Router
 *
 * @file routes.ts
 * This module defines the routes for managing decks and flashcards in the Deck Manager API.
 * It sets up the API endpoints by associating URL paths with the corresponding controller methods,
 * enabling CRUD operations on decks and flashcards.
 *
 * Deck Routes:
 * - GET /v1/decks/: Fetches all decks.
 * - GET /v1/decks/public: Fetches all public decks.
 * - GET /v1/decks/:deckID: Fetches a specific deck by its ID.
 * - POST /v1/decks/: Creates a new deck.
 * - PUT /v1/decks/:deckID: Updates an existing deck by its ID.
 * - POST /v1/decks/delete: Deletes a deck (HARD delete perform SOFT deletion by updating the is_deleted flag).
 *
 * Flashcard Routes:
 * - GET /v1/decks/:deckID/flashcards: Retrieves all flashcards from a specific deck.
 * - GET /v1/decks/:deckID/flashcards/random: Retrieves a randomized selection of flashcards from a specific deck.
 * - GET /v1/decks/:deckID/flashcards/:flashcardID: Retrieves a specific flashcard by its ID.
 * - POST /v1/decks/:deckID/flashcards: Adds a new flashcard to a specific deck.
 * - PUT /v1/decks/:deckID/flashcards/:flashcardID: Updates a specific flashcard by its ID.
 * - POST /v1/decks/:deckID/flashcards/delete: Deletes one or more flashcards from a specific deck.
 *
 * @module router
 * @file Routes.ts
 * @author Arthur M. Artugue
 * @created 2024-03-30
 * @updated 2025-05-16
 */

import {Router, Request, Response} from "express";
import {DeckController} from "../controllers/DeckController";
import {FlashcardController} from "../controllers/FlashcardController";
import {DeckService} from "../services/DeckService";
import {DeckRepository} from "../repositories/DeckRepository";
import {FlashcardService} from "../services/FlashCardService";
import {FlashcardRepository} from "../repositories/FlashcardRepository";
import {asyncHandler} from "../middleware/asyncHandler";

// eslint-disable-next-line new-cap
const router = Router();
const flashcardService = new FlashcardService(new FlashcardRepository);
const deckService = new DeckService(new DeckRepository, flashcardService);
const deckController = new DeckController(deckService);
const flashcardController = new FlashcardController(flashcardService);

// DECK ROUTES

/**
 * @route GET /v1/decks/
 * @description Fetches all decks.
 * @group Decks - Operations related to flashcard decks
 * @returns {Object} 200 - A JSON object containing all decks
 * @returns {Error} 500 - Internal Server Error
 */
router.get("/", asyncHandler(deckController.getOwnerDecks.bind(deckController)));

/**
 * @route GET /v1/decks/public
 * @description Fetches all decks.
 * @group Decks - Operations related to flashcard decks
 * @returns {Object} 200 - A JSON object containing all decks
 * @returns {Error} 500 - Internal Server Error
 */
router.get("/public", asyncHandler(deckController.getPublicDecks.bind(deckController)));

/**
 * @route GET /v1/decks/deleted
 * @description Fetches all deleted decks (only flagged as deleted).
 * @group Decks - Operations related to flashcard decks
 * @returns {Object} 200 - A JSON object containing all decks
 * @returns {Error} 500 - Internal Server Error
 */
router.get("/deleted", asyncHandler(deckController.getOwnerDeletedDecks.bind(deckController)));

/**
 * @route GET /v1/decks/saved
 * @description Fetches all user saved decks.
 * @group Decks - Operations related to flashcard decks
 * @returns {Object} 200 - A JSON object containing all decks
 * @returns {Error} 500 - Internal Server Error
 */
router.get("/saved", asyncHandler(deckController.getSavedDecks.bind(deckController)));

/**
 * @route GET /v1/decks/search
 * @description Searches for a deck.
 * @group Decks - Operations related to flashcard decks
 * @returns {Object} 200 - A JSON object containing all decks
 * @returns {Error} 500 - Internal Server Error
 */
router.get("/search", asyncHandler(deckController.searchDeck.bind(deckController)));

/**
 * @route GET api/v1/decks/recommend
 * @description Recommends public decks based on the user's preferences.
 * @returns {object} JSON response with a success message or an error.
 */
router.get("/recommend", asyncHandler(deckController.recommendPublicDecks.bind(deckController)));

/**
 * @route GET /v1/decks/:deckID
 * @description Fetches a specific deck by its unique identifier.
 * @group Decks - Operations related to flashcard decks
 *
 * @param {string} deckID.path - The unique identifier of the deck.
 *
 * @returns {Object} 200 - A JSON object containing the requested deck.
 * @returns {Error} 404 - Deck not found.
 * @returns {Error} 500 - Internal server error.
 */
router.get("/:deckID", async (req: Request, res: Response) => {
  await deckController.getSpecifiDeck(req, res);
});

/**
 * @route POST /v1/decks/
 * @description Creates a new flashcard deck.
 * @group Decks - Operations related to flashcard decks
 *
 * @param {Object} req.body - The request body containing deck details.
 * @param {string} req.body.title - The title of the deck.
 * @param {string} req.body.coverPhoto - (Optional) Cover photo URL of the deck.
 *
 * @returns {Object} 201 - A JSON object containing the created deck.
 * @returns {Error} 400 - Bad request, missing required fields.
 * @returns {Error} 500 - Internal server error.
 */
router.post("/", asyncHandler(deckController.createDeck.bind(deckController)));

/**
 * @route POST /v1/decks/save/:deckID
 * @description Saves a new flashcard deck.
 * @group Decks - Operations related to flashcard decks
 *
 * @param {Object} req.body - The request body containing deck details.
 * @param {string} req.body.title - The title of the deck.
 * @param {string} req.body.coverPhoto - (Optional) Cover photo URL of the deck.
 *
 * @returns {Object} 201 - A JSON object containing the created deck.
 * @returns {Error} 400 - Bad request, missing required fields.
 * @returns {Error} 500 - Internal server error.
 */
router.post("/save/:deckID", async (req: Request, res: Response) => {
  await deckController.saveDeck(req, res);
});

/**
 * @route POST /v1/decks/unsave/:deckID
 * @description Saves a new flashcard deck.
 * @group Decks - Operations related to flashcard decks
 *
 * @param {Object} req.body - The request body containing deck details.
 * @param {string} req.body.title - The title of the deck.
 * @param {string} req.body.coverPhoto - (Optional) Cover photo URL of the deck.
 *
 * @returns {Object} 201 - A JSON object containing the created deck.
 * @returns {Error} 400 - Bad request, missing required fields.
 * @returns {Error} 500 - Internal server error.
 */
router.post("/unsave/:deckID", async (req: Request, res: Response) => {
  await deckController.unsaveDeck(req, res);
});

/**
 * @route DELETE api/v1/decks/:deckID
 * @description Deletes a deck permanently (HARD delete perform SOFT deletion by updating the is_deleted flag).
 * @param {string} deckID - The unique identifier of the deck to delete (from URL params).
 * @returns {object} JSON response with a success message or an error.
 */
router.post("/delete", async (req: Request, res: Response) => {
  await deckController.deleteDeck(req, res);
});

/**
 * @route PUT api/v1/decks/:deckID
 * @description Updates an existing deck.
 * @param {string} deckID - The unique identifier of the deck to update (from URL params).
 * @body {string} [title] - The updated title of the deck (optional).
 * @body {string} [coverPhoto] - The updated cover photo URL (optional).
 * @body {boolean} [isPrivate] - Whether the deck is private or public (optional).
 * @body {boolean} [isDeleted] - Whether the deck is marked as deleted (optional).
 * @body {string} [madeToQuizAt] - Timestamp of when the deck was last converted to a quiz (optional).
 * @returns {object} JSON response with a success message or an error.
 */
router.put("/:deckID", async (req: Request, res: Response) => {
  await deckController.updateDeck(req, res);
});

/**
 * @route POST api/v1/decks/log/activity
 * @description Logs activity related to a deck.
 * @returns {object} JSON response with a success message or an error.
 */
router.post("/log/activity", asyncHandler(deckController.logDeckActivity.bind(deckController)));

/**
 * @route POST api/v1/decks/log/activity
 * @description Logs activity related to a deck.
 * @returns {object} JSON response with a success message or an error.
 */
router.post("/log/quiz", asyncHandler(deckController.logQuizAttemp.bind(deckController)));

/**
 * @route POST api/v1/decks/log/activity
 * @description Logs activity related to a deck.
 * @returns {object} JSON response with a success message or an error.
 */
router.get("/log/activity", asyncHandler(deckController.getLatestDeckActivity.bind(deckController)));

/**
 * @route POST api/v1/decks/log/activity
 * @description Logs activity related to a deck.
 * @returns {object} JSON response with a success message or an error.
 */
router.get("/log/quiz", asyncHandler(deckController.getLatestQuizAttempt.bind(deckController)));


// FLASHCARDS ROUTES

/**
 * @route GET /v1/decks/:deckID/flashcards
 * @description Fetches all flashcards.
 * @group Decks - Operations related to flashcard decks
 * @param {string} deckID - The unique identifier of the deck where the flashcard is found (from URL params).
 * @returns {Object} 200 - A JSON object containing all decks
 * @returns {Error} 500 - Internal Server Error
 */
router.get("/:deckID/flashcards", async (req: Request, res: Response) => {
  await flashcardController.getFlashcards(req, res);
});

/**
 * @route GET api/v1/decks/:deckID/flashcards/random
 * @description Randomly fetches a certain number of flashcards.
 * @group Decks - Operations related to flashcard decks
 * @param {string} deckID - The unique identifier of the deck where the flashcard is found (from URL params).
 * @returns {Object} 200 - A JSON object containing all decks
 * @returns {Error} 500 - Internal Server Error
 */
router.get("/:deckID/flashcards/random", async (req: Request, res: Response) => {
  await flashcardController.getRandomFlashcards(req, res);
});

/**
 * @route GET api/v1/decks/:deckID/flascards/:flashcardID
 * @description Fetches a specific deck by its unique identifier.
 * @group Decks - Operations related to flashcard decks
 *
 * @param {string} flashcardID - The unique identifier of the deck.
 * @param {string} deckID - The unique identifier of the deck where the flashcard is found (from URL params).

 * @returns {Object} 200 - A JSON object containing the requested deck.
 * @returns {Error} 404 - Deck not found.
 * @returns {Error} 500 - Internal server error.
 */
router.get("/:deckID/flashcards/:flashcardID", async (req: Request, res: Response) => {
  await flashcardController.getSpecificFlashcard(req, res);
});

/**
 * @route POST api/v1/decks/:deckID/flashcards
 * @description Creates a new flashcard.
 * @group Decks - Operations related to flashcard
 *
 * @param {string} deckID - The unique identifier of the deck where the flashcard is found (from URL params).
 * @param {Object} req.body - The request body containing deck details.
 * @param {string} req.body.term - The term of the flashcard.
 * @param {string} req.body.definition - The definition of the flashcard.
 *
 * @returns {Object} 201 - A JSON object containing the created deck.
 * @returns {Error} 400 - Bad request, missing required fields.
 * @returns {Error} 500 - Internal server error.
 */
router.post("/:deckID/flashcards", async (req: Request, res: Response) => {
  await flashcardController.createFlashcards(req, res);
});

/**
 * @route PUT api/v1/decks/:deckID
 * @description Updates an existing deck.
 * @param {string} deckID - The unique identifier of the deck where the flashcard is found (from URL params).
 * @param {string} flashcardID - The unique identifier of the flashcard to update (from URL params).
 * @body {string} [term] - The updated term of the flashcard (optional).
 * @body {string} [definition] - The updated definition of the flashcard (optional).
 * @body {boolean} [isStarred] - Whether the flaschard is marked (optional).
 * @body {boolean} [isDeleted] - Whether the flashcard is marked as deleted (optional).
 * @returns {object} JSON response with a success message or an error.
 */
router.put("/:deckID/flashcards/:flashcardID", async (req: Request, res: Response) => {
  await flashcardController.updateFlashcard(req, res);
}); // update a flashcard

/**
 * @route DELETE api/v1/decks/:deckID/flashcards/:flashcardID
 * @description Deletes a deck permanently.
 * @param {string} deckID - The unique identifier of the the deck where the flashcard belongs (from URL params).
 * @param {string} flaschardID - The unique identifier of the flashcard to delete (from URL params).
 * @returns {object} JSON response with a success message or an error.
 */
router.post("/:deckID/flashcards/delete", async (req: Request, res: Response) => {
  await flashcardController.deleteFlashcard(req, res);
});

export default router;
