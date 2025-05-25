/* eslint-disable valid-jsdoc */
import {callFirebaseFunction} from "../utils/callFirebaseFunction";

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
export async function callFirebaseAIAPI(userID: string, accessToken: string, url: string, data: object) {
  const result = await callFirebaseFunction<{ score: number }>({
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
}
