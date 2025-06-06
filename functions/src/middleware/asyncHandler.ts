/**
 * Wraps an asynchronous Express middleware or route handler, forwarding any rejected promises to the next error handler.
 *
 * @param fn - The asynchronous middleware or route handler function to wrap.
 * @returns A function compatible with Express middleware signature that handles promise rejections.
 *
 * @example
 * router.get('/route', asyncHandler(async (req, res, next) => {
 *   // Your async code here
 * }));
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {Response, NextFunction} from "express";
import {AuthenticatedRequest} from "../interface/AuthenticatedRequest";


export const asyncHandler = (
  fn: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>
) =>
  (req: AuthenticatedRequest, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);
