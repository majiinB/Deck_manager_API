import {DeckRepository} from "../repositories/DeckRepository";
import {FirebaseAdmin} from "../config/FirebaseAdmin";
import {Utils} from "../utils/utils";

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
  public async getPublicDecks(limit: number, nextPageToken: string | null): Promise<object | void> {
    try {
      const decks = await this.deckRepository.getPublicDecks(limit, nextPageToken);
      return decks;
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
        throw new Error(error.message);
      } else {
        console.log("An unknown error occurred");
        throw new Error("An unknown error occurred");
      }
    }
  }

  /**
   * Retrieves a specific deck.
   * @param {string} deckID - The UID of the specific flashcard.
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

  /**
   * Creates a deck entity
   * @param {string} deckTitle - The title of the created deck.
   * @param {string} userID - The ID of the one who owns and requested for the creation of deck.
   * @param {string | null} coverPhoto - The cover photo url of the uploaded jpeg.
   * @param {string} description - The description of the created deck.
   * @return {Promise<object>} A promise resolving to the owner's deck data.
   */
  public async createDeck(deckTitle:string, userID: string, coverPhoto: string | null = null, description: string): Promise<object> {
    try {
      const coverPhotoRef = coverPhoto ?? "https://firebasestorage.googleapis.com/v0/b/deck-f429c.appspot.com/o/deckCovers%2Fdefault%2FdeckDefault.png?alt=media&token=de6ac50d-13d0-411c-934e-fbeac5b9f6e0";
      const deck = {
        title: Utils.cleanTitle(deckTitle),
        is_deleted: false,
        is_private: true,
        owner_id: userID,
        cover_photo: coverPhotoRef,
        created_at: FirebaseAdmin.getTimeStamp(),
        description: description,
      };

      const decks = await this.deckRepository.createDeck(deck);
      return decks;
    } catch (error) {
      console.error("Error creating deck:", error);
      throw new Error(error instanceof Error ? error.message : "CREATE_DECK_UNKNOWN_ERROR");
    }
  }

  /**
   * Updates a specific deck.
   * @param {string} deckID - The UID of the deck to be updated.
   * @param {object} updateData - The title of the created deck.
   * @return {Promise<object>} A promise resolving to the owner's deck data.
   */
  public async updateDeck(deckID: string, updateData: object): Promise<object> {
    try {
      const updatedDeck = await this.deckRepository.updateDeck(deckID, updateData);
      return updatedDeck;
    } catch (error) {
      console.error("Error creating deck:", error);
      throw new Error(error instanceof Error ? error.message : "CREATE_DECK_UNKNOWN_ERROR");
    }
  }
  /**
   * Deletes (HARD) a specific deck.
   * @param {string} deckID - The UID of the deck to be delete.
   * @return {Promise<object>} A promise resolving to the owner's deck data.
   */
  public async deleteDeck(deckID: string): Promise<void> {
    try {
      await this.deckRepository.deleteDeck(deckID);
    } catch (error) {
      console.error("Error deleting deck:", error);
      throw new Error(error instanceof Error ? error.message : "DELETE_DECK_UNKNOWN_ERROR");
    }
  }
}
