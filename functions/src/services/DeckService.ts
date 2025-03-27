import {DeckRepository} from "../repositories/DeckRepository";

/**
 * Service class responsible for handling operations related to decks.
 * This class provides methods to manage and manipulate deck data.
 */
export class DeckService {
  /**
   * A repository instance for managing deck-related data operations.
   * Provides methods to interact with the data source for creating, reading,
   * updating, and deleting deck entities.
   */
  private deckRepository: DeckRepository;

  /**
   * Initializes the DeckService with a DeckRepository instance.
   *
   * @param {DeckRepository} deckRepository - The repository handling data operations.
   */
  constructor(deckRepository: DeckRepository) {
    this.deckRepository = deckRepository;
  }

  /**
   * Retrieves the deck owned by the current user.
   *
   * @param {number} limit - The maximum number of decks to retrieve.
   * @param {string | null} nextPageToken - The token for the next page of results, or null for the first page.
   * @return {Promise<object>} A promise resolving to the owner's deck data.
   */
  public async getOwnerDeck(limit: number, nextPageToken: string | null): Promise<object | void> {
    try {
      const decks = await this.deckRepository.getOwnerDecks(limit, nextPageToken);
      return decks;
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
      } else {
        console.log("An unknown error occurred");
      }
    }
  }

  /**
   * Retrieves the all public deck.
   *
   * @param {number} limit - The maximum number of decks to retrieve.
   * @param {string | null} nextPageToken - The token for the next page of results, or null for the first page.
   * @return {Promise<object>} A promise resolving to the owner's deck data.
   */
  public async getPublicDeck(limit: number, nextPageToken: string | null): Promise<object | void> {
    try {
      const decks = await this.deckRepository.getPublicDecks(limit, nextPageToken);
      return decks;
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
      } else {
        console.log("An unknown error occurred");
      }
    }
  }

  /**
   * Retrieves a specific deck.
   * @param {string} deckID - The token for the next page of results, or null for the first page.
   * @return {Promise<object>} A promise resolving to the owner's deck data.
   */
  public async getSpecificDeck(deckID:string): Promise<object | void> {
    try {
      const decks = await this.deckRepository.getSpecificDeck(deckID);
      return decks;
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
      } else {
        console.log("An unknown error occurred");
      }
    }
  }
}
