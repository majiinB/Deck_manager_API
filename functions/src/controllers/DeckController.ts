/**
 * Deck Manager API - Controller
 *
 * @file DeckController.ts
 * This module defines the controller for managing decks in the Deck Manager API.
 * It provides methods for handling HTTP requests related to CRUD operations on decks,
 * including fetching public and owner-specific decks, creating, updating, and deleting decks.
 *
 * Methods:
 * - getOwnerDecks: Retrieves all decks owned by a specific user.
 * - getPublicDecks: Retrieves all public (non-private) decks.
 * - getSpecifiDeck: Retrieves a specific deck by its ID.
 * - createDeck: Creates a new deck.
 * - updateDeck: Updates an existing deck by its ID.
 * - deleteDeck: Deletes a specific deck by its ID.
 *
 * @module controller
 * @file DeckController.ts
 * @class DeckController
 * @classdesc Handles deck-related operations for the Deck Manager API.
 * @author Arthur M. Artugue
 * @created 2024-03-27
 * @updated 2025-03-29
 */
import {Request, Response} from "express";
import {DeckService} from "../services/DeckService";
import {BaseResponse} from "../models/BaseResponse";
import {ErrorResponse} from "../models/ErrorResponse";
import {AuthenticatedRequest} from "../interface/AuthenticatedRequest";

/**
 * Class responsible for initializing and managing the services related to deck
 * management.
 */
export class DeckController {
  /**
   * Service instance responsible for handling deck-related operations.
   * Provides methods to manage and manipulate deck data.
   */
  private deckService: DeckService;

  /**
   * Regular expression pattern to validate Firebase Storage URLs for deck covers.
   * The pattern checks for URLs that match the Firebase Storage format and include
   */
  private firebaseStoragePattern: RegExp;

  /**
   * Initializes the DeckService with a DeckService instance.
   *
   * @param {DeckService} deckService - The service handling data transformation.
   */
  constructor(deckService: DeckService) {
    this.deckService = deckService;
    this.firebaseStoragePattern = new RegExp("^https://firebasestorage\\.googleapis\\.com/v0/b/deck-f429c\\.appspot\\.com/o/deckCovers%2F[\\w-]+%2F[\\w-]+\\.(png|jpg|jpeg|webp)\\?alt=media&token=[\\w-]+$");
  }

  /**
  * Handles the request to fetch all decks that an owner owns.
  *
  * @param {AuthenticatedRequest} req - The HTTP request object.
  * @param {Response} res - The HTTP response object.
  * @return {Promise<void>} A JSON response containing a message indicating the action performed.
  */
  public async getOwnerDecks(req: AuthenticatedRequest, res: Response): Promise<void> {
    const baseResponse = new BaseResponse();
    const errorResponse = new ErrorResponse();
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const userID = req.user?.user_id;

      if (isNaN(limit) || (limit <= 1 || limit > 50)) {
        errorResponse.setError("INVALID_LIMIT_VALUE");
        errorResponse.setMessage("Invalid limit value. It must be a positive number that is greater than 1.");

        baseResponse.setStatus(400);
        baseResponse.setMessage("An error has occured during the retrieval of decks owned by a specific user");
        baseResponse.setData(errorResponse);

        res.status(400).json(baseResponse);
        return;
      }

      const nextPageToken = req.query.pageToken ? (req.query.pageToken as string) : null;
      const decks = await this.deckService.getOwnerDeck(userID, limit, nextPageToken);

      baseResponse.setStatus(200);
      baseResponse.setMessage("Successfuly retrieved decks");
      baseResponse.setData(decks);

      res.status(200).json(baseResponse);
    } catch (error) {
      if (error instanceof Error) {
        errorResponse.setError(error.name);
        errorResponse.setMessage(error.message);

        baseResponse.setStatus(400);
        baseResponse.setMessage("An error has occured during the retrieval of decks");
        baseResponse.setData(errorResponse);

        res.status(400).json(baseResponse);
      } else {
        errorResponse.setError("UNKNOWN_ERROR");
        errorResponse.setMessage("An unknown error occurred in get owner decks");

        baseResponse.setStatus(500);
        baseResponse.setMessage("An error has occured during the retrieval of decks");
        baseResponse.setData(errorResponse);

        res.status(500).json(baseResponse);
      }
    }
  }

  /**
  * Handles the request to fetch all decks that are not private (is published).
  *
  * @param {Request} req - The HTTP request object.
  * @param {Response} res - The HTTP response object.
  * @return {Promise<Response>} A JSON response containing a message indicating the action performed.
  */
  public async getPublicDecks(req: Request, res: Response): Promise<void> {
    const baseResponse = new BaseResponse();
    const errorResponse = new ErrorResponse();
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

      if (isNaN(limit) || (limit <= 1 || limit > 50)) {
        errorResponse.setError("INVALID_LIMIT_VALUE");
        errorResponse.setMessage("Invalid limit value. It must be a positive number that is greater than 1.");

        baseResponse.setStatus(400);
        baseResponse.setMessage("An error has occured during the retrieval of decks");
        baseResponse.setData(errorResponse);

        res.status(400).json(baseResponse);
        return;
      }

      const nextPageToken = req.query.pageToken ? (req.query.pageToken as string) : null;
      const decks = await this.deckService.getPublicDecks(limit, nextPageToken);

      baseResponse.setStatus(200);
      baseResponse.setMessage("Successfuly retrieved decks");
      baseResponse.setData(decks);

      res.status(200).json(baseResponse);
    } catch (error) {
      if (error instanceof Error) {
        errorResponse.setError(error.name);
        errorResponse.setMessage(error.message);

        baseResponse.setStatus(400);
        baseResponse.setMessage("An error has occured during the retrieval of decks");
        baseResponse.setData(errorResponse);

        res.status(400).json(baseResponse);
      } else {
        errorResponse.setError("UNKNOWN_ERROR");
        errorResponse.setMessage("An unknown error occurred in get decks");

        baseResponse.setStatus(500);
        baseResponse.setMessage("An error has occured during the retrieval of decks");
        baseResponse.setData(errorResponse);

        res.status(500).json(baseResponse);
      }
    }
  }

  /**
  * Handles the request to fetch a specific deck
  *
  * @param {Request} req - The HTTP request object.
  * @param {Response} res - The HTTP response object.
  * @return {Promise<Response>} A JSON response containing a message indicating the action performed.
  */
  public async getSpecifiDeck(req: Request, res: Response): Promise<void> {
    const baseResponse = new BaseResponse();
    const errorResponse = new ErrorResponse();
    try {
      const deckID = req.params.deckID;
      const deck = await this.deckService.getSpecificDeck(deckID);

      baseResponse.setStatus(200);
      baseResponse.setMessage("Deck was successfully retrieved");
      baseResponse.setData(deck);

      res.status(200).json(baseResponse);
    } catch (error) {
      if (error instanceof Error) {
        errorResponse.setError(error.name);
        errorResponse.setMessage(error.message);

        baseResponse.setStatus(400);
        baseResponse.setMessage("An error has occured during the retrieval of a specific deck");
        baseResponse.setData(errorResponse);

        res.status(400).json(baseResponse);
      } else {
        errorResponse.setError("UNKNOWN_ERROR");
        errorResponse.setMessage("An unknown error occurred in get specific deck");

        baseResponse.setStatus(500);
        baseResponse.setMessage("An unknown error occurred during the retrieval of a specific deck");
        baseResponse.setData(errorResponse);

        res.status(500).json(baseResponse);
      }
    }
  }

  /**
  * Handles the request to create a deck
  *
  * @param {AuthenticatedRequest} req - The HTTP request object.
  * @param {Response} res - The HTTP response object.
  * @return {Promise<Response>} A JSON response containing a message indicating the action performed.
  */
  public async createDeck(req: AuthenticatedRequest, res: Response): Promise<void> {
    const baseResponse = new BaseResponse();
    const errorResponse = new ErrorResponse();
    try {
      const {deckTitle, deckDescription, coverPhoto} = req.body;
      const userID = req.user?.user_id;

      // Deck title validation
      if (!deckTitle) {
        errorResponse.setError("DECK_TITLE_REQUIRED");
        errorResponse.setMessage("Deck title is a required field");

        baseResponse.setStatus(400);
        baseResponse.setMessage("An error has occured during the creation of the flashcard");
        baseResponse.setData(errorResponse);

        res.status(400).json(baseResponse);
        return;
      }
      if (typeof deckTitle !== "string") {
        errorResponse.setError("INVALID_DECK_TITLE_TYPE");
        errorResponse.setMessage("The title of the deck should be of type string");

        baseResponse.setStatus(400);
        baseResponse.setMessage("An error has occured during the creation of the flashcard");
        baseResponse.setData(errorResponse);

        res.status(400).json(baseResponse);
        return;
      }
      if (!deckTitle.trim()) {
        errorResponse.setError("DECK_TITLE_REQUIRED");
        errorResponse.setMessage("Deck title is a required field");

        baseResponse.setStatus(400);
        baseResponse.setMessage("An error has occured during the creation of the flashcard");
        baseResponse.setData(errorResponse);

        res.status(400).json(baseResponse);
        return;
      }

      // Deck Description Validation
      if (!deckDescription) {
        errorResponse.setError("DECK_DESCRIPTION_REQUIRED");
        errorResponse.setMessage("Deck description is a required field");

        baseResponse.setStatus(400);
        baseResponse.setMessage("An error has occured during the creation of the flashcard");
        baseResponse.setData(errorResponse);

        res.status(400).json(baseResponse);
        return;
      }
      if (typeof deckDescription !== "string") {
        errorResponse.setError("INVALID_DECK_DESCRIPTION_TYPE");
        errorResponse.setMessage("The description of the deck should be of type string");

        baseResponse.setStatus(400);
        baseResponse.setMessage("An error has occured during the creation of the flashcard");
        baseResponse.setData(errorResponse);

        res.status(400).json(baseResponse);
        return;
      }
      if (!deckDescription?.trim()) {
        errorResponse.setError("DECK_DESCRIPTION_REQUIRED");
        errorResponse.setMessage("Deck description is a required field");

        baseResponse.setStatus(400);
        baseResponse.setMessage("An error has occured during the creation of the flashcard");
        baseResponse.setData(errorResponse);

        res.status(400).json(baseResponse);
        return;
      }

      // Cover photo validation
      if (typeof coverPhoto !== "string") {
        errorResponse.setError("INVALID_DECK_COVERPHOTO_TYPE");
        errorResponse.setMessage("The description of the deck should be of type string");

        baseResponse.setStatus(400);
        baseResponse.setMessage("An error has occured during the creation of the flashcard");
        baseResponse.setData(errorResponse);

        res.status(400).json(baseResponse);
        return;
      }
      if (!this.firebaseStoragePattern.test(coverPhoto)) {
        errorResponse.setError("INVALID_DECK_COVERPHOTO_URL");
        errorResponse.setMessage("The cover photo URL is invalid. It must be a valid Firebase Storage URL for deck covers.");

        baseResponse.setStatus(400);
        baseResponse.setMessage("An error has occurred during the creation of the deck");
        baseResponse.setData(errorResponse);

        res.status(400).json(baseResponse);
        return;
      }

      const deck = await this.deckService.createDeck(deckTitle, userID, coverPhoto, deckDescription);

      baseResponse.setStatus(200);
      baseResponse.setMessage("Deck was successfully created");
      baseResponse.setData(deck);

      res.status(200).json(baseResponse);
      return;
    } catch (error) {
      if (error instanceof Error) {
        errorResponse.setError(error.name);
        errorResponse.setMessage(error.message);

        baseResponse.setStatus(400);
        baseResponse.setMessage("An error has occured during the creation of the deck");
        baseResponse.setData(errorResponse);

        res.status(400).json(baseResponse);
        return;
      } else {
        errorResponse.setError("UNKNOWN_ERROR");
        errorResponse.setMessage("An unknown error occurred in create deck");

        baseResponse.setStatus(500);
        baseResponse.setMessage("An unknown error occurred during the creation of a deck");
        baseResponse.setData(errorResponse);

        res.status(500).json(baseResponse);
        return;
      }
    }
  }

  /**
  * Handles the request to update a specific deck
  *
  * @param {AuthenticatedRequest} req - The HTTP request object.
  * @param {Response} res - The HTTP response object.
  * @return {Promise<Response>} A JSON response containing a message indicating the action performed.
  */
  public async updateDeck(req: AuthenticatedRequest, res: Response): Promise<void> {
    const baseResponse = new BaseResponse();
    const errorResponse = new ErrorResponse();
    try {
      const {deckTitle, coverPhoto, isDeleted, isPrivate, deckDescription} = req.body;
      const deckID = req.params.deckID;
      const userID = req.user?.user_id;

      const updateData: Partial<{ title: string; is_private: boolean; cover_photo: string; is_deleted: boolean; description: string}> = {};

      if (deckTitle !== undefined) {
        if (typeof deckTitle !== "string" || deckTitle.trim() === "") {
          errorResponse.setError("INVALID_DECK_TITLE");
          errorResponse.setMessage("The title of the deck should be of type string and not empty or blank");

          baseResponse.setStatus(400);
          baseResponse.setMessage("An error while updating the deck");
          baseResponse.setData(errorResponse);

          res.status(400).json(baseResponse);
        }
        updateData.title = deckTitle.trim();
      }

      if (deckDescription !== undefined) {
        if (typeof deckDescription !== "string" || deckDescription.trim() === "") {
          errorResponse.setError("INVALID_DECK_DESCRIPTION");
          errorResponse.setMessage("The description of the deck should be of type string and not empty or blank");

          baseResponse.setStatus(400);
          baseResponse.setMessage("An error while updating the deck");
          baseResponse.setData(errorResponse);

          res.status(400).json(baseResponse);
        }
        updateData.description = deckDescription.trim();
      }

      if (isPrivate !== undefined) {
        if (typeof isPrivate !== "boolean") {
          errorResponse.setError("INVALID_PRIVACY_VALUE");
          errorResponse.setMessage("The is private flag of the deck should be of type boolean and not empty or blank");

          baseResponse.setStatus(400);
          baseResponse.setMessage("An error while updating the deck");
          baseResponse.setData(errorResponse);

          res.status(400).json(baseResponse);
        }
        updateData.is_private = isPrivate;
      }

      if (isDeleted !== undefined) {
        if (typeof isDeleted !== "boolean") {
          errorResponse.setError("INVALID_DELETE_FLAG_VALUE");
          errorResponse.setMessage("The is delete flag of the deck should be of type boolean and not empty or blank");

          baseResponse.setStatus(400);
          baseResponse.setMessage("An error while updating the deck");
          baseResponse.setData(errorResponse);

          res.status(400).json(baseResponse);
        }
        updateData.is_deleted = isDeleted;
      }

      if (coverPhoto !== undefined) {
        if (typeof coverPhoto !== "string" || !coverPhoto.startsWith("http")) {
          errorResponse.setError("INVALID_COVER_PHOTO_URL");
          errorResponse.setMessage("The cover photo url of the deck should be of type string and not empty or blank");

          baseResponse.setStatus(400);
          baseResponse.setMessage("An error while updating the deck");
          baseResponse.setData(errorResponse);

          res.status(400).json(baseResponse);
        }
        updateData.cover_photo = coverPhoto;
      }

      if (Object.keys(updateData).length === 0) {
        errorResponse.setError("NO_VALID_FIELDS_TO_UPDATE");
        errorResponse.setMessage("There are no valid fields that can be used update the deck");

        baseResponse.setStatus(400);
        baseResponse.setMessage("An error while updating the flashcard");
        baseResponse.setData(errorResponse);

        res.status(400).json(baseResponse);
      }

      const deck = await this.deckService.updateDeck(userID, deckID, updateData);

      baseResponse.setStatus(200);
      baseResponse.setMessage("Deck was successfully updated");
      baseResponse.setData(deck);

      res.status(200).json(baseResponse);
    } catch (error) {
      if (error instanceof Error) {
        errorResponse.setError(error.name);
        errorResponse.setMessage(error.message);

        baseResponse.setStatus(400);
        baseResponse.setMessage("An error has occured while updating the deck");
        baseResponse.setData(errorResponse);

        res.status(400).json(baseResponse);
      } else {
        errorResponse.setError("UNKNOWN_ERROR");
        errorResponse.setMessage("An unknown error occurred in update deck");

        baseResponse.setStatus(500);
        baseResponse.setMessage("An unknown error occurred while updating the deck");
        baseResponse.setData(errorResponse);

        res.status(500).json(baseResponse);
      }
    }
  }

  /**
  * Handles the request to delete a specific deck
  *
  * @param {AuthenticatedRequest} req - The HTTP request object.
  * @param {Response} res - The HTTP response object.
  * @return {Promise<Response>} A JSON response containing a message indicating the action performed.
  */
  public async deleteDeck(req: AuthenticatedRequest, res: Response): Promise<void> {
    const baseResponse = new BaseResponse();
    const errorResponse = new ErrorResponse();
    const userID = req.user?.user_id;
    try {
      const deckIDs = req.body.deckIDs;
      await this.deckService.deleteDeck(userID, deckIDs);

      baseResponse.setStatus(200);
      baseResponse.setMessage(`Deck with ID of ${deckIDs} is successfully deleted`);
      baseResponse.setData(null);

      res.status(200).json(baseResponse);
    } catch (error) {
      if (error instanceof Error) {
        errorResponse.setError(error.name);
        errorResponse.setMessage(error.message);

        baseResponse.setStatus(400);
        baseResponse.setMessage("An error has occured while deleting the deck");
        baseResponse.setData(errorResponse);

        res.status(400).json(baseResponse);
      } else {
        errorResponse.setError("UNKNOWN_ERROR");
        errorResponse.setMessage("An unknown error occurred in delete deck");

        baseResponse.setStatus(500);
        baseResponse.setMessage("An unknown error occurred while deleting the deck");
        baseResponse.setData(errorResponse);

        res.status(500).json(baseResponse);
      }
    }
  }
}
