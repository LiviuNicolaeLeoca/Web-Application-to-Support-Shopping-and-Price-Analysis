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
        const productElement = document.createElement('div');
        productElement.classList.add('product');

        const productName = document.createElement('h2');
        productName.textContent = product.csvProductName;

        let lowestPrice = Number.MAX_VALUE;
        let lowestPriceSupermarket = '';

        if (product.megaPrice && product.megaPrice < lowestPrice) {
            lowestPrice = product.megaPrice;
            lowestPriceSupermarket = 'Mega';
        }
        if (product.pennyPrice && product.pennyPrice < lowestPrice) {
            lowestPrice = product.pennyPrice;
            lowestPriceSupermarket = 'Penny';
        }
        if (product.kauflandPrice && product.kauflandPrice < lowestPrice) {
            lowestPrice = product.kauflandPrice;
            lowestPriceSupermarket = 'Kaufland';
        }
        if (product.auchanPrice && product.auchanPrice < lowestPrice) {
            lowestPrice = product.auchanPrice;
            lowestPriceSupermarket = 'Auchan';
        }

        const productPrice = document.createElement('p');
        productPrice.textContent = `Lowest Price: ${lowestPrice} (${lowestPriceSupermarket})`;

        const productImage = document.createElement('img');
        productImage.src = product.sqlImages; 
        productImage.alt = product.csvProductName;

        const logoImg = document.createElement('img');
        logoImg.classList.add('logo');
        logoImg.src = determineLogo(lowestPriceSupermarket);
        logoImg.alt = lowestPriceSupermarket;

        productElement.appendChild(productName);
        productElement.appendChild(productPrice);
        productElement.appendChild(productImage);
        productElement.appendChild(logoImg);

        productElement.addEventListener('click', () => {
            const queryParams = new URLSearchParams({
                productName: product.csvProductName,
                productImage: product.sqlImages,
                
                supermarkets: JSON.stringify([
                    { name: 'Mega', price: product.megaPrice, logoImg: megaLogoImg },
                    { name: 'Penny', price: product.pennyPrice, logoImg: pennyLogoImg },
                    { name: 'Kaufland', price: product.kauflandPrice, logoImg: kauflandLogoImg },
                    { name: 'Auchan', price: product.auchanPrice, logoImg: auchanLogoImg }
                ])
            });
            window.location.href = `product_details/product_details.html?${queryParams.toString()}`;
        });  

        productsContainer.appendChild(productElement);
    });
}

function determineLogo(supermarket) {
    switch (supermarket) {
        case 'Mega':
            return megaLogoImg;
        case 'Penny':
            return pennyLogoImg;
        case 'Kaufland':
            return kauflandLogoImg;
        case 'Auchan':
            return auchanLogoImg;
        default:
            return '';
    }
}

let auchanLogoImg='https://upload.wikimedia.org/wikipedia/fr/archive/9/90/20120504132214%21Logo_Auchan_%281983-2015%29.svg'
let kauflandLogoImg='https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Kaufland_201x_logo.svg/1024px-Kaufland_201x_logo.svg.png'
let megaLogoImg='https://upload.wikimedia.org/wikipedia/ro/thumb/1/1d/Logo_Mega_Image.svg/1024px-Logo_Mega_Image.svg.png'
let pennyLogoImg='https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Penny-Logo.svg/2048px-Penny-Logo.svg.png'
