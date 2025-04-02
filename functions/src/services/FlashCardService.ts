import {FirebaseAdmin} from "../config/FirebaseAdmin";
import {FlashcardRepository} from "../repositories/FlashcardRepository";
import {Utils} from "../utils/utils";

/**
 * Service class responsible for handling operations related to flashcards.
 * This class provides methods to manage and manipulate flashcard data.
 */
export class FlashcardService {
  /**
   * A repository instance for managing flashcard-related data operations.
   * Provides methods to interact with the data source for creating, reading,
   * updating, and deleting flashcard entities.
   */
  private flashcardRepository: FlashcardRepository;

  /**
   * Initializes the FlashcardRepository with a FlashcardRepository instance.
   *
   * @param {FlashcardRepository} flashcardRepository - The repository handling data operations.
   */
  constructor(flashcardRepository: FlashcardRepository) {
    this.flashcardRepository = flashcardRepository;
  }

  /**
   * Retrieves the flashcards of a specific deck.
   * @param {string} deckID - The deck's UID.
   * @param {number} limit - The maximum number of decks to retrieve.
   * @param {string | null} nextPageToken - The token for the next page of results, or null for the first page.
   * @return {Promise<object>} A promise resolving to the owner's deck data.
   */
  public async getFlashcards(deckID: string, limit: number, nextPageToken: string | null): Promise<object | void> {
    try {
      const flashcards = await this.flashcardRepository.getFlashcards(deckID, limit, nextPageToken);
      return flashcards;
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
      } else {
        console.log("An unknown error occurred");
      }
    }
  }

  /**
   * Retrieves the flashcards of a specific deck.
   * @param {string} deckID - The deck's UID.
   * @param {number | null} numOfCards - The number of flashcards to be selected.
   * @return {Promise<object>} A promise resolving to the owner's deck data.
   */
  public async getRandomFlashcards(deckID: string, numOfCards: number | null): Promise<object | void> {
    try {
      const flashcardsData = await this.flashcardRepository.getAllFlashcards(deckID) as {flashcards: object[]}; // Cast to expected type

      // Ensure that flashcardsData is actually an object and has the flashcards property.
      if (!flashcardsData || !flashcardsData.flashcards || !Array.isArray(flashcardsData.flashcards)) {
        return {error: "No flashcards found for this deck."}; // Edge case 5:  No flashcards or invalid format
      }
      const flashcards = flashcardsData.flashcards;

      if (flashcards.length < 5) {
        return {error: "Not enough flashcards to randomize and select."}; // Edge case 7
      }

      // 2. Fischer-Yates Shuffle
      const shuffledFlashcards = Utils.fischerYatesShuffle(flashcards);

      // 3. Determine number of cards to return
      let numToReturn = numOfCards;

      if (numToReturn === null || numToReturn === undefined) {
        // 4. Edge case: No numOfCards provided
        numToReturn = Math.ceil(shuffledFlashcards.length * 0.5); // Default to 50%
      }

      if (numToReturn > shuffledFlashcards.length) {
        return {error: "Requested number of flashcards exceeds available cards."}; // Edge case 6
      }

      const selectedFlashcards = shuffledFlashcards.slice(0, numToReturn);
      return {flashcards: selectedFlashcards}; // consistent return format
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
      } else {
        console.log("An unknown error occurred");
      }
    }
  }

  /**
   * Retrieves a specific flashcard.
   * @param {string} deckID - The UID of the specific deck.
   * @param {string} flashcardID - The UID of the specific flashcard.
   * @return {Promise<object>} A promise resolving to the owner's deck data.
   */
  public async getSpecificFlashcard(deckID:string, flashcardID: string): Promise<object | void> {
    try {
      const decks = await this.flashcardRepository.getSpecificFlashcard(deckID, flashcardID);
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
  * Creates a flashcard entity
  * @param {string} userID - The ID of the one who owns the deck.
  * @param {string} deckID - The title of the created deck.
  * @param {string} term - The ID of the one who owns and requested for the creation of deck.
  * @param {string} definition - The cover photo url of the uploaded jpeg.
  * @return {Promise<object>} A promise resolving to the owner's deck data.
  */
  public async createFlashcard(userID: string, deckID:string, term: string, definition: string): Promise<object> {
    try {
      const flashcard = {
        term: term,
        is_deleted: false,
        is_starred: false,
        definition: definition,
        created_at: FirebaseAdmin.getTimeStamp(),
      };

      const newFlashcard = await this.flashcardRepository.createFlashcard(userID, deckID, flashcard);
      return newFlashcard;
    } catch (error) {
      console.error("Error creating flashcard:", error);
      throw new Error(error instanceof Error ? error.message : "CREATE_FLASHCARD_UNKNOWN_ERROR");
    }
  }

  /**
   * Updates a specific flashcard.
   * @param {string} userID - The ID of the one who owns the deck.
   * @param {string} deckID - The UID of the deck to be updated.
   * @param {string} flashcardID - The UID of the specific flashcard.
   * @param {object} updateData - The title of the created deck.
   * @return {Promise<object>} A promise resolving to the owner's deck data.
   */
  public async updateFlashcard(userID: string, deckID: string, flashcardID: string, updateData: object): Promise<object> {
    try {
      const updatedFlashcard = await this.flashcardRepository.updateFlashcard(userID, deckID, flashcardID, updateData);
      return updatedFlashcard;
    } catch (error) {
      console.error("Error updating flashcard:", error);
      throw new Error(error instanceof Error ? error.message : "UPDATE_FLASHCARD_UNKNOWN_ERROR");
    }
  }

  /**
   * Deletes (HARD) a specific flashcard.
   * @param {string} userID - The ID of the one who owns the deck.
   * @param {string} deckID - The UID of the deck to be delete.
   * @param {string} flashcardID - The UID of the flashcard to be deleted.
   * @return {Promise<object>} A promise resolving to the owner's deck data.
   */
  public async deleteFlashcard(userID: string, deckID: string, flashcardID: string): Promise<void> {
    try {
      await this.flashcardRepository.deleteFlashcard(userID, deckID, flashcardID);
    } catch (error) {
      console.error("Error deleting deck:", error);
      throw new Error(error instanceof Error ? error.message : "DELETE_DECK_UNKNOWN_ERROR");
    }
  }
}
