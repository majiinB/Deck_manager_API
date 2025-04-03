

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
import {AuthenticatedRequest} from "../interface/AuthenticatedRequest";

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

      if (isNaN(limit) || (limit <= 1 || limit > 50)) {
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
      const limit = req.query.numOfCards ? parseInt(req.query.limit as string, 10) : null;
      const deckID = req.params.deckID;

      if (limit !== null) {
        if (isNaN(limit) || (limit < 5 || limit > 50)) {
          errorResponse.setError("INVALID_LIMIT_VALUE");
          errorResponse.setMessage("Invalid limit value. It must be a positive number greater than or equal to five and less than 50.");

          baseResponse.setStatus(400);
          baseResponse.setMessage("An error has occured during the retrieval of random flashcards");
          baseResponse.setData(errorResponse);
          res.status(400).json(baseResponse);
          return;
        }
      }

      const flashcards = await this.flashcardService.getRandomFlashcards(deckID, limit);

      baseResponse.setStatus(200);
      baseResponse.setMessage("Random flashcards successfuly retrieved");
      baseResponse.setData(flashcards);

      res.status(200).json(baseResponse);
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

      baseResponse.setStatus(200);
      baseResponse.setMessage("Flashcard was successfully retrieved");
      baseResponse.setData(flashcard);

      res.status(200).json(baseResponse);
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
  public async createFlashcard(req: AuthenticatedRequest, res: Response): Promise<void> {
    const baseResponse = new BaseResponse();
    const errorResponse = new ErrorResponse();
    try {
      const {term, definition} = req.body;
      const deckID = req.params.deckID;
      const userID = req.user?.user_id;

      // Flashcard term validation
      if (!term) {
        errorResponse.setError("FLASHCARD_TERM_REQUIRED");
        errorResponse.setMessage("flashcard term is a required");

        baseResponse.setStatus(400);
        baseResponse.setMessage("An error has occured during the creation of the flashcard");
        baseResponse.setData(errorResponse);

        res.status(400).json(baseResponse);
        return;
      }
      if (typeof term !== "string") {
        errorResponse.setError("INVALID_FLASHCARD_TERM_TYPE");
        errorResponse.setMessage("The term of the flashcard should be of type string");

        baseResponse.setStatus(400);
        baseResponse.setMessage("An error has occured during the creation of the flashcard");
        baseResponse.setData(errorResponse);

        res.status(400).json(baseResponse);
        return;
      }
      if (!term?.trim()) {
        errorResponse.setError("FLASHCARD_TERM_REQUIRED");
        errorResponse.setMessage("flashcard term is a required");

        baseResponse.setStatus(400);
        baseResponse.setMessage("An error has occured during the creation of the flashcard");
        baseResponse.setData(errorResponse);

        res.status(400).json(baseResponse);
        return;
      }

      // Flashcard definition validation
      if (!definition) {
        errorResponse.setError("FLASHCARD_DEFINITION_REQUIRED");
        errorResponse.setMessage("flashcard definition is a required");

        baseResponse.setStatus(400);
        baseResponse.setMessage("An error has occured during the creation of the flashcard");
        baseResponse.setData(errorResponse);

        res.status(400).json(baseResponse);
        return;
      }
      if (typeof definition !== "string") {
        errorResponse.setError("INVALID_FLASHCARD_DEFINITION_TYPE");
        errorResponse.setMessage("The definition of the flashcard should be of type string");

        baseResponse.setStatus(400);
        baseResponse.setMessage("An error has occured during the creation of the flashcard");
        baseResponse.setData(errorResponse);

        res.status(400).json(baseResponse);
        return;
      }
      if (!definition?.trim()) {
        errorResponse.setError("FLASHCARD_DEFINITION_REQUIRED");
        errorResponse.setMessage("flashcard definition is a required");

        baseResponse.setStatus(400);
        baseResponse.setMessage("An error has occured during the creation of the flashcard");
        baseResponse.setData(errorResponse);

        res.status(400).json(baseResponse);
        return;
      }

      const flashcard = await this.flashcardService.createFlashcard(userID, deckID, term, definition);

      baseResponse.setStatus(200);
      baseResponse.setMessage("Flashcard was successfully created");
      baseResponse.setData(flashcard);

      res.status(200).json(baseResponse);
      return;
    } catch (error) {
      if (error instanceof Error) {
        errorResponse.setError(error.name);
        errorResponse.setMessage(error.message);

        baseResponse.setStatus(400);
        baseResponse.setMessage("An error has occured during the retrieval of a specific flashcard");
        baseResponse.setData(errorResponse);

        res.status(400).json(baseResponse);
        return;
      } else {
        errorResponse.setError("UNKNOWN_ERROR");
        errorResponse.setMessage("An unknown error occurred in create flashcard");

        baseResponse.setStatus(500);
        baseResponse.setMessage("An unknown error occurred during the creation of a flashcard");
        baseResponse.setData(errorResponse);

        res.status(500).json(baseResponse);
        return;
      }
    }
  }

  /**
  * Handles the request to update a specific flashcard
  *
  * @param {AuthenticatedRequest} req - The HTTP request object.
  * @param {Response} res - The HTTP response object.
  * @return {Promise<Response>} A JSON response containing a message indicating the action performed.
  */
  public async updateFlashcard(req: AuthenticatedRequest, res: Response): Promise<void> {
    const baseResponse = new BaseResponse();
    const errorResponse = new ErrorResponse();
    try {
      const {term, definition, isDeleted, isStarred} = req.body;
      const deckID = req.params.deckID;
      const flashcardID = req.params.flashcardID;
      const userID = req.user?.user_id;

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
        errorResponse.setMessage("There are no fields that are valid that can be used to update the flashcard");

        baseResponse.setStatus(400);
        baseResponse.setMessage("An error while updating the flashcard");
        baseResponse.setData(errorResponse);

        res.status(400).json(baseResponse);
      }

      const flashcard = await this.flashcardService.updateFlashcard(userID, deckID, flashcardID, updateData);

      baseResponse.setStatus(200);
      baseResponse.setMessage("Flashcard was successfully updated");
      baseResponse.setData(flashcard);

      res.status(200).json(baseResponse);
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
  * @param {AuthenticatedRequest} req - The HTTP request object.
  * @param {Response} res - The HTTP response object.
  * @return {Promise<Response>} A JSON response containing a message indicating the action performed.
  */
  public async deleteFlashcard(req: AuthenticatedRequest, res: Response): Promise<void> {
    const baseResponse = new BaseResponse();
    const errorResponse = new ErrorResponse();
    const userID = req.user?.user_id;
    try {
      const deckID = req.params.deckID;
      const flashcardIDs = req.body.flashcardIDs;
      await this.flashcardService.deleteFlashcard(userID, deckID, flashcardIDs);

      baseResponse.setStatus(200);
      baseResponse.setMessage(`Flashcard with ID of ${flashcardIDs} from deck ${deckID} is successfully deleted`);
      baseResponse.setData(null);

      res.status(200).json(baseResponse);
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
