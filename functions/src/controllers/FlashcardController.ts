

/**
 * Deck Manager API - Flashcard Controller
 *
 * @file FlashcardController.ts
 * This module defines the controller for managing flashcards in the Deck Manager API.
 * It provides methods for CRUD operations on flashcards, including retrieval, creation,
 * updating, and deletion of flashcards within a specific deck.
 *
 * Endpoints Handled:
 * - GET api/v1/decks/:deckID/flashcards: Retrieves all flashcards from a specific deck.
 * - GET api/v1/decks/:deckID/flashcards/random: Retrieves a randomized selection of flashcards from a specific deck.
 * - GET api/v1/decks/:deckID/flashcards/:flashcardID: Retrieves a specific flashcard by its ID.
 * - POST api/v1/decks/:deckID/flashcards: Adds a new flashcard to a specific deck.
 * - PUT api/v1/decks/:deckID/flashcards/:flashcardID: Updates a specific flashcard by its ID.
 * - DELETE api/v1/decks/:deckID/flashcards/:flashcardID: Deletes a specific flashcard by its ID.
 *
 * @module FlashcardController
 * @file FlashcardController.ts
 * @class FlashcardController
 * @classdesc Handles flashcard-related operations for the Deck Manager API.
 * @author Arthur M. Artugue
 * @created 2024-03-27
 * @updated 2025-03-29
 */

import {Request, Response} from "express";
import {FlashcardService} from "../services/FlashCardService";
import {BaseResponse} from "../models/BaseResponse";
import {ErrorResponse} from "../models/ErrorResponse";

/**
 * Class responsible for initializing and managing the services related to flashcards
 * management.
 */
export class FlashcardController {
  /**
   * Service instance responsible for handling flashcard-related operations.
   * Provides methods to manage and manipulate flashcard data.
   */
  private flashcardService: FlashcardService;

  /**
   * Initializes the FlashcardService with a FlashcardService instance.
   *
   * @param {FlashcardService} flashcardService - The service handling data transformation.
   */
  constructor(flashcardService: FlashcardService) {
    this.flashcardService = flashcardService;
  }

  /**
  *
  * Handles the request to fetch all flashcards.
  *
  * @param {Request} req - The HTTP request object.
  * @param {Response} res - The HTTP response object.
  * @return {Promise<Response>} A JSON response containing a message indicating the action performed.
  */
  public async getFlashcards(req: Request, res: Response): Promise<void> {
    const baseResponse = new BaseResponse();
    const errorResponse = new ErrorResponse();

    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const deckID = req.params.deckID;

      if (isNaN(limit) || limit <= 1) {
        errorResponse.setError("INVALID_LIMIT_VALUE");
        errorResponse.setMessage("Invalid limit value. It must be a positive number.");

        baseResponse.setStatus(400);
        baseResponse.setMessage("An error has occured during the retrieval of flashcards");
        baseResponse.setData(errorResponse);

        res.status(400).json(baseResponse);
        return;
      }

      const nextPageToken = req.query.pageToken ? (req.query.pageToken as string) : null;

      const flashcard = await this.flashcardService.getFlashcards(deckID, limit, nextPageToken);

      baseResponse.setStatus(200);
      baseResponse.setMessage("Successfuly retrieved flashcards");
      baseResponse.setData(flashcard);

      res.status(200).json(baseResponse);
    } catch (error) {
      if (error instanceof Error) {
        errorResponse.setError(error.name);
        errorResponse.setMessage(error.message);

        baseResponse.setStatus(400);
        baseResponse.setMessage("An error has occured during the retrieval of flashcards");
        baseResponse.setData(errorResponse);

        res.status(400).json(baseResponse);
      } else {
        errorResponse.setError("UNKNOWN_ERROR");
        errorResponse.setMessage("An unknown error occurred in get flashcard");

        baseResponse.setStatus(500);
        baseResponse.setMessage("An error has occured during the retrieval of flashcards");
        baseResponse.setData(errorResponse);

        res.status(500).json(baseResponse);
      }
    }
  }

  /**
  *
  * Handles the request to fetch all flashcards and then randomize it before selecting and returning.
  *
  * @param {Request} req - The HTTP request object.
  * @param {Response} res - The HTTP response object.
  * @return {Promise<Response>} A JSON response containing a message indicating the action performed.
  */
  public async getRandomFlashcards(req: Request, res: Response): Promise<void> {
    const baseResponse = new BaseResponse();
    const errorResponse = new ErrorResponse();
    try {
      const numOfCards = req.query.numOfCards ? parseInt(req.query.limit as string, 10) : null;
      const deckID = req.params.deckID;

      if (numOfCards !== null) {
        if (isNaN(numOfCards) || numOfCards <= 5) {
          errorResponse.setError("INVALID_NUMBER_OF_CARDS_VALUE");
          errorResponse.setMessage("Invalid number of cards value. It must be a positive number.");

          baseResponse.setStatus(400);
          baseResponse.setMessage("An error has occured during the retrieval of random flashcards");
          baseResponse.setData(errorResponse);
          res.status(400).json(baseResponse);
          return;
        }
      }

      const decks = await this.flashcardService.getRandomFlashcards(deckID, numOfCards);

      res.status(200).json(decks);
    } catch (error) {
      if (error instanceof Error) {
        errorResponse.setError(error.name);
        errorResponse.setMessage(error.message);

        baseResponse.setStatus(400);
        baseResponse.setMessage("An error has occured during the retrieval of random flashcards");
        baseResponse.setData(errorResponse);

        res.status(400).json(baseResponse);
      } else {
        errorResponse.setError("UNKNOWN_ERROR");
        errorResponse.setMessage("An unknown error occurred in get random flashcard");

        baseResponse.setStatus(500);
        baseResponse.setMessage("An error has occured during the retrieval of random flashcards");
        baseResponse.setData(errorResponse);

        res.status(500).json(baseResponse);
      }
    }
  }

  /**
  * Handles the request to fetch a specific flashcard
  *
  * @param {Request} req - The HTTP request object.
  * @param {Response} res - The HTTP response object.
  * @return {Promise<Response>} A JSON response containing a message indicating the action performed.
  */
  public async getSpecificFlashcard(req: Request, res: Response): Promise<void> {
    const baseResponse = new BaseResponse();
    const errorResponse = new ErrorResponse();
    try {
      const deckID = req.params.deckID;
      const flashcardID = req.params.flashcardID;

      const flashcard = await this.flashcardService.getSpecificFlashcard(deckID, flashcardID);

      res.status(200).json(flashcard);
    } catch (error) {
      if (error instanceof Error) {
        errorResponse.setError(error.name);
        errorResponse.setMessage(error.message);

        baseResponse.setStatus(400);
        baseResponse.setMessage("An error has occured during the retrieval of a specific flashcard");
        baseResponse.setData(errorResponse);

        res.status(400).json(baseResponse);
      } else {
        errorResponse.setError("UNKNOWN_ERROR");
        errorResponse.setMessage("An unknown error occurred in get specific flashcard");

        baseResponse.setStatus(500);
        baseResponse.setMessage("An unknown error occurred during the retrieval of a specific flashcard");
        baseResponse.setData(errorResponse);

        res.status(500).json(baseResponse);
      }
    }
  }

  /**
  * Handles the request to create a flashcard
  *
  * @param {Request} req - The HTTP request object.
  * @param {Response} res - The HTTP response object.
  * @return {Promise<Response>} A JSON response containing a message indicating the action performed.
  */
  public async createFlashcard(req: Request, res: Response): Promise<void> {
    const baseResponse = new BaseResponse();
    const errorResponse = new ErrorResponse();
    try {
      const {term, definition} = req.body;
      const deckID = req.params.deckID;
      // const userID = "Y3o8pxyMZre0wOqHh6Ip98ckBmO2"; // TODO: Extract this info from jwt token

      if (typeof term !== "string") {
        errorResponse.setError("INVALID_FLASHCARD_TERM_TYPE");
        errorResponse.setMessage("The term of the flashcard should be of type string");

        baseResponse.setStatus(400);
        baseResponse.setMessage("An error has occured during the creation of the flashcard");
        baseResponse.setData(errorResponse);

        res.status(400).json(baseResponse);
      }

      if (typeof definition !== "string") {
        errorResponse.setError("INVALID_FLASHCARD_DEFINITION_TYPE");
        errorResponse.setMessage("The definition of the flashcard should be of type string");

        baseResponse.setStatus(400);
        baseResponse.setMessage("An error has occured during the creation of the flashcard");
        baseResponse.setData(errorResponse);

        res.status(400).json(baseResponse);
      }

      if (!term?.trim()) {
        errorResponse.setError("FLASHCARD_TERM_REQUIRED");
        errorResponse.setMessage("flashcard term is a required");

        baseResponse.setStatus(400);
        baseResponse.setMessage("An error has occured during the creation of the flashcard");
        baseResponse.setData(errorResponse);

        res.status(400).json(baseResponse);
      }

      if (!definition?.trim()) {
        errorResponse.setError("FLASHCARD_DEFINITION_REQUIRED");
        errorResponse.setMessage("flashcard definition is a required");

        baseResponse.setStatus(400);
        baseResponse.setMessage("An error has occured during the creation of the flashcard");
        baseResponse.setData(errorResponse);

        res.status(400).json(baseResponse);
      }

      const flashcard = await this.flashcardService.createFlashcard(deckID, term, definition);

      res.status(200).json(flashcard);
    } catch (error) {
      if (error instanceof Error) {
        errorResponse.setError(error.name);
        errorResponse.setMessage(error.message);

        baseResponse.setStatus(400);
        baseResponse.setMessage("An error has occured during the retrieval of a specific flashcard");
        baseResponse.setData(errorResponse);

        res.status(400).json(baseResponse);
      } else {
        errorResponse.setError("UNKNOWN_ERROR");
        errorResponse.setMessage("An unknown error occurred in create flashcard");

        baseResponse.setStatus(500);
        baseResponse.setMessage("An unknown error occurred during the creation of a flashcard");
        baseResponse.setData(errorResponse);

        res.status(500).json(baseResponse);
      }
    }
  }

  /**
  * Handles the request to update a specific flashcard
  *
  * @param {Request} req - The HTTP request object.
  * @param {Response} res - The HTTP response object.
  * @return {Promise<Response>} A JSON response containing a message indicating the action performed.
  */
  public async updateFlashcard(req: Request, res: Response): Promise<void> {
    const baseResponse = new BaseResponse();
    const errorResponse = new ErrorResponse();
    try {
      const {term, definition, isDeleted, isStarred} = req.body;
      const deckID = req.params.deckID;
      const flashcardID = req.params.flashcardID;

      const updateData: Partial<{ term: string; definition:string; is_deleted: boolean; is_starred: boolean;}> = {};

      if (term !== undefined && term !== null) {
        if (typeof term !== "string" || term.trim() === "") {
          errorResponse.setError("INVALID_FLASHCARD_TERM");
          errorResponse.setMessage("The term of the flashcard should be of type string and not empty or blank");

          baseResponse.setStatus(400);
          baseResponse.setMessage("An error while updating the flashcard");
          baseResponse.setData(errorResponse);

          res.status(400).json(baseResponse);
        }
        updateData.term = term.trim();
      }

      if (definition !== undefined && definition !== null) {
        if (typeof definition !== "string" || definition.trim() === "") {
          errorResponse.setError("INVALID_FLASHCARD_DEFINITION");
          errorResponse.setMessage("The definition of the flashcard should be of type string and not empty or blank");

          baseResponse.setStatus(400);
          baseResponse.setMessage("An error while updating the flashcard");
          baseResponse.setData(errorResponse);

          res.status(400).json(baseResponse);
        }
        updateData.definition = definition.trim();
      }

      if (isStarred !== undefined && isStarred !== null) {
        if (typeof isStarred !== "boolean") {
          errorResponse.setError("INVALID_FLASHCARD_STAR_FLAG");
          errorResponse.setMessage("The flag that indicates if the flashcard is starred should be of type boolean");

          baseResponse.setStatus(400);
          baseResponse.setMessage("An error while updating the flashcard");
          baseResponse.setData(errorResponse);

          res.status(400).json(baseResponse);
        }
        updateData.is_starred = isStarred;
      }

      if (isDeleted !== undefined && isDeleted !== null) {
        if (typeof isDeleted !== "boolean") {
          errorResponse.setError("INVALID_FLASHCARD_DELETE_FLAG");
          errorResponse.setMessage("The flag that indicates if the flashcard is deleted should be of type boolean");

          baseResponse.setStatus(400);
          baseResponse.setMessage("An error while updating the flashcard");
          baseResponse.setData(errorResponse);

          res.status(400).json(baseResponse);
        }
        updateData.is_deleted = isDeleted;
      }

      if (Object.keys(updateData).length === 0) {
        errorResponse.setError("NO_VALID_FIELDS_TO_UPDATE");
        errorResponse.setMessage("The flag that indicates if the flashcard is deleted should be of type boolean");

        baseResponse.setStatus(400);
        baseResponse.setMessage("An error while updating the flashcard");
        baseResponse.setData(errorResponse);

        res.status(400).json(baseResponse);
      }

      const deck = await this.flashcardService.updateFlashcard(deckID, flashcardID, updateData);

      res.status(200).json(deck);
    } catch (error) {
      if (error instanceof Error) {
        errorResponse.setError(error.name);
        errorResponse.setMessage(error.message);

        baseResponse.setStatus(400);
        baseResponse.setMessage("An error has occured while updating the flashcard");
        baseResponse.setData(errorResponse);

        res.status(400).json(baseResponse);
      } else {
        errorResponse.setError("UNKNOWN_ERROR");
        errorResponse.setMessage("An unknown error occurred in update flashcard");

        baseResponse.setStatus(500);
        baseResponse.setMessage("An unknown error occurred while updating the flashcard");
        baseResponse.setData(errorResponse);

        res.status(500).json(baseResponse);
      }
    }
  }

  /**
  * Handles the request to delete a specific flashcard
  *
  * @param {Request} req - The HTTP request object.
  * @param {Response} res - The HTTP response object.
  * @return {Promise<Response>} A JSON response containing a message indicating the action performed.
  */
  public async deleteFlashcard(req: Request, res: Response): Promise<void> {
    const baseResponse = new BaseResponse();
    const errorResponse = new ErrorResponse();
    try {
      const deckID = req.params.deckID;
      const flashcardID = req.params.flashcardID;
      await this.flashcardService.deleteFlashcard(deckID, flashcardID);
      res.status(200).json({message: `Flashcard with ID of ${flashcardID} from deck ${deckID} is successfully deleted`});
    } catch (error) {
      if (error instanceof Error) {
        errorResponse.setError(error.name);
        errorResponse.setMessage(error.message);

        baseResponse.setStatus(400);
        baseResponse.setMessage("An error has occured while deleting the flashcard");
        baseResponse.setData(errorResponse);

        res.status(400).json(baseResponse);
      } else {
        errorResponse.setError("UNKNOWN_ERROR");
        errorResponse.setMessage("An unknown error occurred in delete flashcard");

        baseResponse.setStatus(500);
        baseResponse.setMessage("An unknown error occurred while deleting the flashcard");
        baseResponse.setData(errorResponse);

        res.status(500).json(baseResponse);
      }
    }
  }
}
