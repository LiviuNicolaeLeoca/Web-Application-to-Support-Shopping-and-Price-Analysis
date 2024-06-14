document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/similar_products')
        .then(response => response.json())
        .then(data => displaySimilarProducts(data))
        .catch(error => console.error('Error fetching similar products:', error));
});

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
    productName.textContent = product.name;
    nameDiv.appendChild(productName);

    const priceDiv = document.createElement('div');
    priceDiv.classList.add('product-price');
    const productPrice = document.createElement('p');
    productPrice.textContent = `Cheapest at ${product.lowestPriceSource}: ${product.lowestPrice} Lei`;
    priceDiv.appendChild(productPrice);

    const imageDiv = document.createElement('div');
    imageDiv.classList.add('product-image');
    const productImage = document.createElement('img');

    try {
        const imageUrls = JSON.parse(product.image_urls);
        productImage.src = imageUrls[product.lowestPriceSource];
    } catch (error) {
        console.error('Error parsing image_urls:', product.image_urls);
        productImage.src = ''; 
    }
    productImage.alt = product.name;
    imageDiv.appendChild(productImage);

    const logoDiv = document.createElement('div');
    logoDiv.classList.add('product-logo');
    const logoImg = document.createElement('img');
    logoImg.classList.add('logo');
    logoImg.src = determineLogo(product.lowestPriceSource);
    logoImg.alt = product.lowestPriceSource;
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
        productId: product.id,
        productName: product.name,
        productImage: JSON.parse(product.image_urls)[product.lowestPriceSource],
        productPrice: product.lowestPrice,
        productSource: product.lowestPriceSource
    });
    window.location.href = `product_details/product_details.html?${queryParams.toString()}`;
}

const auchanLogoImg = 'https://upload.wikimedia.org/wikipedia/fr/archive/9/90/20120504132214%21Logo_Auchan_%281983-2015%29.svg';
const kauflandLogoImg = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Kaufland_201x_logo.svg/1024px-Kaufland_201x_logo.svg.png';
const megaLogoImg = 'https://upload.wikimedia.org/wikipedia/ro/thumb/1/1d/Logo_Mega_Image.svg/1024px-Logo_Mega_Image.svg.png';
const pennyLogoImg = 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Penny-Logo.svg/2048px-Penny-Logo.svg.png';
