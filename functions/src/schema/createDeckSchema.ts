
/**
 * Schema definition for creating a deck using Zod.
 *
 * This schema validates the structure of a deck object, ensuring that:
 * - `title` is a required string with a minimum length of 1.
 * - `description` is a required string with a minimum length of 1.
 * - `coverPhoto` is an optional string that must match a specific Firebase Storage URL pattern.
 * - `flashcards` is an optional array of objects validated by the `flashcardSchema`.
 *
 * The schema is designed to enforce data integrity for deck creation in the application.
 * @file createDeckSchema.ts
 * @author Arthur M. Artugue
 * @created 2024-04-16
 * @updated 2025-04-17
 */
import {object, string, array} from "zod";
import {flashcardSchema} from "./createFlashcardSchema";

export const createDeckSchema = object({
  title: string({
    required_error: "Deck title is a required field",
    invalid_type_error: "The title of the deck should be of type string",
  }).min(1, "Deck title is a required field"),

  description: string({
    required_error: "Deck description is a required field",
    invalid_type_error: "The description of the deck should be of type string",
  }).min(1, "Deck description is a required field"),

  coverPhoto: string({
    invalid_type_error: "The cover photo URL must be of type string",
  }).regex(
    new RegExp("^https://firebasestorage\\.googleapis\\.com/v0/b/deck-f429c\\.appspot\\.com/o/deckCovers%2F[\\w-]+%2F[\\w-]+(?:\\.(png|jpg|jpeg|webp))?\\?alt=media&token=[\\w-]+$"),
    "The cover photo URL is invalid. It must be a valid Firebase Storage URL for deck covers."
  ).optional(),
  flashcards: array(flashcardSchema).optional(),
});
