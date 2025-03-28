
import {Request, Response} from "express";
import {FlashcardService} from "../services/FlashCardService";

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
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const deckID = req.params.deckID;

      if (isNaN(limit) || limit <= 0) {
        res.status(400).json({error: "Invalid limit value. It must be a positive number."});
        return;
      }

      const nextPageToken = req.query.pageToken ? (req.query.pageToken as string) : null;

      const decks = await this.flashcardService.getFlashcards(deckID, limit, nextPageToken);

      res.status(200).json(decks);
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
      } else {
        console.log("An unknown error occurred in get flashcard");
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
    try {
      const deckID = req.params.deckID;
      const flashcardID = req.params.flashcardID;

      const flashcard = await this.flashcardService.getSpecificFlashcard(deckID, flashcardID);

      res.status(200).json(flashcard);
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
      } else {
        console.log("An unknown error occurred in get specific decks");
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
    try {
      const {term, definition} = req.body;
      const deckID = req.params.deckID;
      // const userID = "Y3o8pxyMZre0wOqHh6Ip98ckBmO2"; // TODO: Extract this info from jwt token

      if (typeof term !== "string") {
        res.status(400).json({
          status: 400,
          message: "INVALID_FLASHCARD_TERM_TYPE",
          data: null,
        });
      }

      if (typeof definition !== "string") {
        res.status(400).json({
          status: 400,
          message: "INVALID_FLASHCARD_DEFINITION_TYPE",
          data: null,
        });
      }

      if (!term?.trim()) {
        res.status(400).json({
          status: 400,
          message: "FLASHCARD_TERM_REQUIRED",
          data: null,
        });
      }

      if (!definition?.trim()) {
        res.status(400).json({
          status: 400,
          message: "FLASHCARD_DEFINITION_REQUIRED",
          data: null,
        });
      }

      const flashcard = await this.flashcardService.createFlashcard(deckID, term, definition);

      res.status(200).json(flashcard);
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
      } else {
        console.log("An unknown error occurred while creating flashcard");
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
    res.json({message: "updating a flashcard"});
  }

  /**
  * Handles the request to delete a specific flashcard
  *
  * @param {Request} req - The HTTP request object.
  * @param {Response} res - The HTTP response object.
  * @return {Promise<Response>} A JSON response containing a message indicating the action performed.
  */
  public async deleteFlashcard(req: Request, res: Response): Promise<void> {
    res.json({message: "deleting a flashcard"});
  }
}
