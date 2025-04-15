import {object, string, array, boolean} from "zod";

export const createDeckSchemaFlashcard = object({
  deckName: string().min(1, "Deck name is required"),
  description: string().min(1, "Description is required"),
  flashcards: array(
    object({
      term: string().min(1, "Term is required"),
      definition: string().min(1, "Definition is required"),
      isStarred: boolean().optional(),
      isDeleted: boolean().optional(),
    })
  ).optional(),
});
