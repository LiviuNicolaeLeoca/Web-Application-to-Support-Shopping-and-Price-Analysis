import sqlite3 from 'sqlite3';
import puppeteer from 'puppeteer';

(async () => {
  const db = new sqlite3.Database('./backend/KauflandProducts.db');

  db.serialize(async () => {
    db.run(`CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY,
      name TEXT
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY,
      name TEXT,
      brand TEXT,
      quantity TEXT,
      oldPrice TEXT,
      discount TEXT,
      price TEXT,
      image_url TEXT,
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
          const productImageElement = productTile.querySelector('.a-image-responsive');

          if (productNameElement && productQuantityElement && productPriceElement && productImageElement) {
            let productName = productNameElement.innerText;
            let productBrandName = productBrandNameElement ? productBrandNameElement.innerText : '';
            let productQuantity = productQuantityElement.innerText.trim();
            const productOldPrice = productOldPriceElement ? parseFloat(productOldPriceElement.innerText.trim().replace(',', '.')) : '';
            const productDiscount = productDiscountElement ? productDiscountElement.innerText.trim() : '';
            const productPrice = parseFloat(productPriceElement.innerText.trim().replace(',', '.'));
            const imageUrlSrc = productImageElement ? productImageElement.getAttribute('src') : null;
            const imageUrlDataSrc = productImageElement ? productImageElement.getAttribute('data-srcset') : null;

            let imageUrl = imageUrlSrc;

            if (imageUrlDataSrc) {
              const imageUrlWithoutWidth = imageUrlDataSrc.split(',').map(url => {
                const trimmedUrl = url.trim();
                return trimmedUrl.split(' ')[0];
              });

              imageUrl = imageUrlWithoutWidth.length > 0 ? imageUrlWithoutWidth[imageUrlWithoutWidth.length - 1] : null;
            }

            if (productName === productBrandName) {
              productBrandName = '';
            }


            let modifiedProductName = productName;
            let modifiedProductBrandName = productBrandName;

            if (productName[0] === productName[0].toLowerCase()) {
              [modifiedProductName, modifiedProductBrandName] = [modifiedProductBrandName, modifiedProductName];
            }
            if (modifiedProductBrandName.includes(productQuantity)) {
              modifiedProductBrandName = modifiedProductBrandName.replace(productQuantity, '').trim();
            } else if (modifiedProductBrandName === productQuantity) {
              modifiedProductBrandName = '';
            }

            if (modifiedProductName.includes(productQuantity)) {
              modifiedProductName = modifiedProductName.replace(productQuantity, '').trim();
            }
            
            if (productDiscount !== '') {
              discountedProductsList.push({
                name: modifiedProductName,
                brandName: modifiedProductBrandName,
                quantity: productQuantity,
                oldPrice: productOldPrice,
                discount: productDiscount,
                price: productPrice,
                image_url: imageUrl,
                categoryId: categoryId
              });
            } else {
              nonDiscountedProductsList.push({
                name: modifiedProductName,
                brandName: modifiedProductBrandName,
                quantity: productQuantity,
                oldPrice: productOldPrice,
                discount: productDiscount,
                price: productPrice,
                image_url: imageUrl,
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
        db.run(`INSERT INTO products (name, brand, quantity, oldPrice, discount, price, image_url, categoryId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [product.name, product.brandName || '', product.quantity, product.oldPrice, product.discount, product.price, product.image_url, categoryName], function (err) {
            if (err) {
              console.error(err.message);
            }
          });
      }

      for (const product of nonDiscountedProductsList) {
        db.run(`INSERT INTO products (name, brand, quantity, oldPrice, discount, price, image_url, categoryId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [product.name, product.brandName || '', product.quantity, product.oldPrice, product.discount, product.price, product.image_url, categoryName], function (err) {
            if (err) {
              console.error(err.message);
            }
          });
      }
      await browser.close();
    }

    db.close();
  });

})();
