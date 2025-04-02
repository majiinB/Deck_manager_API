import {FirebaseAdmin} from "../config/FirebaseAdmin";

/**
 * The `DeckRepository` class extends the `FirebaseAdmin` class to provide
 * repository functionalities for managing deck-related data in a Firebase
 * environment. This class serves as a bridge between the application logic
 * and the Firebase database, encapsulating operations specific to decks.
 */
export class DeckRepository extends FirebaseAdmin {
  /**
   * Retrieves a list of decks owned by a certain user with pagination support.
   * @param {string} [userID] - The ID of the one who owns the deck.
   * @param {number} limit - The maximum number of decks to retrieve.
   * @param {string} [nextPageToken=null] - The token for the next page of results.
   * @return {Promise<any[]>} A promise that resolves to an array of decks.
   */
  public async getOwnerDecks(userID: string, limit: number, nextPageToken: string | null = null): Promise<object> {
    try {
      const db = this.getDb();
      let query = db
        .collection("decks")
        .where("owner_id", "==", userID) // Filter by owner_id
        .where("is_deleted", "==", false) // Filter out deleted decks
        .orderBy("title") // Order results
        .limit(limit); // Limit results

      if (nextPageToken) {
        const lastDocSnapShot = await db.collection("decks").doc(nextPageToken).get();
        if (lastDocSnapShot.exists) {
          query = query.startAfter(lastDocSnapShot);
        }
      }

      const snapshot = await query.get();

      // Extract deck data
      const decks = snapshot.docs.map((doc)=> ({
        id: doc.id,
        ...doc.data(),
      }));

      // Get nextPageToken (last document ID)
      const lastDoc = snapshot.docs[snapshot.docs.length - 1];
      const nextToken = lastDoc ? lastDoc.id : null;

      return {
        decks,
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
   * Retrieves a list of published decks with pagination support.
   * @param {number} limit - The maximum number of decks to retrieve.
   * @param {string} [nextPageToken=null] - The token for the next page of results.
   * @return {Promise<any[]>} A promise that resolves to an array of decks.
   */
  public async getPublicDecks(limit: number, nextPageToken: string | null = null): Promise<object> {
    try {
      const db = this.getDb();
      let query = db
        .collection("decks")
        .where("is_private", "==", false) // Filter by owner_id
        .where("is_deleted", "==", false) // Filter out deleted decks
        .orderBy("title") // Order results
        .limit(limit); // Limit results

      if (nextPageToken) {
        const lastDocSnapShot = await db.collection("decks").doc(nextPageToken).get();
        if (lastDocSnapShot.exists) {
          query = query.startAfter(lastDocSnapShot);
        }
      }

      const snapshot = await query.get();

      // Extract deck data
      const decks = snapshot.docs.map((doc)=> ({
        id: doc.id,
        ...doc.data(),
      }));

      // Get nextPageToken (last document ID)
      const lastDoc = snapshot.docs[snapshot.docs.length - 1];
      const nextToken = lastDoc ? lastDoc.id : null;

      return {
        decks,
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
   * @return {Promise<object>} A promise that resolves to an array of decks.
   */
  public async getSpecificDeck(deckID: string): Promise<object> {
    try {
      // Validate inputs
      if (!deckID || typeof deckID !== "string") {
        throw new Error("INVALID_DECK_ID");
      }

      const db = this.getDb();
      const deckRef = db
        .collection("decks")
        .doc(deckID);
      const deckSnap = await deckRef.get();

      if (!deckSnap.exists) throw new Error("SPECIFIC_DECK_NOT_FOUND");


      // Extract deck data
      const deckData = deckSnap.data();
      const deck = deckData ? {id: deckSnap.id, ...deckData} : null;

      return {
        deck,
      };
    } catch (error) {
      console.error("Error fetching decks:", error);
      if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error("GET_SPECIFIC_DECK_UNKNOWN_ERROR");
      }
    }
  }

  /**
  * Creates a new deck in the Firestore database.
  *
  * @async
  * @function createDeck
  * @param {Object} deckData - The data for the new deck.
  * @param {boolean} deckData.is_deleted - Whether the deck is deleted (soft delete flag).
  * @param {boolean} deckData.is_private - Whether the deck is private.
  * @param {string} deckData.title - The cleaned title of the deck.
  * @param {string} deckData.owner_id - The ID of the deck's owner.
  * @param {string} [deckData.cover_photo] - (Optional) URL of the deck's cover photo.
  * @return {Promise<object>} The unique ID of the newly created deck.
  * @throws {Error} If the input data is invalid or Firestore operation fails.
  */
  public async createDeck(deckData: object): Promise<object> {
    try {
      // Validate input
      if (!deckData || typeof deckData !== "object") {
        throw new Error("INVALID_DECK_DATA");
      }

      const db = this.getDb();

      const res = await db.collection("decks").add(deckData);

      return {
        id: res.id,
        fields: deckData,
      };
    } catch (error) {
      console.error("Error creating deck:", error);
      if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error("CREATE_DECK_UNKNOWN_ERROR");
      }
    }
  }

  /**
  * Updates a deck document in Firestore with the provided data.
  *
  * @async
  * @function updateDeck
  * @param {string} [userID] - The ID of the one who owns the deck.
  * @param {string} deckId - The unique identifier of the deck to update.
  * @param {Object} data - The key-value pairs representing the fields to update.
  * @return {Promise<object>} - Resolves if the update is successful.
  * @throws {Error} - Throws an error if the deck ID is invalid, the update data is not an object, or the update operation fails.
  */
  public async updateDeck(userID: string, deckId: string, data: object): Promise<object> {
    try {
      // Validate inputs
      if (!deckId || typeof deckId !== "string") {
        throw new Error("INVALID_DECK_ID");
      }
      if (!data || typeof data !== "object" || Array.isArray(data)) {
        throw new Error("INVALID_UPDATE_DATA");
      }
      const db = this.getDb();

      const deckRef = db.collection("decks").doc(deckId);
      const deckData = await deckRef.get();

      if (!deckData.exists) {
        throw new Error("DECK_NOT_FOUND");
      }

      const deckOwner = deckData.data()?.owner_id;

      if (deckOwner !== userID) {
        throw new Error("NOT_AUTHORIZED_TO_UPDATE_DECK");
      }

      // TODO: Check if the user role is admin
      // AND the data to be changed is only the is_deleted field
      // OR the is_private field

      await deckRef.update(data);

      const updatedDeck = await deckRef.get();

      if (!updatedDeck.exists) {
        throw new Error("DECK_NOT_FOUND_AFTER_UPDATE");
      }

      return {
        deck_id: deckId,
        fields: {...updatedDeck.data()},
      };
    } catch (error) {
      console.error("Error updating deck:", error);
      if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error("UPDATE_DECK_UNKNOWN_ERROR");
      }
    }
  }

  /**
  * Deletes a deck in the Firestore database.
  *
  * @async
  * @function deleteDeck
  * @param {string} [userID] - The ID of the one who owns the deck.
  * @param {string} deckID - The UID of the deck to be deleted.
  * @return {Promise<void>} The unique ID of the newly created deck.
  * @throws {Error} If the input data is invalid or Firestore operation fails.
  */
  public async deleteDeck(userID: string, deckID: string): Promise<void> {
    try {
      // Validate input
      if (!deckID || typeof deckID !== "string") {
        throw new Error("INVALID_DECK_ID");
      }

      const db = this.getDb();
      const deckRef = db.collection("decks").doc(deckID);

      // Check if deck exists before deleting
      const deckSnapshot = await deckRef.get();
      if (!deckSnapshot.exists) {
        throw new Error("DECK_NOT_FOUND");
      }

      const deckOwner = deckSnapshot.data()?.owner_id;

      if (deckOwner !== userID) {
        throw new Error("NOT_AUTHORIZED_TO_DELETE_DECK");
      }

      // TODO: Check if the user role is admin

      // Permanently delete the deck
      await deckRef.delete();
      console.log(`Deck with ID ${deckID} has been deleted.`);
    } catch (error) {
      console.error("Error deleting deck:", error);
      if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error("DELETE_DECK_UNKNOWN_ERROR");
      }
    }
  }
}
