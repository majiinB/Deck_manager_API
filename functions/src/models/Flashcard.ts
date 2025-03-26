import {Timestamp} from "firebase-admin/firestore";

/**
* Represents a Flashcard model with properties and methods to manage its data.
*
* @param {string} flashcardID - Unique identifier for the flashcard.
* @param {string} term - The term or question of the flashcard.
* @param {string} definition - The definition or answer of the flashcard.
* @param {boolean} isDeleted - Indicates whether the flashcard is marked as deleted.
* @param {boolean} isStarred - Indicates whether the flashcard is marked as starred.
* @param {Timestamp}createdAt - Timestamp of when the flashcard was created.
*
* @author Arthur M. Artugue
* @created 2024-03-27
* @updated 2025-03-27
*/
export class Flashcard {
  /**
   * Unique identifier for the flashcard.
   */
  private flashcardID: string;

  /**
   * The term or question of the flashcard.
   */
  private term: string;

  /**
   * The definition or answer of the flashcard.
   */
  private definition: string;

  /**
   * Indicates whether the flashcard is marked as deleted.
   */
  private isDeleted: boolean;

  /**
   * Indicates whether the flashcard is marked as starred.
   */
  private isStarred: boolean;

  /**
   * Timestamp of when the flashcard was created.
   */
  private createdAt: Timestamp;

  /**
   * Constructs a new Flashcard instance.
   *
   * @param {string} flashcardID - Unique identifier for the flashcard.
   * @param {string} term - The term or question of the flashcard.
   * @param {string} definition - The definition or answer of the flashcard.
   * @param {boolean} isDeleted - Indicates whether the flashcard is marked as deleted.
   * @param {boolean} isStarred - Indicates whether the flashcard is marked as starred.
   * @param {Timestamp}createdAt - Timestamp of when the flashcard was created.
   */
  constructor(
    flashcardID: string,
    term: string,
    definition: string,
    isDeleted: boolean,
    isStarred: boolean,
    createdAt: Timestamp
  ) {
    this.flashcardID = flashcardID;
    this.term = term;
    this.definition = definition;
    this.isDeleted = isDeleted;
    this.isStarred = isStarred;
    this.createdAt = createdAt;
  }

  /**
   * Gets the unique identifier of the flashcard.
   *
   * @return {string} The flashcard ID.
   */
  public getFlashCardID(): string {
    return this.flashcardID;
  }

  /**
   * Gets the term or question of the flashcard.
   *
   * @return {string} The term of the flashcard.
   */
  public getTerm(): string {
    return this.term;
  }

  /**
   * Gets the definition or answer of the flashcard.
   *
   * @return {string} The definition of the flashcard.
   */
  public getDefinition(): string {
    return this.definition;
  }

  /**
   * Checks if the flashcard is marked as deleted.
   *
   * @return {boolean} True if the flashcard is deleted, otherwise false.
   */
  public getIsDeleted(): boolean {
    return this.isDeleted;
  }

  /**
   * Checks if the flashcard is marked as starred.
   *
   * @return {boolean} True if the flashcard is starred, otherwise false.
   */
  public getIsStarred(): boolean {
    return this.isStarred;
  }

  /**
   * Gets the creation timestamp of the flashcard.
   *
   * @return {Timestamp} The creation timestamp.
   */
  public getCreatedAt(): Timestamp {
    return this.createdAt;
  }

  /**
   * Converts the flashcard object to a plain JavaScript object.
   *
   * @return {object} A plain object representation of the flashcard.
   */
  public getObjectJson(): object {
    return {
      flashcard_id: this.flashcardID,
      term: this.term,
      definition: this.definition,
      is_deleted: this.isDeleted,
      is_starred: this.isStarred,
      created_at: this.createdAt,
    };
  }
}
