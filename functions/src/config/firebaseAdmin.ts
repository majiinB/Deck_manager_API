
/**
 * Deck - Firebase Admin Configuration
 * @file firebaseAdmin.ts
 * @description This module initializes Firebase Admin SDK using a service
 * account and provides middleware for verifying Firebase authentication
 * tokens in API requests.
 *
 * Initialization:
 * - Reads service account credentials from an environment-specified JSON
 *   file.
 * - Configures Firebase Admin SDK with the credentials to enable
 *   authentication services.
 *
 * Middleware:
 * - verifyFirebaseToken: Middleware that verifies Firebase ID tokens sent
 *   in Authorization headers.
 *   - If valid, attaches the decoded user data to `req.user` and allows the
 *     request to proceed.
 *   - If invalid or missing, returns an unauthorized error response.
 *
 * External Dependencies:
 * - firebase-admin: Firebase Admin SDK for server-side authentication.
 * - fs: Reads the service account JSON file.
 *
 * Environment Variables:
 * - KEY_FILE: Path to the Firebase service account JSON file.
 *
 * @module firebaseAdmin
 * @author Arthur M. Artugue
 * @created 2025-03-26
 * @updated 2025-03-26
 */
import admin from "firebase-admin";
import {readFileSync} from "fs";

/**
 * Class responsible for initializing and managing the Firebase Admin SDK
 * for server-side operations, such as authentication and Firestore database access.
 */
export class FirebaseAdmin {
  /**
  * The file path to the Firebase service account JSON file.
  * @type {string}
  */
  private path: string;

  /**
  * The parsed service account credentials used to initialize the Firebase Admin SDK.
  * @type {admin.ServiceAccount}
  */
  private serviceAccount: admin.ServiceAccount;

  /**
  * The Firestore database instance for interacting with Firestore.
  * @type {FirebaseFirestore.Firestore}
  */
  private db: FirebaseFirestore.Firestore;

  /**
   * Initializes the FirebaseAdmin class by reading the service account
   * credentials and setting up the Firebase Admin SDK.
   */
  constructor() {
    this.path = process.env.DECK_SERVICE_ACCOUNT_PATH || (() => {
      throw new Error("Environment variable DECK_SERVICE_ACCOUNT_PATH is not defined.");
    })();

    this.serviceAccount = JSON.parse(readFileSync(this.path, "utf-8")) as admin.ServiceAccount;

    admin.initializeApp({
      credential: admin.credential.cert(this.serviceAccount),
    });

    this.db = admin.firestore();
  }

  /**
   * Retrieves the Firestore database instance.
   * @return {FirebaseFirestore.Firestore} The Firestore database instance.
   */
  protected getDb(): FirebaseFirestore.Firestore {
    return this.db;
  }
}
