/**
 * Flashcard Manager API - Repository
 *
 * @file FlashcardRepository.ts
 * This module defines the repository layer for managing flashcard data within Firestore,
 * where flashcards are stored as a subcollection under their respective decks.
 * Extending FirebaseAdmin, it provides methods for CRUD operations on flashcards,
 * including retrieving lists (paginated or all), getting specific flashcards,
 * creating, updating, and deleting them. It handles necessary validations
 * (deck existence, owner checks) and maintains the flashcard count on the parent deck document.
 *
 * Methods:
 * - getFlashcards: Queries Firestore for non-deleted flashcards within a specific deck, supporting pagination.
 * - getAllFlashcards: Queries Firestore for all non-deleted flashcards within a specific deck.
 * - getSpecificFlashcard: Retrieves a single flashcard document from a specific deck's subcollection by its ID.
 * - createFlashcard: Adds a new flashcard document to a deck's subcollection and increments the deck's flashcard count.
 * - updateFlashcard: Updates fields of an existing flashcard document and adjusts the deck's flashcard count if deletion status changes.
 * - deleteFlashcards: Deletes one or more flashcard documents from a deck's subcollection using a batch operation and decrements the deck's flashcard count.
 *
 * @module repository
 * @file FlashcardRepository.ts
 * @class FlashcardRepository
 * @classdesc Provides data access methods for the 'flashcards' subcollection within 'decks' in Firestore, managing related deck counts and performing necessary authorization checks.
 * @author Arthur M. Artugue
 * @created 2024-03-30
 * @updated 2025-05-17
 */

import {FirebaseAdmin} from "../config/FirebaseAdmin";

/**
 * The `FlashcardRepository` class extends the `FirebaseAdmin` class to provide
 * repository functionalities for managing flashcard-related data in a Firebase
 * environment. This class serves as a bridge between the application logic
 * and the Firebase database, encapsulating operations specific to flashcards.
 */
export class FlashcardRepository extends FirebaseAdmin {
  /**
   * Retrieves a paginated list of non-deleted flashcards for a specific deck from Firestore.
   * Orders flashcards by creation date.
   *
   * @param {string} deckID - The unique identifier of the parent deck.
   * @param {number} limit - The maximum number of flashcards to return per page.
   * @param {string | null} [nextPageToken=null] - The document ID of the last flashcard from the previous page, used for pagination.
   * @return {Promise<object>} A promise resolving to an object containing the flashcards array and the next page token.
   * @throws {Error} Throws custom errors (INVALID_DECK_ID, DECK_NOT_FOUND, DATABASE_FETCH_ERROR) on failure or invalid input.
   */
  public async getFlashcards(deckID: string, limit: number, nextPageToken: string | null = null): Promise<object> {
    try {
      if (!deckID || typeof deckID !== "string") {
        const error = new Error(`Deck ${deckID} is not a valid deck ID. Deck ID is must be a string`);
        error.name = "INVALID_DECK_ID";
        throw error;
      }

      const db = this.getDb();
      const deckRef = db.collection("decks").doc(deckID);
      const deckSnap = await deckRef.get();

      if (!deckSnap.exists) {
        const error = new Error(`Deck ${deckID} does not exist`);
        error.name = "DECK_NOT_FOUND";
        throw error;
      }

      let query = deckRef
        .collection("flashcards")
        .where("is_deleted", "==", false)
        .orderBy("term")
        .limit(limit);

      if (nextPageToken) {
        const lastDocSnapShot = await deckRef.collection("flashcards").doc(nextPageToken).get();
        if (lastDocSnapShot.exists) {
          query = query.startAfter(lastDocSnapShot);
        }
      }

      const snapshot = await query.get();

      // Extract deck data
      const flashcards = snapshot.docs.map((doc)=> ({
        id: doc.id,
        ...doc.data(),
      }));

      // Get nextPageToken (last document ID)
      const lastDoc = snapshot.docs[snapshot.docs.length - 1];
      const nextToken = lastDoc ? lastDoc.id : null;

      return {
        flashcards,
        nextPageToken: nextToken,
      };
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "DECK_NOT_FOUND" ||
            error.name === "INVALID_DECK_ID") {
          throw error;
        } {
          throw error;
        }
        const internalError = new Error("An error occured while fetching the flashcards");
        internalError.name = "DATABASE_FETCH_ERROR";
        throw internalError;
      } else {
        const unknownError = new Error("An unknown error occurred while fetching the flashcards");
        unknownError.name = "GET_FLASHCARDS_UNKNOWN_ERROR";
        throw unknownError;
      }
    }
  }

  /**
   * Retrieves all non-deleted flashcards for a specific deck from Firestore.
   * Orders flashcards by creation date. Note: This might be inefficient for decks with very large numbers of flashcards.
   *
   * @param {string} deckID - The unique identifier of the parent deck.
   * @return {Promise<object>} A promise resolving to an object containing an array of all flashcards.
   * @throws {Error} Throws custom errors (INVALID_DECK_ID, DECK_NOT_FOUND, DATABASE_FETCH_ERROR) on failure or invalid input.
   */
  public async getAllFlashcards(deckID: string): Promise<object> {
    try {
      if (!deckID || typeof deckID !== "string") {
        const error = new Error(`Deck ${deckID} is not a valid deck ID. Deck ID is must be a string`);
        error.name = "INVALID_DECK_ID";
        throw error;
      }

      const db = this.getDb();
      const deckRef = db.collection("decks").doc(deckID);
      const deckSnap = await deckRef.get();

      if (!deckSnap.exists) {
        const error = new Error(`Deck ${deckID} does not exist`);
        error.name = "DECK_NOT_FOUND";
        throw error;
      }

      const query = deckRef
        .collection("flashcards")
        .where("is_deleted", "==", false)
        .orderBy("created_at");

      const snapshot = await query.get();

      // Extract deck data
      const flashcards = snapshot.docs.map((doc)=> ({
        id: doc.id,
        ...doc.data(),
      }));

      return {
        flashcards,
      };
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "DECK_NOT_FOUND" ||
            error.name === "INVALID_DECK_ID"
        ) {
          throw error;
        }
        const internalError = new Error("An error occured while fetching all flashcards");
        internalError.name = "DATABASE_FETCH_ERROR";
        throw internalError;
      } else {
        const unknownError = new Error("An unknown error occurred while fetching all flashcards");
        unknownError.name = "GET_ALL_FLASHCARDS_UNKNOWN_ERROR";
        throw unknownError;
      }
    }
  }

  /**
   * Retrieves a specific flashcard document by its ID from within a specific deck's subcollection.
   *
   * @param {string} deckID - The unique identifier of the parent deck.
   * @param {string} flashcardID - The unique identifier of the flashcard to retrieve.
   * @return {Promise<object>} A promise resolving to an object containing the flashcard data (or null if not found).
   * @throws {Error} Throws custom errors (INVALID_DECK_ID, DECK_NOT_FOUND, INVALID_FLASHCARD_ID, SPECIFIC_FLASHCARD_NOT_FOUND, DATABASE_FETCH_ERROR) on failure or invalid input.
   */
  public async getSpecificFlashcard(deckID: string, flashcardID: string): Promise<object> {
    try {
      // Validate inputs
      if (!deckID || typeof deckID !== "string") {
        const error = new Error(`Deck ${deckID} is not a valid deck ID. Deck ID is must be a string`);
        error.name = "INVALID_DECK_ID";
        throw error;
      }
      if (!flashcardID || typeof flashcardID !== "string") {
        const error = new Error(`Flashcard ${flashcardID} is not a valid flashcard ID. Flashcard ID is must be a string`);
        error.name = "INVALID_FLASHCARD_ID";
        throw error;
      }

      const db = this.getDb();
      const deckRef = db.collection("decks").doc(deckID);
      const deckSnap = await deckRef.get();

      if (!deckSnap.exists) {
        const error = new Error(`Deck ${deckID} does not exist`);
        error.name = "DECK_NOT_FOUND";
        throw error;
      }

      const flashcardRef = deckRef.collection("flashcards").doc(flashcardID);
      const flashcardSnap = await flashcardRef.get();

      if (!flashcardSnap.exists) {
        const error = new Error(`Flashcard ${flashcardID} does not exist`);
        error.name = "SPECIFIC_FLASHCARD_NOT_FOUND";
        throw error;
      }
      // Extract deck data
      const flashcard = flashcardSnap.data() ? {id: flashcardSnap.id, ...flashcardSnap.data()} : null;

      return {
        flashcard,
      };
    } catch (error) {
      if (error instanceof Error) {
        const knownErrors = [
          "INVALID_DECK_ID", "DECK_NOT_FOUND", "INVALID_FLASHCARD_ID",
          "SPECIFIC_FLASHCARD_NOT_FOUND",
        ];
        if (knownErrors.includes(error.name)) {
          throw error;
        }
        const internalError = new Error("An unknown error occurred while fetching the specific flashcards");
        internalError.name = "DATABASE_FETCH_ERROR";
        throw internalError;
      } else {
        const unknownError = new Error("An unknown error occurred while fetching the specific flashcards");
        unknownError.name = "GET_SPECIFIC_FLASHCARDS_UNKNOWN_ERROR";
        throw unknownError;
      }
    }
  }

  /**
 * Creates multiple flashcards in a specific deck's subcollection in Firestore.
 * Also increments the 'flashcard_count' field on the parent deck document.
 * Performs checks for deck existence, deck deletion status, and user authorization.
 *
 * @param {string} userID - The ID of the user creating the flashcards (must match deck owner).
 * @param {string} deckID - The unique identifier of the parent deck.
 * @param {object[]} flashcards - Array of flashcard data objects (should match expected schema, excluding ID).
 * @return {Promise<object[] | void>} A promise resolving to an array of created flashcards with their IDs.
 * @throws {Error} Throws custom errors on failure or invalid input/permissions.
 */
  public async createFlashcards(userID: string, deckID: string, flashcards: object[]): Promise<object[] | void> {
    try {
      // Basic input validations
      if (!deckID || typeof deckID !== "string") {
        throw Object.assign(new Error(`Deck ${deckID} is not a valid deck ID`), {name: "INVALID_DECK_ID"});
      }
      if (!userID || typeof userID !== "string") {
        throw Object.assign(new Error(`User ${userID} is not a valid user ID`), {name: "INVALID_USER_ID"});
      }
      if (!Array.isArray(flashcards) || flashcards.some((f) => typeof f !== "object")) {
        throw Object.assign(new Error("Flashcards must be an array of valid objects"), {name: "INVALID_FLASHCARD_DATA"});
      }

      const db = this.getDb();
      const query = db.collection("decks").doc(deckID);
      const deckDoc = await query.get();

      if (!deckDoc.exists) {
        throw Object.assign(new Error(`Deck ${deckID} does not exist`), {name: "DECK_NOT_FOUND"});
      }

      const deckData = deckDoc.data();
      if (deckData?.is_deleted) {
        throw Object.assign(new Error("Deck has been deleted"), {name: "DECK_DELETED"});
      }

      if (deckData?.owner_id !== userID) {
        throw Object.assign(new Error("User is not authorized to add flashcards to this deck"), {name: "UNAUTHORIZED_USER"});
      }

      // Add flashcards
      const flashcardRefs = await Promise.all(
        flashcards.map((flashcard) =>
          query.collection("flashcards").add(flashcard)
        )
      );

      // Update flashcard count
      const currentCount = deckData?.flashcard_count ?? 0;
      const newCount = currentCount + flashcardRefs.length;
      await query.update({flashcard_count: newCount});

      // Prepare return data
      const createdFlashcards = flashcardRefs.map((ref, i) => ({
        id: ref.id,
        ...flashcards[i],
      }));

      return createdFlashcards;
    } catch (error) {
      const knownErrors = [
        "INVALID_DECK_ID", "INVALID_USER_ID", "INVALID_FLASHCARD_DATA",
        "DECK_NOT_FOUND", "DECK_DELETED", "UNAUTHORIZED_USER",
      ];
      if (error instanceof Error && knownErrors.includes(error.name)) {
        throw error;
      }
      throw Object.assign(new Error("An unknown error occurred while creating the flashcards"), {
        name: "DATABASE_CREATE_ERROR",
      });
    }
  }

  /**
   * Updates an existing flashcard document within a specific deck's subcollection in Firestore.
   * Adjusts the 'flashcard_count' on the parent deck if the 'is_deleted' status of the flashcard changes.
   * Performs checks for deck/flashcard existence, deck deletion status, and user authorization.
   *
   * @param {string} userID - The ID of the user updating the flashcard (must match deck owner).
   * @param {string} deckID - The unique identifier of the parent deck.
   * @param {string} flashcardID - The unique identifier of the flashcard to update.
   * @param {object} data - An object containing the fields and values to update on the flashcard.
   * @return {Promise<object | void>} A promise resolving to an object containing the updated flashcard data including its ID.
   * @throws {Error} Throws custom errors (INVALID_DECK_ID, INVALID_FLASHCARD_ID, INVALID_UPDATE_DATA, DECK_NOT_FOUND, DECK_DELETED, UNAUTHORIZED_USER, FLASHCARD_NOT_FOUND, DATABASE_UPDATE_ERROR) on failure or invalid input/permissions.
   */
  public async updateFlashcard(userID: string, deckID: string, flashcardID: string, data: object): Promise<object | void> {
    try {
      // Validate inputs
      if (!deckID || typeof deckID !== "string") {
        const error = new Error(`Deck ${deckID} is not a valid deck ID. Deck ID is must be a string`);
        error.name = "INVALID_DECK_ID";
        throw error;
      }
      if (!flashcardID || typeof flashcardID !== "string") {
        const error = new Error("Flashcard ID is not a valid flashcard ID. Flashcard ID is must be a string");
        error.name = "INVALID_FLASHCARD_ID";
        throw error;
      }
      if (!data || typeof data !== "object" || Array.isArray(data)) {
        const error = new Error("Update data is not a valid object. Update data must be an object");
        error.name = "INVALID_UPDATE_DATA";
        throw error;
      }

      const db = this.getDb();

      const deckRef = db.collection("decks").doc(deckID);
      const deck = await deckRef.get();

      if (!deck.exists) {
        const error = new Error(`Deck ${deckID} does not exist`);
        error.name = "DECK_NOT_FOUND";
        throw error;
      }

      if (deck.data()?.is_deleted) {
        const error = new Error("Deck has been deleted");
        error.name = "DECK_DELETED";
        throw error;
      }

      if (deck.data()?.owner_id !== userID) {
        // TODO: check if the user id has a role of moderator
        const error = new Error("User is not authorized to create flashcards in this deck");
        error.name = "UNAUTHORIZED_USER";
        throw error;
      }

      const flashcardRef = deckRef.collection("flashcards").doc(flashcardID);
      const flashcardSnap = await flashcardRef.get();

      if (!flashcardSnap.exists) {
        const error = new Error(`Flashcard ${flashcardID} does not exist`);
        error.name = "FLASHCARD_NOT_FOUND";
        throw error;
      }

      const previousData = flashcardSnap.data();

      // Update the flashcard
      await flashcardRef.update(data);

      // Adjust flashcard_count if is_deleted is updated
      if (Object.prototype.hasOwnProperty.call(data, "is_deleted")) {
        const isDeletedNow = (data as { is_deleted?: boolean }).is_deleted;
        const wasDeletedBefore = previousData?.is_deleted ?? false;

        if (isDeletedNow === true && wasDeletedBefore === false) {
          await deckRef.update({flashcard_count: deck.data()?.flashcard_count - 1});
        } else if (isDeletedNow === false && wasDeletedBefore === true) {
          await deckRef.update({flashcard_count: deck.data()?.flashcard_count + 1});
        }
      }

      const updatedFlashcard = await flashcardRef.get();

      if (!updatedFlashcard.exists) {
        const error = new Error(`Flashcard ${flashcardID} does not exist after update`);
        error.name = "DECK_NOT_FOUND_AFTER_UPDATE";
        throw error;
      }

      const flashcard = updatedFlashcard ? {id: flashcardID, ...updatedFlashcard.data()} : null;

      return {
        flashcard,
      };
    } catch (error) {
      if (error instanceof Error) {
        const knownErrors = [
          "INVALID_DECK_ID", "INVALID_FLASHCARD_ID", "INVALID_UPDATE_DATA",
          "DECK_NOT_FOUND", "DECK_DELETED", "UNAUTHORIZED_USER",
          "FLASHCARD_NOT_FOUND", "FLASHCARD_GONE_AFTER_UPDATE",
        ];
        if (knownErrors.includes(error.name)) {
          throw error;
        }
        const internalError = new Error("An unknown error occurred while updating the flashcard");
        internalError.name = "DATABASE_UPDATE_ERROR";
        throw internalError;
      } else {
        const unknownError = new Error("An unknown error occurred while updating the flashcard");
        unknownError.name = "UPDATE_FLASHCARDS_UNKNOWN_ERROR";
        throw unknownError;
      }
    }
  }


  /**
   * Deletes multiple flashcard documents from a specific deck's subcollection using a Firestore batch.
   * Also decrements the 'flashcard_count' on the parent deck document by the number of successfully deleted flashcards.
   * Performs checks for deck existence and user authorization before proceeding.
   * Skips flashcards that don't exist but proceeds with others.
   *
   * @param {string} userID - The ID of the user deleting the flashcards (must match deck owner).
   * @param {string} deckID - The unique identifier of the parent deck.
   * @param {string[]} flashcardIDs - An array of unique identifiers of the flashcards to delete.
   * @return {Promise<void>} A promise that resolves when the deletion batch commit and count update are complete.
   * @throws {Error} Throws custom errors (INVALID_DECK_ID, INVALID_FLASHCARD_IDS, DECK_NOT_FOUND, UNAUTHORIZED_USER, DATABASE_DELETE_ERROR, PARTIAL_DELETE_FAILURE) on failure or invalid input/permissions.
   */
  public async deleteFlashcards(userID: string, deckID: string, flashcardIDs: string[]): Promise<void> {
    try {
      // Validate input
      if (!deckID || typeof deckID !== "string") {
        const error = new Error(`Deck ${deckID} is not a valid deck ID. Deck ID is must be a string`);
        error.name = "INVALID_DECK_ID";
        throw error;
      }
      if (!Array.isArray(flashcardIDs) || flashcardIDs.length === 0) {
        const error = new Error("Flashcard IDs must be a non-empty array of strings");
        error.name = "INVALID_FLASHCARD_IDS";
        throw error;
      }

      const db = this.getDb();
      const deckRef = db.collection("decks").doc(deckID);

      // Check if deck exists before deleting
      const deckSnapshot = await deckRef.get();
      if (!deckSnapshot.exists) {
        const error = new Error(`Deck ${deckID} does not exist`);
        error.name = "DECK_NOT_FOUND";
        throw error;
      }

      if (deckSnapshot.data()?.owner_id !== userID) {
        const error = new Error("User is not authorized to create flashcards in this deck");
        error.name = "UNAUTHORIZED_USER";
        throw error;
      }

      const batch = db.batch();
      let deletedCount = 0;

      for (const flashcardID of flashcardIDs) {
        const flashcardRef = deckRef.collection("flashcards").doc(flashcardID);
        const flashcardSnapshot = await flashcardRef.get();

        if (flashcardSnapshot.exists) {
          batch.delete(flashcardRef);
          deletedCount++;
        }
      }

      // Commit batch delete
      await batch.commit();
      console.log(`Deleted ${deletedCount} flashcards from deck ${deckID}`);

      // Update flashcard count
      if (deletedCount > 0) {
        const newFlashcardCount = (deckSnapshot.data()?.flashcard_count || 0) - deletedCount;
        await deckRef.update({flashcard_count: Math.max(newFlashcardCount, 0)});
      }
    } catch (error) {
      if (error instanceof Error) {
        const knownErrors = [
          "INVALID_DECK_ID", "INVALID_FLASHCARD_IDS", "DECK_NOT_FOUND",
          "UNAUTHORIZED_USER",
        ];
        if (knownErrors.includes(error.name)) {
          throw error;
        }

        const internalError = new Error("An unknown error occurred while deleting the flashcard");
        internalError.name = "DATABASE_DELETE_ERROR";
        throw internalError;
      } else {
        const unknownError = new Error("An unknown error occurred while deleting the flashcard");
        unknownError.name = "DELETE_FLASHCARDS_UNKNOWN_ERROR";
        throw unknownError;
      }
    }
  }
}
