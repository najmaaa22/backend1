import jwt from "jsonwebtoken";
import User from "./auth.model";

const JWT_SECRET = process.env.JWT_SECRET || "secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";

// ─── Helpers ──────────────────────────────────────────────────
const signToken = (id: unknown, email: string, role: string): string => {
  return jwt.sign({ id, email, role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  } as jwt.SignOptions);
};

const sanitizeUser = (user: any) => ({
  _id: (user._id || user.id)?.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
});

// ─── Register ────────────────────────────────────────────────
export const registerService = async (
  name: string,
  email: string,
  password: string,
  role?: string
) => {
  const existingUser = await User.findOne({ email: email.toLowerCase() });

  if (existingUser) {
    const err: any = new Error("User already exists");
    err.statusCode = 409;
    throw err;
  }

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    role: role === "admin" ? "admin" : "user",
  });

  const token = signToken(user._id, user.email, user.role);

  return { token, user: sanitizeUser(user) };
};

// ─── Login ───────────────────────────────────────────────────
export const loginService = async (email: string, password: string) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+password"
  );

  if (!user) {
    const err: any = new Error("Invalid email or password");
    err.statusCode = 401;
    throw err;
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    const err: any = new Error("Invalid email or password");
    err.statusCode = 401;
    throw err;
  }

  const token = signToken(user._id, user.email, user.role);

  return { token, user: sanitizeUser(user) };
};

// ─── Get Me ──────────────────────────────────────────────────
export const getMeService = async (userId: string) => {
  const user = await User.findById(userId);

  if (!user) {
    const err: any = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }

  return sanitizeUser(user);
};

// ─── Get All Users (Admin) ────────────────────────────────────
export const getAllUsersService = async () => {
  const users = await User.find({ role: "user" }).sort({ createdAt: -1 });

  return users.map(sanitizeUser);
};