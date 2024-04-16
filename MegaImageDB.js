import puppeteer from 'puppeteer';

async function scrapeProductData(page) {
    const { regularProducts, loyaltyCardProducts } = await page.evaluate(() => {
        const regularProducts = [];
        const loyaltyCardProducts = [];
        const productElements = document.querySelectorAll('.sc-3brks3-4.foyuzg.product-item');

        productElements.forEach(product => {
            const nameElement = product.querySelector('[data-testid="product-block-product-name"] a');
            const brandElement = product.querySelector('[data-testid="product-block-brand-name"] a');
            const priceElement = product.querySelector('[data-testid="product-block-price"]');
            const oldPriceElement = product.querySelector('[data-testid="product-block-old-price"]');
            const discountElement = product.querySelector('[data-testid="product-block-promo-label"]');
            const pricePerUnitElement = product.querySelector('[data-testid="product-block-price-per-unit"]');
            const imageElement = product.querySelector('[data-testid="product-block-image"]');

            if (nameElement && brandElement && priceElement && imageElement) {
                const name = nameElement.innerText.trim();
                const brand = brandElement.innerText.trim();
                let price = parseFloat(priceElement.innerText.replace('Lei', '').replace(',', '.').trim()).toFixed(2);
                let oldPrice = oldPriceElement ? oldPriceElement.innerText.trim() : null;
                const discount = discountElement ? discountElement.innerText.trim() : null;
                const pricePerUnit = pricePerUnitElement ? pricePerUnitElement.innerText.trim() : null;
                const image = imageElement.src;

                let productName = name;
                let productQuantity = null;
                const quantityMatches = productName.match(/(\d+(\.\d+)?)\s*(x\s*\d+(\.\d+)?)?\s*(g|kg|l|ml|plicuri|bucati)\b/gi);
                if (quantityMatches) {
                    productQuantity = quantityMatches.join(', ');
                    productName = productName.replace(quantityMatches[0], '').trim();
                } else {
                    try {
                        productQuantity = (parseFloat(price) / parseFloat(pricePerUnit)).toFixed(2);
                        let quantityTypeMatch = pricePerUnit.match(/(g|kg|l|ml|plicuri|bucati)\b/i);
                        let quantityType = quantityTypeMatch ? quantityTypeMatch[1] : null;
                        productQuantity += `${quantityType}`;
                    }
                    catch (e) {
                        productQuantity = null;
                    }
                }

                if (discount && discount.includes('CONNECT')) {
                    if (!oldPrice) {
                        oldPrice = price;
                        oldPrice += ' Lei';
                        let discountPercentage = parseFloat(discount.split(' ')[1]);
                        let discountAmount = 1 + (discountPercentage / 100);
                        price = (parseFloat(oldPrice) * discountAmount).toFixed(2);

                    }
                }

                price += ' Lei';
                const product = { name: productName, brand, price, oldPrice, discount, pricePerUnit, image, quantity: productQuantity };

                if (discount && discount.toLowerCase().includes('connect')) {
                    loyaltyCardProducts.push(product);
                } else {
                    regularProducts.push(product);
                }
            }
        });

        return { regularProducts, loyaltyCardProducts };
    });

    return regularProducts.concat(loyaltyCardProducts);
}

async function scrollToLoadingSpinner(page) {
    let loadingSpinner = await page.$('[data-testid="loading-spinner"]');
    let scrollCount = 0;
    
    while (loadingSpinner && scrollCount < 10) {
        console.log(`Scrolling ${scrollCount + 1}`);
        
        await page.evaluate(() => {
            const spinner = document.querySelector('[data-testid="loading-spinner"]');
            // if (spinner) {
            //     spinner.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // } else {
                const windowHeight = window.innerHeight;
                const pageHeight = document.body.scrollHeight;
                const targetScroll = pageHeight * 0.75; // Scroll to 75% of the page height
                window.scrollTo(0, targetScroll);
            //}
            
            // Add a delay of 2 seconds
            return new Promise(resolve => {
                setTimeout(resolve, 2000);
            });
        });

        loadingSpinner = await page.$('[data-testid="loading-spinner"]');
        
        if (!loadingSpinner) {
            console.log('Loading spinner not found');
            break;
        }
        
        scrollCount++;
    }
}

async function scrapeProducts() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://www.mega-image.ro/search/promotii?q=promotions%3Arelevance%3ArootCategoryNameFacet%3ABauturi&utm_campaign=Toate%20promotiile&utm_medium=label%20banner&utm_source=promotii%20mega-image');

    await page.waitForSelector('.sc-3brks3-4.foyuzg.product-item');

    await scrollToLoadingSpinner(page);

    const products = await scrapeProductData(page);

    await browser.close();

    return products;
}


(async () => {
    const products = await scrapeProducts();
    console.log(products);
    console.log('Total products:', products.length);
})();
