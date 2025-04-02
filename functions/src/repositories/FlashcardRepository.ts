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
      const db = this.getDb();
      const deckRef = db.collection("decks").doc(deckID);
      const deckSnap = await deckRef.get();

      if (!deckSnap.exists) {
        throw new Error("DECK_NOT_FOUND");
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
      console.error("Error fetching decks:", error);
      if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error("GET_DECK_UNKNOWN_ERROR");
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
      const db = this.getDb();
      const deckRef = db.collection("decks").doc(deckID);
      const deckSnap = await deckRef.get();

      if (!deckSnap.exists) {
        throw new Error("DECK_NOT_FOUND");
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
      console.error("Error fetching all decks:", error);
      if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error("GET_DECK_UNKNOWN_ERROR");
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
        throw new Error("INVALID_DECK_ID");
      }
      if (!flashcardID || typeof flashcardID !== "string") {
        throw new Error("INVALID_FLASHCARD_ID");
      }

      const db = this.getDb();
      const flashcardRef = db
        .collection("decks")
        .doc(deckID)
        .collection("flashcards")
        .doc(flashcardID);
      const flashcardSnap = await flashcardRef.get();

      if (!flashcardSnap.exists) throw new Error("SPECIFIC_DECK_NOT_FOUND");

      // Extract deck data
      const flashcard = flashcardSnap.data() ? {id: flashcardSnap.id, ...flashcardSnap.data()} : null;

      return {
        flashcard,
      };
    } catch (error) {
      console.error("Error fetching flashcards:", error);
      if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error("GET_SPECIFIC_FLASHCARD_UNKNOWN_ERROR");
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
      if (!flashcardData || typeof flashcardData !== "object") {
        throw new Error("INVALID_FLASHCARD_DATA");
      }

      const db = this.getDb();

      const query = db.collection("decks").doc(deckID);
      const deck = await query.get();

      if (!deck.exists) {
        throw new Error("DECK_NOT_FOUND");
      }

      if (deck.data()?.is_deleted) {
        throw new Error("DECK_DELETED");
      }

      if (deck.data()?.owner_id !== userID) {
        throw new Error("UNAUTHORIZED_USER");
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
      console.error("Error creating flashcard :", error);
      if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error("CREATE_FLASHCARD_UNKNOWN_ERROR");
      }
    }
  }

  /**
  * Updates a deck document in Firestore with the provided data.
  *
  * @async
  * @function updateFlashcard
  * @param {string} userID - The ID of the one who owns the deck.
  * @param {string} deckId - The unique identifier of the deck to update.
  * @param {string} flashcardID - The UID of the specific flashcard.
  * @param {Object} data - The key-value pairs representing the fields to update.
  * @return {Promise<object>} - Resolves if the update is successful.
  * @throws {Error} - Throws an error if the deck ID is invalid, the update data is not an object, or the update operation fails.
  */
  public async updateFlashcard(userID: string, deckId: string, flashcardID: string, data: object): Promise<object> {
    try {
      // Validate inputs
      if (!deckId || typeof deckId !== "string") {
        throw new Error("INVALID_DECK_ID");
      }

      if (!flashcardID || typeof flashcardID !== "string") {
        throw new Error("INVALID_FLASHCARD_ID");
      }

      if (!data || typeof data !== "object" || Array.isArray(data)) {
        throw new Error("INVALID_UPDATE_DATA");
      }

      const db = this.getDb();

      const deckRef = db.collection("decks").doc(deckId);
      const deck = await deckRef.get();

      if (!deck.exists) {
        throw new Error("DECK_NOT_FOUND");
      }

      if (deck.data()?.is_deleted) {
        throw new Error("DECK_DELETED");
      }

      if (deck.data()?.owner_id !== userID) {
        // TODO: check if the user id has a role of moderator
        throw new Error("UNAUTHORIZED_USER");
      }

      const flashcardRef = deckRef.collection("flashcards").doc(flashcardID);
      const flashcardSnap = await flashcardRef.get();

      if (!flashcardSnap.exists) {
        throw new Error("FLASHCARD_NOT_FOUND");
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
        throw new Error("DECK_NOT_FOUND_AFTER_UPDATE");
      }

      const flashcard = updatedFlashcard ? {id: flashcardID, ...updatedFlashcard.data()} : null;

      return {
        flashcard,
      };
    } catch (error) {
      console.error("Error updating flashcard:", error);
      if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error("UPDATE_FLASHCARD_UNKNOWN_ERROR");
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
        throw new Error("INVALID_DECK_ID");
      }
      if (!Array.isArray(flashcardIDs) || flashcardIDs.length === 0) {
        throw new Error("INVALID_FLASHCARD_IDS");
      }

      const db = this.getDb();
      const deckRef = db.collection("decks").doc(deckID);

      // Check if deck exists before deleting
      const deckSnapshot = await deckRef.get();
      if (!deckSnapshot.exists) {
        throw new Error("DECK_NOT_FOUND");
      }

      if (deckSnapshot.data()?.owner_id !== userID) {
        throw new Error("UNAUTHORIZED_USER");
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
      console.error("Error deleting flashcards:", error);
      if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error("DELETE_FLASHCARDS_UNKNOWN_ERROR");
      }
    }
  }
}
