/**
 * Deck Manager API - Service
 *
 * @file DeckService.ts
 * This module defines the service layer for managing deck-related operations.
 * It encapsulates the business logic for decks, interacts with the DeckRepository
 * for data persistence, utilizes utility functions for data cleaning (like Utils.cleanTitle),
 * and prepares data structures for creation or retrieval (e.g., setting defaults, timestamps).
 *
 * Methods:
 * - getOwnerDeck: Retrieves paginated decks owned by a specific user via the repository.
 * - getPublicDecks: Retrieves paginated public (non-private) decks via the repository.
 * - getSpecificDeck: Retrieves details for a single deck by its ID via the repository.
 * - createDeck: Constructs a new deck object with defaults (privacy, cover photo, timestamp) and requests its creation via the repository.
 * - updateDeck: Passes update data for a specific deck to the repository.
 * - deleteDeck: Requests the hard deletion of one or more decks by their IDs via the repository.
 *
 * @module service
 * @file DeckService.ts
 * @class DeckService
 * @classdesc Handles business logic and data orchestration for deck operations, acting as an intermediary between the controller and the repository.
 * @author Arthur M. Artugue
 * @created 2024-03-26
 * @updated 2025-05-12
 */

import {DeckRepository} from "../repositories/DeckRepository";
import {FirebaseAdmin} from "../config/FirebaseAdmin";
import {Utils} from "../utils/utils";
import {Deck, SaveDeck} from "../interface/Deck";
import {FlashcardService} from "../services/FlashCardService";
import {Gemini} from "../config/Gemini";
import {FieldValue} from "firebase-admin/firestore";

/**
 * Service class responsible for handling operations related to decks.
 * This class provides methods to manage and manipulate deck data.
 */
export class DeckService extends Gemini {
  /**
   * A repository instance for managing deck-related data operations.
   * Provides methods to interact with the data source for creating, reading,
   * updating, and deleting deck entities.
   */
  private deckRepository: DeckRepository;
  /**
   * A service instance for managing flashcard-related operations.
   * It acts as an intermediary between the controller and the repository
   */
  private flashcardService: FlashcardService;

  /**
   * Initializes the DeckService with a DeckRepository instance.
   *
   * @param {DeckRepository} deckRepository - The repository handling data operations.
   * @param {FlashcardService} flashcardService - The repository handling data operations.
   */
  constructor(deckRepository: DeckRepository, flashcardService: FlashcardService) {
    super();
    this.deckRepository = deckRepository;
    this.flashcardService = flashcardService;
  }

  /**
   * Retrieves decks owned by the specified user with pagination.
   * Delegates the retrieval logic to the deck repository.
   *
   * @param {string} userID - The ID of the user whose decks are to be retrieved.
   * @param {number} limit - The maximum number of decks to retrieve per page.
   * @param {string | null} nextPageToken - Token for fetching the next page of results, or null for the first page.
   * @return {Promise<object | void>} A promise resolving to the paginated deck data object from the repository, or void/throws on error.
   * @throws Will re-throw errors encountered during repository access.
   */
  public async getOwnerDeck(userID: string, limit: number, nextPageToken: string | null): Promise<object | void> {
    try {
      const decks = await this.deckRepository.getOwnerDecks(userID, limit, nextPageToken);
      return decks;
    } catch (error) {
      if (error instanceof Error) throw error;
    }
  }

  /**
   * Retrieves public decks with pagination.
   * Delegates the retrieval logic to the deck repository.
   *
   * @param {number} limit - The maximum number of decks to retrieve per page.
   * @param {string | null} nextPageToken - Token for fetching the next page of results, or null for the first page.
   * @return {Promise<object | void>} A promise resolving to the paginated public deck data object from the repository, or void/throws on error.
   * @throws Will re-throw errors encountered during repository access.
   */
  public async getPublicDecks(limit: number, nextPageToken: string | null): Promise<object | void> {
    try {
      const decks = await this.deckRepository.getPublicDecks(limit, nextPageToken);
      return decks;
    } catch (error) {
      if (error instanceof Error) throw error;
    }
  }

  /**
   * Retrieves a specific deck by its ID.
   * Delegates the retrieval logic to the deck repository.
   *
   * @param {string} deckID - The unique identifier of the deck to retrieve.
   * @return {Promise<object | void>} A promise resolving to the specific deck data object from the repository, or void/throws if not found or on error.
   * @throws Will re-throw errors encountered (e.g., deck not found, repository access error).
   */
  public async getSpecificDeck(deckID:string): Promise<object | null> {
    try {
      const decks = await this.deckRepository.getSpecificDeck(deckID);
      return decks;
    } catch (error) {
      if (error instanceof Error) throw error;
      else return null;
    }
  }

  /**
   * Searches for decks based on a query.
   * Delegates the retrieval logic to the deck repository.
   *
   * @param {string} userID - The ID of the user whose decks are to be retrieved.
   * @param {string} query - The search query string.
   * @param {number} limit - The maximum number of decks to retrieve per page.
   * @param {boolean} searchOwnDeck - Flag indicating whether to search the user's own decks or public decks.
   * @return {Promise<object | void>} A promise resolving to the paginated deck data object from the repository, or void/throws on error.
   * @throws Will re-throw errors encountered during repository access.
   */
  public async searchDeck(userID: string, query: string, limit:number, searchOwnDeck: boolean): Promise<object | void> {
    try {
      let decks;
      const embedResponse = await this.embedQuery(query);
      const firstEmbedObj = embedResponse.embeddings[0];
      const embeddedQuery: number[] = firstEmbedObj.values;

      if (searchOwnDeck) {
        decks = await this.deckRepository.searchOwnerDecks(userID, embeddedQuery, limit);
      } else {
        decks = await this.deckRepository.searchPublicDecks(userID, embeddedQuery, limit);
      }

      return decks;
    } catch (error) {
      if (error instanceof Error) throw error;
    }
  }

  /**
   * Creates a new deck entity with default values and cleaned data.
   * Constructs the deck data object and delegates persistence to the repository.
   *
   * @param {string} title - The title for the new deck.
   * @param {string} userID - The ID of the user creating the deck (owner).
   * @param {string | null} [coverPhoto=null] - Optional URL for the deck's cover photo. Defaults to a standard image if null.
   * @param {string} description - The description for the new deck.
   * @param {Array<object> | null} flashcards - Optional array of flashcard objects to be associated with the deck.
   * @param {string} flashcards[].term - The term for the flashcard.
   * @param {string} flashcards[].definition - The definition for the flashcard.
   * @return {Promise<object | void>} A promise resolving to the created deck data object from the repository, or void/throws on error.
   * @throws Will re-throw errors encountered during repository access or data processing.
   */
  public async createDeck(title: string, userID: string, coverPhoto: string | null = null, description: string, flashcards: Array<{ term: string; definition: string }> | undefined): Promise<object | void> {
    try {
      const coverPhotoRef = coverPhoto ?? "https://firebasestorage.googleapis.com/v0/b/deck-f429c.appspot.com/o/deckCovers%2Fdefault%2FdeckDefault.png?alt=media&token=de6ac50d-13d0-411c-934e-fbeac5b9f6e0";

      // Generate embedding for the deck title and description
      const embedRes = await this.embedDeck(`Deck title: ${title}, Description: ${description}`);
      const firstEmbedObj = embedRes.embeddings[0];
      const vector: number[] = firstEmbedObj.values;

      if (!embedRes) {
        const error = new Error("Failed to create deck, failed to generate embedding");
        error.name = "DATABASE_CREATE_ERROR";
        throw error;
      }

      const deck: Omit<Deck, "id"> = {
        title: Utils.cleanTitle(title),
        is_deleted: false,
        is_private: true,
        owner_id: userID,
        cover_photo: coverPhotoRef,
        created_at: FirebaseAdmin.getTimeStamp(),
        description: description,
        flashcard_count: 0,
        embedding_field: FieldValue.vector(vector),
      };

      const decks = await this.deckRepository.createDeck(deck);

      if (flashcards && flashcards.length > 0) {
        const deckID = decks.id;
        await this.flashcardService.createFlashcards(userID, deckID, flashcards);
      }
      return {
        deck: decks,
      };
    } catch (error) {
      if (error instanceof Error) throw error;
    }
  }

  /**
   * saves an existing deck.
   * Delegates the save logic directly to the deck repository.
   *
   * @param {string} userID - The ID of the user requesting the update (for ownership verification in repository).
   * @param {string} deckID - The unique identifier of the deck to update.
   * @param {object} updateData - An object containing the fields to update (e.g., { title: 'New Title', is_private: false }).
   * @return {Promise<object | void>} A promise resolving to the updated deck data object from the repository, or void/throws on error.
   * @throws Will re-throw errors encountered (e.g., deck not found, permission denied, repository access error).
   */
  public async saveDeck(userID: string, deckID: string): Promise<void> {
    try {
      const deck = await this.getSpecificDeck(deckID) as Deck;
      console.log(deck);

      if (!deck) {
        const error = new Error("Deck not found");
        error.name = "DATABASE_SAVE_DECK_ERROR";
        throw error;
      }

      console.log(deck.is_deleted);
      if (deck.is_deleted) {
        const error = new Error("You cannot save a deleted deck");
        error.name = "DATABASE_SAVE_DECK_ERROR";
        throw error;
      }

      console.log(deck.is_private);
      if (deck.is_private) {
        const error = new Error("You cannot save a private deck");
        error.name = "DATABASE_SAVE_DECK_ERROR";
        throw error;
      }

      console.log(deck.owner_id);
      console.log(userID);
      if (deck.owner_id == userID) {
        const error = new Error("You cannot save your own deck");
        error.name = "DATABASE_SAVE_DECK_ERROR";
        throw error;
      }

      const savedDeckData : SaveDeck = {
        deck_id: deckID,
        user_id: userID,
        saved_at: FirebaseAdmin.getTimeStamp(),
      };

      await this.deckRepository.saveDeck(savedDeckData);
      return;
    } catch (error) {
      if (error instanceof Error) throw error;
    }
  }

  /**
   * Updates an existing deck with the provided data.
   * Delegates the update logic directly to the deck repository.
   * Assumes updateData contains validated fields mapped to repository schema.
   *
   * @param {string} userID - The ID of the user requesting the update (for ownership verification in repository).
   * @param {string} deckID - The unique identifier of the deck to update.
   * @param {object} updateData - An object containing the fields to update (e.g., { title: 'New Title', is_private: false }).
   * @return {Promise<object | void>} A promise resolving to the updated deck data object from the repository, or void/throws on error.
   * @throws Will re-throw errors encountered (e.g., deck not found, permission denied, repository access error).
   */
  public async updateDeck(userID: string, deckID: string, updateData: object): Promise<object | void> {
    try {
      const updatedDeck = await this.deckRepository.updateDeck(userID, deckID, updateData);
      return updatedDeck;
    } catch (error) {
      if (error instanceof Error) throw error;
    }
  }
  /**
   * Deletes (HARD) a specific deck.
   * @param {string} userID - The ID of the one who owns and requested for the creation of deck.
   * @param {string[]} deckIDs - The UID of the deck to be delete.
   * @return {Promise<object>} A promise resolving to the owner's deck data.
   */
  public async deleteDeck(userID: string, deckIDs: string[]): Promise<void> {
    try {
      await this.deckRepository.deleteDecks(userID, deckIDs);
    } catch (error) {
      if (error instanceof Error) throw error;
    }
  }
}
