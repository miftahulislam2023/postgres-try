import express from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// ----------------------------
// JWT & Password Utilities
// ----------------------------
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

const generateToken = (userId, role) => {
    return jwt.sign({ id: userId, role }, JWT_SECRET, { expiresIn: "1d" });
};

const hashPassword = async (password) => {
    return await bcrypt.hash(password, 10);
};

const comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};

// ----------------------------
// Middleware
// ----------------------------
const authenticate = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Attach user to request
        next();
    } catch (error) {
        res.status(401).json({ error: "Invalid token" });
    }
};

const checkRole = (role) => {
    return (req, res, next) => {
        if (req.user.role !== role) {
            return res.status(403).json({ error: "Forbidden" });
        }
        next();
    };
};

// ----------------------------
// Auth Routes
// ----------------------------
app.post("/register", async (req, res) => {
    const { email, name, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
    }

    try {
        const hashedPassword = await hashPassword(password);
        const user = await prisma.user.create({
            data: { email, name, password: hashedPassword, role: "USER" },
        });
        const token = generateToken(user.id, user.role);
        res.json({ user, token });
    } catch (error) {
        if (error.code === "P2002") {
            res.status(400).json({ error: "Email already exists" });
        } else {
            res.status(500).json({ error: "Server error" });
        }
    }
});

app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(401).json({ error: "Invalid credentials" });

        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = generateToken(user.id, user.role);
        res.json({ user: { id: user.id, email: user.email, role: user.role }, token });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

// ----------------------------
// Protected Routes
// ----------------------------
// Example 1: User Profile (Authenticated only)
app.get("/profile", authenticate, async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { id: true, email: true, name: true, role: true },
    });
    res.json(user);
});

// Example 2: Admin Dashboard (Authenticated + ADMIN role)
app.get("/admin", authenticate, checkRole("ADMIN"), async (req, res) => {
    res.json({ message: "Welcome Admin!" });
});

// ----------------------------
// Server Start
// ----------------------------
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});