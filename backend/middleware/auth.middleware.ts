import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../types.js";
import jwt from "jsonwebtoken";

/**
 * Protects routes by verifying the JWT from the Authorization header.
 * On success: attaches req.user = { id, email, name, avatar }
 * On failure: responds 401.
 *
 * Uses the same jwt.verify flow as socket/soket.ts to stay consistent.
 */
export const authMiddleware = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): void => {
    const jwtSecret = process.env["JWT_SECRET"];
    if (!jwtSecret) {
        res.status(500).json({ success: false, msg: "Server misconfiguration" });
        return;
    }

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ success: false, msg: "No token provided" });
        return;
    }

    // split("Bearer ")[1] — noUncheckedIndexedAccess: guard the undefined case
    const parts = authHeader.split(" ");
    const token = parts[1];
    if (!token) {
        res.status(401).json({ success: false, msg: "Malformed token" });
        return;
    }

    try {
        const decoded = jwt.verify(token, jwtSecret) as {
            user?: AuthenticatedRequest["user"];
        };
        if (!decoded.user) {
            res.status(401).json({ success: false, msg: "Invalid token payload" });
            return;
        }
        req.user = decoded.user;
        next();
    } catch {
        res.status(401).json({ success: false, msg: "Invalid or expired token" });
    }
};

