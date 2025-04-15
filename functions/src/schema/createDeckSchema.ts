import {object, string, array} from "zod";
import {createFlashcard} from "./createFlashcardSchema";

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
    new RegExp("^https://firebasestorage\\.googleapis\\.com/v0/b/deck-f429c\\.appspot\\.com/o/deckCovers%2F[\\w-]+%2F[\\w-]+\\.(png|jpg|jpeg|webp)\\?alt=media&token=[\\w-]+$"),
    "The cover photo URL is invalid. It must be a valid Firebase Storage URL for deck covers."
  ),
  flashcards: array(createFlashcard).optional(),
});
