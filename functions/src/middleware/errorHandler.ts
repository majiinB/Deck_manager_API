import {logger} from "firebase-functions";
import {NextFunction, Response} from "express";
import {AuthenticatedRequest} from "../interface/AuthenticatedRequest";

/**
 * Middleware to log and handle errors.
 * @param err - The error object.
 * @param req - The request object.
 * @param res - The response object.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
export const errorHandler = (err: any, req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;

  logger.error("Error encountered", {
    endpoint: req.originalUrl,
    method: req.method,
    userId: req.user?.uid || req.headers["x-user-id"] || "anonymous",
    message: err.message,
    statusCode,
    details: err.details || null,
    stack: err.stack,
  });

  res.status(statusCode).json({
    status: statusCode,
    message: err.message,
    details: err.details || null,
  });
};
