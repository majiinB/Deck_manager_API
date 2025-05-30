/* eslint-disable valid-jsdoc */
import {callFirebaseFunction} from "../utils/callFirebaseFunction";
interface DeckAIRequestData {
  deckId: string;
  [key: string]: unknown;
}

/**
 * Calls the external scoring API to retrieve the score for a specific user's deck.
 *
 * @param userID - The unique identifier of the user whose deck is being scored.
 * @param deckID - The unique identifier of the deck to be scored.
 * @param accessToken - The access token for authentication with the API.
 * @param url - The URL of the external scoring API endpoint.
 * @param data - The data to be sent in the request body, typically containing the deck ID and other relevant information.
 * @returns A promise that resolves to the scoring result, containing the score as a number.
 */
export async function callFirebaseAIAPI(
  userID: string,
  accessToken: string,
  url: string,
  data: DeckAIRequestData
) {
  try {
    const result = await callFirebaseFunction<void>({
      method: "POST",
      url: url,
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
        // eslint-disable-next-line quote-props
        Authorization: accessToken, // if required
      },
      data: data,
    });
    return result;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error:any) {
    console.error("[DeckAI] Error calling Firebase AI API:", {
      message: error.message,
      stack: error.stack,
      userID,
      deckID: data["deckId"],
    });
  }
}
