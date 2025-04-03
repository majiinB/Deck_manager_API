import {Response, NextFunction} from "express";
import {FirebaseAdmin} from "../config/FirebaseAdmin";
import {AuthenticatedRequest} from "../interface/AuthenticatedRequest";
import {BaseResponse} from "../models/BaseResponse";
import {ErrorResponse} from "../models/ErrorResponse";

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
    const baseResponse = new BaseResponse();
    const errorResponse = new ErrorResponse();
    const authHeader = (req.headers as { authorization?: string }).authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      errorResponse.setError("UNAUTHORIZED");
      errorResponse.setMessage("No token provided");

      baseResponse.setStatus(401);
      baseResponse.setMessage("The request is unauthorized");
      baseResponse.setData(errorResponse);

      res.status(401).json(baseResponse);
      return;
    }

    const token = authHeader?.split(" ")[1];

    try {
      const decodedToken = await this.getAuth().verifyIdToken(token);
      req.user = decodedToken; // Attach user data to request
      next(); // Proceed to the next middleware
    } catch (error) {
      errorResponse.setError("INVALID_TOKEN");
      errorResponse.setMessage("Invalid token: " + (error instanceof Error ? error.message : "Unknown error"));

      baseResponse.setStatus(403);
      baseResponse.setMessage("The request is unauthorized");
      baseResponse.setData(errorResponse);

      res.status(403).json(baseResponse);
      return;
    }
  }
}
