import express from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const app = express();
const port = 3000;

// Middleware
app.use(express.json());

app.get('{/*path}', async (req, res) => {
    const email = `${req.path}@gmail.com`
    const result = await prisma.user.create({
        data: {
            name: req.path,
            email: email
        }
    });
    res.json({
        message: `Assalamu 'alaykum from GET`,
        result: result,
        path: req.path,
        query: req.query
    });
});

app.post('{/*path}', (req, res) => {
    res.json({
        message: `Assalamu 'alaykum from POST`,
        path: req.path,
        body: req.body
    });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});