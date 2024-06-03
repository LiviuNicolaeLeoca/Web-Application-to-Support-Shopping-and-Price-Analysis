import puppeteer from "puppeteer";
import sqlite3 from 'sqlite3';

async function insertProductsIntoDatabase(products) {
  const db = new sqlite3.Database('./AuchanProducts.db');

  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY,
          name TEXT,
          brand TEXT,
          quantity TEXT,
          price TEXT,
          old_price TEXT,
          discount TEXT,
          loyalty_discount TEXT,
          availability TEXT,
          image_url TEXT
      )`);

    const insertStmt = db.prepare(`INSERT INTO products (name, brand, quantity, price, old_price, discount, loyalty_discount, availability, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    for (const product of products) {
      const { name, brand, quantity, price, oldPrice, discount, loyaltyDiscount, availability, image_url } = product;
      insertStmt.run(name, brand, quantity, price, oldPrice, discount, loyaltyDiscount, availability, image_url);
    }
    insertStmt.finalize();

    db.close((err) => {
      if (err) {
        console.error('Error closing SQLite database:', err);
        return;
      }
    });
  });
}

async function deleteAllProducts() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database('./AuchanProducts.db', (err) => {
      if (err) {
        console.error('Error opening database:', err);
        reject(err);
      }
    });

    db.run('DELETE FROM products', function (err) {
      if (err) {
        console.error('Error deleting existing products:', err);
        reject(err);
      } else {
        resolve();
      }
      db.close((err) => {
        if (err) {
          console.error('Error closing SQLite database:', err);
          reject(err);
        }
      });
    });
  });
}
async function scrapeProducts(page, brandNames) {
  const products = await page.evaluate((brandNames) => {
    const productList = [];
    const productTiles = document.querySelectorAll('.vtex-search-result-3-x-galleryItem');

    productTiles.forEach(productTile => {
      const productNameElement = productTile.querySelector('.vtex-product-summary-2-x-productNameContainer');
      const productPriceElement = productTile.querySelector('.vtex-product-price-1-x-sellingPrice');
      const productAvailabilityElement = productTile.querySelector('.vtex-product-availability-0-x-container');
      const productOldPriceElement = productTile.querySelector('.vtex-product-price-1-x-listPrice');
      const discountInfoElement = productTile.querySelector('.auchan-loyalty-0-x-listDiscountPercentage');
      const loyaltyDiscountInfoElement = productTile.querySelector('.auchan-loyalty-0-x-trigger .auchan-loyalty-0-x-discountFlag');
      const imageElement = productTile.querySelector('.vtex-product-summary-2-x-imageNormal');

      if (productNameElement && productAvailabilityElement && productPriceElement) {
        let productName = productNameElement.innerText.trim();
        let productQuantity = null;

        let brand = null;
        if (brandNames) {
          brand = brandNames.find(brandName => productName.toLowerCase().includes(brandName.toLowerCase()));
        }

        const quantityPattern = /(\d+(\.\d+)?\s*(x\s*\d+(\.\d+)?)?\s*(g|kg|l|ml|plicuri|bucati|capsule|bauturi|buc)\b)|(\d+\s*(in)?\s*\d+\s*(in)?\s*\d+)/gi;
        const quantityMatches = productName.match(quantityPattern);
        if (quantityMatches) {
          productQuantity = quantityMatches.join(', ');

          productName = productName.replace(quantityPattern, '').trim();
        }

        if (productQuantity == null) {
          const lastCommaIndex = productName.lastIndexOf(',');
          if (lastCommaIndex !== -1) {
            productQuantity = productName.slice(lastCommaIndex + 1).trim();
            productName = productName.slice(0, lastCommaIndex).trim();
          }
        }

        if (productName.slice(-1) === ',') {
          productName = productName.slice(0, -1).trim();
        }
        if (productName.match(/, \+\/-$/)) {
          productName = productName.slice(0, -5).trim();
        }
        const productAvailability = productAvailabilityElement.innerText.trim();
        const productPrice = productPriceElement.innerText.trim();
        const productOldPrice = productOldPriceElement ? productOldPriceElement.innerText.trim() : null;
        const imageUrl = imageElement.src;

        let discountPercentage = null;
        let loyaltyDiscountPercentage = null;

        discountPercentage = discountInfoElement ? discountInfoElement.innerText.trim() : null;

        if (loyaltyDiscountInfoElement) {
          loyaltyDiscountPercentage = loyaltyDiscountInfoElement.querySelector('.auchan-loyalty-0-x-discountPercentage').innerText.trim();
        }

        let modifiedPrice = parseFloat(productPrice.replace('lei', '').trim().replace(',', '.'));
        let modifiedOldPrice = productOldPrice ? parseFloat(productOldPrice.replace('lei', '').trim().replace(',', '.')) : null;

        //productQuantity = productQuantity ? productQuantity.replace(/\s+/g, '').toLowerCase() : null;

        const product = {
          name: productName,
          brand: brand || null,
          quantity: productQuantity,
          price: modifiedPrice,
          oldPrice: modifiedOldPrice,
          discount: discountPercentage,
          loyaltyDiscount: loyaltyDiscountPercentage,
          availability: productAvailability,
          imageUrl: imageUrl
        };

        productList.push(product);
      } else {
        console.log('Missing element in product:');
        console.log(productTile);
      }
    });

    return productList;
  }, brandNames);

  return products;
}

async function scrapeBrands(page) {
  const brandNames = await page.evaluate(async () => {
    const brands = [];
    const inputField = document.querySelector(
      'input[placeholder="Cauta Brand"]'
    );
    if (inputField) {
      const filterContainer = inputField.closest(
        ".vtex-search-result-3-x-filterTemplateOverflow"
      );
      if (filterContainer) {
        const scrollDownToEnd = async () => {
          let lastHeight = filterContainer.scrollHeight;
          while (true) {
            filterContainer.scrollTop = filterContainer.scrollHeight;
            await new Promise((resolve) => setTimeout(resolve, 1000));
            if (filterContainer.scrollHeight === lastHeight) break;
            lastHeight = filterContainer.scrollHeight;
          }
        };

        const seeMoreButton = filterContainer.querySelector(
          ".vtex-search-result-3-x-seeMoreButton"
        );
        if (seeMoreButton) {
          seeMoreButton.click();
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        await scrollDownToEnd();

        const brandElements = filterContainer.querySelectorAll(
          ".vtex-checkbox__label"
        );
        brandElements.forEach((element) => {
          const brandName = element.textContent.split("(")[0].trim();
          brands.push(brandName);
        });
      }
    }
    return brands;
  });

  return brandNames;
}

async function scrollToBottom(page) {
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      let totalHeight = 0;
      const distance = 100;
      const maxScrollAttempts = 7;
      let scrollAttempts = 0;

      const scrollInterval = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight || scrollAttempts >= maxScrollAttempts) {
          clearInterval(scrollInterval);
          resolve();
        }

        scrollAttempts++;
      }, 500);
    });
  });
}

async function waitForPageLoad(page) {
  await page.waitForSelector('.vtex-loader', { hidden: true });
}

async function scrapeAllProducts(page, brandNames) {
  await waitForPageLoad(page);

  let productsSet = new Set();
  while (true) {
    await scrollToBottom(page);

    const newProducts = await scrapeProducts(page, brandNames);
    newProducts.forEach(product => {
      productsSet.add(JSON.stringify(product));
    });

    const showMoreButton = await page.$('.vtex-search-result-3-x-buttonShowMore button');
    if (!showMoreButton) break;

    await page.click('.vtex-search-result-3-x-buttonShowMore button');
    await waitForPageLoad(page);
  }

  const products = Array.from(productsSet).map(product => JSON.parse(product));

  return products;
}

(async () => {
  try {
    await deleteAllProducts();
  } catch (error) {
    console.error('Error deleting products:', error);
  }

  const URLs = [
    'https://www.auchan.ro/promotii/myclub-auchan?initialMap=productClusterIds&initialQuery=1975&map=category-1,category-1,category-1,category-1,category-1,productclusternames&query=/bacanie/bauturi-si-tutun/brutarie-cofetarie-gastro/fructe-si-legume/lactate-carne-mezeluri---peste/categorie-promotii---myclub-auchan&searchState',
    'https://www.auchan.ro/promotii/profita?initialMap=productClusterIds&initialQuery=2007&map=category-1,category-1,category-1,category-1,category-1,productclusternames&query=/bacanie/bauturi-si-tutun/brutarie-cofetarie-gastro/fructe-si-legume/lactate-carne-mezeluri---peste/categorie-promotii----profita&searchState'
  ];
  const products = [];

  for (const url of URLs) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto(url);
    await waitForPageLoad(page);

    let brandNames = await scrapeBrands(page);
    while (brandNames.length === 0) {
      console.log('No brands found. Retrying...');
      await new Promise(resolve => setTimeout(resolve, 25000));
      brandNames = await scrapeBrands(page);

    }

    const newProducts = await scrapeAllProducts(page, brandNames);
    console.log(newProducts.length);
    products.push(...newProducts);
    console.log(brandNames);

    await browser.close();
  }

  await insertProductsIntoDatabase(products);
})();

