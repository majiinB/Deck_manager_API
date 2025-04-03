/**
 * Deck Manager API - Router
 *
 * @file routes.ts
 * This module defines the routes for managing decks and flashcards in the Deck Manager API.
 * It provides endpoints for CRUD operations on decks and flashcards, including soft and hard deletion.
 *
 * Routes:
 * - GET api/v1/decks/: Retrieves all decks.
 * - GET api/v1/decks/:deckID: Retrieves a specific deck by its ID.
 * - POST api/v1/decks/: Creates a new deck.
 * - PUT api/v1/decks/:deckID: Updates an existing deck by its ID.
 * - DELETE api/v1/decks/:deckID: Hard deletes a deck by its ID.
 * - GET api/v1/decks/:deckID/flashcards: Retrieves all flashcards from a specific deck.
 * - GET api/v1/decks/:deckID/flashcards/:flashcardID: Retrieves a specific flashcard by its ID.
 * - POST api/v1/decks/:deckID/flashcards: Adds a new flashcard to a specific deck.
 * - PUT api/v1/decks/:deckID/flashcards/:flashcardID: Updates a specific flashcard by its ID.
 * - DELETE api/v1/decks/:deckID/flashcards/:flashcardID: Deletes a specific flashcard by its ID.
 *
 * @module router
 * @file Routes.ts
 * @author Arthur M. Artugue
 * @created 2024-03-27
 * @updated 2025-03-28
 */

import {Router, Request, Response} from "express";
import {DeckController} from "../controllers/DeckController";
import {FlashcardController} from "../controllers/FlashcardController";
import {DeckService} from "../services/DeckService";
import {DeckRepository} from "../repositories/DeckRepository";
import {FlashcardService} from "../services/FlashCardService";
import {FlashcardRepository} from "../repositories/FlashcardRepository";

// eslint-disable-next-line new-cap
const router = Router();

const deckService = new DeckService(new DeckRepository);
const deckController = new DeckController(deckService);

const flashcardService = new FlashcardService(new FlashcardRepository);
const flashcardController = new FlashcardController(flashcardService);

// DECK ROUTES

/**
 * @route GET /v1/decks/
 * @description Fetches all decks.
 * @group Decks - Operations related to flashcard decks
 * @returns {Object} 200 - A JSON object containing all decks
 * @returns {Error} 500 - Internal Server Error
 */
router.get("/", async (req: Request, res: Response) => {
  await deckController.getOwnerDecks(req, res);
});

/**
 * @route GET /v1/decks/public
 * @description Fetches all decks.
 * @group Decks - Operations related to flashcard decks
 * @returns {Object} 200 - A JSON object containing all decks
 * @returns {Error} 500 - Internal Server Error
 */
router.get("/public", async (req: Request, res: Response) => {
  await deckController.getPublicDecks(req, res);
});

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
router.post("/", async (req: Request, res: Response) => {
  await deckController.createDeck(req, res);
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
 * @route DELETE api/v1/decks/:deckID
 * @description Deletes a deck permanently (HARD delete perform SOFT deletion by updating the is_deleted flag).
 * @param {string} deckID - The unique identifier of the deck to delete (from URL params).
 * @returns {object} JSON response with a success message or an error.
 */
router.post("/delete", async (req: Request, res: Response) => {
  await deckController.deleteDeck(req, res);
});

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
  await flashcardController.createFlashcard(req, res);
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
