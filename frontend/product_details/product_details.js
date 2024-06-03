document.addEventListener('DOMContentLoaded', () => {
    function getQueryParams() {
        const params = new URLSearchParams(window.location.search);
        console.log(params.get('productName'), params.getAll('productImage'), JSON.parse(params.get('supermarkets') || '[]'));
        return {
            name: params.get('productName'),
            images: params.getAll('productImage'),
            supermarkets: JSON.parse(params.get('supermarkets') || '[]')
        };
    }

    function populateProductDetails() {
        const queryParams = getQueryParams();
        const productNameElement = document.getElementById('product-name');
        const productImageElement = document.getElementById('product-image');
        const otherPricesContainer = document.getElementById('other-prices');

        if (queryParams.name && queryParams.images.length > 0 && queryParams.supermarkets.length > 0) {
            productNameElement.textContent = queryParams.name;
            productImageElement.src = queryParams.images[0]; // Displaying the first image

            // Displaying all available prices and photos from different supermarkets
            otherPricesContainer.innerHTML = '';
            for (let i = 0; i < queryParams.supermarkets.length; i++) {
                const supermarket = queryParams.supermarkets[i];

                const priceElement = document.createElement('p');
                priceElement.textContent = `Price at ${supermarket.name}: ${supermarket.price}`;
                otherPricesContainer.appendChild(priceElement);

                const imageElement = document.createElement('img');
                imageElement.src = supermarket.logoImg;
                imageElement.alt = supermarket.name;
                otherPricesContainer.appendChild(imageElement);
            }
        } else {
            productNameElement.textContent = 'Product Details Not Found';
        }
    }

    populateProductDetails();
});
