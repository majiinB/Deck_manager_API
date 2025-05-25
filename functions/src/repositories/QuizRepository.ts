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

import {Timestamp} from "firebase-admin/firestore";
import {FirebaseAdmin} from "../config/FirebaseAdmin";
import {ApiError} from "../helpers/apiError";
import {DeckRepository} from "./DeckRepository";

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

  /**
   * Logs a quiz attempts.
   *
   * @param {string} userId - The ID of the user who performed the search.
   * @param {string} deckId - The ID of the deck that was searched.
   * @param {Timestamp} attemptedAt - The timestamp when the quiz was attempted.
   * @param {string} quizType - The type of quiz attempted (e.g., "multiple-choice", "true-false").
   * @param {number} score - The score achieved in the quiz.
   * @param {number} totalQuestions - The total number of questions in the quiz.
   * @param {string[]} correctQuestionIds - An array of IDs of the questions answered correctly.
   * @param {string[]} incorrectQuestionIds - An array of IDs of the questions answered incorrectly.
   * @return {Promise<void>} A promise that resolves when the log entry is created.
   * @throws {Error} Throws custom errors (SEARCH_LOG_WRITE_ERROR) on failure.
   */
  public async logQuizAttemp(
    userId: string,
    deckId: string,
    attemptedAt: Timestamp,
    quizType: string,
    score: number,
    totalQuestions: number,
    correctQuestionIds: string[],
    incorrectQuestionIds: string[]
  ): Promise<void> {
    try {
      const db = this.getDb(); // your Firestore instance
      await db.collection("quiz_attempts").add({
        user_id: userId,
        deck_id: deckId,
        attempted_at: attemptedAt,
        quiz_type: quizType,
        score: score,
        total_questions: totalQuestions,
        correct_question_ids: correctQuestionIds,
        incorrect_question_ids: incorrectQuestionIds,
      });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      throw new ApiError(
        "Failed to quiz attempt activity",
        500,
        {errorCode: "QUIZ_ATTEMPT_LOG_WRITE_ERROR", message: err.message}
      );
    }
  }

  /**
   * Gets latest quiz attempt.
   *
   * @param {string} userId - The ID of the user who performed the search.
   * @return {Promise<void>} A promise that resolves when the log entry is created.
   * @throws {Error} Throws custom errors (SEARCH_LOG_WRITE_ERROR) on failure.
   */
  public async getLatestQuizAttempt(
    userId: string,
  ): Promise<object> {
    try {
      const db = this.getDb(); // your Firestore instance
      const quizAttempt = await db.collection("quiz_attempts")
        .where("user_id", "==", userId)
        .orderBy("attempted_at", "desc")
        .limit(1)
        .get();

      if (quizAttempt.empty) {
        throw new ApiError(
          "No quiz attempts found for the user",
          404,
          {errorCode: "QUIZ_ATTEMPT_NOT_FOUND", message: "No quiz attempts found for the user"}
        );
      }
      const latestAttempt = quizAttempt.docs[0].data();
      const deckId = latestAttempt.deck_id;

      const deckRepo = new DeckRepository();

      const deck = await deckRepo.getSpecificDeck(deckId);

      return {
        latest_attempt: latestAttempt,
        deck: deck,
      };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      throw new ApiError(
        "Failed to quiz attempt activity",
        500,
        {errorCode: "QUIZ_ATTEMPT_LOG_WRITE_ERROR", message: err.message}
      );
    }
  }
}
