import sqlite3 from 'sqlite3';
import puppeteer from 'puppeteer';

(async () => {
  const db = new sqlite3.Database('KauflandProducts.db');

  db.serialize(async () => {
    db.run(`CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY,
      name TEXT
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY,
      name TEXT,
      brandName TEXT,
      quantity TEXT,
      oldPrice TEXT,
      discount TEXT,
      price TEXT,
      categoryId INTEGER,
      FOREIGN KEY (categoryId) REFERENCES categories(id)
    )`);
    db.run(`DELETE FROM categories`);
    db.run(`DELETE FROM products`);

    const categoryURLs = [
      'https://www.kaufland.ro/oferte/oferte-saptamanale/saptamana-curenta.category=01_Carne__mezeluri.html',
      'https://www.kaufland.ro/oferte/oferte-saptamanale/saptamana-curenta.category=01a_Legume__fructe__flori.html',
      'https://www.kaufland.ro/oferte/oferte-saptamanale/saptamana-curenta.category=02_Pește.html',
      'https://www.kaufland.ro/oferte/oferte-saptamanale/saptamana-curenta.category=03_Lactate__ouă.html',
      'https://www.kaufland.ro/oferte/oferte-saptamanale/saptamana-curenta.category=04_Delicatese__congelate.html',
      'https://www.kaufland.ro/oferte/oferte-saptamanale/saptamana-curenta.category=05_Alimente_de_bază.html',
      'https://www.kaufland.ro/oferte/oferte-saptamanale/saptamana-curenta.category=06_Brutărie.html',
      'https://www.kaufland.ro/oferte/oferte-saptamanale/saptamana-curenta.category=08_Cafea_și_ceai.html',
      'https://www.kaufland.ro/oferte/oferte-saptamanale/saptamana-curenta.category=09_Dulciuri__snackuri.html',
      'https://www.kaufland.ro/oferte/oferte-saptamanale/saptamana-curenta.category=10_Băuturi.html'
    ];

    for (let i = 0; i < categoryURLs.length; i++) {
      const categoryURL = categoryURLs[i];
      const browser = await puppeteer.launch();
      const page = await browser.newPage();

      await page.goto(categoryURL);

      const categoryName = categoryURL.split('=')[1].split('.')[0].split('_').slice(1).join(' ');

      const lastID = await new Promise((resolve, reject) => {
        db.run(`INSERT INTO categories (name) VALUES (?)`, [categoryName], function (err) {
          if (err) {
            console.error(err.message);
            reject(err);
          } else {
            console.log(`Category '${categoryName}' inserted with ID ${this.lastID}`);
            resolve(this.lastID);
          }
        });
      });

      const { discountedProductsList, nonDiscountedProductsList } = await page.evaluate((categoryId) => {
        const discountedProductsList = [];
        const nonDiscountedProductsList = [];
        const productTiles = document.querySelectorAll('.m-offer-tile');

        productTiles.forEach(productTile => {
          const productBrandNameElement = productTile.querySelector('.m-offer-tile__subtitle');
          const productNameElement = productTile.querySelector('.m-offer-tile__title') || productTile.querySelector('.m-offer-tile__subtitle');
          const productQuantityElement = productTile.querySelector('.m-offer-tile__quantity');
          const productOldPriceElement = productTile.querySelector('.a-pricetag__old-price');
          const productDiscountElement = productTile.querySelector('.a-pricetag__discount');
          const productPriceElement = productTile.querySelector('.a-pricetag__price');

          if (productNameElement && productQuantityElement && productPriceElement) {
            const productName = productNameElement.innerText;
            let productBrandName = productBrandNameElement ? productBrandNameElement.innerText : '';
            const productQuantity = productQuantityElement.innerText.trim();
            const productOldPrice = productOldPriceElement ? productOldPriceElement.innerText.trim() : '';
            const productDiscount = productDiscountElement ? productDiscountElement.innerText.trim() : '';
            const productPrice = productPriceElement.innerText.trim();

            if (productName === productBrandName) {
              productBrandName = '';
            }
            if (productQuantity === productBrandName) {
              productBrandName = '';
            }

            let modifiedProductName = '';
            let modifiedProductBrandName = '';
            if (productName[0] === productName[0].toLowerCase()) {
              let temp = productName;
              modifiedProductName = productBrandName;
              modifiedProductBrandName = temp;
            }

            if (productDiscount !== '') {
              const nameToUse = modifiedProductName !== '' ? modifiedProductName : productName;
              const brandNameToUse = modifiedProductBrandName !== '' ? modifiedProductBrandName : productBrandName;
              discountedProductsList.push({
                name: nameToUse,
                brandName: brandNameToUse,
                quantity: productQuantity,
                oldPrice: productOldPrice,
                discount: productDiscount,
                price: productPrice,
                categoryId: categoryId
              });
            } else {
              const nameToUse = modifiedProductName !== '' ? modifiedProductName : productName;
              const brandNameToUse = modifiedProductBrandName !== '' ? modifiedProductBrandName : productBrandName;
              nonDiscountedProductsList.push({
                name: nameToUse,
                brandName: brandNameToUse,
                quantity: productQuantity,
                oldPrice: productOldPrice,
                discount: productDiscount,
                price: productPrice,
                categoryId: categoryId
              });
            }
          } else {
            console.log('Missing element in product:');
            console.log(productTile);
          }
        });

        return { discountedProductsList, nonDiscountedProductsList };
      }, lastID);

      for (const product of discountedProductsList) {
        db.run(`INSERT INTO products (name, brandName, quantity, oldPrice, discount, price, categoryId) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [product.name, product.brandName || '', product.quantity, product.oldPrice, product.discount, product.price, lastID], function (err) {
            if (err) {
              console.error(err.message);
            } else {
              console.log(`Product '${product.name}' with brand '${product.brandName}' inserted with ID ${this.lastID}`);
            }
          });
      }

      for (const product of nonDiscountedProductsList) {
        db.run(`INSERT INTO products (name, brandName, quantity, oldPrice, discount, price, categoryId) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [product.name, product.brandName || '', product.quantity, product.oldPrice, product.discount, product.price, lastID], function (err) {
            if (err) {
              console.error(err.message);
            } else {
              console.log(`Product '${product.name}' with brand '${product.brandName}' inserted with ID ${this.lastID}`);
            }
          });
      }

      await browser.close();
    }

    db.close();
  });

})();