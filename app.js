const express = require('express');
const sqlite3 = require('sqlite3');
const path = require('path');
const { open } = require('sqlite');
const PORT = process.env.PORT || 3000;

const app = express();

// Middleware for serving static files
app.use(express.static(path.join(__dirname, 'frontend')));

// Middleware for parsing JSON bodies
app.use(express.json());

// Function to initialize the database connection
async function initDb() {
    return open({
        filename: './backend/similar_products.db',
        driver: sqlite3.Database
    });
}

// API endpoint to get similar products
app.get('/api/similar_products', async (req, res) => {
    try {
        const db = await initDb();
        const rows = await db.all('SELECT * FROM similar_products');
        res.json(rows);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
