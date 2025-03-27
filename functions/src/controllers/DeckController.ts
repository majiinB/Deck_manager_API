
import {Request, Response} from "express";

/**
 * Class responsible for initializing and managing the services related to deck
 * management.
 */
export class DeckController {
  /**
  * Handles the request to fetch all decks.
  *
  * @param {Request} req - The HTTP request object.
  * @param {Response} res - The HTTP response object.
  * @return {Promise<Response>} A JSON response containing a message indicating the action performed.
  */
  public async getDecks(req: Request, res: Response): Promise<void> {
    res.json({message: "fetching all decks"});
  }

  /**
  * Handles the request to fetch a specific
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
