import {
  Request,
  Response,
  NextFunction,
} from "express";

import jwt from "jsonwebtoken";

export interface AuthRequest
  extends Request {
  user?: any;
}

export const protect = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader =
      req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith(
        "Bearer "
      )
    ) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const token =
      authHeader.split(" ")[1];

    if (
      !token ||
      token === "null" ||
      token === "undefined"
    ) {
      return res.status(401).json({
        message: "Invalid token",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    );

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      message:
        "Token failed or expired",
    });
  }
};

export const adminOnly = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        message:
          "Admin access only",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
    });
  }
};