document.addEventListener('DOMContentLoaded', () => {
    populateProductDetails();
});

function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        productName: params.get('productName'),
        product2Name: params.get('product2Name'),
        product1Brand: params.get('product1Brand'),
        product2Brand: params.get('product2Brand'),
        megaPrice: params.get('megaPrice'),
        pennyPrice: params.get('pennyPrice'),
        kauflandPrice: params.get('kauflandPrice'),
        auchanPrice: params.get('auchanPrice'),
        quantity: params.get('quantity'),
        product1Source: params.get('product1Source'),
        product2Source: params.get('product2Source'),
        image_url_product1: params.get('image_url_product1'),
        image_url_product2: params.get('image_url_product2')
    };
}

function populateProductDetails() {
    const queryParams = new URLSearchParams(window.location.search);
    const productDetailsString = queryParams.get('productDetails');
    const productNameElement = document.getElementById('product-name');
    const productImageElement = document.getElementById('product-image');
    const otherPricesContainer = document.getElementById('other-prices');

    if (queryParams.productName && queryParams.image_url_product1) {
        productNameElement.textContent = queryParams.productName;
        productImageElement.src = queryParams.image_url_product1;

        otherPricesContainer.innerHTML = '';
        
        const supermarkets = ['Mega', 'Penny', 'Kaufland', 'Auchan'];
        supermarkets.forEach(supermarket => {
            if (queryParams[`${supermarket.toLowerCase()}Price`]) {
                const productContainer = createSupermarketContainer(supermarket, queryParams);
                otherPricesContainer.appendChild(productContainer);
            }
        });
        
        const productDetailsContainer = document.getElementById('product-details');
        productDetailsContainer.innerHTML = '';
        for (const key in queryParams) {
            if (queryParams[key] && key !== 'productName' && key !== 'image_url_product1') {
                const detailElement = document.createElement('p');
                detailElement.textContent = `${key}: ${queryParams[key]}`;
                productDetailsContainer.appendChild(detailElement);
            }
        }
    } else {
        productNameElement.textContent = 'Product Details Not Found';
    }
}

function createSupermarketContainer(supermarket, queryParams) {
    const price = queryParams[`${supermarket.toLowerCase()}Price`];
    if (!price) return null;

    const container = document.createElement('div');
    container.classList.add('supermarket-container');

    const heading = document.createElement('h2');
    heading.textContent = `${supermarket} Prices`;
    container.appendChild(heading);

    const productElement = document.createElement('div');
    productElement.classList.add('product');

    const productName = document.createElement('p');
    productName.textContent = `${queryParams.product1Name}: ${price}`;
    productElement.appendChild(productName);

    const productImage = document.createElement('img');
    productImage.src = queryParams.image_url_product1;
    productImage.alt = queryParams.product1Name;
    productElement.appendChild(productImage);

    container.appendChild(productElement);

    return container;
}

function groupProductsBySupermarket(queryParams) {
    const supermarkets = {};
    if (queryParams.megaPrice) {
        if (!supermarkets['Mega']) {
            supermarkets['Mega'] = [];
        }
        supermarkets['Mega'].push({ name: queryParams.productName, price: queryParams.megaPrice });
    }
    if (queryParams.pennyPrice) {
        if (!supermarkets['Penny']) {
            supermarkets['Penny'] = [];
        }
        supermarkets['Penny'].push({ name: queryParams.productName, price: queryParams.pennyPrice });
    }
    if (queryParams.kauflandPrice) {
        if (!supermarkets['Kaufland']) {
            supermarkets['Kaufland'] = [];
        }
        supermarkets['Kaufland'].push({ name: queryParams.productName, price: queryParams.kauflandPrice });
    }
    if (queryParams.auchanPrice) {
        if (!supermarkets['Auchan']) {
            supermarkets['Auchan'] = [];
        }
        supermarkets['Auchan'].push({ name: queryParams.productName, price: queryParams.auchanPrice });
    }
    return supermarkets;
}