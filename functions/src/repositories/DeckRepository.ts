/**
 * Deck Manager API - Repository
 *
 * @file DeckRepository.ts
 * This module defines the repository layer for managing deck data within Firestore.
 * Extending FirebaseAdmin, it provides specialized methods for interacting with the
 * 'decks' collection, handling data retrieval (with filtering and pagination),
 * creation, updates, and deletion operations directly against the database.
 * It encapsulates Firestore query logic and translates database results/errors.
 *
 * Methods:
 * - getOwnerDecks: Queries Firestore for decks owned by a specific user, supporting pagination.
 * - getPublicDecks: Queries Firestore for public decks (is_private=false), supporting pagination.
 * - getSpecificDeck: Retrieves a single deck document from Firestore by its ID.
 * - createDeck: Adds a new deck document to the Firestore 'decks' collection.
 * - updateDeck: Updates fields of an existing deck document in Firestore, performing owner checks.
 * - deleteDecks: Deletes one or more deck documents from Firestore after performing owner checks.
 *
 * @module repository
 * @file DeckRepository.ts
 * @class DeckRepository
 * @classdesc Provides data access methods for the 'decks' collection in Firestore, extending FirebaseAdmin for database connectivity.
 * @author Arthur M. Artugue
 * @created 2024-03-30
 * @updated 2025-05-16
 */

import {FirebaseAdmin} from "../config/FirebaseAdmin";
import {Deck, DeckRaw, SaveDeck} from "../interface/Deck";
import {Utils} from "../utils/utils";
import {UserRepository} from "./UserRepository";
import {VectorQuery, VectorQuerySnapshot} from "@google-cloud/firestore";

/**
 * The `DeckRepository` class extends the `FirebaseAdmin` class to provide
 * repository functionalities for managing deck-related data in a Firebase
 * environment. This class serves as a bridge between the application logic
 * and the Firebase database, encapsulating operations specific to decks.
 */
export class DeckRepository extends FirebaseAdmin {
  userRepository : UserRepository = new UserRepository();

  /**
   * Retrieves a paginated list of non-deleted decks owned by a specific user from Firestore.
   * Orders decks by title.
   *
   * @param {string} userID - The ID of the user whose decks to fetch.
   * @param {number} limit - The maximum number of decks to return per page.
   * @param {string | null} [nextPageToken=null] - The document ID to start after for pagination.
   * @return {Promise<any[]>} A promise resolving to an object containing the decks array and the next page token.
   * @throws {Error} Throws custom errors (e.g., INTERNAL_SERVER_ERROR) on failure.
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

      const [snapshot, userName] = await Promise.all([
        query.get(),
        this.userRepository.getOwnerNames([userID]),
      ]);


      // Extract deck data, stripping out embedding_field
      const decks = snapshot.docs.map((doc) => {
        // eslint-disable-next-line camelcase
        const {embedding_field, ...deckDataWithoutEmbedding} = doc.data() as DeckRaw;
        return {
          id: doc.id,
          owner_name: userName[userID],
          ...deckDataWithoutEmbedding,
        };
      });

      // Get nextPageToken (last document ID)
      const lastDoc = snapshot.docs[snapshot.docs.length - 1];
      const nextToken = lastDoc ? lastDoc.id : null;

      return {
        decks,
        nextPageToken: nextToken,
      };
    } catch (error) {
      if (error instanceof Error) {
        const internalError = new Error("An error occured while fetching the decks");
        internalError.name = "DATABASE_FETCH_ERROR";
        throw internalError;
      } else {
        const unknownError = new Error("An unknown error occurred while fetching the decks");
        unknownError.name = "GET_DECK_UNKNOWN_ERROR";
        throw unknownError;
      }
    }
  }

  /**
   * Retrieves a paginated list of public, non-deleted decks from Firestore.
   * Orders decks by title.
   *
   * @param {number} limit - The maximum number of decks to return per page.
   * @param {string | null} [nextPageToken=null] - The document ID to start after for pagination.
   * @return {Promise<PaginatedDecksResponse>} A promise resolving to an object containing the decks array and the next page token.
   * @throws {Error} Throws custom errors (e.g., DATABASE_FETCH_ERROR) on failure.
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

      // Retrieve the query snapshot
      const snapshot = await query.get();

      // Extract unique owner IDs
      const ownerIds = snapshot.docs.map((doc) => doc.data().owner_id);
      const ownerMap: Record<string, string> = {};

      // Fetch user names in batches if there are more than 10 ownerIds
      const batchSize = 10;
      for (let i = 0; i < ownerIds.length; i += batchSize) {
        const batchIds = ownerIds.slice(i, i + batchSize);
        const userNames = await this.userRepository.getOwnerNames(batchIds);
        Object.assign(ownerMap, userNames);
      }

      // Extract deck data, stripping out embedding_field
      const decks = snapshot.docs.map((doc) => {
        // eslint-disable-next-line camelcase
        const {embedding_field, ...deckDataWithoutEmbedding} = doc.data() as DeckRaw;
        return {
          id: doc.id,
          owner_name: ownerMap[deckDataWithoutEmbedding.owner_id],
          ...deckDataWithoutEmbedding,
        };
      });

      // Get nextPageToken (last document ID)
      const lastDoc = snapshot.docs[snapshot.docs.length - 1];
      const nextToken = lastDoc ? lastDoc.id : null;

      return {
        decks,
        nextPageToken: nextToken,
      };
    } catch (error) {
      if (error instanceof Error) {
        const internalError = new Error("An error occured while fetching the decks");
        internalError.name = "DATABASE_FETCH_ERROR";
        throw internalError;
      } else {
        const unknownError = new Error("An unknown error occured while fetching the decks");
        unknownError.name = "GET_PUBLIC_DECK_UNKNOWN_ERROR";
        throw unknownError;
      }
    }
  }

  /**
   * Retrieves a paginated list of saved decks for a specific user from Firestore.
   * Joins deck info for each saved deck.
   *
   * @param {string} userID - The ID of the user whose saved decks to retrieve.
   * @param {number} limit - The maximum number of saved decks to return per page.
   * @param {string | null} [nextPageToken=null] - The document ID to start after for pagination.
   * @return {Promise<object>} A promise resolving to an object containing the saved decks array and the next page token.
   * @throws {Error} Throws custom errors on failure.
   */
  public async getSavedDecks(userID: string, limit: number, nextPageToken: string | null = null): Promise<object> {
    try {
      const db = this.getDb();
      let query = db
        .collection("saved_decks")
        .where("user_id", "==", userID)
        .orderBy("saved_at", "desc")
        .limit(limit);

      if (nextPageToken) {
        const lastDocSnapShot = await db.collection("saved_decks").doc(nextPageToken).get();
        if (lastDocSnapShot.exists) {
          query = query.startAfter(lastDocSnapShot);
        }
      }

      const snapshot = await query.get();

      const deckIds = snapshot.docs.map((doc) => doc.data().deck_id);
      const deckRefs = deckIds.map((id) => db.collection("decks").doc(id));

      // Fetch all referenced deck documents
      const deckSnapshots = await Promise.all(deckRefs.map((ref) => ref.get()));

      const ownerIds = deckSnapshots.map((deckSnap) => deckSnap.exists ? deckSnap.data()!.owner_id : null).filter(Boolean);
      const ownerMap: Record<string, string> = {};

      // Batch fetch owner names
      const batchSize = 10;
      for (let i = 0; i < ownerIds.length; i += batchSize) {
        const batchIds = ownerIds.slice(i, i + batchSize);
        const userNames = await this.userRepository.getOwnerNames(batchIds as string[]);
        Object.assign(ownerMap, userNames);
      }

      // Combine saved deck info with deck data and owner names
      const decks = snapshot.docs.map((doc, index) => {
        const deckSnap = deckSnapshots[index];
        const deckData = deckSnap.exists ? deckSnap.data() : null;

        // strip out embedding_field
        // eslint-disable-next-line camelcase
        const {embedding_field, ...raw} = deckData as DeckRaw;
        return {
          id: deckSnap.id,
          owner_name: ownerMap[raw.owner_id],
          ...raw,
        };
      });

      const lastDoc = snapshot.docs[snapshot.docs.length - 1];
      const nextToken = lastDoc ? lastDoc.id : null;

      return {
        decks,
        nextPageToken: nextToken,
      };
    } catch (error) {
      console.log(error);
      if (error instanceof Error) {
        const internalError = new Error("An error occurred while fetching the saved decks.");
        internalError.name = "DATABASE_FETCH_SAVED_DECKS_ERROR";
        throw internalError;
      } else {
        const unknownError = new Error("An unknown error occurred while fetching the saved decks.");
        unknownError.name = "GET_SAVED_DECKS_UNKNOWN_ERROR";
        throw unknownError;
      }
    }
  }


  /**
   * Retrieves decks based on user query (From the owners deck)
   *
   * @param {string} userID - The ID of the user whose decks to fetch.
   * @param {number} query - The search query to filter decks.
   * @param {number[]} vectorQuery - The embedding vector to search against.
   * @param {number} limit - The maximum number of decks to return per page.
   * @return {Promise<PaginatedDecksResponse>} A promise resolving to an object containing the decks array and the next page token.
   * @throws {Error} Throws custom errors (e.g., DATABASE_FETCH_ERROR) on failure.
   */
  public async searchOwnerDecks(userID: string, query: string, vectorQuery: number[], limit: number): Promise<object> {
    try {
      const db = this.getDb();
      const collection = db.collection("decks");

      // Vector Query to find nearest decks
      const preFilteredVectorQuery : VectorQuery = collection
        .where("owner_id", "==", userID) // Filter by owner_id
        .where("is_deleted", "==", false)
        .findNearest({
          vectorField: "embedding_field",
          queryVector: vectorQuery,
          limit: limit,
          distanceMeasure: "COSINE",
          distanceThreshold: 0.41,
        });

      // Exact title lookup
      const cleanedQuery = Utils.cleanTitle(query);

      // Exact‐title lookup on those same IDs
      const exactTitleQuery = await db
        .collection("decks")
        .where("owner_id", "==", userID)
        .where("title", "==", cleanedQuery)
        .where("is_deleted", "==", false);

      const ownerMap: Record<string, string> = {};

      const [vectorQueryResults, exactTitleQueryResults, userName] = await Promise.all([
        preFilteredVectorQuery.get(),
        exactTitleQuery.get(),
        this.userRepository.getOwnerNames([userID]),
      ]);


      // Merge IDs exact matches
      const exactIDs = new Set(exactTitleQueryResults.docs.map((d) => d.id));
      console.log(`Exact IDs: ${exactIDs}`);

      const mergedDocs = [
        // exact‐match docs
        ...exactTitleQueryResults.docs,
        // then vector docs that aren’t already in exactIDs
        ...vectorQueryResults.docs.filter((d) => !exactIDs.has(d.id)),
      ].slice(0, limit);

      // Extract deck data
      const decks = mergedDocs.map((doc)=> {
        // eslint-disable-next-line camelcase
        const {embedding_field, ...raw} = doc.data() as DeckRaw;

        return {
          id: doc.id,
          owner_name: ownerMap[raw.owner_id] || userName[userID],
          ...raw,
        };
      });

      return {decks};
    } catch (error) {
      if (error instanceof Error) {
        const internalError = new Error("An error occured while fetching the decks");
        internalError.name = "DATABASE_FETCH_ERROR";
        throw internalError;
      } else {
        const unknownError = new Error("An unknown error occured while fetching the decks");
        unknownError.name = "GET_DECK_UNKNOWN_ERROR";
        throw unknownError;
      }
    }
  }

  /**
   * Retrieves decks based on user query (From the public decks)
   *
   * @param {string} userID - The ID of the user whose made the request.
   * @param {number} query - The search query to filter decks.
   * @param {number} limit - The maximum number of decks to return per page.
   * @return {Promise<PaginatedDecksResponse>} A promise resolving to an object containing the decks array and the next page token.
   * @throws {Error} Throws custom errors (e.g., DATABASE_FETCH_ERROR) on failure.
   */
  public async searchPublicDecks(userID: string, query: number[], limit: number): Promise<object> {
    try {
      const db = this.getDb();
      const collection = db.collection("decks");
      const preFilteredVectorQuery : VectorQuery = collection
        .where("is_private", "==", false) // Filter by owner_id
        .where("is_deleted", "==", false)
        .findNearest({
          vectorField: "embedding_field",
          queryVector: query,
          limit: limit,
          distanceMeasure: "COSINE",
          distanceThreshold: 0.41,
        }); // Order results


      // Retrieve the query snapshot
      const vectorQueryResults = await preFilteredVectorQuery.get();

      // Extract unique owner IDs
      const ownerIds = vectorQueryResults.docs.map((doc) => doc.data().owner_id);
      const ownerMap: Record<string, string> = {};

      // Fetch user names in batches if there are more than 10 ownerIds
      const batchSize = 10;
      for (let i = 0; i < ownerIds.length; i += batchSize) {
        const batchIds = ownerIds.slice(i, i + batchSize);
        const userNames = await this.userRepository.getOwnerNames(batchIds);
        Object.assign(ownerMap, userNames);
      }

      // Extract deck data
      const decks = vectorQueryResults.docs.map((doc)=> {
        // eslint-disable-next-line camelcase
        const {embedding_field, ...deckDataWithoutEmbedding} = doc.data() as DeckRaw;

        return {
          id: doc.id,
          owner_name: ownerMap[deckDataWithoutEmbedding.owner_id],
          ...deckDataWithoutEmbedding,
        };
      });

      return {decks};
    } catch (error) {
      console.log(error);
      if (error instanceof Error) {
        const internalError = new Error("An error occured while fetching the decks");
        internalError.name = "DATABASE_FETCH_ERROR";
        throw internalError;
      } else {
        const unknownError = new Error("An unknown error occured while fetching the decks");
        unknownError.name = "GET_DECK_UNKNOWN_ERROR";
        throw unknownError;
      }
    }
  }

  /**
 * Retrieves saved decks for a user based on an embedding similarity search.
 * Filters to only decks the user has saved, then performs a nearest-neighbor vector query on those decks.
 * Strips out embedding_field from returned results.
 *
 * @param {string} userID - The ID of the user whose saved decks to search.
 * @param {number[]} query - The embedding vector to search against.
 * @param {number} limit - The maximum number of decks to return.
 * @return {Promise<object>} A promise resolving to an object containing the matching decks.
 * @throws {Error} Throws custom errors (e.g., DATABASE_FETCH_ERROR) on failure.
 */
  public async searchSavedDecks(userID: string, query: number[], limit: number): Promise<object> {
    try {
      const db = this.getDb();

      // 1. Fetch saved deck IDs for this user
      const savedSnap = await db
        .collection("saved_decks")
        .where("user_id", "==", userID)
        .get();
      const deckIds = savedSnap.docs.map((doc) => doc.data().deck_id);
      if (deckIds.length === 0) {
        return {decks: []};
      }

      // 2. Perform nearest-neighbor search on decks the user saved
      const vectorQuery = db
        .collection("decks")
        .where("__name__", "in", deckIds)
        .findNearest({
          vectorField: "embedding_field",
          queryVector: query,
          limit: limit,
          distanceMeasure: "COSINE",
          distanceThreshold: 0.41,
        });

      // 3. Execute vector query and fetch owner names
      const [vectorResults, ownerNames] = await Promise.all([
        vectorQuery.get() as Promise<VectorQuerySnapshot>, // Explicitly type the result
        this.userRepository.getOwnerNames(
          (await vectorQuery.get()).docs.map((d) => d.data().owner_id) // Ensure proper typing
        ),
      ]);

      // 4. Build response, stripping embedding_field
      const decks = vectorResults.docs.map((doc) => {
        // eslint-disable-next-line camelcase
        const {embedding_field, ...deckDataWithoutEmbedding} = doc.data() as DeckRaw;
        return {
          id: doc.id,
          owner_name: ownerNames[deckDataWithoutEmbedding.owner_id],
          ...deckDataWithoutEmbedding,
        };
      });

      return {decks};
    } catch (error) {
      if (error instanceof Error) {
        const internalError = new Error("An error occurred while searching saved decks");
        internalError.name = "DATABASE_FETCH_ERROR";
        throw internalError;
      }
      const unknownError = new Error("An unknown error occurred while searching saved decks");
      unknownError.name = "SEARCH_SAVED_DECKS_UNKNOWN_ERROR";
      throw unknownError;
    }
  }


  /**
   * Retrieves a specific deck document by its ID from Firestore.
   *
   * @param {string} deckID - The unique identifier of the deck to retrieve.
   * @return {Promise<SpecificDeckResponse>} A promise resolving to an object containing the deck data (or null if not found).
   * @throws {Error} Throws custom errors (INVALID_DECK_ID, DECK_NOT_FOUND, DATABASE_FETCH_ERROR) on failure or invalid input.
   */
  public async getSpecificDeck(deckID: string): Promise<object | null> {
    try {
      // Validate inputs
      if (!deckID || typeof deckID !== "string") {
        const error = new Error(`Deck ${deckID} is not a valid deck ID. Deck ID is must be a string`);
        error.name = "INVALID_DECK_ID";
        throw error;
      }

      const db = this.getDb();
      const deckRef = db
        .collection("decks")
        .doc(deckID);
      const deckSnap = await deckRef.get();

      if (!deckSnap.exists) {
        const error = new Error(`Deck ${deckID} does not exist`);
        error.name = "DECK_NOT_FOUND";
        throw error;
      }

      // Extract deck data

      // eslint-disable-next-line camelcase
      const {embedding_field, ...deckDataWithoutEmbedding} = deckSnap.data() as DeckRaw;

      const ownerMap = deckDataWithoutEmbedding ? await this.userRepository.getOwnerNames([deckDataWithoutEmbedding.owner_id]) : {};
      const deck = deckDataWithoutEmbedding ? {
        id: deckSnap.id,
        owner_name: ownerMap[deckDataWithoutEmbedding.owner_id],
        ...deckDataWithoutEmbedding,
      } : null;

      return deck;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "INVALID_DECK_ID" ||
            error.name === "DECK_NOT_FOUND") {
          throw error;
        }
        const internalError = new Error("An error occured while fetching the decks");
        internalError.name = "DATABASE_FETCH_ERROR";
        throw internalError;
      } else {
        const unknownError = new Error("An unknown error occured while fetching the decks");
        unknownError.name = "GET_SPECIFIC_DECK_UNKNOWN_ERROR";
        throw unknownError;
      }
    }
  }

  /**
   * Creates a new deck document in the Firestore 'decks' collection.
   *
   * @param {object} deckData - The data object for the new deck (should match expected schema).
   * @return {Promise<Deck>} A promise resolving to the created deck object, including its ID.
   * @throws {Error} Throws custom errors (INVALID_DECK_DATA, DATABASE_CREATE_ERROR) on failure or invalid input.
   */
  public async createDeck(deckData: Omit<Deck, "id">): Promise<Deck> {
    try {
      // Validate input
      if (!deckData || typeof deckData !== "object") {
        const error = new Error("The deck data is not valid");
        error.name = "INVALID_DECK_DATA";
        throw error;
      }

      const db = this.getDb();

      const res = await db.collection("decks").add(deckData);

      if (!res || !res.id) {
        const error = new Error("Failed to create deck, no reference returned");
        error.name = "DATABASE_CREATE_ERROR";
        throw error;
      }

      // Destructure the deck data to exclude embedding_field
      // eslint-disable-next-line camelcase
      const {embedding_field, ...deckDataWithoutEmbedding} = deckData;

      // access newly created deck ID by `res.id`
      const deck: Deck = ({id: res.id, ...deckDataWithoutEmbedding} as Deck);

      return deck;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "INVALID_DECK_DATA") {
          throw error;
        }
        if (error.name === "DATABASE_CREATE_ERROR") {
          throw error;
        }
        // Handle other known errors
        const internalError = new Error("An error occured while creating the deck");
        internalError.name = "DATABASE_CREATE_ERROR";
        throw internalError;
      } else {
        const unknownError = new Error("An unknown error occured while creating the deck");
        unknownError.name = "CREATE_DECK_UNKNOWN_ERROR";
        throw unknownError;
      }
    }
  }

  /**
   * Creates a new deck document in the Firestore 'saved_decks' collection.
   *
   * @param {object} saveDeckData - The data object for the new deck (should match expected schema).
   * @throws {Error} Throws custom errors (INVALID_DECK_DATA, DATABASE_CREATE_ERROR) on failure or invalid input.
   */
  public async saveDeck(saveDeckData: SaveDeck): Promise<void> {
    try {
      const db = this.getDb();

      const collectionRef = db.collection("saved_decks");

      // Check if deck is already saved
      const existingDeck = await collectionRef
        .where("deck_id", "==", saveDeckData.deck_id)
        .where("user_id", "==", saveDeckData.user_id)
        .get();

      if (!existingDeck.empty) {
        const error = new Error("Deck already saved");
        error.name = "DECK_ALREADY_SAVED";
        throw error;
      }

      const res = await collectionRef.add(saveDeckData);

      if (!res || !res.id) {
        const error = new Error("Failed to save deck, no reference returned");
        error.name = "DATABASE_DECK_SAVE_ERROR";
        throw error;
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      } else {
        const unknownError = new Error("An unknown error occured while saving the deck");
        unknownError.name = "SAVE_DECK_UNKNOWN_ERROR";
        throw unknownError;
      }
    }
  }

  /**
 * Deletes an existing saved‐deck entry from the Firestore 'saved_decks' collection.
 *
 * @param {object} unsaveDeckData - The identifying data for the saved deck:
 *   { deck_id: string; user_id: string; }
 * @throws {Error} Throws custom errors (DECK_NOT_SAVED, DATABASE_DELETE_ERROR) on failure.
 */
  public async unsaveDeck(unsaveDeckData: { deck_id: string; user_id: string }): Promise<void> {
    try {
      const db = this.getDb();
      const collectionRef = db.collection("saved_decks");

      // Find the existing saved‐deck entry
      const snapshot = await collectionRef
        .where("deck_id", "==", unsaveDeckData.deck_id)
        .where("user_id", "==", unsaveDeckData.user_id)
        .get();

      if (snapshot.empty) {
        const error = new Error("Deck is not saved");
        error.name = "DECK_NOT_SAVED";
        throw error;
      }

      // Delete all matching docs (should usually be one)
      const batch = db.batch();
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
    } catch (error) {
      if (error instanceof Error) {
        // rethrow known errors or wrap unknowns
        if (error.name === "DECK_NOT_SAVED") throw error;
        const internalError = new Error("An error occurred while unsaving the deck");
        internalError.name = "DATABASE_DELETE_ERROR";
        throw internalError;
      } else {
        const unknownError = new Error("An unknown error occurred while unsaving the deck");
        unknownError.name = "UNSAVE_DECK_UNKNOWN_ERROR";
        throw unknownError;
      }
    }
  }


  /**
   * Updates an existing deck document in Firestore.
   * Verifies that the deck exists and the requesting user is the owner before updating.
   *
   * @param {string} userID - The ID of the user requesting the update (for authorization).
   * @param {string} deckId - The unique identifier of the deck to update.
   * @param {object} data - An object containing the fields and values to update.
   * @return {Promise<object>} A promise resolving to an object containing the updated deck's ID and its data after the update.
   * @throws {Error} Throws custom errors (INVALID_DECK_ID, INVALID_UPDATE_DATA, DECK_NOT_FOUND, NOT_AUTHORIZED_TO_UPDATE_DECK, DATABASE_UPDATE_ERROR) on failure or invalid input/permissions.
   */
  public async updateDeck(userID: string, deckId: string, data: object): Promise<object> {
    try {
      // Validate inputs
      if (!deckId || typeof deckId !== "string") {
        const error = new Error(`Deck ${deckId} is not a valid deck ID. Deck ID is must be a string`);
        error.name = "INVALID_DECK_ID";
        throw error;
      }
      if (!data || typeof data !== "object" || Array.isArray(data)) {
        const error = new Error("The update data is not valid. It must be an object.");
        error.name = "INVALID_UPDATE_DATA";
        throw error;
      }
      const db = this.getDb();

      const deckRef = db.collection("decks").doc(deckId);
      const deckData = await deckRef.get();

      if (!deckData.exists) {
        const error = new Error(`Deck ${deckId} does not exist`);
        error.name = "DECK_NOT_FOUND";
        throw error;
      }

      const deckOwner = deckData.data()?.owner_id;

      if (deckOwner !== userID) {
        const error = new Error(`User ${userID} is not authorized to update deck ${deckId}`);
        error.name = "NOT_AUTHORIZED_TO_UPDATE_DECK";
        throw error;
      }

      // TODO: Check if the user role is admin
      // AND the data to be changed is only the is_deleted field
      // OR the is_private field

      await deckRef.update(data);

      const updatedDeck = await deckRef.get();

      if (!updatedDeck.exists) {
        const error = new Error("Deck not found after update");
        error.name = "DECK_NOT_FOUND_AFTER_UPDATE";
        throw error;
      }

      const deck = updatedDeck ? {id: deckId, ...updatedDeck.data} : null;
      console.log(`Deck with ID ${deck} has been updated.`);

      return {
        deck,
      };
    } catch (error) {
      if (error instanceof Error) {
        const knownErrors = [
          "INVALID_DECK_ID", "INVALID_UPDATE_DATA", "DECK_NOT_FOUND",
          "NOT_AUTHORIZED_TO_UPDATE_DECK", "DECK_GONE_AFTER_UPDATE",
        ];

        if (knownErrors.includes(error.name)) {
          throw error;
        }
        const internalError = new Error("An error occured while updating the deck");
        internalError.name = "DATABASE_UPDATE_ERROR";
        throw internalError;
      } else {
        const unknownError = new Error("An unknown error occured while updating the deck");
        unknownError.name = "UPDATE_DECK_UNKNOWN_ERROR";
        throw unknownError;
      }
    }
  }

  /**
   * Deletes one or more deck documents from Firestore.
   * Performs checks to ensure the deck exists and the requesting user is the owner before deletion.
   * Skips deletion if checks fail for a specific ID and logs a warning.
   *
   * @param {string} userID - The ID of the user requesting the deletion (for authorization).
   * @param {string[]} deckIDs - An array of unique identifiers of the decks to delete.
   * @return {Promise<void>} A promise that resolves when all valid and authorized deletion attempts are complete.
   * @throws {Error} Throws custom errors (INVALID_DECK_IDS, DATABASE_DELETE_ERROR) on failure or invalid input. Does not throw for individual skipped decks.
   */
  public async deleteDecks(userID: string, deckIDs: string[]): Promise<void> {
    try {
      // Validate input
      if (!Array.isArray(deckIDs) || deckIDs.length === 0) {
        const error = new Error("Deck IDs must be an array of strings.");
        error.name = "INVALID_DECK_IDS";
        throw error;
      }

      const db = this.getDb();

      for (const deckID of deckIDs) {
        if (typeof deckID !== "string" || !deckID) {
          console.warn(`Skipping invalid deck ID: ${deckID}`);
          continue;
        }

        const deckRef = db.collection("decks").doc(deckID);
        const deckSnapshot = await deckRef.get();

        if (!deckSnapshot.exists) {
          console.warn(`Deck not found: ${deckID}`);
          continue;
        }

        const deckOwner = deckSnapshot.data()?.owner_id;
        if (deckOwner !== userID) {
          console.warn(`User not authorized to delete deck: ${deckID}`);
          continue;
        }

        // TODO: Check if the user role is admin
        await deckRef.delete();
        console.log(`Deck with ID ${deckID} has been deleted.`);
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "INVALID_DECK_IDS") {
          throw error;
        }

        const internalError = new Error("An error occured while deleting the decks");
        internalError.name = "DATABASE_DELETE_ERROR";
        throw internalError;
      } else {
        const unknownError = new Error("An unknown error occured while fetching the decks");
        unknownError.name = "DELETE_DECKS_UNKNOWN_ERROR";
        throw unknownError;
      }
    }
  }
}
