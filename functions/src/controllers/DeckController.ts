/**
 * Deck Manager API - Controller
 *
 * @file DeckController.ts
 * This module defines the controller for managing decks in the Deck Manager API.
 * It provides methods for handling HTTP requests related to CRUD operations on decks,
 * including fetching public and owner-specific decks, fetching a specific deck,
 * creating, updating, and deleting decks. It interacts with the DeckService to
 * perform the underlying business logic and data operations. Input validation
 * for request parameters and body is also handled here.
 *
 * Methods:
 * - getOwnerDecks: Retrieves decks owned by the authenticated user, with pagination.
 * - getPublicDecks: Retrieves all public (non-private) decks, with pagination.
 * - getSpecifiDeck: Retrieves a specific deck by its ID.
 * - createDeck: Creates a new deck with validated title, description, and cover photo URL.
 * - updateDeck: Updates an existing deck's details (title, description, privacy, cover photo, deletion status) by its ID.
 * - deleteDeck: Deletes one or more decks specified by their IDs for the authenticated user.
 *
 * @module controller
 * @file DeckController.ts
 * @class DeckController
 * @classdesc Handles HTTP request routing and processing for deck-related operations, coordinating with the DeckService.
 * @author Arthur M. Artugue
 * @created 2024-03-30
 * @updated 2025-05-22
 */
import {Request, Response} from "express";
import {DeckService} from "../services/DeckService";
import {BaseResponse} from "../models/BaseResponse";
import {ErrorResponse} from "../models/ErrorResponse";
import {AuthenticatedRequest} from "../interface/AuthenticatedRequest";
import {createDeckSchema} from "../schema/createDeckSchema";
import {ApiError} from "../helpers/apiError";
import {FirebaseAdmin} from "../config/FirebaseAdmin";
import {callFirebaseAIAPI} from "../helpers/callDeckAiAPI";
import {DeckRepository} from "../repositories/DeckRepository";

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
   * Initializes the DeckController with a DeckService instance.
   * Also initializes the regex pattern for Firebase Storage URL validation.
   *
   * @param {DeckService} deckService - The service handling deck data operations.
   */
  constructor(deckService: DeckService) {
    this.deckService = deckService;
  }

  /**
   * Handles the request to fetch all decks that an owner owns.
   * Validates query parameters (limit) and uses DeckService for retrieval.
   * Responds with paginated deck data or an error.
   *
   * @param {AuthenticatedRequest} req - The HTTP request object, potentially including authenticated user info.
   * @param {Response} res - The HTTP response object.
   * @return {Promise<void>} Sends a JSON response.
   */
  public async getOwnerDecks(req: AuthenticatedRequest, res: Response): Promise<void> {
    const baseResponse = new BaseResponse();

    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
    const userID = req.user?.user_id;

    if (!userID) {
      throw new ApiError("User ID is required to retrieve decks", 400, {
        userID,
        errorCode: "USER_ID_REQUIRED",
      });
    }

    // Validate limit parameter
    if (isNaN(limit) || (limit <= 1 || limit > 50)) {
      throw new ApiError(
        "Invalid limit value. It must be a positive number that is greater than 1 and is less than or equal to 50.",
        400,
        {userID, limit, errorCode: "INVALID_LIMIT_VALUE"}
      );
    }

    // Get the page token if provided
    const nextPageToken = req.query.nextPageToken ? (req.query.nextPageToken as string) : null;

    // Get the filter if provided
    const orderBy = req.query.orderBy ? (req.query.orderBy as string) : "title";
    const validOrderByFields = ["title", "created_at"];
    if (!validOrderByFields.includes(orderBy)) {
      throw new ApiError(
        `Invalid orderBy value. Allowed values: ${validOrderByFields.join(", ")}.`,
        400,
        {orderBy, errorCode: "INVALID_ORDERBY_VALUE"}
      );
    }

    // Call service method
    const decks = await this.deckService.getOwnerDeck(userID, limit, nextPageToken, orderBy);

    // Send success response
    baseResponse.setStatus(200);
    baseResponse.setMessage("Successfuly retrieved decks");
    baseResponse.setData(decks);

    res.status(200).json(baseResponse);
    return;
  }

  /**
   * Handles the request to fetch all decks that are not private (are published).
   * Validates query parameters (limit) and uses DeckService for retrieval.
   * Responds with paginated public deck data or an error.
   *
   * @param {AuthenticatedRequest} req - The HTTP request object.
   * @param {Response} res - The HTTP response object.
   * @return {Promise<void>} Sends a JSON response.
   */
  public async getPublicDecks(req: AuthenticatedRequest, res: Response): Promise<void> {
    const baseResponse = new BaseResponse();

    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

    // Validate limit parameter
    if (isNaN(limit) || (limit <= 1 || limit > 50)) {
      throw new ApiError(
        "Invalid limit value. It must be a positive number between 1 and 50.",
        400,
        {limit, errorCode: "INVALID_LIMIT_VALUE"}
      );
    }

    // Get pagination token if provided
    const nextPageToken = req.query.nextPageToken ? (req.query.nextPageToken as string) : null;

    // Call service method
    const decks = await this.deckService.getPublicDecks(limit, nextPageToken);

    // Send success response
    baseResponse.setStatus(200);
    baseResponse.setMessage("Successfuly retrieved decks");
    baseResponse.setData(decks);

    res.status(200).json(baseResponse);
    return;
  }

  /**
   * Handles the request to fetch all deleted decks that an owner owns.
   * Validates query parameters (limit) and uses DeckService for retrieval.
   * Responds with paginated deck data or an error.
   *
   * @param {AuthenticatedRequest} req - The HTTP request object, potentially including authenticated user info.
   * @param {Response} res - The HTTP response object.
   * @return {Promise<void>} Sends a JSON response.
   */
  public async getOwnerDeletedDecks(req: AuthenticatedRequest, res: Response): Promise<void> {
    const baseResponse = new BaseResponse();

    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
    const userID = req.user?.user_id;

    if (!userID) {
      throw new ApiError("User ID is required to retrieve decks", 400, {
        userID,
        errorCode: "USER_ID_REQUIRED",
      });
    }

    // Validate limit parameter
    if (isNaN(limit) || (limit <= 1 || limit > 50)) {
      throw new ApiError(
        "Invalid limit value. It must be a positive number that is greater than 1 and is less than or equal to 50.",
        400,
        {userID, limit, errorCode: "INVALID_LIMIT_VALUE"}
      );
    }

    // Get the page token if provided
    const nextPageToken = req.query.nextPageToken ? (req.query.nextPageToken as string) : null;

    // Get the filter if provided
    const orderBy = req.query.orderBy ? (req.query.orderBy as string) : "title";
    const validOrderByFields = ["title", "created_at"];
    if (!validOrderByFields.includes(orderBy)) {
      throw new ApiError(
        `Invalid orderBy value. Allowed values: ${validOrderByFields.join(", ")}.`,
        400,
        {orderBy, errorCode: "INVALID_ORDERBY_VALUE"}
      );
    }

    // Call service method
    const decks = await this.deckService.getOwnerDeletedDeck(userID, limit, nextPageToken, orderBy);

    // Send success response
    baseResponse.setStatus(200);
    baseResponse.setMessage("Successfuly retrieved decks");
    baseResponse.setData(decks);

    res.status(200).json(baseResponse);
    return;
  }

  /**
   * Handles the request to fetch all saved decks of an owner.
   * Validates query parameters (limit) and uses DeckService for retrieval.
   * Responds with paginated deck data or an error.
   *
   * @param {AuthenticatedRequest} req - The HTTP request object, potentially including authenticated user info.
   * @param {Response} res - The HTTP response object.
   * @return {Promise<void>} Sends a JSON response.
   */
  public async getSavedDecks(req: AuthenticatedRequest, res: Response): Promise<void> {
    const baseResponse = new BaseResponse();
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
    const userID = req.user?.user_id;

    if (!userID) {
      throw new ApiError("Unauthorized. Missing user ID.", 401);
    }

    // Validate limit parameter
    if (isNaN(limit) || (limit <= 1 || limit > 50)) {
      throw new ApiError(
        "Invalid limit value. It must be a positive number between 1 and 50.",
        400,
        {userID, limit, errorCode: "INVALID_LIMIT_VALUE"}
      );
    }

    // Get pagination token if provided
    const nextPageToken = req.query.nextPageToken ? (req.query.nextPageToken as string) : null;
    // Call service method
    const decks = await this.deckService.getSavedDeck(userID, limit, nextPageToken);

    // Send success response
    baseResponse.setStatus(200);
    baseResponse.setMessage("Successfuly retrieved decks");
    baseResponse.setData(decks);

    res.status(200).json(baseResponse);
    return;
  }

  /**
   * Handles the request to search for decks based on a search query.
   * Validates query parameters (searchQuery, limit) and uses DeckService for retrieval.
   * Responds with paginated deck data or an error.
   *
   * @param {Request} req - The HTTP request object containing search parameters.
   * @param {Response} res - The HTTP response object.
   * @return {Promise<void>} Sends a JSON response.
   */
  public async searchDeck(req: AuthenticatedRequest, res: Response): Promise<void> {
    const baseResponse = new BaseResponse();
    const limit = 10;
    const userID = req.user?.user_id;

    // Determine filter
    const filters = ["MY_DECKS", "SAVED_DECKS", "PUBLIC_DECKS", "DELETED_DECKS"];
    const filter = req.query.filter as string;
    const searchFilter = filters.includes(filter) ? filter : "PUBLIC_DECKS";
    if (!filters.includes(filter)) {
      throw new ApiError(
        `Invalid filter value. Allowed filters: ${filters.join(", ")}`,
        400,
        {filter, errorCode: "INVALID_FILTER_VALUE"}
      );
    }

    // Validate search query
    const searchQuery = req.query.searchQuery as string;
    const searchQueryRegex = /^[a-zA-Z0-9\s]+$/;
    if (!searchQuery || !searchQueryRegex.test(searchQuery)) {
      throw new ApiError(
        "The search query should be a non-empty string containing only letters, numbers, or spaces.",
        400,
        {searchQuery, errorCode: "INVALID_SEARCH_QUERY"}
      );
    }

    // Call service method
    const decks = await this.deckService.searchDeck(userID, searchQuery, limit, searchFilter);

    // Send success response
    baseResponse.setStatus(200);
    baseResponse.setMessage("Successfuly retrieved decks");
    baseResponse.setData(decks);

    res.status(200).json(baseResponse);
    return;
  }

  /**
   * Handles the request to fetch a specific deck by its ID.
   * Uses DeckService for retrieval based on the deck ID from URL parameters.
   * Responds with the specific deck data or an error.
   *
   * @param {Request} req - The HTTP request object containing deckID parameter.
   * @param {Response} res - The HTTP response object.
   * @return {Promise<void>} Sends a JSON response.
   */
  public async getSpecifiDeck(req: Request, res: Response): Promise<void> {
    const baseResponse = new BaseResponse();
    const errorResponse = new ErrorResponse();
    try {
      const deckID = req.params.deckID;

      // Call service method
      const deck = await this.deckService.getSpecificDeck(deckID);

      // Send success response
      baseResponse.setStatus(200);
      baseResponse.setMessage("Deck was successfully retrieved");
      baseResponse.setData(deck);

      res.status(200).json(baseResponse);
    } catch (error) {
      if (error instanceof Error) {
        // Handle errors
        errorResponse.setError(error.name);
        errorResponse.setMessage(error.message);

        baseResponse.setStatus(400);
        baseResponse.setMessage("An error has occured during the retrieval of a specific deck");
        baseResponse.setData(errorResponse);

        res.status(400).json(baseResponse);
        return;
      } else {
        errorResponse.setError("UNKNOWN_ERROR");
        errorResponse.setMessage("An unknown error occurred in get specific deck");

        baseResponse.setStatus(500);
        baseResponse.setMessage("An unknown error occurred during the retrieval of a specific deck");
        baseResponse.setData(errorResponse);

        res.status(500).json(baseResponse);
        return;
      }
    }
  }

  /**
   * Handles the request to create a new deck.
   * Validates required fields (deckTitle, deckDescription, coverPhoto) from the request body.
   * Uses DeckService to create the deck for the authenticated user.
   * Responds with the created deck data or an error.
   *
   * @param {AuthenticatedRequest} req - The HTTP request object containing deck details in the body and user info.
   * @param {Response} res - The HTTP response object.
   * @return {Promise<void>} Sends a JSON response.
   */
  public async createDeck(req: AuthenticatedRequest, res: Response): Promise<void> {
    // --- Input Validations ---
    const validation = createDeckSchema.safeParse(req.body);

    if (!validation.success) {
      const errorList = validation.error.errors.map(({path, message}) => {
        const field = path[0] as string;
        let code: string;

        switch (field) {
        case "title":
          code = message.includes("type") ? "INVALID_DECK_TITLE_TYPE" : "DECK_TITLE_REQUIRED";
          break;
        case "description":
          code = message.includes("type") ?
            "INVALID_DECK_DESCRIPTION_TYPE":
            "DECK_DESCRIPTION_REQUIRED";
          break;
        case "coverPhoto":
          code = message.includes("type") ?
            "INVALID_DECK_COVERPHOTO_TYPE" :
            "INVALID_DECK_COVERPHOTO_URL";
          break;
        default:
          code = "VALIDATION_ERROR";
        }

        return {field, code, message};
      });
      throw new ApiError(
        "Deck creation validation failed",
        400,
        {errorList}
      );
    }

    // Extract validated data
    const {title, description, coverPhoto, flashcards} = validation.data;
    const userID = req.user?.user_id;

    // Call service method
    const deck = await this.deckService.createDeck(title, userID, coverPhoto, description, flashcards);

    const baseResponse = new BaseResponse();
    baseResponse.setStatus(201);
    baseResponse.setMessage("Deck was successfully created");
    baseResponse.setData(deck);

    res.status(201).json(baseResponse);
    return;
  }

  /**
   * Handles the request to save a deck.
   * Validates required fields (deckID) from the request body.
   * Uses DeckService to create the deck for the authenticated user.
   * Responds with the created deck data or an error.
   *
   * @param {AuthenticatedRequest} req - The HTTP request object containing deck details in the body and user info.
   * @param {Response} res - The HTTP response object.
   * @return {Promise<void>} Sends a JSON response.
   */
  public async saveDeck(req: AuthenticatedRequest, res: Response): Promise<void> {
    const baseResponse = new BaseResponse();
    const errorResponse = new ErrorResponse();
    try {
      const userID = req.user?.user_id;
      const deckID = req.params.deckID;

      // --- Input Validations ---
      if (!deckID) {
        errorResponse.setError("DECK_ID_REQUIRED");
        errorResponse.setMessage("The deck ID is required to save the deck");
        baseResponse.setStatus(400);
        baseResponse.setMessage("An error has occurred while saving the deck");
        baseResponse.setData(errorResponse);
        res.status(400).json(baseResponse);
        return;
      }

      if (typeof deckID !== "string" || deckID.trim() === "") {
        errorResponse.setError("INVALID_DECK_ID");
        errorResponse.setMessage("The deck ID should be of type string and not empty or blank");
        baseResponse.setStatus(400);
        baseResponse.setMessage("An error has occurred while saving the deck");
        baseResponse.setData(errorResponse);
        res.status(400).json(baseResponse);
        return;
      }

      // Call service method
      await this.deckService.saveDeck(userID, deckID);

      baseResponse.setStatus(201);
      baseResponse.setMessage("Deck was successfully saved");
      baseResponse.setData(null);

      res.status(201).json(baseResponse);
      return;
    } catch (error) {
      if (error instanceof Error) {
        errorResponse.setError(error.name);
        errorResponse.setMessage(error.message);

        baseResponse.setStatus(400);
        baseResponse.setMessage("An error has occurred while saving the deck");
        baseResponse.setData(errorResponse);

        res.status(400).json(baseResponse);
        return;
      } else {
        errorResponse.setError("UNKNOWN_ERROR");
        errorResponse.setMessage("An unknown error occurred in save deck");

        baseResponse.setStatus(500);
        baseResponse.setMessage("An unknown error occurred while saving the deck");
        baseResponse.setData(errorResponse);

        res.status(500).json(baseResponse);
        return;
      }
    }
  }

  /**
   * Handles the request to save a deck.
   * Validates required fields (deckID) from the request body.
   * Uses DeckService to create the deck for the authenticated user.
   * Responds with the created deck data or an error.
   *
   * @param {AuthenticatedRequest} req - The HTTP request object containing deck details in the body and user info.
   * @param {Response} res - The HTTP response object.
   * @return {Promise<void>} Sends a JSON response.
   */
  public async unsaveDeck(req: AuthenticatedRequest, res: Response): Promise<void> {
    const baseResponse = new BaseResponse();
    const errorResponse = new ErrorResponse();
    try {
      const userID = req.user?.user_id;
      const deckID = req.params.deckID;

      // --- Input Validations ---
      if (!deckID) {
        errorResponse.setError("DECK_ID_REQUIRED");
        errorResponse.setMessage("The deck ID is required to unsave the deck");
        baseResponse.setStatus(400);
        baseResponse.setMessage("An error has occurred while unsaving the deck");
        baseResponse.setData(errorResponse);
        res.status(400).json(baseResponse);
        return;
      }

      if (typeof deckID !== "string" || deckID.trim() === "") {
        errorResponse.setError("INVALID_DECK_ID");
        errorResponse.setMessage("The deck ID should be of type string and not empty or blank");
        baseResponse.setStatus(400);
        baseResponse.setMessage("An error has occurred while unsaving the deck");
        baseResponse.setData(errorResponse);
        res.status(400).json(baseResponse);
        return;
      }

      // Call service method
      await this.deckService.unsaveDeck(userID, deckID);

      baseResponse.setStatus(201);
      baseResponse.setMessage("Deck was successfully unsaved");
      baseResponse.setData(null);

      res.status(201).json(baseResponse);
      return;
    } catch (error) {
      if (error instanceof Error) {
        errorResponse.setError(error.name);
        errorResponse.setMessage(error.message);

        baseResponse.setStatus(400);
        baseResponse.setMessage("An error has occurred while unsaving the deck");
        baseResponse.setData(errorResponse);

        res.status(400).json(baseResponse);
        return;
      } else {
        errorResponse.setError("UNKNOWN_ERROR");
        errorResponse.setMessage("An unknown error occurred in save deck");

        baseResponse.setStatus(500);
        baseResponse.setMessage("An unknown error occurred while unsaving the deck");
        baseResponse.setData(errorResponse);

        res.status(500).json(baseResponse);
        return;
      }
    }
  }

  /**
   * Handles the request to update a specific deck.
   * Validates the fields provided for update (deckTitle, coverPhoto, isDeleted, isPrivate, deckDescription).
   * Ensures at least one valid field is provided. Uses DeckService to apply updates.
   * Responds with the updated deck data or an error.
   *
   * @param {AuthenticatedRequest} req - The HTTP request object containing update details in body, deckID in params, and user info.
   * @param {Response} res - The HTTP response object.
   * @return {Promise<void>} Sends a JSON response.
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
          return;
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
          return;
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
          return;
        }

        // Only allow if it being updated to true
        if (isPrivate === true) {
          updateData.is_private = isPrivate;
        } else if (isPrivate === false) {
          // If the deck is being set to private, check if there is a pending publish request
          const deckRepo = new DeckRepository();
          const hasPending = await deckRepo.hasPendingPublishRequest(deckID);
          if (hasPending) {
            throw new ApiError(
              "A publish request for this deck is already pending.",
              400,
              {errorCode: "PUBLISH_REQUEST_ALREADY_PENDING", message: "A pending publish request already exists for this deck."}
            );
          }

          // If deck is being published call the moderation endpoint
          const accessToken = (req.headers as { authorization: string }).authorization;

          const url = "https://deck-ai-api-taglvgaoma-uc.a.run.app/v2/deck/moderate/";
          const reqBody = {
            deckId: deckID,
          };
          callFirebaseAIAPI(userID, accessToken, url, reqBody);

          baseResponse.setStatus(200);
          baseResponse.setMessage("Publish Request is Now Pending");
          baseResponse.setData(null);

          res.status(200).json(baseResponse);
          return;
        }
      }

      if (isDeleted !== undefined) {
        if (typeof isDeleted !== "boolean") {
          errorResponse.setError("INVALID_DELETE_FLAG_VALUE");
          errorResponse.setMessage("The is delete flag of the deck should be of type boolean and not empty or blank");

          baseResponse.setStatus(400);
          baseResponse.setMessage("An error while updating the deck");
          baseResponse.setData(errorResponse);

          res.status(400).json(baseResponse);
          return;
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
          return;
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
        return;
      }

      const deck = await this.deckService.updateDeck(userID, deckID, updateData);

      baseResponse.setStatus(200);
      baseResponse.setMessage("Deck was successfully updated");
      baseResponse.setData(deck);

      res.status(200).json(baseResponse);
      return;
    } catch (error) {
      console.log(error);
      if (error instanceof Error) {
        errorResponse.setError(error.name);
        errorResponse.setMessage(error.message);

        baseResponse.setStatus(400);
        baseResponse.setMessage("An error has occured while updating the deck");
        baseResponse.setData(errorResponse);

        res.status(400).json(baseResponse);
        return;
      } else {
        errorResponse.setError("UNKNOWN_ERROR");
        errorResponse.setMessage("An unknown error occurred in update deck");

        baseResponse.setStatus(500);
        baseResponse.setMessage("An unknown error occurred while updating the deck");
        baseResponse.setData(errorResponse);

        res.status(500).json(baseResponse);
        return;
      }
    }
  }

  /**
   * Handles the request to delete one or more decks.
   * Expects an array of deck IDs in the request body.
   * Uses DeckService to perform the deletion for the authenticated user.
   * Responds with a success message or an error.
   *
   * @param {AuthenticatedRequest} req - The HTTP request object containing deckIDs array in body and user info.
   * @param {Response} res - The HTTP response object.
   * @return {Promise<void>} Sends a JSON response.
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
        return;
      } else {
        errorResponse.setError("UNKNOWN_ERROR");
        errorResponse.setMessage("An unknown error occurred in delete deck");

        baseResponse.setStatus(500);
        baseResponse.setMessage("An unknown error occurred while deleting the deck");
        baseResponse.setData(errorResponse);

        res.status(500).json(baseResponse);
        return;
      }
    }
  }

  /**
   * Handles the request to recommend public decks to a user.
   * Validates query parameters (limit) and uses DeckService for retrieval.
   *
   * @param {AuthenticatedRequest} req - The HTTP request object, potentially including authenticated user info.
   * @param {Response} res - The HTTP response object.
   * @return {Promise<void>} Sends a JSON response.
   */
  public async recommendPublicDecks(req: AuthenticatedRequest, res: Response): Promise<void> {
    const baseResponse = new BaseResponse();

    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
    const userID = req.user?.user_id;

    if (!userID) {
      throw new ApiError("User ID is required to retrieve decks", 400, {
        userID,
        errorCode: "USER_ID_REQUIRED",
      });
    }

    // Validate limit parameter
    if (isNaN(limit) || (limit <= 1 || limit > 50)) {
      throw new ApiError(
        "Invalid limit value. It must be a positive number that is greater than 1 and is less than or equal to 50.",
        400,
        {userID, limit, errorCode: "INVALID_LIMIT_VALUE"}
      );
    }

    // Call service method
    const decks = await this.deckService.recommendPublicDecks(userID, limit);

    // Send success response
    baseResponse.setStatus(200);
    baseResponse.setMessage("Successfuly retrieved decks");
    baseResponse.setData(decks);

    res.status(200).json(baseResponse);
    return;
  }

  /**
   * Handles the request to search for decks based on a search query.
   * Validates query parameters (searchQuery, limit) and uses DeckService for retrieval.
   * Responds with paginated deck data or an error.
   *
   * @param {Request} req - The HTTP request object containing search parameters.
   * @param {Response} res - The HTTP response object.
   * @return {Promise<void>} Sends a JSON response.
   */
  public async logDeckActivity(req: AuthenticatedRequest, res: Response): Promise<void> {
    const baseResponse = new BaseResponse();
    const userID = req.user?.user_id;

    // Determine activity
    const activities = ["IDENTIFICATION_QUIZ", "MULTIPLE_CHOICE_QUIZ", "STUDY"];
    const activity = req.body.activity as string;

    if (!activities.includes(activity)) {
      throw new ApiError(
        `Invalid activity code. Allowed activities: ${activities.join(", ")}`,
        400,
        {activity, errorCode: "INVALID_ACTIVITY_VALUE"}
      );
    }

    const deckId = req.body.deckID;
    if (!deckId || typeof deckId !== "string" || deckId.trim() === "") {
      throw new ApiError(
        "Deck ID is required to log deck activity",
        400,
        {deckId, errorCode: "DECK_ID_REQUIRED"}
      );
    }

    // Call service method
    const decks = await this.deckService.logDeckActivity(userID, deckId, activity);

    // Send success response
    baseResponse.setStatus(200);
    baseResponse.setMessage("Successfuly logged deck activity");
    baseResponse.setData(decks);

    res.status(200).json(baseResponse);
    return;
  }

  /**
   * Handles the request to search for decks based on a search query.
   * Validates query parameters (searchQuery, limit) and uses DeckService for retrieval.
   * Responds with paginated deck data or an error.
   *
   * @param {Request} req - The HTTP request object containing search parameters.
   * @param {Response} res - The HTTP response object.
   * @return {Promise<void>} Sends a JSON response.
   */
  public async logQuizAttemp(req: AuthenticatedRequest, res: Response): Promise<void> {
    const baseResponse = new BaseResponse();
    const userID = req.user?.user_id;

    const raw = req.body.attempted_at;
    if (raw === undefined || raw === null) {
      throw new ApiError(
        "Attempted at timestamp is required to log quiz attempt",
        400,
        {raw, errorCode: "ATTEMPTED_AT_REQUIRED"}
      );
    }

    let date: Date;
    if (typeof raw === "string") {
      date = new Date(raw);
    } else if (typeof raw === "number") {
      date = new Date(raw);
    } else {
      throw new ApiError(
        "Attempted at timestamp must be a valid date string or timestamp",
        400,
        {raw, errorCode: "INVALID_ATTEMPTED_AT_TYPE"}
      );
    }

    if (isNaN(date.getTime())) {
      throw new ApiError(
        "Attempted at timestamp must be a valid date string or timestamp",
        400,
        {raw, errorCode: "INVALID_ATTEMPTED_AT_VALUE"}
      );
    }

    const attemptedAt = FirebaseAdmin.convertToTimestamp(date);

    if (!attemptedAt) {
      throw new ApiError(
        "Attempted at timestamp is required to log quiz attempt",
        400,
        {attemptedAt, errorCode: "ATTEMPTED_AT_REQUIRED"}
      );
    }

    const quizTypes = ["IDENTIFICATION_QUIZ", "MULTIPLE_CHOICE_QUIZ"];
    const quizType = req.body.quizType as string;
    if (!quizTypes.includes(quizType)) {
      throw new ApiError(
        `Invalid quiz type. Allowed types: ${quizTypes.join(", ")}`,
        400,
        {quizType, errorCode: "INVALID_QUIZ_TYPE"}
      );
    }

    const score = req.body.score;
    if (typeof score !== "number" || score < 0) {
      throw new ApiError(
        "Score is required to log quiz attempt and must be a non-negative number",
        400,
        {score, errorCode: "SCORE_REQUIRED"}
      );
    }

    const totalQuestions = req.body.totalQuestions;
    if (typeof totalQuestions !== "number" || totalQuestions <= 0) {
      throw new ApiError(
        "Total questions is required to log quiz attempt and must be a positive number",
        400,
        {totalQuestions, errorCode: "TOTAL_QUESTIONS_REQUIRED"}
      );
    }

    const correctQuestionIds = req.body.correctQuestionIds;
    if (!Array.isArray(correctQuestionIds) || correctQuestionIds.some((id) => typeof id !== "string")) {
      throw new ApiError(
        "Correct question IDs are required to log quiz attempt and must be an array of strings",
        400,
        {correctQuestionIds, errorCode: "CORRECT_QUESTION_IDS_REQUIRED"}
      );
    }

    const incorrectQuestionIds = req.body.incorrectQuestionIds;
    if (!Array.isArray(incorrectQuestionIds) || incorrectQuestionIds.some((id) => typeof id !== "string")) {
      throw new ApiError(
        "Incorrect question IDs are required to log quiz attempt and must be an array of strings",
        400,
        {incorrectQuestionIds, errorCode: "INCORRECT_QUESTION_IDS_REQUIRED"}
      );
    }

    const deckID = req.body.deckID;
    if (!deckID || typeof deckID !== "string" || deckID.trim() === "") {
      throw new ApiError(
        "Deck ID is required to log deck activity",
        400,
        {deckID, errorCode: "DECK_ID_REQUIRED"}
      );
    }

    // Call service method
    const decks = await this.deckService.logQuizAttempt(
      userID,
      deckID,
      attemptedAt,
      quizType,
      score,
      totalQuestions,
      correctQuestionIds,
      incorrectQuestionIds
    );

    // Send success response
    baseResponse.setStatus(200);
    baseResponse.setMessage("Successfuly logged quiz attempt");
    baseResponse.setData(decks);

    res.status(200).json(baseResponse);
    return;
  }

  /**
   * Handles the request to search for decks based on a search query.
   * Validates query parameters (searchQuery, limit) and uses DeckService for retrieval.
   * Responds with paginated deck data or an error.
   *
   * @param {Request} req - The HTTP request object containing search parameters.
   * @param {Response} res - The HTTP response object.
   * @return {Promise<void>} Sends a JSON response.
   */
  public async getLatestDeckActivity(req: AuthenticatedRequest, res: Response): Promise<void> {
    const baseResponse = new BaseResponse();
    const userID = req.user?.user_id;

    const deckId = req.body.deckID;
    if (!deckId || typeof deckId !== "string" || deckId.trim() === "") {
      throw new ApiError(
        "Deck ID is required to log deck activity",
        400,
        {deckId, errorCode: "DECK_ID_REQUIRED"}
      );
    }

    // Call service method
    const decks = await this.deckService.getLatestDeckActivity(userID);

    // Send success response
    baseResponse.setStatus(200);
    baseResponse.setMessage("Successfuly logged deck activity");
    baseResponse.setData(decks);

    res.status(200).json(baseResponse);
    return;
  }

  /**
   * Handles the request to get the latest quiz attempt for a user.
   * Validates query parameters (searchQuery, limit) and uses DeckService for retrieval.
   * Responds with paginated deck data or an error.
   *
   * @param {Request} req - The HTTP request object containing search parameters.
   * @param {Response} res - The HTTP response object.
   * @return {Promise<void>} Sends a JSON response.
   */
  public async getLatestQuizAttempt(req: AuthenticatedRequest, res: Response): Promise<void> {
    const baseResponse = new BaseResponse();
    const userID = req.user?.user_id;

    // Call service method
    const decks = await this.deckService.getLatestQuizAttempt(userID);

    // Send success response
    baseResponse.setStatus(200);
    baseResponse.setMessage("Successfuly logged deck activity");
    baseResponse.setData(decks);

    res.status(200).json(baseResponse);
    return;
  }
}
