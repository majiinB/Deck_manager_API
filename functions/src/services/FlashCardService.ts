import {FlashcardRepository} from "../repositories/FlashcardRepository";

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
}
