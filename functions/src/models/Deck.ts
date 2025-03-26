import {Timestamp} from "firebase-admin/firestore";
import {Flashcard} from "./Flashcard";

/**
* Represents a Deck model.
*
* @param {string} deckID - The UID of the deck
* @param {string} coverPhoto - The URL of the cover photo for the deck.
* @param {Timestamp} createdAt - The timestamp when the deck was created.
* @param {boolean} isDeleted - Indicates if the deck is deleted.
* @param {boolean} isPrivate - Indicates if the deck is private.
* @param {string} title - The title of the deck.
* @param {string} ownerID - The ID of the owner of the deck.
* @param {Timestamp | null} madeToQuizAt - The timestamp when the deck was converted to a quiz.
* @param {string | null} originalDeckID - The ID of the original deck (if applicable).
* @param {Flashcard | null} flashcards - The flashcards associated with the deck.
*
* @author Arthur M. Artugue
* @created 2024-03-26
* @updated 2025-03-27
*/
export class Deck {
  /**
  * The URL of the cover photo for the deck.
  */
  private deckID: string;

  /**
  * The URL of the cover photo for the deck.
  */
  private coverPhoto: string;

  /**
  * The timestamp when the deck was created.
  */
  private createdAt: Timestamp;

  /**
  * Indicates if the deck is deleted.
  */
  private isDeleted: boolean;

  /**
  * Indicates if the deck is private.
  */
  private isPrivate: boolean;

  /**
  * The title of the deck.
  */
  private title: string;

  /**
  * The ID of the owner of the deck.
  */
  private ownerID: string;

  /**
  * The timestamp when the deck was converted to a quiz.
  */
  private madeToQuizAt: Timestamp | null;

  /**
  * The ID of the original deck (if applicable).
  */
  private originalDeckID: string | null;

  /**
  * The flashcards associated with the deck.
  */
  private flashcards: Flashcard | null;

  /**
  * Represents a Deck with its associated properties and metadata.
  *
  * @param {string} deckID - The UID of the deck
  * @param {string} coverPhoto - The URL of the cover photo for the deck.
  * @param {Timestamp} createdAt - The timestamp when the deck was created.
  * @param {boolean} isDeleted - Indicates if the deck is deleted.
  * @param {boolean} isPrivate - Indicates if the deck is private.
  * @param {string} title - The title of the deck.
  * @param {string} ownerID - The ID of the owner of the deck.
  * @param {Timestamp | null} madeToQuizAt - The timestamp when the deck was converted to a quiz.
  * @param {string | null} originalDeckID - The ID of the original deck (if applicable).
  * @param {Flashcard | null} flashcards - The flashcards associated with the deck.
  */
  constructor(
    deckID: string,
    coverPhoto: string,
    createdAt: Timestamp,
    isDeleted: boolean,
    isPrivate: boolean,
    title: string,
    ownerID: string,
    madeToQuizAt: (Timestamp | null) = null,
    originalDeckID: (string | null) = null,
    flashcards: (Flashcard | null) = null
  ) {
    this.deckID = deckID;
    this.coverPhoto = coverPhoto;
    this.createdAt = createdAt;
    this.isDeleted = isDeleted;
    this.isPrivate = isPrivate;
    this.title = title;
    this.ownerID = ownerID;
    this.madeToQuizAt = madeToQuizAt;
    this.originalDeckID = originalDeckID;
    this.flashcards = flashcards;
  }

  /**
   * Retrieves the unique identifier of the deck.
   *
   * @return {string} The deck's unique identifier.
   */
  public getDeckID(): string {
    return this.deckID;
  }

  /**
   * Retrieves the cover photo URL of the deck.
   *
   * @return {string} The URL of the cover photo.
   */
  public getCoverPhoto(): string {
    return this.coverPhoto;
  }

  /**
   * Retrieves the creation timestamp of the deck.
   *
   * @return {Timestamp} The timestamp representing when the deck was created.
   */
  public getCreatedAt(): Timestamp {
    return this.createdAt;
  }

  /**
   * Retrieves the deletion status of the deck.
   *
   * @return {boolean} `true` if the deck is marked as deleted, otherwise `false`.
   */
  public getIsDeleted(): boolean {
    return this.isDeleted;
  }

  /**
   * Retrieves the privacy status of the deck.
   *
   * @return {boolean} `true` if the deck is private, otherwise `false`.
   */
  public getIsPrivate(): boolean {
    return this.isPrivate;
  }

  /**
   * Retrieves the title of the deck.
   *
   * @return {string} The title of the deck as a string.
   */
  public getTitle(): string {
    return this.title;
  }

  /**
   * Retrieves the unique identifier of the owner of the deck.
   *
   * @return {string} The owner's unique identifier.
   */
  public getOwnerID(): string {
    return this.ownerID;
  }

  /**
   * Retrieves when the deck was converted to a quiz.
   *
   * @return {Timestamp | null} the timestamp when the deck was converted to a quiz if it exists, or `null` if the field is not found
   */
  public getMadeToQuizAt(): Timestamp | null {
    return this.madeToQuizAt;
  }

  /**
   * Retrieves the original deck ID associated with this deck.
   *
   * @return {string | null} The original deck ID if it exists, or `null` if no original deck ID is set.
   */
  public getOriginalDeckID(): string | null {
    return this.originalDeckID;
  }

  /**
   * Retrieves the collection of flashcards associated with the deck.
   *
   * @return {Flashcard | null} The flashcards belonging to this deck if atleas one exists, `null` if none.
   */
  public getFlashcards(): Flashcard | null {
    return this.flashcards;
  }

  /**
   * Converts the deck object to a plain JavaScript object.
   *
   * @return {object} A plain object representation of the deck.
   */
  public getObjectJson(): object {
    const deck: Record<string, string | boolean | Timestamp | Flashcard> = {
      deck_id: this.deckID,
      cover_photo: this.coverPhoto,
      created_at: this.createdAt,
      is_deleted: this.isDeleted,
      is_private: this.isPrivate,
      title: this.title,
      owner_id: this.ownerID,
    };

    if (this.originalDeckID) {
      deck["original_deck_id"] = this.originalDeckID; // Dynamically add a field
    }

    if (this.flashcards) {
      deck["flashcards"] = this.flashcards;
    }

    if (this.madeToQuizAt) {
      deck["made_to_quiz_at"] = this.madeToQuizAt;
    }

    return deck;
  }
}
