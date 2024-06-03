import fs from 'fs';
import sqlite3 from 'sqlite3';

// Function to read CSV file and parse its data
function readCSV(filePath) {
    const csvData = fs.readFileSync(filePath, 'utf-8');
    const parsedData = csvData.split('\n').slice(1).map(line => line.split(',')); // Skipping header
    return parsedData.map(row => {
        // Check if the necessary columns exist
        if (row.length < 7) {
            return null;
        }
        const brand = row[1] ? row[1].trim() : '';
        const name = row[2] ? row[2].trim() : '';
        const quantity = row[6] ? row[6].trim() : '';
        const price = parseFloat(row[3]);
        if (!brand || !name || !quantity || isNaN(price)) {
            return null;
        }
        return {
            brand,
            name,
            quantity,
            price
        };
    }).filter(product => product !== null); // Filter out any null entries
}

// Function to calculate Jaccard similarity between two strings
function jaccardSimilarity(str1, str2) {
    const set1 = new Set(str1.toLowerCase().split(''));
    const set2 = new Set(str2.toLowerCase().split(''));

    const intersection = new Set([...set1].filter(char => set2.has(char)));
    const union = new Set([...set1, ...set2]);

    return intersection.size / union.size;
}

// Function to preprocess product names for Kaufland products
function preprocessKauflandProductName(product) {
    return `${product.manufacturerName} ${product.manufacturerSubBrandName} ${product.name}`.toLowerCase();
}

// Function to preprocess product names for Mega products
function preprocessMegaProductName(product) {
    return `${product.brand} ${product.name} ${product.quantity}`.toLowerCase();
}

// Function to read data from SQLite database
function readSQLite(dbPath, tableName) {
    const db = new sqlite3.Database(dbPath);
    const query = `SELECT * FROM ${tableName}`;
    
    return new Promise((resolve, reject) => {
        db.all(query, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

// Function to find and compare similar products from CSV and SQLite databases
async function compareProductsFromCSVAndSQLite(csvFilePath, sqliteFilePaths, tableName) {
    const csvProducts = readCSV(csvFilePath);
    const sqliteProductsPromises = sqliteFilePaths.map(dbPath => readSQLite(dbPath, tableName));
    const sqliteProductsArrays = await Promise.all(sqliteProductsPromises);

    const similarProducts = [];

    for (const sqliteProducts of sqliteProductsArrays) {
        for (const csvProduct of csvProducts) {
            for (const sqliteProduct of sqliteProducts) {
                const csvProductName = preprocessMegaProductName(csvProduct);
                const sqliteProductName = preprocessKauflandProductName(sqliteProduct);

                const similarity = jaccardSimilarity(csvProductName, sqliteProductName);

                // Adjust this threshold as needed
                if (similarity > 0.5) {
                    similarProducts.push({
                        csvProductName,
                        sqliteProductName,
                        csvPrice: csvProduct.price,
                        sqlitePrice: parseFloat(sqliteProduct.price),
                        sqliteDB: sqliteProducts[0]?.source || 'unknown' // Include the database source
                    });
                }
            }
        }
    }

    return similarProducts;
}

const csvFilePath = 'mega.csv';
const sqliteFilePaths = ['old_dbs/AuchanProducts.db', 'old_dbs/KauflandProducts.db'];
const tableName = 'products';

async function main() {
    const similarProducts = await compareProductsFromCSVAndSQLite(csvFilePath, sqliteFilePaths, tableName);
    console.log(similarProducts);
}

main().catch(error => {
    console.error('Error:', error);
});
