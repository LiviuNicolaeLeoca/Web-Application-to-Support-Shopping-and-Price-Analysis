const express = require('express');
const sqlite3 = require('sqlite3');
const path = require('path');
const { open } = require('sqlite');
const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.static(path.join(__dirname, 'frontend')));
app.use(express.json());

sources = ['mega', 'penny', 'auchan', 'kaufland']
async function initDb() {
    try {
        const db = await open({
            filename: './backend/similar_products.db',
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
                   penny.name AS penny_productName, penny.brand AS penny_productBrand,
                   penny.quantity AS penny_productQuantity, penny.image_url AS penny_productImage,
                   auchan.name AS auchan_productName, auchan.brand AS auchan_productBrand,
                   auchan.quantity AS auchan_productQuantity, auchan.image_url AS auchan_productImage,
                   kaufland.name AS kaufland_productName, kaufland.brand AS kaufland_productBrand,
                   kaufland.quantity AS kaufland_productQuantity, kaufland.image_url AS kaufland_productImage
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

        const instancesQuery = `
            SELECT *
            FROM ${productDetails.lowestPriceSource}_products
            WHERE similar_product_id = ?
        `;

        // Fetch instances for the lowest price source
        const lowestPriceInstances = await db.all(instancesQuery, productId);

        // Fetch instances for all other sources
        const otherInstancesQuery = `
            SELECT *
            FROM similar_products sp
            LEFT JOIN mega_products mega ON sp.id = mega.similar_product_id
            LEFT JOIN penny_products penny ON sp.id = penny.similar_product_id
            LEFT JOIN auchan_products auchan ON sp.id = auchan.similar_product_id
            LEFT JOIN kaufland_products kaufland ON sp.id = kaufland.similar_product_id
            WHERE sp.id = ? AND sp.lowestPriceSource != ?
        `;
        const otherInstances = await db.all(otherInstancesQuery, productId, productDetails.lowestPriceSource);

        res.json({
            details: {
                name: productDetails[`${productDetails.lowestPriceSource}_productName`],
                brand: productDetails[`${productDetails.lowestPriceSource}_productBrand`],
                quantity: productDetails[`${productDetails.lowestPriceSource}_productQuantity`],
                lowestPriceSource: productDetails.lowestPriceSource,
                lowestPrice: productDetails.lowestPrice,
                image_urls: productDetails[`${productDetails.lowestPriceSource}_productImage`]
            },
            instances: [
                ...lowestPriceInstances.map(instance => ({
                    source: productDetails.lowestPriceSource,
                    price: instance.price,
                    brand: instance.brand,
                    quantity: instance.quantity,
                    image_url: instance.image_url
                })),
                ...otherInstances.map(instance => ({
                    source: instance.lowestPriceSource,
                    price: instance.lowestPrice,
                    brand: instance[`${instance.lowestPriceSource}_productBrand`],
                    quantity: instance[`${instance.lowestPriceSource}_productQuantity`],
                    image_url: instance[`${instance.lowestPriceSource}_productImage`]
                }))
            ]
        });
    } catch (error) {
        console.error('Error fetching product details:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
