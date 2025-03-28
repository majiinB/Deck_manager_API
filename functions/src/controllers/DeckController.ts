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
 * @author Arthur M. Artugue
 * @created 2024-03-27
 * @updated 2025-03-28
 */
import {Request, Response} from "express";
import {DeckService} from "../services/DeckService";

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
   * Initializes the DeckService with a DeckService instance.
   *
   * @param {DeckService} deckService - The service handling data transformation.
   */
  constructor(deckService: DeckService) {
    this.deckService = deckService;
  }

  /**
  * Handles the request to fetch all decks that an owner owns.
  *
  * @param {Request} req - The HTTP request object.
  * @param {Response} res - The HTTP response object.
  * @return {Promise<void>} A JSON response containing a message indicating the action performed.
  */
  public async getOwnerDecks(req: Request, res: Response): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

      if (isNaN(limit) || limit <= 0) {
        res.status(400).json({error: "Invalid limit value. It must be a positive number."});
        return;
      }

      const nextPageToken = req.query.pageToken ? (req.query.pageToken as string) : null;
      const decks = await this.deckService.getOwnerDeck(limit, nextPageToken);

      res.status(200).json(decks);
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
      } else {
        console.log("An unknown error occurred in get owner deck");
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
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

      if (isNaN(limit) || limit <= 0) {
        res.status(400).json({error: "Invalid limit value. It must be a positive number."});
        return;
      }

      const nextPageToken = req.query.pageToken ? (req.query.pageToken as string) : null;
      const decks = await this.deckService.getOwnerDeck(limit, nextPageToken);

      res.status(200).json(decks);
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
      } else {
        console.log("An unknown error occurred in get public decks");
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
    try {
      const deckID = req.params.deckID;
      const deck = await this.deckService.getSpecificDeck(deckID);

      res.status(200).json(deck);
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
      } else {
        console.log("An unknown error occurred in get specific decks");
      }
    }
  }

  /**
  * Handles the request to create a deck
  *
  * @param {Request} req - The HTTP request object.
  * @param {Response} res - The HTTP response object.
  * @return {Promise<Response>} A JSON response containing a message indicating the action performed.
  */
  public async createDeck(req: Request, res: Response): Promise<void> {
    try {
      const {deckTitle, deckDescription, coverPhoto} = req.body;
      const userID = "Y3o8pxyMZre0wOqHh6Ip98ckBmO2"; // TODO: Extract this info from jwt token

      if (typeof deckTitle !== "string") {
        res.status(400).json({
          status: 400,
          message: "INVALID_DECK_TITLE_TYPE",
          data: null,
        });
      }

      if (typeof deckDescription !== "string") {
        res.status(400).json({
          status: 400,
          message: "INVALID_DECK_DESCRIPTION_TYPE",
          data: null,
        });
      }

      if (!deckTitle?.trim()) {
        res.status(400).json({
          status: 400,
          message: "DECK_TITLE_REQUIRED",
          data: null,
        });
      }

      if (!deckDescription?.trim()) {
        res.status(400).json({
          status: 400,
          message: "DECK_DESCRIPTION_REQUIRED",
          data: null,
        });
      }

      const deck = await this.deckService.createDeck(deckTitle, userID, coverPhoto, deckDescription);

      res.status(200).json(deck);
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
      } else {
        console.log("An unknown error occurred while creating deck");
      }
    }
  }

  /**
  * Handles the request to update a specific deck
  *
  * @param {Request} req - The HTTP request object.
  * @param {Response} res - The HTTP response object.
  * @return {Promise<Response>} A JSON response containing a message indicating the action performed.
  */
  public async updateDeck(req: Request, res: Response): Promise<void> {
    try {
      const {deckTitle, coverPhoto, isDeleted, isPrivate, deckDescription} = req.body;
      const deckID = req.params.deckID;

      const updateData: Partial<{ title: string; is_private: boolean; cover_photo: string; is_deleted: boolean; description: string}> = {};

      if (deckTitle !== undefined) {
        if (typeof deckTitle !== "string" || deckTitle.trim() === "") {
          res.status(400).json({status: 400, message: "INVALID_TITLE", data: null});
        }
        updateData.title = deckTitle.trim();
      }

      if (deckDescription !== undefined) {
        if (typeof deckDescription !== "string" || deckDescription.trim() === "") {
          res.status(400).json({status: 400, message: "INVALID_DESCRIPTION", data: null});
        }
        updateData.description = deckDescription.trim();
      }

      if (isPrivate !== undefined) {
        if (typeof isPrivate !== "boolean") {
          res.status(400).json({status: 400, message: "INVALID_PRIVACY_VALUE", data: null});
        }
        updateData.is_private = isPrivate;
      }

      if (isDeleted !== undefined) {
        if (typeof isDeleted !== "boolean") {
          res.status(400).json({status: 400, message: "INVALID_DELETE_FLAG_VALUE", data: null});
        }
        updateData.is_deleted = isDeleted;
      }

      if (coverPhoto !== undefined) {
        if (typeof coverPhoto !== "string" || !coverPhoto.startsWith("http")) {
          res.status(400).json({status: 400, message: "INVALID_COVER_PHOTO_URL", data: null});
        }
        updateData.cover_photo = coverPhoto;
      }

      if (Object.keys(updateData).length === 0) {
        res.status(400).json({
          status: 400,
          message: "NO_VALID_FIELDS_TO_UPDATE",
          data: null,
        });
      }

      const deck = await this.deckService.updateDeck(deckID, updateData);

      res.status(200).json(deck);
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
      } else {
        console.log("An unknown error occurred while updating deck");
      }
    }
  }

  /**
  * Handles the request to delete a specific deck
  *
  * @param {Request} req - The HTTP request object.
  * @param {Response} res - The HTTP response object.
  * @return {Promise<Response>} A JSON response containing a message indicating the action performed.
  */
  public async deleteDeck(req: Request, res: Response): Promise<void> {
    try {
      const deckID = req.params.deckID;
      await this.deckService.deleteDeck(deckID);
      res.status(200).json({message: `Deck with ID of ${deckID} is successfully deleted`});
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
      } else {
        console.log("An unknown error occurred while updating deck");
      }
    }
  }
}
