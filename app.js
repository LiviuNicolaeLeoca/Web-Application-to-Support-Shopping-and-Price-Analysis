import express from 'express';
import path from 'path';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(express.static(path.join(__dirname, 'frontend')));
app.use(express.json());

const sources = ['mega', 'penny', 'auchan', 'kaufland'];
async function initDb() {
    try {
        const db = await open({
            filename: './backend/similar_products1.db',
            driver: sqlite3.Database
        });
        return db;
    } catch (error) {
        console.error('Error opening database:', error);
        throw error;
    }
}

for (const source of sources) {
    app.get(`/${source}`, async (req, res) => {
        try {
            const db = await initDb();
            const rows = await db.all(`SELECT * FROM ${source}_products`);
            res.json(rows);
        } catch (error) {
            console.error(`Error fetching ${source} products:`, error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });
    app.get(`/all_${source}`, async (req, res) => {
        try {
            const db = await initDb();
            const rows = await db.all(`SELECT * FROM all_${source}_products`);
            res.json(rows);
        } catch (error) {
            console.error(`Error fetching ${source} products:`, error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });
}

app.get('/api/similar_products', async (req, res) => {
    try {
        const db = await initDb();
        const rows = await db.all('SELECT * FROM similar_products');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching similar products:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/product_details', async (req, res) => {
    const { productId } = req.query;

    if (!productId) {
        return res.status(400).json({ error: 'Product ID not provided' });
    }

    try {
        const db = await initDb();

        const query = `
        SELECT sp.*, 
               mega.name AS mega_productName, mega.brand AS mega_productBrand, 
               mega.quantity AS mega_productQuantity, mega.image_url AS mega_productImage,
               mega.discount AS mega_productDiscount, mega.oldPrice AS mega_productOldPrice,
               penny.name AS penny_productName, penny.brand AS penny_productBrand,
               penny.quantity AS penny_productQuantity, penny.image_url AS penny_productImage,
               penny.discount AS penny_productDiscount, penny.oldPrice AS penny_productOldPrice,
               auchan.name AS auchan_productName, auchan.brand AS auchan_productBrand,
               auchan.quantity AS auchan_productQuantity, auchan.image_url AS auchan_productImage,
               auchan.discount AS auchan_productDiscount, auchan.oldPrice AS auchan_productOldPrice,
               kaufland.name AS kaufland_productName, kaufland.brand AS kaufland_productBrand,
               kaufland.quantity AS kaufland_productQuantity, kaufland.image_url AS kaufland_productImage,
               kaufland.discount AS kaufland_productDiscount, kaufland.oldPrice AS kaufland_productOldPrice
        FROM similar_products sp
        LEFT JOIN mega_products mega ON sp.id = mega.similar_product_id
        LEFT JOIN penny_products penny ON sp.id = penny.similar_product_id
        LEFT JOIN auchan_products auchan ON sp.id = auchan.similar_product_id
        LEFT JOIN kaufland_products kaufland ON sp.id = kaufland.similar_product_id
        WHERE sp.id = ?
    `;
        const productDetails = await db.get(query, productId);

        if (!productDetails) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const fetchInstances = async (source) => {
            const sourceQuery = `
                SELECT *
                FROM ${source}_products
                WHERE similar_product_id = ?
            `;
            return await db.all(sourceQuery, productId);
        };
        const allInstances = await Promise.all(sources.map(fetchInstances));

        const instances = sources.flatMap((source, index) =>
            allInstances[index].map(instance => ({
                source,
                name: instance.name,
                price: instance.price,
                oldPrice:instance.oldPrice,
                discount:instance.discount,
                brand: instance.brand,
                quantity: instance.quantity,
                image_url: instance.image_url
            }))
        );

        res.json({
            details: {
                name: productDetails[`${productDetails.lowestPriceSource}_productName`],
                brand: productDetails[`${productDetails.lowestPriceSource}_productBrand`],
                quantity: productDetails[`${productDetails.lowestPriceSource}_productQuantity`],
                lowestPriceSource: productDetails.lowestPriceSource,
                lowestPrice: productDetails.lowestPrice,
                image_urls: productDetails[`${productDetails.lowestPriceSource}_productImage`]
            },
            instances
        });
    } catch (error) {
        console.error('Error fetching product details:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

for (const source of sources) {
    app.get(`/all_${source}_products`, async (req, res) => {
        const { id } = req.query;

        if (!id) {
            return res.status(400).json({ error: 'Id not provided' });
        }

        try {
            const db = await initDb();
            const query = `
                SELECT *
                FROM all_${source}_products
                WHERE id = ?
            `;
            const rows = await db.all(query, id);

            if (!rows.length) {
                return res.status(404).json({ error: 'Product not found' });
            }

            const instances = rows.map(row => ({
                source,
                name: row.name,
                price: row.price,
                oldPrice:row.oldPrice,
                discount:row.discount,
                brand: row.brand,
                quantity: row.quantity,
                image_url: row.image_url
            }));

            res.json({ instances });
        } catch (error) {
            console.error(`Error fetching ${source} products:`, error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });
}

const sources1 = [
    { name: 'mega', type: 'python', script: 'MegaImage.py' },
    { name: 'penny', type: 'python', script: 'PennyDB.py' },
    { name: 'kaufland', type: 'js', script: 'KauflandDB.js' },
    { name: 'auchan', type: 'js', script: 'AuchanDB.js' }
];

for (const source1 of sources1) {
    app.post(`/scrape/${source1.name}`, (req, res) => {
        const command = source1.type === 'python' ? `python3 ./backend/${source1.script}` : `node ./backend/${source1.script}`;
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing ${source1.script}:`, error);
                return res.status(500).json({ error: `Error executing ${source1.script}` });
            }
            res.json({ message: `Scraping for ${source1.name} completed successfully`, stdout, stderr });
        });
    });
}

app.post('/scrape/all', async (req, res) => {
    try {
        for (const source1 of sources1) {
            const command = source1.type === 'python' ? `python3 ./backend/${source1.script}` : `node ./backend/${source1.script}`;
            await new Promise((resolve, reject) => {
                exec(command, (error, stdout, stderr) => {
                    if (error) {
                        console.error(`Error executing ${source1.script}:`, error);
                        return reject(`Error executing ${source1.script}`);
                    }
                    console.log(`Scraping for ${source1.name} completed`);
                    resolve();
                });
            });
        }

        const commandMain = 'python3 ./backend/main.py';
        exec(commandMain, (error, stdout, stderr) => {
            if (error) {
                console.error('Error executing main.py:', error);
                return res.status(500).json({ error: 'Error executing main.py' });
            }
            console.log('main.py execution completed');
            res.json({ message: 'Scraping for all supermarkets and main.py execution completed successfully', stdout, stderr });
        });

    } catch (error) {
        res.status(500).json({ error: 'Error executing scrape_all' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});