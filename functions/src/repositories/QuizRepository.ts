/**
 * Quiz Manager API - Repository
 *
 * @file QuizRepository.ts
 * @description This module provides a repository for managing quiz-related data in the quiz collectionn of Firestore.
 *
 * @module repository
 * @file QuizRepository.ts
 * @class QuizRepository
 * @classdesc Provides data access methods for the 'quiz' collection in Firestore
 * @author Arthur M. Artugue
 * @created 2024-05-24
 * @updated 2025-05-24
 */

import {FirebaseAdmin} from "../config/FirebaseAdmin";
import {ApiError} from "../helpers/apiError";

/**
 * The `QuizRepository` class extends the `FirebaseAdmin` class to provide
 * repository functionalities for managing quiz-related data in a Firebase
 * environment. This class serves as a bridge between the application logic
 * and the Firebase database, encapsulating operations specific to quizzes
 * and its subcollections.
 */
export class QuizRepository extends FirebaseAdmin {
  /**
 * Deletes all quiz documents associated with a specific deck.
 * @param {string} deckId - The ID of the deck whose related quizzes will be deleted.
 */
  public async deleteRelatedQuizzesByDeck(deckId: string): Promise<void> {
    try {
      const db = this.getDb();
      const quizCollection = db.collection("quiz");

      // Get quizzes where associated_deck_id matches the provided deckId
      const quizSnapshot = await quizCollection.where("associated_deck_id", "==", deckId).get();

      // Delete each matching quiz document
      await Promise.all(
        quizSnapshot.docs.map((quizDoc) => db.recursiveDelete(quizDoc.ref))
      );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw new ApiError(
        "An error occurred while deleting related quizzes.",
        500,
        {errorCode: "DATABASE_DELETE_ERROR", message: error.message}
      );
    }
  }

  /**
   * Deletes all question and answer documents related to a specific flashcard within quizzes associated with a given deck.
   * @param {string} deckId - The ID of the deck whose related quizzes will be searched.
   * @param {string} flashcardId - The ID of the flashcard whose related question and answer documents will be deleted.
   */
  public async deleteRelatedQuestionsByFlashcards(deckId: string, flashcardId: string): Promise<void> {
    try {
      const db = this.getDb();
      const quizCollection = db.collection("quiz");
      const quizSnapshot = await quizCollection.where("associated_deck_id", "==", deckId).get();
      for (const quizDoc of quizSnapshot.docs) {
        const questionsAndAnswersQuery = await quizDoc.ref.collection("question_and_answers")
          .where("related_flashcard_id", "==", flashcardId)
          .get();
        await Promise.all(
          questionsAndAnswersQuery.docs.map((qaDoc) => db.recursiveDelete(qaDoc.ref))
        );
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw new ApiError(
        "An error occurred while deleting related flashcards.",
        500,
        {errorCode: "DATABASE_FETCH_ERROR", message: error.message}
      );
    }
  }
}
