import {Response, NextFunction} from "express";
import {FirebaseAdmin} from "../config/FirebaseAdmin";
import {AuthenticatedRequest} from "../interface/AuthenticatedRequest";

/**
 * Service for handling authentication-related operations.
 */
export class AuthenticationService extends FirebaseAdmin {
  /**
  * Middleware to verify Firebase ID token from the request's Authorization header.
  *
  * @function verifyFirebaseToken
  * @param {Object} req - Express request object.
  * @param {Object} res - Express response object.
  * @param {Function} next - Express next middleware function.
  * @return {void} Calls `next()` if authentication succeeds, otherwise sends a 401 or 403 error response.
  */
  public async verifyFirebaseToken(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    const authHeader = (req.headers as { authorization?: string }).authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({error: "Unauthorized: No token provided"});
      return;
    }

    const token = authHeader?.split(" ")[1];

    try {
      const decodedToken = await this.getAuth().verifyIdToken(token);
      req.user = decodedToken; // Attach user data to request
      next(); // Proceed to the next middleware
    } catch (error) {
      res.status(403).json({error: "Unauthorized: Invalid token: " + error});
      return;
    }
  }
}
