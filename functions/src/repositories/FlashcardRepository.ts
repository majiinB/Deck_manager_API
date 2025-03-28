import {FirebaseAdmin} from "../config/FirebaseAdmin";

/**
 * The `FlashcardRepository` class extends the `FirebaseAdmin` class to provide
 * repository functionalities for managing flashcard-related data in a Firebase
 * environment. This class serves as a bridge between the application logic
 * and the Firebase database, encapsulating operations specific to flashcards.
 */
export class FlashcardRepository extends FirebaseAdmin {
  /**
   * Retrieves a list of decks owned by a certain user with pagination support.
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
  * @param {string} deckID - The deck's UID.
  * @param {Object} flashcardData - The data for the new flashcard.
  * @return {Promise<object>} The unique ID of the newly created deck.
  * @throws {Error} If the input data is invalid or Firestore operation fails.
  */
  public async createFlashcard(deckID: string, flashcardData: object): Promise<object> {
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

      const flashcard = await query.collection("flashcards").add(flashcardData);
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
}
