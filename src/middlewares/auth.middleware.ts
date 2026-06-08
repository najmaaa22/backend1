import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";


export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: "admin" | "user";
  };
}

export const protect = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Unauthorized - No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token || token === "null" || token === "undefined") {
      return res.status(401).json({
        message: "Invalid token structure",
      });
    }

   
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
    
   
    req.user = {
      id: decoded.id || decoded._id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Token failed or expired",
    });
  }
};

export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized - Please login first",
      });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Forbidden - Admin access only",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      message: "Server error during role validation",
    });
  }
};