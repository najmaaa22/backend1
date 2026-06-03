import { Request, Response } from "express";
import { User } from "./auth.models";

import {
  registerService,
  loginService,
} from "./auth.service";

export const register = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      name,
      email,
      password,
      role,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message:
          "All fields are required",
      });
    }

    const data =
      await registerService(
        name,
        email,
        password,
        role
      );

    return res.status(201).json({
      success: true,
      message:
        "User registered successfully",
      ...data,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const login = async (
  req: Request,
  res: Response
) => {
  try {
    const { email, password } =
      req.body;

    if (!email || !password) {
      return res.status(400).json({
        message:
          "Email and password required",
      });
    }

    const data =
      await loginService(
        email,
        password
      );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      ...data,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const user = await User.findById((req as any).user.id).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    return res.status(200).json(user);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find({ role: "user" }).select("name email _id");
    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};