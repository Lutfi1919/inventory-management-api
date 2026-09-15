import { rateLimit } from "express-rate-limit";

export const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  limit: 5,
  message: {
    success: false,
    message: "too many request"
  },
  standardHeaders: 'draft-8',
  legacyHeaders: false,
})