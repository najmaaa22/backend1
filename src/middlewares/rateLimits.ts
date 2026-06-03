import rateLimit from "express-rate-limit";

export const submitLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: {
    message: "Too many submissions, please try again after a minute",
  },
  standardHeaders: true,
  legacyHeaders: false,
});