/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * A utility class containing helper methods for common operations.
 */
export class Utils {
  /**
   * Cleans and formats a title string.
   * 1. Replaces consecutive spaces with a single space.
   * 2. Trims leading and trailing spaces.
   * 3. Capitalizes the first letter of every word.
   *
   * @param {string} title - The input title string.
   * @return {string} The cleaned and formatted title.
   */
  static cleanTitle(title: string): string {
    return title
      .toLowerCase()
      .replace(/\s+/g, " ") // Replace multiple spaces with a single space
      .trim() // Trim leading and trailing spaces
      .split(" ") // Split into words
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize each word
      .join(" "); // Join words back into a string
  }

  /**
   * Formats a date object into a string with the format 'YYYY-MM-DD'.
   * @param {Date} date - The date object to format.
   * @return {string} The formatted date string.
   */
  static formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  /**
   * Fischer-Yates Shuffle implementation.
   * @param {any[]} array - The array to shuffle.
   * @return {any[]} The shuffled array.
   */
  static fischerYatesShuffle(array: any[]): any[] {
    const shuffledArray = [...array]; // Create a copy to avoid modifying the original array
    for (let i = shuffledArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }
    return shuffledArray;
  }
}
