import express from "express";
const app = express();
const port = 3000;

// Middleware
app.use(express.json());

app.get('{/*path}', (req, res) => {
    res.json({
        message: `Assalamu 'alaykum from GET`,
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