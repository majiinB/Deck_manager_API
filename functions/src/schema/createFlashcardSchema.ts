import {object, string} from "zod";

export const createFlashcard = object({
  term: string().trim().min(1, "Term is required"),
  definition: string().trim().min(1, "Definition is required"),
});
