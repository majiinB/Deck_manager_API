import {FirebaseAdmin} from "../config/FirebaseAdmin";

/**
 * The `FlashcardRepository` class extends the `FirebaseAdmin` class to provide
 * repository functionalities for managing flashcard-related data in a Firebase
 * environment. This class serves as a bridge between the application logic
 * and the Firebase database, encapsulating operations specific to flashcards.
 */
export class FlashcardRepository extends FirebaseAdmin {
  /**
   * Retrieves a list of flashcards owned by a certain user with pagination support.
   * @param {string} deckID - The deck's UID.
   * @param {number} limit - The maximum number of decks to retrieve.
   * @param {string} [nextPageToken=null] - The token for the next page of results.
   * @return {Promise<any[]>} A promise that resolves to an array of decks.
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
        .orderBy("created_at")
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
        internalError.name = "INTERNAL_SERVER_ERROR";
        throw internalError;
      } else {
        const unknownError = new Error("An unknown error occurred while fetching the flashcards");
        unknownError.name = "GET_FLASHCARDS_UNKNOWN_ERROR";
        throw unknownError;
      }
    }
  }

  /**
   * Retrieves a all flashcards.
   * @param {string} deckID - The deck's UID.
   * @return {Promise<any[]>} A promise that resolves to an array of decks.
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
        internalError.name = "INTERNAL_SERVER_ERROR";
        throw internalError;
      } else {
        const unknownError = new Error("An unknown error occurred while fetching all flashcards");
        unknownError.name = "GET_ALL_FLASHCARDS_UNKNOWN_ERROR";
        throw unknownError;
      }
    }
  }

  /**
   * Retrieves a specific deck owned by a certain user.
   * @async
   * @param {string} deckID - The deck's UID.
   * @param {string} flashcardID - The flahscard's UID.
   * @return {Promise<object>} A promise that resolves to an array of decks.
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
        if (error.name === "DECK_NOT_FOUND" ||
            error.name === "INVALID_DECK_ID" ||
            error.name === "SPECIFIC_FLASHCARD_NOT_FOUND" ||
            error.name === "INVALID_FLASHCARD_ID"
        ) {
          throw error;
        }
        const internalError = new Error("An unknown error occurred while fetching the specific flashcards");
        internalError.name = "INTERNAL_SERVER_ERROR";
        throw internalError;
      } else {
        const unknownError = new Error("An unknown error occurred while fetching the specific flashcards");
        unknownError.name = "GET_SPECIFIC_FLASHCARDS_UNKNOWN_ERROR";
        throw unknownError;
      }
    }
  }

  /**
  * Creates a new flashcard in the Firestore database.
  *
  * @async
  * @function createFlashcard
  * @param {string} [userID] - The ID of the one who owns the deck.
  * @param {string} deckID - The deck's UID.
  * @param {Object} flashcardData - The data for the new flashcard.
  * @return {Promise<object>} The unique ID of the newly created deck.
  * @throws {Error} If the input data is invalid or Firestore operation fails.
  */
  public async createFlashcard(userID: string, deckID: string, flashcardData: object): Promise<object> {
    try {
      // Validate input
      if (!deckID || typeof deckID !== "string") {
        const error = new Error(`Deck ${deckID} is not a valid deck ID. Deck ID is must be a string`);
        error.name = "INVALID_DECK_ID";
        throw error;
      }
      if (!userID || typeof userID !== "string") {
        const error = new Error(`User ${userID} is not a valid user ID. User ID is must be a string`);
        error.name = "INVALID_USER_ID";
        throw error;
      }
      if (!flashcardData || typeof flashcardData !== "object") {
        const error = new Error("Flashcard data is not a valid object. Flashcard data must be an object");
        error.name = "INVALID_FLASHCARD_DATA";
        throw error;
      }

      const db = this.getDb();

      const query = db.collection("decks").doc(deckID);
      const deck = await query.get();

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
        const error = new Error("User is not authorized to create flashcards in this deck");
        error.name = "UNAUTHORIZED_USER";
        throw error;
      }

      const flashcard = await query.collection("flashcards").add(flashcardData);

      if ("flashcards_count" in (deck.data() || {})) {
        const flashcardsCount = (deck.data()?.flashcards_count ?? 0) + 1;
        await query.update({flashcards_count: flashcardsCount});
      }

      const newFlashcard = flashcard ? {id: flashcard.id, ...flashcardData} : null;

      return {
        newFlashcard,
      };
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "DECK_NOT_FOUND" ||
            error.name === "INVALID_DECK_ID" ||
            error.name === "SPECIFIC_FLASHCARD_NOT_FOUND" ||
            error.name === "INVALID_USER_ID" ||
            error.name === "INVALID_FLASHCARD_DATA" ||
            error.name === "UNAUTHORIZED_USER" ||
            error.name === "DECK_DELETED") {
          throw error;
        }
        const internalError = new Error("An unknown error occurred while creating the flashcards");
        internalError.name = "INTERNAL_SERVER_ERROR";
        throw internalError;
      } else {
        const unknownError = new Error("An unknown error occurred while creating the flashcards");
        unknownError.name = "CREATE_FLASHCARDS_UNKNOWN_ERROR";
        throw unknownError;
      }
    }
  }

  /**
  * Updates a deck document in Firestore with the provided data.
  *
  * @async
  * @function updateFlashcard
  * @param {string} userID - The ID of the one who owns the deck.
  * @param {string} deckID - The unique identifier of the deck to update.
  * @param {string} flashcardID - The UID of the specific flashcard.
  * @param {Object} data - The key-value pairs representing the fields to update.
  * @return {Promise<object>} - Resolves if the update is successful.
  * @throws {Error} - Throws an error if the deck ID is invalid, the update data is not an object, or the update operation fails.
  */
  public async updateFlashcard(userID: string, deckID: string, flashcardID: string, data: object): Promise<object> {
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
        if (error.name === "INVALID_DECK_ID" ||
            error.name === "INVALID_FLASHCARD_ID" ||
            error.name === "INVALID_UPDATE_DATA" ||
            error.name === "DECK_NOT_FOUND" ||
            error.name === "DECK_DELETED" ||
            error.name === "UNAUTHORIZED_USER" ||
            error.name === "FLASHCARD_NOT_FOUND" ||
            error.name === "DECK_NOT_FOUND_AFTER_UPDATE") {
          throw error;
        }
        const internalError = new Error("An unknown error occurred while updating the flashcard");
        internalError.name = "INTERNAL_SERVER_ERROR";
        throw internalError;
      } else {
        const unknownError = new Error("An unknown error occurred while updating the flashcard");
        unknownError.name = "UPDATE_FLASHCARDS_UNKNOWN_ERROR";
        throw unknownError;
      }
    }
  }


  /**
 * Deletes multiple flashcards in the Firestore database and updates the flashcard count.
 *
 * @async
 * @function deleteFlashcards
 * @param {string} userID - The ID of the one who owns the deck.
 * @param {string} deckID - The UID of the deck.
 * @param {string[]} flashcardIDs - An array of flashcard UIDs to be deleted.
 * @return {Promise<void>} Resolves when deletion is complete.
 * @throws {Error} If the input data is invalid or Firestore operation fails.
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
        if (error.name === "INVALID_DECK_ID" ||
            error.name === "INVALID_FLASHCARD_IDS" ||
            error.name === "DECK_NOT_FOUND" ||
            error.name === "UNAUTHORIZED_USER") {
          throw error;
        }
        const internalError = new Error("An unknown error occurred while deleting the flashcard");
        internalError.name = "INTERNAL_SERVER_ERROR";
        throw internalError;
      } else {
        const unknownError = new Error("An unknown error occurred while deleting the flashcard");
        unknownError.name = "DELETE_FLASHCARDS_UNKNOWN_ERROR";
        throw unknownError;
      }
    }
  }
}
