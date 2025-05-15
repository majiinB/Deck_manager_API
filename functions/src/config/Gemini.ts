/**
 * Deck - Gemini Configuration
 * @file GeminiConfig.ts
 * @description This module initializes the Google Generative AI SDK using an API key
 *
 * Methods:
 * - embedDeck: Embeds a deck's title and description using the Google Generative AI service.
 * - embedQuery: Embeds a query using the Google Generative AI service.
 *
 * External Dependencies:
 * - @google/genai: Google Generative AI SDK for server-side operations.
 *
 * @author Arthur M. Artugue
 * @created 2025-05-11
 * @updated 2025-05-11
 */

import {GoogleGenAI} from "@google/genai";
import * as dotenv from "dotenv";

dotenv.config();

/**
 * Class responsible for initializing and managing the Google Generative AI SDK
 * for server-side operations, such as authentication and Firestore database access.
 */
export class Gemini {
  /**
   * API key for authenticating requests to Google Generative AI services.
   * Fetched from the environment variables for security.
   */
  private apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.toString() : undefined;

  /**
   * An instance of the GoogleGenAI class for interacting with Google Generative AI services.
   * This instance is initialized with the API key.
   */
  private genAi: GoogleGenAI;

  /**
   * Initializes the GeminiConfig class by reading the API key from environment variables.
   * If the API key is not set, an error is thrown.
   */
  constructor() {
    if (!this.apiKey) {
      throw new Error("GEMINI_API_KEY is not set in the environment variables.");
    }
    this.genAi = new GoogleGenAI({
      apiKey: this.apiKey,
    });
  }

  /**
   * Embeds a decks' title and description using the Google Generative AI service.
   * @param {string} titleAndDescription - The text to be embedded.
   * @return {Promise<any>} A promise that resolves with the embedding response.
   */
  protected embedDeck = async (titleAndDescription: string): Promise<any> => {
    try {
      const response = await this.genAi.models.embedContent({
        model: "gemini-embedding-exp-03-07",
        contents: [titleAndDescription],
        config: {
          taskType: "RETRIEVAL_DOCUMENT",
          outputDimensionality: 768,
        },
      });
      return response;
    } catch (error) {
      console.error("Error embedding text:", error);
      throw error;
    }
  };

  /**
   * Embeds a query using the Google Generative AI service.
   * @param {string} query - The query to be embedded.
   * @return {Promise<any>} A promise that resolves with the embedding response.
   */
  protected embedQuery = async (query: string): Promise<any> => {
    try {
      const response = await this.genAi.models.embedContent({
        model: "gemini-embedding-exp-03-07",
        contents: [query],
        config: {
          taskType: "RETRIEVAL_QUERY",
          outputDimensionality: 768,
        },
      });
      return response;
    } catch (error) {
      console.error("Error embedding text:", error);
      throw error;
    }
  };
}
