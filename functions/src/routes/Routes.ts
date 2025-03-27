/**
 * Deck Manager API - Router
 *
 * @file routes.ts
 * This module defines the routes for managing decks and flashcards in the Deck Manager API.
 * It provides endpoints for CRUD operations on decks and flashcards, including soft and hard deletion.
 *
 * Routes:
 * - GET api/v1/decks/: Retrieves all decks.
 * - GET /:deckID: Retrieves a specific deck by its ID.
 * - POST /: Creates a new deck.
 * - PUT /:deckID: Updates an existing deck by its ID.
 * - DELETE /:deckID/soft: Soft deletes a deck by its ID.
 * - DELETE /:deckID/hard: Hard deletes a deck by its ID.
 * - GET /:deckID/flashcards: Retrieves all flashcards from a specific deck.
 * - GET /:deckID/flashcards/:flashcardID: Retrieves a specific flashcard by its ID.
 * - POST /:deckID/flashcards: Adds a new flashcard to a specific deck.
 * - PUT /:deckID/flashcards/:flashcardID: Updates a specific flashcard by its ID.
 * - DELETE /:deckID/flashcards/:flashcardID: Deletes a specific flashcard by its ID.
 *
 * @module router
 * @file Routes.ts
 * @author Arthur M. Artugue
 * @created 2024-03-27
 * @updated 2025-03-27
 */

import {Router, Request, Response} from "express";
import {DeckController} from "../controllers/DeckController";

// eslint-disable-next-line new-cap
const router = Router();
const deckController = new DeckController();

/**
 * @route GET api/v1/decks/
 * @description Fetches all decks.
 * @group Decks - Operations related to flashcard decks
 * @returns {Object} 200 - A JSON object containing all decks
 * @returns {Error} 500 - Internal Server Error
 */
router.get("/", async (req: Request, res: Response) => {
  await deckController.getDecks(req, res);
});

/**
 * @route GET api/v1/decks/:deckID
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
 * @route POST api/v1/decks/
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
 * @access Private (Requires authentication)
 */
router.put("/:deckID", async (req: Request, res: Response) => {
  await deckController.updateDeck(req, res);
}); // update a deck

/**
 * @route DELETE api/v1/decks/:deckID
 * @description Deletes a deck permanently.
 * @param {string} deckID - The unique identifier of the deck to delete (from URL params).
 * @returns {object} JSON response with a success message or an error.
 * @access Private (Requires authentication)
 */
router.delete("/:deckID", async (req: Request, res: Response) => {
  await deckController.deleteDeck(req, res);
}); // delete a deck

router.get("/:deckID/flashcards", ()=>{}); // get all flashcards from deck
router.get("/:deckID/flashcards/:flashcardID", ()=>{}); // get a specific flashcard
router.post("/:deckID/flashcards", ()=>{}); // add a flashcard to a deck
router.put("/:deckID/flashcards/:flashcardID", ()=>{}); // update a flashcard
router.delete("/:deckID/flashcards/:flashcardID", ()=>{}); // delete a flashcard

export default router;
