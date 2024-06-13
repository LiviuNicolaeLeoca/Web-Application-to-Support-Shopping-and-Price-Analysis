document.addEventListener('DOMContentLoaded', () => {
    populateProductDetails();
});

function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        productName: params.get('productName'),
        product1Name: params.get('product1Name'),
        product1Brand: params.get('product1Brand'),
        megaPrice: params.get('megaPrice'),
        pennyPrice: params.get('pennyPrice'),
        kauflandPrice: params.get('kauflandPrice'),
        auchanPrice: params.get('auchanPrice'),
        quantity: params.get('quantity'),
        product1Source: params.get('product1Source'),
        image_url_product1: params.get('image_url_product1')
    };
}

function populateProductDetails() {
    const queryParams = getQueryParams();
    const productNameElement = document.getElementById('product-name');
    const productImageElement = document.getElementById('product-image');
    const supermarketsContainer = document.getElementById('supermarkets-container');

    if (queryParams.productName && queryParams.image_url_product1) {
        productNameElement.textContent = queryParams.productName;
        productImageElement.src = queryParams.image_url_product1;

        supermarketsContainer.innerHTML = '';

        const supermarkets = [
            { name: 'Mega', price: queryParams.megaPrice },
            { name: 'Penny', price: queryParams.pennyPrice },
            { name: 'Kaufland', price: queryParams.kauflandPrice },
            { name: 'Auchan', price: queryParams.auchanPrice }
        ];

        supermarkets.forEach(supermarket => {
            if (supermarket.price) {
                const container = createSupermarketContainer(supermarket.name, supermarket.price, queryParams);
                supermarketsContainer.appendChild(container);
            }
        });

    } else {
        productNameElement.textContent = 'Product Details Not Found';
    }
}

function createSupermarketContainer(supermarket, price, queryParams) {
    const productName = queryParams.product1Name;
    const productBrand = queryParams.product1Brand;
    const quantity = queryParams.quantity;
    const productSource = queryParams.product1Source;

    const container = document.createElement('div');
    container.classList.add('supermarket-container');

    const heading = document.createElement('h2');
    heading.textContent = `${supermarket} Prices`;
    container.appendChild(heading);

    const productElement = document.createElement('div');
    productElement.classList.add('product');

    const productNameElement = document.createElement('p');
    productNameElement.textContent = `Name: ${productName}`;
    productElement.appendChild(productNameElement);

    const productBrandElement = document.createElement('p');
    productBrandElement.textContent = `Brand: ${productBrand}`;
    productElement.appendChild(productBrandElement);

    const productQuantityElement = document.createElement('p');
    productQuantityElement.textContent = `Quantity: ${quantity}`;
    productElement.appendChild(productQuantityElement);

    const productPriceElement = document.createElement('p');
    productPriceElement.textContent = `Price: ${price}`;
    productElement.appendChild(productPriceElement);

    const productSourceElement = document.createElement('p');
    productSourceElement.textContent = `Source: ${productSource}`;
    productElement.appendChild(productSourceElement);

    const productImageElement = document.createElement('img');
    productImageElement.src = queryParams.image_url_product1;
    productImageElement.alt = productName;
    productElement.appendChild(productImageElement);

    container.appendChild(productElement);

    return container;
}
