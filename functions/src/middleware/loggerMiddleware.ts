import {Response, NextFunction} from "express";
import * as logger from "firebase-functions/logger";
import {AuthenticatedRequest} from "../interface/AuthenticatedRequest";

export const logRequest = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const start = Date.now();

  // Log incoming request
  logger.info("Incoming request", {
    method: req.method,
    endpoint: req.originalUrl,
    userId: req.user?.uid || req.headers["x-user-id"] || "anonymous",
    ip: req.ip,
    params: req.params,
    query: req.query,
    body: req.body,
  });

  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info("Request completed", {
      method: req.method,
      endpoint: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: duration,
      userId: req.user?.uid || req.headers["x-user-id"] || "anonymous",
    });
  });

  next();
};


