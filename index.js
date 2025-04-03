import express from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const app = express();
const port = 3000;

app.use(express.json());

app.get('{/*path}', async (req, res) => {
    const newPath = req.path.slice(1)
    const email = `${newPath}@gmail.com`
    const name = newPath
    const result = await prisma.user.create({
        data: {
            name: name,
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

app.post('{/*path}', async (req, res) => {
    const newPath = req.path.slice(1)
    const email = `${newPath}@gmail.com`
    const name = newPath
    const result = await prisma.user.create({
        data: {
            name: name,
            email: email
        }
    });
    res.json({
        message: `Assalamu 'alaykum from POST`,
        result: result,
        path: req.path,
        query: req.params
    });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});