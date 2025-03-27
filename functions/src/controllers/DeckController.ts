
import {Request, Response} from "express";
import {DeckRepository} from "../repositories/DeckRepository";

/**
 * Class responsible for initializing and managing the services related to deck
 * management.
 */
export class DeckController {
  private deckRepository: DeckRepository;

  /**
   * Initializes the DeckController with a DeckRepository instance.
   *
   * @param {DeckRepository} deckRepository - The repository handling data operations.
   */
  constructor(deckRepository: DeckRepository) {
    this.deckRepository = deckRepository;
  }

  /**
  * Handles the request to fetch all decks that an owner owns.
  *
  * @param {Request} req - The HTTP request object.
  * @param {Response} res - The HTTP response object.
  * @return {Promise<Response>} A JSON response containing a message indicating the action performed.
  */
  public async getOwnerDecks(req: Request, res: Response): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

      if (isNaN(limit) || limit <= 0) {
        res.status(400).json({error: "Invalid limit value. It must be a positive number."});
        return;
      }
      const nextPageToken = req.query.pageToken ? (req.query.pageToken as string) : null;

      const decks = await this.deckRepository.getOwnerDecks(limit, nextPageToken);

      res.status(200).json(decks);
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
      } else {
        console.log("An unknown error occurred");
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

      const decks = await this.deckRepository.getPublicDecks(limit, nextPageToken);

      res.status(200).json(decks);
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
      } else {
        console.log("An unknown error occurred");
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
    res.json({message: "fetching a specific decks"});
  }

  /**
  * Handles the request to create a deck
  *
  * @param {Request} req - The HTTP request object.
  * @param {Response} res - The HTTP response object.
  * @return {Promise<Response>} A JSON response containing a message indicating the action performed.
  */
  public async createDeck(req: Request, res: Response): Promise<void> {
    res.json({message: "creating a new deck"});
  }

  /**
  * Handles the request to update a specific deck
  *
  * @param {Request} req - The HTTP request object.
  * @param {Response} res - The HTTP response object.
  * @return {Promise<Response>} A JSON response containing a message indicating the action performed.
  */
  public async updateDeck(req: Request, res: Response): Promise<void> {
    res.json({message: "updating a deck"});
  }

  /**
  * Handles the request to delete a specific deck
  *
  * @param {Request} req - The HTTP request object.
  * @param {Response} res - The HTTP response object.
  * @return {Promise<Response>} A JSON response containing a message indicating the action performed.
  */
  public async deleteDeck(req: Request, res: Response): Promise<void> {
    res.json({message: "deleting a deck"});
  }
}
