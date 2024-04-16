import sqlite3 from'sqlite3';

async function comparePrices() {
  const auchanDB = new sqlite3.Database('AuchanProducts.db');
  const kauflandDB = new sqlite3.Database('KauflandProducts.db');

  try {
    const auchanProducts = await getProducts(auchanDB);
    const kauflandProducts = await getProducts(kauflandDB);

    const commonBrands = auchanProducts
      .map(product => product.brand)
      .filter(brand => kauflandProducts.some(product => product.brand === brand));

    const auchanCommonProducts = auchanProducts.filter(product => commonBrands.includes(product.brand));
    const kauflandCommonProducts = kauflandProducts.filter(product => commonBrands.includes(product.brand));

    console.log('Common Products with Same Brands:');
    auchanCommonProducts.forEach(auchanProduct => {
      const matchingKauflandProduct = kauflandCommonProducts.find(kauflandProduct =>
        auchanProduct.brand === kauflandProduct.brand
      );
      if (matchingKauflandProduct) {
        console.log(`Brand: ${auchanProduct.brand}`);
        console.log(`Auchan Product: ${auchanProduct.name}, Price: ${auchanProduct.price}`);
        console.log(`Kaufland Product: ${matchingKauflandProduct.name}, Price: ${matchingKauflandProduct.price}`);
        console.log('------------------------');
      }
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    auchanDB.close();
    kauflandDB.close();
  }
}

async function getProducts(db) {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM products', (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

comparePrices();
