const express = require('express');
const sqlite3 = require('sqlite3');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'frontend')));

app.get('/api/similar_products', (req, res) => {
    const db = new sqlite3.Database('./backend/similar_products.db');

    db.all('SELECT * FROM similar_products', [], (err, rows) => {
        if (err) {
            res.status(500).send(err.message);
            return;
        }
        res.json(rows);
    });

    db.close();
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
