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
}
