document.addEventListener('DOMContentLoaded', () => {
    fetchSimilarProducts();
});

function fetchSimilarProducts() {
    fetch('/api/similar_products')
        .then(response => response.json())
        .then(data => displaySimilarProducts(data))
        .catch(error => console.error('Error fetching similar products:', error));
}

function displaySimilarProducts(products) {
    const productsContainer = document.getElementById('similar-products');
    productsContainer.innerHTML = '';

    products.forEach(product => {
        const productElement = createProductElement(product);
        productsContainer.appendChild(productElement);
    });
}

function createProductElement(product) {
    const productElement = document.createElement('div');
    productElement.classList.add('product');

    const nameDiv = document.createElement('div');
    nameDiv.classList.add('product-name');
    const productName = document.createElement('h2');
    productName.textContent = product.product1Name;
    nameDiv.appendChild(productName);

    const priceDiv = document.createElement('div');
    priceDiv.classList.add('product-price');
    const lowestPrices=getLowestPriceAndSource(product);
    const productPrice = document.createElement('p');
    productPrice.textContent = `Cheapest is at ${lowestPrices.source}: ${lowestPrices.price} Lei`;
    priceDiv.appendChild(productPrice);
    console.log("Product price:",lowestPrices.source);

    const imageDiv = document.createElement('div');
    imageDiv.classList.add('product-image');
    const productImage = document.createElement('img');
    productImage.src = product.image_url_product1;
    productImage.alt = product.product1Name;
    imageDiv.appendChild(productImage);

    const logoDiv = document.createElement('div');
    logoDiv.classList.add('product-logo');
    const logoImg = document.createElement('img');
    logoImg.classList.add('logo');
    logoImg.src = determineLogo(lowestPrices.source);
    logoImg.alt = lowestPrices.source;
    logoDiv.appendChild(logoImg);

    productElement.appendChild(nameDiv);
    productElement.appendChild(priceDiv);
    productElement.appendChild(imageDiv);
    productElement.appendChild(logoDiv);

    productElement.addEventListener('click', () => {
        redirectToProductDetails(product);
    });

    return productElement;
}

function getLowestPriceAndSource(product) {
    const prices = [
        { price: parseFloat(product.megaPrice), source: 'mega' },
        { price: parseFloat(product.pennyPrice), source: 'penny' },
        { price: parseFloat(product.kauflandPrice), source: 'kaufland' },
        { price: parseFloat(product.auchanPrice), source: 'auchan' }
    ];

    const validPrices = prices.filter(p => !isNaN(p.price) && p.price > 0);

    if (validPrices.length === 0) {
        return { lowestPrice: 'N/A', lowestPriceSource: 'N/A' };
    }

    validPrices.sort((a, b) => a.price - b.price);
    const lowestPriceData = validPrices[0];

    return lowestPriceData;
}

function determineLogo(supermarket) {
    switch (supermarket) {
        case 'mega':
            return megaLogoImg;
        case 'penny':
            return pennyLogoImg;
        case 'kaufland':
            return kauflandLogoImg;
        case 'auchan':
            return auchanLogoImg;
        default:
            return '';
    }
}

function redirectToProductDetails(product) {
    const queryParams = new URLSearchParams({
        productName: product.product1Name,
        product2Name: product.product2Name,
        product1Brand: product.product1Brand,
        product2Brand: product.product2Brand,
        megaPrice: product.megaPrice,
        pennyPrice: product.pennyPrice,
        kauflandPrice: product.kauflandPrice,
        auchanPrice: product.auchanPrice,
        quantity: product.quantity,
        product1Source: product.product1Source,
        product2Source: product.product2Source,
        image_url_product1: product.image_url_product1,
        image_url_product2: product.image_url_product2
    });
    const jsonParams = new URLSearchParams({
        queryParams: JSON.stringify(productDetails),
    });
    window.location.href = `product_details/product_details.html?${product.product1Name}`;
}

const auchanLogoImg = 'https://upload.wikimedia.org/wikipedia/fr/archive/9/90/20120504132214%21Logo_Auchan_%281983-2015%29.svg';
const kauflandLogoImg = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Kaufland_201x_logo.svg/1024px-Kaufland_201x_logo.svg.png';
const megaLogoImg = 'https://upload.wikimedia.org/wikipedia/ro/thumb/1/1d/Logo_Mega_Image.svg/1024px-Logo_Mega_Image.svg.png';
const pennyLogoImg = 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Penny-Logo.svg/2048px-Penny-Logo.svg.png';
