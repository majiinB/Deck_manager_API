
/**
 * Deck Interface Definition
 *
 * @file Deck.ts
 * This module defines the `Deck` interface, which represents a deck entity in the system.
 * The `Deck` interface includes properties such as the deck's unique identifier, title,
 * owner information, privacy settings, and metadata like creation timestamp and flashcard count.
 *
 * This interface is used throughout the application to ensure type safety and consistency
 * when working with deck-related data.
 *
 * @module interface
 * @file Deck.ts
 * @interface Deck
 * @author Arthur M. Artugue
 * @created 2025-04-16
 * @updated 2025-05-11
 */

import {FieldValue} from "firebase-admin/firestore";

/**
 * Interface representing a Deck entity.
 * It includes properties such as the deck's unique identifier, title,
 * owner information, privacy settings, and metadata like creation timestamp and flashcard count.
 */
export interface Deck {
  id: string;
  title: string;
  is_deleted: boolean;
  is_private: boolean;
  owner_id: string;
  cover_photo: string;
  created_at: FirebaseFirestore.Timestamp;
  description: string;
  flashcard_count: number;
  embedding_field: FieldValue;
}
