/**
 * Schema definition for creating flashcards using Zod.
 *
 * This file contains the schema definitions for validating the structure of flashcards
 * and arrays of flashcards. It ensures that:
 * - Each flashcard has a `term` which is a required string with a minimum length of 1.
 * - Each flashcard has a `definition` which is a required string with a minimum length of 1.
 * - The `createFlashcardSchema` validates an array of flashcards, ensuring all items conform to the `flashcardSchema`.
 *
 * These schemas are designed to enforce data integrity for flashcard creation in the application.
 * @file createFlashcardSchema.ts
 * @author Arthur M. Artugue
 * @created 2025-04-16
 * @updated 2025-04-16
 */
import {object, string, array} from "zod";

export const flashcardSchema = object({
  term: string({
    required_error: "flashcard term is a required",
    invalid_type_error: "The term of the flashcard should be of type string",
  }).trim().min(1, "flashcard term is a required"),

  definition: string({
    required_error: "flashcard definition is a required",
    invalid_type_error: "The definition of the flashcard should be of type string",
  }).trim().min(1, "flashcard definition is a required"),
});

export const createFlashcardSchema = array(flashcardSchema);
